import { DailyReward } from '../types';

// 7-day reward cycle that repeats
export const DAILY_REWARDS: DailyReward[] = [
  {
    day: 1,
    xpBonus: 50,
    pokemonBonus: false,
    icon: '🌟',
    description: 'Welcome back bonus!',
  },
  {
    day: 2,
    xpBonus: 75,
    pokemonBonus: false,
    icon: '✨',
    description: 'Keep it up!',
  },
  {
    day: 3,
    xpBonus: 100,
    pokemonBonus: true,
    icon: '🎁',
    description: 'Free Pokemon encounter!',
  },
  {
    day: 4,
    xpBonus: 100,
    pokemonBonus: false,
    specialReward: 'double_xp',
    icon: '⚡',
    description: 'Double XP today!',
  },
  {
    day: 5,
    xpBonus: 125,
    pokemonBonus: true,
    specialReward: 'rare_pokemon',
    icon: '💎',
    description: 'Rare Pokemon chance!',
  },
  {
    day: 6,
    xpBonus: 150,
    pokemonBonus: false,
    icon: '🔥',
    description: 'Almost there!',
  },
  {
    day: 7,
    xpBonus: 200,
    pokemonBonus: true,
    specialReward: 'legendary_chance',
    icon: '👑',
    description: 'Weekly bonus + Legendary chance!',
  },
];

// Get reward for a specific day in the streak
export function getDailyReward(streakDay: number): DailyReward {
  // Cycle through rewards (1-7, then repeat)
  const dayIndex = ((streakDay - 1) % 7);
  return DAILY_REWARDS[dayIndex];
}

// Get all rewards for the week display
export function getWeekRewards(): DailyReward[] {
  return DAILY_REWARDS;
}

// Check if user can claim daily reward
export function canClaimDailyReward(lastClaimedDate: string): boolean {
  if (!lastClaimedDate) return true;

  const today = new Date().toISOString().split('T')[0];
  return lastClaimedDate !== today;
}

// Check if streak should continue or reset
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

// Calculate streak bonus multiplier
export function getStreakMultiplier(streakDay: number): number {
  // 5% bonus per day, max 35% at day 7
  return 1 + Math.min(streakDay * 0.05, 0.35);
}
