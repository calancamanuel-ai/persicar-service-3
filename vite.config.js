import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Sito a più pagine, JavaScript vanilla. Le pagine si aggiungono qui man mano che esistono.
export default defineConfig({
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        componenti: resolve(import.meta.dirname, 'componenti.html'),
      },
    },
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
