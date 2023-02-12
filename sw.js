// Adding this example caching code with no Url's to cache just to tell the browser that this app will work offline so that it can prommpt PWA install.
const CACHE_NAME = 'v1';
const urlsToCache = [
"/"
 ];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
