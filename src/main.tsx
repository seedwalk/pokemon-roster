import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PokeApiProvider } from './providers/PokeApiProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PokeApiProvider>
      <App />
    </PokeApiProvider>
  </StrictMode>,
)
