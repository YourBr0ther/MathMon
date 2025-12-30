# Supabase Integration Plan for MathMon Quest

## Overview

This document outlines the plan to migrate MathMon Quest from localStorage to Supabase for persistent, cloud-based user data storage. This will enable:
- Cross-device gameplay (play on phone, continue on tablet)
- Data persistence beyond browser storage
- Future multiplayer/social features
- Leaderboards and community features

---

## Phase 1: Supabase Project Setup

### 1.1 Create Supabase Project
- [ ] Create new project at https://supabase.com
- [ ] Note down project URL and anon key
- [ ] Configure project settings (region, etc.)

### 1.2 Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 1.3 Environment Configuration
Create `.env` file:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Add to `.gitignore`:
```
.env
.env.local
```

---

## Phase 2: Database Schema Design

### 2.1 Tables Required

#### `profiles` - Trainer Information
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_name TEXT NOT NULL DEFAULT '',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  highest_streak INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  total_problems_attempted INTEGER NOT NULL DEFAULT 0,
  daily_login_streak INTEGER NOT NULL DEFAULT 0,
  last_reward_claimed_date DATE,
  total_days_played INTEGER NOT NULL DEFAULT 0,
  last_played_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### `caught_pokemon` - Pokemon Collection
```sql
CREATE TABLE caught_pokemon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  pokemon_name TEXT NOT NULL,
  pokemon_sprite TEXT NOT NULL,
  pokemon_artwork TEXT NOT NULL,
  pokemon_types TEXT[] NOT NULL,
  caught_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  caught_with_problem TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_caught_pokemon_user_id ON caught_pokemon(user_id);
CREATE INDEX idx_caught_pokemon_pokemon_id ON caught_pokemon(user_id, pokemon_id);

-- Enable RLS
ALTER TABLE caught_pokemon ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own caught pokemon" ON caught_pokemon
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own caught pokemon" ON caught_pokemon
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own caught pokemon" ON caught_pokemon
  FOR DELETE USING (auth.uid() = user_id);
```

#### `achievements` - Achievement Progress
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create index
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);
```

#### `worksheet_results` - Completed Worksheets
```sql
CREATE TABLE worksheet_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  worksheet_id TEXT NOT NULL,
  worksheet_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  operation TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 3),
  time_spent_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_worksheet_results_user_id ON worksheet_results(user_id);

-- Enable RLS
ALTER TABLE worksheet_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own worksheet results" ON worksheet_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own worksheet results" ON worksheet_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2.2 Database Functions

