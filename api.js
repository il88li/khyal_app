import { Router } from 'express';
import {
  db, ADMIN_PASSWORD, CATEGORIES, MODELS, uid, token,
  findUser, findPrompt, likesCount, isLiked,
  publicUser, promptView, eligibility
} from './store.js';

const api = Router();

/* ─────────── وسيط المصادقة ─────────── */
function auth(req, _res, next) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  req.userId = t ? db.sessions.get(t) || null : null;
  next();
}
api.use(auth);

function requireAuth(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });
  next();
}

function requireAdmin(req, res, next) {
  const t = req.headers['x-admin-token'];
  if (!t || !db.adminTokens.has(t)) {
    return res.status(401).json({ error: 'انتهت جلسة اللوحة، أعد الدخول' });
  }
  next();
}

/* ─────────── البيانات الوصفية ─────────── */
api.get('/meta', (_req, res) => {
  res.json({
    categories: CATEGORIES,
    models: MODELS,
    stats: {
      users: db.users.length,
      prompts: db.prompts.length,
      likes: db.likes.length,
      copies: db.prompts.reduce((s, p) => s + p.copies, 0)
    }
  });
});

/* ─────────── المصادقة ─────────── */
api.post('/auth/register', (req, res) => {
  const { name, email, password, username } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور يجب ألا تقل عن 6 أحرف' });
  }
  if (db.users.some((u) => u.email === email)) {
    return res.status(409).json({ error: 'هذا البريد مسجّل مسبقاً' });
  }
  const user = {
    id: uid('u'), name, email, password,
    username: username || email.split('@')[0],
    bio: '', verified: false, role: 'user',
    joined: new Date().toISOString().slice(0, 10)
  };
  db.users.push(user);
  const t = token();
  db.sessions.set(t, user.id);
  res.status(201).json({ token: t, user: publicUser(user, user.id) });
});

api.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find((u) => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
  }
  const t = token();
  db.sessions.set(t, user.id);
  res.json({ token: t, user: publicUser(user, user.id) });
});

api.post('/auth/logout', (req, res) => {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) db.sessions.delete(h.slice(7));
  res.json({ ok: true });
});

api.get('/me', (req, res) => {
  if (!req.userId) return res.json({ user: null });
  res.json({ user: publicUser(findUser(req.userId), req.userId) });
});

/* ─────────── البرومبتات ─────────── */
api.get('/prompts', (req, res) => {
  const { q = '', category = '', sort = 'new', author = '', limit = '60' } = req.query;
  const term = String(q).trim().toLowerCase();

  let items = db.prompts.map((p) => promptView(p, req.userId));

  if (term) {
    items = items.filter((p) =>
      [p.title, p.description, p.category, p.body, ...(p.tags || [])]
        .join(' ').toLowerCase().includes(term)
    );
  }
  if (category) items = items.filter((p) => p.category === category);
  if (author) items = items.filter((p) => p.authorId === author);

  if (sort === 'likes') items.sort((a, b) => b.likes - a.likes);
  else if (sort === 'copies') items.sort((a, b) => b.copies - a.copies);
  else items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ items: items.slice(0, Number(limit) || 60), total: items.length });
});

api.get('/prompts/:id', (req, res) => {
  const p = findPrompt(req.params.id);
  if (!p) return res.status(404).json({ error: 'البرومبت غير موجود' });
  const view = promptView(p, req.userId);

  const related = db.prompts
    .filter((x) => x.id !== p.id && x.category === p.category)
    .slice(0, 3)
    .map((x) => promptView(x, req.userId));

  res.json({ prompt: view, related });
});

api.post('/prompts', requireAuth, (req, res) => {
  const { title, description, body, category, tags = [], models = [], cover = '' } = req.body || {};
  if (!title || !body || !category) {
    return res.status(400).json({ error: 'العنوان والنص والتصنيف مطلوبة' });
  }
  const prompt = {
    id: uid('p'),
    title: String(title).trim(),
    description: String(description || '').trim(),
    body: String(body),
    category,
    tags: Array.isArray(tags) ? tags.filter(Boolean).slice(0, 8) : [],
    models: Array.isArray(models) ? models.slice(0, 6) : [],
    authorId: req.userId,
    cover,
    copies: 0,
    createdAt: new Date().toISOString()
  };
  db.prompts.push(prompt);
  res.status(201).json({ prompt: promptView(prompt, req.userId) });
});

