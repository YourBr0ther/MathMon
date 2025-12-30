import { supabase } from '../lib/supabase';
import type { CaughtPokemon, CaughtPokemonInsert } from '../lib/database.types';
import type { Pokemon } from '../types';

export const pokemonService = {
  /**
   * Get all caught Pokemon for a user
   */
  async getCaughtPokemon(userId: string): Promise<CaughtPokemon[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('caught_pokemon')
      .select('*')
      .eq('user_id', userId)
      .order('caught_at', { ascending: false });

    if (error) {
      console.error('Error fetching caught Pokemon:', error);
      return [];
    }

    return (data || []) as CaughtPokemon[];
  },

  /**
   * Catch a new Pokemon
   */
  async catchPokemon(
    userId: string,
    pokemon: Pokemon,
    problemText?: string
  ): Promise<CaughtPokemon | null> {
    if (!supabase) return null;

    const insert: CaughtPokemonInsert = {
      user_id: userId,
      pokemon_id: pokemon.id,
      pokemon_name: pokemon.name,
      pokemon_sprite: pokemon.sprite,
      pokemon_artwork: pokemon.officialArtwork,
      pokemon_types: pokemon.types,
      caught_with_problem: problemText || null,
    };

    const { data, error } = await supabase
      .from('caught_pokemon')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('Error catching Pokemon:', error);
      return null;
    }

    return data as CaughtPokemon;
  },

  /**
   * Get count of unique Pokemon caught
   */
  async getUniqueCount(userId: string): Promise<number> {
    if (!supabase) return 0;

    const { data, error } = await supabase
      .from('caught_pokemon')
      .select('pokemon_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting unique Pokemon:', error);
      return 0;
    }

    const pokemonData = (data || []) as { pokemon_id: number }[];
    const uniqueIds = new Set(pokemonData.map(p => p.pokemon_id));
    return uniqueIds.size;
  },

  /**
   * Check if a specific Pokemon has been caught
   */
  async isPokemonCaught(userId: string, pokemonId: number): Promise<boolean> {
    if (!supabase) return false;

    const { data, error } = await supabase
      .from('caught_pokemon')
      .select('id')
      .eq('user_id', userId)
      .eq('pokemon_id', pokemonId)
      .limit(1);

    if (error) {
      console.error('Error checking if Pokemon caught:', error);
      return false;
    }

    return ((data as any[]) || []).length > 0;
  },

  /**
   * Get Pokemon by ID from user's collection
   */
  async getPokemonById(userId: string, pokemonId: number): Promise<CaughtPokemon[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('caught_pokemon')
      .select('*')
      .eq('user_id', userId)
      .eq('pokemon_id', pokemonId)
      .order('caught_at', { ascending: false });

    if (error) {
      console.error('Error fetching Pokemon by ID:', error);
      return [];
    }

    return (data || []) as CaughtPokemon[];
  },

  /**
   * Convert database Pokemon to app Pokemon type
   */
  toAppPokemon(dbPokemon: CaughtPokemon): Pokemon {
    return {
      id: dbPokemon.pokemon_id,
      name: dbPokemon.pokemon_name,
      sprite: dbPokemon.pokemon_sprite,
      officialArtwork: dbPokemon.pokemon_artwork,
      types: dbPokemon.pokemon_types as Pokemon['types'],
      caughtAt: new Date(dbPokemon.caught_at),
      caughtWithProblem: dbPokemon.caught_with_problem || undefined,
    };
  },

  /**
   * Convert array of database Pokemon to app Pokemon type
   */
  toAppPokemonArray(dbPokemon: CaughtPokemon[]): Pokemon[] {
    return dbPokemon.map(this.toAppPokemon);
  },
};
