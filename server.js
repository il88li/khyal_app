import 'dotenv/config';
import app from './src/app.js';
import { healthCheck, closePool } from './src/db.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  const h = await healthCheck();
  console.log(`\n  ✦ خيال يعمل على  http://localhost:${PORT}`);
  console.log(h.ok
    ? `  ✓ قاعدة البيانات متصلة (${h.latencyMs}ms) — ${h.version}`
    : `  ✖ قاعدة البيانات غير متصلة: ${h.error}`);
  console.log();
});

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