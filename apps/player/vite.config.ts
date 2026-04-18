import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['chrome >= 38'],
      additionalLegacyPolyfills: [
        'core-js/stable/promise',
        'core-js/stable/symbol',
        'core-js/stable/object/assign',
        'core-js/stable/object/entries',
        'core-js/stable/object/values',
        'core-js/stable/object/from-entries',
        'core-js/stable/array/find',
        'core-js/stable/array/find-index',
        'core-js/stable/array/includes',
        'core-js/stable/array/flat',
        'core-js/stable/array/flat-map',
        'core-js/stable/array/at',
        'core-js/stable/map',
        'core-js/stable/set',
        'core-js/stable/url',
        'core-js/stable/url-search-params',
        'core-js/stable/string/pad-start',
        'core-js/stable/string/pad-end',
        'core-js/stable/string/includes',
        'core-js/stable/string/starts-with',
        'core-js/stable/string/ends-with',
        'core-js/stable/number/is-finite',
        'core-js/stable/number/is-nan',
      ],
      modernPolyfills: true,
    }),
    VitePWA({
      disable: true,
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.cloudfront\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'content-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'SignageOS Player',
        short_name: 'Player',
        description: 'Digital Signage Player',
        theme_color: '#1A73E8',
        background_color: '#000000',
        display: 'fullscreen',
        orientation: 'landscape',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
