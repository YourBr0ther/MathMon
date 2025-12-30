import { PokemonRarity } from '../types';

// ============================================
// VERSION CONTROL - CHANGE THIS TO ADD MORE POKEMON
// ============================================
// v1.0 = Generation 1 (Kanto): Pokemon #1-151
// v2.0 = Generation 2 (Johto): Pokemon #1-251
// v3.0 = Generation 3 (Hoenn): Pokemon #1-386
// v4.0 = Generation 4 (Sinnoh): Pokemon #1-493
// v5.0 = Generation 5 (Unova): Pokemon #1-649
// ============================================

export const CURRENT_VERSION = '1.0';
export const MAX_POKEMON_ID = 151; // Change this to add more Pokemon in future versions

// Generation ranges for collection tracking
export interface GenerationInfo {
  name: string;
  region: string;
  startId: number;
  endId: number;
  color: string;
}

export const GENERATIONS: GenerationInfo[] = [
  { name: 'Generation I', region: 'Kanto', startId: 1, endId: 151, color: '#FF0000' },
  { name: 'Generation II', region: 'Johto', startId: 152, endId: 251, color: '#FFD700' },
  { name: 'Generation III', region: 'Hoenn', startId: 252, endId: 386, color: '#00BFFF' },
  { name: 'Generation IV', region: 'Sinnoh', startId: 387, endId: 493, color: '#4169E1' },
  { name: 'Generation V', region: 'Unova', startId: 494, endId: 649, color: '#708090' },
  { name: 'Generation VI', region: 'Kalos', startId: 650, endId: 721, color: '#FF69B4' },
  { name: 'Generation VII', region: 'Alola', startId: 722, endId: 809, color: '#FFA500' },
  { name: 'Generation VIII', region: 'Galar', startId: 810, endId: 905, color: '#FF1493' },
  { name: 'Generation IX', region: 'Paldea', startId: 906, endId: 1025, color: '#9932CC' },
];

// Get available generations based on current version
export function getAvailableGenerations(): GenerationInfo[] {
  return GENERATIONS.filter(gen => gen.startId <= MAX_POKEMON_ID);
}

// Legendary Pokemon IDs for Gen 1 (these are harder to catch)
export const LEGENDARY_IDS: number[] = [
  144, // Articuno
  145, // Zapdos
  146, // Moltres
  150, // Mewtwo
  151, // Mew
];

// Rare Pokemon IDs for Gen 1
export const RARE_IDS: number[] = [
  6,   // Charizard
  9,   // Blastoise
  3,   // Venusaur
  26,  // Raichu
  65,  // Alakazam
  68,  // Machamp
  94,  // Gengar
  130, // Gyarados
  131, // Lapras
  134, // Vaporeon
  135, // Jolteon
  136, // Flareon
  143, // Snorlax
  149, // Dragonite
];

// Uncommon Pokemon IDs for Gen 1
export const UNCOMMON_IDS: number[] = [
  2,   // Ivysaur
  5,   // Charmeleon
  8,   // Wartortle
  25,  // Pikachu
  38,  // Ninetales
  59,  // Arcanine
  62,  // Poliwrath
  76,  // Golem
  78,  // Rapidash
  103, // Exeggutor
  115, // Kangaskhan
  123, // Scyther
  127, // Pinsir
  128, // Tauros
  137, // Porygon
  139, // Omastar
  141, // Kabutops
  142, // Aerodactyl
  147, // Dratini
  148, // Dragonair
];

// Starter Pokemon (guaranteed on first catches)
export const STARTER_IDS: number[] = [
  1,   // Bulbasaur
  4,   // Charmander
  7,   // Squirtle
  25,  // Pikachu
];

// Get Pokemon rarity based on ID
export function getPokemonRarity(id: number): PokemonRarity {
  if (LEGENDARY_IDS.includes(id)) return 'legendary';
  if (RARE_IDS.includes(id)) return 'rare';
  if (UNCOMMON_IDS.includes(id)) return 'uncommon';
  return 'common';
}

// Get random Pokemon ID based on difficulty (higher difficulty = chance for rarer Pokemon)
export function getRandomPokemonId(difficulty: number): number {
  const rand = Math.random();

  // Adjust thresholds based on difficulty (0-10 scale)
  const legendaryThreshold = 0.02 + (difficulty * 0.008); // 2% base, up to 10% at max difficulty
  const rareThreshold = legendaryThreshold + 0.08 + (difficulty * 0.02); // 8% base, up to 28% at max
  const uncommonThreshold = rareThreshold + 0.2; // 20% for uncommon

  let pool: number[];

  if (rand < legendaryThreshold && difficulty >= 5) {
    // Legendary (only available at difficulty 5+)
    pool = LEGENDARY_IDS.filter(id => id <= MAX_POKEMON_ID);
  } else if (rand < rareThreshold && difficulty >= 3) {
    // Rare (only available at difficulty 3+)
    pool = RARE_IDS.filter(id => id <= MAX_POKEMON_ID);
  } else if (rand < uncommonThreshold) {
    // Uncommon
    pool = UNCOMMON_IDS.filter(id => id <= MAX_POKEMON_ID);
  } else {
    // Common - all Pokemon not in other categories
    pool = [];
    for (let i = 1; i <= MAX_POKEMON_ID; i++) {
      if (!LEGENDARY_IDS.includes(i) && !RARE_IDS.includes(i) && !UNCOMMON_IDS.includes(i)) {
        pool.push(i);
      }
    }
  }

  // Fallback to any Pokemon if pool is empty
  if (pool.length === 0) {
    return Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

// Get a starter Pokemon (for first few catches)
export function getStarterPokemonId(catchNumber: number): number {
  if (catchNumber < STARTER_IDS.length) {
    return STARTER_IDS[catchNumber];
  }
  return getRandomPokemonId(0);
}

// Sprite URLs
export const SPRITE_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
export const OFFICIAL_ARTWORK_URL = `${SPRITE_BASE_URL}/other/official-artwork`;
export const SHOWDOWN_URL = `${SPRITE_BASE_URL}/other/showdown`;

// Cry audio URLs
export const CRY_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest';

export function getPokemonSprite(id: number): string {
  return `${SPRITE_BASE_URL}/${id}.png`;
}

export function getPokemonOfficialArtwork(id: number): string {
  return `${OFFICIAL_ARTWORK_URL}/${id}.png`;
}

export function getPokemonAnimatedSprite(id: number): string {
  return `${SHOWDOWN_URL}/${id}.gif`;
}

export function getPokemonCryUrl(id: number): string {
  return `${CRY_BASE_URL}/${id}.ogg`;
}
