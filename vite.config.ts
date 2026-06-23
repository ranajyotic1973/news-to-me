import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import electronBuilder from 'vite-plugin-electron-builder';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  plugins: [
    react(),
    // Electron main process and preload script compilation
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/main',
            minify: isDev ? false : 'terser',
            sourcemap: isDev,
          },
        },
      },
      {
        entry: 'src/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            minify: isDev ? false : 'terser',
            sourcemap: isDev,
          },
        },
      },
    ]),
    // Electron builder for packaging
    electronBuilder(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {},
      },
    },
  },
});
