const CACHE_NAME = 'gear-n-go-v3';

/**
 * List of core assets to cache for offline functionality.
 * These paths are relative to the root directory.
 */
const assetsToCache = [
    './',
    './index.html',
    './closet.html',
    './trip.html',
    './src/css/styles.css',
    './src/js/main.js',
    './src/js/ExternalServices.mjs',
    './src/js/storageManager.mjs',
    './src/js/utils.mjs'
];

// Install event: Open cache and add all defined assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(assetsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event: Serve from cache if available, else fetch from network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.hostname === 'localhost') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response if found, otherwise try network
            return cachedResponse || fetch(event.request).catch(() => {
                // Fallback to index.html for navigation requests when offline
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});