import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '^/paciente(?!/novo)': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '^/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '^/consulta': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '^/medico': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '^/tipouser': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
