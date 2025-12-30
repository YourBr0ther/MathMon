import { motion } from 'framer-motion';
import { ArrowLeft, User, Gamepad2, CheckCircle, Flame, FileText, Trophy } from 'lucide-react';
import { Screen, GameState, Achievement } from '../../types';
import { IconButton } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { isAchievementUnlocked, getAchievementProgress } from '../../data/achievements';
import { calculateAccuracy, getLevelProgress, getXpForNextLevel } from '../../utils/storage';

interface ProfileProps {
  gameState: GameState;
  onNavigate: (screen: Screen) => void;
}

export function Profile({ gameState, onNavigate }: ProfileProps) {
  const accuracy = calculateAccuracy(gameState);
  const levelProgress = getLevelProgress(gameState);
  const xpNeeded = getXpForNextLevel(gameState.level);

  const unlockedAchievements = gameState.achievements.filter(a => isAchievementUnlocked(a));
  const lockedAchievements = gameState.achievements.filter(a => !isAchievementUnlocked(a));

  return (
    <div className="min-h-screen flex flex-col pb-4 sm:pb-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center py-3 sm:py-4" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        <IconButton
          icon={<ArrowLeft className="w-5 h-5 text-[#6B5B7A]" />}
          onClick={() => onNavigate('home')}
          ariaLabel="Go back"
          variant="ghost"
        />
        <h1 className="title-main text-xl sm:text-2xl ml-3 sm:ml-4">Trainer Profile</h1>
      </div>

      {/* Profile Card */}
      <div style={{ marginLeft: '16px', marginRight: '16px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card p-4 sm:p-6"
        >
          {/* Avatar & Name */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FFE082] to-[#FFCA28] flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#5D4E37]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#5D4E60]">
                {gameState.trainerName || 'Trainer'}
              </h2>
              <p className="text-[#8B7A9E] text-sm sm:text-base">Level {gameState.level} Trainer</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
              <span className="text-[#8B7A9E]">XP to next level</span>
              <span className="font-medium text-[#5D4E60]">{gameState.xp} / {xpNeeded}</span>
            </div>
            <ProgressBar
              current={levelProgress}
              max={100}
              height="medium"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <StatCard
              icon={<Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#8EC5FC]" />}
              value={gameState.totalProblemsAttempted}
              label="Solved"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#8DD99B]" />}
              value={`${accuracy}%`}
              label="Accuracy"
            />
            <StatCard
              icon={<Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />}
              value={gameState.highestStreak}
              label="Streak"
            />
            <StatCard
              icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#E0C3FC]" />}
              value={gameState.worksheetsCompleted.length}
              label="Worksheets"
            />
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <div className="mt-4 sm:mt-6" style={{ marginLeft: '16px', marginRight: '16px' }}>
        <h3 className="title-sub text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCA28]" />
          Achievements ({unlockedAchievements.length}/{gameState.achievements.length})
        </h3>

        {/* Unlocked */}
        {unlockedAchievements.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {unlockedAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <AchievementCard achievement={achievement} unlocked />
              </motion.div>
            ))}
          </div>
        )}

        {/* Locked */}
        {lockedAchievements.length > 0 && (
          <>
            <h4 className="text-[#8B7A9E] text-xs sm:text-sm mb-1.5 sm:mb-2">In Progress</h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {lockedAchievements.slice(0, 4).map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <AchievementCard achievement={achievement} unlocked={false} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="stat-card flex flex-col items-center p-2 sm:p-3">
      <span className="mb-0.5 sm:mb-1">{icon}</span>
      <p className="stat-value text-lg sm:text-xl">{value}</p>
      <p className="stat-label text-[10px] sm:text-xs">{label}</p>
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
}

function AchievementCard({ achievement, unlocked }: AchievementCardProps) {
  const progress = getAchievementProgress(achievement);

  return (
    <div className={`
      achievement-card p-2.5 sm:p-3
      ${unlocked ? 'achievement-unlocked' : 'opacity-80'}
    `}>
      <div className="flex items-start gap-1.5 sm:gap-2">
        <span className={`text-xl sm:text-2xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className={`font-display font-bold text-xs sm:text-sm truncate ${unlocked ? 'text-[#5D4E60]' : 'text-[#8B7A9E]'}`}>
            {achievement.name}
          </h4>
          <p className="text-[10px] sm:text-xs text-[#8B7A9E] truncate">
            {achievement.description}
          </p>
          {!unlocked && (
            <div className="mt-1.5 sm:mt-2">
              <div className="h-1 sm:h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFADC6] to-[#FFE082] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-[#8B7A9E] mt-0.5 sm:mt-1">
                {achievement.current}/{achievement.requirement}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
