const CACHE_NAME = 'ring-ig-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/login',
  '/image',
  '/docs',
  '/auth/callback',
  '/profile',
  '/userprofile',
  '/inspiration',
  '/logo.png',
  '/logo.ico',
  'https://i.ibb.co.com/X3BQdwH/cover.jpg',
  '/site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip caching for non-http(s) requests
  const requestURL = new URL(event.request.url);
  if (requestURL.protocol !== 'http:' && requestURL.protocol !== 'https:') {
    return fetch(event.request);
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Guard against putting unsupported request schemes into cache
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('Skipping cache.put for unsupported request:', event.request.url);
                }
              });
            return response;
          });
      })
  );
});