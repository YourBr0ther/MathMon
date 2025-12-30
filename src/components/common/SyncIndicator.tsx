import { motion } from 'framer-motion';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '../../hooks/useSyncStatus';

interface SyncIndicatorProps {
  className?: string;
}

export function SyncIndicator({ className = '' }: SyncIndicatorProps) {
  const { isOnline, isSyncing, pendingCount } = useSyncStatus();

  // Determine icon and status text
  let icon: React.ReactNode;
  let statusText: string;
  let statusColor: string;

  if (!isOnline) {
    icon = <CloudOff className="w-4 h-4 text-gray-400" />;
    statusText = 'Offline';
    statusColor = 'text-gray-400';
  } else if (isSyncing) {
    icon = (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <RefreshCw className="w-4 h-4 text-[#8EC5FC]" />
      </motion.div>
    );
    statusText = 'Syncing...';
    statusColor = 'text-[#8EC5FC]';
  } else if (pendingCount > 0) {
    icon = (
      <div className="relative">
        <Cloud className="w-4 h-4 text-yellow-400" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full text-[8px] font-bold text-gray-800 flex items-center justify-center">
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      </div>
    );
    statusText = 'Pending';
    statusColor = 'text-yellow-400';
  } else {
    icon = <Cloud className="w-4 h-4 text-[#8EC5FC]" />;
    statusText = 'Synced';
    statusColor = 'text-[#8B7A9E]';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`nav-btn flex items-center gap-1.5 px-3 ${className}`}
      title={
        !isOnline
          ? 'You are offline - changes will sync when you reconnect'
          : isSyncing
          ? 'Syncing your data to the cloud...'
          : pendingCount > 0
          ? `${pendingCount} changes waiting to sync`
          : 'All changes synced to cloud'
      }
    >
      {icon}
      <span className={`text-xs hidden sm:inline ${statusColor}`}>
        {statusText}
      </span>
    </motion.div>
  );
}
