import { useState, useEffect, useCallback } from 'react';
import { GameState, Pokemon, WorksheetResult, DailyReward } from '../types';
import {
  loadGameState,
  saveGameState,
  getDefaultGameState,
  addCaughtPokemon,
  updateStreak,
  recordAnswer,
  completeWorksheet,
  setTrainerName as setTrainerNameInState,
  isNewDay,
  updateLastPlayedDate,
  calculateAccuracy,
  getLevelProgress,
  canClaimDailyReward,
  claimDailyReward as claimDailyRewardInState,
  getCurrentStreakDay,
} from '../utils/storage';
import * as cloudSync from '../services/cloudSync';

export function useGameState(userId?: string) {
  const [gameState, setGameState] = useState<GameState>(getDefaultGameState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load game state on mount or when userId changes
  // Cloud-first: try Supabase, fallback to localStorage
  useEffect(() => {
    const loadState = async () => {
      // Prevent saves during load by temporarily marking as not loaded
      setIsLoaded(false);

      if (userId) {
        // Try cloud first for logged-in users
        const cloudState = await cloudSync.loadFromCloud(userId);
        if (cloudState) {
          setGameState(cloudState);
          saveGameState(cloudState, userId); // Cache locally
          // Process any queued operations
          cloudSync.processQueue(userId);
          setIsLoaded(true);
          return;
        }
      }

      // Fallback to localStorage (or for offline mode)
      const loaded = loadGameState(userId);
      setGameState(loaded);

      // Check for new day
      if (isNewDay(loaded)) {
        const updated = updateLastPlayedDate(loaded);
        setGameState(updated);
        saveGameState(updated, userId);
      }

      // Re-enable saves after load is complete
      setIsLoaded(true);
    };

    loadState();
  }, [userId]);

  // Save game state whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveGameState(gameState, userId);
    }
  }, [gameState, isLoaded, userId]);

  // Process queue when coming back online
  useEffect(() => {
    if (!userId) return;

    const handleOnline = () => {
      cloudSync.processQueue(userId);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [userId]);

  // Catch a Pokemon
  const catchPokemon = useCallback((pokemon: Pokemon, problemText?: string) => {
    setGameState(prev => {
      const newState = addCaughtPokemon(prev, pokemon, problemText);

      // Sync to cloud
      if (userId) {
        cloudSync.syncPokemonCatch(userId, pokemon, problemText);
        cloudSync.syncProfile(userId, {
          xp: newState.xp,
          level: newState.level,
        });
        cloudSync.syncAllAchievements(userId, newState.achievements);
      }

      return newState;
    });
  }, [userId]);

  // Update current streak
  const setCurrentStreak = useCallback((streak: number) => {
    setGameState(prev => {
      const newState = updateStreak(prev, streak);

      // Sync to cloud
      if (userId) {
        cloudSync.syncProfile(userId, {
          current_streak: newState.currentStreak,
          highest_streak: newState.highestStreak,
        });
        cloudSync.syncAllAchievements(userId, newState.achievements);
      }

      return newState;
    });
  }, [userId]);

  // Record an answer (correct or wrong)
  const recordAnswerResult = useCallback((correct: boolean) => {
    setGameState(prev => {
      const newState = recordAnswer(prev, correct);

      // Sync to cloud
      if (userId) {
        cloudSync.syncProfile(userId, {
          total_correct_answers: newState.totalCorrectAnswers,
          total_problems_attempted: newState.totalProblemsAttempted,
          xp: newState.xp,
          level: newState.level,
        });
      }

      return newState;
    });
  }, [userId]);

  // Complete a worksheet
  const completeWorksheetResult = useCallback((result: WorksheetResult) => {
    setGameState(prev => {
      const newState = completeWorksheet(prev, result);

      // Sync to cloud
      if (userId) {
        cloudSync.syncWorksheet(userId, result.worksheetId, result);
        cloudSync.syncProfile(userId, {
          xp: newState.xp,
          level: newState.level,
        });
        cloudSync.syncAllAchievements(userId, newState.achievements);
      }

      return newState;
    });
  }, [userId]);

  // Set trainer name
  const setTrainerName = useCallback((name: string) => {
    setGameState(prev => {
      const newState = setTrainerNameInState(prev, name);

      // Sync to cloud
      if (userId) {
        cloudSync.syncProfile(userId, {
          trainer_name: name,
        });
      }

      return newState;
    });
  }, [userId]);

  // Reset streak (when game over)
  const resetStreak = useCallback(() => {
    setGameState(prev => {
      const newState = {
        ...prev,
        currentStreak: 0,
      };

      // Sync to cloud
      if (userId) {
        cloudSync.syncProfile(userId, {
          current_streak: 0,
        });
      }

      return newState;
    });
  }, [userId]);

  // Check if Pokemon is already caught
  const isPokemonCaught = useCallback((pokemonId: number) => {
    return gameState.caughtPokemon.some(p => p.id === pokemonId);
  }, [gameState.caughtPokemon]);

  // Get count of unique Pokemon caught
  const getUniquePokemonCount = useCallback(() => {
    const uniqueIds = new Set(gameState.caughtPokemon.map(p => p.id));
    return uniqueIds.size;
  }, [gameState.caughtPokemon]);

  // Get accuracy
  const accuracy = calculateAccuracy(gameState);

  // Get level progress
  const levelProgress = getLevelProgress(gameState);

  // Daily reward functions
  const canClaimReward = canClaimDailyReward(gameState);
  const currentStreakDay = getCurrentStreakDay(gameState);

  const claimDailyReward = useCallback((reward: DailyReward) => {
    setGameState(prev => {
      const newState = claimDailyRewardInState(prev, reward.xpBonus);

      // Sync to cloud
      if (userId) {
        cloudSync.syncProfile(userId, {
          xp: newState.xp,
          level: newState.level,
          daily_login_streak: newState.dailyLoginStreak,
          last_reward_claimed_date: newState.lastRewardClaimedDate || null,
          total_days_played: newState.totalDaysPlayed,
        });
        cloudSync.syncAllAchievements(userId, newState.achievements);
      }

      return newState;
    });
  }, [userId]);

  return {
    gameState,
    isLoaded,
    catchPokemon,
    setCurrentStreak,
    recordAnswerResult,
    completeWorksheetResult,
    setTrainerName,
    resetStreak,
    isPokemonCaught,
    getUniquePokemonCount,
    accuracy,
    levelProgress,
    // Daily rewards
    canClaimReward,
    currentStreakDay,
    claimDailyReward,
  };
}
