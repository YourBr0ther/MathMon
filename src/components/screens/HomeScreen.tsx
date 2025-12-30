import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, GraduationCap, BookOpen, User, Heart, Sparkles, Star } from 'lucide-react';
import { Screen, GameState } from '../../types';
import { Button } from '../common/Button';
import { MAX_POKEMON_ID } from '../../data/pokemonConfig';

interface HomeScreenProps {
  gameState: GameState;
  onNavigate: (screen: Screen) => void;
  onSetTrainerName: (name: string) => void;
}

export function HomeScreen({ gameState, onNavigate, onSetTrainerName }: HomeScreenProps) {
  const [showNameInput, setShowNameInput] = useState(!gameState.trainerName);
  const [nameInput, setNameInput] = useState(gameState.trainerName);

  const handleSubmitName = () => {
    if (nameInput.trim()) {
      onSetTrainerName(nameInput.trim());
      setShowNameInput(false);
    }
  };

  const uniquePokemonCount = new Set(gameState.caughtPokemon.map(p => p.id)).size;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center page-container">
      {/* Logo/Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-2 sm:mb-8"
      >
        {/* Decorative stars */}
        <motion.span
          className="star-decoration inline-block mr-2 sm:mr-3"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
        </motion.span>

        <h1 className="title-main text-3xl sm:text-5xl md:text-7xl mb-0.5 sm:mb-1 inline">
          MathMon
        </h1>

        <motion.span
          className="star-decoration inline-block ml-2 sm:ml-3"
          animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        >
          <Star className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />
        </motion.span>

        <h2 className="title-sub text-lg sm:text-3xl md:text-4xl mt-0.5 sm:mt-2">
          Quest
        </h2>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-1 sm:mt-3"
        >
          <Heart className="w-5 h-5 sm:w-10 sm:h-10 mx-auto text-[#FFADC6] fill-[#FFADC6] drop-shadow-lg" />
        </motion.div>
      </motion.div>

      {/* Name Input or Welcome */}
      {showNameInput ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="game-card p-5 sm:p-6 md:p-8 w-full max-w-sm mb-6 sm:mb-8"
        >
          <h3 className="font-display text-lg sm:text-xl font-bold text-[#5D4E60] mb-2 text-center">
            What's your name, trainer?
          </h3>
          <p className="text-[#8B7A9E] text-xs sm:text-sm text-center mb-3 sm:mb-4">
            Start your Pokemon adventure!
          </p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitName()}
            placeholder="Enter your name"
            className="input-kawaii w-full mb-4 sm:mb-5"
            autoFocus
            maxLength={20}
          />
          <Button onClick={handleSubmitName} fullWidth disabled={!nameInput.trim()}>
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Start Adventure!
            </span>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-2 sm:mb-6"
        >
          <p className="title-sub text-xs sm:text-lg">
            Welcome back,
          </p>
          <p className="title-main text-lg sm:text-3xl">
            {gameState.trainerName}!
          </p>
        </motion.div>
      )}

      {/* Stats Preview with Collection Progress */}
      {!showNameInput && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="game-card p-3 sm:p-5 w-full max-w-sm mb-3 sm:mb-6"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="stat-card p-2 sm:p-3">
              <p className="stat-value text-base sm:text-xl text-[#8EC5FC]">{uniquePokemonCount}</p>
              <p className="stat-label text-[9px] sm:text-xs">Caught</p>
            </div>
            <div className="stat-card p-2 sm:p-3">
              <p className="stat-value text-base sm:text-xl text-[#FFCA28]">{gameState.highestStreak}</p>
              <p className="stat-label text-[9px] sm:text-xs">Streak</p>
            </div>
            <div className="stat-card p-2 sm:p-3">
              <p className="stat-value text-base sm:text-xl text-[#8DD99B]">{gameState.level}</p>
              <p className="stat-label text-[9px] sm:text-xs">Level</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Game Mode Buttons */}
      {!showNameInput && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2 sm:gap-4 w-full max-w-sm"
        >
          <Button onClick={() => onNavigate('endless')} fullWidth size="large">
            <span className="flex items-center justify-center gap-2 sm:gap-3">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-lg">Pokemon Safari</span>
            </span>
          </Button>

          <Button onClick={() => onNavigate('worksheetSelect')} variant="secondary" fullWidth size="large">
            <span className="flex items-center justify-center gap-2 sm:gap-3">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-lg">Trainer Academy</span>
            </span>
          </Button>

          <div className="flex gap-2 sm:gap-4">
            <Button onClick={() => onNavigate('pokedex')} variant="pink" fullWidth>
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Pokedex</span>
              </span>
            </Button>

            <Button onClick={() => onNavigate('profile')} variant="mint" fullWidth>
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Profile</span>
              </span>
            </Button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
