import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import api from './api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

/* ─── تحليل Cookies بدون حزمة إضافية ─── */
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

/* ─── الملفات الثابتة — محلياً فقط ─── */
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '..', 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
    etag: true
  }));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
}

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