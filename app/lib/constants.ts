export interface GradeInfo {
  grade: string;
  points: number;
  min: number;
  max: number;
  color: string;
}

export interface Classification {
  title: string;
  min: number;
  max: number;
  color: string;
}

export const GRADES: GradeInfo[] = [
  { grade: 'A', points: 5, min: 70, max: 100, color: 'text-green-600' },
  { grade: 'B', points: 4, min: 60, max: 69, color: 'text-blue-600' },
  { grade: 'C', points: 3, min: 50, max: 59, color: 'text-yellow-600' },
  { grade: 'D', points: 2, min: 45, max: 49, color: 'text-orange-600' },
  { grade: 'E', points: 1, min: 40, max: 44, color: 'text-red-400' },
  { grade: 'F', points: 0, min: 0, max: 39, color: 'text-red-600' },
];

export const CLASSIFICATIONS: Classification[] = [
  { title: 'First Class', min: 4.5, max: 5.0, color: 'bg-green-600' },
  { title: 'Second Class Upper (2:1)', min: 3.5, max: 4.49, color: 'bg-blue-600' },
  { title: 'Second Class Lower (2:2)', min: 2.5, max: 3.49, color: 'bg-yellow-600' },
  { title: 'Third Class', min: 1.5, max: 2.49, color: 'bg-orange-600' },
  { title: 'Pass', min: 1.0, max: 1.49, color: 'bg-red-400' },
  { title: 'Fail', min: 0.0, max: 0.99, color: 'bg-red-600' },
];
