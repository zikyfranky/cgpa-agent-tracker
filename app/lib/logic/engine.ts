import { GRADES, CLASSIFICATIONS } from './constants';

export const calculateGPA = (results: any[], anchor?: { level: number, semester: string }) => {
  let totalQualityPoints = 0;
  let totalUnits = 0;

  const semesterRank = (sem: string) => sem === 'First Semester' ? 1 : 2;

  results.forEach(res => {
    // Skip courses that haven't been taken yet
    if (res.grade === 'PENDING' || !res.grade) return;
    
    // If anchor is provided, filter results
    if (anchor) {
        if (res.level > anchor.level) return;
        if (res.level === anchor.level && semesterRank(res.semester) > semesterRank(anchor.semester)) return;
    }

    totalQualityPoints += (res.units * res.gradePoint);
    totalUnits += res.units;
  });

  return totalUnits === 0 ? 0 : parseFloat((totalQualityPoints / totalUnits).toFixed(2));
};

export const getClassification = (cgpa: number) => {
  const match = CLASSIFICATIONS.find(c => cgpa >= c.min && cgpa <= c.max);
  return match || CLASSIFICATIONS[CLASSIFICATIONS.length - 1];
};
