import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
/** @type {import('tailwindcss').Config} */

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext', // Equivalent to TS "target": "esnext"
      },
    },
    build: {
      target: 'esnext', // Ensures output uses modern JS
    },
    server: {
      host: true,
      allowedHosts: ['.localhost', 'localhost'],
    },
    // esbuild: {
    //   drop: ['console', 'debugger'],
    // },
  }
})
