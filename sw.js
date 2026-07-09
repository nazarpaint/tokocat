// sw.js - Service Worker dengan strategi Network First
const CACHE_NAME = 'toko-cat-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets');
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map((asset) => cache.add(asset))
                );
            })
            .then(() => {
                console.log('[SW] Skip waiting');
                return self.skipWaiting();
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Network First Strategy
self.addEventListener('fetch', (event) => {
    // Hanya handle GET request
    if (event.request.method !== 'GET') return;

    const requestUrl = new URL(event.request.url);

    // Skip cross-origin requests and Supabase API calls (biarkan network/browser default)
    if (requestUrl.origin !== self.location.origin || requestUrl.hostname.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Jangan cache response gagal/opaque agar cache tidak terisi error page
                if (!networkResponse || !networkResponse.ok) {
                    return networkResponse;
                }

                // Update cache dengan response terbaru
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                return networkResponse;
            })
            .catch(() => {
                // Jika offline, ambil dari cache
                console.log('[SW] Network failed, using cache');
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Return halaman utama untuk navigasi HTML supaya SPA tetap terbuka offline
                        const accept = event.request.headers.get('accept') || '';
                        if (accept.includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        return new Response('', { status: 504, statusText: 'Offline' });
                    });
            })
    );
});

// Background Sync (untuk transaksi offline)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-transaksi') {
        event.waitUntil(syncPendingTransactions());
    }
});

async function syncPendingTransactions() {
    // Buka database IndexedDB untuk mengambil transaksi pending
    // Kirim ke server satu per satu
    console.log('[SW] Syncing pending transactions...');
}
