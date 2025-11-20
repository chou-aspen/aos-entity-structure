import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections (needed for ngrok)
    port: 5174,
    strictPort: true, // Fail if port is already in use instead of trying another port
    allowedHosts: [
      'mesogastric-lavada-uncongregative.ngrok-free.dev',
      '.ngrok-free.app',
      '.ngrok-free.dev',
      '.ngrok.io',
    ],
    hmr: {
      clientPort: 443, // Use HTTPS port for HMR with ngrok
    },
  },
})
