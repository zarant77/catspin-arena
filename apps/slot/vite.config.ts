import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      '@catspin/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@catspin/assets': path.resolve(__dirname, '../../packages/assets/src/index.ts'),
    },
  },
});
