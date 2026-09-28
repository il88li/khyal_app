/* ═══════════════════════════════════════════════
   خيال — Service Worker v5.1.1
   ═══════════════════════════════════════════════ */

// ⚠️ مهم: عدّل هذا الرقم عند كل نشر مهم
// أو استخدم timestamp تلقائي
const VERSION = 'khayal-5-1-1-' + '20250928';

const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const DATA_CACHE = `${VERSION}-data`;

// ملفات أساسية فقط — لا تفشل إن لم يوجد ملف
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css?v=8',
  '/js/app.js?v=8',
  '/js/screens.js',
  '/js/skeleton.js',
  '/js/cache.js'
];

/* ═══ التثبيت ═══ */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        // ✅ استخدم add() لكل ملف منفردًا حتى لا يفشل الكل
        const results = await Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] فشل تخزين:', url, err.message);
              return null;
            })
          )
        );
        return results;
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] فشل التثبيت:', err))
  );
});

/* ═══ التنشيط — احذف كل النسخ القديمة ═══ */
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
      .then(() => {
        // ✅ أخبر كل التبويبات المفتوحة أن هناك نسخة جديدة
        return self.clients.matchAll({ type: 'window' });
      })
      .then((clients) => {
        clients.forEach((client) => {
          try { client.postMessage({ type: 'SW_UPDATED', version: VERSION }); } catch {}
        });
      })
  );
});

/* ═══ الاستراتيجيات ═══ */
function isStaticAsset(url) {
  return /\.(css|js|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg|ico)$/i.test(url.pathname) ||
         url.pathname.startsWith('/css/') ||
         url.pathname.startsWith('/js/');
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

  // 1. الأصول الثابتة
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // 2. API عام
  if (isApiGet(url, req.method) && isPublicApi(url)) {
    event.respondWith(staleWhileRevalidate(req, DATA_CACHE));
    return;
  }

  // 3. API خاص
  if (isApiGet(url, req.method) && isPrivateApi(url)) {
    event.respondWith(networkFirst(req, DATA_CACHE, 2500));
    return;
  }

  // 4. صفحات HTML — Network First لكن لا تخزّن HTML في الكاش الدائم
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    // ✅ لا تخزّن HTML في SW — دع Vercel يخدمه دائمًا طازجًا
    event.respondWith(fetch(req).catch(() => caches.match('/index.html')));
    return;
  }

  // 5. الباقي
  event.respondWith(fetch(req));
});

/* ═══ رسائل من الصفحة ═══ */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
  if (event.data === 'GET_VERSION') {
    event.source?.postMessage({ type: 'VERSION', version: VERSION });
  }
});