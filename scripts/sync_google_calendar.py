import os
import json
import sqlite3
from datetime import datetime, timedelta
import google.auth
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

# Configuration
TOKEN_PATH = '/opt/data/integration/google/codingwithisaac_token.json'
DB_PATH = '/opt/data/projects/cgpa-agent-tracker/prisma/dev.db'
CALENDAR_SUMMARY = 'FUTMX Timetable'

def get_calendar_service():
    with open(TOKEN_PATH, 'r') as f:
        data = json.load(f)
        # Handle the specific 'token' key in your JSON
        creds = Credentials(data.get('token'), 
                          refresh_token=data.get('refresh_token'),
                          token_uri='https://oauth2.googleapis.com/token',
                          client_id=data.get('client_id'),
                          client_secret=data.get('client_secret'))
    
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        
    return build('calendar', 'v3', credentials=creds)

def get_local_timetable():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT courseCode, day, startTime, endTime, location FROM Timetable')
    rows = cursor.fetchall()
    conn.close()
    return rows

def sync():
    service = get_calendar_service()
    
    # 1. Find or create the FUTMX Timetable calendar
    calendar_id = 'primary' # Defaulting to primary for Isaac's direct view
    
    # 2. Get local data
    local_events = get_local_timetable()
    
    # 3. For each event, schedule it starting from the NEXT available occurrence (Future Only)
    days_map = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6}
    
    now = datetime.now()
    
    print(f"Syncing {len(local_events)} encounters...")
    
    for code, day, start, end, loc in local_events:
        target_day_num = days_map.get(day)
        days_ahead = target_day_num - now.weekday()
        if days_ahead <= 0: # Target day has passed or is today
            days_ahead += 7
            
        next_occurrence = now + timedelta(days=days_ahead)
        start_dt = next_occurrence.replace(hour=int(start.split(':')[0]), minute=int(start.split(':')[1]), second=0, microsecond=0)
        end_dt = next_occurrence.replace(hour=int(end.split(':')[0]), minute=int(end.split(':')[1]), second=0, microsecond=0)
        
        event_body = {
            'summary': f'[FUTMX] {code}',
            'location': loc,
            'description': f'Academic Encounter: {code} synced via CGPA Agent Tracker.',
            'start': {
                'dateTime': start_dt.isoformat(),
                'timeZone': 'Africa/Lagos',
            },
            'end': {
                'dateTime': end_dt.isoformat(),
                'timeZone': 'Africa/Lagos',
            },
            'recurrence': [
                'RRULE:FREQ=WEEKLY;UNTIL=20261231T235959Z'
            ],
        }
        
        try:
            service.events().insert(calendarId=calendar_id, body=event_body).execute()
            print(f"Synced {code} for {day}")
        except Exception as e:
            print(f"Failed {code}: {e}")

if __name__ == '__main__':
    sync()
