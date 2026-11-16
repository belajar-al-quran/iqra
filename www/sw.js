const CACHE = 'iqra-v3';
const CORE = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/data.js', 'lib/framework7-bundle.min.js',
  'lib/framework7-bundle.min.css', 'fonts/me_quran.woff2', 'data/audio.json', 'manifest.webmanifest', 'icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(CORE.map((u) => c.add(u).catch(() => {})));
    try {
      const files = await (await fetch('data/audio.json')).json();
      await Promise.all(files.map((f) => c.add('audio/' + encodeURIComponent(f)).catch(() => {})));
    } catch {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(e.request);
      const net = fetch(e.request)
        .then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
