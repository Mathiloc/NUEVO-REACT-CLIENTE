// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { GlobalProvider } from './context/GlobalContext'; // Importar el proveedor de contexto
import './index.css'; // Estilos globales

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolvemos toda la aplicación con GlobalProvider para que 
        todas las páginas tengan acceso al estado de la sesión y la navegación. */}
    <GlobalProvider>
      <App />
    </GlobalProvider>
  </React.StrictMode>,
);