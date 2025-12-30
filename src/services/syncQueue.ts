import { Pokemon, WorksheetResult } from '../types';

const SYNC_QUEUE_KEY = 'mathmon_sync_queue';
const MAX_RETRY_COUNT = 5;

export type SyncOperationType =
  | 'profile_update'
  | 'pokemon_catch'
  | 'achievement_update'
  | 'worksheet_save';

export interface ProfileUpdatePayload {
  trainer_name?: string;
  xp?: number;
  level?: number;
  highest_streak?: number;
  current_streak?: number;
  total_correct_answers?: number;
  total_problems_attempted?: number;
  daily_login_streak?: number;
  last_reward_claimed_date?: string | null;
  total_days_played?: number;
  last_played_date?: string;
}

export interface PokemonCatchPayload {
  pokemon: Pokemon;
  problemText?: string;
}

export interface AchievementUpdatePayload {
  achievementId: string;
  progress: number;
}

export interface WorksheetSavePayload {
  worksheetId: string;
  result: WorksheetResult;
}

export type SyncPayload =
  | ProfileUpdatePayload
  | PokemonCatchPayload
  | AchievementUpdatePayload
  | WorksheetSavePayload;

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  payload: SyncPayload;
  userId: string;
  timestamp: number;
  retryCount: number;
}

/**
 * Generate a unique ID for sync operations
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Load sync queue from localStorage
 */
export function getQueue(): SyncOperation[] {
  try {
    const saved = localStorage.getItem(SYNC_QUEUE_KEY);
    if (saved) {
      return JSON.parse(saved) as SyncOperation[];
    }
  } catch (error) {
    console.error('Error loading sync queue:', error);
  }
  return [];
}

/**
 * Save sync queue to localStorage
 */
function saveQueue(queue: SyncOperation[]): void {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving sync queue:', error);
  }
}

/**
 * Add an operation to the sync queue
 */
export function addToQueue(
  type: SyncOperationType,
  payload: SyncPayload,
  userId: string
): SyncOperation {
  const operation: SyncOperation = {
    id: generateId(),
    type,
    payload,
    userId,
    timestamp: Date.now(),
    retryCount: 0,
  };

  const queue = getQueue();
  queue.push(operation);
  saveQueue(queue);

  return operation;
}

/**
 * Remove an operation from the queue by ID
 */
export function removeFromQueue(id: string): void {
  const queue = getQueue();
  const filtered = queue.filter(op => op.id !== id);
  saveQueue(filtered);
}

/**
 * Increment retry count for an operation
 * Returns true if operation should be retried, false if max retries exceeded
 */
export function incrementRetryCount(id: string): boolean {
  const queue = getQueue();
  const operation = queue.find(op => op.id === id);

  if (!operation) return false;

  operation.retryCount++;

  if (operation.retryCount > MAX_RETRY_COUNT) {
    // Remove operation if max retries exceeded
    const filtered = queue.filter(op => op.id !== id);
    saveQueue(filtered);
    console.warn(`Sync operation ${id} exceeded max retries and was removed`);
    return false;
  }

  saveQueue(queue);
  return true;
}

/**
 * Get pending operations for a specific user
 */
export function getUserQueue(userId: string): SyncOperation[] {
  return getQueue().filter(op => op.userId === userId);
}

/**
 * Get count of pending operations
 */
export function getPendingCount(): number {
  return getQueue().length;
}

/**
 * Clear all queued operations (e.g., on logout)
 */
export function clearQueue(): void {
  try {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
}

/**
 * Clear queued operations for a specific user
 */
export function clearUserQueue(userId: string): void {
  const queue = getQueue();
  const filtered = queue.filter(op => op.userId !== userId);
  saveQueue(filtered);
}
