const CACHE_NAME = "orkid-aac-v22";
const APP_SHELL = [
    "./index.html",
    "./drawing.html",
    "./card-customization.html",
    "./education.html",
    "./education-topic.html",
    "./settings.html",
    "./css/style.css",
    "./css/mobile-improvements.css",
    "./css/landscape-mobile.css",
    "./css/drawing.css",
    "./css/card-customization.css",
    "./css/education.css",
    "./css/setting.css",
    "./js/card-state.js",
    "./js/script.js",
    "./js/drawing.js",
    "./js/card-customization.js",
    "./js/ai-personalization.js",
    "./js/education.js",
    "./js/setting.js",
    "./manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    event.respondWith(
        fetch(event.request).then(response => {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
            }
            return response;
        }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
    );
});
