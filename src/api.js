import { Router } from 'express';
import crypto from 'node:crypto';
import {
  ADMIN_PASSWORD, CATEGORIES, MODELS,
  findUser, findUserByEmail, findUserByUsername, createUser, updateUser, updateUserPassword,
  verifyPassword, isHashed,
  listPrompts, countPrompts, getPrompt, getPromptByKey, getRelated,
  createPrompt, updatePrompt, incrementCopies, deletePrompt,
  findDuplicatePrompt,
  toggleLike, getUserLikes,
  userStats, publicUser, eligibility,
  adminStats, topPrompts, latestUsers, listUsers,
  toggleVerify, deleteUser, eligibleUsers,
  toggleFollow, isFollowing,
  getFollowers, getFollowing,
  revokeOtherSessions,
  listComments, countComments, createComment, updateComment, deleteComment, findComment,
  listNotifications, unreadNotificationsCount, markNotificationRead, markAllNotificationsRead
} from './store.js';
import {
  createSession, getUserId, deleteSession,
  signAdminToken, verifyAdminToken, cleanupSessions,
  deleteAllSessions, countUserSessions,
  setAuthCookies, clearAuthCookies, safeEqual
} from './sessions.js';
import { healthCheck, ensureSchema, queryOne, query } from './db.js';

const api = Router();

/* ═══════════ ETag + Cache ═══════════ */
api.use((req, res, next) => {
  res.setHeader('Vary', 'Accept-Encoding, Authorization, Cookie');

  const originalJson = res.json.bind(res);
  res.json = function (data) {
    if (req.method === 'GET' && res.statusCode === 200) {
      const body = JSON.stringify(data);
      const etag = '"' + crypto.createHash('md5').update(body).digest('hex').slice(0, 16) + '"';
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return res;
      }
      res.setHeader('ETag', etag);
    }
    return originalJson(data);
  };
  next();
});

/* ═══════════ CSRF — طلبات التعديل فقط ═══════════ */
api.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.headers.authorization?.startsWith('Bearer ')) return next();
  if (/^\/auth\/(register|login)$/.test(req.path)) return next();
  if (req.path.startsWith('/cron/')) return next();

  const header = req.headers['x-csrf-token'];
  const cookie = req.cookies?.kh_csrf;
  if (!header || !cookie || header !== cookie) {
    return res.status(403).json({ error: 'طلب غير مصرّح به' });
  }
  next();
});

/* ═══════════ IP ═══════════ */
function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.length) return real.trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/* ═══════════ Rate limiting ═══════════ */
const RL_KEY = '__khayal_rl__';
function rateLimit(key, max, windowMs) {
  if (!globalThis[RL_KEY]) globalThis[RL_KEY] = new Map();
  const store = globalThis[RL_KEY];
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  if (store.size > 5000) {
    for (const [k, v] of store) if (v.reset < now) store.delete(k);
  }
  return true;
}

/* ═══════════ تهيئة المخطط ═══════════ */
api.use(async (_req, res, next) => {
  try { await ensureSchema(); next(); }
  catch (e) { res.status(503).json({ error: 'قاعدة البيانات غير مهيأة: ' + e.message }); }
});

/* ═══════════ المصادقة — Cookie أو Bearer ═══════════ */
api.use(async (req, _res, next) => {
  const h = req.headers.authorization || '';
  const bearer = h.startsWith('Bearer ') ? h.slice(7) : null;
  const cookieToken = req.cookies?.kh_token;
  const t = bearer || cookieToken || null;
  req.token = t;
  req.authSource = bearer ? 'bearer' : (cookieToken ? 'cookie' : null);
  req.userId = t ? await getUserId(t) : null;
  next();
});

const requireAuth = (req, res, next) =>
  req.userId ? next() : res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });

const requireAdmin = (req, res, next) =>
  verifyAdminToken(req.headers['x-admin-token'])
    ? next()
    : res.status(401).json({ error: 'انتهت جلسة اللوحة' });

