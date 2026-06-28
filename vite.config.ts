import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

const pdfBackendTarget = process.env.VITE_PDF_BACKEND_URL || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: pdfBackendTarget,
        changeOrigin: true,
      },
    },
  },
})
