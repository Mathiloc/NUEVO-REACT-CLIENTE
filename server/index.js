<<<<<<< HEAD
// server/index.js - CÓDIGO COMPLETO Y CORREGIDO

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
=======
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const sqlite3 = require('sqlite3').verbose();
// En una versión futura se usará también Redis para guardar el estado de las partidas entre reinicios del servidor
// const { createClient } = require("redis");
>>>>>>> 387ce640cdc691d0a1c5ecdde0db685ae0df5192

// CAMBIO CLAVE: Importamos la función directamente (sin llaves {})
const setupGameHandlers = require('./controllers/game.controller'); 

// --- Configuración Inicial ---
const app = express();
<<<<<<< HEAD
const PORT = process.env.PORT || 4000;

// Configuración de CORS para permitir la comunicación con el cliente
app.use(cors({
    origin: 'http://localhost:5173', // La URL de tu cliente Vite
    methods: ['GET', 'POST'],
}));

app.use(express.json());

// --- Creación del Servidor HTTP y Socket.IO ---
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
=======

/*
Las variables como el puerto del servidor y la URL base (por ejemplo localhost)
deben ir definidas como variables de entorno. Esto nos permite usar exactamente
el mismo código tanto en desarrollo como en producción y solamente cambiar los
valores mediante el archivo .env según el entorno en el que estemos trabajando.

IMPORTANTE: las variables de entorno deben ir en un archivo .env y este archivo
debe estar incluido en el .gitignore para que no se suba al repositorio público.

El .gitignore es un archivo que le indica a Git qué archivos no se deben subir
al repositorio. Esto es fundamental para proteger información sensible como
tokens, contraseñas, claves privadas, URL de base de datos, etc.
*/
const port = 5174;
const server = http.createServer(app);

/*
Todo lo relacionado al CORS (Cross-Origin Resource Sharing) debería declararse
en una carpeta middleware. Un middleware es una función que "intercepta"
las solicitudes antes de que lleguen a las rutas reales, y permite agregar
cabeceras o hacer validaciones comunes.

Ejemplos de middlewares típicos:
- CORS: permitir que solicitudes desde otros dominios accedan a nuestros recursos.
- Verificación de Access Token: autenticar y autorizar al usuario antes de permitir acceso.
- Manejo de Refresh Token: renovar el token de acceso sin forzar al usuario a volver a iniciar sesión.
- Rate limiting: limitar cuántas peticiones puede hacer un cliente en un periodo de tiempo.

se debe mover a /middleware/cors.js
*/
const io = new Server(server, { cors: { origin: "*" } });

/*
En este archivo (index.js) solo debería estar:
- la creación del servidor HTTP/Express
- la configuración inicial de Socket.IO

Toda la lógica del juego NO debería vivir aquí. La lógica del juego debe moverse
a carpetas específicas (controllers, services, models, etc.).
Esta separación hace que el código sea mantenible cuando el proyecto crece.
*/

/*
Estructura recomendada de carpetas y responsabilidades:

ROUTES (rutas HTTP):
Convierte una URL en una acción concreta.
Ejemplos futuros:
- /game/create     -> crear una nueva partida
- /game/join       -> unirse a una partida existente
- /game/start      -> iniciar la partida

En este momento no hay rutas HTTP, pero se debe tener la carpeta lista para cuando
se agreguen endpoints REST.

CONTROLLERS:
Valida y prepara los datos que vienen de la petición antes de llamar a la capa de servicio.
Ejemplos:
- createGame.controller(): valida que el host envíe su nickname
- joinGame.controller(): valida que el jugador envíe un PIN y un nickname
- startGame.controller(): valida que quien inicia el juego sea el host
- submitAnswer.controller(): valida datos de la respuesta enviada por un jugador
- nextQuestion.controller(): solicita a la capa de servicio avanzar a la siguiente pregunta
- showLeaderboard.controller(): solicita a la capa de servicio devolver la tabla de puntajes

La responsabilidad del controller es validar parámetros y decidir si se responde con error
o si se llama al service. No implementa reglas de negocio complejas.

SERVICES:
Implementan la lógica de negocio real.
Ejemplos:
- createGame.service.js: crea una partida nueva y genera un PIN único
- joinGame.service.js: agrega un jugador a una partida existente
- startGame.service.js: cambia el estado del juego a "in-game" e inicia la primera pregunta
- question.service.js: obtiene y prepara las preguntas desde la base de datos
- scoring.service.js: calcula y actualiza puntajes

La capa service NO maneja sockets ni HTTP directamente. Su responsabilidad es:
recibir parámetros ya validados, ejecutar la lógica, modificar estado y devolver resultados.

MODELS:
Definen cómo se guardan los datos. Ejemplos de modelos:
- Game (partida)
- Player (jugador)
- Question (pregunta)

Por ahora lo único cercano a un "modelo" es la parte que accede a SQLite para obtener
las preguntas. Ese acceso directo a la base de datos debería moverse a una carpeta
/models o /data y exponerse como funciones reutilizables (crear, leer, actualizar, eliminar).
*/

