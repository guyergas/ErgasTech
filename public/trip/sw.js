const CACHE = "ergastrip-v1";
const SHELL = [
  "/trip",
  "/trip/manifest.json",
  "/trip/icon-192.svg",
  "/trip/icon-512.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Only handle GET requests within /trip scope
  if (e.request.method !== "GET") return;
  if (!url.pathname.startsWith("/trip")) return;

  // API calls: network-first, no cache
  if (url.pathname.startsWith("/api/")) return;

  // Pages and assets: network-first, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
