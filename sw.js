const CACHE_NAME = 'nyang-coach-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 새 SW 즉시 활성화
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  // 이전 버전 캐시 삭제
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()) // 즉시 모든 탭 제어
  );
});

self.addEventListener('fetch', (event) => {
  // Network-First: 항상 네트워크를 먼저 시도, 실패 시 캐시 사용
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 성공하면 캐시에도 저장
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
