import os
import json
import sqlite3
from datetime import datetime, timedelta, timezone
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

TOKEN_PATH = '/opt/data/integration/google/codingwithisaac_token.json'
DB_PATH = '/opt/data/projects/cgpa-agent-tracker/prisma/dev.db'
CALENDAR_SUMMARY = 'FUTMX Timetable'
TAG = '[FUTMX]'

def get_calendar_service():
    with open(TOKEN_PATH, 'r') as f:
        data = json.load(f)
        creds = Credentials(data.get('token'), 
                          refresh_token=data.get('refresh_token'),
                          token_uri='https://oauth2.googleapis.com/token',
                          client_id=data.get('client_id'),
                          client_secret=data.get('client_secret'))
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return build('calendar', 'v3', credentials=creds)

def get_or_create_calendar(service):
    calendar_list = service.calendarList().list().execute()
    for entry in calendar_list.get('items', []):
        if entry.get('summary') == CALENDAR_SUMMARY:
            return entry['id']
    return service.calendars().insert(body={'summary': CALENDAR_SUMMARY, 'timeZone': 'Africa/Lagos'}).execute()['id']

def sync():
    service = get_calendar_service()
    calendar_id = get_or_create_calendar(service)
    now_utc = datetime.now(timezone.utc).isoformat()
    
    print(f"Purging future {TAG} events...")
    events_result = service.events().list(
        calendarId=calendar_id, 
        timeMin=now_utc,
        q=TAG,
        singleEvents=True,
        maxResults=2500
    ).execute()
    
    for ev in events_result.get('items', []):
        if TAG in ev.get('summary', ''):
            service.events().delete(calendarId=calendar_id, eventId=ev['id']).execute()

    # SYNC FROM DB
    conn = sqlite3.connect(DB_PATH)
    local_events = conn.cursor().execute('SELECT courseCode, day, startTime, endTime, location FROM Timetable').fetchall()
    conn.close()

    days_map = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6}
    sync_baseline = max(datetime.now(), datetime(2026, 6, 1))

    for code, day, start, end, loc in local_events:
        target_day_num = days_map.get(day)
        days_ahead = target_day_num - sync_baseline.weekday()
        if days_ahead < 0: days_ahead += 7
        elif days_ahead == 0 and sync_baseline.hour >= int(start.split(':')[0]):
            days_ahead += 7
            
        next_occurrence = sync_baseline + timedelta(days=days_ahead)
        if next_occurrence < datetime(2026, 6, 1): next_occurrence += timedelta(days=7)
        
        start_dt = next_occurrence.replace(hour=int(start.split(':')[0]), minute=int(start.split(':')[1]), second=0, microsecond=0)
        end_dt = next_occurrence.replace(hour=int(end.split(':')[0]), minute=int(end.split(':')[1]), second=0, microsecond=0)
        
        service.events().insert(calendarId=calendar_id, body={
            'summary': f'{TAG} {code}',
            'location': loc,
            'description': 'Synced Academic Encounter.',
            'start': {'dateTime': start_dt.isoformat(), 'timeZone': 'Africa/Lagos'},
            'end': {'dateTime': end_dt.isoformat(), 'timeZone': 'Africa/Lagos'},
            'recurrence': ['RRULE:FREQ=WEEKLY;UNTIL=20261231T235959Z'],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 1440}, # 1 Day
                    {'method': 'popup', 'minutes': 180},  # 3 Hours
                    {'method': 'popup', 'minutes': 60},   # 1 Hour
                    {'method': 'popup', 'minutes': 30},   # 30 Mins
                ],
            },
        }).execute()
        print(f"Re-synced {code} with notifications.")

if __name__ == '__main__':
    sync()