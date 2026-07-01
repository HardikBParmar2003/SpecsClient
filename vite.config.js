import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { 
    host: true, // This allows the server to be accessed from other devices on the same Wi-Fi network
    proxy: { '/api': 'http://localhost:5000', '/uploads': 'http://localhost:5000' } 
  }
})
