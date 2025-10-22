import { createContext, useContext, useEffect, useState, useTransition, ReactNode } from "react";
import { extractPokemonId, getPokemonImageUrl } from "../../utils";
import { getBackgroundAndTextColor } from "../../utils/extractDominatColor";

interface PokemonListItem {
  name: string;
  url: string;
  id: string;
  imageUrl: string;
  background?: string;
  textColor?: string;
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
      const request = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150&offset=0');
      const { results } = await request.json();
      const pokemonsWithId = results.map((pokemon: { name: string; url: string }) => {
        const id = extractPokemonId(pokemon.url);
        return {
          ...pokemon,
          id,
          imageUrl: getPokemonImageUrl(id)
        };
      });
      
      // Extraer el background y color de texto de cada Pokémon
      const pokemonsWithBackground = await Promise.all(
        pokemonsWithId.map(async (pokemon: PokemonListItem) => {
          try {
            const { background, textColor } = await getBackgroundAndTextColor(pokemon.imageUrl, {
              maxDimension: 150,
              sampleStep: 3,
              quantBits: 4,
              asGradient: true
            });
            return { ...pokemon, background, textColor };
          } catch (e) {
            console.warn(`No se pudo extraer el color para ${pokemon.name}:`, e);
            return { 
              ...pokemon, 
              background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
              textColor: '#000000'
            };
          }
        })
      );
      
      setPokemonList(pokemonsWithBackground);
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

