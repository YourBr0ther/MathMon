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

export function useGameState(userId?: string) {
  const [gameState, setGameState] = useState<GameState>(getDefaultGameState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load game state on mount or when userId changes
  useEffect(() => {
    // Prevent saves during load by temporarily marking as not loaded
    setIsLoaded(false);

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
  }, [userId]);

  // Save game state whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveGameState(gameState, userId);
    }
  }, [gameState, isLoaded, userId]);

  // Catch a Pokemon
  const catchPokemon = useCallback((pokemon: Pokemon, problemText?: string) => {
    setGameState(prev => addCaughtPokemon(prev, pokemon, problemText));
  }, []);

  // Update current streak
  const setCurrentStreak = useCallback((streak: number) => {
    setGameState(prev => updateStreak(prev, streak));
  }, []);

  // Record an answer (correct or wrong)
  const recordAnswerResult = useCallback((correct: boolean) => {
    setGameState(prev => recordAnswer(prev, correct));
  }, []);

  // Complete a worksheet
  const completeWorksheetResult = useCallback((result: WorksheetResult) => {
    setGameState(prev => completeWorksheet(prev, result));
  }, []);

  // Set trainer name
  const setTrainerName = useCallback((name: string) => {
    setGameState(prev => setTrainerNameInState(prev, name));
  }, []);

  // Reset streak (when game over)
  const resetStreak = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentStreak: 0,
    }));
  }, []);

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
    setGameState(prev => claimDailyRewardInState(prev, reward.xpBonus));
  }, []);

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
