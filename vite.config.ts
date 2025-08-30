import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '', // for GitHub Pages or custom base paths, set if needed
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    }
  },
  build: {
    assetsDir: 'assets',
  },
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
