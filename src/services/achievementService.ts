import { supabase } from '../lib/supabase';
import type { UserAchievement, UserAchievementInsert, UserAchievementUpdate } from '../lib/database.types';
import type { Achievement } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

export const achievementService = {
  /**
   * Get all achievements for a user
   */
  async getAchievements(userId: string): Promise<UserAchievement[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return (data || []) as UserAchievement[];
  },

  /**
   * Get a specific achievement
   */
  async getAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine
      console.error('Error fetching achievement:', error);
      return null;
    }

    return data as UserAchievement | null;
  },

  /**
   * Update progress on an achievement
   */
  async updateProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<UserAchievement | null> {
    if (!supabase) return null;

    // Check if achievement already exists
    const existing = await this.getAchievement(userId, achievementId);

    if (existing) {
      // Update existing
      const updates: UserAchievementUpdate = {
        current_progress: progress,
      };

      // Check if achievement should be unlocked
      const definition = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (definition && progress >= definition.requirement && !existing.unlocked_at) {
        updates.unlocked_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_achievements')
        .update(updates)
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .select()
        .single();

      if (error) {
        console.error('Error updating achievement progress:', error);
        return null;
      }

      return data as UserAchievement;
    } else {
      // Insert new
      const definition = ACHIEVEMENTS.find(a => a.id === achievementId);
      const isUnlocked = definition && progress >= definition.requirement;

      const insert: UserAchievementInsert = {
        user_id: userId,
        achievement_id: achievementId,
        current_progress: progress,
        unlocked_at: isUnlocked ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('user_achievements')
        .insert(insert)
        .select()
        .single();

      if (error) {
        console.error('Error inserting achievement:', error);
        return null;
      }

      return data as UserAchievement;
    }
  },

  /**
   * Unlock an achievement immediately
   */
  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    if (!supabase) return null;

    const definition = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!definition) return null;

    return this.updateProgress(userId, achievementId, definition.requirement);
  },

  /**
   * Convert database achievements to app Achievement type, merging with definitions
   */
  toAppAchievements(dbAchievements: UserAchievement[]): Achievement[] {
    return ACHIEVEMENTS.map(definition => {
      const userProgress = dbAchievements.find(a => a.achievement_id === definition.id);
      return {
        ...definition,
        current: userProgress?.current_progress || 0,
        unlockedAt: userProgress?.unlocked_at ? new Date(userProgress.unlocked_at) : undefined,
      };
    });
  },

  /**
   * Initialize all achievements for a new user
   */
  async initializeAchievements(userId: string): Promise<void> {
    if (!supabase) return;

    // Create all achievements with 0 progress
    const inserts: UserAchievementInsert[] = ACHIEVEMENTS.map(def => ({
      user_id: userId,
      achievement_id: def.id,
      current_progress: 0,
    }));

    const { error } = await supabase
      .from('user_achievements')
      .insert(inserts);

    if (error) {
      console.error('Error initializing achievements:', error);
    }
  },
};
