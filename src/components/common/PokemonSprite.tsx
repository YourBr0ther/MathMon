import { memo } from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '../../types';
import { getPokemonRarity } from '../../data/pokemonConfig';
import { TYPE_COLORS } from '../../utils/pokemonApi';

interface PokemonSpriteProps {
  pokemon: Pokemon;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showName?: boolean;
  animated?: boolean;
  onClick?: () => void;
  useArtwork?: boolean;
}

const sizeClasses = {
  small: 'w-16 h-16',
  medium: 'w-24 h-24',
  large: 'w-32 h-32',
  xlarge: 'w-48 h-48',
};

const rarityColors = {
  common: 'from-gray-100 to-gray-200',
  uncommon: 'from-green-100 to-green-200',
  rare: 'from-blue-100 to-blue-300',
  legendary: 'from-purple-200 to-yellow-200',
};

const rarityGlow = {
  common: '',
  uncommon: 'shadow-lg shadow-green-300/50',
  rare: 'shadow-lg shadow-blue-400/50',
  legendary: 'shadow-xl shadow-yellow-400/70 animate-pulse',
};

export const PokemonSprite = memo(function PokemonSprite({
  pokemon,
  size = 'medium',
  showName = false,
  animated = false,
  onClick,
  useArtwork = false,
}: PokemonSpriteProps) {
  const rarity = getPokemonRarity(pokemon.id);
  const primaryType = pokemon.types[0];
  const typeColor = TYPE_COLORS[primaryType] || '#A8A878';

  const imageUrl = useArtwork ? pokemon.officialArtwork : pokemon.sprite;

  return (
    <motion.div
      className={`flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      <div
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br ${rarityColors[rarity]}
          rounded-full p-2
          ${rarityGlow[rarity]}
          flex items-center justify-center
          border-4
        `}
        style={{ borderColor: typeColor }}
      >
        <motion.img
          src={imageUrl}
          alt={pokemon.name}
          className={`pokemon-sprite ${useArtwork ? '' : 'w-full h-full'} object-contain`}
          style={{ imageRendering: useArtwork ? 'auto' : 'pixelated' }}
          animate={animated ? {
            y: [0, -5, 0],
          } : undefined}
          transition={animated ? {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          } : undefined}
          loading="lazy"
        />
      </div>
      {showName && (
        <span className="mt-2 text-sm font-bold text-gray-700 text-center">
          {pokemon.name}
        </span>
      )}
    </motion.div>
  );
});

// Type badge component
interface TypeBadgeProps {
  type: string;
  size?: 'small' | 'medium';
}

export const TypeBadge = memo(function TypeBadge({ type, size = 'small' }: TypeBadgeProps) {
  const color = TYPE_COLORS[type as keyof typeof TYPE_COLORS] || '#A8A878';
  const sizeClass = size === 'small'
    ? 'px-3 py-1 text-[10px] min-w-[60px]'
    : 'px-4 py-1.5 text-xs min-w-[70px]';

  return (
    <span
      className={`${sizeClass} rounded-full font-bold text-white uppercase tracking-wider text-center inline-block shadow-sm`}
      style={{ backgroundColor: color }}
    >
      {type}
    </span>
  );
});
