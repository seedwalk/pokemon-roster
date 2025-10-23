import { useEffect, useRef, useState } from 'react';

interface PokemonListItem {
  name: string;
  url: string;
  id: string;
  imageUrl: string;
  background?: string;
  textColor?: string;
}

interface RosterItemProps {
  pokemon: PokemonListItem;
  pokemonIndex: number;
  isActive: boolean;
  isOpen: boolean;
  scrollContainer?: HTMLElement | null;
}

function RosterItem({ pokemon, pokemonIndex, isActive, isOpen, scrollContainer }: RosterItemProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldBeFixed, setShouldBeFixed] = useState(false);

  // Controlar cuando aplicar position fixed después de la animación
  useEffect(() => {
    if (isOpen) {
      // Esperar a que termine la animación (500ms) antes de aplicar fixed
      const timer = setTimeout(() => {
        setShouldBeFixed(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Cuando se cierra, inmediatamente quitar el fixed
      setShouldBeFixed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const currentCard = cardRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        root: scrollContainer,
        // Precarga elementos que están hasta 1 ancho de pantalla de distancia (horizontal)
        rootMargin: '0px 1500px 0px 1500px',
        threshold: 0
      }
    );

    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, [scrollContainer]);

  return (
    <div 
      ref={cardRef}
      data-pokemon-card
      data-pokemon-id={pokemon.id}
      data-pokemon-index={pokemonIndex}
      style={{
        position: shouldBeFixed ? 'fixed' : 'static',
        left: shouldBeFixed ? 0 : 'auto',
        top: shouldBeFixed ? 0 : 'auto',
        transform: isOpen
          ? 'rotate(0deg) translateY(0px) scale(1)'
          : isActive 
            ? 'rotate(15deg) translateY(-40px) scale(1.15)' 
            : 'rotate(15deg)',
        width: isOpen ? '100vw' : '16rem',
        height: isOpen ? '100vh' : '120vh',
        zIndex: isOpen ? 100 : isActive ? 50 : 1,
        backgroundImage: isActive
          ? `${pokemon.background || 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)'}, linear-gradient(135deg, #667eea 0%, #764ba2 15%, #f093fb 30%, #4facfe 45%, #00f2fe 60%, #43e97b 75%, #fa709a 90%, #fee140 100%)`
          : pokemon.background || 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
        backgroundOrigin: isActive ? 'border-box' : 'padding-box',
        backgroundClip: isActive ? 'padding-box, border-box' : 'padding-box',
        boxShadow: isActive 
          ? '0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 18px 36px -18px rgba(0, 0, 0, 0.5), 0 0 80px rgba(102, 126, 234, 0.4), 0 0 40px rgba(250, 112, 154, 0.3), 0 0 20px rgba(67, 233, 123, 0.3), inset 0 1px 10px rgba(255, 255, 255, 0.4)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      className="flex-shrink-0 h-[120vh] p-4 rounded-xl transition-all duration-500 ease-in-out flex flex-col justify-center cursor-pointer"
    >
      {(isVisible || isOpen) ? (
        // Contenido completo cuando está visible o abierto
        <div className="py-60 flex flex-col items-center justify-between h-full">
          <div className=" flex items-start justify-center h-16">
            <p 
              style={{ 
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-15deg)',
                transformOrigin: 'center center',
                transition: 'transform 500ms ease-in-out',
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
            style={{ 
              transform: isOpen ? 'rotate(0deg)' : 'rotate(-15deg)',
              transition: 'transform 500ms ease-in-out'
            }}
            className="w-full h-64 object-contain"
          />
          <div className="flex items-end justify-center h-16">
            <p 
              style={{ 
                transform: isOpen 
                  ? 'rotate(0deg)' 
                  : `rotate(-90deg) ${isActive ? 'scale(1.2)' : 'scale(1)'}`,
                transformOrigin: 'center center',
                transition: 'transform 500ms ease-in-out',
                color: pokemon.textColor || '#000000'
              }}
              className="text-2xl capitalize font-bold whitespace-nowrap"
            >
              {pokemon.name}
            </p>
          </div>
        </div>
      ) : (
        // Placeholder/skeleton cuando está fuera de vista
        <div className="py-60 flex flex-col items-center justify-between h-full">
          {/* Mantiene el espacio pero no carga contenido pesado */}
        </div>
      )}
    </div>
  );
}

export default RosterItem;
