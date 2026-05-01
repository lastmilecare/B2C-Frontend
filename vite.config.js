import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: '0.0.0.0', // important for external access (dev)
    port: 5173,
  },

  preview: {
    host: '0.0.0.0', // required
    port: 8002,
    allowedHosts: ['test1.lastmilecare.in'],
  },
})