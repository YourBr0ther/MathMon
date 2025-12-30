import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

// Custom render function that includes providers if needed
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Helper to create mock Pokemon
export function createMockPokemon(overrides: Partial<{
  id: number;
  name: string;
  sprite: string;
  officialArtwork: string;
  types: string[];
  caughtAt?: Date;
  caughtWithProblem?: string;
}> = {}) {
  return {
    id: 25,
    name: 'Pikachu',
    sprite: 'https://example.com/sprite.png',
    officialArtwork: 'https://example.com/art.png',
    types: ['electric'],
    ...overrides,
  };
}

// Helper to create mock math problem
export function createMockProblem(overrides: Partial<{
  id: string;
  question: string;
  questionDisplay: string;
  answer: number;
  options: number[];
  operation: string;
  difficulty: number;
  gradeLevel: string;
}> = {}) {
  return {
    id: 'test-problem-1',
    question: '5 + 3 = ?',
    questionDisplay: '5 + 3',
    answer: 8,
    options: [6, 7, 8, 9],
    operation: 'addition',
    difficulty: 2,
    gradeLevel: 'first',
    ...overrides,
  };
}

// Helper to create mock game state
export function createMockGameState(overrides: Partial<{
  trainerName: string;
  caughtPokemon: any[];
  highestStreak: number;
  totalCorrectAnswers: number;
  totalProblemsAttempted: number;
  worksheetsCompleted: any[];
  achievements: any[];
  currentStreak: number;
  lastPlayedDate: string;
  xp: number;
  level: number;
}> = {}) {
  return {
    trainerName: 'Test Trainer',
    caughtPokemon: [],
    highestStreak: 0,
    totalCorrectAnswers: 0,
    totalProblemsAttempted: 0,
    worksheetsCompleted: [],
    achievements: [],
    currentStreak: 0,
    lastPlayedDate: new Date().toISOString().split('T')[0],
    xp: 0,
    level: 1,
    ...overrides,
  };
}
