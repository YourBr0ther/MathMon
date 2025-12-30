import { GameState, Pokemon, Achievement, WorksheetResult } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

export const OFFLINE_KEY = 'mathmon_offline_state';
export const USER_STATE_KEY_PREFIX = 'mathmon_game_state_';

function getStorageKey(userId?: string): string {
  // Treat empty string as no userId
  return userId && userId.trim() ? `${USER_STATE_KEY_PREFIX}${userId}` : OFFLINE_KEY;
}

// Default game state for new players
export function getDefaultGameState(): GameState {
  return {
    trainerName: '',
    caughtPokemon: [],
    highestStreak: 0,
    totalCorrectAnswers: 0,
    totalProblemsAttempted: 0,
    worksheetsCompleted: [],
    achievements: ACHIEVEMENTS.map(a => ({ ...a, current: 0 })),
    currentStreak: 0,
    lastPlayedDate: new Date().toISOString().split('T')[0],
    xp: 0,
    level: 1,
    // Daily rewards
    dailyLoginStreak: 0,
    lastRewardClaimedDate: '',
    totalDaysPlayed: 0,
  };
}

// Load game state from localStorage
export function loadGameState(userId?: string): GameState {
  try {
    const saved = localStorage.getItem(getStorageKey(userId));
    if (saved) {
      const parsed = JSON.parse(saved) as GameState;
      // Merge with default achievements in case new ones were added
      const existingAchievementIds = new Set(parsed.achievements.map(a => a.id));
      const newAchievements = ACHIEVEMENTS
        .filter(a => !existingAchievementIds.has(a.id))
        .map(a => ({ ...a, current: 0 }));
      parsed.achievements = [...parsed.achievements, ...newAchievements];
      return parsed;
    }
  } catch (error) {
    console.error('Error loading game state:', error);
  }
  return getDefaultGameState();
}

// Save game state to localStorage
export function saveGameState(state: GameState, userId?: string): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

// Add a caught Pokemon
export function addCaughtPokemon(state: GameState, pokemon: Pokemon, problemText?: string): GameState {
  const caughtPokemon: Pokemon = {
    ...pokemon,
    caughtAt: new Date(),
    caughtWithProblem: problemText,
  };

  const newState = {
    ...state,
    caughtPokemon: [...state.caughtPokemon, caughtPokemon],
    xp: state.xp + 50, // 50 XP per catch
  };

  // Check for level up (every 500 XP)
  const newLevel = Math.floor(newState.xp / 500) + 1;
  if (newLevel > state.level) {
    newState.level = newLevel;
  }

  // Update achievements
  newState.achievements = updateAchievements(newState);

  return newState;
}

// Update streak
export function updateStreak(state: GameState, newStreak: number): GameState {
  const newState = {
    ...state,
    currentStreak: newStreak,
    highestStreak: Math.max(state.highestStreak, newStreak),
  };

  // Update achievements
  newState.achievements = updateAchievements(newState);

  return newState;
}

// Record answer
export function recordAnswer(state: GameState, correct: boolean): GameState {
  const newState = {
    ...state,
    totalProblemsAttempted: state.totalProblemsAttempted + 1,
    totalCorrectAnswers: correct ? state.totalCorrectAnswers + 1 : state.totalCorrectAnswers,
    xp: correct ? state.xp + 10 : state.xp, // 10 XP per correct answer
  };

  // Check for level up
  const newLevel = Math.floor(newState.xp / 500) + 1;
  if (newLevel > state.level) {
    newState.level = newLevel;
  }

  return newState;
}

// Complete a worksheet
export function completeWorksheet(state: GameState, result: WorksheetResult): GameState {
  const newState = {
    ...state,
    worksheetsCompleted: [...state.worksheetsCompleted, result],
    xp: state.xp + (result.stars * 50), // 50 XP per star
  };

  // Check for level up
  const newLevel = Math.floor(newState.xp / 500) + 1;
  if (newLevel > state.level) {
    newState.level = newLevel;
  }

  // Update achievements
  newState.achievements = updateAchievements(newState);

  return newState;
}

// Set trainer name
export function setTrainerName(state: GameState, name: string): GameState {
  return {
    ...state,
    trainerName: name,
  };
}

