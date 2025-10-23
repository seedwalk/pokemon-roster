import bugIcon from './assets/pokemon-types/bug.svg';
import darkIcon from './assets/pokemon-types/dark.svg';
import dragonIcon from './assets/pokemon-types/dragon.svg';
import electricIcon from './assets/pokemon-types/electric.svg';
import fairyIcon from './assets/pokemon-types/fairy.svg';
import fightingIcon from './assets/pokemon-types/fighting.svg';
import fireIcon from './assets/pokemon-types/fire.svg';
import flyingIcon from './assets/pokemon-types/flying.svg';
import ghostIcon from './assets/pokemon-types/ghost.svg';
import grassIcon from './assets/pokemon-types/grass.svg';
import groundIcon from './assets/pokemon-types/ground.svg';
import iceIcon from './assets/pokemon-types/ice.svg';
import normalIcon from './assets/pokemon-types/normal.svg';
import poisonIcon from './assets/pokemon-types/poison.svg';
import psychicIcon from './assets/pokemon-types/psychic.svg';
import rockIcon from './assets/pokemon-types/rock.svg';
import steelIcon from './assets/pokemon-types/steel.svg';
import waterIcon from './assets/pokemon-types/water.svg';

/**
 * Tipos de Pokémon basados en la PokeAPI
 */
export const PokemonType = {
  Normal: 'normal',
  Fighting: 'fighting',
  Flying: 'flying',
  Poison: 'poison',
  Ground: 'ground',
  Rock: 'rock',
  Bug: 'bug',
  Ghost: 'ghost',
  Steel: 'steel',
  Fire: 'fire',
  Water: 'water',
  Grass: 'grass',
  Electric: 'electric',
  Psychic: 'psychic',
  Ice: 'ice',
  Dragon: 'dragon',
  Dark: 'dark',
  Fairy: 'fairy',
} as const;

export type PokemonType = typeof PokemonType[keyof typeof PokemonType];

/**
 * Información del tipo de Pokémon
 */
export interface PokemonTypeInfo {
  name: PokemonType;
  icon: string;
}

/**
 * Mapa de ID a tipo de Pokémon con su icono
 */
export const POKEMON_TYPE_MAP: Record<number, PokemonTypeInfo> = {
  1: { name: PokemonType.Normal, icon: normalIcon },
  2: { name: PokemonType.Fighting, icon: fightingIcon },
  3: { name: PokemonType.Flying, icon: flyingIcon },
  4: { name: PokemonType.Poison, icon: poisonIcon },
  5: { name: PokemonType.Ground, icon: groundIcon },
  6: { name: PokemonType.Rock, icon: rockIcon },
  7: { name: PokemonType.Bug, icon: bugIcon },
  8: { name: PokemonType.Ghost, icon: ghostIcon },
  9: { name: PokemonType.Steel, icon: steelIcon },
  10: { name: PokemonType.Fire, icon: fireIcon },
  11: { name: PokemonType.Water, icon: waterIcon },
  12: { name: PokemonType.Grass, icon: grassIcon },
  13: { name: PokemonType.Electric, icon: electricIcon },
  14: { name: PokemonType.Psychic, icon: psychicIcon },
  15: { name: PokemonType.Ice, icon: iceIcon },
  16: { name: PokemonType.Dragon, icon: dragonIcon },
  17: { name: PokemonType.Dark, icon: darkIcon },
  18: { name: PokemonType.Fairy, icon: fairyIcon },
};
