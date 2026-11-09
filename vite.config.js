import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Sito a più pagine, JavaScript vanilla. Le pagine si aggiungono qui man mano che esistono.
export default defineConfig({
  build: {
    target: 'es2020',
    // il pezzo di three.js dell'auto 3D (circa 150 KB compressi) si scarica a parte, dopo il caricamento della pagina
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        componenti: resolve(import.meta.dirname, 'componenti.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        cookie: resolve(import.meta.dirname, 'cookie.html'),
        nontrovata: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
