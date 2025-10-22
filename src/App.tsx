import Rooster from "./components/Rooster"
import { usePokeApi } from "./providers/PokeApiProvider"

function App() {
  const { pokemonList, isRequestingPokemon } = usePokeApi();

  console.log('fede', pokemonList)
  console.log('base Pokemon', JSON.stringify(pokemonList, null, 2))
  console.log('isRequestingPokemon', isRequestingPokemon)

  return (
    <div className='w-full'>
      <Rooster pokemonList={pokemonList} />
    </div>
  )
}

export default App
