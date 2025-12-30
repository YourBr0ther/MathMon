import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  max: number;
  color?: string;
  height?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  current,
  max,
  height = 'medium',
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  const heights = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4',
  };

  return (
    <div className="w-full">
      <div className={`progress-bar-kawaii ${heights[height]}`}>
        <motion.div
          className="progress-bar-fill"
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-[#8B7A9E] text-center font-medium">
          {current} / {max}
        </div>
      )}
    </div>
  );
}

interface CatchProgressProps {
  correctCount: number;
  maxCount?: number;
}

export function CatchProgress({ correctCount, maxCount = 5 }: CatchProgressProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: maxCount }).map((_, i) => (
        <motion.div
          key={i}
          className={`progress-dot ${i < correctCount ? 'progress-dot-filled' : ''}`}
          initial={i < correctCount ? { scale: 0 } : {}}
          animate={i < correctCount ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        />
      ))}
    </div>
  );
}
