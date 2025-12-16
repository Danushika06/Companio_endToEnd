import React, { useState, useEffect } from 'react';
import { Pokemon, PokemonStats } from './types';
import { PokemonCard } from './PokemonCard';

/**
 * Interface for PokeAPI responses
 */
interface PokeAPIListResult {
  name: string;
  url: string;
}

interface PokeAPIResponse {
  results: PokeAPIListResult[];
}

interface PokeAPIPokemonDetail {
  id: number;
  name: string;
  sprites: {
    other: {
      dream_world: {
        front_default: string | null;
      };
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  base_experience: number;
}

/**
 * PokemonGrid Component
 * Main container for the Pokemon Card Collection marketplace
 * Handles API fetching, wallet management, and card purchasing logic
 */
export const PokemonGrid: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState(5000);
  const [ownedCards, setOwnedCards] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  /**
   * Fetch Pokemon data from PokeAPI
   * Uses Promise.all for efficient parallel fetching
   */
  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch the list of Pokemon
        const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit1000');
        if (!listResponse.ok) throw new Error('Failed to fetch Pokemon list');

        const listData: PokeAPIResponse = await listResponse.json();

        // Step 2: Fetch detailed data for each Pokemon in parallel
        const detailPromises = listData.results.map((pokemon) =>
          fetch(pokemon.url).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${pokemon.name}`);
            return res.json();
          })
        );

        const detailedPokemons: PokeAPIPokemonDetail[] = await Promise.all(detailPromises);

        // Step 3: Transform the data to our Pokemon interface
        const transformedPokemons: Pokemon[] = detailedPokemons.map((detail) => {
          // Extract stats
          const hp = detail.stats.find((s) => s.stat.name === 'hp')?.base_stat || 50;
          const attack = detail.stats.find((s) => s.stat.name === 'attack')?.base_stat || 50;
          const defense = detail.stats.find((s) => s.stat.name === 'defense')?.base_stat || 50;
          const speed = detail.stats.find((s) => s.stat.name === 'speed')?.base_stat || 50;

          const stats: PokemonStats = {
            hp,
            attack,
            defense,
            speed,
          };

          // Get image with fallback
          const image =
            detail.sprites.other.dream_world.front_default ||
            detail.sprites.other['official-artwork'].front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`;

          // Extract types
          const types = detail.types.map((t) => t.type.name);

          // Calculate price based on base_experience
          const price = (detail.base_experience || 100) * 10;

          return {
            id: detail.id,
            name: detail.name.charAt(0).toUpperCase() + detail.name.slice(1),
            image,
            types,
            stats,
            price,
          };
        });

        setPokemons(transformedPokemons);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching Pokemon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  /**
   * Handle card purchase logic
   */
  const handleBuy = (pokemon: Pokemon) => {
    // Check if already owned
    if (ownedCards.includes(pokemon.id)) {
      displayToast('You already own this card!', 'error');
      return;
    }

    // Check if user has enough balance
    if (userBalance < pokemon.price) {
      displayToast('Not enough coins! 💔', 'error');
      return;
    }

    // Process purchase
    setUserBalance((prev) => prev - pokemon.price);
    setOwnedCards((prev) => [...prev, pokemon.id]);
    displayToast(`Successfully collected ${pokemon.name}! 🎉`, 'success');
  };

  /**
   * Display toast notification
   */
  const displayToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  /**
   * Filter Pokemon based on search query
   */
  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-xl border-2 animate-slide-in-right ${
            toastType === 'success'
              ? 'bg-green-500 border-green-400 text-white'
              : 'bg-red-500 border-red-400 text-white'
          }`}
        >
          <p className="font-bold text-lg">{toastMessage}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                🎴 Pokémon Card Collection
              </h1>
              <p className="text-gray-600 text-lg">Collect your favorite Pokémon with your coins!</p>
            </div>

            {/* Wallet Display */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl px-6 py-4 shadow-lg">
              <div className="text-sm font-semibold text-white/90 mb-1">Your Balance</div>
              <div className="text-3xl font-bold text-white flex items-center gap-2">
                <span>💎</span>
                <span>{userBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <input
              type="text"
              placeholder="🔍 Search Pokémon by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-gray-300 text-gray-800 placeholder-gray-400 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Collection Stats */}
          <div className="mt-4 flex items-center gap-6 text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="font-semibold">
                Collected: {ownedCards.length} / {pokemons.length}
              </span>
            </div>
            {ownedCards.length === pokemons.length && pokemons.length > 0 && (
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 rounded-full font-bold text-white shadow-md animate-pulse">
                🏆 Collection Complete!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-xl font-semibold">Loading Pokémon cards...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-700 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Pokemon Grid */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto">
          {filteredPokemons.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-4 block">🔍</span>
              <p className="text-gray-800 text-2xl font-semibold">No Pokémon found</p>
              <p className="text-gray-600 text-lg mt-2">Try a different search term</p>
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}
            >
              {filteredPokemons.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  isOwned={ownedCards.includes(pokemon.id)}
                  onBuy={handleBuy}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
