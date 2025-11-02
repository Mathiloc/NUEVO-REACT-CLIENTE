// src/App.jsx

import React from 'react';

import { useGlobalContext } from './context/GlobalContext';

// Importar todas las páginas
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import PlayerPage from './pages/PlayerPage';

<<<<<<< HEAD
import './style/App.css'; 

function App() {
  // Obtener la sesión (que incluye la vista actual) del contexto
  const { session } = useGlobalContext();
  
  // Función para determinar qué componente renderizar
=======

//tienes un useState('home') sin embargo este valor siempre se reinicia al recargar la pagina y sera 'home' 

// se debe agregar la logica de verificacion de sesion en el GlobalContext.jsx , posiblemente con un useEffect porque debe hacerse una llamada a la API, lo que lo vuelve asincronico

// con lo que cambia el useState para retomar la sesion si es que existe




function App() {
  const [view, setView] = useState('home');  
>>>>>>> 387ce640cdc691d0a1c5ecdde0db685ae0df5192
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
<<<<<<< HEAD
        // El componente HomePage gestiona la elección de rol
        return <HomePage />;
=======
        return <HomePage setView={setView} />; 
>>>>>>> 387ce640cdc691d0a1c5ecdde0db685ae0df5192
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