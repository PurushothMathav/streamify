const CACHE_NAME = "streamify-0308251950"; // increment version on each update
const ASSETS_TO_CACHE = [
  "/streamify/",
  "/streamify/index.html",
  "/streamify/player.html",
  "/streamify/tvshows.html",
  "/streamify/tvplayer.html",
  "/streamify/recommended_movies.json",
  "/streamify/combined_tvshows.json",
  "/streamify/icons/favicon.ico",
  "/streamify/icons/favicon-16x16.png",
  "/streamify/icons/favicon-32x32.png",
  "/streamify/icons/icon-192.png",
  "/streamify/icons/icon-512.png",  
  "/streamify/manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/hls.js@latest",
  "https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.4.7/swiper-bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.4.7/swiper-bundle.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
];

// ✅ Install event — pre-cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // activate immediately
});

// ✅ Activate event — clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ✅ Fetch event — serve from cache or fetch from network
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Avoid caching dynamic media/stream URLs
  if (request.url.includes("/preview/") || request.url.includes(".m3u8")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            if (
              request.method === "GET" &&
              request.url.startsWith(self.location.origin)
            ) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
      );
    })
  );
});
