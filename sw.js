// Name of the cache for this version
const CACHE_NAME = 'gear-n-go-v1';

// List of assets to cache based on your current structure
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

// Installation: Cache static files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Caching static assets');
            return cache.addAll(assetsToCache);
        })
    );
});

// Activation: Clean up old caches if they exist
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('SW: Deleting old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Response strategy: Network First with cache fallback
// Chosen to ensure weather and gear data are up-to-date if online
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network works, clone and save to cache
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, resClone);
                });
                return response;
            })
            .catch(() => caches.match(event.request)) // If network fails, look in cache
    );
});