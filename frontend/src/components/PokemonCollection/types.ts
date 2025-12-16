/**
 * Type definitions for Pokemon Card Collection feature
 */

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  stats: PokemonStats;
  price: number;
}

export interface CardProps {
  pokemon: Pokemon;
  isOwned: boolean;
  onBuy: (pokemon: Pokemon) => void;
}
