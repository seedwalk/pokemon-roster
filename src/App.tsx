import Roster from "./components/Roster"
import { usePokeApi } from "./providers/PokeApiProvider"

function App() {
  const { pokemonList, isRequestingPokemon } = usePokeApi();

  console.log('fede', pokemonList)
  console.log('base Pokemon', JSON.stringify(pokemonList, null, 2))
  console.log('isRequestingPokemon', isRequestingPokemon)

  return (
    <div className='w-full relative'>
      <Roster pokemonList={pokemonList} />
      
      {/* Instrucciones flotantes */}
      <div className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-4 text-white text-sm shadow-2xl z-[150]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <kbd className="px-2 py-1 bg-white/10 rounded-md font-mono text-xs">←</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded-md font-mono text-xs">→</kbd>
            </div>
            <span className="text-white/90">Navigate</span>
          </div>
          
          <div className="flex items-center gap-3">
            <kbd className="px-3 py-1 bg-white/10 rounded-md font-mono text-xs">Enter</kbd>
            <span className="text-white/90">Select Pokémon</span>
          </div>
          
          <div className="flex items-center gap-3">
            <kbd className="px-3 py-1 bg-white/10 rounded-md font-mono text-xs">Esc</kbd>
            <span className="text-white/90">Go back</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
