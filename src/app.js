import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import api from './api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const app = express();

/* ─── إخفاء بصمة Express ─── */
app.disable('x-powered-by');

/* ─── رؤوس الأمان ─── */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

/* ─── تحليل JSON ─── */
app.use(express.json({ limit: '4mb' }));

/* ─── تحليل Cookies ─── */
app.use((req, _res, next) => {
  const raw = req.headers.cookie || '';
  const cookies = {};
  if (raw) {
    for (const part of raw.split(';')) {
      const idx = part.indexOf('=');
      if (idx < 0) continue;
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      if (k) {
        try { cookies[decodeURIComponent(k)] = decodeURIComponent(v); }
        catch { cookies[k] = v; }
      }
    }
  }
  req.cookies = cookies;
  next();
});

/* ─── مسارات API ─── */
app.use('/api', api);

/* ═══════════════════════════════════════════════
   الملفات الثابتة — MIME صريحة + fallback
   ═══════════════════════════════════════════════ */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

function serveStatic(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  let urlPath;
  try {
    urlPath = decodeURIComponent(req.path);
  } catch {
    return next();
  }

  if (urlPath === '/') urlPath = '/index.html';

  // منع directory traversal
  const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) return next();

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return next();

    const ext = path.extname(filePath).toLowerCase();
    const isHashed = /-[a-f0-9]{8,}\./i.test(filePath);
    const maxAge = isHashed ? 31536000 : 300;

    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
    res.setHeader('Content-Length', String(stat.size));

    if (req.method === 'HEAD') return res.end();

    const stream = fs.createReadStream(filePath);
    stream.on('error', (e) => {
      console.error('[static] stream error:', e.message);
      if (!res.headersSent) next();
    });
    stream.pipe(res);
  });
}

app.use(serveStatic);

/* ─── SPA fallback ─── */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();

  // طلب ملف بامتداد (ولم يوجد) → 404 صريح
  if (/\.[a-z0-9]+$/i.test(req.path)) {
    return res.status(404).type('text/plain').send('Not found: ' + req.path);
  }

  // مسار SPA → index.html
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[spa] index.html not found at:', indexPath);
      res.status(500).type('text/plain')
        .send('index.html missing — check that public/index.html exists in the deployment bundle');
    }
  });
});

/* ─── معالج أخطاء موحّد ─── */
app.use((err, _req, res, _next) => {
  console.error('[api error]', err.message);
  const transient = /ECONNRESET|ETIMEDOUT|socket hang up|Connection terminated|terminating connection/i.test(err.message || '');
  const msg = transient
    ? 'تعذّر الوصول لقاعدة البيانات مؤقتاً، أعد المحاولة'
    : (process.env.NODE_ENV === 'production' ? 'حدث خطأ في الخادم' : err.message);
  res.status(transient ? 503 : 500).json({ error: msg });
});

export default app;