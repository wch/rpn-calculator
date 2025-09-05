/**
 * Service Worker for RPN Calculator PWA
 * Provides offline functionality and caching strategies
 */

/// <reference lib="WebWorker" />

// Export empty type because of isolatedModules flag.
export type {};
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "rpn-calculator-v2";
const STATIC_CACHE_NAME = "rpn-calculator-static-v2";
const DYNAMIC_CACHE_NAME = "rpn-calculator-dynamic-v2";

// Files to cache for offline functionality
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./main.js",
  "./main.css",
  "./manifest.json",
  "./icons/icon.svg",
  "./icons/screenshot-wide.svg",
  "./browserconfig.xml",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully");
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old cache versions
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Old caches cleaned up");
        // Ensure the service worker takes control immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith("http")) {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    // Try cache first, then network (cache-first strategy for static assets)
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("[SW] Serving from cache:", event.request.url);
        return cachedResponse;
      }

      // Not in cache, fetch from network
      console.log("[SW] Fetching from network:", event.request.url);
      return fetch(event.request)
        .then((networkResponse) => {
          // Don't cache non-successful responses
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clone the response before caching
          const responseToCache = networkResponse.clone();

          // Cache dynamic assets
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch((error) => {
          console.error("[SW] Fetch failed:", error);

          // For navigation requests, return the cached index.html if available
          if (event.request.mode === "navigate") {
            return caches.match("/index.html").then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cached version, return a simple offline page
              return new Response(
                `<!DOCTYPE html>
                    <html>
                    <head>
                      <title>RPN Calculator - Offline</title>
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px; }
                        .offline { color: #666; }
                      </style>
                    </head>
                    <body>
                      <h1>🧮 RPN Calculator</h1>
                      <div class="offline">
                        <h2>You're offline</h2>
                        <p>The calculator will work once you're back online.</p>
                        <button onclick="window.location.reload()">Try Again</button>
                      </div>
                    </body>
                    </html>`,
                {
                  status: 200,
                  statusText: "OK",
                  headers: { "Content-Type": "text/html" },
                }
              );
            });
          }

          // For other requests, just throw the error
          throw error;
        });
    })
  );
});

// Message event data interface
interface MessageEventData {
  type: string;
  [key: string]: string;
}

// Handle messages from the main app
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  const data = event.data as MessageEventData;

  if (data && data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (data && data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Background sync for future enhancements
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Perform background sync operations
      Promise.resolve()
    );
  }
});

// Push notifications for future enhancements
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const options = {
    body: event.data ? event.data.text() : "New update available",
    icon: "./icons/icon.svg",
    badge: "./icons/icon.svg",
    tag: "rpn-calculator",
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification("RPN Calculator", options)
  );
});

console.log("[SW] Service Worker script loaded");
