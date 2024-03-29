import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/scrape': 'http://localhost:8080',
      '/api': 'http://localhost:8080'
    }
  }
})
