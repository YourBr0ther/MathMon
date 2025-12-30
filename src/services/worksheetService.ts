import { supabase } from '../lib/supabase';
import type { WorksheetResultRow, WorksheetResultInsert } from '../lib/database.types';
import type { WorksheetResult, Worksheet } from '../types';
import { WORKSHEETS } from '../data/worksheets';

export const worksheetService = {
  /**
   * Get all completed worksheets for a user
   */
  async getCompletedWorksheets(userId: string): Promise<WorksheetResultRow[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('worksheet_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching worksheet results:', error);
      return [];
    }

    return (data || []) as WorksheetResultRow[];
  },

  /**
   * Save a worksheet result
   */
  async saveWorksheetResult(
    userId: string,
    worksheetId: string,
    result: WorksheetResult
  ): Promise<WorksheetResultRow | null> {
    if (!supabase) return null;

    // Find the worksheet definition
    const worksheet = WORKSHEETS.find(w => w.id === worksheetId);
    if (!worksheet) {
      console.error('Worksheet not found:', worksheetId);
      return null;
    }

    const insert: WorksheetResultInsert = {
      user_id: userId,
      worksheet_id: worksheetId,
      worksheet_name: worksheet.name,
      grade_level: worksheet.gradeLevel,
      operation: worksheet.operation,
      score: result.correctAnswers,
      total_questions: result.totalProblems,
      stars: result.stars,
      time_spent_seconds: result.timeSeconds,
    };

    const { data, error } = await supabase
      .from('worksheet_results')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('Error saving worksheet result:', error);
      return null;
    }

    return data as WorksheetResultRow;
  },

  /**
   * Get best score for a specific worksheet
   */
  async getBestScore(userId: string, worksheetId: string): Promise<WorksheetResultRow | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('worksheet_results')
      .select('*')
      .eq('user_id', userId)
      .eq('worksheet_id', worksheetId)
      .order('stars', { ascending: false })
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching best score:', error);
      return null;
    }

    return data as WorksheetResultRow | null;
  },

  /**
   * Get worksheet completion count
   */
  async getCompletionCount(userId: string): Promise<number> {
    if (!supabase) return 0;

    const { count, error } = await supabase
      .from('worksheet_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting worksheet completions:', error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Get unique worksheets completed with at least one star
   */
  async getUniqueWorksheetsPassed(userId: string): Promise<string[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('worksheet_results')
      .select('worksheet_id')
      .eq('user_id', userId)
      .gte('stars', 1);

    if (error) {
      console.error('Error fetching unique worksheets passed:', error);
      return [];
    }

    const worksheetData = (data || []) as { worksheet_id: string }[];
    const uniqueIds = [...new Set(worksheetData.map(r => r.worksheet_id))];
    return uniqueIds;
  },

  /**
   * Convert database result to app WorksheetResult type
   */
  toAppWorksheetResult(dbResult: WorksheetResultRow): WorksheetResult {
    return {
      worksheetId: dbResult.worksheet_id,
      completedAt: new Date(dbResult.completed_at),
      correctAnswers: dbResult.score,
      totalProblems: dbResult.total_questions,
      stars: dbResult.stars,
      timeSeconds: dbResult.time_spent_seconds,
    };
  },

  /**
   * Convert array of database results to app WorksheetResult type
   */
  toAppWorksheetResults(dbResults: WorksheetResultRow[]): WorksheetResult[] {
    return dbResults.map(this.toAppWorksheetResult);
  },

  /**
   * Get worksheets with their unlock status based on user progress
   */
  async getWorksheetStatus(userId: string): Promise<Worksheet[]> {
    // For now, all worksheets are unlocked
    // Future: Could require completing previous worksheets
    return WORKSHEETS.map(w => ({ ...w, unlocked: true }));
  },
};
