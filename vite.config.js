import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
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
      })
],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
},
optimizeDeps: {
    include:['sql.js/dist/sql-wasm.js'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})

