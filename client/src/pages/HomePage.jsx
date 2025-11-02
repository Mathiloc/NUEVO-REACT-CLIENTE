// src/pages/HomePage.jsx - CÓDIGO FINAL CON ESTÉTICA ORIGINAL

import React from 'react';
import '../style/HomePage.css';
// Importamos la función correcta del contexto
import { useGlobalContext } from '../context/GlobalContext'; 

function HomePage() {
    // CAMBIO: Usamos 'updateSession' en lugar de 'setView'
    const { updateSession } = useGlobalContext(); 

    // Handler para el botón "Ser Anfitrión"
    const handleHostClick = () => {
        updateSession({
            view: 'host',     
            isHost: true,     
            isLoggedIn: true, 
            gamePin: null,    
        });
    };

    // Handler para el botón "Ser Jugador"
    const handlePlayerClick = () => {
        updateSession({
            view: 'player',    
            isHost: false,     
            isLoggedIn: false, 
            gamePin: null,     
            nickname: null,    
        });
    };
    
    return (
        // Mantener la clase de contenedor y la estructura visual
        <div className="home-container" >
            <img
                src="https://i.ibb.co/3YWQn17F/Logo-Verde.png"
                alt="MorganoMedic Logo"
                className='home-logo' 
            />
            <h2>¡Bienvenido a tu Juego de Preguntas!</h2>
            <p>¿Cómo quieres participar?</p>
            
            {/* Agrupamos los botones en un div para mejor estructura */}
            <div>
                <button onClick={handleHostClick}>
                    Ser Anfitrión
                </button>
                <button onClick={handlePlayerClick}>
                    Ser Jugador
                </button>
            </div>
        </div>
    );
}

export default HomePage;