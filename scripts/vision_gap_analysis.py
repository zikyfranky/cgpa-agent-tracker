import os
import json
import sqlite3
from datetime import datetime

# Use local relative path to DB for container flexibility
DB_PATH = os.path.join(os.path.dirname(__file__), "../prisma/dev.db")

def get_db_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get user and target
    cursor.execute("SELECT id, matricNumber, targetCgpa FROM User LIMIT 1")
    user = cursor.fetchone()
    
    # Get finalized results
    cursor.execute("SELECT units, gradePoint FROM Result WHERE grade != 'PENDING' AND userId = ?", (user[0],))
    results = cursor.fetchall()
    
    # Get semester courses for current semester
    cursor.execute("SELECT currentLevel, currentSemester FROM UserState WHERE userId = ?", (user[0],))
    state = cursor.fetchone()
    
    cursor.execute("SELECT courseCode, units FROM Result WHERE level = ? AND semester = ? AND userId = ?", (state[0], state[1], user[0]))
    pending = cursor.fetchall()
    
    conn.close()
    return user, results, state, pending

def calculate_cgpa(results):
    total_units = sum(r[0] for r in results)
    total_points = sum(r[0] * r[1] for r in results)
    return total_points / total_units if total_units > 0 else 0

def generate_insights():
    user, results, state, pending = get_db_data()
    cgpa = calculate_cgpa(results)
    
    # Source target from provided user data
    target = user[2] if user[2] is not None else 3.5
    gap = round(target - cgpa, 2)
    
    total_pending_units = sum(p[1] for p in pending)
    geophysics_priorities = [p[0] for p in pending if 'GPH' in p[0]]
    focus_main = geophysics_priorities[0] if geophysics_priorities else (pending[0][0] if pending else 'Core Courses')

    # Detailed Academic Recommendations
    recommendations = [
        f"Nail an 'A' in {focus_main} to aggressively close the {gap} gap.",
        f"Target {total_pending_units} units in {state[0]}L to reach your {target} goal."
    ]

    if 'GPH321' in geophysics_priorities:
        recommendations.append("GPH321 Depth: Focus on Ground Penetrating Radar (GPR) signal interpretation and antenna configurations.")
    if 'GPH312' in geophysics_priorities:
        recommendations.append("GPH312 Priority: Master the distinctions between Time-Domain and Frequency-Domain Electromagnetic methods.")
    if 'GPH308' in geophysics_priorities:
        recommendations.append("GPH308 Critical: Study Seismic Refraction velocity models and travel-time curves for layered media.")

    recommendations.append(f"Required Strategy: Maintain a {(target if target > cgpa else 3.5):.2f} GPA this semester to stay on track.")

    # UPDATE DATABASE INSTEAD OF FILE
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if insight already exists
    cursor.execute("SELECT id FROM Insight WHERE userId = ?", (user[0],))
    existing = cursor.fetchone()
    
    now = datetime.now().isoformat()
    recs_json = json.dumps(recommendations)
    semester_label = f"{state[0]}L {state[1]}"
    
    if existing:
        cursor.execute("""
            UPDATE Insight 
            SET lastUpdated = ?, currentCgpa = ?, targetCgpa = ?, gap = ?, semester = ?, recommendations = ?
            WHERE userId = ?
        """, (now, round(cgpa, 2), target, gap, semester_label, recs_json, user[0]))
    else:
        # Create new CUID-like ID
        insight_id = f"insight_{user[0]}"
        cursor.execute("""
            INSERT INTO Insight (id, userId, lastUpdated, currentCgpa, targetCgpa, gap, semester, recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (insight_id, user[0], now, round(cgpa, 2), target, gap, semester_label, recs_json))
    
    conn.commit()
    conn.close()
    return recommendations

if __name__ == "__main__":
    recs = generate_insights()
    print("Database Insights successfully updated.")
