import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDefaultGameState,
  loadGameState,
  saveGameState,
  addCaughtPokemon,
  updateStreak,
  recordAnswer,
  completeWorksheet,
  setTrainerName,
  isNewDay,
  updateLastPlayedDate,
  resetGame,
  calculateAccuracy,
  getXpForNextLevel,
  getLevelProgress,
} from './storage';
import { GameState, Pokemon, WorksheetResult } from '../types';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getDefaultGameState', () => {
    it('should return a valid default state', () => {
      const state = getDefaultGameState();

      expect(state.trainerName).toBe('');
      expect(state.caughtPokemon).toEqual([]);
      expect(state.highestStreak).toBe(0);
      expect(state.totalCorrectAnswers).toBe(0);
      expect(state.totalProblemsAttempted).toBe(0);
      expect(state.worksheetsCompleted).toEqual([]);
      expect(state.currentStreak).toBe(0);
      expect(state.xp).toBe(0);
      expect(state.level).toBe(1);
    });

    it('should include all achievements with current set to 0', () => {
      const state = getDefaultGameState();

      expect(state.achievements.length).toBeGreaterThan(0);
      state.achievements.forEach(achievement => {
        expect(achievement.current).toBe(0);
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('requirement');
      });
    });

    it('should set lastPlayedDate to today', () => {
      const state = getDefaultGameState();
      const today = new Date().toISOString().split('T')[0];
      expect(state.lastPlayedDate).toBe(today);
    });
  });

  describe('loadGameState and saveGameState', () => {
    it('should return default state when no saved state exists', () => {
      const state = loadGameState();
      const defaultState = getDefaultGameState();

      expect(state.trainerName).toBe(defaultState.trainerName);
      expect(state.caughtPokemon).toEqual(defaultState.caughtPokemon);
      expect(state.level).toBe(defaultState.level);
    });

    it('should save and load state correctly', () => {
      const state = getDefaultGameState();
      state.trainerName = 'Ash';
      state.highestStreak = 15;
      state.xp = 500;

      saveGameState(state);
      const loaded = loadGameState();

      expect(loaded.trainerName).toBe('Ash');
      expect(loaded.highestStreak).toBe(15);
      expect(loaded.xp).toBe(500);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('mathmon_game_state', 'invalid json{{{');
      const state = loadGameState();

      // Should return default state on error
      expect(state.level).toBe(1);
    });

    it('should merge new achievements when loading old save', () => {
      // Save state with only some achievements
      const oldState: GameState = {
        ...getDefaultGameState(),
        achievements: [{ id: 'first_catch', name: 'First Catch!', description: '', icon: '🎉', requirement: 1, current: 1 }],
      };
      saveGameState(oldState);

      const loaded = loadGameState();
      // Should have more achievements than saved (merged with defaults)
      expect(loaded.achievements.length).toBeGreaterThan(1);
    });
  });

  describe('addCaughtPokemon', () => {
    it('should add pokemon to caught list', () => {
      const state = getDefaultGameState();
      const pokemon: Pokemon = {
        id: 25,
        name: 'Pikachu',
        sprite: 'sprite.png',
        officialArtwork: 'art.png',
        types: ['electric'],
      };

      const newState = addCaughtPokemon(state, pokemon, '5 + 3');

      expect(newState.caughtPokemon).toHaveLength(1);
      expect(newState.caughtPokemon[0].id).toBe(25);
      expect(newState.caughtPokemon[0].name).toBe('Pikachu');
      expect(newState.caughtPokemon[0].caughtWithProblem).toBe('5 + 3');
      expect(newState.caughtPokemon[0].caughtAt).toBeDefined();
    });

    it('should award 50 XP per catch', () => {
      const state = getDefaultGameState();
      const pokemon: Pokemon = {
        id: 1,
        name: 'Bulbasaur',
        sprite: 'sprite.png',
        officialArtwork: 'art.png',
        types: ['grass', 'poison'],
      };

      const newState = addCaughtPokemon(state, pokemon);
      expect(newState.xp).toBe(50);

      const newState2 = addCaughtPokemon(newState, { ...pokemon, id: 2 });
      expect(newState2.xp).toBe(100);
    });

    it('should trigger level up at 500 XP', () => {
      let state = getDefaultGameState();
      state.xp = 450;

      const pokemon: Pokemon = {
        id: 1,
        name: 'Bulbasaur',
        sprite: 'sprite.png',
        officialArtwork: 'art.png',
        types: ['grass'],
      };

      const newState = addCaughtPokemon(state, pokemon);
      expect(newState.xp).toBe(500);
      expect(newState.level).toBe(2);
    });

    it('should update first_catch achievement', () => {
      const state = getDefaultGameState();
      const pokemon: Pokemon = {
        id: 1,
        name: 'Bulbasaur',
        sprite: 'sprite.png',
        officialArtwork: 'art.png',
        types: ['grass'],
      };

      const newState = addCaughtPokemon(state, pokemon);
      const firstCatch = newState.achievements.find(a => a.id === 'first_catch');
      expect(firstCatch?.current).toBe(1);
      expect(firstCatch?.unlockedAt).toBeDefined();
    });
  });

  describe('updateStreak', () => {
    it('should update current streak', () => {
      const state = getDefaultGameState();
      const newState = updateStreak(state, 5);

      expect(newState.currentStreak).toBe(5);
    });

    it('should update highest streak if new streak is higher', () => {
      const state = getDefaultGameState();
      state.highestStreak = 10;

      const newState1 = updateStreak(state, 8);
      expect(newState1.highestStreak).toBe(10); // No change

      const newState2 = updateStreak(state, 15);
      expect(newState2.highestStreak).toBe(15); // Updated
    });

    it('should update streak achievements', () => {
      const state = getDefaultGameState();
      const newState = updateStreak(state, 5);

      const streak5 = newState.achievements.find(a => a.id === 'streak_5');
      expect(streak5?.current).toBe(5);
    });
  });

  describe('recordAnswer', () => {
    it('should increment totalProblemsAttempted', () => {
      const state = getDefaultGameState();

      const newState1 = recordAnswer(state, true);
      expect(newState1.totalProblemsAttempted).toBe(1);

      const newState2 = recordAnswer(newState1, false);
      expect(newState2.totalProblemsAttempted).toBe(2);
    });

    it('should increment totalCorrectAnswers only for correct answers', () => {
      const state = getDefaultGameState();

      const newState1 = recordAnswer(state, true);
      expect(newState1.totalCorrectAnswers).toBe(1);

      const newState2 = recordAnswer(newState1, false);
      expect(newState2.totalCorrectAnswers).toBe(1); // Unchanged

      const newState3 = recordAnswer(newState2, true);
      expect(newState3.totalCorrectAnswers).toBe(2);
    });

    it('should award 10 XP for correct answers', () => {
      const state = getDefaultGameState();

      const newState1 = recordAnswer(state, true);
      expect(newState1.xp).toBe(10);

      const newState2 = recordAnswer(newState1, false);
      expect(newState2.xp).toBe(10); // No XP for wrong
    });
  });

  describe('completeWorksheet', () => {
    it('should add worksheet result to completed list', () => {
      const state = getDefaultGameState();
      const result: WorksheetResult = {
        worksheetId: 'k_addition',
        completedAt: new Date(),
        correctAnswers: 8,
        totalProblems: 10,
        stars: 2,
        timeSeconds: 120,
      };

      const newState = completeWorksheet(state, result);
      expect(newState.worksheetsCompleted).toHaveLength(1);
      expect(newState.worksheetsCompleted[0].worksheetId).toBe('k_addition');
    });

    it('should award XP based on stars (50 per star)', () => {
      const state = getDefaultGameState();

      const result1: WorksheetResult = {
        worksheetId: 'k_addition',
        completedAt: new Date(),
        correctAnswers: 10,
        totalProblems: 10,
        stars: 3,
        timeSeconds: 60,
      };
      const newState1 = completeWorksheet(state, result1);
      expect(newState1.xp).toBe(150); // 3 stars * 50

      const result2: WorksheetResult = {
        worksheetId: 'k_sub',
        completedAt: new Date(),
        correctAnswers: 6,
        totalProblems: 10,
        stars: 1,
        timeSeconds: 180,
      };
      const newState2 = completeWorksheet(newState1, result2);
      expect(newState2.xp).toBe(200); // 150 + 50
    });

    it('should update worksheet achievements', () => {
      const state = getDefaultGameState();
      const result: WorksheetResult = {
        worksheetId: 'k_addition',
        completedAt: new Date(),
        correctAnswers: 10,
        totalProblems: 10,
        stars: 3,
        timeSeconds: 60,
      };

      const newState = completeWorksheet(state, result);
      const worksheet1 = newState.achievements.find(a => a.id === 'worksheet_1');
      const perfectWorksheet = newState.achievements.find(a => a.id === 'perfect_worksheet');

      expect(worksheet1?.current).toBe(1);
      expect(perfectWorksheet?.current).toBe(1);
    });
  });

  describe('setTrainerName', () => {
    it('should update trainer name', () => {
      const state = getDefaultGameState();
      const newState = setTrainerName(state, 'Misty');

      expect(newState.trainerName).toBe('Misty');
    });

    it('should preserve other state', () => {
      const state = getDefaultGameState();
      state.xp = 100;
      state.level = 2;

      const newState = setTrainerName(state, 'Brock');
      expect(newState.xp).toBe(100);
      expect(newState.level).toBe(2);
    });
  });

  describe('isNewDay', () => {
    it('should return true if lastPlayedDate is different from today', () => {
      const state = getDefaultGameState();
      state.lastPlayedDate = '2024-01-01';

      expect(isNewDay(state)).toBe(true);
    });

    it('should return false if lastPlayedDate is today', () => {
      const state = getDefaultGameState();
      const today = new Date().toISOString().split('T')[0];
      state.lastPlayedDate = today;

      expect(isNewDay(state)).toBe(false);
    });
  });

  describe('updateLastPlayedDate', () => {
    it('should update lastPlayedDate to today', () => {
      const state = getDefaultGameState();
      state.lastPlayedDate = '2024-01-01';

      const newState = updateLastPlayedDate(state);
      const today = new Date().toISOString().split('T')[0];

      expect(newState.lastPlayedDate).toBe(today);
    });
  });

  describe('resetGame', () => {
    it('should remove game state from localStorage', () => {
      const state = getDefaultGameState();
      state.trainerName = 'Test';
      saveGameState(state);

      expect(localStorage.getItem('mathmon_game_state')).not.toBeNull();

      resetGame();

      expect(localStorage.getItem('mathmon_game_state')).toBeNull();
    });
  });

  describe('calculateAccuracy', () => {
    it('should return 0 when no problems attempted', () => {
      const state = getDefaultGameState();
      expect(calculateAccuracy(state)).toBe(0);
    });

    it('should calculate correct percentage', () => {
      const state = getDefaultGameState();
      state.totalProblemsAttempted = 10;
      state.totalCorrectAnswers = 7;

      expect(calculateAccuracy(state)).toBe(70);
    });

    it('should return 100 for perfect score', () => {
      const state = getDefaultGameState();
      state.totalProblemsAttempted = 50;
      state.totalCorrectAnswers = 50;

      expect(calculateAccuracy(state)).toBe(100);
    });

    it('should round to nearest integer', () => {
      const state = getDefaultGameState();
      state.totalProblemsAttempted = 3;
      state.totalCorrectAnswers = 1;

      expect(calculateAccuracy(state)).toBe(33); // 33.33 rounded
    });
  });

  describe('getXpForNextLevel', () => {
    it('should return correct XP thresholds', () => {
      expect(getXpForNextLevel(1)).toBe(500);
      expect(getXpForNextLevel(2)).toBe(1000);
      expect(getXpForNextLevel(5)).toBe(2500);
      expect(getXpForNextLevel(10)).toBe(5000);
    });
  });

  describe('getLevelProgress', () => {
    it('should return 0 at start of level', () => {
      const state = getDefaultGameState();
      state.level = 1;
      state.xp = 0;

      expect(getLevelProgress(state)).toBe(0);
    });

    it('should return correct progress within level', () => {
      const state = getDefaultGameState();
      state.level = 1;
      state.xp = 250;

      expect(getLevelProgress(state)).toBe(50); // 250/500 = 50%
    });

    it('should return 100 at level boundary', () => {
      const state = getDefaultGameState();
      state.level = 1;
      state.xp = 500;

      expect(getLevelProgress(state)).toBe(100);
    });

    it('should work correctly for higher levels', () => {
      const state = getDefaultGameState();
      state.level = 3;
      state.xp = 1250; // 250 into level 3 (1000-1500)

      expect(getLevelProgress(state)).toBe(50);
    });
  });

  describe('achievement updates', () => {
    it('should update catch_10 achievement correctly', () => {
      let state = getDefaultGameState();
      const pokemon: Pokemon = {
        id: 1,
        name: 'Test',
        sprite: 'sprite.png',
        officialArtwork: 'art.png',
        types: ['normal'],
      };

      // Add 10 Pokemon
      for (let i = 0; i < 10; i++) {
        state = addCaughtPokemon(state, { ...pokemon, id: i + 1 });
      }

      const catch10 = state.achievements.find(a => a.id === 'catch_10');
      expect(catch10?.current).toBe(10);
      expect(catch10?.unlockedAt).toBeDefined();
    });

    it('should update level achievements correctly', () => {
      let state = getDefaultGameState();
      state.xp = 2000; // Should be level 5

      // Trigger achievement update by adding a pokemon
      const pokemon: Pokemon = {
        id: 1,
        name: 'Test',
        sprite: 'sprite.png',
        officialArtwork: 'art.png',
        types: ['normal'],
      };

      state = addCaughtPokemon(state, pokemon);

      const level5 = state.achievements.find(a => a.id === 'level_5');
      expect(level5?.current).toBe(5);
    });
  });
});
