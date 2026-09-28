import { query, queryOne, queryAll, transaction, cacheGet, cacheSet, cacheClear } from './db.js';

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'khayal-admin';

export const CATEGORIES = [
  'كتابة', 'برمجة', 'تصميم', 'تسويق',
  'تعليم', 'أعمال', 'تحليل بيانات', 'ترفيه'
];

export const MODELS = [
  'GPT-4o', 'GPT-4o mini', 'Claude 3.5 Sonnet', 'Claude 3 Opus',
  'Gemini 1.5 Pro', 'Llama 3.1 70B', 'Midjourney v6', 'DALL·E 3'
];

/* ═══════════ توليد slug من العربية ═══════════ */
const AR_MAP = {
  'ا':'a','أ':'a','إ':'i','آ':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh',
  'د':'d','ذ':'dh','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z',
  'ع':'a','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w',
  'ي':'y','ى':'a','ة':'a','ء':'','ؤ':'w','ئ':'y',
  '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'
};

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .split('').map((c) => AR_MAP[c] ?? c).join('')
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'prompt';
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base;
  let n = 1;
  while (true) {
    const q = excludeId
      ? `SELECT 1 FROM prompts WHERE slug = $1 AND id <> $2`
      : `SELECT 1 FROM prompts WHERE slug = $1`;
    const args = excludeId ? [slug, excludeId] : [slug];
    const exists = await queryOne(q, args);
    if (!exists) return slug;
    slug = `${base}-${++n}`;
  }
}

/* ═══════════ المستخدمون ═══════════ */
const USER_COLS = `id, name, username, email, bio, avatar, verified, role,
  joined::text AS joined, password`;

export const findUser = (id) =>
  queryOne(`SELECT ${USER_COLS} FROM users WHERE id = $1`, [id]);

export const findUserByEmail = (email) =>
  queryOne(`SELECT ${USER_COLS} FROM users WHERE email = $1`, [email]);

export async function createUser({ name, email, password, username }) {
  const id = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const uname = username || email.split('@')[0];
  return queryOne(
    `INSERT INTO users (id,name,username,email,password,bio,avatar,verified,role,joined)
     VALUES ($1,$2,$3,$4,$5,'','',FALSE,'user',CURRENT_DATE)
     RETURNING ${USER_COLS}`,
    [id, name, uname, email, password]
  );
}

