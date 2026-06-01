// Service Worker dinâmico e seguro para PWA sem bloqueio de cache (evita tela branca por arquivos desatualizados/hashes antigos)
const CACHE_NAME = 'simplifica-pwa-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Força a limpeza de caches antigos no momento de ativação para corrigir telas pretas/brancas imediatamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First simplificada com exclusão de cache para HTML/JS dinâmicos
// Isso garante que o app sempre carregue a versão mais nova do servidor, evitando o erro de arquivo JS com hash antigo (404)
self.addEventListener('fetch', (event) => {
  const url = new Date(event.request.url);

  // Ignorar requisições não-GET, APIs do Firebase, autenticação ou uploads de imagens
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, opcionalmente salvamos apenas os ícones estáticos estruturais sem risco de quebrar o index.html principal
        if (response.status === 200 && (event.request.url.includes('/icon.png') || event.request.url.includes('/manifest.json'))) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback offline apenas para recursos armazenados, senão tenta resolver com cache local temporário
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Caso contrário, tenta responder o básico
          return new Response('Sem conexão com a internet.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
      })
  );
});
