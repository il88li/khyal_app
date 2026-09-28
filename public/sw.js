/* ═══════════════════════════════════════════════
   خيال — Service Worker v9 (Self-Destruct on Update)
   ═══════════════════════════════════════════════ */

// ⚠️ غيّر هذا الرقم مع كل نشر مهم
const VERSION = 'khayal-v9';

const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const DATA_CACHE = `${VERSION}-data`;

// ملفات أساسية فقط
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

/* ═══ التثبيت ═══ */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        // ✅ add منفصل لكل ملف حتى لا يفشل الكل
        await Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] فشل تخزين:', url, err.message);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] فشل التثبيت:', err))
  );
});

/* ═══ التنشيط — امسح كل شيء قديم ═══ */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => {
            console.log('[SW] حذف الكاش القديم:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => {
          try { client.postMessage({ type: 'SW_UPDATED', version: VERSION }); } catch {}
        });
      })
  );
});

/* ═══ استراتيجيات ═══ */

function isStaticAsset(url) {
  return /\.(css|js|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg|ico)$/i.test(url.pathname);
}

function isApiGet(url, method) {
  return method === 'GET' && url.pathname.startsWith('/api/');
}

function isPublicApi(url) {
  return /\/(prompts|users|comments|meta)(\?|$|\/)/.test(url.pathname);
}

function isPrivateApi(url) {
  return /\/(auth|me|notifications|admin|favorites)(\?|$|\/)/.test(url.pathname);
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const response = await fetch(req);
    if (response.ok) cache.put(req, response.clone());
    return response;
  } catch (err) {
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((response) => {
      if (response.ok) cache.put(req, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function networkFirst(req, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(req, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) cache.put(req, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw err;
  }
}

/* ═══ معالج الجلب ═══ */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/')) return;

  // 1. أصول ثابتة → Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // 2. API عام → Stale While Revalidate
  if (isApiGet(url, req.method) && isPublicApi(url)) {
    event.respondWith(staleWhileRevalidate(req, DATA_CACHE));
    return;
  }

  // 3. API خاص → Network First
  if (isApiGet(url, req.method) && isPrivateApi(url)) {
    event.respondWith(networkFirst(req, DATA_CACHE, 2500));
    return;
  }

  // 4. HTML — لا تخزّن أبدًا (دع Vercel يخدمه طازجًا)
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(fetch(req).catch(() => caches.match('/index.html')));
    return;
  }

  // 5. الباقي → Fetch عادي
  event.respondWith(fetch(req));
});

/* ═══ رسائل من الصفحة ═══ */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
});