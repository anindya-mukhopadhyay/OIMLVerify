import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) {
            return 'charts'
          }
          if (id.includes('node_modules/@firebase') || id.includes('node_modules/firebase')) {
            return 'firebase'
          }
          if (
            id.includes('node_modules/@hookform') ||
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/zod')
          ) {
            return 'forms'
          }
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom')
          ) {
            return 'react'
          }

          return undefined
        },
      },
    },
  },
  plugins: [react()],
})
