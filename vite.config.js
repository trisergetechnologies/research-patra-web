import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      // The blog is the separate Next.js app in blog-web/ (npm run dev there, port 3001).
      '/blog': { target: 'http://localhost:3001', ws: true },
    },
  },
})
