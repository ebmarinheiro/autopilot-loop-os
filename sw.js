const CACHE_NAME = 'autopilot-loop-os-v-auto';

self.addEventListener('install', (event) => {
  // Ativa a nova versão imediatamente, sem ficar em espera
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Limpa caches antigos e assume o controle das abas abertas na hora
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET (ex: escritas no Firebase)
  if (event.request.method !== 'GET') return;

  // Estratégia Network-First: tenta a rede primeiro; só usa cache se estiver offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
