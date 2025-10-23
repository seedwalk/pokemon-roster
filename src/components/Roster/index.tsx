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
const PADDING_LEFT = 32; // px-8 en tailwind = 32px

/**
 * Calcula la posición del scroll necesaria para centrar el elemento expandido
 * @param container - El contenedor con scroll
 * @param openCard - El elemento que se va a expandir
 * @returns La posición del scroll necesaria
 */
function calculateScrollPosition(
  container: HTMLDivElement,
  openCard: HTMLElement
): number {
  const containerRect = container.getBoundingClientRect();
  const cardRect = openCard.getBoundingClientRect();
  
  // Calcular dónde está el borde izquierdo del elemento en el scroll total
  const cardLeftRelativeToContainer = cardRect.left - containerRect.left;
  const currentScrollPosition = container.scrollLeft;
  const cardAbsoluteLeft = currentScrollPosition + cardLeftRelativeToContainer;
  
  // Compensar el padding y ajustar para que quede bien centrado
  return cardAbsoluteLeft - PADDING_LEFT + CARD_WIDTH;
}

function Roster({ pokemonList }: RosterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [openPokemonIndex, setOpenPokemonIndex] = useState<number | null>(null);
  const isInitialMount = useRef(true);
  const isJumping = useRef(false);
  const savedScrollPosition = useRef<number>(0);

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
    // Si hay un pokemon abierto, no hacer nada
    if (openPokemonIndex !== null) return;

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
  }, [openPokemonIndex]);

  // Manejar doble click en una card activa para abrirla
  const handleCardDoubleClick = useCallback((pokemonIndex: number) => {
    // Solo abrir si no hay ningún pokemon abierto y el scroll container existe
    if (openPokemonIndex !== null || !scrollContainerRef.current) return;
    
    // Guardar la posición actual del scroll antes de abrir
    savedScrollPosition.current = scrollContainerRef.current.scrollLeft;
    
    // Abrir el pokemon
    setOpenPokemonIndex(pokemonIndex);
  }, [openPokemonIndex]);

  useEffect(() => {
    const handleScroll = () => {
      // Si hay un pokemon abierto, no hacer nada
      if (!scrollContainerRef.current || isJumping.current || openPokemonIndex !== null) return;

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
  }, [pokemonList, openPokemonIndex]);

  // Reproducir sonido cuando cambia la card activa (solo si no hay ninguna abierta)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (activeCardId && audioRef.current && openPokemonIndex === null) {
      audioRef.current.currentTime = 0; // Reiniciar el audio
      audioRef.current.play().catch((error) => {
        console.log('Error playing audio:', error);
      });
    }
  }, [activeCardId, openPokemonIndex]);

  // Ajustar scroll cuando se abre para compensar la expansión a 100vw
  useEffect(() => {
    if (openPokemonIndex === null || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    
    // Buscar el elemento específico por su índice único
    const openCard = container.querySelector<HTMLElement>(`[data-pokemon-index="${openPokemonIndex}"]`);
    
    if (!openCard) return;
    
    // Calcular y aplicar la nueva posición del scroll
    container.scrollLeft = calculateScrollPosition(container, openCard);
  }, [openPokemonIndex]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Si hay un pokemon abierto, solo permitir Escape
      if (openPokemonIndex !== null) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setOpenPokemonIndex(null);
          
          // Restaurar la posición del scroll guardada con animación suave
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              left: savedScrollPosition.current,
              behavior: 'smooth'
            });
          }
        }
        return;
      }

      // Navegación normal cuando no hay nada abierto
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollLeft();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollRight();
      } else if (event.key === 'Enter') {
        // Abrir el pokemon activo en pantalla completa
        // Necesitamos encontrar el índice del elemento activo más cercano
        if (activeCardId && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          
          // Guardar la posición actual del scroll antes de abrir
          savedScrollPosition.current = container.scrollLeft;
          
          const containerRect = container.getBoundingClientRect();
          const centerX = containerRect.left + containerRect.width / 2;
          
          const activeCards = container.querySelectorAll<HTMLElement>(`[data-pokemon-id="${activeCardId}"]`);
          let closestIndex: number | null = null;
          let closestDistance = Infinity;
          
          activeCards.forEach((card) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(centerX - cardCenterX);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              const indexAttr = card.getAttribute('data-pokemon-index');
              if (indexAttr) {
                closestIndex = parseInt(indexAttr, 10);
              }
            }
          });
          
          if (closestIndex !== null) {
            event.preventDefault();
            setOpenPokemonIndex(closestIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrollLeft, scrollRight, activeCardId, openPokemonIndex]);

  return (
    <>
      <div 
        className="w-full h-screen overflow-hidden" 
        ref={scrollContainerRef}
      >
      
      <div 
        className="flex  px-8 h-full items-center"
        onClick={handleContainerClick}
      >
        {infiniteList.map((pokemon, index) => (
          <RosterItem 
            key={`${pokemon.id}-${index}`}
            pokemon={pokemon}
            pokemonIndex={index}
            isActive={openPokemonIndex === null && activeCardId === pokemon.id}
            isOpen={openPokemonIndex === index}
            scrollContainer={scrollContainerRef.current}
            onDoubleClick={handleCardDoubleClick}
          />
        ))}
      </div>
      </div>
    </>
  );
}

export default Roster;

