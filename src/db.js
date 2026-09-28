import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

/* ═══════════════════════════════════════════════
   بناء الإعدادات — يدعم Aiven SSL
   ═══════════════════════════════════════════════ */

function buildConfig() {
  let connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    try {
      const u = new URL(connectionString);
      u.searchParams.delete('sslmode');
      u.searchParams.delete('sslrootcert');
      connectionString = u.toString();
    } catch { /* تجاهل */ }
  }

  if (connectionString) {
    return {
      connectionString,
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
   Pool مُحسّن لـ Serverless (Vercel Lambda)
   ─────────────────────────────────────────────
   ⚠️ الحرجة: عدد الاتصالات قليل جدًا في Aiven Free
   كل Lambda instance يجب ألا يفتح أكثر من اتصالين.
   ═══════════════════════════════════════════════ */

const POOL_KEY = '__khayal_pg_pool__';

function getPool() {
  if (!globalThis[POOL_KEY]) {
    console.log('[db] إنشاء pool جديد لـ Serverless');

    const pool = new Pool({
      ...buildConfig(),

      // ⭐⭐⭐ التعديلات الحرجة ⭐⭐⭐
      max: 2,                              // ← كان 8! الآن 2 فقط
      min: 0,                              // لا اتصالات دائمة

      // ⭐ إغلاق سريع للاتصالات الخاملة
      idleTimeoutMillis: 5000,             // ← كان 8s
      connectionTimeoutMillis: 6000,       // ← كان 8s

      // ⭐⭐⭐ مهم جدًا لـ Vercel: اسمح للـ pool بإغلاق نفسه
      allowExitOnIdle: true,               // ← جديد! يُغلق pool عند تجمد Lambda

      // ⭐ إعادة استخدام الاتصال حتى 50 مرة ثم إغلاقه
      maxUses: 50,                         // ← جديد! يمنع تسريب الاتصالات

      // ⭐ إعدادات الشبكة
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,

      // ⭐ تقليل المهلة من 15s إلى 8s لتجنب 504
      statement_timeout: 8000,             // ← كان 15s
      query_timeout: 8000,                 // ← كان 15s

      application_name: 'khayal-serverless'
    });

    pool.on('error', (err) => {
      console.error('[db] خطأ اتصال خامل:', err.message);
    });

    pool.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[db] اتصال جديد — إجمالي:', pool.totalCount);
      }
    });

    pool.on('remove', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[db] اتصال مُغلق — إجمالي:', pool.totalCount);
      }
    });

    globalThis[POOL_KEY] = pool;
  }
  return globalThis[POOL_KEY];
}

export const pool = getPool();

/* ═══════════════════════════════════════════════
   إعادة المحاولة الذكية
   ─────────────────────────────────────────────
   ⭐ يعالج خطأ "remaining connection slots"
   ⭐ يعالج timeout والمشاكل العابرة
   ═══════════════════════════════════════════════ */

const TRANSIENT_PATTERNS = [
  'ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ECONNREFUSED',
  'socket hang up', 'Connection terminated',
  'connect timeout', 'connection timeout',
  'server closed', 'terminating connection'
];

const CONNECTION_LIMIT_PATTERNS = [
  'remaining connection slots',
  'too many clients',
  'too many connections'
];

const isTransient = (err) =>
  TRANSIENT_PATTERNS.some((p) =>
    (err?.message || '').toLowerCase().includes(p.toLowerCase()));

const isConnectionLimit = (err) =>
  CONNECTION_LIMIT_PATTERNS.some((p) =>
    (err?.message || '').toLowerCase().includes(p.toLowerCase()));

