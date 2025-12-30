import { Worksheet, GradeLevel, MathOperation } from '../types';

export const WORKSHEETS: Worksheet[] = [
  // Kindergarten Worksheets
  {
    id: 'k_counting',
    name: 'Counting Fun',
    icon: '🔢',
    description: 'Count objects from 1-10',
    gradeLevel: 'kindergarten',
    operation: 'counting',
    problemCount: 10,
    unlocked: true,
  },
  {
    id: 'k_addition',
    name: 'Adding Friends',
    icon: '➕',
    description: 'Add numbers up to 5',
    gradeLevel: 'kindergarten',
    operation: 'addition',
    problemCount: 10,
    unlocked: true,
  },
  {
    id: 'k_subtraction',
    name: 'Taking Away',
    icon: '➖',
    description: 'Subtract numbers up to 5',
    gradeLevel: 'kindergarten',
    operation: 'subtraction',
    problemCount: 10,
    unlocked: true,
  },
  {
    id: 'k_comparison',
    name: 'Big or Small?',
    icon: '⚖️',
    description: 'Compare numbers',
    gradeLevel: 'kindergarten',
    operation: 'comparison',
    problemCount: 10,
    unlocked: true,
  },

  // First Grade Worksheets
  {
    id: '1_addition_10',
    name: 'Addition Adventure',
    icon: '🌟',
    description: 'Add numbers up to 10',
    gradeLevel: 'first',
    operation: 'addition',
    problemCount: 10,
    unlocked: true,
  },
  {
    id: '1_subtraction_10',
    name: 'Subtraction Safari',
    icon: '🦁',
    description: 'Subtract numbers up to 10',
    gradeLevel: 'first',
    operation: 'subtraction',
    problemCount: 10,
    unlocked: true,
  },
  {
    id: '1_addition_20',
    name: 'Super Addition',
    icon: '🚀',
    description: 'Add numbers up to 20',
    gradeLevel: 'first',
    operation: 'addition',
    problemCount: 10,
    unlocked: true,
  },
  {
    id: '1_missing',
    name: 'Mystery Numbers',
    icon: '❓',
    description: 'Find the missing number',
    gradeLevel: 'first',
    operation: 'missing_addend',
    problemCount: 10,
    unlocked: true,
  },

  // Second Grade Worksheets
  {
    id: '2_addition_50',
    name: 'Big Number Adding',
    icon: '🎯',
    description: 'Add numbers up to 50',
    gradeLevel: 'second',
    operation: 'addition',
    problemCount: 10,
    unlocked: true,
  },
  {
    id: '2_subtraction_50',
    name: 'Big Number Taking',
    icon: '🎪',
    description: 'Subtract numbers up to 50',
    gradeLevel: 'second',
    operation: 'subtraction',
    problemCount: 10,
    unlocked: true,
  },
  {
    id: '2_addition_100',
    name: 'Century Challenge',
    icon: '💯',
    description: 'Add numbers up to 100',
    gradeLevel: 'second',
    operation: 'addition',
    problemCount: 10,
    unlocked: true,
  },
  {
    id: '2_multiplication',
    name: 'Times Tables',
    icon: '✖️',
    description: 'Multiply by 2, 5, and 10',
    gradeLevel: 'second',
    operation: 'multiplication',
    problemCount: 10,
    unlocked: true,
  },
];

// Get worksheets by grade level
export function getWorksheetsByGrade(gradeLevel: GradeLevel): Worksheet[] {
  return WORKSHEETS.filter(w => w.gradeLevel === gradeLevel);
}

// Get worksheet by ID
export function getWorksheetById(id: string): Worksheet | undefined {
  return WORKSHEETS.find(w => w.id === id);
}

// Get grade level display name
export function getGradeLevelName(gradeLevel: GradeLevel): string {
  switch (gradeLevel) {
    case 'kindergarten':
      return 'Kindergarten';
    case 'first':
      return '1st Grade';
    case 'second':
      return '2nd Grade';
    default:
      return gradeLevel;
  }
}

// Get grade level color (soft pastel tones to match dreamy theme)
export function getGradeLevelColor(gradeLevel: GradeLevel): string {
  switch (gradeLevel) {
    case 'kindergarten':
      return '#95D9C3'; // Soft mint green
    case 'first':
      return '#A8C8FF'; // Soft sky blue
    case 'second':
      return '#FFADC6'; // Soft rose pink
    default:
      return '#B8A8C8';
  }
}
