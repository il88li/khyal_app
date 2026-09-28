import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

/* ═══════════════════════════════════════════════
   إعداد الاتصال — يدعم Aiven SSL
   ═══════════════════════════════════════════════ */

function buildConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
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

/* ═══════════════════════════════════════════════
   Pool عالمي يُعاد استخدامه بين invocations
   ─────────────────────────────────────────────
   Vercel يُعيد استخدام globalThis بين الطلبات الدافئة
   وهذا يمنع إنشاء pool جديد في كل cold start.
   ═══════════════════════════════════════════════ */

const POOL_KEY = '__khayal_pg_pool__';

function getPool() {
  if (!globalThis[POOL_KEY]) {
    console.log('[db] إنشاء pool جديد');
    const pool = new Pool({
      ...buildConfig(),
      max: 3,                        // أقل من الحد المسموح لـ Aiven
      min: 0,                        // serverless: لا اتصالات دائمة
      idleTimeoutMillis: 10000,      // إغلاق سريع
      connectionTimeoutMillis: 8000,
      keepAlive: true,
      application_name: 'khayal',
      statement_timeout: 15000,
      query_timeout: 15000
    });
    pool.on('error', (err) => console.error('[db] خطأ اتصال خامل:', err.message));
    globalThis[POOL_KEY] = pool;
  }
  return globalThis[POOL_KEY];
}

export const pool = getPool();

/* ═══════════════════════════════════════════════
   إعادة المحاولة للأخطاء العابرة
   ═══════════════════════════════════════════════ */

const TRANSIENT_PATTERNS = [
  'ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ECONNREFUSED',
  'socket hang up', 'Connection terminated',
  'connect timeout', 'connection timeout',
  'server closed', 'terminating connection'
];

const isTransient = (err) =>
  TRANSIENT_PATTERNS.some((p) =>
    (err?.message || '').toLowerCase().includes(p.toLowerCase()));

const RETRY_DELAYS = [0, 300, 1200, 3000];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function query(sql, params = []) {
  let lastErr;
  for (let i = 0; i < RETRY_DELAYS.length; i++) {
    if (RETRY_DELAYS[i]) await sleep(RETRY_DELAYS[i]);
    try {
      return await pool.query(sql, params);
    } catch (err) {
      lastErr = err;
      if (!isTransient(err)) throw err;
      console.warn(`[db] محاولة ${i + 1} فشلت: ${err.message}`);
    }
  }
  throw lastErr;
}

export const queryOne = async (sql, params = []) =>
  (await query(sql, params)).rows[0] || null;

export const queryAll = async (sql, params = []) =>
  (await query(sql, params)).rows;

export async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/* ═══════════════════════════════════════════════
   المخطط مضمّن + Auto-migrate
   ─────────────────────────────────────────────
   Vercel لا يشغّل أوامر npm تلقائياً — لذا
   ننشئ الجداول عند أول طلب.
   ═══════════════════════════════════════════════ */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  username     TEXT UNIQUE NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  bio          TEXT DEFAULT '',
  verified     BOOLEAN DEFAULT FALSE,
  role         TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  joined       DATE DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompts (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  body         TEXT NOT NULL,
  category     TEXT NOT NULL,
  tags         TEXT[] DEFAULT '{}',
  models       TEXT[] DEFAULT '{}',
  cover        TEXT DEFAULT '',
  author_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  copies       INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id    TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, prompt_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  token        TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS idx_prompts_author    ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category  ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_created   ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_copies    ON prompts(copies DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_tags      ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_models    ON prompts USING GIN(models);
CREATE INDEX IF NOT EXISTS idx_likes_prompt      ON likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_likes_user        ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user     ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires  ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_verified    ON users(verified);
`;

const MIGRATED_KEY = '__khayal_migrated__';

export async function ensureSchema() {
  if (globalThis[MIGRATED_KEY]) return;
  try {
    await query(SCHEMA);
    globalThis[MIGRATED_KEY] = true;
    console.log('[db] ✓ المخطط جاهز');
  } catch (e) {
    console.error('[db] ✖ فشل تهيئة المخطط:', e.message);
    throw e;
  }
}

/* ═══════════════════════════════════════════════
   فحص الصحة
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

export async function closePool() {
  if (globalThis[POOL_KEY]) {
    await globalThis[POOL_KEY].end();
    delete globalThis[POOL_KEY];
    console.log('[db] أُغلق الـ pool');
  }
}

export default {
  pool, query, queryOne, queryAll, transaction,
  ensureSchema, healthCheck, closePool
};