/* ═══════════ Cron ═══════════ */
const requireCron = (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: 'Cron غير مهيأ' });
  const auth = req.headers.authorization || '';
  if (!safeEqual(auth, `Bearer ${secret}`)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
};

api.get('/cron/cleanup-sessions', requireCron, async (_req, res, next) => {
  try {
    const n = await cleanupSessions();
    res.json({ ok: true, deleted: n });
  } catch (e) { next(e); }
});

api.get('/cron/cleanup-notifications', requireCron, async (_req, res, next) => {
  try {
    const r = await query(
      `DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '90 days'`
    );
    res.json({ ok: true, deleted: r.rowCount });
  } catch (e) { next(e); }
});

/* ═══════════ الصحة والميتا ═══════════ */
api.get('/health', async (_req, res) => {
  const db = await healthCheck();
  res.status(db.ok ? 200 : 503).json({
    app: 'khayal',
    env: process.env.VERCEL ? 'vercel' : 'local',
    uptime: Math.round(process.uptime()),
    db
  });
});

api.get('/meta', async (_req, res, next) => {
  try {
    const stats = await adminStats();
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    res.json({ categories: CATEGORIES, models: MODELS, stats });
  } catch (e) { next(e); }
});

/* ═══════════ المصادقة ═══════════ */
api.post('/auth/register', async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    if (!rateLimit('reg:' + ip, 5, 60000))
      return res.status(429).json({ error: 'محاولات كثيرة، انتظر قليلاً' });

    const { name, email, password, username } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' });
    if (password.length < 6)
      return res.status(400).json({ error: 'كلمة المرور 6 أحرف على الأقل' });

    const emailNorm = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm))
      return res.status(400).json({ error: 'البريد الإلكتروني غير صالح' });

    if (await findUserByEmail(emailNorm))
      return res.status(409).json({ error: 'هذا البريد مسجّل مسبقاً' });

    const uname = (username || emailNorm.split('@')[0]).trim();
    if (uname.length < 3)
      return res.status(400).json({ error: 'اسم المستخدم 3 أحرف على الأقل' });
    if (await findUserByUsername(uname))
      return res.status(409).json({ error: 'اسم المستخدم محجوز، جرّب غيره' });

    const user = await createUser({
      name: String(name).trim(), email: emailNorm, password, username: uname
    });
    const token = await createSession(user.id);
    setAuthCookies(res, token);
    res.status(201).json({
      token,
      user: publicUser(user, await userStats(user.id))
    });
  } catch (e) {
    if (e.code === '23505')
      return res.status(409).json({ error: 'البريد أو اسم المستخدم محجوز مسبقاً' });
    next(e);
  }
});

api.post('/auth/login', async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    if (!rateLimit('login:' + ip, 15, 60000))
      return res.status(429).json({ error: 'محاولات كثيرة، انتظر قليلاً' });

    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبان' });

    const emailNorm = String(email).trim().toLowerCase();
    const user = await findUserByEmail(emailNorm);
    if (!user) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

    const ok = await verifyPassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

    if (!isHashed(user.password)) {
      try { await updateUserPassword(user.id, password); } catch {}
    }

    const token = await createSession(user.id);
    setAuthCookies(res, token);
    cleanupSessions();
    res.json({ token, user: publicUser(user, await userStats(user.id)) });
  } catch (e) { next(e); }
});

