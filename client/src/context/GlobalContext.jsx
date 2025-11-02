// client/src/context/GlobalContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Crear el Contexto
export const GlobalContext = createContext();

// Función auxiliar para inicializar el estado desde localStorage
const getInitialState = () => {
    const storedState = localStorage.getItem('kahootCloneSession');
    if (storedState) {
        try {
            const parsedState = JSON.parse(storedState);
            if (typeof parsedState === 'object' && parsedState !== null) {
                return parsedState;
            }
        } catch (e) {
            console.error("Error al parsear el estado de localStorage:", e);
            localStorage.removeItem('kahootCloneSession');
        }
    }

    // Estado inicial por defecto
    return {
        isLoggedIn: false,
        view: 'home', // 'home', 'host', o 'player'
        userId: null,
        nickname: null,
        gamePin: null,
        isHost: false,
    };
};

// 2. Componente Proveedor (Provider)
export const GlobalProvider = ({ children }) => {
    const [session, setSession] = useState(getInitialState);

    // 3. Efecto para guardar la sesión en localStorage
    useEffect(() => {
        if (session.view !== 'home' || session.isLoggedIn) {
             localStorage.setItem('kahootCloneSession', JSON.stringify(session));
        } else {
             localStorage.removeItem('kahootCloneSession');
        }
    }, [session]);

    // Función para actualizar el estado de la sesión
    const updateSession = (newSessionData) => {
        setSession(prev => ({ ...prev, ...newSessionData }));
    };

    // Función para cerrar sesión/salir del juego
    const logout = () => {
        localStorage.removeItem('kahootCloneSession');
        setSession(getInitialState());
    };

    return (
        <GlobalContext.Provider value={{ session, updateSession, logout }}>
            {children}
        </GlobalContext.Provider>
    );
};

// 4. Hook personalizado para usar el contexto
export const useGlobalContext = () => useContext(GlobalContext);