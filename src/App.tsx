import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, LogOut, Music, MusicOff } from 'lucide-react';
import { Screen, Worksheet, Pokemon, WorksheetResult, DailyReward, AuthScreen } from './types';
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HomeScreen } from './components/screens/HomeScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { SignUpScreen } from './components/screens/SignUpScreen';
import { preloadStarters, preloadCommonSprites } from './utils/pokemonApi';
import { DailyRewardModal, DailyRewardIndicator } from './components/common/DailyReward';
import { isSupabaseConfigured } from './lib/supabase';
import { migrateLocalStorageToSupabase, hasLocalStorageData, clearLocalData } from './utils/migration';
import { SyncIndicator } from './components/common/SyncIndicator';
import { clearQueue as clearSyncQueue } from './services/cloudSync';

// Lazy load heavier screens for better performance
const EndlessMode = lazy(() => import('./components/screens/EndlessMode').then(m => ({ default: m.EndlessMode })));
const WorksheetSelect = lazy(() => import('./components/screens/WorksheetSelect').then(m => ({ default: m.WorksheetSelect })));
const WorksheetMode = lazy(() => import('./components/screens/WorksheetMode').then(m => ({ default: m.WorksheetMode })));
const Pokedex = lazy(() => import('./components/screens/Pokedex').then(m => ({ default: m.Pokedex })));
const Profile = lazy(() => import('./components/screens/Profile').then(m => ({ default: m.Profile })));

// Loading fallback component
function ScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-4 border-[#FFADC6] border-t-transparent"
      />
    </div>
  );
}

