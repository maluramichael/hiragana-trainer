/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Generiert bei jedem Build einen Service Worker mit Precache-Manifest aller
    // gehashten Assets (Workbox). autoUpdate + cleanupOutdatedCaches raeumen alte
    // Caches selbst weg -> kein manuelles Cache-Versioning, kein Asset-Mismatch mehr.
    // manifest:false -> das statische public/manifest.webmanifest bleibt die Quelle.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: false,
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // #43: precache fonts, icons and images too, so offline is truly complete.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,webmanifest}'],
      },
      devOptions: { enabled: false },
    }),
  ],
  // #49: split the rarely-changing framework/i18n code into a stable vendor chunk
  // so app edits don't bust its long-lived cache on repeat visits.
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-i18next', 'i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
