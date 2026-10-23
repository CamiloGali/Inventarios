const CACHE_NAME = 'inventario-cache-v12';
const APP_FILES = ['index.html', 'manifest.json', 'sw.js', 'style.css', 'app.js', 'manual_usuario.pdf', 'manual_usuario.html'];

const appUrl = fileName => new URL(fileName, self.registration.scope).href;

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta:', CACHE_NAME);
        return cache.addAll(APP_FILES.map(appUrl));
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames
        .filter(cacheName => cacheName !== CACHE_NAME)
        .map(cacheName => caches.delete(cacheName))
    )).then(() => self.clients.claim())
  );
});

// Estrategia Network-First: intenta cargar de la red primero para ver cambios de inmediato; si falla (offline), recurre a la caché
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // No interceptar peticiones a Google Apps Script
  if (event.request.url.includes('script.google.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});