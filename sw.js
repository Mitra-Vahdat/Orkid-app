const CACHE_NAME = "orkid-aac-v3";

const APP_SHELL = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/script.js",
    "/manifest.json",
    "/images/orkid-icon-192.png",
    "/images/orkid-icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) return;

    // صفحات HTML → همیشه اول نسخه جدید را از شبکه بگیر
    if (request.mode === "navigate" ||
        request.destination === "document") {

        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(request, copy));

                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then(cachedResponse => {
                            return cachedResponse || caches.match("/index.html");
                        });
                })
        );

        return;
    }

    // فایل‌های CSS / JS / تصاویر → کش اول
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then(response => {

                        if (response.ok) {
                            const copy = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, copy));
                        }

                        return response;
                    });
            })
            .catch(() => {
                return new Response("", {
                    status: 503,
                    statusText: "Offline"
                });
            })
    );
});