import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  fetchPokemon,
  getRandomPokemon,
  preloadPokemon,
  preloadStarters,
  getAllCachedPokemon,
  clearPokemonCache,
  TYPE_COLORS,
} from './pokemonApi';

describe('pokemonApi', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('TYPE_COLORS', () => {
    it('should have colors for all 18 Pokemon types', () => {
      const expectedTypes = [
        'normal', 'fire', 'water', 'electric', 'grass', 'ice',
        'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
        'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
      ];

      expectedTypes.forEach(type => {
        expect(TYPE_COLORS[type as keyof typeof TYPE_COLORS]).toBeDefined();
        expect(TYPE_COLORS[type as keyof typeof TYPE_COLORS]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('fetchPokemon', () => {
    it('should fetch Pokemon from API and return formatted data', async () => {
      const mockResponse = {
        id: 25,
        name: 'pikachu',
        types: [
          { type: { name: 'electric' } },
        ],
      };

      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const pokemon = await fetchPokemon(25);

      expect(pokemon.id).toBe(25);
      expect(pokemon.name).toBe('Pikachu');
      expect(pokemon.types).toEqual(['electric']);
      expect(pokemon.sprite).toContain('25.png');
      expect(pokemon.officialArtwork).toContain('25.png');
    });

    it('should cache fetched Pokemon', async () => {
      const mockResponse = {
        id: 1,
        name: 'bulbasaur',
        types: [
          { type: { name: 'grass' } },
          { type: { name: 'poison' } },
        ],
      };

      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First fetch
      await fetchPokemon(1);

      // Second fetch should use cache
      const pokemon = await fetchPokemon(1);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(pokemon.id).toBe(1);
      expect(pokemon.name).toBe('Bulbasaur');
    });

    it('should return cached Pokemon without API call', async () => {
      // Pre-populate cache
      const cache = {
        version: '1',
        pokemon: {
          4: {
            id: 4,
            name: 'Charmander',
            sprite: 'sprite.png',
            officialArtwork: 'art.png',
            types: ['fire'],
          },
        },
      };
      localStorage.setItem('mathmon_pokemon_cache', JSON.stringify(cache));

      const pokemon = await fetchPokemon(4);

      expect(global.fetch).not.toHaveBeenCalled();
      expect(pokemon.name).toBe('Charmander');
    });

    it('should throw error for invalid Pokemon ID', async () => {
      await expect(fetchPokemon(0)).rejects.toThrow('Invalid Pokemon ID');
      await expect(fetchPokemon(-1)).rejects.toThrow('Invalid Pokemon ID');
      await expect(fetchPokemon(152)).rejects.toThrow('Invalid Pokemon ID');
    });

    it('should return fallback Pokemon on API error', async () => {
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const pokemon = await fetchPokemon(100);

      expect(pokemon.id).toBe(100);
      expect(pokemon.name).toBe('Pokemon #100');
      expect(pokemon.types).toEqual(['normal']);
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

      const pokemon = await fetchPokemon(50);

      expect(pokemon.id).toBe(50);
      expect(pokemon.name).toBe('Pokemon #50');
    });

    it('should format special Pokemon names correctly', async () => {
      const testCases = [
        { apiName: 'mr-mime', expected: 'Mr. Mime' },
        { apiName: 'nidoran-f', expected: 'Nidoran♀' },
        { apiName: 'nidoran-m', expected: 'Nidoran♂' },
        { apiName: 'farfetchd', expected: "Farfetch'd" },
        { apiName: 'ho-oh', expected: 'Ho-Oh' },
        { apiName: 'regular', expected: 'Regular' },
      ];

      for (const { apiName, expected } of testCases) {
        localStorage.clear();
        (global.fetch as Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 1,
            name: apiName,
            types: [{ type: { name: 'normal' } }],
          }),
        });

        const pokemon = await fetchPokemon(1);
        expect(pokemon.name).toBe(expected);
      }
    });
  });

  describe('getRandomPokemon', () => {
    it('should return a valid Pokemon', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 50,
          name: 'diglett',
          types: [{ type: { name: 'ground' } }],
        }),
      });

      const pokemon = await getRandomPokemon();

      expect(pokemon).toHaveProperty('id');
      expect(pokemon).toHaveProperty('name');
      expect(pokemon).toHaveProperty('types');
    });
  });

  describe('preloadPokemon', () => {
    it('should preload multiple Pokemon in parallel', async () => {
      const mockResponses = [
        { id: 1, name: 'bulbasaur', types: [{ type: { name: 'grass' } }] },
        { id: 4, name: 'charmander', types: [{ type: { name: 'fire' } }] },
        { id: 7, name: 'squirtle', types: [{ type: { name: 'water' } }] },
      ];

      mockResponses.forEach(response => {
        (global.fetch as Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response),
        });
      });

      const pokemon = await preloadPokemon([1, 4, 7]);

      expect(pokemon).toHaveLength(3);
      expect(pokemon[0].name).toBe('Bulbasaur');
      expect(pokemon[1].name).toBe('Charmander');
      expect(pokemon[2].name).toBe('Squirtle');
    });
  });

  describe('preloadStarters', () => {
    it('should preload starter Pokemon (1, 4, 7, 25)', async () => {
      const mockResponses = [
        { id: 1, name: 'bulbasaur', types: [{ type: { name: 'grass' } }] },
        { id: 4, name: 'charmander', types: [{ type: { name: 'fire' } }] },
        { id: 7, name: 'squirtle', types: [{ type: { name: 'water' } }] },
        { id: 25, name: 'pikachu', types: [{ type: { name: 'electric' } }] },
      ];

      mockResponses.forEach(response => {
        (global.fetch as Mock).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response),
        });
      });

      await preloadStarters();

      expect(global.fetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('getAllCachedPokemon', () => {
    it('should return empty array when no cache', () => {
      const cached = getAllCachedPokemon();
      expect(cached).toEqual([]);
    });

    it('should return all cached Pokemon', () => {
      const cache = {
        version: '1',
        pokemon: {
          1: { id: 1, name: 'Bulbasaur', sprite: '', officialArtwork: '', types: ['grass'] },
          4: { id: 4, name: 'Charmander', sprite: '', officialArtwork: '', types: ['fire'] },
        },
      };
      localStorage.setItem('mathmon_pokemon_cache', JSON.stringify(cache));

      const cached = getAllCachedPokemon();
      expect(cached).toHaveLength(2);
    });
  });

  describe('clearPokemonCache', () => {
    it('should remove Pokemon cache from localStorage', () => {
      const cache = {
        version: '1',
        pokemon: {
          1: { id: 1, name: 'Bulbasaur', sprite: '', officialArtwork: '', types: ['grass'] },
        },
      };
      localStorage.setItem('mathmon_pokemon_cache', JSON.stringify(cache));

      expect(localStorage.getItem('mathmon_pokemon_cache')).not.toBeNull();

      clearPokemonCache();

      expect(localStorage.getItem('mathmon_pokemon_cache')).toBeNull();
    });
  });

  describe('cache version handling', () => {
    it('should invalidate cache with different version', async () => {
      // Set old cache with different version
      const oldCache = {
        version: 'old',
        pokemon: {
          1: { id: 1, name: 'OldBulbasaur', sprite: '', officialArtwork: '', types: ['grass'] },
        },
      };
      localStorage.setItem('mathmon_pokemon_cache', JSON.stringify(oldCache));

      (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          name: 'bulbasaur',
          types: [{ type: { name: 'grass' } }],
        }),
      });

      const pokemon = await fetchPokemon(1);

      // Should have fetched fresh data
      expect(global.fetch).toHaveBeenCalled();
      expect(pokemon.name).toBe('Bulbasaur');
    });
  });
});
