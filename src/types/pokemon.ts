// ===================================
// Interfaces Base Reutilizables
// ===================================

/**
 * Representa un recurso de la API con nombre y URL
 * Usado para abilities, moves, species, etc.
 */
export interface NamedAPIResource {
  name: string
  url: string
}

// ===================================
// Interfaces Principales
// ===================================

export interface Pokemon {
  abilities: Ability[]
  base_experience: number
  cries: Cries
  forms: NamedAPIResource[]
  game_indices: Index[]
  height: number
  held_items: any[]
  id: number
  is_default: boolean
  location_area_encounters: string
  moves: Mfe[]
  name: string
  order: number
  past_abilities: PastAbility[]
  past_types: any[]
  species: NamedAPIResource
  sprites: Sprites
  stats: Stat[]
  types: Type[]
  weight: number
}

export interface Ability {
  ability: NamedAPIResource
  is_hidden: boolean
  slot: number
}

export interface Cries {
  latest: string
  legacy: string
}

export interface Index {
  game_index: number
  version: NamedAPIResource
}

export interface Mfe {
  move: NamedAPIResource
  version_group_details: VersionGroupDetail[]
}

export interface VersionGroupDetail {
  level_learned_at: number
  move_learn_method: NamedAPIResource
  order?: number
  version_group: NamedAPIResource
}

export interface PastAbility {
  abilities: Ability[]
  generation: NamedAPIResource
}
  
// ===================================
// Sprites - Interfaces Base
// ===================================

/**
 * Sprites con 8 variaciones (back/front, default/shiny, male/female)
 * Usado en múltiples generaciones
 */
export interface CompleteSprites {
  back_default: string
  back_female: any
  back_shiny: string
  back_shiny_female: any
  front_default: string
  front_female: any
  front_shiny: string
  front_shiny_female: any
}

/**
 * Sprites solo frontales con variaciones (default/shiny, male/female)
 */
export interface FrontSprites {
  front_default: string
  front_female: any
  front_shiny: string
  front_shiny_female: any
}

/**
 * Sprites simples solo frontales (default/female)
 */
export interface SimpleFrontSprites {
  front_default: string
  front_female: any
}

/**
 * Sprites con variaciones de color (gray/transparent)
 */
export interface ColorVariantSprites {
  back_default: string
  back_gray: string
  back_transparent: string
  front_default: string
  front_gray: string
  front_transparent: string
}

/**
 * Sprites básicos (back/front, default/shiny)
 */
export interface BasicSprites {
  back_default: string
  back_shiny: string
  front_default: string
  front_shiny: string
}

/**
 * Sprites mínimos (solo front default/shiny)
 */
export interface MinimalSprites {
  front_default: string
  front_shiny: string
}

// ===================================
// Sprites Principales
// ===================================

export interface Sprites {
  back_default: string
  back_female: any
  back_shiny: string
  back_shiny_female: any
  front_default: string
  front_female: any
  front_shiny: string
  front_shiny_female: any
  other: Other
  versions: Versions
}

export interface Other {
  dream_world: SimpleFrontSprites
  home: FrontSprites
  "official-artwork": MinimalSprites
  showdown: CompleteSprites
}
  
// ===================================
// Versiones por Generación
// ===================================

export interface Versions {
  "generation-i": GenerationI
  "generation-ii": GenerationIi
  "generation-iii": GenerationIii
  "generation-iv": GenerationIv
  "generation-v": GenerationV
  "generation-vi": GenerationVi
  "generation-vii": GenerationVii
  "generation-viii": GenerationViii
}

// Generación I - Sprites con variaciones de color
export interface GenerationI {
  "red-blue": ColorVariantSprites
  yellow: ColorVariantSprites
}

// Generación II
export interface GenerationIi {
  crystal: CrystalSprites
  gold: GoldSilverSprites
  silver: GoldSilverSprites
}

export interface CrystalSprites {
  back_default: string
  back_shiny: string
  back_shiny_transparent: string
  back_transparent: string
  front_default: string
  front_shiny: string
  front_shiny_transparent: string
  front_transparent: string
}

export interface GoldSilverSprites {
  back_default: string
  back_shiny: string
  front_default: string
  front_shiny: string
  front_transparent: string
}

// Generación III
export interface GenerationIii {
  emerald: MinimalSprites
  "firered-leafgreen": BasicSprites
  "ruby-sapphire": BasicSprites
}

// Generación IV - Usa CompleteSprites
export interface GenerationIv {
  "diamond-pearl": CompleteSprites
  "heartgold-soulsilver": CompleteSprites
  platinum: CompleteSprites
}

// Generación V
export interface GenerationV {
  "black-white": BlackWhiteSprites
}

export interface BlackWhiteSprites extends CompleteSprites {
  animated: CompleteSprites
}

// Generación VI - Usa FrontSprites
export interface GenerationVi {
  "omegaruby-alphasapphire": FrontSprites
  "x-y": FrontSprites
}

// Generación VII
export interface GenerationVii {
  icons: SimpleFrontSprites
  "ultra-sun-ultra-moon": FrontSprites
}

// Generación VIII
export interface GenerationViii {
  icons: SimpleFrontSprites
}
  
// ===================================
// Stats y Types
// ===================================

export interface Stat {
  base_stat: number
  effort: number
  stat: NamedAPIResource
}

export interface Type {
  slot: number
  type: NamedAPIResource
}
  