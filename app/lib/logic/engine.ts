
import { GRADES, CLASSIFICATIONS } from './constants';

export const getGrade = (totalScore: number) => {
  return GRADES.find(g => totalScore >= g.min && totalScore <= g.max) || GRADES[GRADES.length - 1];
};

export const calculateGPA = (results: any[]) => {
  let totalQualityPoints = 0;
  let totalUnits = 0;

  results.forEach(res => {
    // Skip courses that haven't been taken yet
    if (res.grade === 'PENDING' || !res.grade) return;
    
    // Quality Point = Unit * Point
    totalQualityPoints += (res.units * res.gradePoint);
    totalUnits += res.units;
  });

  return totalUnits === 0 ? 0 : parseFloat((totalQualityPoints / totalUnits).toFixed(2));
};

export const getClassification = (cgpa: number) => {
  return CLASSIFICATIONS.find(c => cgpa >= c.min && cgpa <= c.max) || CLASSIFICATIONS[CLASSIFICATIONS.length - 1];
};
