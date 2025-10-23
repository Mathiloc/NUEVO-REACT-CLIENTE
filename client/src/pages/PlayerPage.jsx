// src/pages/PlayerPage.jsx - CÓDIGO FINAL CON CLASES CSS ACTIVAS

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../PlayerPage.css'; 

const socket = io('http://localhost:4000');

// Aceptar la prop setView
function PlayerPage({ setView }) { 
 const [pin, setPin] = useState('');
 const [nickname, setNickname] = useState('');
 const [joined, setJoined] = useState(false);
 const [currentQuestion, setCurrentQuestion] = useState(null);
 const [hasAnswered, setHasAnswered] = useState(false);
 const [feedback, setFeedback] = useState('');
 const [leaderboard, setLeaderboard] = useState([]);
 const [isGameOver, setIsGameOver] = useState(false); 
 useEffect(() => {
 socket.on('join-success', () => {
  setJoined(true);
 });
  socket.on('error-message', (message) => {
     alert(message);
   });
   socket.on('next-question', (question) => {
     setCurrentQuestion(question);
     setHasAnswered(false);
     setFeedback('');
     setLeaderboard([]);
     setIsGameOver(false);
   });
   socket.on('answer-result', ({ correct, score }) => {
     setFeedback(correct ? `¡Correcto! Tu puntaje es ${score}` : 'Incorrecto...');
   });
   
   socket.on('update-leaderboard', (scores) => {
     setLeaderboard(scores);
   });
   socket.on('game-over', (finalScores) => {
    setLeaderboard(finalScores);
    setIsGameOver(true);
    setCurrentQuestion(null);
   });
   return () => {
    socket.off('join-success');
    socket.off('error-message');
    socket.off('next-question');
    socket.off('answer-result');
    socket.off('update-leaderboard');
    socket.off('game-over');
   }
 }, []);
 // Recibir el evento y prevenir la recarga
 const handleJoinGame = (e) => {
    if (e) e.preventDefault(); 
   if (pin.trim() && nickname.trim()) {
     socket.emit('join-game', { pin, nickname });
   } else {
     alert('Por favor, ingresa el PIN y un apodo.');
   }
 };
 const handleAnswerSubmit = (answerIndex) => {
   setHasAnswered(true);
   socket.emit('submit-answer', { gamePin: pin, answerIndex });
 };
   // 1. Formulario de Ingreso (Vista por defecto)
 if (!joined) {
   return (
     <div className="player-container entry-view"> 
      <h1 className="kahoot-title-player">Unirse a un Juego</h1> 
      <form onSubmit={handleJoinGame} className="join-form"> 
        <input 
               type="text" 
               placeholder="PIN del Juego" 
               value={pin} 
               onChange={(e) => setPin(e.target.value)} 
               className="pin-input" 
           />
       <br />
       <input 
               type="text" 
               placeholder="Tu Apodo" 
               value={nickname} 
               onChange={(e) => setNickname(e.target.value)} 
               className="nickname-input" 
           />
        <br />
        <button type="submit" className="join-button"> 
               ¡Jugar!
           </button>
        </form>
        <button className="back-button" onClick={() => setView('home')}> 
            Volver a Inicio
        </button>
     </div>
   );
 }
 // 2. Si el juego ha terminado, mostrar los resultados finales.
 if (isGameOver) {
   return (
  <div className="player-container lobby-view"> 
       <h1>¡Juego Terminado!</h1>
       <h2>Resultados Finales:</h2>
       <ol className="player-list-lobby"> 
       {leaderboard.map(p => <li key={p.id}>{p.nickname}: {p.score} puntos</li>)}
       </ol>
       <button className="back-button" onClick={() => setView('home')}> 
         Salir del Juego
       </button>
     </div>
  );
 }
 // 3. Si hay datos en el leaderboard, mostrar la tabla de posiciones.
 if (leaderboard.length > 0) {
   return (
    <div className="player-container lobby-view"> 
       <h1>Tabla de Posiciones</h1>
       <ol className="player-list-lobby"> 
         {leaderboard.map(p => <li key={p.id}>{p.nickname}: {p.score} puntos</li>)}
       </ol>
       <h2 className="feedback-message">Esperando la siguiente pregunta...</h2> 
     </div>
   );
 }
 // 4. Si hay una pregunta activa, mostrarla con sus opciones.
 if (currentQuestion) {
   return (
     <div className="player-container game-view"> 
       {/* 🟢 NUEVO: Contenedor para el texto de la pregunta */}
       <div className="question-display-box"> {/* ⬅️ CLASE NUEVA AQUÍ */}
        <h1 className="question-text-player">{currentQuestion.text}</h1> 
       </div>
       <p className="countdown">Estás jugando como: {nickname}</p> 
       <div className="answer-grid">
         {currentQuestion.options.map((option, index) => (
           <button 
               key={index} 
               onClick={() => handleAnswerSubmit(index)} 
               disabled={hasAnswered}
               className={`answer-button color-${index}`}
           >
            <span>{option}</span> 
           </button>
         ))}
       </div>
       {hasAnswered && <h2 className="feedback-message">{feedback}</h2>}
     </div>
   );
}

 // 5. Lobby de espera
 return (
   <div className="player-container lobby-view"> 
       <h1 className="kahoot-title-player">¡Te has unido!</h1> 
       <div className="waiting-box"> 
           <h2>Esperando que el anfitrión comience...</h2>
           <p className="status-message">PIN: {pin} | Apodo: {nickname}</p> 
       </div>
       <button className="back-button" onClick={() => setView('home')}> 
           Salir
       </button>
   </div>
 );
}

export default PlayerPage;