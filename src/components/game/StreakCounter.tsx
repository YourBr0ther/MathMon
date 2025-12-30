import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Crown, Zap, Gem, Star, Trophy } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  highestStreak: number;
}

export function StreakCounter({ streak, highestStreak }: StreakCounterProps) {
  const isOnFire = streak >= 5;

  return (
    <div className="flex items-center gap-3">
      {/* Current Streak */}
      <motion.div
        className={`streak-badge ${isOnFire ? 'streak-on-fire' : ''}`}
        animate={isOnFire ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={streak}
              initial={{ scale: 0, y: -15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 15 }}
              className="streak-number font-display text-xl font-bold text-[#5D4E60]"
            >
              {streak}
            </motion.span>
          </AnimatePresence>
          <span className="text-sm font-medium text-[#8B7A9E]">
            streak
          </span>
          {isOnFire && (
            <motion.span
              animate={{ rotate: [0, 10, -10, 0], y: [0, -2, 0] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            >
              <Flame className="w-5 h-5 text-orange-500 fill-orange-400" />
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Highest Streak */}
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/60 backdrop-blur border border-white/80">
        <Crown className="w-4 h-4 text-[#FFCA28] fill-[#FFCA28]" />
        <span className="text-sm font-bold text-[#8B7A9E]">{highestStreak}</span>
      </div>
    </div>
  );
}

interface StreakMilestoneProps {
  streak: number;
  isVisible: boolean;
}

export function StreakMilestone({ streak, isVisible }: StreakMilestoneProps) {
  const milestones: Record<number, { icon: React.ReactNode; text: string; color: string }> = {
    5: { icon: <Flame className="w-10 h-10 text-orange-500 fill-orange-400" />, text: 'On Fire!', color: 'from-[#FFCA28] to-[#FFE082]' },
    10: { icon: <Zap className="w-10 h-10 text-yellow-500 fill-yellow-400" />, text: 'Super Streak!', color: 'from-[#8EC5FC] to-[#E0C3FC]' },
    25: { icon: <Gem className="w-10 h-10 text-cyan-500" />, text: 'Amazing!', color: 'from-[#A8EDEA] to-[#FFADC6]' },
    50: { icon: <Star className="w-10 h-10 text-yellow-400 fill-yellow-300" />, text: 'LEGENDARY!', color: 'from-[#FFADC6] to-[#E0C3FC]' },
    100: { icon: <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-400" />, text: 'UNSTOPPABLE!', color: 'from-[#FFE082] to-[#FFADC6]' },
  };

  const milestone = milestones[streak];
  if (!milestone) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: -50 }}
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            className={`bg-gradient-to-r ${milestone.color} px-10 py-5 rounded-3xl shadow-2xl border-4 border-white/50`}
            animate={{ rotate: [-2, 2, -2], scale: [1, 1.05, 1] }}
            transition={{ duration: 0.25, repeat: 4 }}
          >
            <div className="flex items-center gap-4">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
              >
                {milestone.icon}
              </motion.span>
              <div>
                <p className="font-display text-2xl font-bold text-[#5D4E60]">{milestone.text}</p>
                <p className="text-[#8B7A9E] font-medium">{streak} in a row!</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
