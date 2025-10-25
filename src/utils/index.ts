
export const extractPokemonId = (url: string): string => {
  const parts = url.split('/').filter(part => part !== '');
  return parts[parts.length - 1];
}

export const getPokemonImageUrl = (id: string): string => {
  return new URL(`../assets/pokemons/${id}.png`, import.meta.url).href;
}

