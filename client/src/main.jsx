// src/main.jsx

<<<<<<< HEAD
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
=======
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)



/*
Se debe envolver todo en un useContext para manejar el estado global de la app (aca va el id del usuario en sesion de redis)
tambien se puede usar para manejar el tema oscuro/claro, idioma

Por favor el useContext debe estar en un archivo separado llamado GlobalContext.jsx
  y debe envolver el <App /> en este main.jsx

el motivo por el cual debe estar separado es para mantener una buena organizacion del codigo y facilitar el mantenimiento a futuro (actualizaciones, cambios en la logica de estado global, etc). 
que pueden ser llamados desde cualquier componente dentro de la aplicacion.

*/
>>>>>>> 387ce640cdc691d0a1c5ecdde0db685ae0df5192