#### Auto-create profile on signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, trainer_name)
  VALUES (NEW.id, '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Update timestamp trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_achievements_updated_at
  BEFORE UPDATE ON user_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Phase 3: Authentication Setup

### 3.1 Auth Providers to Enable
- [ ] Email/Password (primary)
- [ ] Google OAuth (optional, for easy signup)
- [ ] Anonymous auth (for try-before-signup experience)

### 3.2 Auth Configuration in Supabase Dashboard
- Configure email templates
- Set redirect URLs for OAuth
- Configure password requirements (simple for kids)

### 3.3 Create Auth Context
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Implementation here
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

## Phase 4: Supabase Client Setup

### 4.1 Create Supabase Client
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 4.2 Generate TypeScript Types
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

---

## Phase 5: Data Service Layer

### 5.1 Profile Service
```typescript
// src/services/profileService.ts
export const profileService = {
  async getProfile(userId: string) { ... },
  async updateProfile(userId: string, data: Partial<Profile>) { ... },
  async updateXP(userId: string, xpToAdd: number) { ... },
  async updateStreak(userId: string, streak: number) { ... },
  async recordDailyLogin(userId: string) { ... },
};
```

### 5.2 Pokemon Service
```typescript
// src/services/pokemonService.ts
export const pokemonService = {
  async getCaughtPokemon(userId: string) { ... },
  async catchPokemon(userId: string, pokemon: Pokemon, problem?: string) { ... },
  async getUniqueCount(userId: string) { ... },
  async isPokemonCaught(userId: string, pokemonId: number) { ... },
};
```

### 5.3 Achievement Service
```typescript
// src/services/achievementService.ts
export const achievementService = {
  async getAchievements(userId: string) { ... },
  async updateProgress(userId: string, achievementId: string, progress: number) { ... },
  async unlockAchievement(userId: string, achievementId: string) { ... },
};
```

### 5.4 Worksheet Service
```typescript
// src/services/worksheetService.ts
export const worksheetService = {
  async getCompletedWorksheets(userId: string) { ... },
  async saveWorksheetResult(userId: string, result: WorksheetResult) { ... },
  async getBestScore(userId: string, worksheetId: string) { ... },
};
```

---

## Phase 6: Hook Refactoring

### 6.1 Update useGameState Hook
- Replace localStorage calls with Supabase service calls
- Add loading states for async operations
- Implement optimistic updates for better UX
- Add error handling and retry logic

### 6.2 Create New Hooks
```typescript
// src/hooks/useProfile.ts - Profile data management
// src/hooks/usePokemon.ts - Pokemon collection
// src/hooks/useAchievements.ts - Achievement tracking
// src/hooks/useWorksheets.ts - Worksheet history
```

---

## Phase 7: Migration Strategy

### 7.1 LocalStorage to Supabase Migration
For existing users with localStorage data:

```typescript
// src/utils/migration.ts
export async function migrateLocalStorageToSupabase(userId: string) {
  const localData = localStorage.getItem('mathmon_game_state');
  if (!localData) return;

  const gameState = JSON.parse(localData);

  // Migrate profile data
  await profileService.updateProfile(userId, {
    trainer_name: gameState.trainerName,
    xp: gameState.xp,
    level: gameState.level,
    highest_streak: gameState.highestStreak,
    // ... other fields
  });

  // Migrate caught Pokemon
  for (const pokemon of gameState.caughtPokemon) {
    await pokemonService.catchPokemon(userId, pokemon, pokemon.caughtWithProblem);
  }

  // Migrate achievements
  for (const achievement of gameState.achievements) {
    await achievementService.updateProgress(userId, achievement.id, achievement.current);
  }

  // Migrate worksheet results
  for (const result of gameState.worksheetsCompleted) {
    await worksheetService.saveWorksheetResult(userId, result);
  }

  // Clear localStorage after successful migration
  localStorage.removeItem('mathmon_game_state');
}
```

### 7.2 Offline Support Strategy
- Use localStorage as cache layer
- Sync to Supabase when online
- Queue offline actions for later sync
- Show sync status to user

---

## Phase 8: UI Updates

### 8.1 Auth Screens to Create
- [ ] `LoginScreen.tsx` - Email/password login
- [ ] `SignUpScreen.tsx` - New account creation
- [ ] `ForgotPasswordScreen.tsx` - Password reset

### 8.2 Update Existing Screens
- [ ] `HomeScreen.tsx` - Add login/logout, show sync status
- [ ] `Profile.tsx` - Add account settings, logout button

### 8.3 Loading States
- Add skeleton loaders for data fetching
- Show sync indicators
- Handle offline mode gracefully

---

## Phase 9: Testing

### 9.1 Test Cases to Add
- [ ] Auth flow tests (signup, login, logout)
- [ ] Profile CRUD operations
- [ ] Pokemon catching and retrieval
- [ ] Achievement updates
- [ ] Worksheet result saving
- [ ] Data migration tests
- [ ] Offline/online sync tests

### 9.2 Supabase Local Development
```bash
npx supabase init
npx supabase start
npx supabase db reset
```

---

## Phase 10: Deployment Considerations

### 10.1 Environment Variables
- Set up production environment variables
- Configure Vercel/Netlify with Supabase keys

### 10.2 Security Checklist
- [ ] RLS policies tested and working
- [ ] No sensitive data exposed in client
- [ ] Rate limiting configured
- [ ] Auth settings hardened

### 10.3 Performance
- [ ] Indexes created for common queries
- [ ] Connection pooling enabled
- [ ] Edge functions for complex operations (if needed)

---

## Data Model Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         auth.users                               │
│  (Managed by Supabase Auth)                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:1
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          profiles                                │
│  - trainer_name, xp, level, streaks, daily rewards, stats       │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
          │ 1:N                │ 1:N                │ 1:N
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  caught_pokemon   │  │ user_achievements │  │ worksheet_results │
│  - pokemon data   │  │ - progress        │  │ - scores, stars   │
│  - caught date    │  │ - unlock date     │  │ - time spent      │
│  - problem solved │  │                   │  │                   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Implementation Order

1. **Week 1: Foundation**
   - Set up Supabase project
   - Create database schema
   - Set up RLS policies
   - Install dependencies and configure client

2. **Week 2: Authentication**
   - Implement auth context
   - Create login/signup screens
   - Add auth to App component

3. **Week 3: Data Services**
   - Create service layer
   - Refactor useGameState hook
   - Implement migration utility

4. **Week 4: Testing & Polish**
   - Write tests
   - Add loading states
   - Handle edge cases
   - Deploy and test in production

---

## Files to Create/Modify

### New Files
- `src/lib/supabase.ts`
- `src/lib/database.types.ts`
- `src/contexts/AuthContext.tsx`
- `src/services/profileService.ts`
- `src/services/pokemonService.ts`
- `src/services/achievementService.ts`
- `src/services/worksheetService.ts`
- `src/utils/migration.ts`
- `src/components/screens/LoginScreen.tsx`
- `src/components/screens/SignUpScreen.tsx`
- `.env` and `.env.example`

### Files to Modify
- `src/hooks/useGameState.ts` - Major refactor
- `src/App.tsx` - Add AuthProvider, routing
- `src/components/screens/HomeScreen.tsx` - Auth UI
- `src/components/screens/Profile.tsx` - Account settings
- `package.json` - New dependencies
- `.gitignore` - Env files

---

## Questions to Resolve Before Starting

1. **Auth method preference**: Email/password only, or add social login?
2. **Anonymous play**: Allow playing without account, then prompt to save?
3. **Offline mode**: Priority level for offline support?
4. **Data conflict resolution**: How to handle conflicts if same user plays on two devices?
5. **Account deletion**: GDPR compliance - full data deletion flow?

---

*Ready to implement when you are!*
