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
  const [pokemonDetails, setPokemonDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  // Cargar detalles del Pokémon cuando se abre
  useEffect(() => {
    if (isOpen && !pokemonDetails) {
      setIsLoadingDetails(true);
      
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`)
        .then(response => response.json())
        .then(data => {
          setPokemonDetails(data);
          setIsLoadingDetails(false);
        })
        .catch(error => {
          console.error('Error fetching pokemon details:', error);
          setIsLoadingDetails(false);
        });
    }
  }, [isOpen, pokemon.id, pokemonDetails]);

  // Animar las stats después de cargar
  useEffect(() => {
    if (pokemonDetails && !isLoadingDetails) {
      // Pequeño delay para que la animación se vea bien
      const timer = setTimeout(() => {
        setAnimateStats(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimateStats(false);
    }
  }, [pokemonDetails, isLoadingDetails]);

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
    <>
      <style>{`
        .loader {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          position: relative;
          animation: rotate 1s linear infinite;
        }
        .loader::before {
          content: "";
          box-sizing: border-box;
          position: absolute;
          inset: 0px;
          border-radius: 50%;
          border: 5px solid #FFF;
          animation: prixClipFix 2s linear infinite;
        }

        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }

        @keyframes prixClipFix {
          0%   { clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0); }
          25%  { clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0); }
          50%  { clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%); }
          75%  { clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%); }
          100% { clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0); }
        }
      `}</style>
      
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
        className="flex-shrink-0 h-[120vh] p-4 transition-all duration-500 ease-in-out flex flex-col justify-center cursor-pointer"
      >
        {isOpen && isLoadingDetails ? (
          // Mostrar loader mientras carga
          <div className="flex items-center justify-center h-full">
            <div className="loader"></div>
          </div>
        ) : isOpen && pokemonDetails ? (
          // Mostrar detalles cuando está cargado
          <div className="py-8 px-8 flex flex-col items-center h-full">
            <div className="flex flex-col items-center mb-8">
              <p 
                style={{ 
                  color: pokemon.textColor || '#000000',
                  opacity: 0,
                  transition: 'opacity 500ms ease-out'
                }}
                className="text-3xl font-semibold mb-2"
              >
                #{pokemon.id}
              </p>
              <img 
                src={pokemon.imageUrl} 
                alt={pokemon.name}
                className="w-64 h-64 object-contain mb-4"
              />
              <p 
                style={{ color: pokemon.textColor || '#000000' }}
                className="text-4xl capitalize font-bold"
              >
                {pokemon.name}
              </p>
            </div>

            <h3 
              style={{ color: pokemon.textColor || '#000000' }}
              className="text-2xl font-bold mb-6 text-center"
            >
              Stats
            </h3>

            <div className="w-full max-w-2xl flex-1 overflow-y-auto px-6">
              <div className="space-y-4 pb-8">
                {pokemonDetails.stats.map((stat: any, index: number) => (
                  <div key={index} className="flex flex-col">
                    <div className="flex justify-between mb-1">
                      <span 
                        style={{ color: pokemon.textColor || '#000000' }}
                        className="text-lg font-semibold capitalize"
                      >
                        {stat.stat.name.replace('-', ' ')}
                      </span>
                      <span 
                        style={{ color: pokemon.textColor || '#000000' }}
                        className="text-lg font-bold"
                      >
                        {stat.base_stat}
                      </span>
                    </div>
                    <div className="w-full h-6 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        style={{
                          width: animateStats ? `${Math.min((stat.base_stat / 130) * 100, 100)}%` : '0%',
                          transition: 'width 1s ease-out',
                          transitionDelay: `${index * 0.1}s`,
                          backgroundColor: pokemon.textColor || '#000000',
                          opacity: 0.7
                        }}
                        className="h-full rounded-full"
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (isVisible || isOpen) ? (
          // Contenido completo cuando está visible pero no abierto
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
    </>
  );
}

export default RosterItem;
