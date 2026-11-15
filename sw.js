// La pantalla se pide primero a internet (así cada cambio se ve al abrir) y, si no hay señal
// o tarda más de 3 segundos, se usa la última guardada. Íconos y demás: la guardada al instante.
// Los datos no pasan por aquí (van directo a Google con la clave).
const CACHE = 'hq-v18';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('hq-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/v2/')) return; // la versión de prueba tiene su propio service worker
  const pagina = e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('/index.html');
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
