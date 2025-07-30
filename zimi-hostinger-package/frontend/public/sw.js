const CACHE_NAME = 'zimi-app-v1.1.0'; // Updated version for domain configuration
const DOMAIN_FLEXIBLE_CACHE = true; // Enable domain-flexible caching

// Dynamic URL configuration based on current domain
const getCurrentDomain = () => {
  return self.location.origin;
};

// Core files to cache (domain-relative)
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// API endpoints to cache (for offline functionality)
const apiEndpointsToCache = [
  '/api/services',
  '/api/doctor-info',
  '/api/contact-info',
  '/api/insurance',
  '/api/team'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('ZIMI Service Worker: Installing v1.1.0 with domain flexibility...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('ZIMI Service Worker: Cache opened');
        
        // Cache core application files
        const corePromise = cache.addAll(urlsToCache);
        
        // Cache API endpoints for offline functionality
        const apiPromise = Promise.all(
          apiEndpointsToCache.map(endpoint => {
            const fullUrl = getCurrentDomain() + endpoint;
            return fetch(fullUrl)
              .then(response => {
                if (response.ok) {
                  return cache.put(endpoint, response);
                }
              })
              .catch(error => {
                console.log(`ZIMI Service Worker: Failed to cache ${endpoint}:`, error);
              });
          })
        );
        
        return Promise.all([corePromise, apiPromise]);
      })
      .catch((error) => {
        console.error('ZIMI Service Worker: Failed to cache resources:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('ZIMI Service Worker: Activating v1.1.0...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('ZIMI Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Clear any existing notifications
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach((notification) => {
          console.log('ZIMI Service Worker: Closing notification:', notification.tag);
          notification.close();
        });
      }).catch(() => console.log('No notifications to clear'))
    ]).then(() => {
      // Ensure the new service worker takes control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip cross-origin requests that aren't API calls
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // If we have a cached response, return it
        if (cachedResponse) {
          // For API requests, try to update cache in background
          if (url.pathname.startsWith('/api')) {
            fetchAndCache(request);
          }
          return cachedResponse;
        }
        
        // No cached response, fetch from network
        return fetchAndCache(request);
      })
      .catch(() => {
        // Network error, try to return cached content or offline page
        if (request.destination === 'document') {
          return caches.match('/') || new Response(
            `<!DOCTYPE html>
            <html>
            <head>
              <title>ZIMI - Sin Conexión</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                       text-align: center; padding: 50px; background: #f7fafc; }
                .offline-container { max-width: 400px; margin: 0 auto; }
                .offline-icon { font-size: 64px; margin-bottom: 20px; }
                h1 { color: #2d3748; margin-bottom: 20px; }
                p { color: #4a5568; line-height: 1.6; }
                .retry-btn { 
                  background: #3182ce; color: white; border: none; 
                  padding: 12px 24px; border-radius: 8px; cursor: pointer;
                  font-size: 16px; margin-top: 20px;
                }
                .retry-btn:hover { background: #2c5282; }
              </style>
            </head>
            <body>
              <div class="offline-container">
                <div class="offline-icon">📡</div>
                <h1>Sin Conexión a Internet</h1>
                <p>No se puede conectar con ZIMI en este momento. Por favor, verifique su conexión a internet e intente nuevamente.</p>
                <button class="retry-btn" onclick="window.location.reload()">Reintentar</button>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
        
        // For other requests, return a generic offline response
        return new Response('Sin conexión', { 
          status: 503, 
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Helper function to fetch and cache responses
function fetchAndCache(request) {
  return fetch(request).then((response) => {
    // Check if we received a valid response
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }
    
    // Clone the response for caching
    const responseToCache = response.clone();
    
    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.put(request, responseToCache);
      })
      .catch((error) => {
        console.log('ZIMI Service Worker: Failed to cache response:', error);
      });
    
    return response;
  });
}

// Background sync for offline appointments (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'appointment-sync') {
    event.waitUntil(syncOfflineAppointments());
  }
});

// Sync offline appointments when connection is restored
function syncOfflineAppointments() {
  return new Promise((resolve, reject) => {
    // This would sync any appointments created while offline
    // Implementation would depend on your offline storage strategy
    console.log('ZIMI Service Worker: Syncing offline appointments...');
    resolve();
  });
}

// Push notification handling (for future implementation)
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png',
    badge: 'https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png',
    tag: data.tag || 'zimi-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver Detalles'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow(getCurrentDomain())
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('ZIMI Service Worker: Loaded successfully with domain flexibility');