import { useEffect, useState, useTransition } from "react"
import Rooster from "./components/Rooster"

interface PokemonListItem {
  name: string;
  url: string;
}

function App() {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [requestingPOkeing, setRequestingPokemons] = useTransition();

  const requestPokemons = () => setRequestingPokemons(async () => {
    try {
      const request = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
      const {results}=  await request.json();
      setPokemonList(results as PokemonListItem[]);
    } catch(e) {
    console.error(e)
    }  
  });

  useEffect(() => {
    requestPokemons()
  }, []);

  console.log('fede', pokemonList)
  console.log('base Pokemon', JSON.stringify(pokemonList, null, 2))

  return (
    <div className='w-full py-8'>
      <Rooster pokemonList={pokemonList} />
    </div>
  )
}

export default App
