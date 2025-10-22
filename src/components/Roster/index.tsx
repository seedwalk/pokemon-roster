import { useRef, useState, useEffect, useCallback } from 'react';
import changePlayerSound from '../../assets/changePlayer.wav';

interface PokemonListItem {
  name: string;
  url: string;
  id: string;
  imageUrl: string;
  background?: string;
  textColor?: string;
}

interface RosterProps {
  pokemonList: PokemonListItem[];
}

const CARD_WIDTH = 256; // Ancho de cada card de pokémon (w-64 = 256px)

function Roster({ pokemonList }: RosterProps) {
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
      <div className="w-full h-screen overflow-hidden" ref={scrollContainerRef}>
      
      <div className="flex  px-8 h-full items-center">
        {infiniteList.map((pokemon, index) => {
          const isActive = activeCardId === pokemon.id;
          
          return (
            <div 
              key={`${pokemon.id}-${index}`}
              data-pokemon-card
              data-pokemon-id={pokemon.id}
              onClick={(e) => handleCardClick(e.currentTarget)}
              style={{
                transform: isActive 
                  ? 'rotate(15deg) translateY(-40px) scale(1.15)' 
                  : 'rotate(15deg)',
                zIndex: isActive ? 50 : 1,
                border: isActive 
                  ? '2px solid transparent'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                backgroundImage: isActive
                  ? `${pokemon.background || 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)'}, linear-gradient(135deg, #667eea 0%, #764ba2 15%, #f093fb 30%, #4facfe 45%, #00f2fe 60%, #43e97b 75%, #fa709a 90%, #fee140 100%)`
                  : pokemon.background || 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
                backgroundOrigin: isActive ? 'border-box' : 'padding-box',
                backgroundClip: isActive ? 'padding-box, border-box' : 'padding-box',
                boxShadow: isActive 
                    ? '0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 18px 36px -18px rgba(0, 0, 0, 0.5), 0 0 80px rgba(102, 126, 234, 0.4), 0 0 40px rgba(250, 112, 154, 0.3), 0 0 20px rgba(67, 233, 123, 0.3), inset 0 1px 10px rgba(255, 255, 255, 0.4)' 
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              className="flex-shrink-0 w-64 h-[120vh] p-4 rounded-xl transition-all duration-300 flex flex-col justify-center cursor-pointer"
            >
              <div className="py-60 flex flex-col items-center justify-between h-full">
                <div className=" flex items-start justify-center h-16">
                  <p 
                    style={{ 
                      transform: 'rotate(-15deg) ',
                      transformOrigin: 'center center',
                      transition: 'transform 300ms ease-in-out',
                      color: pokemon.textColor || '#000000'
                    }}
                    className="text-xl font-semibold"
                  >
                    #{pokemon.id}
                  </p>
                </div>
                <img 
                  src={pokemon.imageUrl} 
                  alt={pokemon.name}
                  style={{ transform: 'rotate(-15deg)' }}
                  className="w-full h-64 object-contain"
                />
                <div className="flex items-end justify-center h-16">
                  <p 
                    style={{ 
                      transform: `rotate(-90deg) ${isActive ? 'scale(1.2)' : 'scale(1)'}`,
                      transformOrigin: 'center center',
                      transition: 'transform 300ms ease-in-out',
                      color: pokemon.textColor || '#000000'
                    }}
                    className="text-2xl capitalize font-bold whitespace-nowrap"
                  >
                    {pokemon.name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </>
  );
}

export default Roster;

