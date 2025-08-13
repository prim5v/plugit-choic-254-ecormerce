import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // listen on all interfaces
    port: 5173,
    hmr: {
      host: '192.168.0.108',  // your PC's LAN IP
      protocol: 'ws',
    },
  },
})
