import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://unipath-z13c.onrender.com',
        changeOrigin: true,
      },
      '/getmap': {
        target: 'https://unipath-z13c.onrender.com',
        changeOrigin: true,
      },
      '/getCoordinates': {
        target: 'https://unipath-z13c.onrender.com',
        changeOrigin: true,
      },
      '/room': {
        target: 'https://unipath-z13c.onrender.com',
        changeOrigin: true,
      },
    },
  },
})