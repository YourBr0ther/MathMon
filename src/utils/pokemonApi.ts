import { Pokemon, PokemonType } from '../types';
import { getPokemonSprite, getPokemonOfficialArtwork, getPokemonCryUrl, MAX_POKEMON_ID } from '../data/pokemonConfig';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_KEY = 'mathmon_pokemon_cache';
const CACHE_VERSION = '1';

interface PokemonCache {
  version: string;
  pokemon: Record<number, Pokemon>;
}

// Load cache from localStorage
function loadCache(): PokemonCache {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as PokemonCache;
      if (parsed.version === CACHE_VERSION) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading Pokemon cache:', error);
  }
  return { version: CACHE_VERSION, pokemon: {} };
}

// Save cache to localStorage
function saveCache(cache: PokemonCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving Pokemon cache:', error);
  }
}

// Get cached Pokemon or null
function getCachedPokemon(id: number): Pokemon | null {
  const cache = loadCache();
  return cache.pokemon[id] || null;
}

// Cache a Pokemon
function cachePokemon(pokemon: Pokemon): void {
  const cache = loadCache();
  cache.pokemon[pokemon.id] = pokemon;
  saveCache(cache);
}

// Type color mapping
export const TYPE_COLORS: Record<PokemonType, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

// Fetch Pokemon from API
export async function fetchPokemon(id: number): Promise<Pokemon> {
  // Check cache first
  const cached = getCachedPokemon(id);
  if (cached) {
    return cached;
  }

  // Validate ID
  if (id < 1 || id > MAX_POKEMON_ID) {
    throw new Error(`Invalid Pokemon ID: ${id}. Must be between 1 and ${MAX_POKEMON_ID}`);
  }

  try {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon ${id}: ${response.statusText}`);
    }

    const data = await response.json();

    const pokemon: Pokemon = {
      id: data.id,
      name: formatPokemonName(data.name),
      sprite: getPokemonSprite(data.id),
      officialArtwork: getPokemonOfficialArtwork(data.id),
      types: data.types.map((t: { type: { name: string } }) => t.type.name as PokemonType),
    };

    // Cache the Pokemon
    cachePokemon(pokemon);

    return pokemon;
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error);
    // Return a fallback Pokemon with basic info
    return {
      id,
      name: `Pokemon #${id}`,
      sprite: getPokemonSprite(id),
      officialArtwork: getPokemonOfficialArtwork(id),
      types: ['normal'],
    };
  }
}

// Format Pokemon name (capitalize first letter, handle special cases)
function formatPokemonName(name: string): string {
  // Handle special names like "mr-mime" -> "Mr. Mime"
  const specialNames: Record<string, string> = {
    'mr-mime': 'Mr. Mime',
    'mr-rime': 'Mr. Rime',
    'mime-jr': 'Mime Jr.',
    'nidoran-f': 'Nidoran♀',
    'nidoran-m': 'Nidoran♂',
    'farfetchd': "Farfetch'd",
    'ho-oh': 'Ho-Oh',
  };

  if (specialNames[name]) {
    return specialNames[name];
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Preload a batch of Pokemon (useful for initial loading)
export async function preloadPokemon(ids: number[]): Promise<Pokemon[]> {
  const promises = ids.map(id => fetchPokemon(id));
  return Promise.all(promises);
}

// Get a random Pokemon by ID
export async function getRandomPokemon(): Promise<Pokemon> {
  const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
  return fetchPokemon(randomId);
}

// Preload common starter Pokemon for better UX
export async function preloadStarters(): Promise<void> {
  const starterIds = [1, 4, 7, 25]; // Bulbasaur, Charmander, Squirtle, Pikachu
  await preloadPokemon(starterIds);
}

// Get all cached Pokemon
export function getAllCachedPokemon(): Pokemon[] {
  const cache = loadCache();
  return Object.values(cache.pokemon);
}

// Clear Pokemon cache
export function clearPokemonCache(): void {
  localStorage.removeItem(CACHE_KEY);
}

// Preload image into browser cache
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload: ${src}`));
    img.src = src;
  });
}

// Preload Pokemon sprite images
export async function preloadPokemonSprites(ids: number[]): Promise<void> {
  const spritePromises = ids.map(id => {
    const spriteUrl = getPokemonSprite(id);
    return preloadImage(spriteUrl).catch(() => {
      // Silently fail for individual sprites
      console.warn(`Failed to preload sprite for Pokemon ${id}`);
    });
  });
  await Promise.all(spritePromises);
}

// Preload Pokemon artwork images
export async function preloadPokemonArtwork(ids: number[]): Promise<void> {
  const artworkPromises = ids.map(id => {
    const artworkUrl = getPokemonOfficialArtwork(id);
    return preloadImage(artworkUrl).catch(() => {
      console.warn(`Failed to preload artwork for Pokemon ${id}`);
    });
  });
  await Promise.all(artworkPromises);
}

// Preload common Pokemon sprites for better UX on game start
export async function preloadCommonSprites(): Promise<void> {
  // Preload starter sprites and some common ones
  const commonIds = [1, 4, 7, 25, 133, 39, 35, 52, 54, 63];
  await preloadPokemonSprites(commonIds);
}

// Play Pokemon cry audio
let currentCryAudio: HTMLAudioElement | null = null;

export function playPokemonCry(pokemonId: number, volume: number = 0.5): void {
  // Stop any currently playing cry
  if (currentCryAudio) {
    currentCryAudio.pause();
    currentCryAudio = null;
  }

  try {
    const cryUrl = getPokemonCryUrl(pokemonId);
    const audio = new Audio(cryUrl);
    audio.volume = Math.max(0, Math.min(1, volume));
    currentCryAudio = audio;

    audio.play().catch(error => {
      console.warn(`Failed to play Pokemon cry for #${pokemonId}:`, error);
    });

    // Clean up reference when audio ends
    audio.onended = () => {
      if (currentCryAudio === audio) {
        currentCryAudio = null;
      }
    };
  } catch (error) {
    console.warn(`Error setting up Pokemon cry for #${pokemonId}:`, error);
  }
}
