// A friendly reminder that this service worker is designed to work with a web app
// and will handle background tasks like caching and notifications.
const CACHE_NAME = 'eye-on-eyes-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/com/manifest.json',
    '/com/IMG-20250821-WA0012.jpg',
    // We don't cache the service worker file itself.
];

// Installation event: Caches the necessary assets for the PWA
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Failed to cache assets:', error);
            })
    );
});

// Fetch event: Serves cached assets when offline or for faster loading
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // If the asset is in the cache, serve it.
                if (response) {
                    return response;
                }
                // Otherwise, fetch from the network.
                return fetch(event.request);
            })
    );
});

// Activation event: Cleans up old caches to prevent stale data
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete any old caches
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Message event: Handles messages from the main app to trigger a notification
self.addEventListener('message', (event) => {
    if (event.data === 'show-notification') {
        const options = {
            body: 'Look 20 feet away for 20 seconds!',
            icon: '/com/IMG-20250821-WA0012.jpg',
            vibrate: [200, 100, 200],
            tag: 'eye-break-reminder',
            renotify: true
        };

        // Show the notification. The tag ensures only one notification is shown at a time.
        self.registration.showNotification('Time for an Eye Break!', options);
    }
});

// Notification click event: Handles when the user clicks the notification
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click received.');
    event.notification.close();

    // This looks for an open window with the app's URL and focuses on it.
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes('/index.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If the app is not open, open a new window.
                if (clients.openWindow) {
                    return clients.openWindow('/index.html');
                }
            })
    );
});
