const CACHE_NAME = 'baqala-cache-v2'; // Incremented version
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/db.js',
    '/manifest.webmanifest'
];

// Install event: cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(STATIC_ASSETS);
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: apply caching strategy
self.addEventListener('fetch', event => {
    // For navigation and static assets, use Cache First strategy.
    if (STATIC_ASSETS.some(asset => event.request.url.endsWith(asset)) || event.request.mode === 'navigate') {
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    return cachedResponse || fetch(event.request);
                })
        );
    }
    // For other requests (e.g., API calls in the future), one would use a Network First strategy.
    // else {
    //     event.respondWith(
    //         fetch(event.request).catch(() => caches.match(event.request))
    //     );
    // }
});
