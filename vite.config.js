import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        downloads: './downloads.html',
      },
    },
  },
  server: {
    port: 8000,
  },
  assetsInclude: ['**/*.js'],
});
