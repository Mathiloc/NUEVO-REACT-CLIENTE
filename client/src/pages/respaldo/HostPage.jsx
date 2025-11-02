// src/pages/HostPage.jsx - VERSIÓN COMPLETA Y FUNCIONAL

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../style/HostPage.css';

const socket = io('http://localhost:4000');

function HostPage() {
  const [gamePin, setGamePin] = useState(''); //
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    socket.on('game-created', (pin) => setGamePin(pin));
    
    
    socket.on('player-joined', (updatedPlayers) => setPlayers(updatedPlayers));
    socket.on('update-player-list', (updatedPlayers) => setPlayers(updatedPlayers));

    socket.on('next-question', (question) => {
      setCurrentQuestion(question);
      setLeaderboard([]); // Ocultamos el leaderboard al pasar a la siguiente pregunta
      setIsGameOver(false);
    });

    socket.on('update-leaderboard', (scores) => setLeaderboard(scores));
    socket.on('game-over', (finalScores) => {
      setLeaderboard(finalScores);
      setIsGameOver(true);
      setCurrentQuestion(null);
    });

    // ✅ CORREGIDO: Limpieza completa de todos los eventos para evitar errores
    return () => {
      socket.off('game-created');
      socket.off('player-joined');
      socket.off('update-player-list');
      socket.off('next-question');
      socket.off('update-leaderboard');
      socket.off('game-over');
    };
  }, []);

  // Funciones para emitir eventos al servidor (sin cambios)
  const createGame = () => socket.emit('create-game');
  const startGame = () => socket.emit('start-game', gamePin);
  const showLeaderboard = () => socket.emit('show-leaderboard', gamePin);
  const nextQuestion = () => socket.emit('next-question', gamePin);

  // --- LÓGICA DE RENDERIZADO CORREGIDA Y ORDENADA ---

  // 1. Si el juego ha terminado, muestra los resultados finales.
  if (isGameOver) {
    return (
      <div className="host-container">
        <h1>¡Juego Terminado!</h1>
        <h2>Resultados Finales:</h2>
        <ol className="player-list-lobby"> 
        {leaderboard.map(p => <li key={p.id}>{p.nickname}: {p.score} puntos</li>)}
       </ol>
       <button 
            className="host-button host-button-secondary"
            onClick={() => setView('home')} // Permite volver al home
        >
            Volver a Inicio
        </button>

      </div>
    );
  }

  // 2. Si hay datos en el leaderboard, muestra la tabla de posiciones.
  if (leaderboard.length > 0) {
    return (
      <div className="host-container">
        <h1>Tabla de Posiciones</h1>
        <ol>{leaderboard.map(p => <li key={p.id}>{p.nickname}: {p.score} puntos</li>)}</ol>
        <button className="host-button host-button-secondary" onClick={nextQuestion}>Siguiente Pregunta</button>
      </div>
    );
  }

  // 3. ✅ ¡NUEVO! Si hay una pregunta activa, muestra la vista del juego en vivo.
  if (currentQuestion) {
    const answeredCount = players.filter(p => p.hasAnswered).length;
    return (
      <div className="host-container">
        <div className="question-container">
        <h1>{currentQuestion.text}</h1>
        </div>
        
        <div className="question-stats-box">
        <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Respuestas recibidas: {answeredCount} de {players.length}</p>
        
        <h3>Puntajes en vivo:</h3>
        <ul>
          {players.map(p => (
            <li key={p.id} style={{ margin: '5px 0' }}>
              {p.nickname}: {p.score} puntos {p.hasAnswered ? '✅' : '...'}
            </li>
          ))}
        </ul>
        </div>

        {/* El anfitrión decide cuándo continuar */}
        <button className="host-button host-button-secondary" onClick={showLeaderboard}>Mostrar Puntuaciones</button>
      </div>
    );
  }

  // 4. Si ninguna de las condiciones anteriores se cumple, muestra el lobby.
  return (
    <div className="host-container">
      <h1>Panel del Anfitrión</h1>
      {!gamePin ? (
        <button className="host-button host-button-primary" onClick={createGame}>Crear Nuevo Juego</button>
      ) : (
        <div className="pin-display">
          <h2>Pide a los jugadores que usen este PIN:</h2>
          <h1 className="pin-number" style={{ fontSize: '4rem', color: '#20807C' }}>{gamePin}</h1>
          <h3>Jugadores Conectados ({players.length}):</h3>
          <ul className="player-list-lobby">
            {players.map(p => <li key={p.id}>{p.nickname}</li>)}
          </ul>
          <button className="host-button host-button-primary" onClick={startGame} disabled={players.length === 0}>
            Iniciar Juego
          </button>
        </div>
      )}
    </div>
  );
}

export default HostPage;