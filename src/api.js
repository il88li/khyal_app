import { Router } from 'express';
import {
  ADMIN_PASSWORD, CATEGORIES, MODELS,
  findUser, findUserByEmail, createUser, updateUser,
  listPrompts, countPrompts, getPrompt, getRelated, createPrompt,
  updatePrompt, incrementCopies, deletePrompt, toggleLike, getUserLikes,
  userStats, publicUser, eligibility,
  adminStats, topPrompts, latestUsers, listUsers,
  toggleVerify, deleteUser, eligibleUsers,
  toggleFollow, isFollowing
} from './store.js';
import {
  createSession, getUserId, deleteSession,
  signAdminToken, verifyAdminToken, cleanupSessions
} from './sessions.js';
import { healthCheck, ensureSchema } from './db.js';

const api = Router();

/* ═══════════════════════════════════════════════
   تهيئة المخطط عند أول طلب
   ═══════════════════════════════════════════════ */
api.use(async (_req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (e) {
    res.status(503).json({ error: 'قاعدة البيانات غير مهيأة: ' + e.message });
  }
});

/* ═══════════════════════════════════════════════
   المصادقة — من قاعدة البيانات
   ═══════════════════════════════════════════════ */
api.use(async (req, _res, next) => {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  req.token = t;
  req.userId = t ? await getUserId(t) : null;
  next();
});

const requireAuth = (req, res, next) =>
  req.userId ? next() : res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });

const requireAdmin = (req, res, next) =>
  verifyAdminToken(req.headers['x-admin-token'])
    ? next()
    : res.status(401).json({ error: 'انتهت جلسة اللوحة، أعد الدخول' });

/* ═══════════════════════════════════════════════
   الصحة والبيانات الوصفية
   ═══════════════════════════════════════════════ */
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
    res.json({ categories: CATEGORIES, models: MODELS, stats });
  } catch (e) { next(e); }
});

/* ═══════════════════════════════════════════════
   المصادقة
   ═══════════════════════════════════════════════ */
api.post('/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, username } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' });
    if (password.length < 6)
      return res.status(400).json({ error: 'كلمة المرور يجب ألا تقل عن 6 أحرف' });
    if (await findUserByEmail(email))
      return res.status(409).json({ error: 'هذا البريد مسجّل مسبقاً' });

    const user = await createUser({ name, email, password, username });
    const token = await createSession(user.id);
    res.status(201).json({
      token,
      user: publicUser(user, await userStats(user.id))
    });
  } catch (e) { next(e); }
});

api.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await findUserByEmail(email);
    if (!user || user.password !== password)
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    const token = await createSession(user.id);
    cleanupSessions();
    res.json({
      token,
      user: publicUser(user, await userStats(user.id))
    });
  } catch (e) { next(e); }
});

api.post('/auth/logout', async (req, res, next) => {
  try {
    if (req.token) await deleteSession(req.token);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

api.get('/me', async (req, res, next) => {
  try {
    if (!req.userId) return res.json({ user: null });
    const u = await findUser(req.userId);
    if (!u) return res.json({ user: null });
    res.json({ user: publicUser(u, await userStats(u.id)) });
  } catch (e) { next(e); }
});

api.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, username, bio, avatar } = req.body || {};
    const patch = {};
    if (name !== undefined) patch.name = String(name).trim();
    if (username !== undefined) patch.username = String(username).trim();
    if (bio !== undefined) patch.bio = String(bio).trim();
    if (avatar !== undefined) patch.avatar = String(avatar);

    const updated = await updateUser(req.userId, patch);
    res.json({
      user: publicUser(updated, await userStats(updated.id))
    });
  } catch (e) { next(e); }
});

/* ═══════════════════════════════════════════════
   البرومبتات
   ═══════════════════════════════════════════════ */
