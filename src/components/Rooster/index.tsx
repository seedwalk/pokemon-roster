interface PokemonListItem {
  name: string;
  url: string;
  id: string;
  imageUrl: string;
}

interface RoosterProps {
  pokemonList: PokemonListItem[];
}

function Rooster({ pokemonList }: RoosterProps) {
  return (
    <div className="w-full h-screen overflow-x-auto overflow-y-hidden">
      <div className="flex  px-8 h-full items-center">
        {pokemonList.map((pokemon) => (
          <div 
            key={pokemon.id} 
            className="flex-shrink-0 w-64 h-full p-4 border rounded-lg hover:shadow-lg transition-shadow bg-white flex flex-col justify-center"
          >
            <img 
              src={pokemon.imageUrl} 
              alt={pokemon.name}
              className="w-full h-64 object-contain mb-4"
            />
            <p className="text-sm text-gray-500">#{pokemon.id}</p>
            <p className="text-lg capitalize font-semibold">{pokemon.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rooster;

