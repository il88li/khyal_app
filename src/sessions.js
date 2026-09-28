/* ═══════════════════════════════════════════════
   الجلسات مخزّنة في PostgreSQL
   ─────────────────────────────────────────────
   لماذا؟ Vercel Lambda بلا حالة (stateless) —
   الذاكرة لا تُشارَك بين الطلبات، لذا Map لن تعمل.
   ═══════════════════════════════════════════════ */

import crypto from 'node:crypto';
import { query, queryOne } from './db.js';

const SESSION_DAYS = 30;

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

/* تنظيف الجلسات المنتهية — fire-and-forget */
export async function cleanupSessions() {
  try {
    await query(`DELETE FROM sessions WHERE expires_at < NOW()`);
  } catch { /* تجاهل */ }
}

/* ═══════════════════════════════════════════════
   توكن الإدارة — HMAC بسيط بلا تخزين
   ─────────────────────────────────────────────
   كل خادم يمكنه التحقق من التوكن بنفسه،
   لا حاجة لتخزين مشترك.
   ═══════════════════════════════════════════════ */

export function signAdminToken() {
  const secret = process.env.ADMIN_PASSWORD || 'khayal-admin';
  return crypto.createHmac('sha256', secret)
    .update('khayal-admin-session-v1')
    .digest('hex');
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const expected = signAdminToken();
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}
