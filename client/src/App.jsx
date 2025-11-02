// src/App.jsx

import React from 'react';

import { useGlobalContext } from './context/GlobalContext';

// Importar todas las páginas
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import PlayerPage from './pages/PlayerPage';

import './style/App.css'; 

function App() {
  // Obtener la sesión (que incluye la vista actual) del contexto
  const { session } = useGlobalContext();
  
  // Función para determinar qué componente renderizar
  const renderView = () => {
    switch (session.view) {
      case 'host':
        // El componente HostPage ahora obtiene todo del GlobalContext y useSocket
        return <HostPage />;
        
      case 'player':
        // El componente PlayerPage ahora obtiene todo del GlobalContext y useSocket
        return <PlayerPage />;
        
      case 'home':
      default:
        // El componente HomePage gestiona la elección de rol
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      {/* Aquí podríamos agregar encabezados o barras de navegación que
        siempre se muestran independientemente de la vista.
      */}
      <main>
        {renderView()}
      </main>
      
      {/* Opcional: Mostrar información de depuración si isLoggedIn es true
        <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: '0.8rem', color: '#ccc' }}>
            Estado: {session.view.toUpperCase()} | Rol: {session.isHost ? 'Host' : 'Player'} | PIN: {session.gamePin}
        </div>
      */}
    </div>
  );
}

export default App;