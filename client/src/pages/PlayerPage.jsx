// client/src/pages/PlayerPage.jsx - CÓDIGO COMPLETO Y CORREGIDO

import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from '../context/GlobalContext';
import { useSocket } from '../hooks/useSocket'; 
import '../style/PlayerPage.css'; 

function PlayerPage() {
    const { session, updateSession, logout } = useGlobalContext();
    const { emit, on, socketId } = useSocket(); 
    
    // Estados locales para el formulario
    const [pinInput, setPinInput] = useState(session.gamePin || '');
    const [nicknameInput, setNicknameInput] = useState(session.nickname || '');

    // Ref para almacenar los valores VALIDADOS al momento de emitir la unión
    const joinDataRef = useRef({ pin: session.gamePin, nickname: session.nickname });

    // Estados locales del juego
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false); 
    
    // Variables de sesión
    const gamePin = session.gamePin;
    const nickname = session.nickname;

    // Función de envío de respuesta
    const handleAnswerSubmit = (answerIndex) => { 
        if (!gamePin || !nickname || hasAnswered) return;

        // 1. Notificar al servidor
        emit('submit-answer', { 
            gamePin: gamePin, 
            answerIndex: answerIndex 
        });

        // 2. Actualizar estado local para bloquear respuestas
        setHasAnswered(true);
        setFeedback('¡Respuesta enviada! Esperando al anfitrión...');
    };
    
    // FUNCIÓN DE LIMPIEZA CENTRALIZADA (CORREGIDA)
    const handleLogout = (notifyServer = true) => {
        if (notifyServer && emit) {
            // CRÍTICO: Notificar al servidor para eliminar al jugador del juego
            emit('leave-current-role'); 
        }
        // Nota: NO LLAMAMOS a disconnect() aquí.
        logout(); // Limpiar sesión (gamePin: null, view: 'home', etc.)
    };
    
    // Función de unión al juego
    const handleJoinGame = () => { 
        const pin = pinInput.trim();
        const nick = nicknameInput.trim();

        if (!pin || !nick) {
            return alert('Por favor, ingresa el PIN y un apodo.');
        }
        
        joinDataRef.current = { pin, nickname: nick }; 
        
        setPinInput(pin);
        setNicknameInput(nick);
        
        emit('join-game', { pin: pin, nickname: nick });
    };

    // Efecto para guardar el socketId en la sesión global
    useEffect(() => {
        if (socketId && session.socketId !== socketId) {
            updateSession({ socketId });
        }
    }, [socketId, updateSession, session.socketId]);

    // Efecto para listeners de Socket.IO
    useEffect(() => {
        
        on('join-success', () => {
             updateSession({ 
                 isLoggedIn: true, 
                 gamePin: joinDataRef.current.pin,
                 nickname: joinDataRef.current.nickname,
                 view: 'player', 
             });
        });
        
        on('error-message', (message) => {
             alert(message);
        });
        
        on('next-question', (question) => {
             setCurrentQuestion(question); 
             setHasAnswered(false); 
             setFeedback('Elige una opción:');
             setLeaderboard([]); 
             setIsGameOver(false);
        });
        
        on('answer-result', ({ isCorrect, newScore }) => {
             const message = isCorrect 
                 ? `¡Correcto! Tu nuevo puntaje es: ${newScore}` 
                 : `Incorrecto. Tu puntaje actual es: ${newScore}`;
             setFeedback(message);
        });

        on('update-leaderboard', (scores) => {
            setCurrentQuestion(null); 
            setLeaderboard(scores); 
        });

        on('game-over', (finalScores) => {
             setCurrentQuestion(null);
             setLeaderboard(finalScores);
             setIsGameOver(true);
        });
        
        on('game-closed', (data) => {
            alert(data.message || 'El anfitrión ha cerrado el juego.');
            handleLogout(false); // Sale sin notificar de nuevo al servidor
        });
        
    }, [on, updateSession, logout]); 

    // ----------------------------------------------------
    // --- LÓGICA DE RENDERIZADO ---
    // ----------------------------------------------------

    // 1. Formulario de Ingreso
    if (!gamePin || !nickname) { 
        return (
            <div className="player-container entry-view"> 
            <h1 className="kahoot-title-player">Unirse a un Juego</h1> 
            
            <form onSubmit={(e) => e.preventDefault()} className="join-form"> 
                <input type="text" placeholder="PIN del Juego" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="pin-input" />
                <br />
                <input type="text" placeholder="Tu Apodo" value={nicknameInput} onChange={(e) => setNicknameInput(e.target.value)} className="nickname-input" />
                <br />
                <button type="button" className="join-button" onClick={handleJoinGame}> 
                    ¡Jugar!
                </button>
            </form>
            <button className="back-button" onClick={() => handleLogout(false)}> 
                Volver a Inicio
            </button>
            </div>
        );
    } 

    // 2. Juego Terminado
    if (isGameOver) {
          return (
              <div className="player-container lobby-view"> 
                  <h1>¡Juego Terminado!</h1>
                  <h2 className="leaderboard-title">Resultados Finales:</h2>
                  <ol className="player-list-lobby leaderboard-list"> 
                      {leaderboard.map((p, index) => (
                          <li key={p.id} className={`leaderboard-item place-${index + 1}`}>
                              {index + 1}. {p.nickname}: {p.score} puntos
                          </li>
                      ))}
                 </ol>
                 {/* CRÍTICO: Botón de salida que notifica al servidor */}
                  <button className="back-button" onClick={handleLogout}> 
                      Salir del Juego 
                  </button>
              </div>
          );
    }
    
    // 3. Renderizado de Leaderboard (Tabla de Posiciones)
    if (leaderboard.length > 0) { 
          const myScore = leaderboard.find(p => p.id === session.socketId)?.score || 0;
          
          return (
              <div className="player-container lobby-view"> 
                  <h1>Tabla de Posiciones</h1>
                  <h2 className="leaderboard-title">Tu puntaje: {myScore}</h2>
                  <ol className="player-list-lobby leaderboard-list"> 
                      {leaderboard.map((p, index) => (
                          <li key={p.id} className={`leaderboard-item place-${index + 1}`}>
                              {index + 1}. {p.nickname}: {p.score} puntos
                          </li>
                      ))}
                  </ol>
                  <p className="status-message">Esperando la siguiente pregunta...</p>
              </div>
          );
    }

    if (currentQuestion) { 
        return (
            <div className="player-container game-view">
                <div className="question-display-box"> 
                    <h1 className="question-text-player">{currentQuestion.text}</h1> 
                </div>
                
                <p className="feedback-message">{feedback}</p>
                
                {/* Opciones de respuesta */}
                <div className="answer-grid"> 
                    {currentQuestion.options.map((optionText, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSubmit(index)} 
                            disabled={hasAnswered} 
                            className={`answer-button color-${index}`} 
                        >
                            {optionText} 
                        </button>
                    ))}
                </div>
            </div>
        );
    }
    
    // 5. Lobby de espera (Renderizado Final)
    return (
        <div className="player-container lobby-view"> 
            <h1 className="kahoot-title-player">¡Te has unido!</h1> 
            <div className="waiting-box"> 
                <h2>Esperando que el anfitrión comience...</h2>
                <p className="status-message">PIN: {gamePin} | Apodo: {nickname}</p> 
            </div>
            <button className="back-button" onClick={handleLogout}> 
                Salir
            </button>
        </div>
    );
}

export default PlayerPage;