// Inner app component that uses auth context
function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);

  const {
    user,
    loading: authLoading,
    isConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
  } = useAuth();

  const {
    gameState,
    isLoaded,
    catchPokemon,
    setCurrentStreak,
    recordAnswerResult,
    completeWorksheetResult,
    setTrainerName,
    canClaimReward,
    currentStreakDay,
    claimDailyReward,
  } = useGameState(user?.id);

  const { playSound, isMuted, toggleMute } = useSound();
  const { isEnabled: isMusicEnabled, toggleMusic, play: playMusic } = useBackgroundMusic();

  // Handle data migration when user logs in
  useEffect(() => {
    const handleMigration = async () => {
      if (user && hasLocalStorageData() && !migrationDone) {
        const result = await migrateLocalStorageToSupabase(user.id);
        if (result.success) {
          console.log('Migration complete:', result.stats);
          setMigrationDone(true);
        }
      }
    };
    handleMigration();
  }, [user, migrationDone]);

  // Determine if we should show auth screens
  const showAuth = isConfigured && !user && !offlineMode && !authLoading;

  // Preload starter Pokemon and common sprites on mount
  useEffect(() => {
    Promise.all([
      preloadStarters(),
      preloadCommonSprites(),
    ]).catch(console.error);
  }, []);

  // Show daily reward popup when loaded and can claim
  useEffect(() => {
    if (isLoaded && canClaimReward && gameState.trainerName) {
      // Small delay so user sees the home screen first
      const timer = setTimeout(() => setShowDailyReward(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, canClaimReward, gameState.trainerName]);

  // Handle daily reward claim
  const handleClaimDailyReward = useCallback((reward: DailyReward) => {
    playSound('victory');
    claimDailyReward(reward);
    setTimeout(() => setShowDailyReward(false), 500);
  }, [playSound, claimDailyReward]);

  // Navigation handler
  const handleNavigate = useCallback((screen: Screen) => {
    playSound('click');
    setCurrentScreen(screen);
  }, [playSound]);

  // Handle worksheet selection
  const handleSelectWorksheet = useCallback((worksheet: Worksheet) => {
    setSelectedWorksheet(worksheet);
    setCurrentScreen('worksheet');
  }, []);

  // Handle Pokemon catch
  const handleCatchPokemon = useCallback((pokemon: Pokemon, problemText: string) => {
    catchPokemon(pokemon, problemText);
  }, [catchPokemon]);

  // Handle worksheet completion
  const handleCompleteWorksheet = useCallback((result: WorksheetResult) => {
    completeWorksheetResult(result);
  }, [completeWorksheetResult]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    clearLocalData(); // Clear localStorage before signing out
    clearSyncQueue(); // Clear pending sync operations
    await signOut();
    setOfflineMode(false);
  }, [signOut]);

  // Auth loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full pokeball-gradient border-4 border-gray-800"
          />
          <p className="text-white text-xl font-bold">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Auth screens (login/signup)
  if (showAuth) {
    if (authScreen === 'signup') {
      return (
        <div className="min-h-screen relative">
          <div className="bg-dreamscape">
            {/* Soft floating clouds */}
            <motion.div
              className="cloud"
              style={{ top: '10%', left: '5%', width: '180px', height: '80px' }}
              animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="cloud"
              style={{ top: '25%', right: '10%', width: '140px', height: '60px' }}
              animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </div>
          <SignUpScreen
            onSignUp={signUp}
            onSwitchToLogin={() => setAuthScreen('login')}
            onPlayOffline={() => setOfflineMode(true)}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen relative">
        <div className="bg-dreamscape">
          {/* Soft floating clouds */}
          <motion.div
            className="cloud"
            style={{ top: '10%', left: '5%', width: '180px', height: '80px' }}
            animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="cloud"
            style={{ top: '25%', right: '10%', width: '140px', height: '60px' }}
            animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>
        <LoginScreen
          onLogin={signIn}
          onSwitchToSignUp={() => setAuthScreen('signup')}
          onForgotPassword={resetPassword}
          onPlayOffline={() => setOfflineMode(true)}
        />
      </div>
    );
  }

  // Loading screen
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full pokeball-gradient border-4 border-gray-800"
          />
          <p className="text-white text-xl font-bold">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Screen renderer with lazy loading
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            gameState={gameState}
            onNavigate={handleNavigate}
            onSetTrainerName={setTrainerName}
          />
        );

      case 'endless':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <EndlessMode
              highestStreak={gameState.highestStreak}
              totalCatches={gameState.caughtPokemon.length}
              onCatchPokemon={handleCatchPokemon}
              onUpdateStreak={setCurrentStreak}
              onRecordAnswer={recordAnswerResult}
              onNavigate={handleNavigate}
              playSound={playSound}
            />
          </Suspense>
        );

      case 'worksheetSelect':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <WorksheetSelect
              onNavigate={handleNavigate}
              onSelectWorksheet={handleSelectWorksheet}
            />
          </Suspense>
        );

      case 'worksheet':
        return (
          <Suspense fallback={<ScreenLoader />}>
            {selectedWorksheet ? (
              <WorksheetMode
                worksheet={selectedWorksheet}
                onComplete={handleCompleteWorksheet}
                onCatchPokemon={handleCatchPokemon}
                onRecordAnswer={recordAnswerResult}
                onNavigate={handleNavigate}
                playSound={playSound}
              />
            ) : (
              <WorksheetSelect
                onNavigate={handleNavigate}
                onSelectWorksheet={handleSelectWorksheet}
              />
            )}
          </Suspense>
        );

      case 'pokedex':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <Pokedex
              caughtPokemon={gameState.caughtPokemon}
              onNavigate={handleNavigate}
            />
          </Suspense>
        );

      case 'profile':
        return (
          <Suspense fallback={<ScreenLoader />}>
            <Profile
              gameState={gameState}
              onNavigate={handleNavigate}
            />
          </Suspense>
        );

      default:
        return (
          <HomeScreen
            gameState={gameState}
            onNavigate={handleNavigate}
            onSetTrainerName={setTrainerName}
          />
        );
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Floating Dreamscape Background */}
      <div className="bg-dreamscape">
        {/* Soft floating clouds */}
        <motion.div
          className="cloud"
          style={{ top: '10%', left: '5%', width: '180px', height: '80px' }}
          animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="cloud"
          style={{ top: '25%', right: '10%', width: '140px', height: '60px' }}
          animate={{ x: [0, -20, 0], y: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="cloud"
          style={{ bottom: '30%', left: '15%', width: '120px', height: '50px' }}
          animate={{ x: [0, 15, 0], y: [0, -8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />
        <motion.div
          className="cloud"
          style={{ bottom: '15%', right: '20%', width: '160px', height: '70px' }}
          animate={{ x: [0, -25, 0], y: [0, 12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="sparkle"
            style={{
              top: `${15 + (i * 10)}%`,
              left: `${10 + (i * 12) % 80}%`,
              animationDelay: `${i * 0.5}s`,
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + (i * 0.3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Top Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Cloud sync indicator */}
        {user && <SyncIndicator />}

        {/* Offline mode indicator */}
        {offlineMode && !user && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="nav-btn flex items-center gap-1.5 px-3"
            onClick={() => setOfflineMode(false)}
            title="Playing offline - click to sign in"
          >
            <span className="text-xs text-[#8B7A9E]">Offline</span>
          </motion.button>
        )}

        {/* Logout button */}
        {user && (
          <motion.button
            onClick={handleLogout}
            className="nav-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Sign out"
          >
            <LogOut className="w-5 h-5 text-[#8B7A9E]" />
          </motion.button>
        )}

        {/* Music Toggle Button */}
        <motion.button
          onClick={() => {
            toggleMusic();
            // User interaction enables autoplay
            if (!isMusicEnabled) playMusic();
          }}
          className="nav-btn"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          title={isMusicEnabled ? 'Turn off music' : 'Turn on music'}
        >
          {isMusicEnabled ? (
            <Music className="w-5 h-5 text-[#8B7A9E]" />
          ) : (
            <MusicOff className="w-5 h-5 text-[#8B7A9E]" />
          )}
        </motion.button>

        {/* Sound Toggle Button */}
        <motion.button
          onClick={toggleMute}
          className="nav-btn"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-[#8B7A9E]" />
          ) : (
            <Volume2 className="w-5 h-5 text-[#8B7A9E]" />
          )}
        </motion.button>
      </div>

      {/* Daily Reward Modal */}
      <AnimatePresence>
        {showDailyReward && (
          <DailyRewardModal
            currentStreakDay={currentStreakDay}
            onClaim={handleClaimDailyReward}
            onClose={() => setShowDailyReward(false)}
          />
        )}
      </AnimatePresence>

      {/* Daily Reward Indicator - shows when reward available but modal closed */}
      {canClaimReward && !showDailyReward && gameState.trainerName && (
        <DailyRewardIndicator onClick={() => setShowDailyReward(true)} />
      )}

      {/* Screen Content with Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Wrapper component that provides Auth context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
