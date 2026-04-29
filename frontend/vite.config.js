import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/getmap': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/getCoordinates': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/room': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
