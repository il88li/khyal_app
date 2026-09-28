import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

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
    return { connectionString, ssl: { rejectUnauthorized: false } };
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

const POOL_KEY = '__khayal_pg_pool__';

function getPool() {
  if (!globalThis[POOL_KEY]) {
    console.log('[db] إنشاء pool جديد');
    const pool = new Pool({
      ...buildConfig(),
      max: Number(process.env.PG_POOL_MAX) || 5,
      min: 0,
      idleTimeoutMillis: 8000,
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

/* ═══════════ إعادة المحاولة للأخطاء العابرة ═══════════ */
const TRANSIENT_PATTERNS = [
  'ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'ECONNREFUSED',
  'socket hang up', 'Connection terminated',
  'connect timeout', 'connection timeout',
  'server closed', 'terminating connection'
];
const isTransient = (err) =>
  TRANSIENT_PATTERNS.some((p) =>
    (err?.message || '').toLowerCase().includes(p.toLowerCase()));

const RETRY_DELAYS = [0, 250, 800];
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

/* ═══════════ ذاكرة تخزين مؤقت (per-instance) ═══════════ */
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
  // حد أقصى 500 مدخل
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

/* ═══════════ المخطط ═══════════ */
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

CREATE INDEX IF NOT EXISTS idx_prompts_author     ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created    ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_copies     ON prompts(copies DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_tags       ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_likes_prompt       ON likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_likes_user         ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower   ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following  ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user      ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires   ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_verified     ON users(verified);
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
    await globalThis[POOL_KEY].end();
    delete globalThis[POOL_KEY];
    console.log('[db] أُغلق الـ pool');
  }
}

export default {
  pool, query, queryOne, queryAll, transaction,
  ensureSchema, healthCheck, closePool,
  cacheGet, cacheSet, cacheClear
};