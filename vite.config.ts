import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // ← Critical fix for Netlify
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    assetsInlineLimit: 0, // ← Ensures proper file handling
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]' // ← Organized assets
      }
    }
  }
});
