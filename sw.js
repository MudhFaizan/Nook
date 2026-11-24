const CACHE_VERSION = 'v45';
const UPDATE_INFO = {
  version: CACHE_VERSION,
  title: 'Cozy Theme Labels',
  summary: '',
  highlights: [
    'Renamed Pure Canvas to Paper & Ink',
    'Updated theme subtitles to match Nook'
  ]
};
const APP_SHELL_CACHE = `nook-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `nook-runtime-${CACHE_VERSION}`;

const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.svg'
];

const CACHEABLE_CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com'
];

function offlineFallbackResponse() {
  return new Response('', { status: 503, statusText: 'Offline' });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        APP_SHELL_ASSETS.map((asset) =>
          fetch(asset, { cache: 'no-cache' }).then((response) => {
            if (response && response.ok) {
              return cache.put(asset, response);
            }
          })
        )
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data.type === 'GET_UPDATE_INFO' && event.ports && event.ports[0]) {
    event.ports[0].postMessage(UPDATE_INFO);
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept updates to the service worker script itself
  if (url.origin === self.location.origin && url.pathname.endsWith('/sw.js')) {
    return;
  }

  // Navigation requests: network-first with cached index.html fallback for offline launches
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put('./index.html', copy));
          }
          return response;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached || offlineFallbackResponse()))
    );
    return;
  }

  // Same-origin static assets: stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached || offlineFallbackResponse());

        return cached || networkPromise;
      })
    );
    return;
  }

  // External CDN assets (Tailwind, Google Fonts, Phosphor Icons): cache-first with background refresh
  if (CACHEABLE_CDN_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkPromise = fetch(request)
            .then((response) => {
              if (response && (response.ok || response.type === 'opaque')) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached || offlineFallbackResponse());

          return cached || networkPromise;
        })
      )
    );
  }
});
