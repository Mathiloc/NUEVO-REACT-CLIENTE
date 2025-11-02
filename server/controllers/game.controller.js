// server/controllers/game.controller.js - CÓDIGO COMPLETO Y CORREGIDO

const gameService = require('../services/game.service');

module.exports = (io, socket) => {
    
    // =========================================================================
    //  MANEJO DE HOST
    // =========================================================================

    // 1. Crear Juego
    socket.on('create-game', () => {
        // Verificar si este socket ya es host de un juego (importante tras reconexiones)
        if (gameService.isHost(socket.id)) {
            // Si ya es host, simplemente lo forzamos a unirse a la sala de su juego existente
            const existingPin = Object.values(gameService.games).find(g => g.hostId === socket.id)?.pin;
            if (existingPin) {
                socket.join(existingPin);
                return socket.emit('game-created', existingPin);
            }
        }
        
        const pin = gameService.createGame(socket.id);
        socket.join(pin);
        socket.emit('game-created', pin);
        console.log(`[CONTROLLER] Juego creado por Host ${socket.id}. PIN: ${pin}`);
    });
    
    // 2. Re-unirse a la sala (Host recarga la página)
    socket.on('rejoin-game-room', (pin) => {
        const game = gameService.getGame(pin);
        if (game && game.hostId === socket.id) {
            socket.join(pin);
            // Si el juego ya está en progreso, enviar la pregunta actual
            if (game.currentQuestionIndex >= 0 && game.status === 'in-progress') {
                const question = game.quiz[game.currentQuestionIndex];
                socket.emit('next-question', gameService.getClientQuestion(question));
            }
            // Enviar la lista de jugadores actualizada
            socket.emit('update-player-list', game.players);
            console.log(`[CONTROLLER] Host ${socket.id} se re-unió a la sala ${pin}.`);
        }
    });

    // 3. Iniciar Juego
    socket.on('start-game', (pin) => {
        const question = gameService.startGame(pin);
        if (question) {
            io.to(pin).emit('next-question', question);
            console.log(`[CONTROLLER] Juego ${pin} iniciado. Pregunta 1 enviada.`);
        } else {
            // Manejar error (e.g., no hay jugadores, juego ya iniciado)
            socket.emit('error-message', 'No se pudo iniciar el juego. ¿Hay jugadores?');
        }
    });

    // 4. Siguiente Pregunta
    socket.on('next-question', (pin) => {
        const nextQuestion = gameService.startNewRound(pin);
        if (nextQuestion) {
            io.to(pin).emit('next-question', nextQuestion);
            console.log(`[CONTROLLER] Juego ${pin}: Siguiente pregunta enviada.`);
        } else {
            // Si retorna null, el juego ha terminado
            const finalScores = gameService.getLeaderboard(pin);
            io.to(pin).emit('game-over', finalScores);
            console.log(`[CONTROLLER] Juego ${pin} terminado.`);
        }
    });

    // 5. Mostrar Leaderboard
    socket.on('show-leaderboard', (pin) => {
        const leaderboard = gameService.getLeaderboard(pin);
        if (leaderboard) {
            io.to(pin).emit('update-leaderboard', leaderboard);
            console.log(`[CONTROLLER] Juego ${pin}: Leaderboard enviada.`);
        }
    });


    // =========================================================================
    //  MANEJO DE JUGADOR
    // =========================================================================

    // 1. Unirse a Juego
    socket.on('join-game', ({ pin, nickname }) => {
        const gamePin = pin.trim();
        const cleanNickname = nickname.trim();
        
        // CORRECCIÓN CLAVE: Usar getGame(pin) en lugar de gameExists(pin)
        // La condición verifica: si el juego NO existe O el apodo está vacío
        if (!gameService.getGame(gamePin) || cleanNickname === "") { 
            return socket.emit('error-message', 'PIN de juego no válido o apodo vacío.');
        }

        const players = gameService.addPlayer(gamePin, socket.id, cleanNickname);

        if (players && players.error) {
             return socket.emit('error-message', players.error);
        }

        if (players) {
            socket.join(gamePin);
            
            // 1. Notificar al jugador que se unió
            socket.emit('join-success', { gamePin, nickname: cleanNickname });
            
            // 2. Notificar al host y a otros jugadores que hay un nuevo jugador
            // Nota: Se usa io.to(pin) para que también el host reciba la actualización
            io.to(gamePin).emit('player-joined', players); 
            console.log(`[CONTROLLER] Jugador ${cleanNickname} (${socket.id}) se unió al juego ${gamePin}.`);
        }
    });

    // 2. Enviar Respuesta
    socket.on('submit-answer', ({ gamePin, answerIndex }) => {
        const result = gameService.submitAnswer(gamePin, socket.id, answerIndex);

        if (result) {
            // 1. Notificar al jugador su resultado y puntaje
            socket.emit('answer-result', { isCorrect: result.isCorrect, newScore: result.newScore });
            
            // 2. Notificar al Host para que actualice el conteo de respuestas
            // Aquí usamos socket.to(gamePin) para enviar a todos MENOS al emisor
            // Sin embargo, queremos que el HOST reciba la lista actualizada,
            // por lo que sería más seguro enviar a la sala:
            const hostId = gameService.getGame(gamePin)?.hostId;
            if (hostId) {
                // Notificar SÓLO al host con el estado de respuesta de todos los jugadores
                io.to(hostId).emit('update-round-status', result.updatedPlayers); 
            }
        }
    });
    
    
    // =========================================================================
    //  MANEJO DE DESCONEXIÓN (Host y Jugador)
    // =========================================================================

    const handleLeave = () => {
        
        // --- 1. Lógica de limpieza de HOST ---
        if (gameService.isHost(socket.id)) {
            // removeHost() elimina el juego y libera el PIN
            const pinClosed = gameService.removeHost(socket.id); 
            
            if (pinClosed) {
                // Notificar a todos los jugadores en la sala que el juego se cerró
                io.to(pinClosed).emit('game-closed', { message: "El anfitrión ha cerrado el juego." });
                console.log(`[CONTROLLER] Host ${socket.id} cerró y ELIMINÓ el juego ${pinClosed}.`);
            }
        }
        
        // --- 2. Lógica de limpieza de JUGADOR ---
        const gamePinPlayer = gameService.removePlayer(socket.id); 
        
        if (gamePinPlayer) {
            socket.leave(gamePinPlayer);
            const game = gameService.getGame(gamePinPlayer);

            if (game) {
                 // Notificar a los que quedan (incluyendo el host)
                io.to(gamePinPlayer).emit('player-left', game.players);
            }
            console.log(`[CONTROLLER] Jugador ${socket.id} salió del juego ${gamePinPlayer}.`);
        } 
        
        console.log(`Cliente desconectado: ${socket.id}`);
    };

    // Listener para desconexión natural (cierre de navegador, timeout)
    socket.on('disconnect', handleLeave); 

    // Listener para salida explícita (clic en botón "Salir de Anfitrión" o "Salir")
    socket.on('leave-current-role', handleLeave);
};