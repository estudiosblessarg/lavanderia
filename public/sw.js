const CACHE_NAME = 'appLavanderia';

self.addEventListener('install', event => {
  console.log('SW: Instalado');

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        'styles.css',
        'app.js',
        '/index.html',
        '/manifest.json',
        '/Icon-192.png',
        '/Icon-512.png'
      ]);
    })
  );
});