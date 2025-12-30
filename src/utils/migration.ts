import { GameState } from '../types';
import { profileService } from '../services/profileService';
import { pokemonService } from '../services/pokemonService';
import { achievementService } from '../services/achievementService';
import { worksheetService } from '../services/worksheetService';
import { OFFLINE_KEY, USER_STATE_KEY_PREFIX } from './storage';

const LEGACY_GAME_STATE_KEY = 'mathmon_game_state';
const MIGRATION_KEY = 'mathmon_migrated_to_supabase';

/**
 * Check if there is localStorage data to migrate
 */
export function hasLocalStorageData(): boolean {
  try {
    // Check legacy key
    const legacyData = localStorage.getItem(LEGACY_GAME_STATE_KEY);
    if (legacyData !== null && legacyData.length > 0) {
      return true;
    }
    // Check offline key
    const offlineData = localStorage.getItem(OFFLINE_KEY);
    return offlineData !== null && offlineData.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check if migration has already been completed
 */
export function hasMigrated(): boolean {
  try {
    return localStorage.getItem(MIGRATION_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark migration as complete
 */
function markMigrationComplete(): void {
  try {
    localStorage.setItem(MIGRATION_KEY, 'true');
  } catch {
    console.error('Could not mark migration complete');
  }
}

/**
 * Load game state from localStorage (checks legacy and offline keys)
 */
function loadLocalGameState(): GameState | null {
  try {
    // Try legacy key first
    let saved = localStorage.getItem(LEGACY_GAME_STATE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameState;
    }
    // Fall back to offline key
    saved = localStorage.getItem(OFFLINE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameState;
    }
  } catch (error) {
    console.error('Error loading local game state:', error);
  }
  return null;
}

/**
 * Migrate localStorage data to Supabase
 * This should be called after a user signs up or logs in
 */
export async function migrateLocalStorageToSupabase(userId: string): Promise<{
  success: boolean;
  message: string;
  stats?: {
    pokemon: number;
    achievements: number;
    worksheets: number;
  };
}> {
  // Check if already migrated
  if (hasMigrated()) {
    return { success: true, message: 'Already migrated' };
  }

  // Check if there's data to migrate
  if (!hasLocalStorageData()) {
    return { success: true, message: 'No local data to migrate' };
  }

  const gameState = loadLocalGameState();
  if (!gameState) {
    return { success: false, message: 'Failed to load local game state' };
  }

  try {
    // 1. Migrate profile data
    const profileUpdate = await profileService.updateProfile(userId, {
      trainer_name: gameState.trainerName || '',
      xp: gameState.xp,
      level: gameState.level,
      highest_streak: gameState.highestStreak,
      current_streak: gameState.currentStreak,
      total_correct_answers: gameState.totalCorrectAnswers,
      total_problems_attempted: gameState.totalProblemsAttempted,
      daily_login_streak: gameState.dailyLoginStreak,
      last_reward_claimed_date: gameState.lastRewardClaimedDate || null,
      total_days_played: gameState.totalDaysPlayed,
      last_played_date: gameState.lastPlayedDate,
    });

    if (!profileUpdate) {
      console.error('Failed to migrate profile');
    }

    // 2. Migrate caught Pokemon
    let pokemonCount = 0;
    for (const pokemon of gameState.caughtPokemon) {
      const result = await pokemonService.catchPokemon(
        userId,
        pokemon,
        pokemon.caughtWithProblem
      );
      if (result) pokemonCount++;
    }

    // 3. Migrate achievements
    let achievementCount = 0;
    for (const achievement of gameState.achievements) {
      const result = await achievementService.updateProgress(
        userId,
        achievement.id,
        achievement.current
      );
      if (result) achievementCount++;
    }

    // 4. Migrate worksheet results
    let worksheetCount = 0;
    for (const worksheet of gameState.worksheetsCompleted) {
      const result = await worksheetService.saveWorksheetResult(
        userId,
        worksheet.worksheetId,
        worksheet
      );
      if (result) worksheetCount++;
    }

    // Mark migration as complete
    markMigrationComplete();

    // Optionally clear localStorage (keep it as backup for now)
    // localStorage.removeItem(GAME_STATE_KEY);

    return {
      success: true,
      message: 'Migration complete!',
      stats: {
        pokemon: pokemonCount,
        achievements: achievementCount,
        worksheets: worksheetCount,
      },
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Reset migration status (for testing)
 */
export function resetMigrationStatus(): void {
  localStorage.removeItem(MIGRATION_KEY);
}

/**
 * Clear all localStorage data after successful cloud sync
 * Only call this after confirming data is safely in Supabase
 */
export function clearLocalData(): void {
  // Clear legacy key
  localStorage.removeItem(LEGACY_GAME_STATE_KEY);
  localStorage.removeItem(MIGRATION_KEY);

  // Clear offline key
  localStorage.removeItem(OFFLINE_KEY);

  // Clear all user-scoped game state keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(USER_STATE_KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
