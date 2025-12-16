import React from 'react';
import { CardProps } from './types';

/**
 * Type-based pastel color mapping for Pokemon cards
 * Creates collectible, friendly appearance with soft backgrounds
 */
const typeColors: Record<string, string> = {
  fire: 'bg-orange-50',
  water: 'bg-blue-50',
  grass: 'bg-green-50',
  electric: 'bg-yellow-50',
  psychic: 'bg-purple-50',
  ice: 'bg-cyan-50',
  dragon: 'bg-indigo-50',
  dark: 'bg-gray-100',
  fairy: 'bg-pink-50',
  normal: 'bg-gray-50',
  fighting: 'bg-red-50',
  flying: 'bg-sky-50',
  poison: 'bg-violet-50',
  ground: 'bg-amber-50',
  rock: 'bg-stone-50',
  bug: 'bg-lime-50',
  ghost: 'bg-purple-50',
  steel: 'bg-slate-50',
};

/**
 * PokemonCard Component
 * Polished, modern card design with uniform dimensions and high-contrast CTA
 */
export const PokemonCard: React.FC<CardProps> = ({ pokemon, isOwned, onBuy }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isShaking, setIsShaking] = React.useState(false);

  const primaryType = pokemon.types[0]?.toLowerCase() || 'normal';
  const bgClass = typeColors[primaryType] || typeColors.normal;

  const handleBuyClick = () => {
    if (!isOwned) {
      // Trigger shake animation for feedback
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    onBuy(pokemon);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Card Container - Exact uniform dimensions */}
      <div
        className={`relative flex flex-col ${bgClass} rounded-2xl shadow-md border border-gray-200 transition-all duration-300 overflow-hidden ${
          isHovered ? 'hover:-translate-y-1 hover:shadow-2xl' : ''
        } ${isShaking ? 'animate-shake' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          width: '320px', 
          height: '480px' // Fixed height for uniformity
        }}
      >
        {/* Owned Badge */}
        {isOwned && (
          <div className="absolute top-3 right-3 z-20 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
            <span>✅</span>
            <span>OWNED</span>
          </div>
        )}

        {/* Image Area - Fixed height with white frame */}
        <div 
          className="relative flex items-center justify-center bg-white/50"
          style={{ height: '224px' }} // Fixed h-56 equivalent
        >
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="object-contain transition-transform duration-300 hover:scale-110"
            style={{ 
              width: '180px', 
              height: '180px',
              padding: '16px'
            }}
            onError={(e) => {
              e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
            }}
          />
        </div>

        {/* Card Content - Remaining space */}
        <div 
          className="p-4 flex flex-col justify-between bg-white/80"
          style={{ height: '256px' }} // Remaining space for content
        >
          {/* Pokemon Info */}
          <div className="space-y-2">
            {/* Name - Truncate long names */}
            <h3 
              className="text-lg font-bold text-gray-800 capitalize text-center truncate"
              title={pokemon.name}
            >
              {pokemon.name}
            </h3>

            {/* Pokémon ID */}
            <p className="text-sm text-gray-500 font-semibold text-center">#{pokemon.id}</p>

            {/* Types - Horizontal layout for space efficiency */}
            <div className="flex flex-wrap justify-center gap-1">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-white/70 rounded-full text-xs font-medium text-gray-700 capitalize border border-gray-300"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Grid - Clean 2x2 layout */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 my-3">
            <div className="flex justify-between">
              <span>HP:</span>
              <span className="font-bold">{pokemon.stats.hp}</span>
            </div>
            <div className="flex justify-between">
              <span>ATK:</span>
              <span className="font-bold">{pokemon.stats.attack}</span>
            </div>
            <div className="flex justify-between">
              <span>DEF:</span>
              <span className="font-bold">{pokemon.stats.defense}</span>
            </div>
            <div className="flex justify-between">
              <span>SPD:</span>
              <span className="font-bold">{pokemon.stats.speed}</span>
            </div>
          </div>

          {/* Purchase Section */}
          <div className="space-y-2">
            {/* Price Display */}
            <div className="flex items-center justify-center gap-1 text-sm font-bold text-blue-600">
              <span>💎</span>
              <span>{pokemon.price.toLocaleString()} Coins</span>
            </div>

            {/* High-Contrast Buy Button */}
            <button
              onClick={handleBuyClick}
              disabled={isOwned}
              className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${
                isOwned
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transform'
              }`}
            >
              {isOwned ? '✅ Collected' : '🛒 Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
