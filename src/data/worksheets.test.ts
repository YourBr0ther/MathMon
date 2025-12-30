import { describe, it, expect } from 'vitest';
import {
  WORKSHEETS,
  getWorksheetsByGrade,
  getWorksheetById,
  getGradeLevelName,
  getGradeLevelColor,
} from './worksheets';
import { GradeLevel } from '../types';

describe('worksheets', () => {
  describe('WORKSHEETS constant', () => {
    it('should have worksheets for all grade levels', () => {
      const kindergartenWorksheets = WORKSHEETS.filter(w => w.gradeLevel === 'kindergarten');
      const firstGradeWorksheets = WORKSHEETS.filter(w => w.gradeLevel === 'first');
      const secondGradeWorksheets = WORKSHEETS.filter(w => w.gradeLevel === 'second');

      expect(kindergartenWorksheets.length).toBeGreaterThan(0);
      expect(firstGradeWorksheets.length).toBeGreaterThan(0);
      expect(secondGradeWorksheets.length).toBeGreaterThan(0);
    });

    it('should have unique IDs for all worksheets', () => {
      const ids = WORKSHEETS.map(w => w.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required properties', () => {
      WORKSHEETS.forEach(worksheet => {
        expect(worksheet).toHaveProperty('id');
        expect(worksheet).toHaveProperty('name');
        expect(worksheet).toHaveProperty('icon');
        expect(worksheet).toHaveProperty('description');
        expect(worksheet).toHaveProperty('gradeLevel');
        expect(worksheet).toHaveProperty('operation');
        expect(worksheet).toHaveProperty('problemCount');
        expect(worksheet).toHaveProperty('unlocked');
      });
    });

    it('should have positive problem counts', () => {
      WORKSHEETS.forEach(worksheet => {
        expect(worksheet.problemCount).toBeGreaterThan(0);
      });
    });

    it('should have valid grade levels', () => {
      const validGrades: GradeLevel[] = ['kindergarten', 'first', 'second'];
      WORKSHEETS.forEach(worksheet => {
        expect(validGrades).toContain(worksheet.gradeLevel);
      });
    });

    it('should have all worksheets initially unlocked', () => {
      WORKSHEETS.forEach(worksheet => {
        expect(worksheet.unlocked).toBe(true);
      });
    });

    it('should have 10 problems per worksheet by default', () => {
      WORKSHEETS.forEach(worksheet => {
        expect(worksheet.problemCount).toBe(10);
      });
    });
  });

  describe('kindergarten worksheets', () => {
    it('should have counting worksheet', () => {
      const counting = WORKSHEETS.find(w => w.gradeLevel === 'kindergarten' && w.operation === 'counting');
      expect(counting).toBeDefined();
      expect(counting?.name).toContain('Counting');
    });

    it('should have addition worksheet', () => {
      const addition = WORKSHEETS.find(w => w.gradeLevel === 'kindergarten' && w.operation === 'addition');
      expect(addition).toBeDefined();
    });

    it('should have subtraction worksheet', () => {
      const subtraction = WORKSHEETS.find(w => w.gradeLevel === 'kindergarten' && w.operation === 'subtraction');
      expect(subtraction).toBeDefined();
    });

    it('should have comparison worksheet', () => {
      const comparison = WORKSHEETS.find(w => w.gradeLevel === 'kindergarten' && w.operation === 'comparison');
      expect(comparison).toBeDefined();
    });
  });

  describe('first grade worksheets', () => {
    it('should have addition worksheets', () => {
      const addition = WORKSHEETS.filter(w => w.gradeLevel === 'first' && w.operation === 'addition');
      expect(addition.length).toBeGreaterThan(0);
    });

    it('should have subtraction worksheet', () => {
      const subtraction = WORKSHEETS.find(w => w.gradeLevel === 'first' && w.operation === 'subtraction');
      expect(subtraction).toBeDefined();
    });

    it('should have missing addend worksheet', () => {
      const missingAddend = WORKSHEETS.find(w => w.gradeLevel === 'first' && w.operation === 'missing_addend');
      expect(missingAddend).toBeDefined();
    });
  });

  describe('second grade worksheets', () => {
    it('should have addition worksheets', () => {
      const addition = WORKSHEETS.filter(w => w.gradeLevel === 'second' && w.operation === 'addition');
      expect(addition.length).toBeGreaterThan(0);
    });

    it('should have subtraction worksheet', () => {
      const subtraction = WORKSHEETS.find(w => w.gradeLevel === 'second' && w.operation === 'subtraction');
      expect(subtraction).toBeDefined();
    });

    it('should have multiplication worksheet', () => {
      const multiplication = WORKSHEETS.find(w => w.gradeLevel === 'second' && w.operation === 'multiplication');
      expect(multiplication).toBeDefined();
    });
  });

  describe('getWorksheetsByGrade', () => {
    it('should return only kindergarten worksheets for kindergarten', () => {
      const worksheets = getWorksheetsByGrade('kindergarten');
      worksheets.forEach(w => {
        expect(w.gradeLevel).toBe('kindergarten');
      });
      expect(worksheets.length).toBeGreaterThan(0);
    });

    it('should return only first grade worksheets for first', () => {
      const worksheets = getWorksheetsByGrade('first');
      worksheets.forEach(w => {
        expect(w.gradeLevel).toBe('first');
      });
      expect(worksheets.length).toBeGreaterThan(0);
    });

    it('should return only second grade worksheets for second', () => {
      const worksheets = getWorksheetsByGrade('second');
      worksheets.forEach(w => {
        expect(w.gradeLevel).toBe('second');
      });
      expect(worksheets.length).toBeGreaterThan(0);
    });

    it('should return different counts for different grades', () => {
      const kindergarten = getWorksheetsByGrade('kindergarten');
      const first = getWorksheetsByGrade('first');
      const second = getWorksheetsByGrade('second');

      const total = kindergarten.length + first.length + second.length;
      expect(total).toBe(WORKSHEETS.length);
    });
  });

  describe('getWorksheetById', () => {
    it('should return worksheet with matching ID', () => {
      const worksheet = getWorksheetById('k_counting');
      expect(worksheet).toBeDefined();
      expect(worksheet?.id).toBe('k_counting');
    });

    it('should return undefined for non-existent ID', () => {
      const worksheet = getWorksheetById('non_existent');
      expect(worksheet).toBeUndefined();
    });

    it('should find all worksheets by their IDs', () => {
      WORKSHEETS.forEach(original => {
        const found = getWorksheetById(original.id);
        expect(found).toBeDefined();
        expect(found?.id).toBe(original.id);
        expect(found?.name).toBe(original.name);
      });
    });
  });

  describe('getGradeLevelName', () => {
    it('should return "Kindergarten" for kindergarten', () => {
      expect(getGradeLevelName('kindergarten')).toBe('Kindergarten');
    });

    it('should return "1st Grade" for first', () => {
      expect(getGradeLevelName('first')).toBe('1st Grade');
    });

    it('should return "2nd Grade" for second', () => {
      expect(getGradeLevelName('second')).toBe('2nd Grade');
    });

    it('should return the input for unknown grades', () => {
      // TypeScript would normally prevent this, but testing edge case
      expect(getGradeLevelName('unknown' as GradeLevel)).toBe('unknown');
    });
  });

  describe('getGradeLevelColor', () => {
    it('should return green for kindergarten', () => {
      const color = getGradeLevelColor('kindergarten');
      expect(color).toBe('#78C850');
    });

    it('should return blue for first grade', () => {
      const color = getGradeLevelColor('first');
      expect(color).toBe('#6890F0');
    });

    it('should return pink for second grade', () => {
      const color = getGradeLevelColor('second');
      expect(color).toBe('#F85888');
    });

    it('should return valid hex colors', () => {
      const grades: GradeLevel[] = ['kindergarten', 'first', 'second'];
      grades.forEach(grade => {
        const color = getGradeLevelColor(grade);
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should return fallback color for unknown grades', () => {
      const color = getGradeLevelColor('unknown' as GradeLevel);
      expect(color).toBe('#A8A878');
    });
  });
});
