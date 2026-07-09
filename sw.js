// sw.js - Service Worker dengan strategi Network First
const CACHE_NAME = 'toko-cat-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/kasir.html',
    '/stok.html',
    '/transaksi.html',
    '/laba-rugi.html',
    '/css/style.css',
    '/js/app.js',
    '/js/supabase.js',
    '/js/kasir.js',
    '/js/stok.js',
    '/js/transaksi.js',
    '/js/laba-rugi.js',
    '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
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
    
    // Skip Supabase API calls (biarkan network only)
    if (event.request.url.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
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
                        // Return halaman offline jika tidak ada di cache
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
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