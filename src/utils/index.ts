
export const extractPokemonId = (url: string): string => {
  const parts = url.split('/').filter(part => part !== '');
  return parts[parts.length - 1];
}

export const getPokemonImageUrl = (id: string): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
}

