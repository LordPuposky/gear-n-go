import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                closet: resolve(__dirname, 'closet.html'),
                trip: resolve(__dirname, 'trip.html'),
            },
        },
    },
})