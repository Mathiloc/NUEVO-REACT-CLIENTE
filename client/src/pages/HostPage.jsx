// client/src/pages/HostPage.jsx - CÓDIGO COMPLETO Y CORREGIDO

import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { useSocket } from '../hooks/useSocket'; 
import '../style/HostPage.css';

function HostPage() {
    const { session, updateSession, logout } = useGlobalContext();
    // NO usamos disconnect aquí
    const { emit, on } = useSocket(); 

    // Estados locales para el JUEGO EN VIVO 
    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false);
    
    const gamePin = session.gamePin; 

    useEffect(() => {
        
        // Host crea el juego con éxito
        on('game-created', (pin) => {
            updateSession({ gamePin: pin, isLoggedIn: true });
        });
        
        // Manejo de lista de jugadores
        on('player-joined', (updatedPlayers) => setPlayers(updatedPlayers));
        on('update-player-list', (updatedPlayers) => setPlayers(updatedPlayers));
        on('player-left', (updatedPlayers) => setPlayers(updatedPlayers)); 
        
        // Listener para actualizar el estado de la ronda (checks y puntajes en vivo)
        on('update-round-status', (updatedPlayers) => {
            console.log("HOST: Lista de jugadores actualizada después de respuesta.", updatedPlayers);
            setPlayers(updatedPlayers);
        });

        // El servidor envía la siguiente pregunta
        on('next-question', (question) => {
            setCurrentQuestion(question);
            setLeaderboard([]); 
            setIsGameOver(false);
        });
        
        // El servidor pide mostrar el leaderboard
        on('update-leaderboard', (scores) => {
            setCurrentQuestion(null); 
            setLeaderboard(scores);
        });
        
        // El servidor finaliza el juego
        on('game-over', (finalScores) => {
            setLeaderboard(finalScores);
            setIsGameOver(true);
            setCurrentQuestion(null);
        });

    }, [on, updateSession]);

    // Lógica para re-unirse a la sala si el host recarga
    useEffect(() => {
        if (session.gamePin) {
            emit('rejoin-game-room', session.gamePin);
        }
    }, [emit, session.gamePin]);


    // Funciones para emitir eventos al servidor (usan 'emit')
    const createGame = () => emit('create-game');
    const startGame = () => emit('start-game', gamePin);
    const showLeaderboard = () => emit('show-leaderboard', gamePin); 
    const nextQuestion = () => emit('next-question', gamePin);
    
    // CORRECCIÓN CLAVE: handleLogout - Solo emite la limpieza y limpia la sesión.
    const handleLogout = () => {
        // 1. Notificar al servidor para ELIMINAR el juego y liberar el PIN
        emit('leave-current-role'); 
        
        // 2. Limpiar el contexto (esto mueve la vista a 'home' y permite crear otro juego)
        logout(); 
    };


    // --- LÓGICA DE RENDERIZADO ---

    if (isGameOver) {
        return (
            <div className="host-container">
                <h1>¡Juego Terminado!</h1>
                <h2>Resultados Finales:</h2>
                <ol className="player-list-lobby"> 
                    {leaderboard.map(p => <li key={p.id}>{p.nickname}: {p.score} puntos</li>)}
               </ol> 
                <button 
                        className="host-button host-button-primary" // Se usa primary para indicar la acción final
                        onClick={handleLogout}
                    >
                        Volver a Inicio y Cerrar Juego
                    </button>
            </div>
        );
    }

    if (leaderboard.length > 0) {
        return (
            <div className="host-container">
                <h1>Tabla de Posiciones</h1>
                <ol>
                    {leaderboard.map(p => <li key={p.id}>{p.nickname}: {p.score} puntos</li>)}
                </ol>
                <button className="host-button host-button-secondary" onClick={nextQuestion}>Siguiente Pregunta</button>
            </div>
        );
    }
    
    if (currentQuestion) {
        const answeredCount = players.filter(p => p.hasAnswered).length;
        const allAnswered = answeredCount === players.length && players.length > 0;
        
        return (
            <div className="host-container">
                <div className="question-container">
                <h1>{currentQuestion.text}</h1>
                </div>
                
                <div className="question-stats-box">
                <p style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Respuestas recibidas: {answeredCount} de {players.length}</p>
                
                <h3>Puntajes en vivo:</h3>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {players.map(p => (
                    <li key={p.id} style={{ margin: '5px 0' }}>
                      {p.nickname}: {p.score} puntos {p.hasAnswered ? '✅' : '...'}
                    </li>
                  ))}
                </ul>
                </div>
                
                <button 
                    className={`host-button ${allAnswered ? 'host-button-primary' : 'host-button-secondary'}`} 
                    onClick={showLeaderboard}
                >
                    {allAnswered ? 'Mostrar Puntuaciones' : 'Mostrar Puntuaciones (Forzar)'}
                </button>
            </div>
        );
    }

    // Lobby del Host (Antes de iniciar el juego)
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
                    {players.length > 0 ? (
                        <ul className="player-list-lobby">
                            {players.map(p => <li key={p.id}>{p.nickname}</li>)}
                        </ul>
                    ) : (
                        <p>Esperando jugadores...</p>
                    )}
                    
                    <button className="host-button host-button-primary" onClick={startGame} disabled={players.length === 0}>
                        Iniciar Juego
                    </button>
                    <button className="host-button host-button-secondary" onClick={handleLogout} style={{marginTop: '10px'}}>
                        Cerrar Juego y Volver a Inicio
                    </button>
                </div>
            )}
        </div>
    );
}

export default HostPage;