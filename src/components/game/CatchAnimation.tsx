import { motion, AnimatePresence } from 'framer-motion';
import { Pokemon } from '../../types';
import { getPokemonRarity } from '../../data/pokemonConfig';

interface CatchAnimationProps {
  pokemon: Pokemon | null;
  isVisible: boolean;
  onComplete: () => void;
}

export function CatchAnimation({ pokemon, isVisible, onComplete }: CatchAnimationProps) {
  if (!pokemon) return null;

  const rarity = getPokemonRarity(pokemon.id);
  const rarityText = {
    common: '',
    uncommon: 'Uncommon!',
    rare: 'Rare!',
    legendary: 'LEGENDARY!',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative flex flex-col items-center"
          >
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#FFCB05', '#3B4CCA', '#FF0000', '#78C850', '#F08030'][i % 5],
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 300,
                    y: (Math.random() - 0.5) * 300,
                    opacity: 0,
                  }}
                  transition={{ duration: 1, delay: i * 0.02 }}
                />
              ))}
            </div>

            {/* Sparkles */}
            <motion.div
              className="absolute -inset-10"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-80px)`,
                  }}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                >
                  ✨
                </motion.span>
              ))}
            </motion.div>

            {/* Pokemon */}
            <motion.div
              className="relative z-10"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className={`
                w-48 h-48 rounded-full
                flex items-center justify-center
                bg-gradient-to-br
                ${rarity === 'legendary' ? 'from-yellow-200 via-purple-200 to-pink-200' :
                  rarity === 'rare' ? 'from-blue-200 to-purple-200' :
                  rarity === 'uncommon' ? 'from-green-200 to-teal-200' :
                  'from-white to-gray-100'}
                ${rarity === 'legendary' ? 'shadow-2xl shadow-yellow-400/50 animate-pulse' : 'shadow-xl'}
              `}>
                <img
                  src={pokemon.officialArtwork}
                  alt={pokemon.name}
                  className="w-40 h-40 object-contain drop-shadow-2xl"
                />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                You caught
              </h2>
              <h1 className="text-4xl md:text-5xl font-bold text-pokemon-yellow drop-shadow-lg">
                {pokemon.name}!
              </h1>
              {rarityText[rarity] && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className={`
                    mt-2 text-xl font-bold
                    ${rarity === 'legendary' ? 'text-yellow-300 animate-pulse' :
                      rarity === 'rare' ? 'text-blue-300' : 'text-green-300'}
                  `}
                >
                  {rarityText[rarity]}
                </motion.p>
              )}
            </motion.div>

            {/* Tap to continue */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-white/70 text-sm"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pokeball animation component
interface PokeballProps {
  isShaking?: boolean;
  onClick?: () => void;
}

export function Pokeball({ isShaking, onClick }: PokeballProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`
        w-16 h-16 rounded-full cursor-pointer
        pokeball-gradient
        border-4 border-gray-800
        relative
        ${isShaking ? 'animate-shake' : ''}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Center button */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-4 border-gray-800" />
    </motion.div>
  );
}
