import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Gamepad2, Sparkles } from 'lucide-react';
import { Screen, Pokemon, PokemonType } from '../../types';
import { MAX_POKEMON_ID, getPokemonRarity } from '../../data/pokemonConfig';
import { IconButton, Button } from '../common/Button';
import { PokemonSprite, TypeBadge } from '../common/PokemonSprite';
import { ProgressBar } from '../common/ProgressBar';

interface PokedexProps {
  caughtPokemon: Pokemon[];
  onNavigate: (screen: Screen) => void;
}

type SortOption = 'recent' | 'id' | 'name' | 'type';
type FilterOption = 'all' | PokemonType;

export function Pokedex({ caughtPokemon, onNavigate }: PokedexProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  // Get unique Pokemon (latest catch of each)
  const uniquePokemon = useMemo(() => {
    const pokemonMap = new Map<number, Pokemon>();
    caughtPokemon.forEach(p => pokemonMap.set(p.id, p));
    return Array.from(pokemonMap.values());
  }, [caughtPokemon]);

  // Filter Pokemon
  const filteredPokemon = useMemo(() => {
    if (filterBy === 'all') return uniquePokemon;
    return uniquePokemon.filter(p => p.types.includes(filterBy));
  }, [uniquePokemon, filterBy]);

  // Sort Pokemon
  const sortedPokemon = useMemo(() => {
    const sorted = [...filteredPokemon];
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = a.caughtAt ? new Date(a.caughtAt).getTime() : 0;
          const dateB = b.caughtAt ? new Date(b.caughtAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'id':
        return sorted.sort((a, b) => a.id - b.id);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'type':
        return sorted.sort((a, b) => a.types[0].localeCompare(b.types[0]));
      default:
        return sorted;
    }
  }, [filteredPokemon, sortBy]);

  const uniqueCount = uniquePokemon.length;

  // Get all caught types for filter
  const caughtTypes = useMemo(() => {
    const types = new Set<PokemonType>();
    uniquePokemon.forEach(p => p.types.forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, [uniquePokemon]);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 pb-3 sm:pb-4 bg-gradient-to-b from-[#E0C3FC]/30 to-transparent backdrop-blur-sm">
        <div className="flex items-center py-3 sm:py-4" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
          <IconButton
            icon={<ArrowLeft className="w-5 h-5 text-[#6B5B7A]" />}
            onClick={() => onNavigate('home')}
            ariaLabel="Go back"
            variant="ghost"
          />
          <h1 className="title-main text-2xl sm:text-3xl ml-3 sm:ml-4">Pokedex</h1>
        </div>

        {/* Progress Card */}
        <div style={{ marginLeft: '16px', marginRight: '16px' }}>
          <div className="game-card p-4 sm:p-5 relative overflow-hidden">
            {/* Decorative pokeball background */}
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full border-4 border-[#FFADC6]/20 opacity-30" />
            <div className="absolute -right-8 -top-8 w-24 h-24">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#FFADC6]/20" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#FFE082] to-[#FFCA28] flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-[#5D4E60] font-display font-bold text-sm sm:text-base">Collection</span>
                </div>
                <div className="text-right">
                  <span className="font-display font-bold text-[#8EC5FC] text-lg sm:text-xl">
                    {uniqueCount}
                  </span>
                  <span className="text-[#8B7A9E] text-sm sm:text-base font-medium">/{MAX_POKEMON_ID}</span>
                </div>
              </div>
              <ProgressBar
                current={uniqueCount}
                max={MAX_POKEMON_ID}
              />
              <p className="text-center text-xs sm:text-sm text-[#8B7A9E] mt-2 sm:mt-3 font-medium">
                {Math.round((uniqueCount / MAX_POKEMON_ID) * 100)}% of all Pokemon caught!
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="mt-3 sm:mt-4 flex gap-2 pb-2" style={{ marginLeft: '16px', marginRight: '16px' }}>
          <div className="relative flex-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none bg-white/80 backdrop-blur-sm border-2 border-[#E0C3FC]/50 text-[#5D4E60] font-display font-semibold py-2.5 sm:py-3 px-4 sm:px-5 text-xs sm:text-sm rounded-2xl shadow-sm hover:border-[#FFADC6]/70 focus:border-[#FFADC6] focus:outline-none focus:ring-2 focus:ring-[#FFADC6]/30 transition-all cursor-pointer"
            >
              <option value="recent">✨ Recent</option>
              <option value="id">🔢 Number</option>
              <option value="name">📝 Name</option>
              <option value="type">🏷️ Type</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B7A9E]">
              ▼
            </div>
          </div>

          <div className="relative flex-1">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="w-full appearance-none bg-white/80 backdrop-blur-sm border-2 border-[#A8EDEA]/50 text-[#5D4E60] font-display font-semibold py-2.5 sm:py-3 px-4 sm:px-5 text-xs sm:text-sm rounded-2xl shadow-sm hover:border-[#8EC5FC]/70 focus:border-[#8EC5FC] focus:outline-none focus:ring-2 focus:ring-[#8EC5FC]/30 transition-all cursor-pointer"
            >
              <option value="all">🌟 All Types</option>
              {caughtTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B7A9E]">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Pokemon Grid */}
      <div className="flex-1 py-3 sm:py-4" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        {sortedPokemon.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <motion.div
              className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-full bg-white/50"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#8EC5FC]" />
            </motion.div>
            <p className="title-sub text-lg sm:text-xl mb-2">No Pokemon yet!</p>
            <p className="text-[#8B7A9E] text-sm sm:text-base">Play Pokemon Safari to catch some!</p>
            <Button onClick={() => onNavigate('endless')} className="mt-3 sm:mt-4">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                Start Catching!
              </span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {sortedPokemon.map((pokemon, index) => (
              <motion.div
                key={pokemon.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className="pokedex-slot-filled"
                onClick={() => setSelectedPokemon(pokemon)}
              >
                <PokemonSprite
                  pokemon={pokemon}
                  size="medium"
                  showName
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pokemon Detail Modal */}
      <AnimatePresence>
        {selectedPokemon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setSelectedPokemon(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="modal-content p-4 sm:p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-1 sm:mb-2">
                <IconButton
                  icon={<X className="w-5 h-5 text-[#8B7A9E]" />}
                  onClick={() => setSelectedPokemon(null)}
                  ariaLabel="Close"
                  size="small"
                />
              </div>

              <div className="flex flex-col items-center">
                <motion.div
                  className="pokemon-container border-[#FFADC6] p-3 sm:p-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img
                    src={selectedPokemon.officialArtwork}
                    alt={selectedPokemon.name}
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                  />
                </motion.div>

                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#5D4E60] mt-3 sm:mt-4">
                  {selectedPokemon.name}
                </h2>

                <p className="text-[#8B7A9E] text-xs sm:text-sm">#{selectedPokemon.id.toString().padStart(3, '0')}</p>

                <div className="flex gap-2 mt-2 sm:mt-3">
                  {selectedPokemon.types.map(type => (
                    <TypeBadge key={type} type={type} size="medium" />
                  ))}
                </div>

                <div className="mt-3 sm:mt-4 text-center card-soft p-3 sm:p-4 w-full">
                  <p className="text-xs sm:text-sm text-[#5D4E60]">
                    Rarity: <span className="font-display font-semibold capitalize text-[#FFCA28]">{getPokemonRarity(selectedPokemon.id)}</span>
                  </p>
                  {selectedPokemon.caughtAt && (
                    <p className="text-[10px] sm:text-xs text-[#8B7A9E] mt-1">
                      Caught: {new Date(selectedPokemon.caughtAt).toLocaleDateString()}
                    </p>
                  )}
                  {selectedPokemon.caughtWithProblem && (
                    <p className="text-[10px] sm:text-xs text-[#8B7A9E] mt-1">
                      Problem: {selectedPokemon.caughtWithProblem}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
