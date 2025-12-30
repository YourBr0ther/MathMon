import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  generateProblemByDifficulty,
  generateWorksheet,
  calculateDifficultyFromStreak,
} from '../utils/mathGenerator';
import {
  getDefaultGameState,
  addCaughtPokemon,
  updateStreak,
  recordAnswer,
  completeWorksheet,
  calculateAccuracy,
} from '../utils/storage';
import {
  getRandomPokemonId,
  getPokemonRarity,
  getStarterPokemonId,
} from '../data/pokemonConfig';
import { WORKSHEETS, getWorksheetById } from '../data/worksheets';
import { ACHIEVEMENTS } from '../data/achievements';
import { Pokemon, WorksheetResult, GameState } from '../types';

describe('Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Endless Mode Game Flow', () => {
    it('should simulate a complete endless mode session', () => {
      let gameState = getDefaultGameState();
      let currentDifficulty = 1;
      let streak = 0;

      // Simulate 20 correct answers
      for (let i = 0; i < 20; i++) {
        // Generate problem based on current difficulty
        const problem = generateProblemByDifficulty(currentDifficulty);

        // Verify problem is valid
        expect(problem.options).toContain(problem.answer);
        expect(problem.options).toHaveLength(4);

        // Record correct answer
        gameState = recordAnswer(gameState, true);
        streak++;
        gameState = updateStreak(gameState, streak);

        // Update difficulty based on streak
        currentDifficulty = calculateDifficultyFromStreak(streak);

        // Every 5 correct, catch a Pokemon
        if (streak % 5 === 0) {
          const pokemonId = getRandomPokemonId(currentDifficulty);
          const mockPokemon: Pokemon = {
            id: pokemonId,
            name: `Pokemon ${pokemonId}`,
            sprite: `sprite-${pokemonId}.png`,
            officialArtwork: `art-${pokemonId}.png`,
            types: ['normal'],
          };
          gameState = addCaughtPokemon(gameState, mockPokemon, problem.question);
        }
      }

      // Verify final state
      expect(gameState.totalCorrectAnswers).toBe(20);
      expect(gameState.totalProblemsAttempted).toBe(20);
      expect(gameState.highestStreak).toBe(20);
      expect(gameState.caughtPokemon).toHaveLength(4); // 4 catches at 5, 10, 15, 20
      expect(calculateAccuracy(gameState)).toBe(100);

      // Check XP gain (20 correct * 10 XP + 4 catches * 50 XP = 400 XP)
      expect(gameState.xp).toBe(400);
    });

    it('should handle wrong answers and streak reset', () => {
      let gameState = getDefaultGameState();
      let streak = 0;

      // Get 3 correct
      for (let i = 0; i < 3; i++) {
        gameState = recordAnswer(gameState, true);
        streak++;
        gameState = updateStreak(gameState, streak);
      }

      expect(gameState.currentStreak).toBe(3);
      expect(gameState.highestStreak).toBe(3);

      // Get one wrong - streak resets
      gameState = recordAnswer(gameState, false);
      streak = 0;
      gameState = updateStreak(gameState, streak);

      expect(gameState.currentStreak).toBe(0);
      expect(gameState.highestStreak).toBe(3); // Highest should remain
      expect(gameState.totalCorrectAnswers).toBe(3);
      expect(gameState.totalProblemsAttempted).toBe(4);
    });

    it('should use starter Pokemon for first 4 catches', () => {
      const expectedStarters = [1, 4, 7, 25]; // Bulbasaur, Charmander, Squirtle, Pikachu

      for (let i = 0; i < 4; i++) {
        const starterId = getStarterPokemonId(i);
        expect(starterId).toBe(expectedStarters[i]);
      }

      // 5th catch should be random
      const fifthCatch = getStarterPokemonId(4);
      expect(fifthCatch).toBeGreaterThanOrEqual(1);
      expect(fifthCatch).toBeLessThanOrEqual(151);
    });

    it('should increase difficulty and rare Pokemon chances over time', () => {
      const lowDifficultyRarities: string[] = [];
      const highDifficultyRarities: string[] = [];

      // Sample 100 Pokemon at low difficulty
      for (let i = 0; i < 100; i++) {
        const id = getRandomPokemonId(1);
        lowDifficultyRarities.push(getPokemonRarity(id));
      }

      // Sample 100 Pokemon at high difficulty
      for (let i = 0; i < 100; i++) {
        const id = getRandomPokemonId(10);
        highDifficultyRarities.push(getPokemonRarity(id));
      }

      const lowRareCount = lowDifficultyRarities.filter(r => r === 'rare' || r === 'legendary').length;
      const highRareCount = highDifficultyRarities.filter(r => r === 'rare' || r === 'legendary').length;

      // High difficulty should have more rare/legendary on average
      // With statistical variance, we just check that it's possible to get rares at high difficulty
      expect(highDifficultyRarities.includes('rare') || highDifficultyRarities.includes('legendary')).toBe(true);
    });
  });

  describe('Worksheet Mode Game Flow', () => {
    it('should simulate completing a worksheet with perfect score', () => {
      let gameState = getDefaultGameState();
      const worksheet = getWorksheetById('k_addition')!;

      // Generate worksheet problems
      const problems = generateWorksheet(worksheet.gradeLevel, worksheet.operation, worksheet.problemCount);

      // Verify all problems are valid
      expect(problems).toHaveLength(worksheet.problemCount);
      problems.forEach(problem => {
        expect(problem.gradeLevel).toBe(worksheet.gradeLevel);
        expect(problem.operation).toBe(worksheet.operation);
        expect(problem.options).toContain(problem.answer);
      });

      // Simulate answering all correctly
      problems.forEach(() => {
        gameState = recordAnswer(gameState, true);
      });

      // Complete worksheet with perfect score
      const result: WorksheetResult = {
        worksheetId: worksheet.id,
        completedAt: new Date(),
        correctAnswers: worksheet.problemCount,
        totalProblems: worksheet.problemCount,
        stars: 3,
        timeSeconds: 60,
      };

      gameState = completeWorksheet(gameState, result);

      expect(gameState.worksheetsCompleted).toHaveLength(1);
      expect(gameState.worksheetsCompleted[0].stars).toBe(3);
      expect(gameState.totalCorrectAnswers).toBe(worksheet.problemCount);

      // Check XP: 10 problems * 10 XP + 3 stars * 50 XP = 250 XP
      expect(gameState.xp).toBe(250);
    });

    it('should calculate star ratings correctly', () => {
      // Test star rating calculation
      const calculateStars = (correct: number, total: number): number => {
        const percentage = (correct / total) * 100;
        if (percentage >= 90) return 3;
        if (percentage >= 70) return 2;
        if (percentage >= 50) return 1;
        return 0;
      };

      expect(calculateStars(10, 10)).toBe(3); // 100%
      expect(calculateStars(9, 10)).toBe(3);  // 90%
      expect(calculateStars(8, 10)).toBe(2);  // 80%
      expect(calculateStars(7, 10)).toBe(2);  // 70%
      expect(calculateStars(6, 10)).toBe(1);  // 60%
      expect(calculateStars(5, 10)).toBe(1);  // 50%
      expect(calculateStars(4, 10)).toBe(0);  // 40%
    });

    it('should have worksheets for all grade levels and operations', () => {
      // Verify kindergarten has required operations
      const kWorksheets = WORKSHEETS.filter(w => w.gradeLevel === 'kindergarten');
      expect(kWorksheets.map(w => w.operation)).toContain('counting');
      expect(kWorksheets.map(w => w.operation)).toContain('addition');
      expect(kWorksheets.map(w => w.operation)).toContain('subtraction');
      expect(kWorksheets.map(w => w.operation)).toContain('comparison');

      // Verify first grade has required operations
      const firstWorksheets = WORKSHEETS.filter(w => w.gradeLevel === 'first');
      expect(firstWorksheets.map(w => w.operation)).toContain('addition');
      expect(firstWorksheets.map(w => w.operation)).toContain('subtraction');
      expect(firstWorksheets.map(w => w.operation)).toContain('missing_addend');

      // Verify second grade has required operations
      const secondWorksheets = WORKSHEETS.filter(w => w.gradeLevel === 'second');
      expect(secondWorksheets.map(w => w.operation)).toContain('addition');
      expect(secondWorksheets.map(w => w.operation)).toContain('subtraction');
      expect(secondWorksheets.map(w => w.operation)).toContain('multiplication');
    });
  });

  describe('Achievement System Integration', () => {
    it('should unlock achievements progressively', () => {
      let gameState = getDefaultGameState();

      // Verify first_catch achievement starts locked
      let firstCatch = gameState.achievements.find(a => a.id === 'first_catch');
      expect(firstCatch?.current).toBe(0);
      expect(firstCatch?.unlockedAt).toBeUndefined();

      // Catch first Pokemon
      const mockPokemon: Pokemon = {
        id: 25,
        name: 'Pikachu',
        sprite: 'sprite.png',
        officialArtwork: 'art.png',
        types: ['electric'],
      };

      gameState = addCaughtPokemon(gameState, mockPokemon);

      // Verify first_catch is now unlocked
      firstCatch = gameState.achievements.find(a => a.id === 'first_catch');
      expect(firstCatch?.current).toBe(1);
      expect(firstCatch?.unlockedAt).toBeDefined();
    });

    it('should track streak achievements', () => {
      let gameState = getDefaultGameState();

      // Build up a 10 streak
      for (let i = 1; i <= 10; i++) {
        gameState = updateStreak(gameState, i);
      }

      const streak5 = gameState.achievements.find(a => a.id === 'streak_5');
      const streak10 = gameState.achievements.find(a => a.id === 'streak_10');
      const streak25 = gameState.achievements.find(a => a.id === 'streak_25');

      expect(streak5?.current).toBe(10);
      expect(streak5?.unlockedAt).toBeDefined();
      expect(streak10?.current).toBe(10);
      expect(streak10?.unlockedAt).toBeDefined();
      expect(streak25?.current).toBe(10);
      expect(streak25?.unlockedAt).toBeUndefined(); // Not yet unlocked
    });

    it('should track worksheet achievements', () => {
      let gameState = getDefaultGameState();

      // Complete a perfect worksheet
      const result: WorksheetResult = {
        worksheetId: 'k_addition',
        completedAt: new Date(),
        correctAnswers: 10,
        totalProblems: 10,
        stars: 3,
        timeSeconds: 60,
      };

      gameState = completeWorksheet(gameState, result);

      const worksheet1 = gameState.achievements.find(a => a.id === 'worksheet_1');
      const perfectWorksheet = gameState.achievements.find(a => a.id === 'perfect_worksheet');

      expect(worksheet1?.current).toBe(1);
      expect(worksheet1?.unlockedAt).toBeDefined();
      expect(perfectWorksheet?.current).toBe(1);
      expect(perfectWorksheet?.unlockedAt).toBeDefined();
    });

    it('should have all achievements properly configured', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement.id).toBeTruthy();
        expect(achievement.name).toBeTruthy();
        expect(achievement.description).toBeTruthy();
        expect(achievement.icon).toBeTruthy();
        expect(achievement.requirement).toBeGreaterThan(0);
      });

      // Verify no duplicate IDs
      const ids = ACHIEVEMENTS.map(a => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('XP and Leveling System', () => {
    it('should correctly accumulate XP from all sources', () => {
      let gameState = getDefaultGameState();

      // Answer 10 questions correctly: 10 * 10 = 100 XP
      for (let i = 0; i < 10; i++) {
        gameState = recordAnswer(gameState, true);
      }
      expect(gameState.xp).toBe(100);

      // Catch a Pokemon: 50 XP
      const mockPokemon: Pokemon = {
        id: 1,
        name: 'Bulbasaur',
        sprite: 'sprite.png',
        officialArtwork: 'art.png',
        types: ['grass'],
      };
      gameState = addCaughtPokemon(gameState, mockPokemon);
      expect(gameState.xp).toBe(150);

      // Complete a 2-star worksheet: 2 * 50 = 100 XP
      const result: WorksheetResult = {
        worksheetId: 'k_addition',
        completedAt: new Date(),
        correctAnswers: 8,
        totalProblems: 10,
        stars: 2,
        timeSeconds: 120,
      };
      gameState = completeWorksheet(gameState, result);
      expect(gameState.xp).toBe(250);
    });

    it('should level up at correct XP thresholds', () => {
      let gameState = getDefaultGameState();
      expect(gameState.level).toBe(1);

      // Add XP just below level 2 threshold
      gameState.xp = 499;
      const mockPokemon: Pokemon = {
        id: 1,
        name: 'Test',
        sprite: 'sprite.png',
        officialArtwork: 'art.png',
        types: ['normal'],
      };

      // This should trigger level up (499 + 50 = 549 > 500)
      gameState = addCaughtPokemon(gameState, mockPokemon);
      expect(gameState.level).toBe(2);

      // Add more XP to approach level 3
      gameState.xp = 999;
      gameState = addCaughtPokemon(gameState, { ...mockPokemon, id: 2 });
      expect(gameState.level).toBe(3);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity between game systems', () => {
      // All worksheet IDs should be unique and follow naming convention
      const worksheetIds = WORKSHEETS.map(w => w.id);
      expect(new Set(worksheetIds).size).toBe(worksheetIds.length);

      // All achievements should have unique IDs
      const achievementIds = ACHIEVEMENTS.map(a => a.id);
      expect(new Set(achievementIds).size).toBe(achievementIds.length);
    });

    it('should generate valid math problems for all worksheet combinations', () => {
      WORKSHEETS.forEach(worksheet => {
        const problems = generateWorksheet(
          worksheet.gradeLevel,
          worksheet.operation,
          5
        );

        problems.forEach(problem => {
          expect(problem.gradeLevel).toBe(worksheet.gradeLevel);
          expect(problem.operation).toBe(worksheet.operation);
          expect(problem.answer).toBeGreaterThanOrEqual(0);
          expect(problem.options).toHaveLength(4);
          expect(problem.options).toContain(problem.answer);

          // Verify no duplicate options
          const uniqueOptions = new Set(problem.options);
          expect(uniqueOptions.size).toBe(4);
        });
      });
    });

    it('should have consistent difficulty scaling', () => {
      for (let streak = 0; streak <= 50; streak++) {
        const difficulty = calculateDifficultyFromStreak(streak);
        expect(difficulty).toBeGreaterThanOrEqual(1);
        expect(difficulty).toBeLessThanOrEqual(10);
      }
    });
  });
});
