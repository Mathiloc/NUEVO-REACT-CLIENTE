// src/pages/HomePage.jsx - CÓDIGO RESOLVIDO

import React from 'react';
import '../style/HomePage.css';
// Importamos la función correcta del contexto
import { useGlobalContext } from '../context/GlobalContext'; 

function HomePage() {
    // Utilizamos el hook para obtener la función de actualización de la sesión
    const { updateSession } = useGlobalContext(); 

    // Handler para el botón "Ser Anfitrión"
    // Al hacer clic, configuramos el rol y cambiamos la vista a 'host'
    const handleHostClick = () => {
        updateSession({
            view: 'host',     
            isHost: true,     
            isLoggedIn: true, 
            gamePin: null,    
        });
    };

    // Handler para el botón "Ser Jugador"
    // Al hacer clic, configuramos el rol y cambiamos la vista a 'player'
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
        // Mantenemos la estructura visual basada en CSS
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