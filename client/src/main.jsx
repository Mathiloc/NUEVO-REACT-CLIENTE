import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

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