api.post('/auth/logout', async (req, res, next) => {
  try {
    if (req.token) await deleteSession(req.token);
    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

api.post('/auth/logout-all', requireAuth, async (req, res, next) => {
  try {
    const count = await deleteAllSessions(req.userId, req.token);
    res.json({ ok: true, revoked: count });
  } catch (e) { next(e); }
});

api.get('/auth/sessions/count', requireAuth, async (req, res, next) => {
  try {
    const n = await countUserSessions(req.userId);
    res.json({ count: n });
  } catch (e) { next(e); }
});

api.get('/me', async (req, res, next) => {
  try {
    if (!req.userId) return res.json({ user: null });
    const u = await findUser(req.userId);
    if (!u) return res.json({ user: null });
    res.set('Cache-Control', 'private, no-store');
    res.json({ user: publicUser(u, await userStats(u.id)) });
  } catch (e) { next(e); }
});

api.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, username, bio, avatar } = req.body || {};
    const patch = {};
    if (name !== undefined) patch.name = String(name).trim().slice(0, 60);
    if (bio !== undefined) patch.bio = String(bio).trim().slice(0, 200);

    if (avatar !== undefined) {
      const a = String(avatar || '');
      if (a && !/^(https?:\/\/|data:image\/(png|jpe?g|webp|gif);base64,)/.test(a))
        return res.status(400).json({ error: 'صيغة صورة غير مدعومة' });
      if (a.length > 3_000_000)
        return res.status(413).json({ error: 'حجم الصورة كبير جداً' });
      patch.avatar = a;
    }

    if (username !== undefined) {
      const uname = String(username).trim();
      if (uname.length < 3)
        return res.status(400).json({ error: 'اسم المستخدم 3 أحرف على الأقل' });
      if (!/^[A-Za-z0-9_\u0600-\u06FF]{3,30}$/.test(uname))
        return res.status(400).json({ error: 'اسم المستخدم يحتوي رموزاً غير مسموحة' });
      const taken = await queryOne(
        `SELECT 1 FROM users WHERE username = $1 AND id <> $2`,
        [uname, req.userId]
      );
      if (taken)
        return res.status(409).json({ error: 'اسم المستخدم محجوز، جرّب غيره' });
      patch.username = uname;
    }

    const updated = await updateUser(req.userId, patch);
    res.json({ user: publicUser(updated, await userStats(updated.id)) });
  } catch (e) {
    if (e.code === '23505')
      return res.status(409).json({ error: 'اسم المستخدم محجوز، جرّب غيره' });
    next(e);
  }
});

