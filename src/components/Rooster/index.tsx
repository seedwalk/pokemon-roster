import { useRef, useState, useEffect, useCallback } from 'react';
import changePlayerSound from '../../assets/changePlayer.wav';

interface PokemonListItem {
  name: string;
  url: string;
  id: string;
  imageUrl: string;
}

interface RoosterProps {
  pokemonList: PokemonListItem[];
}

const CARD_WIDTH = 256; // Ancho de cada card de pokémon (w-64 = 256px)

function Rooster({ pokemonList }: RoosterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Inicializar el audio
  useEffect(() => {
    audioRef.current = new Audio(changePlayerSound);
    audioRef.current.volume = 0.3; // Volumen al 30%
  }, []);

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -CARD_WIDTH,
        behavior: 'smooth'
      });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: CARD_WIDTH,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleCardClick = (pokemonId: string) => {
    // Buscar la card y scrollear al centro
    if (scrollContainerRef.current) {
      const cardElement = scrollContainerRef.current.querySelector(
        `[data-pokemon-id="${pokemonId}"]`
      );
      
      if (cardElement) {
        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        
        // Calcular el scroll necesario para centrar la card
        const containerCenter = containerRect.width / 2;
        const cardCenter = cardRect.left - containerRect.left + cardRect.width / 2;
        const scrollAmount = cardCenter - containerCenter;
        
        container.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;

      const cardElements = container.querySelectorAll('[data-pokemon-card]');
      let closestCardId: string | null = null;
      let closestDistance = Infinity;

      cardElements.forEach((cardElement) => {
        const cardRect = cardElement.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(centerX - cardCenterX);

        if (distance < closestDistance) {
          closestDistance = distance;
          const id = cardElement.getAttribute('data-pokemon-id');
          if (id) {
            closestCardId = id;
          }
        }
      });

      setActiveCardId(closestCardId);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Llamar inicialmente para establecer la primera card activa
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pokemonList]);

  // Reproducir sonido cuando cambia la card activa
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (activeCardId && audioRef.current) {
      audioRef.current.currentTime = 0; // Reiniciar el audio
      audioRef.current.play().catch((error) => {
        console.log('Error playing audio:', error);
      });
    }
  }, [activeCardId]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollLeft();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrollLeft, scrollRight]);

  return (
    <>
      {/* Div flotante izquierda */}
      <div 
        className="fixed left-0 top-0 h-screen w-20 z-10 border-4 border-blue-500 bg-blue-200/30 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-[600ms]"
        onClick={scrollLeft}
      />
      
      {/* Div flotante derecha */}
      <div 
        className="fixed right-0 top-0 h-screen w-20 z-10 border-4 border-red-500 bg-red-200/30 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-[600ms]"
        onClick={scrollRight}
      />
      
      <div className="w-full h-screen overflow-x-auto overflow-y-hidden" ref={scrollContainerRef}>
      
      <div className="flex  px-8 h-full items-center">
        {pokemonList.map((pokemon) => {
          const isActive = activeCardId === pokemon.id;
          
          return (
            <div 
              key={pokemon.id}
              data-pokemon-card
              data-pokemon-id={pokemon.id}
              onClick={() => handleCardClick(pokemon.id)}
              className={`flex-shrink-0 w-64 h-full p-4 rounded-lg hover:shadow-lg transition-all duration-300 bg-white flex flex-col justify-center cursor-pointer ${
                isActive 
                  ? 'border-4 border-blue-500 shadow-2xl scale-110 ring-4 ring-blue-200' 
                  : 'border border-gray-300'
              }`}
            >
              <img 
                src={pokemon.imageUrl} 
                alt={pokemon.name}
                className="w-full h-64 object-contain mb-4"
              />
              <p className="text-sm text-gray-500">#{pokemon.id}</p>
              <p className="text-lg capitalize font-semibold">{pokemon.name}</p>
            </div>
          );
        })}
      </div>
      </div>
    </>
  );
}

export default Rooster;

