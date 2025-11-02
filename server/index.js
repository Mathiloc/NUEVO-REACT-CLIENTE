// server/index.js - CÓDIGO COMPLETO Y CORREGIDO

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// CAMBIO CLAVE: Importamos la función directamente (sin llaves {})
const setupGameHandlers = require('./controllers/game.controller'); 

// --- Configuración Inicial ---
const app = express();
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
    }
});

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