
export const GRADES = [
  { grade: 'A', min: 70, max: 100, point: 5, color: '#22c55e' },
  { grade: 'B', min: 60, max: 69, point: 4, color: '#3b82f6' },
  { grade: 'C', min: 50, max: 59, point: 3, color: '#f59e0b' },
  { grade: 'D', min: 45, max: 49, point: 2, color: '#f97316' },
  { grade: 'E', min: 40, max: 44, point: 1, color: '#ef4444' }, // Grouped for visual parity
  { grade: 'F', min: 0, max: 39, point: 0, color: '#ef4444' },
];

export const CLASSIFICATIONS = [
  { name: 'First Class', min: 4.50, max: 5.00, color: '#22c55e' },
  { name: 'Second Class Upper', min: 3.50, max: 4.49, color: '#3b82f6' },
  { name: 'Second Class Lower', min: 2.40, max: 3.49, color: '#f59e0b' },
  { name: 'Third Class', min: 1.50, max: 2.39, color: '#f97316' },
  { name: 'Pass', min: 1.00, max: 1.49, color: '#ef4444' },
  { name: 'Fail', min: 0.00, max: 0.99, color: '#ef4444' },
];

export const DEANS_LIST_THRESHOLD = 4.0;
export const VCS_LIST_THRESHOLD = 4.5;