// ⭐ للاتصالات المحدودة: انتظر أطول قليلاً
const RETRY_DELAYS = [0, 200, 800, 2000, 4000];
const CONNECTION_LIMIT_DELAYS = [1000, 2000, 3000, 5000];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function query(sql, params = []) {
  let lastErr;
  let connectionAttempt = 0;

  for (let i = 0; i < RETRY_DELAYS.length; i++) {
    if (RETRY_DELAYS[i]) await sleep(RETRY_DELAYS[i]);

    try {
      return await pool.query(sql, params);
    } catch (err) {
      lastErr = err;

      // ⭐ إذا القاعدة مليئة بالاتصالات — انتظر ثم أعد المحاولة
      if (isConnectionLimit(err)) {
        if (connectionAttempt < CONNECTION_LIMIT_DELAYS.length) {
          const delay = CONNECTION_LIMIT_DELAYS[connectionAttempt++];
          console.warn(`[db] الاتصالات ممتلئة — انتظار ${delay}ms (محاولة ${connectionAttempt})`);
          await sleep(delay);
          i--; // كرّر نفس الفهرس
          continue;
        }
        console.error('[db] فشلت كل محاولات الاتصال');
        throw err;
      }

      // أخطاء عابرة — أعِد المحاولة
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
   Cache في الذاكرة
   ═══════════════════════════════════════════════ */

const CACHE_KEY = '__khayal_cache__';
function getCache() {
  if (!globalThis[CACHE_KEY]) globalThis[CACHE_KEY] = new Map();
  return globalThis[CACHE_KEY];
}

export function cacheGet(key) {
  const c = getCache();
  const hit = c.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) { c.delete(key); return null; }
  return hit.value;
}

export function cacheSet(key, value, ttlMs = 30000) {
  const c = getCache();
  c.set(key, { value, expires: Date.now() + ttlMs });
  if (c.size > 500) {
    const firstKey = c.keys().next().value;
    c.delete(firstKey);
  }
}

export function cacheClear(prefix = '') {
  const c = getCache();
  if (!prefix) return c.clear();
  for (const k of c.keys()) if (k.startsWith(prefix)) c.delete(k);
}

/* ═══════════════════════════════════════════════
   المخطط — كل الجداول
   ═══════════════════════════════════════════════ */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  username     TEXT UNIQUE NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  bio          TEXT DEFAULT '',
  avatar       TEXT DEFAULT '',
  verified     BOOLEAN DEFAULT FALSE,
  role         TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  joined       DATE DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS prompts (
  id           TEXT PRIMARY KEY,
  slug         TEXT UNIQUE,
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  body         TEXT NOT NULL,
  category     TEXT DEFAULT '',
  tags         TEXT[] DEFAULT '{}',
  models       TEXT[] DEFAULT '{}',
  cover        TEXT DEFAULT '',
  author_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  copies       INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prompts ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS models TEXT[] DEFAULT '{}';
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS cover TEXT DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_slug ON prompts(slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS likes (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id    TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, prompt_id)
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  token        TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS comments (
  id           TEXT PRIMARY KEY,
  prompt_id    TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  type         TEXT NOT NULL CHECK (type IN ('like', 'follow', 'comment')),
  prompt_id    TEXT REFERENCES prompts(id) ON DELETE CASCADE,
  comment_id   TEXT REFERENCES comments(id) ON DELETE CASCADE,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_author     ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created    ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_copies     ON prompts(copies DESC);
CREATE INDEX IF NOT EXISTS idx_likes_prompt       ON likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_likes_user         ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower   ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following  ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user      ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires   ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_verified     ON users(verified);
CREATE INDEX IF NOT EXISTS idx_comments_prompt    ON comments(prompt_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user      ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_user         ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_actor        ON notifications(actor_id);
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
    const { rows } = await pool.query('SELECT version() AS v');
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
    await globalThis[POOL_KEY].end().catch(() => {});
    delete globalThis[POOL_KEY];
    console.log('[db] أُغلق الـ pool');
  }
}

export default {
  pool, query, queryOne, queryAll, transaction,
  ensureSchema, healthCheck, closePool,
  cacheGet, cacheSet, cacheClear
};