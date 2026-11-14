// Abre al instante: sirve la última versión guardada y en segundo plano baja la nueva.
// Los datos no pasan por aquí (van directo a Google con la clave).
const CACHE = 'hq-v8';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const clave = u.pathname.endsWith('/') ? new Request('./') : e.request;
  e.respondWith(caches.open(CACHE).then(c => c.match(clave, { ignoreSearch: true }).then(hit => {
    const red = fetch(e.request).then(res => { if (res.ok) c.put(clave, res.clone()); return res; }).catch(() => hit);
    return hit || red;
  })));
});
