import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  css: {
    devSourcemap: false,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})