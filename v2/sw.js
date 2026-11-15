// La prueba del diseño nuevo ya pasó a la app principal: este service worker se borra solo.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('hq2-')).map(k => caches.delete(k)))).then(() => self.registration.unregister())); });
