// src/pages/HomePage.jsx
import React from 'react';
import '../HomePage.css';


//esta pagina se mantiene igual porque en la vista padre manejas el estado de la vista actual


function HomePage({ setView }) {
  return (
    

// si ya tienes un style porque agregas mas estilos en linea? mejor ponelo todo en el css

// la imagen debe ir en una carpeta img (o somos dueños del dominio de la imagen?)

    <div className="home-container" >
      <img
        src="https://i.ibb.co/3YWQn17F/Logo-Verde.png"
        alt="MorganoMedic Logo"
        style={{ width: '250px' }} 
      />
      <h2>¡Bienvenido a tu Juego de Preguntas!</h2>
      <p>¿Cómo quieres participar?</p>
      
      {/* Agrupamos los botones en un div para mejor estructura */}
      <div>
        <button onClick={() => setView('host')}>
          Ser Anfitrión
        </button>
        <button onClick={() => setView('player')}>
          Ser Jugador
        </button>
      </div>
    </div>
  );
}

export default HomePage;