const CACHE_NAME = 'zimi-app-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png',
  'https://drzerquera.com/wp-content/uploads/2024/02/drzerquera-banner-fondo-azul.avif'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('ZIMI App: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('ZIMI App: Failed to cache resources:', error);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // Important: Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Important: Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('ZIMI App: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de ZIMI',
    icon: 'https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png',
    badge: 'https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver más',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/images/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ZIMI - Instituto Médico', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'appointment-sync') {
    event.waitUntil(syncAppointments());
  }
  if (event.tag === 'contact-sync') {
    event.waitUntil(syncContacts());
  }
});

// Sync appointments when back online
async function syncAppointments() {
  try {
    const appointments = await getStoredAppointments();
    for (const appointment of appointments) {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment)
      });
      await removeStoredAppointment(appointment.id);
    }
  } catch (error) {
    console.error('ZIMI App: Failed to sync appointments:', error);
  }
}

// Sync contacts when back online
async function syncContacts() {
  try {
    const contacts = await getStoredContacts();
    for (const contact of contacts) {
      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact)
      });
      await removeStoredContact(contact.id);
    }
  } catch (error) {
    console.error('ZIMI App: Failed to sync contacts:', error);
  }
}

// Helper functions for IndexedDB operations
async function getStoredAppointments() {
  // Implementation would use IndexedDB to get stored appointments
  return [];
}

async function removeStoredAppointment(id) {
  // Implementation would use IndexedDB to remove appointment
}

async function getStoredContacts() {
  // Implementation would use IndexedDB to get stored contacts
  return [];
}

async function removeStoredContact(id) {
  // Implementation would use IndexedDB to remove contact
}