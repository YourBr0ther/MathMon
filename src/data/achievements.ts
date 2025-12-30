import { Achievement } from '../types';

export const ACHIEVEMENTS: Omit<Achievement, 'current' | 'unlockedAt'>[] = [
  // Catching achievements
  {
    id: 'first_catch',
    name: 'First Catch!',
    description: 'Catch your very first Pokemon',
    icon: '🎉',
    requirement: 1,
  },
  {
    id: 'catch_10',
    name: 'Pokemon Collector',
    description: 'Catch 10 Pokemon',
    icon: '🏆',
    requirement: 10,
  },
  {
    id: 'catch_50',
    name: 'Pokemon Trainer',
    description: 'Catch 50 Pokemon',
    icon: '⭐',
    requirement: 50,
  },
  {
    id: 'catch_100',
    name: 'Pokemon Master',
    description: 'Catch 100 Pokemon',
    icon: '👑',
    requirement: 100,
  },

  // Streak achievements
  {
    id: 'streak_5',
    name: 'Getting Started',
    description: 'Get a 5 answer streak',
    icon: '🔥',
    requirement: 5,
  },
  {
    id: 'streak_10',
    name: 'On Fire!',
    description: 'Get a 10 answer streak',
    icon: '💪',
    requirement: 10,
  },
  {
    id: 'streak_25',
    name: 'Unstoppable!',
    description: 'Get a 25 answer streak',
    icon: '🚀',
    requirement: 25,
  },
  {
    id: 'streak_50',
    name: 'Math Legend',
    description: 'Get a 50 answer streak',
    icon: '🌟',
    requirement: 50,
  },

  // Worksheet achievements
  {
    id: 'worksheet_1',
    name: 'Scholar',
    description: 'Complete your first worksheet',
    icon: '📝',
    requirement: 1,
  },
  {
    id: 'worksheet_5',
    name: 'Studious',
    description: 'Complete 5 worksheets',
    icon: '📚',
    requirement: 5,
  },
  {
    id: 'worksheet_10',
    name: 'Academic',
    description: 'Complete 10 worksheets',
    icon: '🎓',
    requirement: 10,
  },
  {
    id: 'perfect_worksheet',
    name: 'Perfectionist',
    description: 'Get 3 stars on a worksheet',
    icon: '💯',
    requirement: 1,
  },

  // Level achievements
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '🌙',
    requirement: 5,
  },
  {
    id: 'level_10',
    name: 'Superstar',
    description: 'Reach level 10',
    icon: '✨',
    requirement: 10,
  },

  // Correct answers achievements
  {
    id: 'correct_100',
    name: 'Math Whiz',
    description: 'Answer 100 problems correctly',
    icon: '🧮',
    requirement: 100,
  },
  {
    id: 'correct_500',
    name: 'Math Genius',
    description: 'Answer 500 problems correctly',
    icon: '🧠',
    requirement: 500,
  },
];

// Get achievement by ID
export function getAchievementById(id: string): Omit<Achievement, 'current' | 'unlockedAt'> | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Check if achievement is unlocked
export function isAchievementUnlocked(achievement: Achievement): boolean {
  return achievement.current >= achievement.requirement;
}

// Get progress percentage for achievement
export function getAchievementProgress(achievement: Achievement): number {
  return Math.min(100, Math.round((achievement.current / achievement.requirement) * 100));
}
