/* Service worker Lentera Malam: notifikasi Web Push + cache offline. */
self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data && event.data.text() }; }
  event.waitUntil(self.registration.showNotification(d.title || 'Lentera Malam', {
    body: d.body || 'Renungan malam ini sudah siap.',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    tag: d.tag || 'lentera',
    data: { link: d.link || '/' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) { if ('navigate' in c) c.navigate(link); return c.focus(); } }
    return clients.openWindow(link);
  }));
});

/* ---------- cache offline ---------- */
const CACHE = 'lentera-v1';
const SHELL = ['/', '/index.html', '/style.css', '/app.js', '/supabase-config.js', '/manifest.webmanifest',
  '/data/alkitab.json', '/data/rencana.json', '/data/linimasa.json', '/data/glosarium.json', '/icons/icon-192.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });

self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  // Halaman, kode, dan renungan: utamakan jaringan supaya selalu terbaru; pakai cache bila offline.
  if (url.pathname.startsWith('/content/') || req.mode === 'navigate' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('/index.html') : undefined))));
    return;
  }
  // Data Alkitab dan ikon: cache dulu, perbarui di latar.
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
