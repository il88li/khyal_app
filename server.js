import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import api from './src/api.js';
import { healthCheck, closePool } from './src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '5mb' }));

// رؤوس أمان خفيفة
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use('/api', api);
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  etag: true
}));

app.get('*', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html')));

// معالج أخطاء موحّد
app.use((err, _req, res, _next) => {
  console.error('[api]', err);
  const transient = /ECONNRESET|ETIMEDOUT|socket hang up|Connection terminated/i.test(err.message || '');
  res.status(transient ? 503 : 500).json({
    error: transient
      ? 'تعذّر الوصول لقاعدة البيانات مؤقتاً، أعد المحاولة'
      : 'حدث خطأ في الخادم'
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  const h = await healthCheck();
  console.log(`\n  ✦ خيال يعمل على  http://localhost:${PORT}`);
  console.log(h.ok
    ? `  ✓ قاعدة البيانات متصلة (${h.latencyMs}ms) — ${h.version}`
    : `  ✖ قاعدة البيانات غير متصلة: ${h.error}`);
  console.log();
});

/* إغلاق رشيق */
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    console.log(`\n${sig} — إغلاق رشيق…`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 8000);
  });
}

process.on('unhandledRejection', (e) =>
  console.error('[unhandledRejection]', e));