// src/App.jsx
import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import PlayerPage from './pages/PlayerPage';


//tienes un useState('home') sin embargo este valor siempre se reinicia al recargar la pagina y sera 'home' 

// se debe agregar la logica de verificacion de sesion en el GlobalContext.jsx , posiblemente con un useEffect porque debe hacerse una llamada a la API, lo que lo vuelve asincronico

// con lo que cambia el useState para retomar la sesion si es que existe




function App() {
  const [view, setView] = useState('home');  
  const renderView = () => {
    switch (view) {
      case 'host':
        return <HostPage />;
      case 'player':
        return <PlayerPage />;
      default:
        return <HomePage setView={setView} />; 
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;