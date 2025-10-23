// src/App.jsx
import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import PlayerPage from './pages/PlayerPage';

function App() {
  const [view, setView] = useState('home'); // 'home', 'host', o 'player'

  const renderView = () => {
    switch (view) {
      case 'host':
        return <HostPage />;
      case 'player':
        return <PlayerPage />;
      default:
        // Pasamos la función `setView` para poder cambiar la vista desde HomePage
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