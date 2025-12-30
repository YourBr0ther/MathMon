// Pokemon Types
export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  officialArtwork: string;
  types: PokemonType[];
  caughtAt?: Date;
  caughtWithProblem?: string;
}

export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export type PokemonRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// Math Types
export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'comparison' | 'counting' | 'missing_addend';

export type GradeLevel = 'kindergarten' | 'first' | 'second';

export interface MathProblem {
  id: string;
  question: string;
  questionDisplay: string; // For visual display with nice formatting
  answer: number;
  options: number[];
  operation: MathOperation;
  difficulty: number;
  gradeLevel: GradeLevel;
}

export interface Worksheet {
  id: string;
  name: string;
  icon: string;
  description: string;
  gradeLevel: GradeLevel;
  operation: MathOperation;
  problemCount: number;
  unlocked: boolean;
}

// Game State Types
export interface GameState {
  trainerName: string;
  caughtPokemon: Pokemon[];
  highestStreak: number;
  totalCorrectAnswers: number;
  totalProblemsAttempted: number;
  worksheetsCompleted: WorksheetResult[];
  achievements: Achievement[];
  currentStreak: number;
  lastPlayedDate: string;
  xp: number;
  level: number;
  // Daily rewards
  dailyLoginStreak: number;
  lastRewardClaimedDate: string;
  totalDaysPlayed: number;
}

// Daily Reward Types
export interface DailyReward {
  day: number;
  xpBonus: number;
  pokemonBonus: boolean; // Guaranteed Pokemon encounter
  specialReward?: 'rare_pokemon' | 'legendary_chance' | 'double_xp';
  icon: string;
  description: string;
}

export interface WorksheetResult {
  worksheetId: string;
  completedAt: Date;
  correctAnswers: number;
  totalProblems: number;
  stars: number;
  timeSeconds: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  requirement: number;
  current: number;
}

// Game Mode Types
export type GameMode = 'endless' | 'worksheet';

export interface EndlessGameState {
  currentStreak: number;
  correctInRow: number; // Progress toward catching (0-4)
  currentPokemon: Pokemon | null;
  currentProblem: MathProblem | null;
  difficulty: number;
  isGameOver: boolean;
  justCaughtPokemon: Pokemon | null;
}

export interface WorksheetGameState {
  worksheet: Worksheet;
  problems: MathProblem[];
  currentProblemIndex: number;
  correctAnswers: number;
  startTime: number;
  isComplete: boolean;
}

// Sound Types
export type SoundEffect =
  | 'correct'
  | 'wrong'
  | 'catch'
  | 'streak'
  | 'levelUp'
  | 'click'
  | 'victory';

// Navigation
export type Screen = 'home' | 'endless' | 'worksheet' | 'worksheetSelect' | 'pokedex' | 'profile' | 'catch';

// Auth Screens (handled separately from main game)
export type AuthScreen = 'login' | 'signup';
