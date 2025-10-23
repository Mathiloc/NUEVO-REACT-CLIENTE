import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { 
    proxy: {
      // Redirige peticiones que empiezan por /api al servidor en el puerto 4000
      '/api': {
        target: 'http://localhost:4000', // <-- ¡DEBE SER 4000!
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
