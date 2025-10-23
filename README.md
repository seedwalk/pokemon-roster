# 🎮 Interactive Pokédex

A modern and interactive Pokédex built with React, TypeScript, and Vite. This application displays the first 150 Pokémon from the first generation in an infinite carousel with visual and sound effects.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.14-06B6D4?logo=tailwindcss)

## ✨ Features

- **🔄 Infinite Carousel**: Continuous navigation without end between Pokémon
- **🎨 Dynamic Colors**: Each card extracts the dominant color from the Pokémon's image to create unique gradient backgrounds
- **🎵 Sound Effects**: Sound playback when changing Pokémon
- **⌨️ Keyboard Navigation**: 
  - `←` `→` - Navigate between Pokémon
  - `Enter` - View active Pokémon details
  - `Escape` - Close details view
- **🖱️ Mouse Navigation**: Click on any card to center it
- **📱 Responsive Design**: Interface adaptable to different screen sizes
- **🎯 Spotlight View**: Active card with scale and brightness visual effects

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/seedwalk/pokemon-roster
cd pokemon-roster

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build the application for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

## 🛠️ Technologies

- **React 19** - User interface library
- **TypeScript** - Typed superset of JavaScript
- **Vite** - Ultra-fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **PokeAPI** - Pokémon REST API

## 🏗️ Project Structure

```
src/
├── components/
│   └── Roster/              # Main carousel component
│       ├── index.tsx        # Infinite carousel logic
│       └── roster-item.tsx  # Individual Pokémon card
├── providers/
│   └── PokeApiProvider/     # Provider for PokeAPI data
│       └── index.tsx
├── utils/
│   ├── extractDominatColor.ts  # Dominant color extraction
│   └── index.ts                # General utilities
├── assets/
│   └── changePlayer.wav     # Sound effect
├── App.tsx                  # Root component
└── main.tsx                 # Entry point
```

## 🎨 Technical Features

### Infinite Carousel
The carousel implements an infinite scroll system by triplicating the Pokémon list and detecting boundaries to perform invisible "jumps" that create the illusion of infinite continuity.

### Color Extraction
Each Pokémon has its own color scheme extracted from its official sprite using a color quantization algorithm that:
- Resizes the image to optimize performance
- Samples pixels at regular intervals
- Groups similar colors through quantization
- Generates custom gradients for each Pokémon

### Navigation System
- **Event Delegation**: A single listener on the container to handle clicks on all cards
- **Active Card Detection**: Real-time calculation of the card closest to the viewport center
- **Smooth Scroll**: Animated transitions when navigating between Pokémon

## 🎯 How to Use

1. The application starts by displaying the Pokémon carousel
2. Use keyboard arrows or click on a card to navigate
3. Press `Enter` or click on the active card to view details
4. Press `Escape` to return to the carousel
5. Enjoy the visual and sound effects while exploring

## 📝 Notes

- The application loads the first 150 Pokémon (First generation)
- Colors are dynamically extracted when loading the application
- Sound is configured at 30% of maximum volume
- The carousel maintains scroll state when opening and closing details

## 🤝 Contributing

Contributions are welcome. If you find any bugs or have any suggestions, please open an issue or submit a pull request.

## 📄 License

This project is open source and available under the MIT License.

---

Made with ❤️ using React and the PokeAPI