api.patch('/auth/password', requireAuth, async (req, res, next) => {
  try {
    const { current, next: newPass } = req.body || {};
    if (!current || !newPass)
      return res.status(400).json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' });
    if (String(newPass).length < 6)
      return res.status(400).json({ error: 'كلمة المرور الجديدة 6 أحرف على الأقل' });

    const u = await findUser(req.userId);
    const ok = await verifyPassword(current, u.password);
    if (!ok) return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });

    await updateUserPassword(req.userId, newPass);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/* ═══════════ البرومبتات ═══════════ */
api.get('/prompts', async (req, res, next) => {
  try {
    const { q = '', sort = 'new', author = '', limit = '20', offset = '0' } = req.query;
    const result = await listPrompts({
      q: String(q).trim(), sort, author,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
      viewerId: req.userId
    });
    const total = q || author ? result.items.length : await countPrompts();

    const isDynamic = !!q || !!req.userId;
    res.set('Cache-Control', isDynamic
      ? 'private, max-age=15, stale-while-revalidate=30'
      : 'public, max-age=60, stale-while-revalidate=120'
    );

    res.json({
      items: result.items,
      hasMore: result.hasMore,
      offset: Number(offset) || 0,
      total
    });
  } catch (e) { next(e); }
});

api.get('/prompts/:key', async (req, res, next) => {
  try {
    const prompt = await getPromptByKey(req.params.key, req.userId);
    if (!prompt) return res.status(404).json({ error: 'البرومبت غير موجود' });
    const related = await getRelated(prompt.id, prompt.category, req.userId);

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json({ prompt, related });
  } catch (e) { next(e); }
});

api.post('/prompts', requireAuth, async (req, res, next) => {
  try {
    if (!rateLimit('create:' + req.userId, 10, 60000))
      return res.status(429).json({ error: 'أنت تنشر بسرعة كبيرة' });

    const { title, description, body, category, tags = [], models = [], cover = '' } = req.body || {};
    if (!title || !body)
      return res.status(400).json({ error: 'العنوان والنص مطلوبان' });
    if (String(body).length > 20000)
      return res.status(400).json({ error: 'النص طويل جداً (20,000 حرف كحد أقصى)' });
    if (String(cover).length > 3_000_000)
      return res.status(400).json({ error: 'حجم الصورة كبير جداً' });

    const cleanTitle = String(title).trim();
    const dup = await findDuplicatePrompt(req.userId, cleanTitle);
    if (dup) {
      return res.status(409).json({
        error: 'نشرت برومبتاً بنفس العنوان خلال آخر 24 ساعة',
        existingSlug: dup.slug
      });
    }

    const prompt = await createPrompt({
      title: cleanTitle,
      description: String(description || '').trim(),
      body: String(body),
      category: String(category || ''),
      tags: Array.isArray(tags) ? tags.filter(Boolean).slice(0, 8) : [],
      models: Array.isArray(models) ? models.slice(0, 6) : [],
      cover: String(cover || ''),
      authorId: req.userId
    });
    res.status(201).json({ prompt });
  } catch (e) { next(e); }
});

api.patch('/prompts/:id', requireAuth, async (req, res, next) => {
  try {
    const p = await getPrompt(req.params.id, req.userId);
    if (!p) return res.status(404).json({ error: 'البرومبت غير موجود' });
    if (p.authorId !== req.userId)
      return res.status(403).json({ error: 'لا تملك صلاحية التعديل' });

    const { title, description, body, category, tags, models, cover } = req.body || {};
    const updated = await updatePrompt(p.id, {
      title: title !== undefined ? String(title).trim() : undefined,
      description: description !== undefined ? String(description).trim() : undefined,
      body: body !== undefined ? String(body) : undefined,
      category: category !== undefined ? String(category) : undefined,
      tags: Array.isArray(tags) ? tags.filter(Boolean).slice(0, 8) : undefined,
      models: Array.isArray(models) ? models.slice(0, 6) : undefined,
      cover: cover !== undefined ? String(cover) : undefined
    });
    res.json({ prompt: updated });
  } catch (e) { next(e); }
});

api.delete('/prompts/:id', requireAuth, async (req, res, next) => {
  try {
    const p = await getPrompt(req.params.id, req.userId);
    if (!p) return res.status(404).json({ error: 'البرومبت غير موجود' });
    const user = await findUser(req.userId);
    if (p.authorId !== req.userId && user?.role !== 'admin')
      return res.status(403).json({ error: 'لا تملك صلاحية الحذف' });
    await deletePrompt(p.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

api.post('/prompts/:id/like', requireAuth, async (req, res, next) => {
  try {
    const p = await getPrompt(req.params.id, req.userId);
    if (!p) return res.status(404).json({ error: 'غير موجود' });
    res.json(await toggleLike(req.userId, p.id));
  } catch (e) { next(e); }
});

api.post('/prompts/:id/copy', async (req, res, next) => {
  try {
    const p = await getPrompt(req.params.id, null);
    if (!p) return res.status(404).json({ error: 'غير موجود' });
    res.json({ copies: await incrementCopies(p.id) });
  } catch (e) { next(e); }
});

/* ═══════════ التعليقات ═══════════ */
api.get('/prompts/:id/comments', async (req, res, next) => {
  try {
    const p = await getPrompt(req.params.id, req.userId);
    if (!p) return res.status(404).json({ error: 'البرومبت غير موجود' });
    const { items, hasMore } = await listComments(p.id, {
      limit: Number(req.query.limit) || 20,
      offset: Number(req.query.offset) || 0
    });
    const total = await countComments(p.id);

    res.set('Cache-Control', 'public, max-age=20, stale-while-revalidate=60');
    res.json({ items, hasMore, total });
  } catch (e) { next(e); }
});

api.post('/prompts/:id/comments', requireAuth, async (req, res, next) => {
  try {
    if (!rateLimit('comment:' + req.userId, 20, 60000))
      return res.status(429).json({ error: 'أنت تعلّق بسرعة كبيرة' });

    const p = await getPrompt(req.params.id, req.userId);
    if (!p) return res.status(404).json({ error: 'البرومبت غير موجود' });

    const body = String(req.body?.body || '').trim();
    if (!body) return res.status(400).json({ error: 'نص التعليق مطلوب' });
    if (body.length > 2000)
      return res.status(400).json({ error: 'التعليق طويل جداً (2000 حرف كحد أقصى)' });

    const comment = await createComment({
      promptId: p.id, userId: req.userId, body
    });
    res.status(201).json({ comment });
  } catch (e) { next(e); }
});

api.patch('/comments/:id', requireAuth, async (req, res, next) => {
  try {
    const c = await findComment(req.params.id);
    if (!c) return res.status(404).json({ error: 'التعليق غير موجود' });
    if (c.userId !== req.userId)
      return res.status(403).json({ error: 'لا تملك صلاحية التعديل' });

    const body = String(req.body?.body || '').trim();
    if (!body) return res.status(400).json({ error: 'نص التعليق مطلوب' });

    const comment = await updateComment(c.id, req.userId, body);
    res.json({ comment });
  } catch (e) { next(e); }
});

api.delete('/comments/:id', requireAuth, async (req, res, next) => {
  try {
    const c = await findComment(req.params.id);
    if (!c) return res.status(404).json({ error: 'التعليق غير موجود' });

    const user = await findUser(req.userId);
    const isAdmin = user?.role === 'admin';
    if (c.userId !== req.userId && !isAdmin)
      return res.status(403).json({ error: 'لا تملك صلاحية الحذف' });

    await deleteComment(c.id, c.userId);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/* ═══════════ الإشعارات ═══════════ */
api.get('/notifications', requireAuth, async (req, res, next) => {
  try {
    const { items, hasMore } = await listNotifications(req.userId, {
      limit: Number(req.query.limit) || 20,
      offset: Number(req.query.offset) || 0
    });
    const unread = await unreadNotificationsCount(req.userId);
    res.set('Cache-Control', 'private, no-store');
    res.json({ items, hasMore, unread });
  } catch (e) { next(e); }
});

api.get('/notifications/unread-count', requireAuth, async (req, res, next) => {
  try {
    const unread = await unreadNotificationsCount(req.userId);
    res.set('Cache-Control', 'private, no-store');
    res.json({ unread });
  } catch (e) { next(e); }
});

api.post('/notifications/:id/read', requireAuth, async (req, res, next) => {
  try {
    await markNotificationRead(req.params.id, req.userId);
    const unread = await unreadNotificationsCount(req.userId);
    res.json({ ok: true, unread });
  } catch (e) { next(e); }
});

api.post('/notifications/read-all', requireAuth, async (req, res, next) => {
  try {
    const n = await markAllNotificationsRead(req.userId);
    res.json({ ok: true, updated: n });
  } catch (e) { next(e); }
});

/* ═══════════ المستخدمون ═══════════ */
api.get('/users/:id', async (req, res, next) => {
  try {
    const u = await findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'المستخدم غير موجود' });
    const stats = await userStats(u.id);
    const promptsResult = await listPrompts({ author: u.id, viewerId: req.userId, limit: 50 });
    const elig = await eligibility(u.id);
    const following = req.userId ? await isFollowing(req.userId, u.id) : false;

    res.set('Cache-Control', req.userId
      ? 'private, max-age=20, stale-while-revalidate=60'
      : 'public, max-age=60, stale-while-revalidate=180'
    );

    res.json({
      user: publicUser(u, { ...stats, isSelf: u.id === req.userId, isFollowing: following }),
      prompts: promptsResult.items,
      eligibility: elig
    });
  } catch (e) { next(e); }
});

api.post('/users/:id/follow', requireAuth, async (req, res, next) => {
  try {
    if (req.params.id === req.userId)
      return res.status(400).json({ error: 'لا يمكنك متابعة نفسك' });
    const target = await findUser(req.params.id);
    if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json(await toggleFollow(req.userId, req.params.id));
  } catch (e) { next(e); }
});

api.get('/users/:id/followers', async (req, res, next) => {
  try {
    const u = await findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'المستخدم غير موجود' });
    const items = await getFollowers(u.id, {
      limit: Number(req.query.limit) || 50,
      offset: Number(req.query.offset) || 0
    });
    const stats = await userStats(u.id);
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=180');
    res.json({ items, total: stats.followers });
  } catch (e) { next(e); }
});

api.get('/users/:id/following', async (req, res, next) => {
  try {
    const u = await findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'المستخدم غير موجود' });
    const items = await getFollowing(u.id, {
      limit: Number(req.query.limit) || 50,
      offset: Number(req.query.offset) || 0
    });
    const stats = await userStats(u.id);
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=180');
    res.json({ items, total: stats.following });
  } catch (e) { next(e); }
});

api.get('/favorites', requireAuth, async (req, res, next) => {
  try {
    res.set('Cache-Control', 'private, no-store');
    res.json({ items: await getUserLikes(req.userId) });
  } catch (e) { next(e); }
});

/* ═══════════ الإدارة ═══════════ */
api.post('/admin/unlock', (req, res) => {
  const ip = getClientIp(req);
  if (!rateLimit('admin:' + ip, 5, 300000))
    return res.status(429).json({ error: 'محاولات كثيرة، انتظر 5 دقائق' });
  const { password } = req.body || {};
  if (!safeEqual(String(password || ''), ADMIN_PASSWORD))
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  res.json({ token: signAdminToken() });
});

api.get('/admin/overview', requireAdmin, async (_req, res, next) => {
  try {
    const [stats, top, latest] = await Promise.all([
      adminStats(), topPrompts(5), latestUsers(5)
    ]);
    const latestWithStats = await Promise.all(
      latest.map(async (u) => publicUser(u, await userStats(u.id)))
    );
    res.set('Cache-Control', 'private, no-store');
    res.json({ stats, topPrompts: top, latestUsers: latestWithStats });
  } catch (e) { next(e); }
});

api.get('/admin/users', requireAdmin, async (_req, res, next) => {
  try {
    res.set('Cache-Control', 'private, no-store');
    res.json({ items: await listUsers() });
  } catch (e) { next(e); }
});

api.post('/admin/users/:id/verify', requireAdmin, async (req, res, next) => {
  try {
    const u = await toggleVerify(req.params.id);
    if (!u) return res.status(404).json({ error: 'غير موجود' });
    res.json({ user: publicUser(u) });
  } catch (e) { next(e); }
});

api.delete('/admin/users/:id', requireAdmin, async (req, res, next) => {
  try { await deleteUser(req.params.id); res.json({ ok: true }); }
  catch (e) { next(e); }
});

api.get('/admin/prompts', requireAdmin, async (_req, res, next) => {
  try {
    res.set('Cache-Control', 'private, no-store');
    res.json({ items: (await listPrompts({ limit: 50 })).items });
  } catch (e) { next(e); }
});

api.delete('/admin/prompts/:id', requireAdmin, async (req, res, next) => {
  try { await deletePrompt(req.params.id); res.json({ ok: true }); }
  catch (e) { next(e); }
});

api.get('/admin/eligible', requireAdmin, async (_req, res, next) => {
  try {
    res.set('Cache-Control', 'private, no-store');
    res.json({ items: await eligibleUsers() });
  } catch (e) { next(e); }
});

export default api;