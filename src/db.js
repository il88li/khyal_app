import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

/* ═══════════════════════════════════════════════
   إعداد الاتصال — يدعم Aiven SSL ومتغيرات منفصلة
   ═══════════════════════════════════════════════ */

function buildConfig() {
  // الأولوية لـ DATABASE_URL إن وُجد
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Aiven يستخدم شهادات موقّعة
    };
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    ssl: { rejectUnauthorized: false }
  };
}

const baseConfig = buildConfig();

/* ═══════════════════════════════════════════════
   Pool مُحصَّن — يتحمّل انقطاع الاتصال وإعادة التشغيل
   مستوحى من أنماط resilient-pg-pool
   ═══════════════════════════════════════════════ */

export const pool = new Pool({
  ...baseConfig,
  max: 10,                       // حد أقصى للاتصالات المتزامنة
  min: 2,                        // اتصالات جاهزة دائماً
  idleTimeoutMillis: 30000,      // إغلاق الاتصالات الخاملة بعد 30 ث
  connectionTimeoutMillis: 8000, // فشل سريع بدل التعليق
  keepAlive: true,               // TCP keepalive لاكتشاف السوكِت الميت
  keepAliveInitialDelayMillis: 10000,
  application_name: 'khayal-app',
  statement_timeout: 15000,      // منع الاستعلامات المعلّقة
  query_timeout: 15000
});

/* معالجة أخطاء الاتصالات الخاملة — يمنع انهيار العملية */
pool.on('error', (err) => {
  console.error('[db] خطأ في اتصال خامل:', err.message);
});

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[db] اتصال جديد أُنشئ');
  }
});

/* ═══════════════════════════════════════════════
   تصنيف الأخطاء العابرة + إعادة المحاولة مع Backoff
   ═══════════════════════════════════════════════ */

const TRANSIENT_PATTERNS = [
  'ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ECONNREFUSED',
  'socket hang up', 'Connection terminated',
  'connect timeout', 'connection timeout',
  'terminating connection', 'server closed'
];

function isTransient(err) {
  const msg = (err?.message || '').toLowerCase();
  return TRANSIENT_PATTERNS.some((p) => msg.includes(p.toLowerCase()));
}

const RETRY_DELAYS = [0, 250, 1000, 2500]; // 4 محاولات إجمالاً

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ═══════════════════════════════════════════════
   واجهة الاستعلام — query / queryOne / transaction
   ═══════════════════════════════════════════════ */

export async function query(sql, params = []) {
  let lastErr;
  for (let i = 0; i < RETRY_DELAYS.length; i++) {
    if (RETRY_DELAYS[i]) await sleep(RETRY_DELAYS[i]);
    try {
      const res = await pool.query(sql, params);
      return res;
    } catch (err) {
      lastErr = err;
      if (!isTransient(err)) throw err; // أخطاء SQL لا تُعاد
      console.warn(`[db] محاولة ${i + 1} فشلت: ${err.message}`);
    }
  }
  throw lastErr;
}

export async function queryOne(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows[0] || null;
}

export async function queryAll(sql, params = []) {
  const { rows } = await query(sql, params);
  return rows;
}

/* Transaction — يُعاد فقط الـ acquire+BEGIN وليس جسم العملية */
export async function transaction(fn) {
  let lastErr;
  for (let i = 0; i < RETRY_DELAYS.length; i++) {
    if (RETRY_DELAYS[i]) await sleep(RETRY_DELAYS[i]);
    const client = await pool.connect().catch((e) => { lastErr = e; return null; });
    if (!client) continue;

    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      client.release();
      return result;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      client.release();
      lastErr = err;
      // لو الخطأ داخل جسم العملية (SQL)، لا نعيد المحاولة
      if (!isTransient(err)) throw err;
    }
  }
  throw lastErr;
}

/* ═══════════════════════════════════════════════
   فحص صحة الاتصال — يُستخدم في /api/health
   ═══════════════════════════════════════════════ */

export async function healthCheck() {
  const start = Date.now();
  try {
    const { rows } = await pool.query('SELECT version() AS v, now() AS t');
    return {
      ok: true,
      latencyMs: Date.now() - start,
      version: rows[0].v.split(' ').slice(0, 2).join(' '),
      poolTotal: pool.totalCount,
      poolIdle: pool.idleCount,
      poolWaiting: pool.waitingCount
    };
  } catch (err) {
    return { ok: false, error: err.message, latencyMs: Date.now() - start };
  }
}

/* إغلاق رشيق عند إيقاف الخادم */
export async function closePool() {
  await pool.end();
  console.log('[db] أُغلق الـ pool');
}

export default { pool, query, queryOne, queryAll, transaction, healthCheck, closePool };