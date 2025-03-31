const shellCache = "contralyze-cache-v1";
const dynamicCache = "contralyze-dynamic-v2";

const assets = [
    "/manifest.json",
    "/global.css",
    "/app/favicon.ico",
    "/img/icons/Contralyze72x72.jpg",
    "/img/icons/Contralyze96x96.jpg",
    "/img/icons/Contralyze129x129.jpg",
    "/img/icons/Contralyze144x144.jpg",
    "/img/icons/Contralyze152x152.jpg",
    "/img/icons/Contralyze192x192.jpg",
    "/img/icons/Contralyze384x384.jpg",
    "/img/icons/Contralyze512x512.jpg",
];
// install event
self.addEventListener('install', event => {
  console.log('Service worker installing...', event);
//
  //pre cache shell assets
  console.log('Caching shell assets...');
  event.waitUntil(
      caches.open(shellCache)
          .then(cache => {
              cache.addAll(assets);
          })
  );
});

// activate event
self.addEventListener('activate', event => {
  console.log('Service worker activating...', event);

  //delete old cache
  event.waitUntil(
      caches.keys().then(keys => {
              return Promise.all(keys
                  .filter(key => key !== shellCache && key !== dynamicCache)
                  .map(key => caches.delete(key))
              );
          }
      )
  )
});

// fetch event
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return; // Evita cachear peticiones PUT, POST, DELETE, etc.
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          return caches.open(dynamicCache).then(cache => {
            cache.put(event.request, networkResponse.clone());

            // Verificar y limpiar caché antiguo
            cache.keys().then(keys => {
              keys.forEach(request => {
                cache.match(request).then(response => {
                  if (!response) return;
                  const dateHeader = response.headers.get('date');
                  if (dateHeader) {
                    const responseDate = new Date(dateHeader).getTime();
                    const now = Date.now();
                    if (now - responseDate > 24 * 60 * 60 * 1000) { // Más de 24 horas
                      cache.delete(request);
                      console.log(`Deleted expired cache: ${request.url}`);
                    }
                  }
                });
              });
            });

            return networkResponse;
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then(cacheResponse => {
          return cacheResponse || caches.match('/pages/fallback.html');
        });
      })
  );
});