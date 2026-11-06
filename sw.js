// Permite abrir la app sin internet. Cambia VERSION cuando subas una actualización.
const VERSION = 'namufin-v21';
const FILES = ['./', './index.html', './claro.html', './aero.html', './manifest-claro.webmanifest', './manifest-aero.webmanifest', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (/\.(png|webmanifest)$/.test(url.pathname)) return; // los íconos siempre directo del servidor
  if (url.origin === location.origin) {
    // Primero intenta la versión más nueva; sin internet usa la guardada
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  } else if (url.hostname.includes('fonts.')) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })));
  }
});
