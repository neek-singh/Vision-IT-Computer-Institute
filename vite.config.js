import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser', // Ensures single minified JS output where possible
    cssMinify: true,
    assetsInlineLimit: 4096, // Compress small assets
    rollupOptions: {
      output: {
        manualChunks: {
          // Setting up manual chunks to prepare for Three.js and Firebase tree-shaking
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          three: ['three']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
