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
  const isJumping = useRef(false);

  // Crear lista infinita: [clones finales, originales, clones iniciales]
  const infiniteList = [...pokemonList, ...pokemonList, ...pokemonList];

  // Inicializar el audio
  useEffect(() => {
    audioRef.current = new Audio(changePlayerSound);
    audioRef.current.volume = 0.3; // Volumen al 30%
  }, []);

  // Inicializar scroll en la sección del medio
  useEffect(() => {
    if (scrollContainerRef.current && pokemonList.length > 0) {
      const container = scrollContainerRef.current;
      const initialScroll = pokemonList.length * CARD_WIDTH;
      container.scrollLeft = initialScroll;
    }
  }, [pokemonList]);

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

  const handleCardClick = (clickedElement: HTMLDivElement) => {
    // Scrollear la card clickeada al centro
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const cardRect = clickedElement.getBoundingClientRect();
      
      // Calcular el scroll necesario para centrar la card
      const containerCenter = containerRect.width / 2;
      const cardCenter = cardRect.left - containerRect.left + cardRect.width / 2;
      const scrollAmount = cardCenter - containerCenter;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || isJumping.current) return;

      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // Detectar límites y saltar
      const threshold = CARD_WIDTH * 2;
      const sectionWidth = pokemonList.length * CARD_WIDTH;
      
      if (scrollLeft < threshold) {
        // Cerca del inicio, saltar al final del segundo set
        isJumping.current = true;
        container.scrollLeft = scrollLeft + sectionWidth;
        setTimeout(() => { isJumping.current = false; }, 50);
      } else if (scrollLeft > maxScroll - threshold) {
        // Cerca del final, saltar al inicio del segundo set
        isJumping.current = true;
        container.scrollLeft = scrollLeft - sectionWidth;
        setTimeout(() => { isJumping.current = false; }, 50);
      }

      // Encontrar card activa en el centro
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
        {infiniteList.map((pokemon, index) => {
          const isActive = activeCardId === pokemon.id;
          
          return (
            <div 
              key={`${pokemon.id}-${index}`}
              data-pokemon-card
              data-pokemon-id={pokemon.id}
              onClick={(e) => handleCardClick(e.currentTarget)}
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

