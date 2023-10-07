import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import createExternal from 'vite-plugin-external'
import { viteStaticCopy } from 'vite-plugin-static-copy'
// https://vitejs.dev/config/
export default defineConfig({
  base: '/sketch/Reply-to-Jeff/',
  publicDir: 'assets/',
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
      }
    },
    outDir: '../../public/sketch/Reply-to-Jeff/',
    emptyOutDir: true
  },
  plugins: [
    createExternal({
      production: {
        externals: {
          p5: 'p5',
          fabric: 'fabric',
        }
      }
    }),
    viteStaticCopy({
      targets: [
        { src: 'capture.jpg', dest: '' },
        { src: 'thumbnail.jpg', dest: '' },
        { src: 'assets/**', dest: 'assets' }
      ]
    })
  ],
  resolve: {
    alias: {
      '@common': fileURLToPath(new URL('../../sketch-common', import.meta.url)),
    }
  },
})
