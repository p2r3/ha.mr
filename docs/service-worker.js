const CACHE = "ha.mr-v1";
const APP = [
  "/404.html",
  "/main.js",
  "/compress.js",
  "/alphabets.js",
  "/lean-qr/lean-qr.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/404.html").then(response => response || fetch(request))
    );
    return;
  }

  event.respondWith(caches.match(request).then(response => response || fetch(request)));
});