/*
Estado del servidor (games):

Actualmente estamos guardando las partidas en memoria usando la variable "games".
Esto significa:
- Cada key es el PIN de la partida.
- El valor es un objeto con información del host, jugadores, estado de la partida, etc.

Limitaciones importantes de esta aproximación:
1. Si el servidor se cae o se reinicia, se pierde toda la información (todas las partidas activas).
2. Si en producción hay más de una instancia del servidor (por ejemplo, varias réplicas detrás de un balanceador),
   cada instancia tendría su propia copia distinta de "games", lo que causa inconsistencias.

Para un entorno real / producción esto debe moverse a Redis.

Redis es una base de datos en memoria compartida que:
- Permite guardar el estado de las partidas de forma temporal.
- Permite que varias instancias del servidor compartan el mismo estado.
- Evita perder las partidas con un simple reinicio del proceso Node.

Uso típico de Redis en este caso (ejemplo conceptual):
- Guardar una partida:
    await redisClient.set(`game:${pin}`, JSON.stringify(gameData))
- Leer una partida:
    const game = JSON.parse(await redisClient.get(`game:${pin}`))
- Actualizar puntaje de un jugador:
    leer partida -> modificar -> volver a guardar

En este archivo todavía usamos un objeto local ("games") para simplificar,
pero debe ser reemplazado por Redis en la versión productiva.
*/
const games = {};

let allQuestions = [];

/*
Función para leer las preguntas desde la base de datos local SQLite.

Notas importantes:

TODAS LAS PREGUNTAS DE ABAJO DEBEN PARTIRSE EN MODELS Y SERVICES (debes agregar la validacion de controller y la direccion de router)
*/
const fetchQuestionsFromDb = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./kahoot.db');
        db.all('SELECT * FROM questions', [], (err, rows) => {
            if (err) {
                console.error('Error al leer de la base de datos:', err.message);
                return reject(err);
            }

            const formattedQuestions = rows.map(row => ({
                ...row,
                options: row.options.split(',')
            }));

            // Se mezclan las preguntas en orden aleatorio
            formattedQuestions.sort(() => Math.random() - 0.5);

            console.log(`Total de ${formattedQuestions.length} preguntas cargadas desde la base de datos.`);
            resolve(formattedQuestions);

            db.close();
        });
    });
};

/*
TODO ESTO DEBE DESACOPLARSE EN CONTROLLERS Y SERVICES
*/
const startServer = async () => {
    try {
        allQuestions = await fetchQuestionsFromDb();
    } catch (error) {
        console.error("No se pudo iniciar el servidor. Falló la carga de preguntas.");
        return;
>>>>>>> 387ce640cdc691d0a1c5ecdde0db685ae0df5192
    }
});

<<<<<<< HEAD
// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Kahoot Clone Server Running');
});

// CAMBIO CLAVE: Llamamos al manejador DENTRO del evento 'connection'
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    
    // Al conectarse un cliente, inicializamos todos sus listeners
    setupGameHandlers(io, socket); 
});


