import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'GridforgeVue2',
      fileName: (format) => `gridforge-vue2.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', '@tanstack/table-core'],
      output: {
        globals: {
          vue: 'Vue',
          '@tanstack/table-core': 'TanStackTableCore',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return assetInfo.name || 'asset';
        },
      },
    },
    cssCodeSplit: false,
  },
});
