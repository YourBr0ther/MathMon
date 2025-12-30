import { supabase } from '../lib/supabase';
import type { Profile, ProfileUpdate } from '../lib/database.types';

export const profileService = {
  /**
   * Get a user's profile by their ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  },

  /**
   * Update a user's profile
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data as Profile;
  },

  /**
   * Add XP to a user's profile and handle level ups
   */
  async addXP(userId: string, xpToAdd: number): Promise<Profile | null> {
    if (!supabase) return null;

    // First get current profile
    const profile = await this.getProfile(userId);
    if (!profile) return null;

    // Calculate new XP and level
    const newXP = profile.xp + xpToAdd;
    const xpPerLevel = 100;
    const newLevel = Math.floor(newXP / xpPerLevel) + 1;

    return this.updateProfile(userId, {
      xp: newXP,
      level: newLevel,
    });
  },

  /**
   * Update streak information
   */
  async updateStreak(userId: string, currentStreak: number): Promise<Profile | null> {
    if (!supabase) return null;

    const profile = await this.getProfile(userId);
    if (!profile) return null;

    const highestStreak = Math.max(profile.highest_streak, currentStreak);

    return this.updateProfile(userId, {
      current_streak: currentStreak,
      highest_streak: highestStreak,
    });
  },

  /**
   * Record an answer (correct or wrong)
   */
  async recordAnswer(userId: string, correct: boolean): Promise<Profile | null> {
    if (!supabase) return null;

    const profile = await this.getProfile(userId);
    if (!profile) return null;

    const updates: ProfileUpdate = {
      total_problems_attempted: profile.total_problems_attempted + 1,
    };

    if (correct) {
      updates.total_correct_answers = profile.total_correct_answers + 1;
    }

    return this.updateProfile(userId, updates);
  },

  /**
   * Record daily login and handle streak
   */
  async recordDailyLogin(userId: string): Promise<Profile | null> {
    if (!supabase) return null;

    const profile = await this.getProfile(userId);
    if (!profile) return null;

    const today = new Date().toISOString().split('T')[0];
    const lastPlayed = profile.last_played_date;

    // Check if this is a new day
    if (lastPlayed === today) {
      return profile; // Already logged in today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calculate new daily login streak
    let newDailyStreak = 1;
    if (lastPlayed === yesterdayStr) {
      // Consecutive day - increment streak
      newDailyStreak = profile.daily_login_streak + 1;
    }

    return this.updateProfile(userId, {
      last_played_date: today,
      daily_login_streak: newDailyStreak,
      total_days_played: profile.total_days_played + 1,
    });
  },

  /**
   * Claim daily reward
   */
  async claimDailyReward(userId: string, xpBonus: number): Promise<Profile | null> {
    if (!supabase) return null;

    const profile = await this.getProfile(userId);
    if (!profile) return null;

    const today = new Date().toISOString().split('T')[0];

    // Check if already claimed today
    if (profile.last_reward_claimed_date === today) {
      return profile;
    }

    return this.updateProfile(userId, {
      xp: profile.xp + xpBonus,
      last_reward_claimed_date: today,
    });
  },

  /**
   * Set trainer name
   */
  async setTrainerName(userId: string, trainerName: string): Promise<Profile | null> {
    return this.updateProfile(userId, { trainer_name: trainerName });
  },
};
