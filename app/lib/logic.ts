import { GRADES, CLASSIFICATIONS } from './constants';

export function getGradeFromScore(total: number | null | undefined) {
  if (total === null || total === undefined || isNaN(total)) return null;
  for (const g of GRADES) {
    if (total >= g.min && total <= g.max) return g;
  }
  return GRADES[5]; // F
}

export function getGradeByLetter(letter: string) {
  return GRADES.find(g => g.grade === letter) || null;
}

export function getClassification(cgpa: number) {
  for (const c of CLASSIFICATIONS) {
    if (cgpa >= c.min && cgpa <= c.max) return c;
  }
  return CLASSIFICATIONS[5]; // Fail
}