export async function updateUser(id, patch) {
  const allowed = ['name', 'username', 'bio', 'avatar'];
  const fields = [];
  const params = [id];
  for (const k of allowed) {
    if (patch[k] !== undefined) {
      params.push(String(patch[k]));
      fields.push(`${k} = $${params.length}`);
    }
  }
  if (!fields.length) return findUser(id);
  return queryOne(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING ${USER_COLS}`,
    params
  );
}

/* ═══════════ البرومبتات ═══════════ */
const PROMPT_SELECT = `
  SELECT p.id, p.slug, p.title, p.description, p.body, p.category,
         p.tags, p.models, p.cover, p.author_id AS "authorId",
         p.copies, p.created_at AS "createdAt",
         (SELECT COUNT(*)::int FROM likes l WHERE l.prompt_id = p.id) AS likes,
         u.id AS "aId", u.name AS "aName", u.username AS "aUsername",
         u.verified AS "aVerified", u.avatar AS "aAvatar"
  FROM prompts p
  LEFT JOIN users u ON u.id = p.author_id
`;

function shapePrompt(row, likedSet) {
  if (!row) return null;
  return {
    id: row.id, slug: row.slug, title: row.title, description: row.description,
    body: row.body, category: row.category,
    tags: row.tags || [], models: row.models || [], cover: row.cover,
    authorId: row.authorId, copies: row.copies, createdAt: row.createdAt,
    likes: row.likes,
    liked: likedSet ? likedSet.has(row.id) : false,
    author: row.aId ? {
      id: row.aId, name: row.aName,
      username: row.aUsername, verified: row.aVerified,
      avatar: row.aAvatar || ''
    } : null
  };
}

export async function listPrompts({ q, sort = 'new', author, limit = 40, viewerId }) {
  const where = [];
  const params = [];

  if (q) {
    params.push(`%${q}%`);
    where.push(`(p.title ILIKE $1 OR p.description ILIKE $1 OR p.body ILIKE $1 OR EXISTS (SELECT 1 FROM unnest(p.tags) t WHERE t ILIKE $1))`);
  }
  if (author) { params.push(author); where.push(`p.author_id = $${params.length}`); }

  const order =
    sort === 'likes'  ? 'likes DESC, p.created_at DESC' :
    sort === 'copies' ? 'p.copies DESC, p.created_at DESC' :
                        'p.created_at DESC';

  params.push(limit);
  const sql = `${PROMPT_SELECT}
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY ${order}
    LIMIT $${params.length}`;

  const rows = await queryAll(sql, params);
  const likedSet = await getLikedSet(viewerId);
  return rows.map((r) => shapePrompt(r, likedSet));
}

export async function countPrompts() {
  const row = await queryOne(`SELECT COUNT(*)::int AS c FROM prompts`);
  return row.c;
}

export async function getPrompt(id, viewerId) {
  const row = await queryOne(`${PROMPT_SELECT} WHERE p.id = $1`, [id]);
  if (!row) return null;
  const likedSet = await getLikedSet(viewerId);
  return shapePrompt(row, likedSet);
}

/* يقبل id أو slug */
export async function getPromptByKey(key, viewerId) {
  if (!key) return null;
  const row = await queryOne(`${PROMPT_SELECT} WHERE p.id = $1 OR p.slug = $1`, [key]);
  if (!row) return null;
  const likedSet = await getLikedSet(viewerId);
  return shapePrompt(row, likedSet);
}

export async function getRelated(promptId, category, viewerId, limit = 3) {
  const rows = await queryAll(
    `${PROMPT_SELECT} WHERE p.id <> $1 AND (p.category = $2 OR $2 = '')
     ORDER BY (SELECT COUNT(*) FROM likes l WHERE l.prompt_id = p.id) DESC
     LIMIT $3`,
    [promptId, category, limit]
  );
  const likedSet = await getLikedSet(viewerId);
  return rows.map((r) => shapePrompt(r, likedSet));
}

export async function createPrompt(data) {
  const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const slug = await uniqueSlug(slugify(data.title));
  const row = await queryOne(
    `INSERT INTO prompts (id,slug,title,description,body,category,tags,models,cover,author_id,copies)
     VALUES ($1,$2,$3,$4,$5,$6,$7::text[],$8::text[],$9,$10,0)
     RETURNING id`,
    [id, slug, data.title, data.description || '', data.body, data.category || '',
     data.tags || [], data.models || [], data.cover || '', data.authorId]
  );
  cacheClear('home:');
  return getPrompt(row.id, data.authorId);
}

export async function updatePrompt(id, patch) {
  const allowed = ['title', 'description', 'body', 'category', 'tags', 'models', 'cover'];
  const fields = [];
  const params = [id];
  for (const k of allowed) {
    if (patch[k] !== undefined) {
      params.push(patch[k]);
      fields.push(`${k} = $${params.length}`);
    }
  }
  if (patch.title) {
    const newSlug = await uniqueSlug(slugify(patch.title), id);
    params.push(newSlug);
    fields.push(`slug = $${params.length}`);
  }
  if (!fields.length) return getPrompt(id, null);
  await query(`UPDATE prompts SET ${fields.join(', ')} WHERE id = $1`, params);
  cacheClear('home:');
  return getPrompt(id, null);
}

export async function incrementCopies(id) {
  const row = await queryOne(
    `UPDATE prompts SET copies = copies + 1 WHERE id = $1 RETURNING copies`,
    [id]
  );
  return row?.copies ?? 0;
}

export async function deletePrompt(id) {
  await query('DELETE FROM prompts WHERE id = $1', [id]);
  cacheClear('home:');
}

/* ═══════════ الإعجابات ═══════════ */
export async function toggleLike(userId, promptId) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      `SELECT 1 FROM likes WHERE user_id = $1 AND prompt_id = $2`,
      [userId, promptId]
    );
    if (rows.length) {
      await client.query(
        `DELETE FROM likes WHERE user_id = $1 AND prompt_id = $2`,
        [userId, promptId]
      );
    } else {
      await client.query(
        `INSERT INTO likes (user_id, prompt_id) VALUES ($1,$2)`,
        [userId, promptId]
      );
    }
    const { rows: c } = await client.query(
      `SELECT COUNT(*)::int AS n FROM likes WHERE prompt_id = $1`,
      [promptId]
    );
    return { liked: rows.length === 0, likes: c[0].n };
  });
}

async function getLikedSet(userId) {
  if (!userId) return new Set();
  const rows = await queryAll(
    `SELECT prompt_id FROM likes WHERE user_id = $1`,
    [userId]
  );
  return new Set(rows.map((r) => r.prompt_id));
}

export async function getUserLikes(userId) {
  const rows = await queryAll(
    `${PROMPT_SELECT}
     WHERE p.id IN (SELECT prompt_id FROM likes WHERE user_id = $1)
     ORDER BY p.created_at DESC`,
    [userId]
  );
  const likedSet = new Set(rows.map((r) => r.id));
  return rows.map((r) => shapePrompt(r, likedSet));
}

/* ═══════════ المتابعة ═══════════ */
export async function toggleFollow(followerId, followingId) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );
    if (rows.length) {
      await client.query(
        `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
        [followerId, followingId]
      );
      return { following: false };
    } else {
      await client.query(
        `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`,
        [followerId, followingId]
      );
      return { following: true };
    }
  });
}

