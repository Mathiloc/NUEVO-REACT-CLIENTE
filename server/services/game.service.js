// server/services/game.service.js - CÓDIGO COMPLETO Y FINAL (PIN DE 4 DÍGITOS)

// --- Almacenamiento Global del Estado del Juego ---
const games = {};
const PIN_LENGTH = 4; 

// --- Funciones de Utilidad ---

/**
 * Genera un PIN único numérico de 4 dígitos.
 * @returns {string} El PIN de 4 dígitos.
 */
const generatePin = () => {
    let pin = '';
    do {
        // Genera un número aleatorio entre 1000 y 9999
        pin = Math.floor(1000 + Math.random() * 9000).toString();
    } while (games[pin]);
    return pin;
};

/**
 * Genera una pregunta segura para el cliente (solo texto y opciones).
 * @param {object} question - Objeto de pregunta del servidor.
 * @returns {object|null} Pregunta simplificada para el cliente.
 */
const getClientQuestion = (question) => {
    if (!question) return null;
    return {
        text: question.text,
        options: question.options.map(opt => opt.text),
        timeLimit: question.timeLimit || 20,
    };
};

// Preguntas de ejemplo (ESTADO INICIAL DEL JUEGO)
const sampleQuiz = [
    { text: "¿Cuál es la capital de Perú?", options: [{ text: "Lima", isCorrect: true }, { text: "Quito", isCorrect: false }, { text: "Bogotá", isCorrect: false }, { text: "Santiago", isCorrect: false }], correctAnswerIndex: 0, timeLimit: 20 },
    { text: "¿En qué año se fundó Google?", options: [{ text: "1995", isCorrect: false }, { text: "1998", isCorrect: true }, { text: "2001", isCorrect: false }, { text: "2004", isCorrect: false }], correctAnswerIndex: 1, timeLimit: 20 },
    { text: "¿Cuántos lados tiene un dodecaedro?", options: [{ text: "10", isCorrect: false }, { text: "12", isCorrect: true }, { text: "14", isCorrect: false }, { text: "20", isCorrect: false }], correctAnswerIndex: 1, timeLimit: 20 },
];


// --- Lógica del Servicio ---

/**
 * Crea un nuevo juego y asigna el host.
 * @param {string} hostId El ID del socket del host.
 * @returns {string} El PIN del juego.
 */
const createGame = (hostId) => {
    const pin = generatePin();
    games[pin] = {
        pin,
        hostId: hostId,
        players: [],
        currentQuestionIndex: -1,
        quiz: sampleQuiz,
        status: 'lobby', // 'lobby', 'in-progress', 'finished'
    };
    return pin;
};

/**
 * Añade un jugador a un juego existente.
 * @param {string} pin PIN del juego.
 * @param {string} socketId ID del socket del jugador.
 * @param {string} nickname Nickname del jugador.
 * @returns {object|null} La lista de jugadores si tiene éxito, o un error.
 */
const addPlayer = (pin, socketId, nickname) => {
    const game = games[pin]; 
    if (!game) return { error: "Juego no encontrado." };
    if (game.status !== 'lobby') return { error: "El juego ya ha comenzado o ha finalizado." };

    // Evitar apodos duplicados
    if (game.players.some(p => p.nickname === nickname)) {
        return { error: `El apodo "${nickname}" ya está en uso.` };
    }

    const newPlayer = {
        id: socketId,
        nickname: nickname,
        score: 0,
        hasAnswered: false,
    };

    game.players.push(newPlayer);
    return game.players;
};

/**
 * Elimina un jugador de un juego.
 * @param {string} socketId ID del socket del jugador.
 * @returns {string|null} El PIN del juego del que salió, o null.
 */
const removePlayer = (socketId) => {
    for (const pin in games) {
        const game = games[pin];
        const initialLength = game.players.length;
        
        // Filtrar y eliminar el jugador
        game.players = game.players.filter(p => p.id !== socketId);

        if (game.players.length < initialLength) {
            return pin; // Jugador encontrado y eliminado
        }
    }
    return null;
};

/**
 * Inicia el juego y pasa a la primera pregunta.
 * @param {string} pin PIN del juego.
 * @returns {object|null} La primera pregunta para el cliente, o null.
 */