api.post('/prompts/:id/like', requireAuth, (req, res) => {
  const p = findPrompt(req.params.id);
  if (!p) return res.status(404).json({ error: 'البرومبت غير موجود' });
  const i = db.likes.findIndex((l) => l.userId === req.userId && l.promptId === p.id);
  if (i >= 0) db.likes.splice(i, 1);
  else db.likes.push({ userId: req.userId, promptId: p.id });
  res.json({ liked: isLiked(req.userId, p.id), likes: likesCount(p.id) });
});

api.post('/prompts/:id/copy', (req, res) => {
  const p = findPrompt(req.params.id);
  if (!p) return res.status(404).json({ error: 'البرومبت غير موجود' });
  p.copies += 1;
  res.json({ copies: p.copies });
});

/* ─────────── المستخدمون والتفضيلات ─────────── */
api.get('/users/:id', (req, res) => {
  const u = findUser(req.params.id);
  if (!u) return res.status(404).json({ error: 'المستخدم غير موجود' });
  const prompts = db.prompts
    .filter((p) => p.authorId === u.id)
    .map((p) => promptView(p, req.userId));
  res.json({
    user: publicUser(u, req.userId),
    prompts,
    eligibility: eligibility(u.id)
  });
});

api.get('/favorites', requireAuth, (req, res) => {
  const ids = db.likes.filter((l) => l.userId === req.userId).map((l) => l.promptId);
  const items = db.prompts
    .filter((p) => ids.includes(p.id))
    .map((p) => promptView(p, req.userId));
  res.json({ items });
});

/* ─────────── لوحة الإدارة ─────────── */
api.post('/admin/unlock', (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
  }
  const t = token();
  db.adminTokens.add(t);
  res.json({ token: t });
});

api.get('/admin/overview', requireAdmin, (_req, res) => {
  const topPrompts = db.prompts
    .map((p) => promptView(p, null))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);
  const latestUsers = [...db.users]
    .sort((a, b) => new Date(b.joined) - new Date(a.joined))
    .slice(0, 5)
    .map((u) => publicUser(u, null));
  res.json({
    stats: {
      users: db.users.length,
      prompts: db.prompts.length,
      likes: db.likes.length,
      copies: db.prompts.reduce((s, p) => s + p.copies, 0)
    },
    topPrompts,
    latestUsers
  });
});

api.get('/admin/users', requireAdmin, (_req, res) => {
  res.json({
    items: db.users.map((u) => publicUser(u, null))
  });
});

api.post('/admin/users/:id/verify', requireAdmin, (req, res) => {
  const u = findUser(req.params.id);
  if (!u) return res.status(404).json({ error: 'المستخدم غير موجود' });
  u.verified = !u.verified;
  res.json({ user: publicUser(u, null) });
});

api.delete('/admin/users/:id', requireAdmin, (req, res) => {
  const i = db.users.findIndex((u) => u.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'المستخدم غير موجود' });
  db.users.splice(i, 1);
  db.prompts = db.prompts.filter((p) => p.authorId !== req.params.id);
  res.json({ ok: true });
});

api.get('/admin/prompts', requireAdmin, (_req, res) => {
  res.json({ items: db.prompts.map((p) => promptView(p, null)) });
});

api.delete('/admin/prompts/:id', requireAdmin, (req, res) => {
  const i = db.prompts.findIndex((p) => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'البرومبت غير موجود' });
  db.prompts.splice(i, 1);
  res.json({ ok: true });
});

api.get('/admin/eligible', requireAdmin, (_req, res) => {
  const items = db.users
    .filter((u) => !u.verified)
    .map((u) => ({ user: publicUser(u, null), eligibility: eligibility(u.id) }))
    .filter((x) => x.eligibility.eligible);
  res.json({ items });
});

export default api;