// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api': { target: 'http://localhost:3000', changeOrigin: true },
        '/uploads': { target: 'http://localhost:3000', changeOrigin: true },
      },
    },
  },
});
