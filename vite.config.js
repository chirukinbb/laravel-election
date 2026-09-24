import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx', // SSR bundle entry
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0', // reachable from other containers + host port mapping
        port: 5173,
        strictPort: true,
        hmr: {
            // The host the BROWSER uses to reach the dev server (not 0.0.0.0)
            host: 'localhost',
            clientPort: 5173,
        },
    },
});
