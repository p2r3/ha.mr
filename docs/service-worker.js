import { decompress } from "./compress.js";
import { outputAlphabetQR } from "./alphabets.js";

const CACHE = "ha.mr-v2";
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
    event.respondWith(handleNavigation(request, url));
    return;
  }

  event.respondWith(caches.match(request).then(response => response || fetch(request)));
});

async function handleNavigation (request, url) {
  try {
    const payload = decodeURIComponent(url.pathname.slice(1));
    if (payload) {
      const target = new URL(decompress(payload, outputAlphabetQR));
      if (target.protocol === "http:" || target.protocol === "https:") {
        return Response.redirect(target.href);
      }
    }
  } catch (error) {
    console.warn("Could not decode path URL.", error);
  }

  return await caches.match("/404.html") || fetch(request);
}
