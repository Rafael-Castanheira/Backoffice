import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '^/paciente(?!/novo)(?:/|$)': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/auth': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/consulta': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/medico': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/tipouser': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/utilizadores': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/habitosestilovida': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/historicodentario': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/historicomedico': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/genero': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '^/estadocivil': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  }
})
