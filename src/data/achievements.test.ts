import { describe, it, expect } from 'vitest';
import {
  ACHIEVEMENTS,
  getAchievementById,
  isAchievementUnlocked,
  getAchievementProgress,
} from './achievements';
import { Achievement } from '../types';

describe('achievements', () => {
  describe('ACHIEVEMENTS constant', () => {
    it('should have all required achievement categories', () => {
      const catchAchievements = ACHIEVEMENTS.filter(a => a.id.startsWith('catch') || a.id === 'first_catch');
      const streakAchievements = ACHIEVEMENTS.filter(a => a.id.startsWith('streak'));
      const worksheetAchievements = ACHIEVEMENTS.filter(a => a.id.startsWith('worksheet') || a.id === 'perfect_worksheet');
      const levelAchievements = ACHIEVEMENTS.filter(a => a.id.startsWith('level'));
      const correctAchievements = ACHIEVEMENTS.filter(a => a.id.startsWith('correct'));

      expect(catchAchievements.length).toBeGreaterThanOrEqual(3);
      expect(streakAchievements.length).toBeGreaterThanOrEqual(3);
      expect(worksheetAchievements.length).toBeGreaterThanOrEqual(3);
      expect(levelAchievements.length).toBeGreaterThanOrEqual(2);
      expect(correctAchievements.length).toBeGreaterThanOrEqual(2);
    });

    it('should have unique IDs for all achievements', () => {
      const ids = ACHIEVEMENTS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required properties', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('requirement');
        expect(typeof achievement.id).toBe('string');
        expect(typeof achievement.name).toBe('string');
        expect(typeof achievement.description).toBe('string');
        expect(typeof achievement.icon).toBe('string');
        expect(typeof achievement.requirement).toBe('number');
      });
    });

    it('should have positive requirement values', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement.requirement).toBeGreaterThan(0);
      });
    });

    it('should have non-empty strings for all text properties', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement.id.length).toBeGreaterThan(0);
        expect(achievement.name.length).toBeGreaterThan(0);
        expect(achievement.description.length).toBeGreaterThan(0);
        expect(achievement.icon.length).toBeGreaterThan(0);
      });
    });

    it('should have progressively harder requirements within categories', () => {
      // Catch achievements should be ordered
      const catch10 = ACHIEVEMENTS.find(a => a.id === 'catch_10');
      const catch50 = ACHIEVEMENTS.find(a => a.id === 'catch_50');
      const catch100 = ACHIEVEMENTS.find(a => a.id === 'catch_100');

      expect(catch10!.requirement).toBeLessThan(catch50!.requirement);
      expect(catch50!.requirement).toBeLessThan(catch100!.requirement);

      // Streak achievements should be ordered
      const streak5 = ACHIEVEMENTS.find(a => a.id === 'streak_5');
      const streak10 = ACHIEVEMENTS.find(a => a.id === 'streak_10');
      const streak25 = ACHIEVEMENTS.find(a => a.id === 'streak_25');

      expect(streak5!.requirement).toBeLessThan(streak10!.requirement);
      expect(streak10!.requirement).toBeLessThan(streak25!.requirement);
    });
  });

  describe('getAchievementById', () => {
    it('should return achievement with matching ID', () => {
      const achievement = getAchievementById('first_catch');
      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe('first_catch');
      expect(achievement?.name).toBe('First Catch!');
    });

    it('should return undefined for non-existent ID', () => {
      const achievement = getAchievementById('non_existent_achievement');
      expect(achievement).toBeUndefined();
    });

    it('should find all defined achievements', () => {
      const achievementIds = [
        'first_catch', 'catch_10', 'catch_50', 'catch_100',
        'streak_5', 'streak_10', 'streak_25', 'streak_50',
        'worksheet_1', 'worksheet_5', 'worksheet_10', 'perfect_worksheet',
        'level_5', 'level_10',
        'correct_100', 'correct_500',
      ];

      achievementIds.forEach(id => {
        const achievement = getAchievementById(id);
        expect(achievement).toBeDefined();
        expect(achievement?.id).toBe(id);
      });
    });
  });

  describe('isAchievementUnlocked', () => {
    it('should return true when current >= requirement', () => {
      const achievement: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎯',
        requirement: 5,
        current: 5,
      };

      expect(isAchievementUnlocked(achievement)).toBe(true);
    });

    it('should return true when current > requirement', () => {
      const achievement: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎯',
        requirement: 5,
        current: 10,
      };

      expect(isAchievementUnlocked(achievement)).toBe(true);
    });

    it('should return false when current < requirement', () => {
      const achievement: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎯',
        requirement: 5,
        current: 3,
      };

      expect(isAchievementUnlocked(achievement)).toBe(false);
    });

    it('should return false when current is 0', () => {
      const achievement: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎯',
        requirement: 1,
        current: 0,
      };

      expect(isAchievementUnlocked(achievement)).toBe(false);
    });
  });

  describe('getAchievementProgress', () => {
    it('should return 0 when current is 0', () => {
      const achievement: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎯',
        requirement: 10,
        current: 0,
      };

      expect(getAchievementProgress(achievement)).toBe(0);
    });

    it('should return 50 when halfway', () => {
      const achievement: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎯',
        requirement: 10,
        current: 5,
      };

      expect(getAchievementProgress(achievement)).toBe(50);
    });

    it('should return 100 when complete', () => {
      const achievement: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎯',
        requirement: 10,
        current: 10,
      };

      expect(getAchievementProgress(achievement)).toBe(100);
    });

    it('should cap at 100 even if over requirement', () => {
      const achievement: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎯',
        requirement: 5,
        current: 15,
      };

      expect(getAchievementProgress(achievement)).toBe(100);
    });

    it('should round percentage correctly', () => {
      const achievement: Achievement = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎯',
        requirement: 3,
        current: 1,
      };

      expect(getAchievementProgress(achievement)).toBe(33); // 33.33 rounded
    });
  });
});
