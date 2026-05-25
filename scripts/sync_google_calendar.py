import os
import json
import sqlite3
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# Configuration
TOKEN_PATH = '/opt/data/integration/google/codingwithisaac_token.json'
DB_PATH = '/opt/data/projects/cgpa-agent-tracker/prisma/dev.db'
CALENDAR_ID = 'primary'
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

def sync():
    service = get_calendar_service()
    now_iso = datetime.utcnow().isoformat() + 'Z'
    
    # 1. CLEANUP: Find all FUTURE [FUTMX] events and delete them
    # This ensures that when you remove an encounter from the tracker,
    # the stale recurrences are wiped from the calendar before we re-sync.
    print("Purging stale future encounters...")
    events_result = service.events().list(
        calendarId=CALENDAR_ID, 
        timeMin=now_iso,
        q=TAG,
        singleEvents=True
    ).execute()
    
    events = events_result.get('items', [])
    for event in events:
        # Verify it's a future event and has our tag
        if TAG in event.get('summary', ''):
            try:
                service.events().delete(calendarId=CALENDAR_ID, eventId=event['id']).execute()
            except:
                pass

    # 2. SYNC: Re-create recurrences for the current set in DB
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT courseCode, day, startTime, endTime, location FROM Timetable')
    local_events = cursor.fetchall()
    conn.close()

    days_map = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6}
    now = datetime.now()

    for code, day, start, end, loc in local_events:
        target_day_num = days_map.get(day)
        days_ahead = target_day_num - now.weekday()
        if days_ahead < 0: # Already passed this week
            days_ahead += 7
        elif days_ahead == 0: # Today
            # If the start time has already passed today, move to next week
            start_hour = int(start.split(':')[0])
            if now.hour >= start_hour:
                days_ahead += 7
            
        next_occurrence = now + timedelta(days=days_ahead)
        start_dt = next_occurrence.replace(hour=int(start.split(':')[0]), minute=int(start.split(':')[1]), second=0, microsecond=0)
        end_dt = next_occurrence.replace(hour=int(end.split(':')[0]), minute=int(end.split(':')[1]), second=0, microsecond=0)
        
        event_body = {
            'summary': f'{TAG} {code}',
            'location': loc,
            'description': f'Academic Encounter synced via Isaac Core.',
            'start': {'dateTime': start_dt.isoformat(), 'timeZone': 'Africa/Lagos'},
            'end': {'dateTime': end_dt.isoformat(), 'timeZone': 'Africa/Lagos'},
            'recurrence': ['RRULE:FREQ=WEEKLY;UNTIL=20261231T235959Z'],
        }
        
        service.events().insert(calendarId=CALENDAR_ID, body=event_body).execute()
        print(f"Synced {code}")

if __name__ == '__main__':
    sync()
