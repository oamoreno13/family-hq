// Versión de prueba del diseño nuevo. Vive en /v2/ con su propio caché (hq2-*), aparte de la app actual.
const CACHE = 'hq2-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', '../apple-touch-icon.png', '../icon-192.png', '../favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('hq2-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const pagina = e.request.mode === 'navigate' || u.pathname.endsWith('/v2/') || u.pathname.endsWith('/v2/index.html');
  if (pagina) {
    e.respondWith(caches.open(CACHE).then(c => {
      const red = fetch(e.request, { cache: 'no-cache' }).then(res => { if (res.ok) c.put('./', res.clone()); return res; });
      const espera = new Promise(ok => setTimeout(ok, 3000)).then(() => c.match('./'));
      return Promise.race([red, espera.then(r => r || red)]).catch(() => c.match('./'));
    }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(hit => {
    const red = fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || red;
  })));
});
