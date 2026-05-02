import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/chromalab/' : '/',
    plugins: [
        visualizer({
            filename: 'bundle-stats.html',
            open: false,
            gzipSize: true,
            brotliSize: true
        }),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
            }
        })
    ],
    build: {
        target: 'esnext'
    },
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js'],
        globals: false
    }
}));
