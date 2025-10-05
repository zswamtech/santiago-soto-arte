import React from 'react';
import './App.css';
import MemoryBoard from './components/MemoryBoard.tsx';

const demoImages = [
  { id: 'caballo-andaluz', src: 'https://placekitten.com/300/300', alt: 'Ejemplo Caballo Andaluz' },
  { id: 'caballo-arabe', src: 'https://placekitten.com/301/300', alt: 'Ejemplo Caballo Árabe' },
  { id: 'perro-border', src: 'https://placekitten.com/300/301', alt: 'Ejemplo Perro Border Collie' },
  { id: 'gato-siames', src: 'https://placekitten.com/302/300', alt: 'Ejemplo Gato Siamés' }
];

function App(): React.ReactElement {
  return (
    <div className="app-shell-dark">
      <MemoryBoard images={demoImages} />
    </div>
  );
}

export default App;
