import Roster from "./components/Roster"
import { usePokeApi } from "./providers/PokeApiProvider"

function App() {
  const { pokemonList, isRequestingPokemon } = usePokeApi();

  console.log('fede', pokemonList)
  console.log('base Pokemon', JSON.stringify(pokemonList, null, 2))
  console.log('isRequestingPokemon', isRequestingPokemon)

  return (
    <div className='w-full'>
      <Roster pokemonList={pokemonList} />
    </div>
  )
}

export default App
