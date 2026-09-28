/* ═══════════════════════════════════════════════
   خيال — Service Worker v1
   استراتيجيات التخزين المؤقت الذكية
   ═══════════════════════════════════════════════ */

const VERSION = 'khayal-v1';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const DATA_CACHE = `${VERSION}-data`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/screens.js',
  '/js/skeleton.js'
];

/* ═══ التثبيت — تخزين الأصول الأساسية ═══ */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('SW install failed:', err))
  );
});

/* ═══ التنشيط — حذف النسخ القديمة ═══ */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ═══ استراتيجيات الجلب ═══ */

function isStaticAsset(url) {
  return /\.(css|js|woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg|ico)$/i.test(url.pathname) ||
         url.pathname.startsWith('/css/') ||
         url.pathname.startsWith('/js/');
}

function isApiGet(url, method) {
  return method === 'GET' && url.pathname.startsWith('/api/');
}

function isPublicApi(url) {
  // نقاط عامة يمكن تخزينها (البرومبتات، التعليقات، إلخ)
  return /\/(prompts|users|comments|meta)(\?|$|\/)/.test(url.pathname);
}

function isPrivateApi(url) {
  // نقاط خاصة (auth, me, notifications) لا تُخزّن طويلًا
  return /\/(auth|me|notifications|admin|favorites)(\?|$|\/)/.test(url.pathname);
}

/* ─── الاستراتيجية 1: Cache First (للأصول الثابتة) ─── */
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

/* ─── الاستراتيجية 2: Stale While Revalidate ─── */
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

/* ─── الاستراتيجية 3: Network First with cache fallback ─── */
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

/* ─── الاستراتيجية 4: Network Only (للطلبات الحساسة) ─── */
function networkOnly(req) {
  return fetch(req);
}

/* ═══ معالج الجلب الرئيسي ═══ */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // تجاهل الطلبات غير GET والخارجية
  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/')) return;

  // 1. الأصول الثابتة → Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // 2. نقاط API العامة → Stale While Revalidate (سرعة فورية)
  if (isApiGet(url, req.method) && isPublicApi(url)) {
    event.respondWith(staleWhileRevalidate(req, DATA_CACHE));
    return;
  }

  // 3. نقاط API الخاصة → Network First
  if (isApiGet(url, req.method) && isPrivateApi(url)) {
    event.respondWith(networkFirst(req, DATA_CACHE, 2500));
    return;
  }

  // 4. التنقل والصفحات → Network First
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(req, STATIC_CACHE, 3000));
    return;
  }

  // 5. الباقي → Network Only
  event.respondWith(networkOnly(req));
});

/* ═══ رسائل من الصفحة ═══ */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
});