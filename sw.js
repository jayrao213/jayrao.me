const CACHE_NAME = 'jayrao-portfolio-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/style.css',
  '/styles/style2.css',
  '/js/main.js',
  '/js/second.js',
  '/js/form.js',
  '/js/skills.js',
  '/js/error-boundary.js',
  '/images/favicon.png',
  '/images/linkedin.png',
  '/images/github.png',
  '/images/resume.png',
  '/images/email.png',
  '/images/fallback.png',
  '/images/jayrao.png',
  '/images/emuser.png',
  '/images/blujay.png',
  '/images/ami.png',
  '/pages/about.html',
  '/pages/experience.html',
  '/pages/projects.html',
  '/pdfs/Jay_Rao_Resume.pdf'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Error during service worker installation:', error);
      })
  );
});

// Activate Service Worker
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
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Error caching response:', error);
              });

            return response;
          })
          .catch(() => {
            // If fetch fails (offline), try to return a fallback
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // For images, return the fallback image
            if (event.request.destination === 'image') {
              return caches.match('/images/fallback.png');
            }

            // For other resources, return null
            return null;
          });
      })
  );
}); 