api.get('/prompts', async (req, res, next) => {
  try {
    const { q = '', category = '', sort = 'new', author = '', limit = '60' } = req.query;
    const items = await listPrompts({
      q: String(q).trim(), category, sort, author,
      limit: Math.min(Number(limit) || 60, 200),
      viewerId: req.userId
    });
    const total = q || category || author
      ? await countPrompts({ q: String(q).trim(), category })
      : items.length;
    res.json({ items, total });
  } catch (e) { next(e); }
});

api.get('/prompts/:id', async (req, res, next) => {
  try {
    const prompt = await getPrompt(req.params.id, req.userId);
    if (!prompt) return res.status(404).json({ error: 'البرومبت غير موجود' });
    const related = await getRelated(prompt.id, prompt.category, req.userId);
    res.json({ prompt, related });
  } catch (e) { next(e); }
});

api.post('/prompts', requireAuth, async (req, res, next) => {
  try {
    const { title, description, body, category, tags = [], models = [], cover = '' } = req.body || {};
    if (!title || !body || !category)
      return res.status(400).json({ error: 'العنوان والنص والتصنيف مطلوبة' });
    const prompt = await createPrompt({
      title: String(title).trim(),
      description: String(description || '').trim(),
      body: String(body),
      category,
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
    if (!p) return res.status(404).json({ error: 'البرومبت غير موجود' });
    res.json(await toggleLike(req.userId, p.id));
  } catch (e) { next(e); }
});

api.post('/prompts/:id/copy', async (req, res, next) => {
  try {
    const p = await getPrompt(req.params.id, null);
    if (!p) return res.status(404).json({ error: 'البرومبت غير موجود' });
    res.json({ copies: await incrementCopies(p.id) });
  } catch (e) { next(e); }
});

/* ═══════════════════════════════════════════════
   المستخدمون
   ═══════════════════════════════════════════════ */
api.get('/users/:id', async (req, res, next) => {
  try {
    const u = await findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'المستخدم غير موجود' });
    const stats = await userStats(u.id);
    const prompts = await listPrompts({ author: u.id, viewerId: req.userId });
    const elig = await eligibility(u.id);
    const following = req.userId ? await isFollowing(req.userId, u.id) : false;
    res.json({
      user: publicUser(u, {
        ...stats,
        isSelf: u.id === req.userId,
        isFollowing: following
      }),
      prompts,
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
    const result = await toggleFollow(req.userId, req.params.id);
    res.json(result);
  } catch (e) { next(e); }
});

api.get('/favorites', requireAuth, async (req, res, next) => {
  try { res.json({ items: await getUserLikes(req.userId) }); }
  catch (e) { next(e); }
});

/* ═══════════════════════════════════════════════
   الإدارة
   ═══════════════════════════════════════════════ */
api.post('/admin/unlock', (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD)
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
    res.json({ stats, topPrompts: top, latestUsers: latestWithStats });
  } catch (e) { next(e); }
});

api.get('/admin/users', requireAdmin, async (_req, res, next) => {
  try { res.json({ items: await listUsers() }); }
  catch (e) { next(e); }
});

api.post('/admin/users/:id/verify', requireAdmin, async (req, res, next) => {
  try {
    const u = await toggleVerify(req.params.id);
    if (!u) return res.status(404).json({ error: 'المستخدم غير موجود' });
    res.json({ user: publicUser(u) });
  } catch (e) { next(e); }
});

api.delete('/admin/users/:id', requireAdmin, async (req, res, next) => {
  try { await deleteUser(req.params.id); res.json({ ok: true }); }
  catch (e) { next(e); }
});

api.get('/admin/prompts', requireAdmin, async (_req, res, next) => {
  try { res.json({ items: await listPrompts({ limit: 500 }) }); }
  catch (e) { next(e); }
});

api.delete('/admin/prompts/:id', requireAdmin, async (req, res, next) => {
  try { await deletePrompt(req.params.id); res.json({ ok: true }); }
  catch (e) { next(e); }
});

api.get('/admin/eligible', requireAdmin, async (_req, res, next) => {
  try { res.json({ items: await eligibleUsers() }); }
  catch (e) { next(e); }
});

export default api;