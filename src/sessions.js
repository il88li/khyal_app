import crypto from 'node:crypto';
import { query, queryOne } from './db.js';

const SESSION_DAYS = 30;
const ADMIN_TOKEN_TTL_MS = 8 * 3600 * 1000; // 8 ساعات

export function generateToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export async function createSession(userId) {
  const token = generateToken();
  await query(
    `INSERT INTO sessions (token, user_id, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '${SESSION_DAYS} days')`,
    [token, userId]
  );
  return token;
}

export async function getUserId(token) {
  if (!token) return null;
  const row = await queryOne(
    `SELECT user_id FROM sessions
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );
  return row?.user_id || null;
}

export async function deleteSession(token) {
  if (!token) return;
  await query(`DELETE FROM sessions WHERE token = $1`, [token]);
}

export async function deleteAllSessions(userId, exceptToken = null) {
  if (!userId) return 0;
  if (exceptToken) {
    const r = await query(
      `DELETE FROM sessions WHERE user_id = $1 AND token <> $2`,
      [userId, exceptToken]
    );
    return r.rowCount;
  }
  const r = await query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
  return r.rowCount;
}

export async function countUserSessions(userId) {
  const row = await queryOne(
    `SELECT COUNT(*)::int AS n FROM sessions
     WHERE user_id = $1 AND expires_at > NOW()`,
    [userId]
  );
  return row?.n || 0;
}

export async function cleanupSessions() {
  try {
    const r = await query(`DELETE FROM sessions WHERE expires_at < NOW()`);
    return r.rowCount;
  } catch { return 0; }
}

/* ═══════════ Cookies (HttpOnly + CSRF) ═══════════ */

const COOKIE_MAX_AGE = SESSION_DAYS * 24 * 3600 * 1000;
const IS_PROD = () => process.env.NODE_ENV === 'production';

export function setAuthCookies(res, token) {
  const csrf = crypto.randomBytes(24).toString('base64url');

  res.cookie('kh_token', token, {
    httpOnly: true,
    secure: IS_PROD(),
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });
  res.cookie('kh_csrf', csrf, {
    httpOnly: false, // يقرأه JS لإرساله في الهيدر
    secure: IS_PROD(),
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('kh_token', { path: '/' });
  res.clearCookie('kh_csrf', { path: '/' });
}

/* ═══════════ توكن الإدارة — HMAC عشوائي بصلاحية ═══════════ */

export function signAdminToken() {
  const secret = process.env.ADMIN_PASSWORD || 'khayal-admin';
  const nonce = crypto.randomBytes(16).toString('hex');
  const expiry = Date.now() + ADMIN_TOKEN_TTL_MS;
  const payload = `${nonce}.${expiry}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [nonce, expiryStr, sig] = parts;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  const secret = process.env.ADMIN_PASSWORD || 'khayal-admin';
  const expected = crypto.createHmac('sha256', secret)
    .update(`${nonce}.${expiryStr}`)
    .digest('hex');

  if (sig.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(sig, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch { return false; }
}

/* ═══════════ مقارنة ثابتة الزمن ═══════════ */

export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}