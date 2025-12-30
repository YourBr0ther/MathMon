import { GameState, Pokemon, WorksheetResult } from '../types';
import { getDefaultGameState } from '../utils/storage';
import { profileService } from './profileService';
import { pokemonService } from './pokemonService';
import { achievementService } from './achievementService';
import { worksheetService } from './worksheetService';
import {
  addToQueue,
  removeFromQueue,
  getUserQueue,
  incrementRetryCount,
  clearQueue as clearSyncQueue,
  SyncOperation,
  ProfileUpdatePayload,
  PokemonCatchPayload,
  AchievementUpdatePayload,
  WorksheetSavePayload,
} from './syncQueue';

// Track sync state for UI updates
let isSyncing = false;
let lastSyncTime: Date | null = null;
const syncListeners: Set<() => void> = new Set();

/**
 * Subscribe to sync status changes
 */
export function subscribeSyncStatus(listener: () => void): () => void {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

/**
 * Notify all listeners of sync status change
 */
function notifySyncListeners(): void {
  syncListeners.forEach(listener => listener());
}

/**
 * Get current sync state
 */
export function getSyncState(): { isSyncing: boolean; lastSyncTime: Date | null } {
  return { isSyncing, lastSyncTime };
}

/**
 * Load full game state from Supabase
 * Returns null if any critical fetch fails (caller should fallback to localStorage)
 */
export async function loadFromCloud(userId: string): Promise<GameState | null> {
  try {
    isSyncing = true;
    notifySyncListeners();

    // Fetch all data in parallel
    const [profile, caughtPokemon, achievements, worksheetResults] = await Promise.all([
      profileService.getProfile(userId),
      pokemonService.getCaughtPokemon(userId),
      achievementService.getAchievements(userId),
      worksheetService.getCompletedWorksheets(userId),
    ]);

    // If profile doesn't exist, user data isn't in cloud yet
    if (!profile) {
      return null;
    }

    // Convert to GameState
    const gameState: GameState = {
      trainerName: profile.trainer_name || '',
      caughtPokemon: pokemonService.toAppPokemonArray(caughtPokemon),
      highestStreak: profile.highest_streak,
      totalCorrectAnswers: profile.total_correct_answers,
      totalProblemsAttempted: profile.total_problems_attempted,
      worksheetsCompleted: worksheetService.toAppWorksheetResults(worksheetResults),
      achievements: achievementService.toAppAchievements(achievements),
      currentStreak: profile.current_streak,
      lastPlayedDate: profile.last_played_date || new Date().toISOString().split('T')[0],
      xp: profile.xp,
      level: profile.level,
      dailyLoginStreak: profile.daily_login_streak,
      lastRewardClaimedDate: profile.last_reward_claimed_date || '',
      totalDaysPlayed: profile.total_days_played,
    };

    lastSyncTime = new Date();
    return gameState;
  } catch (error) {
    console.error('Error loading from cloud:', error);
    return null;
  } finally {
    isSyncing = false;
    notifySyncListeners();
  }
}

/**
 * Sync profile updates to cloud (non-blocking, queues on failure)
 */
export async function syncProfile(
  userId: string,
  updates: ProfileUpdatePayload
): Promise<void> {
  try {
    isSyncing = true;
    notifySyncListeners();

    const result = await profileService.updateProfile(userId, updates);
    if (result) {
      lastSyncTime = new Date();
    } else {
      // Queue for retry
      addToQueue('profile_update', updates, userId);
    }
  } catch (error) {
    console.error('Error syncing profile:', error);
    addToQueue('profile_update', updates, userId);
  } finally {
    isSyncing = false;
    notifySyncListeners();
  }
}

/**
 * Sync Pokemon catch to cloud (non-blocking, queues on failure)
 */
export async function syncPokemonCatch(
  userId: string,
  pokemon: Pokemon,
  problemText?: string
): Promise<void> {
  try {
    isSyncing = true;
    notifySyncListeners();

    const result = await pokemonService.catchPokemon(userId, pokemon, problemText);
    if (result) {
      lastSyncTime = new Date();
    } else {
      // Queue for retry
      addToQueue('pokemon_catch', { pokemon, problemText }, userId);
    }
  } catch (error) {
    console.error('Error syncing Pokemon catch:', error);
    addToQueue('pokemon_catch', { pokemon, problemText }, userId);
  } finally {
    isSyncing = false;
    notifySyncListeners();
  }
}

/**
 * Sync achievement progress to cloud (non-blocking, queues on failure)
 */
export async function syncAchievement(
  userId: string,
  achievementId: string,
  progress: number
): Promise<void> {
  try {
    isSyncing = true;
    notifySyncListeners();

    const result = await achievementService.updateProgress(userId, achievementId, progress);
    if (result) {
      lastSyncTime = new Date();
    } else {
      // Queue for retry
      addToQueue('achievement_update', { achievementId, progress }, userId);
    }
  } catch (error) {
    console.error('Error syncing achievement:', error);
    addToQueue('achievement_update', { achievementId, progress }, userId);
  } finally {
    isSyncing = false;
    notifySyncListeners();
  }
}

/**
 * Sync worksheet result to cloud (non-blocking, queues on failure)
 */
export async function syncWorksheet(
  userId: string,
  worksheetId: string,
  result: WorksheetResult
): Promise<void> {
  try {
    isSyncing = true;
    notifySyncListeners();

    const saveResult = await worksheetService.saveWorksheetResult(userId, worksheetId, result);
    if (saveResult) {
      lastSyncTime = new Date();
    } else {
      // Queue for retry
      addToQueue('worksheet_save', { worksheetId, result }, userId);
    }
  } catch (error) {
    console.error('Error syncing worksheet:', error);
    addToQueue('worksheet_save', { worksheetId, result }, userId);
  } finally {
    isSyncing = false;
    notifySyncListeners();
  }
}

/**
 * Process a single queued operation
 * Returns true if successful, false if should remain in queue
 */
async function processOperation(operation: SyncOperation): Promise<boolean> {
  const { type, payload, userId } = operation;

  try {
    switch (type) {
      case 'profile_update': {
        const updates = payload as ProfileUpdatePayload;
        const result = await profileService.updateProfile(userId, updates);
        return result !== null;
      }
      case 'pokemon_catch': {
        const { pokemon, problemText } = payload as PokemonCatchPayload;
        const result = await pokemonService.catchPokemon(userId, pokemon, problemText);
        return result !== null;
      }
      case 'achievement_update': {
        const { achievementId, progress } = payload as AchievementUpdatePayload;
        const result = await achievementService.updateProgress(userId, achievementId, progress);
        return result !== null;
      }
      case 'worksheet_save': {
        const { worksheetId, result } = payload as WorksheetSavePayload;
        const saveResult = await worksheetService.saveWorksheetResult(userId, worksheetId, result);
        return saveResult !== null;
      }
      default:
        console.warn('Unknown sync operation type:', type);
        return true; // Remove unknown operations
    }
  } catch (error) {
    console.error(`Error processing ${type} operation:`, error);
    return false;
  }
}

/**
 * Process all queued operations for a user
 */
export async function processQueue(userId: string): Promise<void> {
  const queue = getUserQueue(userId);
  if (queue.length === 0) return;

  isSyncing = true;
  notifySyncListeners();

  for (const operation of queue) {
    const success = await processOperation(operation);
    if (success) {
      removeFromQueue(operation.id);
    } else {
      // Increment retry count, remove if max retries exceeded
      incrementRetryCount(operation.id);
    }
  }

  lastSyncTime = new Date();
  isSyncing = false;
  notifySyncListeners();
}

/**
 * Clear sync queue (e.g., on logout)
 */
export function clearQueue(): void {
  clearSyncQueue();
  notifySyncListeners();
}

/**
 * Sync all achievements from a GameState
 * Used after state mutations that may affect multiple achievements
 */
export async function syncAllAchievements(
  userId: string,
  achievements: GameState['achievements']
): Promise<void> {
  // Sync achievements that have progress
  for (const achievement of achievements) {
    if (achievement.current > 0) {
      // Fire and forget - don't await each one
      syncAchievement(userId, achievement.id, achievement.current).catch(console.error);
    }
  }
}

/**
 * Check if currently online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}
