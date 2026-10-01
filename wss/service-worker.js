self.addEventListener("install", event => {
    event.waitUntil(
        caches.open("wss-cache").then(cache => {
            return cache.addAll([
                "/wss/",
                "/wss/index.html",
                "/wss/style.css",
                "/wss/app.js",
                "/wss/ui.js",
                "/wss/manifest.json"
            ]);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
