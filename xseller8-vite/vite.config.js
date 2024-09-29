import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['xlsx'],  // Ensures xlsx is included in Vite's dependency optimization
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),  // Adjust the API path
      },
    },
  },
});
