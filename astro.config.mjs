// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import AstroPWA from '@vite-pwa/astro';

const isDev = process.env.NODE_ENV !== 'production';
const mod = process.env.ACTIVE_MODULE ?? '';

// Carpetas a ignorar en el watcher según el módulo activo
const watchIgnored = ['**/node_modules/**', '**/.git/**'];
if (isDev && mod) {
  const allModules = ['sagrada-biblia', 'suma-teologica', 'catecismo', 'san-agustin', 'Sta-Faustina'];
  const activeFolder = {
    biblia: 'sagrada-biblia',
    suma: 'suma-teologica',
    catecismo: 'catecismo',
    agustin: 'san-agustin',
    faustina: 'Sta-Faustina',
  }[mod];
  allModules
    .filter(f => f !== activeFolder)
    .forEach(f => watchIgnored.push(`**/src/content/${f}/**`));
}

// https://astro.build/config
export default defineConfig({
  cacheDir: isDev && mod ? `./.astro-${mod}` : './.astro',
  vite: {
    server: {
      watch: { ignored: watchIgnored },
    },
  },
  integrations: [
    tailwind(),
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,woff2,png,svg,ico}'],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'BFF Biblia',
        short_name: 'BFF Biblia',
        description: 'Lee la Biblia en cualquier momento y lugar',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  output: 'server',
  adapter: vercel(),
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  devToolbar: {
    enabled: false,
  },
});
