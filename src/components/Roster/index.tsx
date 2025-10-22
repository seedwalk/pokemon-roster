import { useRef, useState, useEffect, useCallback } from 'react';
import changePlayerSound from '../../assets/changePlayer.wav';
import RosterItem from './roster-item';

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

  // Event delegation: manejar clicks en el contenedor padre
  const handleContainerClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Buscar si el click fue en una tarjeta o dentro de ella
    const clickedCard = (event.target as HTMLElement).closest('[data-pokemon-card]') as HTMLDivElement;
    
    if (!clickedCard || !scrollContainerRef.current) return;
    
    // Scrollear la card clickeada al centro
    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const cardRect = clickedCard.getBoundingClientRect();
    
    // Calcular el scroll necesario para centrar la card
    const containerCenter = containerRect.width / 2;
    const cardCenter = cardRect.left - containerRect.left + cardRect.width / 2;
    const scrollAmount = cardCenter - containerCenter;
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }, []);

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
      
      <div 
        className="flex  px-8 h-full items-center"
        onClick={handleContainerClick}
      >
        {infiniteList.map((pokemon, index) => (
          <RosterItem 
            key={`${pokemon.id}-${index}`}
            pokemon={pokemon}
            isActive={activeCardId === pokemon.id}
            scrollContainer={scrollContainerRef.current}
          />
        ))}
      </div>
      </div>
    </>
  );
}

export default Roster;

