const CACHE_NAME = 'paintstore-cache-v1';
const APP_SHELL = [
  '/tokocat/',
  '/tokocat/index.html',
  '/tokocat/manifest.json',
  '/tokocat/icons/icon-192.png',
  '/tokocat/icons/icon-512.png'
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Request ke domain lain (Supabase API, CDN library) -> selalu network (data harus selalu fresh)
// - Request same-origin (app shell) -> cache-first, lalu update cache di background (stale-while-revalidate)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Jangan campur tangan request non-GET (mis. POST ke Supabase)
  if (event.request.method !== 'GET') return;

  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin) {
    // Supabase / CDN: network first, fallback ke cache kalau offline (untuk library CDN)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Same-origin (app shell): stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => cachedResponse);
      return cachedResponse || fetchPromise;
    })
  );
});
