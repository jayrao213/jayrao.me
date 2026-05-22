const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/shared.css',
  '/styles/about.css',
  '/styles/experience.css',
  '/styles/projects.css',
  '/styles/photos.css',
  '/scripts/main.js',
  '/scripts/shared.js',
  '/scripts/about.js',
  '/scripts/experience.js',
  '/scripts/projects.js',
  '/scripts/photos.js',
  '/scripts/skills.js',
  '/scripts/form.js',
  '/scripts/error-boundary.js',
  '/images/linkedin.png',
  '/images/github.png',
  '/images/resume.png',
  '/images/email.png',
  '/images/favicon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== IMAGE_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  const isImage = /\.(webp|jpeg|jpg|png|gif|svg|webm|mp4)$/i.test(url.pathname);
  const isStatic = /\.(css|js|html)$/i.test(url.pathname);

  if (isImage) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isStatic) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || fetchPromise;
}