// Update achievements based on current state
function updateAchievements(state: GameState): Achievement[] {
  return state.achievements.map(achievement => {
    let current = achievement.current;

    switch (achievement.id) {
      case 'first_catch':
        current = state.caughtPokemon.length > 0 ? 1 : 0;
        break;
      case 'catch_10':
      case 'catch_50':
      case 'catch_100':
        current = state.caughtPokemon.length;
        break;
      case 'streak_5':
      case 'streak_10':
      case 'streak_25':
      case 'streak_50':
        current = state.highestStreak;
        break;
      case 'worksheet_1':
      case 'worksheet_5':
      case 'worksheet_10':
        current = state.worksheetsCompleted.length;
        break;
      case 'perfect_worksheet':
        current = state.worksheetsCompleted.filter(w => w.stars === 3).length;
        break;
      case 'level_5':
      case 'level_10':
        current = state.level;
        break;
      case 'correct_100':
      case 'correct_500':
        current = state.totalCorrectAnswers;
        break;
    }

    const isUnlocked = current >= achievement.requirement;
    return {
      ...achievement,
      current,
      unlockedAt: isUnlocked && !achievement.unlockedAt ? new Date() : achievement.unlockedAt,
    };
  });
}

// Check if it's a new day (for daily rewards)
export function isNewDay(state: GameState): boolean {
  const today = new Date().toISOString().split('T')[0];
  return state.lastPlayedDate !== today;
}

// Update last played date
export function updateLastPlayedDate(state: GameState): GameState {
  return {
    ...state,
    lastPlayedDate: new Date().toISOString().split('T')[0],
  };
}

// Reset game (for testing)
export function resetGame(userId?: string): void {
  localStorage.removeItem(getStorageKey(userId));
}

// Calculate accuracy percentage
export function calculateAccuracy(state: GameState): number {
  if (state.totalProblemsAttempted === 0) return 0;
  return Math.round((state.totalCorrectAnswers / state.totalProblemsAttempted) * 100);
}

// Get XP needed for next level
export function getXpForNextLevel(level: number): number {
  return level * 500;
}

// Get current level progress (0-100)
export function getLevelProgress(state: GameState): number {
  const xpForCurrentLevel = (state.level - 1) * 500;
  const xpForNextLevel = state.level * 500;
  const xpInCurrentLevel = state.xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  return Math.round((xpInCurrentLevel / xpNeeded) * 100);
}

// Check if daily reward can be claimed
export function canClaimDailyReward(state: GameState): boolean {
  const today = new Date().toISOString().split('T')[0];
  return state.lastRewardClaimedDate !== today;
}

// Check if streak should continue (claimed yesterday) or reset
export function shouldContinueStreak(lastClaimedDate: string): boolean {
  if (!lastClaimedDate) return false;

  const today = new Date();
  const lastClaimed = new Date(lastClaimedDate);

  // Reset time to midnight for comparison
  today.setHours(0, 0, 0, 0);
  lastClaimed.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastClaimed.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // Streak continues if claimed yesterday (1 day ago)
  return diffDays === 1;
}

// Claim daily reward
export function claimDailyReward(state: GameState, xpBonus: number): GameState {
  const today = new Date().toISOString().split('T')[0];

  // Determine if streak continues or resets
  const streakContinues = shouldContinueStreak(state.lastRewardClaimedDate);
  const newStreak = streakContinues ? state.dailyLoginStreak + 1 : 1;

  const newXp = state.xp + xpBonus;
  const newLevel = Math.floor(newXp / 500) + 1;

  const newState = {
    ...state,
    dailyLoginStreak: newStreak,
    lastRewardClaimedDate: today,
    totalDaysPlayed: state.totalDaysPlayed + 1,
    xp: newXp,
    level: Math.max(state.level, newLevel),
  };

  // Update achievements
  newState.achievements = updateAchievements(newState);

  return newState;
}

// Get current daily streak day (1-7, cycles)
export function getCurrentStreakDay(state: GameState): number {
  if (!state.lastRewardClaimedDate) return 1;

  const streakContinues = shouldContinueStreak(state.lastRewardClaimedDate);
  if (!streakContinues) return 1;

  return ((state.dailyLoginStreak) % 7) + 1;
}
