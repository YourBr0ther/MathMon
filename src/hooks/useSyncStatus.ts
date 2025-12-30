import { useState, useEffect, useSyncExternalStore } from 'react';
import { subscribeSyncStatus, getSyncState, isOnline } from '../services/cloudSync';
import { getPendingCount } from '../services/syncQueue';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
}

/**
 * Hook to get reactive sync status for UI components
 */
export function useSyncStatus(): SyncStatus {
  const [onlineStatus, setOnlineStatus] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(getPendingCount());

  // Subscribe to sync state changes using useSyncExternalStore
  const syncState = useSyncExternalStore(
    subscribeSyncStatus,
    getSyncState,
    getSyncState // Server snapshot (same as client for this use case)
  );

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending count when sync state changes
  useEffect(() => {
    setPendingCount(getPendingCount());
  }, [syncState.isSyncing]);

  return {
    isOnline: onlineStatus,
    isSyncing: syncState.isSyncing,
    pendingCount,
    lastSyncTime: syncState.lastSyncTime,
  };
}