// --- Inicialización del Servidor ---
server.listen(PORT, () => {
    console.log(`Servidor de Express y Socket.IO escuchando en el puerto ${PORT}`);
});
=======
    io.on('connection', (socket) => {
        // Aquí se definen todos los eventos del juego asociados a este socket.
        // A futuro, cada uno de estos bloques socket.on(...) debería extraerse
        // a un controlador específico (por ejemplo, gameController.js).

        socket.on('create-game', () => {
            const gamePin = Math.floor(1000 + Math.random() * 9000).toString();

            games[gamePin] = {
                hostId: socket.id,
                players: [],
                state: 'lobby'
            };

            socket.join(gamePin);


            socket.emit('game-created', gamePin);
        });

        socket.on('join-game', ({ pin, nickname }) => {
            const game = games[pin];

            if (!game) {
                socket.emit('error-message', 'El PIN del juego no es válido.');
                return;
            }

            // Agregar jugador a la partida
            game.players.push({
                id: socket.id,
                nickname,
                score: 0,
                hasAnswered: false
            });

            socket.join(pin);


            io.to(game.hostId).emit('player-joined', game.players);

            socket.emit('join-success');
        });

        socket.on('start-game', (gamePin) => {
            const game = games[gamePin];

 
            if (game && game.hostId === socket.id && allQuestions.length > 0) {
                game.state = 'in-game';
                game.currentQuestion = 0;

                game.players.forEach(p => {
                    p.hasAnswered = false;
                });

                io.to(gamePin).emit('next-question', allQuestions[game.currentQuestion]);
            }
        });

        socket.on('submit-answer', ({ gamePin, answerIndex }) => {
            const game = games[gamePin];
            if (!game || game.state !== 'in-game') {
                return;
            }

            const question = allQuestions[game.currentQuestion];
            const player = game.players.find(p => p.id === socket.id);

            if (!player) {
                return;
            }

            if (player.hasAnswered) {
                return;
            }

            player.hasAnswered = true;

            const isCorrect = question.correctAnswer === answerIndex;
            if (isCorrect) {
                player.score += 1000;
            }

            socket.emit('answer-result', {
                correct: isCorrect,
                score: player.score
            });

            io.to(game.hostId).emit('update-player-list', game.players);
        });

        socket.on('show-leaderboard', (gamePin) => {
            const game = games[gamePin];
            if (!game || game.hostId !== socket.id) {
                return;
            }

            const leaderboard = game.players
                .slice()
                .sort((a, b) => b.score - a.score);

            io.to(gamePin).emit('update-leaderboard', leaderboard);
        });

        socket.on('next-question', (gamePin) => {
            const game = games[gamePin];
            if (!game || game.hostId !== socket.id) {
                return;
            }

            game.currentQuestion += 1;

            if (game.currentQuestion < allQuestions.length) {
                game.players.forEach(p => {
                    p.hasAnswered = false;
                });

                io.to(gamePin).emit(
                    'next-question',
                    allQuestions[game.currentQuestion]
                );
            } else {
                // Si no hay más preguntas, el juego termina
                const finalScores = game.players
                    .slice()
                    .sort((a, b) => b.score - a.score);

                io.to(gamePin).emit('game-over', finalScores);
            }
        });

        socket.on('disconnect', () => {
            console.log('Usuario desconectado:', socket.id);
            // Aquí faltaría la lógica para manejar desconexiones en medio del juego.
            // Con Redis sería posible:
            // - identificar si el desconectado era el host o un jugador
            // - marcarlo como desconectado temporalmente
            // - permitir la reconexión usando un token estable (guardado en redis), no solo socket.id

// IMPORTANTE: el token de reconexión debe ser persistente y no depender del socket.id,
// ya que el socket.id cambia cada vez que el usuario se conecta.
// el token debe de ser enviado desde el cliente en las peticiones de reconexión (revisar desde cliente si el usuario tiene token guardado en localStorage y validar reconexion con ese token, 
// en caso no se puede volver, iniciar de 0).

        });
    });

    server.listen(4000, () => {
        console.log('Servidor escuchando en el puerto 4000');
    });
};

/*
Esta parte inicia el servidor.

*/
startServer();
>>>>>>> 387ce640cdc691d0a1c5ecdde0db685ae0df5192
