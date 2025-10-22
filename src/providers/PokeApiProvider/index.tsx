import { createContext, useContext, useEffect, useState, useTransition, ReactNode } from "react";
import { extractPokemonId, getPokemonImageUrl } from "../../utils";

interface PokemonListItem {
  name: string;
  url: string;
  id: string;
  imageUrl: string;
}

interface PokeApiContextType {
  pokemonList: PokemonListItem[];
  isRequestingPokemon: boolean;
}

const PokeApiContext = createContext<PokeApiContextType | undefined>(undefined);

interface PokeApiProviderProps {
  children: ReactNode;
}

export const PokeApiProvider = ({ children }: PokeApiProviderProps) => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isRequestingPokemon, setRequestingPokemons] = useTransition();

  const requestPokemons = () => setRequestingPokemons(async () => {
    try {
      const request = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
      const { results } = await request.json();
      const pokemonsWithId = results.map((pokemon: { name: string; url: string }) => {
        const id = extractPokemonId(pokemon.url);
        return {
          ...pokemon,
          id,
          imageUrl: getPokemonImageUrl(id)
        };
      });
      setPokemonList(pokemonsWithId);
    } catch (e) {
      console.error(e);
    }
  });

  useEffect(() => {
    requestPokemons();
  }, []);

  return (
    <PokeApiContext.Provider value={{ pokemonList, isRequestingPokemon }}>
      {children}
    </PokeApiContext.Provider>
  );
};

export const usePokeApi = () => {
  const context = useContext(PokeApiContext);
  if (context === undefined) {
    throw new Error('usePokeApi must be used within a PokeApiProvider');
  }
  return context;
};

