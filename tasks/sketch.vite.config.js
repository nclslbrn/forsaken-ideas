import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import createExternal from 'vite-plugin-external'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/sketch/{{src}}/',
    publicDir: 'assets/',
    build: {
        rollupOptions: {
            output: {
                format: 'iife'
            }
        },
        outDir: '../../public/sketch/{{src}}/',
        emptyOutDir: true
    },
    plugins: [
        createExternal({
            production: {
                externals: {
                    p5: 'p5',
                    fabric: 'fabric'
                }
            }
        }),
        viteStaticCopy({
            targets: [
                { src: 'capture.jpg', dest: '' },
                { src: 'thumbnail.webp', dest: '' },
                { src: 'assets/**', dest: 'assets' }
            ]
        }),
        glsl()
    ],
    resolve: {
        alias: {
            '@common': fileURLToPath(
                new URL('../../sketch-common', import.meta.url)
            )
        }
    }
})
