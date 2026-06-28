import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig(({ mode }) => {
  const base = process.env.VITE_BASE_PATH || (mode === 'production' ? '/CV-Editor/' : '/')
  const pdfBackendTarget = process.env.VITE_PDF_BACKEND_URL || 'http://localhost:3001'

  return {
    base,
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
  }
})