const startGame = (pin) => {
    const game = games[pin];
    if (!game || game.status !== 'lobby' || game.players.length === 0) return null;

    game.status = 'in-progress';
    game.currentQuestionIndex = 0;
    const question = game.quiz[game.currentQuestionIndex];

    return getClientQuestion(question);
};

/**
 * Pasa a la siguiente pregunta del juego.
 * @param {string} pin PIN del juego.
 * @returns {object|null} La siguiente pregunta para el cliente, o null si el juego termina.
 */
const startNewRound = (pin) => {
    const game = games[pin];
    if (!game || game.status !== 'in-progress') return null;

    // Resetear el estado de respuesta de los jugadores
    game.players.forEach(p => p.hasAnswered = false);

    game.currentQuestionIndex++;

    if (game.currentQuestionIndex >= game.quiz.length) {
        game.status = 'finished';
        return null; // Juego terminado
    }

    const question = game.quiz[game.currentQuestionIndex];
    return getClientQuestion(question);
};

/**
 * Procesa la respuesta de un jugador y actualiza el puntaje.
 * @param {string} pin PIN del juego.
 * @param {string} playerId ID del socket del jugador.
 * @param {number} answerIndex Índice de la respuesta seleccionada.
 * @returns {object|null} {isCorrect: boolean, newScore: number, updatedPlayers} o null.
 */
const submitAnswer = (pin, playerId, answerIndex) => {
    const game = games[pin];
    if (!game || game.status !== 'in-progress') return null;
    
    const player = game.players.find(p => p.id === playerId);
    if (!player || player.hasAnswered) return null;

    const question = game.quiz[game.currentQuestionIndex];
    const isCorrect = question.correctAnswerIndex === answerIndex;

    player.hasAnswered = true;

    if (isCorrect) {
        player.score += 100; // Lógica de puntaje base
    }

    return { 
        isCorrect, 
        newScore: player.score,
        updatedPlayers: game.players
    };
};

/**
 * Obtiene la lista de jugadores ordenada por puntaje.
 * @param {string} pin PIN del juego.
 * @returns {Array<object>|null} Lista de jugadores (id, nickname, score) o null.
 */
const getLeaderboard = (pin) => {
    const game = games[pin];
    if (!game) return null;

    // Clonar y ordenar por puntaje descendente
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

    return sortedPlayers.map(p => ({
        id: p.id,
        nickname: p.nickname,
        score: p.score
    }));
};

/**
 * Obtiene el estado de un juego.
 * @param {string} pin PIN del juego.
 * @returns {object|null} Objeto del juego.
 */
const getGame = (pin) => games[pin] || null;

/**
 * Verifica si un socket ID pertenece a un Host.
 * @param {string} socketId ID del socket.
 * @returns {boolean} True si es Host.
 */
const isHost = (socketId) => {
    return Object.values(games).some(game => game.hostId === socketId);
};

// --- LÓGICA DE LIMPIEZA CLAVE ---

/**
 * ELIMINA el juego de la lista global, liberando el PIN.
 * @param {string} pin PIN del juego.
 * @returns {boolean} True si el juego fue eliminado.
 */
const removeGame = (pin) => {
    if (games[pin]) {
        delete games[pin];
        console.log(`[SERVICE] Juego ${pin} eliminado y PIN liberado.`);
        return true;
    }
    return false;
};

/**
 * Encuentra y elimina al Host de un juego y luego elimina el juego.
 * @param {string} hostId ID del socket del host que se desconecta.
 * @returns {string|null} El PIN del juego eliminado, o null.
 */
const removeHost = (hostId) => {
    for (const pin in games) {
        if (games[pin].hostId === hostId) {
            const gamePin = pin;
            removeGame(gamePin); // Elimina el juego asociado y libera el PIN
            return gamePin;
        }
    }
    return null;
};


// --- Exportar Funciones ---
module.exports = {
    createGame,
    addPlayer,
    removePlayer,
    startGame,
    startNewRound,
    submitAnswer,
    getLeaderboard,
    getGame,
    isHost,
    removeGame, 
    removeHost, 
};