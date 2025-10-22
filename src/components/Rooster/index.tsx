interface PokemonListItem {
  name: string;
  url: string;
}

interface RoosterProps {
  pokemonList: PokemonListItem[];
}

function Rooster({ pokemonList }: RoosterProps) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 px-8">Pokemon List</h2>
      <div className="w-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 px-8 pb-4">
          {pokemonList.map((pokemon) => (
            <div 
              key={pokemon.name} 
              className="flex-shrink-0 w-64 p-4 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <p className="text-lg capitalize">{pokemon.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Rooster;

