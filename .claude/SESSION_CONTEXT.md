# MathMon Quest - Session Context

## Project Overview
MathMon Quest is a Pokemon-themed educational math game for kids (K-2nd grade). Kids solve math problems to catch and collect Pokemon.

**Repository:** https://github.com/YourBr0ther/MathMon
**Tech Stack:** React 19 + TypeScript + Tailwind CSS + Framer Motion + Vite

---

## Current State (as of Dec 29, 2024)

### Completed Features
- **Endless Mode**: Answer math questions to catch Pokemon (streak-based)
- **Worksheet Mode**: Structured 10-problem worksheets with star ratings
- **Pokedex**: View caught Pokemon collection (151 Gen 1 Pokemon)
- **Profile**: Trainer stats, XP/level system, achievements
- **Daily Rewards**: 7-day login streak with escalating XP bonuses
- **Achievement System**: 17 unlockable achievements
- **Math Curriculum**: Kindergarten, 1st Grade, 2nd Grade problems
- **PWA Support**: Installable on mobile devices
- **Sound Effects**: Using Howler.js
- **Animations**: Framer Motion throughout

### Performance Optimizations Implemented
- Lazy loading for screen components
- React.memo on frequently rendered components
- Image preloading for Pokemon sprites
- LocalStorage caching for Pokemon API data

### Testing
- 276 tests passing (Vitest + React Testing Library)
- Covers math generation, storage, API, components, achievements

---

## Next Session: Supabase Integration

### Goal
Migrate from localStorage to Supabase for cloud-based data persistence.

### Plan File Location
`/Users/christophervance/projects/math-game/SUPABASE_INTEGRATION_PLAN.md`

### Key Tasks
1. Set up Supabase project and install `@supabase/supabase-js`
2. Create database tables:
   - `profiles` - trainer info, XP, streaks
   - `caught_pokemon` - Pokemon collection
   - `user_achievements` - achievement progress
   - `worksheet_results` - completed worksheets
3. Set up Row Level Security (RLS) policies
4. Implement authentication (email/password, possibly OAuth)
5. Create service layer (profileService, pokemonService, etc.)
6. Refactor `useGameState` hook to use Supabase
7. Create migration utility for existing localStorage users
8. Add login/signup UI screens
9. Implement offline support with sync

### Questions to Resolve
- Auth method: Email only or add Google/social login?
- Allow anonymous play before requiring signup?
- Priority for offline support?
- Multi-device conflict resolution strategy?

---

## Important Files

### Main Source Files
- `src/App.tsx` - Root component with lazy loading
- `src/hooks/useGameState.ts` - Main game state management (TO BE REFACTORED)
- `src/utils/storage.ts` - LocalStorage operations (TO BE REPLACED)
- `src/types/index.ts` - TypeScript interfaces

### Configuration
- `vite.config.ts` - Vite config with network hosting enabled
- `tsconfig.app.json` - TypeScript config (excludes test files)
- `vitest.config.ts` - Test configuration

### Data Files
- `src/data/achievements.ts` - 17 achievement definitions
- `src/data/dailyRewards.ts` - 7-day reward cycle
- `src/data/pokemonConfig.ts` - Pokemon rarity tiers
- `src/data/worksheets.ts` - Worksheet definitions

---

## Git Info
- **User:** YourBr0ther
- **Email:** yourbr0ther.tv@gmail.com
- **Branch:** main
- **Remote:** git@github.com:YourBr0ther/MathMon.git

---

## Dev Server
Run with network access: `npm run dev`
- Local: http://localhost:5173 (or next available port)
- Network: Check terminal output for IP address

---

*Last updated: December 29, 2024*
