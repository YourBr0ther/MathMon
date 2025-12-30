# MathMon Quest

A Pokemon-themed educational math game designed for children in Kindergarten through 2nd Grade. Kids solve math problems to catch and collect Pokemon, making learning fun and engaging!

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Game Modes

**Pokemon Safari (Endless Mode)**
- Answer math questions continuously to encounter wild Pokemon
- Get 5 correct answers in a row to catch the current Pokemon
- Difficulty scales as your streak grows (1-10 levels)
- Track your highest streak and compete with yourself
- Pokemon rarity increases with difficulty - legendary Pokemon appear at higher levels!

**Trainer Academy (Worksheet Mode)**
- Structured practice with themed worksheets (10 problems each)
- Earn 1-3 stars based on accuracy
- Catch a reward Pokemon upon completion
- Organized by grade level and operation type
- Perfect for focused practice sessions

### Math Curriculum

| Grade Level | Skills Covered |
|-------------|----------------|
| **Kindergarten** | Counting (1-10), Number comparison, Addition & Subtraction within 5 |
| **First Grade** | Addition & Subtraction within 20, Missing addend problems |
| **Second Grade** | Addition & Subtraction within 100, Multiplication (x2, x5, x10) |

### Pokemon Collection

- **151 Pokemon** from Generation 1 (Kanto region)
- **Rarity tiers**: Common, Uncommon, Rare, and Legendary
- Each caught Pokemon remembers the math problem that caught it
- View your collection in the Pokedex with type badges and catch dates
- Guaranteed starter Pokemon (Bulbasaur, Charmander, Squirtle, Pikachu) for new players

### Daily Rewards

Login daily to claim escalating rewards on a 7-day cycle:

| Day | Reward | Bonus |
|-----|--------|-------|
| 1 | 50 XP | Welcome back! |
| 2 | 75 XP | Keep it up! |
| 3 | 100 XP | + Free Pokemon encounter |
| 4 | 100 XP | + Double XP today |
| 5 | 125 XP | + Rare Pokemon chance |
| 6 | 150 XP | Almost there! |
| 7 | 200 XP | + Legendary chance! |

Streak multiplier: Earn up to 35% bonus XP for consecutive daily logins!

### Achievement System

Unlock 17 achievements across multiple categories:
- **Catching**: First Catch, Collector (10), Trainer (50), Master (100)
- **Streaks**: Getting Started (5), On Fire (10), Unstoppable (25), Math Legend (50)
- **Worksheets**: Scholar, Studious, Academic, Perfectionist
- **Leveling**: Rising Star (Lv.5), Superstar (Lv.10)
- **Accuracy**: Math Whiz (100 correct), Math Genius (500 correct)

### Trainer Profile

- Customizable trainer name
- XP-based leveling system (500 XP per level)
- Track total Pokemon caught, highest streak, and accuracy
- View achievement progress and unlocks

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript 5.9 |
| **Styling** | Tailwind CSS 4.1, Framer Motion |
| **Build Tool** | Vite 7.2 |
| **Audio** | Howler.js |
| **Icons** | Lucide React |
| **Testing** | Vitest, React Testing Library |
| **Pokemon Data** | [PokeAPI](https://pokeapi.co/) |

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YourBr0ther/MathMon.git
cd MathMon

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev      # Start development server (with network access)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm test         # Run test suite
```

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── DailyReward.tsx
│   │   ├── ProgressBar.tsx
│   │   └── PokemonSprite.tsx
│   ├── game/             # Game mechanics components
│   │   ├── AnswerButtons.tsx
│   │   ├── CatchAnimation.tsx
│   │   ├── MathQuestion.tsx
│   │   └── StreakCounter.tsx
│   └── screens/          # Full-page screens
│       ├── HomeScreen.tsx
│       ├── EndlessMode.tsx
│       ├── WorksheetMode.tsx
│       ├── WorksheetSelect.tsx
│       ├── Pokedex.tsx
│       └── Profile.tsx
├── data/                 # Game configuration
│   ├── achievements.ts
│   ├── dailyRewards.ts
│   ├── pokemonConfig.ts
│   └── worksheets.ts
├── hooks/                # Custom React hooks
│   ├── useGameState.ts
│   └── useSound.ts
├── utils/                # Utility functions
│   ├── mathGenerator.ts
│   ├── pokemonApi.ts
│   └── storage.ts
├── types/                # TypeScript definitions
│   └── index.ts
├── App.tsx               # Root component
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## PWA Support

MathMon Quest is a Progressive Web App that can be installed on mobile devices:

1. Open the app in your mobile browser
2. Tap "Add to Home Screen" (iOS) or the install prompt (Android)
3. Launch from your home screen for a full-screen app experience

Features:
- Works offline after initial load
- Standalone display mode
- Portrait orientation optimized
- Touch-friendly interface with 44px+ tap targets

## Performance Optimizations

- **Lazy Loading**: Game screens are code-split for faster initial load
- **Image Preloading**: Common Pokemon sprites are preloaded on app start
- **Memoization**: React.memo applied to frequently rendered components
- **LocalStorage Caching**: Pokemon API responses are cached to reduce network requests
- **Efficient Re-renders**: Optimized state management prevents unnecessary updates

## Testing

The test suite includes 276 tests covering:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

Test coverage includes:
- Math problem generation (all operations and grade levels)
- Pokemon API and caching
- Game state management
- Storage utilities
- UI component rendering
- Achievement tracking
- Integration tests

## Customization

### Adding More Pokemon Generations

Update `src/data/pokemonConfig.ts`:

```typescript
// Change this value to include more Pokemon
export const MAX_POKEMON_ID = 251; // Gen 1 + 2

// Add new rarity definitions for new Pokemon
export const RARE_POKEMON_IDS = [...existingIds, ...newRareIds];
```

### Adjusting Difficulty

Modify `src/utils/mathGenerator.ts` to change:
- Number ranges for each grade level
- Difficulty scaling thresholds
- Problem type distribution

### Sound Effects

Sounds are defined in `src/hooks/useSound.ts`. Replace the Mixkit URLs with your own sound files.

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome for Android

## Credits

- Pokemon sprites and data from [PokeAPI](https://pokeapi.co/)
- Sound effects from [Mixkit](https://mixkit.co/)
- Icons from [Lucide](https://lucide.dev/)
- Fonts: Fredoka and Quicksand from Google Fonts

## License

MIT License - feel free to use this project for educational purposes!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Made with love for little mathematicians everywhere!
