import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
    base: command === 'build' ? '/chromalab/' : '/',
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
                globIgnores: ['**/*.bin', '**/*.gltf', '**/*.jpg', '**/*.swf']
            }
        })
    ],
    build: {
        target: 'esnext',
        chunkSizeWarningLimit: 1000
    },
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js'],
        globals: false
    }
}));
