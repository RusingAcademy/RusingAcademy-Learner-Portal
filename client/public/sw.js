// RusingAcademy Learner Portal — Service Worker
// Version: 1.0.0
// Compatible with RusingAcademy-Ecosystem-Main-Repo sw.js pattern

const CACHE_NAME = 'rusingacademy-v1';
const OFFLINE_URL = '/offline.html';

// Assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Routes that must NEVER be cached (auth, admin, API)
const NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /\/trpc\//,
  /\/oauth/,
  /\/admin\//,
  /\/coach\//,
  /\/hr\//,
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets (JS, CSS, fonts)
  cacheFirst: [
    /\.(?:js|css|woff2?|ttf|otf|eot)$/,
    /\/assets\//,
  ],
  // Network first for API calls (handled by NEVER_CACHE or fallback)
  networkFirst: [
    /\/api\//,
    /\/trpc\//,
  ],
  // Stale while revalidate for images
  staleWhileRevalidate: [
    /\.(?:png|jpg|jpeg|gif|svg|webp|ico)$/,
  ],
};

// ─── Install: precache essential assets ───
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
  );
});

// ─── Activate: clean up old caches ───
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// ─── Fetch: handle requests with appropriate strategy ───
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // SAFETY: Never cache auth, admin, coach, HR, or API routes
  for (const pattern of NEVER_CACHE_PATTERNS) {
    if (pattern.test(url.pathname)) {
      // Always go to network for sensitive routes; offline fallback for navigation
      event.respondWith(
        fetch(request).catch(() => {
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', { status: 503 });
        })
      );
      return;
    }
  }

  // Determine cache strategy for non-sensitive routes
  let strategy = 'networkFirst'; // safe default

  for (const pattern of CACHE_STRATEGIES.cacheFirst) {
    if (pattern.test(url.pathname)) {
      strategy = 'cacheFirst';
      break;
    }
  }

  for (const pattern of CACHE_STRATEGIES.staleWhileRevalidate) {
    if (pattern.test(url.pathname)) {
      strategy = 'staleWhileRevalidate';
      break;
    }
  }

  // Apply strategy
  switch (strategy) {
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    case 'networkFirst':
    default:
      event.respondWith(networkFirst(request));
      break;
  }
});

// ─── Cache First strategy ───
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// ─── Network First strategy ───
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network first falling back to cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    return new Response('Offline', { status: 503 });
  }
}

// ─── Stale While Revalidate strategy ───
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || fetchPromise;
}

// ─── Message handling ───
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_COURSE') {
    const { courseId, urls } = event.data;
    cacheCourseMaterials(courseId, urls);
  }
});

// ─── Cache course materials for offline access ───
async function cacheCourseMaterials(courseId, urls) {
  const cache = await caches.open(`course-${courseId}`);

  try {
    await cache.addAll(urls);
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'COURSE_CACHED',
        courseId,
        success: true,
      });
    });
  } catch (error) {
    console.error('[SW] Failed to cache course:', error);
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'COURSE_CACHED',
        courseId,
        success: false,
        error: error.message,
      });
    });
  }
}

// ─── Background sync for offline actions ───
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  console.log('[SW] Syncing progress...');
}

// ─── Push notification handling ───
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || 'default',
    data: data.data,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ─── Notification click handling ───
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
