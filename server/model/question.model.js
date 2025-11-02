// server/models/question.model.js

const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './kahoot.db';

// Creamos o nos conectamos a la base de datos
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(`❌ Error al conectar a la base de datos: ${err.message}`);
        return;
    }
    console.log('✅ Conectado a la base de datos SQLite.');
});

/**
 * Función que obtiene todas las preguntas de la tabla 'questions'.
 * @returns {Promise<Array<object>>} Una promesa que resuelve con la lista de preguntas.
 */
exports.getAllQuestions = () => {
    return new Promise((resolve, reject) => {
        // Obtenemos 50 preguntas aleatorias de la tabla
        const query = 'SELECT text, options, correctAnswer FROM questions ORDER BY RANDOM() LIMIT 50';
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error("Error al obtener preguntas:", err.message);
                reject(err);
                return;
            }
            
            // Mapeamos los resultados para ajustarlos al formato esperado por game.service.js
            const questions = rows.map(row => ({
                text: row.text,
                // Las opciones están en un string separado por comas, las convertimos a array
                options: row.options.split(','), 
                // Renombramos correctAnswer a correctAnswerIndex para mantener la convención
                correctAnswerIndex: row.correctAnswer 
            }));
            
            resolve(questions);
        });
    });
};

/**
 * Función para cerrar la conexión de la base de datos (generalmente al cerrar el servidor)
 */
exports.closeDb = (callback) => {
    db.close(callback);
};