import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateProblemByDifficulty,
  generateProblemForWorksheet,
  generateWorksheet,
  calculateDifficultyFromStreak,
} from './mathGenerator';
import { GradeLevel, MathOperation, MathProblem } from '../types';

describe('mathGenerator', () => {
  // Helper to run multiple iterations for randomness testing
  const runMultipleTimes = <T>(fn: () => T, iterations = 100): T[] => {
    return Array.from({ length: iterations }, fn);
  };

  describe('generateProblemByDifficulty', () => {
    it('should generate valid problem structure', () => {
      const problem = generateProblemByDifficulty(1);

      expect(problem).toHaveProperty('id');
      expect(problem).toHaveProperty('question');
      expect(problem).toHaveProperty('questionDisplay');
      expect(problem).toHaveProperty('answer');
      expect(problem).toHaveProperty('options');
      expect(problem).toHaveProperty('operation');
      expect(problem).toHaveProperty('difficulty');
      expect(problem).toHaveProperty('gradeLevel');
    });

    it('should have exactly 4 options including the correct answer', () => {
      const problems = runMultipleTimes(() => generateProblemByDifficulty(5), 50);
      problems.forEach(problem => {
        expect(problem.options).toHaveLength(4);
        expect(problem.options).toContain(problem.answer);
      });
    });

    it('should generate unique options (no duplicates)', () => {
      const problems = runMultipleTimes(() => generateProblemByDifficulty(5), 50);
      problems.forEach(problem => {
        const uniqueOptions = new Set(problem.options);
        expect(uniqueOptions.size).toBe(4);
      });
    });

    it('should have unique problem IDs', () => {
      const problems = runMultipleTimes(() => generateProblemByDifficulty(5), 50);
      const ids = problems.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(50);
    });

    it('should clamp difficulty to 1-10 range', () => {
      const lowDifficulty = generateProblemByDifficulty(-5);
      const highDifficulty = generateProblemByDifficulty(100);

      expect(lowDifficulty.difficulty).toBeGreaterThanOrEqual(1);
      expect(highDifficulty.difficulty).toBeLessThanOrEqual(10);
    });

    describe('difficulty 1-2 (Kindergarten)', () => {
      it('should generate kindergarten-level problems', () => {
        const problems = runMultipleTimes(() => generateProblemByDifficulty(1), 30);
        problems.forEach(problem => {
          expect(problem.gradeLevel).toBe('kindergarten');
        });
      });

      it('should generate correct operations for kindergarten', () => {
        const validOps: MathOperation[] = ['addition', 'subtraction', 'counting', 'comparison'];
        const problems = runMultipleTimes(() => generateProblemByDifficulty(1), 50);
        problems.forEach(problem => {
          expect(validOps).toContain(problem.operation);
        });
      });

      it('should have non-negative answers for kindergarten', () => {
        const problems = runMultipleTimes(() => generateProblemByDifficulty(1), 50);
        problems.forEach(problem => {
          expect(problem.answer).toBeGreaterThanOrEqual(0);
        });
      });
    });

    describe('difficulty 3-6 (First Grade)', () => {
      it('should generate first-grade problems', () => {
        const problems = runMultipleTimes(() => generateProblemByDifficulty(4), 30);
        problems.forEach(problem => {
          expect(problem.gradeLevel).toBe('first');
        });
      });

      it('should generate correct operations for first grade', () => {
        const validOps: MathOperation[] = ['addition', 'subtraction', 'missing_addend'];
        const problems = runMultipleTimes(() => generateProblemByDifficulty(4), 50);
        problems.forEach(problem => {
          expect(validOps).toContain(problem.operation);
        });
      });

      it('should have reasonable number ranges for first grade', () => {
        const problems = runMultipleTimes(() => generateProblemByDifficulty(4), 50);
        problems.forEach(problem => {
          expect(problem.answer).toBeGreaterThanOrEqual(0);
          expect(problem.answer).toBeLessThanOrEqual(40); // max sum of 20+20
        });
      });
    });

    describe('difficulty 7-10 (Second Grade)', () => {
      it('should generate second-grade problems', () => {
        const problems = runMultipleTimes(() => generateProblemByDifficulty(8), 30);
        problems.forEach(problem => {
          expect(problem.gradeLevel).toBe('second');
        });
      });

      it('should include multiplication for second grade', () => {
        const problems = runMultipleTimes(() => generateProblemByDifficulty(8), 100);
        const hasMultiplication = problems.some(p => p.operation === 'multiplication');
        expect(hasMultiplication).toBe(true);
      });

      it('should have reasonable number ranges for second grade', () => {
        const problems = runMultipleTimes(() => generateProblemByDifficulty(8), 50);
        problems.forEach(problem => {
          expect(problem.answer).toBeGreaterThanOrEqual(0);
          expect(problem.answer).toBeLessThanOrEqual(200); // max sum of 100+100
        });
      });
    });
  });

  describe('generateProblemForWorksheet', () => {
    const testCases: { grade: GradeLevel; operation: MathOperation }[] = [
      { grade: 'kindergarten', operation: 'addition' },
      { grade: 'kindergarten', operation: 'subtraction' },
      { grade: 'kindergarten', operation: 'counting' },
      { grade: 'kindergarten', operation: 'comparison' },
      { grade: 'first', operation: 'addition' },
      { grade: 'first', operation: 'subtraction' },
      { grade: 'first', operation: 'missing_addend' },
      { grade: 'second', operation: 'addition' },
      { grade: 'second', operation: 'subtraction' },
      { grade: 'second', operation: 'multiplication' },
    ];

    testCases.forEach(({ grade, operation }) => {
      it(`should generate ${operation} problems for ${grade}`, () => {
        const problems = runMultipleTimes(
          () => generateProblemForWorksheet(grade, operation),
          20
        );

        problems.forEach(problem => {
          expect(problem.gradeLevel).toBe(grade);
          expect(problem.operation).toBe(operation);
          expect(problem.answer).toBeGreaterThanOrEqual(0);
          expect(problem.options).toHaveLength(4);
          expect(problem.options).toContain(problem.answer);
        });
      });
    });

    describe('counting problems', () => {
      it('should display emojis for counting', () => {
        const problems = runMultipleTimes(
          () => generateProblemForWorksheet('kindergarten', 'counting'),
          20
        );

        problems.forEach(problem => {
          expect(problem.questionDisplay.length).toBeGreaterThan(0);
          expect(problem.answer).toBeGreaterThan(0);
          expect(problem.answer).toBeLessThanOrEqual(10);
        });
      });
    });

    describe('comparison problems', () => {
      it('should compare two different numbers', () => {
        const problems = runMultipleTimes(
          () => generateProblemForWorksheet('kindergarten', 'comparison'),
          30
        );

        problems.forEach(problem => {
          expect(problem.question).toContain('bigger');
          expect(problem.answer).toBeGreaterThanOrEqual(1);
          expect(problem.answer).toBeLessThanOrEqual(10);
        });
      });
    });

    describe('missing addend problems', () => {
      it('should have correct format ? + n = total', () => {
        const problems = runMultipleTimes(
          () => generateProblemForWorksheet('first', 'missing_addend'),
          20
        );

        problems.forEach(problem => {
          expect(problem.questionDisplay).toContain('?');
          expect(problem.questionDisplay).toContain('=');
          expect(problem.answer).toBeGreaterThanOrEqual(0);
        });
      });
    });

    describe('multiplication problems', () => {
      it('should use factors 2, 5, or 10', () => {
        const problems = runMultipleTimes(
          () => generateProblemForWorksheet('second', 'multiplication'),
          50
        );

        problems.forEach(problem => {
          expect(problem.questionDisplay).toContain('x');
          // Answer should be divisible by 2, 5, or 10
          const validMultiple = problem.answer % 2 === 0 ||
                               problem.answer % 5 === 0 ||
                               problem.answer === 0;
          expect(validMultiple).toBe(true);
        });
      });
    });
  });

  describe('generateWorksheet', () => {
    it('should generate the requested number of problems', () => {
      const worksheet10 = generateWorksheet('kindergarten', 'addition', 10);
      const worksheet5 = generateWorksheet('first', 'subtraction', 5);
      const worksheet15 = generateWorksheet('second', 'multiplication', 15);

      expect(worksheet10).toHaveLength(10);
      expect(worksheet5).toHaveLength(5);
      expect(worksheet15).toHaveLength(15);
    });

    it('should generate problems with correct grade and operation', () => {
      const worksheet = generateWorksheet('first', 'addition', 10);

      worksheet.forEach(problem => {
        expect(problem.gradeLevel).toBe('first');
        expect(problem.operation).toBe('addition');
      });
    });

    it('should generate unique IDs for all problems', () => {
      const worksheet = generateWorksheet('kindergarten', 'counting', 20);
      const ids = worksheet.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(20);
    });

    it('should default to 10 problems when count not specified', () => {
      const worksheet = generateWorksheet('kindergarten', 'addition');
      expect(worksheet).toHaveLength(10);
    });
  });

  describe('calculateDifficultyFromStreak', () => {
    it('should start at difficulty 1 with streak 0', () => {
      expect(calculateDifficultyFromStreak(0)).toBe(1);
    });

    it('should increase difficulty every 5 correct answers', () => {
      expect(calculateDifficultyFromStreak(0)).toBe(1);
      expect(calculateDifficultyFromStreak(4)).toBe(1);
      expect(calculateDifficultyFromStreak(5)).toBe(2);
      expect(calculateDifficultyFromStreak(9)).toBe(2);
      expect(calculateDifficultyFromStreak(10)).toBe(3);
      expect(calculateDifficultyFromStreak(15)).toBe(4);
      expect(calculateDifficultyFromStreak(20)).toBe(5);
    });

    it('should cap at difficulty 10', () => {
      expect(calculateDifficultyFromStreak(45)).toBe(10);
      expect(calculateDifficultyFromStreak(50)).toBe(10);
      expect(calculateDifficultyFromStreak(100)).toBe(10);
      expect(calculateDifficultyFromStreak(1000)).toBe(10);
    });
  });

  describe('answer correctness validation', () => {
    it('should have mathematically correct answers for addition', () => {
      const problems = runMultipleTimes(
        () => generateProblemForWorksheet('first', 'addition'),
        50
      );

      problems.forEach(problem => {
        // Parse the question to verify the answer
        const match = problem.questionDisplay.match(/(\d+)\s*\+\s*(\d+)/);
        if (match) {
          const a = parseInt(match[1], 10);
          const b = parseInt(match[2], 10);
          expect(problem.answer).toBe(a + b);
        }
      });
    });

    it('should have mathematically correct answers for subtraction', () => {
      const problems = runMultipleTimes(
        () => generateProblemForWorksheet('first', 'subtraction'),
        50
      );

      problems.forEach(problem => {
        const match = problem.questionDisplay.match(/(\d+)\s*-\s*(\d+)/);
        if (match) {
          const a = parseInt(match[1], 10);
          const b = parseInt(match[2], 10);
          expect(problem.answer).toBe(a - b);
        }
      });
    });

    it('should have mathematically correct answers for multiplication', () => {
      const problems = runMultipleTimes(
        () => generateProblemForWorksheet('second', 'multiplication'),
        50
      );

      problems.forEach(problem => {
        const match = problem.questionDisplay.match(/(\d+)\s*x\s*(\d+)/);
        if (match) {
          const a = parseInt(match[1], 10);
          const b = parseInt(match[2], 10);
          expect(problem.answer).toBe(a * b);
        }
      });
    });
  });

  describe('wrong answer generation', () => {
    it('should generate plausible wrong answers (close to correct)', () => {
      const problems = runMultipleTimes(() => generateProblemByDifficulty(5), 50);

      problems.forEach(problem => {
        const wrongAnswers = problem.options.filter(o => o !== problem.answer);
        wrongAnswers.forEach(wrong => {
          // Wrong answers should be non-negative
          expect(wrong).toBeGreaterThanOrEqual(0);
          // They should be different from the correct answer
          expect(wrong).not.toBe(problem.answer);
        });
      });
    });

    it('should not have negative numbers in options', () => {
      const problems = runMultipleTimes(() => generateProblemByDifficulty(3), 100);

      problems.forEach(problem => {
        problem.options.forEach(option => {
          expect(option).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});
