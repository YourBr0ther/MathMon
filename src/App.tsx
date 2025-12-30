import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { Screen, Worksheet, Pokemon, WorksheetResult, DailyReward } from './types';
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';
import { HomeScreen } from './components/screens/HomeScreen';
import { preloadStarters, preloadCommonSprites } from './utils/pokemonApi';
import { DailyRewardModal, DailyRewardIndicator } from './components/common/DailyReward';

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

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);

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
  } = useGameState();

  const { playSound, isMuted, toggleMute } = useSound();

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

      {/* Sound Toggle Button - Kawaii Style */}
      <motion.button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 nav-btn"
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

export default App;
