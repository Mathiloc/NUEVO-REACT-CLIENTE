
const sqlite3 = require('sqlite3').verbose();

// Esto crea un nuevo archivo de base de datos llamado 'kahoot.db' en la carpeta 'server'
const db = new sqlite3.Database('./kahoot.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('✅ Conectado a la base de datos SQLite.');
});

db.serialize(() => {
    // Borramos la tabla si ya existe para empezar de cero
    db.run('DROP TABLE IF EXISTS questions', (err) => {
        if (err) return console.error(err.message);
        console.log("Tabla 'questions' eliminada (si existía).");
    });

    // Creamos la tabla 'questions'
    db.run(`
        CREATE TABLE questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            options TEXT NOT NULL,
            correctAnswer INTEGER NOT NULL
        )
    `, (err) => {
        if (err) return console.error(err.message);
        console.log("Tabla 'questions' creada exitosamente.");
    });

    // Insertamos todas tus preguntas
    const questionsToInsert = [
        ['(Matemática) ¿Cuál es el resultado de 8 × (5 + 2)?', '56,40,64,28', 0],
        ['(Matemática) ¿Cuál de los siguientes números es un número primo?', '21,19,25,27', 1],
        ['(Matemática) ¿Cuánto es 3² + 4²?', '12,25,7,16', 1],
        ['(Matemática) ¿Cuál es el valor de π (pi) aproximado?', '2.14,3.14,3.41,4.13', 1],
        ['(Matemática) ¿Cuántos lados tiene un pentágono?', '5,6,4,8', 0],
        ['(Matemática) ¿Cuánto es el 50% de 120?', '60,50,40,70', 0],
        ['(Matemática) Si un triángulo tiene lados iguales, se llama:', 'Escaleno,Isósceles,Rectángulo,Equilátero', 3],
        ['(Matemática) ¿Cuál es el doble de 3.5?', '5.5,6.5,7,8', 2],
        ['(Matemática) ¿Cuánto es 100 dividido entre 4?', '20,25,30,40', 1],
        ['(Matemática) ¿Qué número es la raíz cuadrada de 81?', '8,7,9,6', 2],
        ['¿En qué país se originó el fútbol moderno?', 'Brasil,Inglaterra,España,Italia', 1],
        ['¿Cuántos jugadores tiene un equipo de fútbol en el campo?', '9,10,11,12', 2],
        ['¿Quién ganó la Copa del Mundo 2022?', 'Brasil,Argentina,Francia,Alemania', 1],
        ['¿En qué año se celebró la primera Copa del Mundo?', '1930,1945,1950,1960', 0],
        ['¿Cuántos minutos dura un partido de fútbol profesional?', '60,80,90,100', 2],
        ['¿Quién es conocido como "O Rei" del fútbol?', 'Lionel Messi,Cristiano Ronaldo,Pelé,Maradona', 2],
        ['¿Qué jugador tiene más Balones de Oro hasta 2025?', 'Pelé,Cristiano Ronaldo,Lionel Messi,Modric', 2],
        ['¿Dónde se juega el famoso clásico "Real Madrid vs Barcelona"?', 'Italia,España,Brasil,Francia', 1],
        ['¿Qué país ha ganado más Copas del Mundo?', 'Argentina,Italia,Alemania,Brasil', 3],
        ['¿Cómo se llama el torneo de clubes más importante de Europa?', 'Copa Libertadores,Champions League,Copa América,Mundial de Clubes', 1],
        ['(Ciencia) ¿Cuál es el planeta más cercano al Sol?', 'Venus,Mercurio,Marte,Júpiter', 1],
        ['(Ciencia) ¿Qué gas respiramos los seres humanos para vivir?', 'Dióxido de carbono,Hidrógeno,Oxígeno,Nitrógeno', 2],
        ['(Ciencia) ¿Cuál es el órgano que bombea la sangre?', 'Pulmón,Hígado,Corazón,Cerebro', 2],
        ['(Ciencia) ¿Qué fuerza nos mantiene pegados al suelo?', 'Gravedad,Magnetismo,Energía,Sonido', 0],
        ['(Ciencia) ¿Cuál es el estado del agua a 0°C?', 'Líquido,Gaseoso,Sólido,Vapor', 2],
        ['(Ciencia) ¿Qué astro ilumina la Tierra durante el día?', 'La Luna,El Sol,Las estrellas,Los planetas', 1],
        ['(Ciencia) ¿Cómo se llama el proceso por el cual las plantas fabrican su alimento?', 'Fotosíntesis,Respiración,Germinación,Transpiración', 0],
        ['(Ciencia) ¿Qué parte del cuerpo controla todas las funciones?', 'El corazón,El cerebro,El estómago,Los pulmones', 1],
        ['(Ciencia) ¿Qué animal pone huevos?', 'Perro,Gato,Gallina,Caballo', 2],
        ['(Ciencia) ¿Cuál es el hueso más largo del cuerpo humano?', 'Radio,Tibia,Fémur,Húmero', 2],
        ['(Historia del Perú) ¿Quién fue el primer presidente del Perú?', 'Ramón Castilla,Simón Bolívar,José de San Martín,José de la Riva-Agüero', 3],
        ['(Historia del Perú) ¿En qué año se proclamó la independencia del Perú?', '1810,1821,1824,1827', 1],
        ['(Historia del Perú) ¿Cuál fue la capital del Imperio Inca?', 'Cusco,Lima,Arequipa,Cajamarca', 0],
        ['(Historia del Perú) ¿Quién proclamó la independencia del Perú?', 'Miguel Grau,José de San Martín,Simón Bolívar,Andrés Avelino Cáceres', 1],
        ['(Historia del Perú) ¿En qué batalla se consolidó la independencia?', 'Junín,Ayacucho,Abtao,Arica', 1],
        ['(Historia del Perú) ¿Qué civilización construyó Machu Picchu?', 'Los Mochicas,Los Nazcas,Los Incas,Los Chavines', 2],
        ['(Historia del Perú) ¿Qué héroe murió en el combate de Angamos?', 'Miguel Grau,Francisco Bolognesi,Túpac Amaru II,Alfonso Ugarte', 0],
        ['(Historia del Perú) ¿Qué cultura es conocida por sus líneas en el desierto?', 'Moche,Nazca,Chavín,Paracas', 1],
        ['(Historia del Perú) ¿Qué cultura se desarrolló en el norte del Perú?', 'Chavín,Tiahuanaco,Moche,Pucará', 2],
        ['(Historia del Perú) ¿Quién fue Túpac Amaru II?', 'Un inca del Cusco,Un líder de la independencia,Un virrey español,Un conquistador español', 1],
        ['(Comunicación) ¿Cuál es el sujeto en la oración “El perro corre en el parque”?', 'El perro,Corre,En el parque,Ninguno', 0],
        ['(Comunicación) ¿Qué tipo de palabra es “rápidamente”?', 'Sustantivo,Adjetivo,Verbo,Adverbio', 3],
        ['(Comunicación) ¿Qué signo se usa para terminar una oración?', 'Coma,Punto,Signo de interrogación,Punto y coma', 1],
        ['(Comunicación) ¿Cuál de las siguientes es una oración exclamativa?', '¿Dónde estás?,¡Qué bonito día!,Estás aquí.,Te llamo luego.', 1],
        ['(Comunicación) ¿Qué tipo de texto cuenta una historia?', 'Narrativo,Expositivo,Descriptivo,Argumentativo', 0],
        ['(Comunicación) ¿Qué palabra está escrita correctamente?', 'Haiga,Haber,Haya,Halla', 2],
        ['(Comunicación) ¿Qué palabra es sinónimo de “feliz”?', 'Triste,Alegre,Serio,Cansado', 1],
        ['(Comunicación) ¿Qué palabra es antónimo de “alto”?', 'Pequeño,Grande,Bajo,Ancho', 2],
        ['(Comunicación) ¿Qué persona gramatical corresponde a “yo”?', 'Primera persona,Segunda persona,Tercera persona,Ninguna', 0],
        ['(Comunicación) ¿Cuál de las siguientes palabras es un verbo?', 'Correr,Casa,Feliz,Rápido', 0]
    ];

    const stmt = db.prepare('INSERT INTO questions (text, options, correctAnswer) VALUES (?, ?, ?)');
    questionsToInsert.forEach(q => stmt.run(q));
    stmt.finalize((err) => {
        if (err) return console.error(err.message);
        console.log(`✅ ${questionsToInsert.length} preguntas fueron insertadas en la base de datos.`);
    });
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('🚪 Conexión a la base de datos cerrada.');
});