export async function isFollowing(followerId, followingId) {
  if (!followerId || !followingId) return false;
  const row = await queryOne(
    `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId]
  );
  return !!row;
}

/* ═══════════ إحصائيات ═══════════ */
export async function userStats(userId) {
  return queryOne(
    `SELECT
       (SELECT COUNT(*)::int FROM prompts WHERE author_id = $1) AS "promptCount",
       (SELECT COUNT(*)::int FROM likes l
         JOIN prompts p ON p.id = l.prompt_id WHERE p.author_id = $1) AS "totalLikes",
       (SELECT COALESCE(SUM(copies),0)::int FROM prompts WHERE author_id = $1) AS "totalCopies",
       (SELECT COUNT(*)::int FROM follows WHERE following_id = $1) AS "followers",
       (SELECT COUNT(*)::int FROM follows WHERE follower_id = $1) AS "following"`,
    [userId]
  );
}

export function publicUser(u, extra = {}) {
  if (!u) return null;
  const { password, ...rest } = u;
  return { ...rest, ...extra };
}

/* ═══════════ التوثيق ═══════════ */
export const VERIFY_RULES = [
  { key: 'prompts', label: 'نشر 10 برومبتات على الأقل', target: 10 },
  { key: 'likes',   label: 'الحصول على 100 إعجاب',      target: 100 },
  { key: 'copies',  label: 'تجاوز 500 عملية نسخ',       target: 500 },
  { key: 'months',  label: 'عضوية لا تقل عن 3 أشهر',    target: 3 }
];

export async function eligibility(userId) {
  const u = await findUser(userId);
  if (!u) return null;
  const s = await userStats(userId);
  const months = Math.max(0, Math.floor(
    (Date.now() - new Date(u.joined).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ));
  const values = { ...s, months };
  const rules = VERIFY_RULES.map((r) => ({
    ...r, value: values[r.key] || 0,
    met: (values[r.key] || 0) >= r.target
  }));
  return {
    rules, values, verified: u.verified,
    eligible: rules.every((r) => r.met)
  };
}

/* ═══════════ الإدارة ═══════════ */
export async function adminStats() {
  const cached = cacheGet('admin:stats');
  if (cached) return cached;
  const row = await queryOne(`
    SELECT
      (SELECT COUNT(*)::int FROM users)              AS users,
      (SELECT COUNT(*)::int FROM prompts)            AS prompts,
      (SELECT COUNT(*)::int FROM likes)              AS likes,
      (SELECT COALESCE(SUM(copies),0)::int FROM prompts) AS copies
  `);
  cacheSet('admin:stats', row, 20000);
  return row;
}

export async function topPrompts(limit = 5, viewerId = null) {
  const rows = await queryAll(
    `${PROMPT_SELECT}
     ORDER BY (SELECT COUNT(*) FROM likes l WHERE l.prompt_id = p.id) DESC
     LIMIT $1`,
    [limit]
  );
  return rows.map((r) => shapePrompt(r, null));
}

export async function latestUsers(limit = 5) {
  return queryAll(
    `SELECT ${USER_COLS} FROM users ORDER BY joined DESC LIMIT $1`,
    [limit]
  );
}

export async function listUsers() {
  return queryAll(`
    SELECT u.id, u.name, u.username, u.email, u.bio, u.avatar,
           u.verified, u.role, u.joined::text AS joined,
           (SELECT COUNT(*)::int FROM prompts WHERE author_id = u.id) AS "promptCount",
           (SELECT COUNT(*)::int FROM likes l JOIN prompts p ON p.id = l.prompt_id
             WHERE p.author_id = u.id) AS "totalLikes"
    FROM users u
    ORDER BY u.joined DESC
  `);
}

export async function toggleVerify(userId) {
  cacheClear('admin:');
  return queryOne(
    `UPDATE users SET verified = NOT verified WHERE id = $1
     RETURNING id, name, username, email, bio, avatar, verified, role,
               joined::text AS joined`,
    [userId]
  );
}

export async function deleteUser(id) {
  cacheClear('admin:');
  await query('DELETE FROM users WHERE id = $1', [id]);
}

export async function eligibleUsers() {
  const users = await queryAll(`
    SELECT u.id, u.name, u.username, u.verified, u.joined::text AS joined,
           (SELECT COUNT(*)::int FROM prompts WHERE author_id = u.id) AS "promptCount",
           (SELECT COUNT(*)::int FROM likes l JOIN prompts p ON p.id = l.prompt_id
             WHERE p.author_id = u.id) AS "totalLikes"
    FROM users u WHERE u.verified = FALSE
  `);
  const out = [];
  for (const u of users) {
    const e = await eligibility(u.id);
    if (e?.eligible) out.push({ user: publicUser(u), eligibility: e });
  }
  return out;
}