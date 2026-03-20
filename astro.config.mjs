// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import AstroPWA from '@vite-pwa/astro';
import { readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';

/** Genera la lista de URLs de páginas de la Biblia para precachear */
function getBiblePageEntries() {
  const contentRoot = fileURLToPath(new URL('./src/content/sagrada-biblia', import.meta.url));
  const entries = [{ url: '/biblia', revision: null }];

  function walk(dir, relPath = '') {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full, relPath ? `${relPath}/${entry}` : entry);
      } else if (extname(entry) === '.md') {
        const name = basename(entry, '.md');
        if (name.endsWith('-comentarios') || name.endsWith('-paralelos')) continue;
        const slug = relPath ? `${relPath}/${name}` : name;
        entries.push({ url: `/biblia/${slug}`, revision: null });
      }
    }
  }

  walk(contentRoot);
  return entries;
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{html,js,css,woff2,png,svg,ico}'],
        additionalManifestEntries: getBiblePageEntries(),
        navigateFallback: null,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // Páginas de libros: se cachean al visitarlas, funcionan offline después
            urlPattern: /\/biblia\/.+/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bible-pages-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 días
              },
            },
          },
          {
            urlPattern: /\/api\/(get-comment|get-parallels|get-parallels-list)(\?.*)?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bible-api-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
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
          { src: '/icons/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  output: 'server',
  adapter: vercel(),
  devToolbar: {
    enabled: false,
  },
});
