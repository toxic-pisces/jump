// Service Worker für Offline-Funktionalität
const CACHE_NAME = 'jump-game-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/src/main.js',
  '/src/engine/Game.js',
  '/src/engine/Physics.js',
  '/src/engine/Renderer.js',
  '/src/entities/Player.js',
  '/src/managers/ProgressionManager.js',
  '/src/managers/StateManager.js',
  '/src/managers/LevelManager.js',
  '/src/managers/InputManager.js',
  '/src/managers/SoundManager.js'
];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch - Cache First Strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Aktivierung - Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
