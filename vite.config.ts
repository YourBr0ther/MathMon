import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Expose on local network
    port: 5173, // Fixed port for consistent auth redirects
    strictPort: true, // Fail if port is in use (don't auto-pick another)
  },
})
