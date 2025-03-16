import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    nodePolyfills({
        include: ['process', 'util', 'stream', 'buffer'],
        globals: { global: true, process: true },
      }),
    viteStaticCopy({
        targets: [
          {
            src: 'LICENSE',
            dest: './'
          }
        ]
      }),
    VitePWA({
      filename: 'service-worker.js',
      manifest: false,
      injectRegister: false,
      workbox: {
        globPatterns: ["**\/*.{js,wasm,css,html,woff2,png}"],
        globIgnores: ['*.map', 'LICENSE', 'inquiries.json'],
        clientsClaim: true,
        skipWaiting: false,
        maximumFileSizeToCacheInBytes: 40000000
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  optimizeDeps: {
    include:['sql.js'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    assetsInlineLimit: 10000,
    commonjsOptions: {
      include: ['sql.js', /sql-wasm.js/, /node_modules/]
    }
  }
})

