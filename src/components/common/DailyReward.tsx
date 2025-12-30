import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Star, X } from 'lucide-react';
import { DailyReward as DailyRewardType } from '../../types';
import { getDailyReward, getWeekRewards, getStreakMultiplier } from '../../data/dailyRewards';
import { Button } from './Button';

interface DailyRewardProps {
  currentStreakDay: number;
  onClaim: (reward: DailyRewardType) => void;
  onClose: () => void;
}

export function DailyRewardModal({ currentStreakDay, onClaim, onClose }: DailyRewardProps) {
  const [claimed, setClaimed] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const todayReward = getDailyReward(currentStreakDay);
  const weekRewards = getWeekRewards();
  const streakMultiplier = getStreakMultiplier(currentStreakDay);
  const totalXp = Math.round(todayReward.xpBonus * streakMultiplier);

  const handleClaim = () => {
    setClaimed(true);
    setShowSparkles(true);
    setTimeout(() => {
      onClaim({ ...todayReward, xpBonus: totalXp });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="game-card p-5 sm:p-6 w-full max-w-sm relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
        >
          <X className="w-4 h-4 text-[#8B7A9E]" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: claimed ? 0 : Infinity, repeatDelay: 2 }}
          >
            <Gift className="w-12 h-12 mx-auto text-[#FFADC6] mb-2" />
          </motion.div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#5D4E60]">
            Daily Reward!
          </h2>
          <p className="text-[#8B7A9E] text-sm mt-1">
            Day {currentStreakDay} streak bonus!
          </p>
        </div>

        {/* Week Progress */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mb-4">
          {weekRewards.map((reward, index) => {
            const dayNum = index + 1;
            const isPast = dayNum < currentStreakDay;
            const isCurrent = dayNum === currentStreakDay;
            const isFuture = dayNum > currentStreakDay;

            return (
              <motion.div
                key={dayNum}
                className={`
                  w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg
                  ${isPast ? 'bg-[#8DD99B]/30 border-2 border-[#8DD99B]' : ''}
                  ${isCurrent ? 'bg-gradient-to-br from-[#FFCA28] to-[#FFE082] border-2 border-[#FFCA28] shadow-lg' : ''}
                  ${isFuture ? 'bg-white/50 border-2 border-[#E0C3FC]/30' : ''}
                `}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {isPast ? '✓' : reward.icon}
              </motion.div>
            );
          })}
        </div>

        {/* Today's Reward */}
        <div className="card-soft p-4 mb-4 text-center relative">
          {/* Sparkle effects when claimed */}
          <AnimatePresence>
            {showSparkles && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                      opacity: 1
                    }}
                    animate={{
                      x: `${50 + (Math.cos(i * 45 * Math.PI / 180) * 60)}%`,
                      y: `${50 + (Math.sin(i * 45 * Math.PI / 180) * 60)}%`,
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    <Sparkles className="w-4 h-4 text-[#FFCA28]" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>

          <motion.span
            className="text-4xl sm:text-5xl block mb-2"
            animate={claimed ? { scale: [1, 1.3, 1], rotate: [0, 360] } : {}}
            transition={{ duration: 0.5 }}
          >
            {todayReward.icon}
          </motion.span>

          <p className="font-display font-bold text-[#5D4E60] text-lg">
            {todayReward.description}
          </p>

          <div className="flex items-center justify-center gap-2 mt-2">
            <Star className="w-5 h-5 text-[#FFCA28] fill-[#FFCA28]" />
            <span className="font-display font-bold text-[#8EC5FC] text-xl">
              +{totalXp} XP
            </span>
          </div>

          {streakMultiplier > 1 && (
            <p className="text-xs text-[#8B7A9E] mt-1">
              ({todayReward.xpBonus} base + {Math.round((streakMultiplier - 1) * 100)}% streak bonus)
            </p>
          )}

          {todayReward.pokemonBonus && (
            <div className="mt-2 px-3 py-1.5 bg-[#E0C3FC]/30 rounded-full inline-block">
              <span className="text-xs font-medium text-[#8B7A9E]">
                + Free Pokemon encounter!
              </span>
            </div>
          )}

          {todayReward.specialReward === 'rare_pokemon' && (
            <div className="mt-2 px-3 py-1.5 bg-[#8EC5FC]/30 rounded-full inline-block">
              <span className="text-xs font-medium text-[#5D4E60]">
                + Rare Pokemon chance!
              </span>
            </div>
          )}

          {todayReward.specialReward === 'legendary_chance' && (
            <div className="mt-2 px-3 py-1.5 bg-[#FFE082]/50 rounded-full inline-block">
              <span className="text-xs font-medium text-[#5D4E60]">
                + Legendary chance!
              </span>
            </div>
          )}
        </div>

        {/* Claim Button */}
        <Button
          onClick={handleClaim}
          disabled={claimed}
          fullWidth
          size="large"
        >
          <span className="flex items-center justify-center gap-2">
            {claimed ? (
              <>
                <Sparkles className="w-5 h-5" />
                Claimed!
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                Claim Reward
              </>
            )}
          </span>
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Small indicator to show daily reward is available
interface DailyRewardIndicatorProps {
  onClick: () => void;
}

export function DailyRewardIndicator({ onClick }: DailyRewardIndicatorProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-gradient-to-br from-[#FFCA28] to-[#FFE082] shadow-lg"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, -5, 5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      <Gift className="w-6 h-6 text-white" />
      <motion.span
        className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B6B] rounded-full flex items-center justify-center"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <span className="text-white text-[10px] font-bold">!</span>
      </motion.span>
    </motion.button>
  );
}
