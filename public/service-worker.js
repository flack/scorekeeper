// Kill switch for the sw-precache service worker of versions before the
// Angular rewrite, which was registered under this name. Browsers keep
// running an old service worker until its script changes, so without this
// file existing installs would serve the old cached app forever. It removes
// the old caches, unregisters itself and reloads open pages, which then
// register the Angular service worker (ngsw-worker.js) instead.
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => !key.startsWith('ngsw:')).map(key => caches.delete(key)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({type: 'window'});
        for (const client of clients) {
            client.navigate(client.url);
        }
    })());
});
