// Define the name of the cache and the list of files to cache
const CACHE_NAME = 'eye-on-eyes-v1';
const urlsToCache = [
    '/com/', // The root path, which should serve index.html
    '/com/index.html',
    '/com/manifest.json',
    '/com/IMG-20250821-WA0012.jpg'
];

// The `install` event is fired when the service worker is first installed.
// We use this to cache the essential files for offline use.
self.addEventListener('install', (event) => {
    // Perform the installation steps.
    event.waitUntil(
        // Open a cache named `eye-on-eyes-v1`.
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching all assets');
                // Add all the specified URLs to the cache.
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache assets', error);
            })
    );
});

// The `fetch` event is fired for every network request.
// We intercept these requests and serve from the cache first if the resource is available.
self.addEventListener('fetch', (event) => {
    // Respond with the cached asset if it exists, otherwise fetch from the network.
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // If a match is found in the cache, return it.
                if (response) {
                    return response;
                }
                // Otherwise, fetch the resource from the network.
                return fetch(event.request);
            })
    );
});

// The `activate` event is fired after the service worker is installed.
// We use this to clean up old caches.
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete any caches that are not in the whitelist.
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
