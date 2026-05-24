import { getGradeByLetter } from './logic';

/**
 * Carryover logic for CGPA Tracker 2.0
 * 
 * Rules:
 * 1. A course is a carryover if its grade is 'F'.
 * 2. Carryovers should be prioritized in subsequent sessions of the same semester (First -> First, Second -> Second).
 * 3. Total units (Regular + Carryovers) cannot exceed the semester's maxUnits.
 */

export interface Course {
    code: string;
    title: string;
    units: number;
    grade?: string;
}

export function getFailedCourses(courses: Course[]): Course[] {
    return courses.filter(c => c.grade === 'F');
}

export function canAddCarryover(currentUnits: number, carryoverUnits: number, maxUnits: number): boolean {
    return (currentUnits + carryoverUnits) <= maxUnits;
}

export function calculateSemesterGPA(courses: Course[]) {
    let totalPoints = 0;
    let totalUnits = 0;
    
    courses.forEach(c => {
        const g = getGradeByLetter(c.grade || 'F');
        if (g) {
            totalPoints += g.points * c.units;
            totalUnits += c.units;
        }
    });
    
    return totalUnits === 0 ? 0 : totalPoints / totalUnits;
}
