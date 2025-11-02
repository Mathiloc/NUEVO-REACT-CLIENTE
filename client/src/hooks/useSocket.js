// client/src/hooks/useSocket.js 

import { useEffect, useCallback, useRef, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:4000';

const socket = io(SOCKET_SERVER_URL, {
    autoConnect: true,
});

export const useSocket = () => {
    const listenersRef = useRef({});
    // CAMBIO 1: Estado para almacenar el socket ID
    const [socketId, setSocketId] = useState(null); 

    const emit = useCallback((event, data) => {
        if (socket.connected) {
            socket.emit(event, data);
        } else {
            console.error(`Error: Intentando emitir '${event}' pero el socket está desconectado.`);
        }
    }, []);

    const on = useCallback((event, callback) => {
        if (!listenersRef.current[event]) {
            const listener = (...args) => callback(...args);
            socket.on(event, listener);
            listenersRef.current[event] = listener;
        }
    }, []);

    const disconnect = useCallback(() => {
        socket.disconnect();
    }, []);

    useEffect(() => {
        const currentListeners = listenersRef.current;

        socket.on('connect', () => {
            console.log('Socket conectado:', socket.id);
            // CAMBIO 2: Guardar el ID del socket al conectar
            setSocketId(socket.id); 
        });
        
        socket.on('disconnect', (reason) => {
            console.log('Socket desconectado:', reason);
            setSocketId(null);
        });

        // Limpieza de listeners
        return () => {
            Object.entries(currentListeners).forEach(([event, listener]) => {
                socket.off(event, listener);
            });
            listenersRef.current = {};
        };
    }, []);

    // CAMBIO 3: Exportar socketId
    return { emit, on, disconnect, socketId }; 
};