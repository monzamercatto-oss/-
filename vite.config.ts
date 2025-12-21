import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  define: {
    // Внедряем только конкретную переменную вместо всего объекта process.env
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});