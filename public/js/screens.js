import {
  skeletonGrid, skeletonProfile, skeletonPromptDetail,
  skeletonAdminTab, skeletonSectionHead
} from './skeleton.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n = 0) => (n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n));
const initials = (name = '') =>
  String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('');

function timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return 'اليوم';
  if (d === 1) return 'أمس';
  if (d < 30) return `قبل ${d} يوماً`;
  const m = Math.floor(d / 30);
  if (m < 12) return `قبل ${m} ${m === 1 ? 'شهر' : 'أشهر'}`;
  const y = Math.floor(m / 12);
  return `قبل ${y} ${y === 1 ? 'سنة' : 'سنوات'}`;
}

const avatar = (u, size = 32) => {
  const inner = u?.avatar
    ? `<img src="${esc(u.avatar)}" alt="">`
    : esc(initials(u?.name || '؟'));
  return `<span class="avatar ${u?.verified ? 'verified' : ''}" style="--s:${size}px">${inner}</span>`;
};

const VCHECK = `<span class="verify-check" title="موثّق">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9 17.5 20 6.5"/></svg>
</span>`;

const ICON = {
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/></svg>`,
  heartFill: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.2 10.7 19C5.4 14.4 2 11.5 2 7.9 2 5 4.2 3 7 3c1.6 0 3.1.7 4 1.9C12 3.7 13.5 3 15.1 3 17.9 3 20 5 20 7.9c0 3.6-3.4 6.5-8.7 11.1Z"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>`,
  empty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"/><path d="M12 12v8M4 8.5 12 12l8-3.5"/></svg>`,
  wifiOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.8a10 10 0 0 1 3-1.9M16 10.9a10 10 0 0 1 3 1.9M2 9.2A15 15 0 0 1 8 6.1M16 6.1a15 15 0 0 1 6 3.1"/><circle cx="12" cy="20" r=".6" fill="currentColor"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16v4ZM14 6l4 4"/></svg>`
};

function promptCard(p, idx = 0) {
  const mark = (p.category || 'خ').charAt(0);
  const excerpt = p.description || p.body.replace(/\s+/g, ' ').slice(0, 80);
  return `
  <article class="prompt-card" data-prompt="${p.id}">
    <div class="cover">
      ${p.cover
        ? `<img src="${esc(p.cover)}" alt="" loading="lazy">`
        : `<span class="cover-mark">${esc(mark)}</span>`}
      <span class="cover-idx">#${String(idx + 1).padStart(3, '0')}</span>
    </div>
    <div class="pc-body">
      <span class="pc-cat">${esc(p.category)}</span>
      <h3 class="pc-title">${esc(p.title)}</h3>
      ${excerpt ? `<p style="font-size:12px;color:var(--slate);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:8px">${esc(excerpt)}</p>` : ''}
      <div class="pc-tags">
        ${(p.tags || []).slice(0, 2).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
      </div>
    </div>
    <footer class="pc-foot">
      <span class="pc-author">
        ${avatar(p.author, 20)}
        <span class="name">${esc(p.author?.name || 'مجهول')}</span>
      </span>
      <span class="pc-stats">
        <span>${ICON.heart} ${fmt(p.likes)}</span>
        <span>${ICON.copy} ${fmt(p.copies)}</span>
      </span>
    </footer>
  </article>`;
}

const grid = (items) => `<div class="grid-cards">${items.map((p, i) => promptCard(p, i)).join('')}</div>`;

function bindCards(root, ctx) {
  root.querySelectorAll('[data-prompt]').forEach((el) => {
    el.addEventListener('click', () => ctx.navigate('#/prompt/' + el.dataset.prompt));
  });
}

const emptyState = (icon, title, text, action = '') => `
  <div class="state">
    <div class="icon">${icon}</div>
    <h3>${title}</h3>
    <p>${text}</p>
    ${action}
  </div>`;

const sectionHead = (index, label, title, sub = '') => `
  <div class="section-head">
    <div class="eyebrow"><span class="dot"></span>${index} / ${label}</div>
    <h2 class="section-title">${title}</h2>
    ${sub ? `<p class="section-sub">${sub}</p>` : ''}
  </div>`;

/* ══════════ 1 — الدخول ══════════ */
async function login(root, ctx) {
  if (ctx.state.user) return ctx.navigate('#/');

  root.innerHTML = `
  <div style="max-width:420px;margin:56px auto">
    <div style="text-align:center;margin-bottom:28px">
      <h1 class="section-title" style="font-size:26px">مرحباً بعودتك</h1>
      <p class="section-sub">سجّل دخولك لمتابعة برومبتاتك المفضلة</p>
    </div>
    <form class="card card-white card-lg" id="login-form" style="box-shadow:var(--shadow-card)">
      <div class="stack gap-16">
        <div class="field">
          <label class="label" for="email">البريد الإلكتروني</label>
          <input class="input" id="email" type="email" dir="ltr" placeholder="you@example.com" autocomplete="email" required>
        </div>
        <div class="field">
          <label class="label" for="password">كلمة المرور</label>
          <input class="input" id="password" type="password" dir="ltr" placeholder="••••••••" autocomplete="current-password" required>
        </div>
        <p class="err-text" id="login-err" hidden></p>
        <button class="btn btn-primary btn-block" type="submit" id="login-btn">دخول</button>
      </div>
    </form>
    <p style="text-align:center;margin-top:18px;font-size:14px;color:var(--slate)">
      ليس لديك حساب؟ <a href="#/register" style="color:var(--orange);font-weight:500">أنشئ حساباً جديداً</a>
    </p>
    <div class="lock-note" style="text-align:center">حساب تجريبي: sara@khayal.app / 123456</div>
  </div>`;

  const form = root.querySelector('#login-form');
  const err = root.querySelector('#login-err');
  const btn = root.querySelector('#login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true; btn.disabled = true; btn.textContent = 'جارٍ الدخول…';
    try {
      const { token, user } = await ctx.api('/auth/login', {
        method: 'POST',
        body: { email: form.email.value.trim(), password: form.password.value }
      });
      ctx.setToken(token);
      ctx.state.user = user;
      ctx.toast('تم تسجيل الدخول');
      ctx.navigate('#/');
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'دخول';
    }
  });
}

/* ══════════ 2 — إنشاء حساب ══════════ */
async function register(root, ctx) {
  if (ctx.state.user) return ctx.navigate('#/');

  root.innerHTML = `
  <div style="max-width:420px;margin:56px auto">
    <div style="text-align:center;margin-bottom:28px">
      <h1 class="section-title" style="font-size:26px">انضم إلى خيال</h1>
      <p class="section-sub">شارك برومبتاتك مع مجتمع عربي متنامٍ</p>
    </div>
    <form class="card card-white card-lg" id="reg-form" style="box-shadow:var(--shadow-card)">
      <div class="stack gap-16">
        <div class="field">
          <label class="label" for="name">الاسم الكامل</label>
          <input class="input" id="name" placeholder="مثال: سارة الشمري" required>
        </div>
        <div class="field">
          <label class="label" for="username">اسم المستخدم <span class="opt">(اختياري)</span></label>
          <input class="input" id="username" dir="ltr" placeholder="sara">
        </div>
        <div class="field">
          <label class="label" for="email">البريد الإلكتروني</label>
          <input class="input" id="email" type="email" dir="ltr" placeholder="you@example.com" required>
        </div>
        <div class="field">
          <label class="label" for="password">كلمة المرور</label>
          <input class="input" id="password" type="password" dir="ltr" placeholder="6 أحرف على الأقل" required>
        </div>
        <p class="err-text" id="reg-err" hidden></p>
        <button class="btn btn-primary btn-block" type="submit" id="reg-btn">إنشاء الحساب</button>
      </div>
    </form>
    <p style="text-align:center;margin-top:18px;font-size:14px;color:var(--slate)">
      لديك حساب بالفعل؟ <a href="#/login" style="color:var(--orange);font-weight:500">سجّل الدخول</a>
    </p>
  </div>`;

  const form = root.querySelector('#reg-form');
  const err = root.querySelector('#reg-err');
  const btn = root.querySelector('#reg-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true; btn.disabled = true; btn.textContent = 'جارٍ الإنشاء…';
    try {
      const { token, user } = await ctx.api('/auth/register', {
        method: 'POST',
        body: {
          name: form.name.value.trim(),
          username: form.username.value.trim(),
          email: form.email.value.trim(),
          password: form.password.value
        }
      });
      ctx.setToken(token);
      ctx.state.user = user;
      ctx.toast('تم إنشاء حسابك، أهلاً بك');
      ctx.navigate('#/');
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'إنشاء الحساب';
    }
  });
}

/* ══════════ 3 — الرئيسية ══════════ */
async function home(root, ctx) {
  const features = [
    { icon: ICON.search, t: 'اكتشاف سريع', d: 'ابحث بين آلاف البرومبتات العربية المصنّفة والمجرّبة.' },
    { icon: ICON.layers, t: 'نماذج متعددة', d: 'كل برومبت يوضّح النماذج المتوافقة معه من GPT وClaude وGemini.' },
    { icon: ICON.shield, t: 'مبدعون موثّقون', d: 'شارة التوثيق تُمنح لمن يثبت جودة ما ينشره باستمرار.' },
    { icon: ICON.bolt, t: 'نسخ بضغطة', d: 'انسخ نص البرومبت كاملاً وجاهزاً للاستخدام مباشرة.' }
  ];

  root.innerHTML = `
  <section class="hero">
    <div class="grid-bg"></div>
    <div class="hero-badge"><span class="badge">جديد · 12 برومبتاً هذا الشهر</span></div>
    <h1>برومبتات عربية <span class="hl">مكتوبة بإتقان</span> لأدوات الذكاء الاصطناعي</h1>
    <p class="hero-sub">خيال مكتبة مفتوحة لمشاركة أوامر الذكاء الاصطناعي بالعربية — اكتشف، انسخ، وانشر ما ينجح معك.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#/explore">استكشف البرومبتات</a>
      <a class="btn btn-outline" href="#/new">شارك برومبتك</a>
    </div>
    <form class="searchbar" id="hero-search">
      <input id="hero-q" placeholder="ابحث عن برومبت…" autocomplete="off">
      <div class="chips">
        <button type="button" class="chip active" data-cat="">الكل</button>
        <button type="button" class="chip" data-cat="كتابة">كتابة</button>
        <button type="button" class="chip" data-cat="برمجة">برمجة</button>
        <button type="button" class="chip" data-cat="تصميم">تصميم</button>
      </div>
      <button class="go" type="submit" aria-label="ابحث">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
      </button>
    </form>
  </section>

  <section class="section">
    ${sectionHead('01', 'لماذا خيال', 'أربع مزايا تجعل المشاركة <span class="hl">مجدية</span>')}
    <div class="features">
      ${features.map((f) => `
        <div class="feature">
          <div class="ic">${f.icon}</div>
          <h3>${f.t}</h3>
          <p>${f.d}</p>
        </div>`).join('')}
    </div>
  </section>

  <section class="section">
    <div class="head-row">
      <div>
        <div class="eyebrow"><span class="dot"></span>02 / وصل حديثاً</div>
        <h2 class="section-title">أحدث البرومبتات</h2>
      </div>
      <a class="btn btn-ghost btn-sm" href="#/explore?sort=new">عرض الكل ←</a>
    </div>
    <div id="home-latest">${skeletonGrid(6)}</div>
  </section>

  <section class="section">
    <div class="card card-lg" style="text-align:center;background:var(--vellum)">
      <h2 class="section-title" style="font-size:26px">لديك برومبت يعمل جيداً؟</h2>
      <p class="section-sub" style="max-width:44ch;margin:8px auto 20px">شاركه مع المجتمع وساهم في رفع جودة المحتوى العربي.</p>
      <a class="btn btn-primary" href="#/new">انشر برومبتاً</a>
    </div>
  </section>`;

  const form = root.querySelector('#hero-search');
  let cat = '';
  root.querySelectorAll('.chip[data-cat]').forEach((chip) => {
    chip.addEventListener('click', () => {
      root.querySelectorAll('.chip[data-cat]').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      cat = chip.dataset.cat;
    });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = root.querySelector('#hero-q').value.trim();
    ctx.navigate(`#/explore?q=${encodeURIComponent(q)}&cat=${encodeURIComponent(cat)}`);
  });

  try {
    const latest = await ctx.api('/prompts?sort=new&limit=6');
    const el = root.querySelector('#home-latest');
    el.innerHTML = latest.items.length
      ? grid(latest.items)
      : emptyState(ICON.empty, 'لا توجد برومبتات بعد', 'كن أول من ينشر.');
    bindCards(root, ctx);
  } catch (e) {
    root.querySelector('#home-latest').innerHTML =
      emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ══════════ 4 — الاستكشاف ══════════ */
async function explore(root, ctx) {
  const q = ctx.params.q || '';
  const cat = ctx.params.cat || '';
  const sort = ctx.params.sort || 'new';
  const cats = ctx.state.meta.categories || [];

  const sortOptions = [['new', 'الأحدث'], ['likes', 'الأعلى إعجاباً'], ['copies', 'الأكثر نسخاً']];

  root.innerHTML = `
  <div class="section" style="margin-top:20px">
    <div class="head-row">
      <div>
        <div class="eyebrow"><span class="dot"></span>03 / الاستكشاف</div>
        <h2 class="section-title">تصفّح <span class="hl">المكتبة</span></h2>
      </div>
      <span class="tag mono" id="result-count">…</span>
    </div>
  </div>

  <div class="filter-bar">
    <div class="searchbar" style="max-width:100%;box-shadow:none;margin:0">
      <input id="x-q" value="${esc(q)}" placeholder="ابحث بالعنوان أو الوسم…" autocomplete="off">
      <button class="go" id="x-go" aria-label="ابحث">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
      </button>
    </div>
    <div class="cats">
      <button class="chip ${!cat ? 'active' : ''}" data-c="">الكل</button>
      ${cats.map((c) => `<button class="chip ${cat === c ? 'active' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <div class="sortbar">
      <span class="lbl">الترتيب</span>
      ${sortOptions.map(([k, l]) => `<button class="chip ${sort === k ? 'active' : ''}" data-s="${k}">${l}</button>`).join('')}
    </div>
  </div>

  <div id="x-results"></div>`;

  const results = root.querySelector('#x-results');
  const countEl = root.querySelector('#result-count');

  async function load() {
    results.innerHTML = skeletonGrid(6);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);
    params.set('sort', sort);
    try {
      const { items, total } = await ctx.api('/prompts?' + params.toString());
      countEl.textContent = `${total} نتيجة`;
      if (!items.length) {
        results.innerHTML = emptyState(ICON.empty, 'لا توجد نتائج',
          'جرّب كلمات مفتاحية مختلفة.',
          `<button class="btn btn-outline" id="x-reset">إعادة تعيين</button>`);
        results.querySelector('#x-reset')?.addEventListener('click', () => ctx.navigate('#/explore'));
        return;
      }
      results.innerHTML = grid(items);
      bindCards(results, ctx);
    } catch (e) {
      results.innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
    }
  }

  let timer;
  const input = root.querySelector('#x-q');
  const sync = (patch = {}) => {
    const next = { q: input.value.trim(), cat, sort, ...patch };
    const p = new URLSearchParams();
    if (next.q) p.set('q', next.q);
    if (next.cat) p.set('cat', next.cat);
    if (next.sort && next.sort !== 'new') p.set('sort', next.sort);
    ctx.navigate('#/explore' + (p.toString() ? '?' + p.toString() : ''));
  };
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => sync(), 400); });
  root.querySelector('#x-go').addEventListener('click', () => sync());

  root.querySelectorAll('.chip[data-c]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const newCat = chip.dataset.c;
      const p = new URLSearchParams();
      if (input.value.trim()) p.set('q', input.value.trim());
      if (newCat) p.set('cat', newCat);
      if (sort && sort !== 'new') p.set('sort', sort);
      ctx.navigate('#/explore' + (p.toString() ? '?' + p.toString() : ''));
    });
  });
  root.querySelectorAll('.chip[data-s]').forEach((chip) => {
    chip.addEventListener('click', () => sync({ sort: chip.dataset.s }));
  });

  await load();
}

/* ══════════ 5 — تفاصيل البرومبت ══════════ */
async function prompt(root, ctx) {
  root.innerHTML = `
    <div style="padding:16px 0">
      <button class="btn btn-ghost btn-sm" onclick="history.back()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        رجوع
      </button>
    </div>
    ${skeletonPromptDetail()}`;

  const { prompt: p, related } = await ctx.api('/prompts/' + ctx.id);
  const mark = (p.category || 'خ').charAt(0);
  const description = p.description || p.body.replace(/\s+/g, ' ').slice(0, 140);

  root.innerHTML = `
  <div style="padding:16px 0">
    <button class="btn btn-ghost btn-sm" id="back">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      رجوع
    </button>
  </div>

  <div class="detail-hero">
    <div class="detail-cover">
      ${p.cover
        ? `<img src="${esc(p.cover)}" alt="">`
        : `<span class="cover-mark" style="font-size:64px">${esc(mark)}</span>`}
    </div>
    <div class="detail-body">
      <div class="meta-row">
        <span class="badge badge-soft mono">${esc(p.category)}</span>
        ${(p.models || []).map((m) => `<span class="tag">${esc(m)}</span>`).join('')}
        <span class="tag mono" style="margin-inline-start:auto">${timeAgo(p.createdAt)}</span>
      </div>

      <h1 class="detail-title">${esc(p.title)}</h1>
      <p style="color:var(--slate);line-height:1.75;margin-bottom:0">${esc(description)}</p>

      <div class="author-bar">
        ${avatar(p.author, 40)}
        <div class="info">
          <span class="name">${esc(p.author?.name || 'مجهول')}${p.author?.verified ? VCHECK : ''}</span>
          <span class="handle">@${esc(p.author?.username || 'unknown')}</span>
        </div>
        <div class="acts">
          <button class="btn btn-outline btn-sm" id="like-btn">
            <span id="like-ic">${p.liked ? ICON.heartFill : ICON.heart}</span>
            <span id="like-n">${p.likes}</span>
          </button>
          <button class="btn btn-primary btn-sm" id="copy-top">${ICON.copy} نسخ البرومبت</button>
        </div>
      </div>

      <div class="code-window">
        <div class="code-head">
          <span class="traffic"><i></i><i></i><i></i></span>
          <span class="code-name">prompt.txt</span>
          <button class="btn btn-ghost btn-sm" id="copy-head" style="font-size:12px">نسخ</button>
        </div>
        <pre class="code-body" id="prompt-body">${esc(p.body)}</pre>
      </div>

      <div class="row gap-12" style="flex-wrap:wrap;justify-content:space-between">
        <div class="pc-tags">
          ${(p.tags || []).map((t) => `<a class="tag tag-orange" href="#/explore?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}
        </div>
        <button class="btn btn-dark" id="copy-bottom">${ICON.copy} نسخ النص كاملاً</button>
      </div>
    </div>
  </div>

  ${related.length ? `
  <section class="section">
    ${sectionHead('04', 'ذات صلة', 'برومبتات مشابهة')}
    ${grid(related)}
  </section>` : ''}`;

  root.querySelector('#back').addEventListener('click', () => history.back());
  bindCards(root, ctx);

  async function doCopy(btn) {
    try { await navigator.clipboard.writeText(p.body); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = p.body;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    try { await ctx.api(`/prompts/${p.id}/copy`, { method: 'POST' }); } catch {}
    ctx.toast('تم نسخ البرومبت');
    if (btn) {
      const old = btn.innerHTML;
      btn.innerHTML = '✓ تم النسخ';
      setTimeout(() => { btn.innerHTML = old; }, 1600);
    }
  }
  ['copy-top', 'copy-head', 'copy-bottom'].forEach((id) => {
    const el = root.querySelector('#' + id);
    el?.addEventListener('click', () => doCopy(el));
  });

  root.querySelector('#like-btn').addEventListener('click', async () => {
    if (!ctx.state.user) {
      ctx.toast('سجّل الدخول للإعجاب', 'error');
      return ctx.navigate('#/login');
    }
    try {
      const { liked, likes } = await ctx.api(`/prompts/${p.id}/like`, { method: 'POST' });
      root.querySelector('#like-ic').innerHTML = liked ? ICON.heartFill : ICON.heart;
      root.querySelector('#like-n').textContent = likes;
      ctx.toast(liked ? 'أُضيف إلى تفضيلاتك' : 'أُزيل من تفضيلاتك');
    } catch (e) { ctx.toast(e.message, 'error'); }
  });
}

/* ══════════ 6 — نشر برومبت (بدون حقل الوصف) ══════════ */
async function newPrompt(root, ctx) {
  if (!ctx.state.user) {
    ctx.toast('سجّل الدخول للنشر', 'error');
    return ctx.navigate('#/login');
  }
  const cats = ctx.state.meta.categories || [];
  const models = ctx.state.meta.models || [];

  root.innerHTML = `
  <div class="section" style="margin-top:20px">
    <div class="head-row">
      <div>
        <div class="eyebrow"><span class="dot"></span>05 / نشر جديد</div>
        <h2 class="section-title">شارك <span class="hl">برومبتاً</span></h2>
        <p class="section-sub">كلما كان النص أوضح، زادت فائدة الآخرين منه.</p>
      </div>
    </div>

    <form id="np-form" class="stack gap-20">
      <div class="card card-white" style="padding:22px">
        <div class="stack gap-18">
          <div class="field">
            <label class="label">صورة الغلاف <span class="opt">(اختياري)</span></label>
            <div class="row gap-12" style="flex-wrap:wrap">
              <div id="cover-preview" style="width:110px;height:70px;border:1px solid var(--grid);border-radius:8px;background:var(--vellum);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
                <span class="cover-mark" style="font-size:26px">؟</span>
              </div>
              <div class="stack gap-8" style="flex:1;min-width:200px">
                <input class="input" id="cover-url" dir="ltr" placeholder="https://… رابط الصورة">
                <div class="row gap-8">
                  <input type="file" id="cover-file" accept="image/*" hidden>
                  <button type="button" class="btn btn-outline btn-sm" id="cover-pick">رفع صورة</button>
                  <button type="button" class="btn btn-ghost btn-sm" id="cover-clear">إزالة</button>
                </div>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label" for="title">العنوان</label>
            <input class="input" id="title" placeholder="مثال: محرر نصوص عربي احترافي" required maxlength="90">
          </div>

          <div class="field">
            <label class="label" for="category">التصنيف</label>
            <select class="select" id="category" required>
              <option value="">اختر تصنيفاً…</option>
              ${cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
            </select>
          </div>

          <div class="field">
            <label class="label" for="tags">الوسوم <span class="opt">(اختياري)</span></label>
            <input class="input" id="tags" placeholder="تحرير، لغة عربية، صياغة">
            <span class="hint">افصل بينها بفاصلة — 8 وسوم كحد أقصى</span>
          </div>
        </div>
      </div>

      <div class="card card-white" style="padding:22px">
        <div class="stack gap-18">
          <div class="field">
            <label class="label" for="body">نص البرومبت</label>
            <textarea class="textarea code" id="body" rows="14" required
              placeholder="اكتب البرومبت كاملاً… استخدم {{المتغيرات}} للقيم التي تُملأ لاحقاً"></textarea>
            <div class="row" style="justify-content:space-between">
              <span class="hint">استخدم <span class="mono">{{ }}</span> للمتغيرات</span>
              <span class="hint mono" id="body-count">0 حرف</span>
            </div>
          </div>

          <div class="field">
            <label class="label">النماذج المتوافقة</label>
            <div class="row gap-8" style="flex-wrap:wrap" id="models-box">
              ${models.map((m) => `<button type="button" class="chip" data-model="${esc(m)}">${esc(m)}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <p class="err-text" id="np-err" hidden></p>

      <div class="row gap-12" style="flex-wrap:wrap;justify-content:flex-end">
        <button type="button" class="btn btn-ghost" id="cancel">إلغاء</button>
        <button type="submit" class="btn btn-primary" id="publish">نشر البرومبت</button>
      </div>
    </form>
  </div>`;

  let cover = '';
  const preview = root.querySelector('#cover-preview');
  const urlInput = root.querySelector('#cover-url');
  const fileInput = root.querySelector('#cover-file');

  const setCover = (v) => {
    cover = v;
    preview.innerHTML = v
      ? `<img src="${esc(v)}" style="max-width:100%;max-height:100%;object-fit:contain" alt="">`
      : `<span class="cover-mark" style="font-size:26px">؟</span>`;
  };
  urlInput.addEventListener('input', () => setCover(urlInput.value.trim()));
  root.querySelector('#cover-pick').addEventListener('click', () => fileInput.click());
  root.querySelector('#cover-clear').addEventListener('click', () => {
    urlInput.value = ''; fileInput.value = ''; setCover('');
  });
  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return ctx.toast('حجم الصورة يتجاوز 2MB', 'error');
    const r = new FileReader();
    r.onload = () => { urlInput.value = ''; setCover(r.result); };
    r.readAsDataURL(f);
  });

  const chosen = new Set();
  root.querySelectorAll('[data-model]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const m = chip.dataset.model;
      if (chosen.has(m)) { chosen.delete(m); chip.classList.remove('active'); }
      else { chosen.add(m); chip.classList.add('active'); }
    });
  });

  const bodyEl = root.querySelector('#body');
  bodyEl.addEventListener('input', () => {
    root.querySelector('#body-count').textContent = `${bodyEl.value.length} حرف`;
  });

  root.querySelector('#cancel').addEventListener('click', () => {
    if (confirm('هل تريد إلغاء النشر؟')) history.back();
  });

  const form = root.querySelector('#np-form');
  const err = root.querySelector('#np-err');
  const btn = root.querySelector('#publish');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true;
    const title = root.querySelector('#title').value.trim();
    const category = root.querySelector('#category').value;
    const tags = root.querySelector('#tags').value.split(',').map((t) => t.trim()).filter(Boolean);
    const body = bodyEl.value.trim();

    if (!title || !category || !body) {
      err.textContent = 'العنوان والتصنيف والنص مطلوبة'; err.hidden = false; return;
    }
    if (body.length < 40) {
      err.textContent = 'النص قصير جداً'; err.hidden = false; return;
    }

    btn.disabled = true; btn.textContent = 'جارٍ النشر…';
    try {
      const { prompt: created } = await ctx.api('/prompts', {
        method: 'POST',
        body: { title, category, tags, body, cover, models: [...chosen], description: '' }
      });
      ctx.toast('تم النشر');
      ctx.navigate('#/prompt/' + created.id);
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
      btn.disabled = false; btn.textContent = 'نشر البرومبت';
    }
  });
}

/* ══════════ 7 — البروفايل مع التخصيص ══════════ */
async function profile(root, ctx) {
  const userId = ctx.id || ctx.state?.user?.id;
  if (!userId) {
    ctx.toast('سجّل الدخول لعرض ملفك', 'error');
    return ctx.navigate('#/login');
  }

  root.innerHTML = skeletonProfile();

  const { user: u, prompts, eligibility } = await ctx.api('/users/' + userId);

  const months = Math.max(0, Math.floor(
    (Date.now() - new Date(u.joined).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ));
  const avatarInner = u.avatar
    ? `<img src="${esc(u.avatar)}" alt="">`
    : esc(initials(u.name));

  root.innerHTML = `
  <div class="profile-head">
    <div class="profile-avatar ${u.verified ? 'verified' : ''}">${avatarInner}</div>
    <div class="who">
      <h1 class="profile-name">
        ${esc(u.name)}
        ${u.verified ? VCHECK : ''}
      </h1>
      <div class="profile-handle">@${esc(u.username)}</div>
      ${u.bio ? `<p class="profile-bio">${esc(u.bio)}</p>` : ''}
      <div class="profile-badges">
        ${u.verified
          ? `<span class="badge">موثّق</span>`
          : `<span class="badge badge-soft">غير موثّق</span>`}
        <span class="badge badge-soft">عضو منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}</span>
        ${u.role === 'admin' ? `<span class="badge badge-soft">إدارة</span>` : ''}
      </div>
    </div>
    ${u.isSelf ? `
    <div class="profile-actions">
      <button class="btn btn-outline btn-sm" id="edit-toggle">${ICON.edit} تعديل</button>
      <button class="btn btn-ghost btn-sm" id="logout">خروج</button>
    </div>` : ''}
  </div>

  ${u.isSelf ? `
  <form class="edit-panel hidden" id="edit-form">
    <div class="stack gap-14">
      <div class="row gap-12" style="flex-wrap:wrap;align-items:flex-start">
        <div id="avatar-preview" class="profile-avatar" style="width:64px;height:64px;font-size:22px;flex-shrink:0">${avatarInner}</div>
        <div class="stack gap-8" style="flex:1;min-width:200px">
          <input class="input" id="edit-avatar" dir="ltr" placeholder="رابط الصورة الشخصية" value="${esc(u.avatar || '')}">
          <div class="row gap-8">
            <input type="file" id="edit-avatar-file" accept="image/*" hidden>
            <button type="button" class="btn btn-outline btn-sm" id="edit-avatar-pick">رفع صورة</button>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">الاسم</label>
        <input class="input" id="edit-name" value="${esc(u.name)}" required>
      </div>
      <div class="field">
        <label class="label">اسم المستخدم</label>
        <input class="input" id="edit-username" dir="ltr" value="${esc(u.username)}" required>
      </div>
      <div class="field">
        <label class="label">نبذة تعريفية</label>
        <textarea class="textarea" id="edit-bio" rows="3" maxlength="200">${esc(u.bio || '')}</textarea>
      </div>
      <p class="err-text" id="edit-err" hidden></p>
      <div class="row gap-8" style="justify-content:flex-end">
        <button type="button" class="btn btn-ghost btn-sm" id="edit-cancel">إلغاء</button>
        <button type="submit" class="btn btn-primary btn-sm" id="edit-save">حفظ التعديلات</button>
      </div>
    </div>
  </form>` : ''}

  <div class="stats-row">
    <div class="stat"><div class="v">${u.promptCount || 0}</div><div class="k">برومبت</div></div>
    <div class="stat"><div class="v">${fmt(u.totalLikes || 0)}</div><div class="k">إعجاب</div></div>
    <div class="stat"><div class="v">${fmt(u.totalCopies || 0)}</div><div class="k">نسخة</div></div>
  </div>

  ${u.isSelf && eligibility ? `
  <section class="card" style="margin-bottom:28px">
    <div class="row" style="justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <h3 style="font-size:15px">شروط الحصول على شارة التوثيق</h3>
      ${eligibility.verified ? `<span class="badge">مستوفية</span>`
        : eligibility.eligible ? `<span class="badge">مؤهّل — بانتظار المراجعة</span>`
        : `<span class="tag mono">${eligibility.rules.filter((r) => r.met).length}/${eligibility.rules.length}</span>`}
    </div>
    <ul class="checks">
      ${eligibility.rules.map((r) => `
        <li class="${r.met ? 'ok' : ''}">
          <span class="mark">${r.met ? '✓' : ''}</span>
          <span>${esc(r.label)}</span>
          <span class="val">${fmt(r.value)} / ${fmt(r.target)}</span>
        </li>`).join('')}
    </ul>
  </section>` : ''}

  <section class="section" style="margin-top:0">
    <div class="eyebrow"><span class="dot"></span>06 / الأعمال</div>
    <h2 class="section-title" style="font-size:22px;margin-bottom:16px">
      برومبتات ${u.isSelf ? 'الخاصة بك' : esc(u.name.split(' ')[0])}
    </h2>
    ${prompts.length
      ? grid(prompts)
      : emptyState(ICON.empty, 'لا توجد برومبتات بعد',
          u.isSelf ? 'ابدأ بمشاركة أول برومبت لك.' : 'لم ينشر هذا المستخدم أي برومبت.',
          u.isSelf ? `<a class="btn btn-primary" href="#/new">انشر برومبتاً</a>` : '')}
  </section>`;

  bindCards(root, ctx);

  root.querySelector('#logout')?.addEventListener('click', async () => {
    if (!confirm('هل تريد تسجيل الخروج؟')) return;
    try { await ctx.api('/auth/logout', { method: 'POST' }); } catch {}
    ctx.logout();
    ctx.toast('تم تسجيل الخروج');
    ctx.navigate('#/');
  });

  /* تعديل الملف */
  const editForm = root.querySelector('#edit-form');
  const editToggle = root.querySelector('#edit-toggle');

  editToggle?.addEventListener('click', () => {
    editForm.classList.toggle('hidden');
    if (!editForm.classList.contains('hidden')) {
      editForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  root.querySelector('#edit-cancel')?.addEventListener('click', () => {
    editForm.classList.add('hidden');
  });

  let editAvatar = u.avatar || '';
  const avatarPreview = root.querySelector('#avatar-preview');
  const avatarInput = root.querySelector('#edit-avatar');
  const avatarFile = root.querySelector('#edit-avatar-file');

  const setAvatar = (v) => {
    editAvatar = v;
    avatarPreview.innerHTML = v ? `<img src="${esc(v)}" alt="">` : esc(initials(u.name));
  };

  avatarInput?.addEventListener('input', () => setAvatar(avatarInput.value.trim()));
  root.querySelector('#edit-avatar-pick')?.addEventListener('click', () => avatarFile.click());
  avatarFile?.addEventListener('change', () => {
    const f = avatarFile.files?.[0];
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) return ctx.toast('حجم الصورة يتجاوز 1.5MB', 'error');
    const r = new FileReader();
    r.onload = () => { avatarInput.value = ''; setAvatar(r.result); };
    r.readAsDataURL(f);
  });

  editForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = root.querySelector('#edit-err');
    err.hidden = true;
    const saveBtn = root.querySelector('#edit-save');
    saveBtn.disabled = true; saveBtn.textContent = 'جارٍ الحفظ…';

    try {
      const { user: updated } = await ctx.api('/me', {
        method: 'PATCH',
        body: {
          name: root.querySelector('#edit-name').value.trim(),
          username: root.querySelector('#edit-username').value.trim(),
          bio: root.querySelector('#edit-bio').value.trim(),
          avatar: editAvatar
        }
      });
      ctx.state.user = updated;
      ctx.toast('تم تحديث الملف');
      profile(root, ctx);
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
      saveBtn.disabled = false; saveBtn.textContent = 'حفظ التعديلات';
    }
  });
}

/* ══════════ 8 — تفضيلاتي ══════════ */
async function favorites(root, ctx) {
  if (!ctx.state.user) {
    ctx.toast('سجّل الدخول لعرض تفضيلاتك', 'error');
    return ctx.navigate('#/login');
  }

  root.innerHTML = `
    <div class="section" style="margin-top:20px">
      ${sectionHead('07', 'تفضيلاتي', 'البرومبتات التي <span class="hl">أعجبتك</span>')}
    </div>
    <div id="fav-results">${skeletonGrid(3)}</div>`;

  const { items } = await ctx.api('/favorites');
  const container = root.querySelector('#fav-results');

  if (!items.length) {
    container.innerHTML = emptyState(ICON.heart,
      'لا توجد إعجابات بعد',
      'اضغط على زر الإعجاب في أي برومبت ليظهر هنا.',
      `<a class="btn btn-primary" href="#/explore">استكشف البرومبتات</a>`);
    return;
  }
  container.innerHTML = grid(items);
  bindCards(container, ctx);
}

/* ══════════ 9 — لوحة الإدارة ══════════ */
async function admin(root, ctx) {
  if (!ctx.state.adminToken) {
    root.innerHTML = `
    <div class="lock-screen">
      <div class="shield">${ICON.shield}</div>
      <h2>لوحة الإدارة</h2>
      <p>هذه المنطقة مخصّصة للمشرفين فقط.</p>
      <form id="lock-form" class="stack gap-12">
        <input class="input" id="lock-pass" type="password" dir="ltr" placeholder="كلمة مرور اللوحة" required>
        <p class="err-text" id="lock-err" hidden></p>
        <button class="btn btn-primary btn-block" type="submit" id="lock-btn">دخول اللوحة</button>
      </form>
      <div class="lock-note">كلمة المرور التجريبية: khayal-admin</div>
    </div>`;

    const form = root.querySelector('#lock-form');
    const err = root.querySelector('#lock-err');
    const btn = root.querySelector('#lock-btn');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.hidden = true; btn.disabled = true; btn.textContent = 'جارٍ التحقق…';
      try {
        const { token } = await ctx.api('/admin/unlock', {
          method: 'POST',
          body: { password: root.querySelector('#lock-pass').value }
        });
        ctx.setAdminToken(token);
        ctx.toast('تم فتح اللوحة');
        admin(root, ctx);
      } catch (ex) {
        err.textContent = ex.message; err.hidden = false;
        btn.disabled = false; btn.textContent = 'دخول اللوحة';
      }
    });
    return;
  }

  root.innerHTML = `
  <div class="admin-head">
    <div>
      <div class="eyebrow"><span class="dot"></span>08 / الإدارة</div>
      <h1>لوحة التحكم</h1>
    </div>
    <button class="btn btn-outline btn-sm" id="admin-exit">خروج من اللوحة</button>
  </div>
  <div class="tabs">
    <button class="tab active" data-tab="overview">نظرة عامة</button>
    <button class="tab" data-tab="users">المستخدمون</button>
    <button class="tab" data-tab="prompts">البرومبتات</button>
    <button class="tab" data-tab="verify">التوثيق</button>
  </div>
  <div id="admin-body"></div>`;

  root.querySelector('#admin-exit').addEventListener('click', () => {
    if (!confirm('الخروج من اللوحة؟')) return;
    ctx.setAdminToken(null);
    ctx.toast('تم الخروج');
    ctx.navigate('#/');
  });

  const body = root.querySelector('#admin-body');
  const loaders = { overview: loadOverview, users: loadUsers, prompts: loadPrompts, verify: loadVerify };
  root.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      root.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      loaders[tab.dataset.tab]();
    });
  });

  async function loadOverview() {
    body.innerHTML = skeletonAdminTab('overview');
    const { stats, topPrompts, latestUsers } = await ctx.api('/admin/overview', { admin: true });
    body.innerHTML = `
      <div class="stat-cards">
        <div class="stat-card"><div class="k">المستخدمون</div><div class="v">${fmt(stats.users)}</div></div>
        <div class="stat-card"><div class="k">البرومبتات</div><div class="v">${fmt(stats.prompts)}</div></div>
        <div class="stat-card"><div class="k">الإعجابات</div><div class="v">${fmt(stats.likes)}</div></div>
        <div class="stat-card"><div class="k">النسخ</div><div class="v">${fmt(stats.copies)}</div></div>
      </div>
      <div class="two-col">
        <div class="card card-white">
          <h3 style="font-size:14px;margin-bottom:10px">أعلى البرومبتات</h3>
          <div class="list-mini">
            ${topPrompts.map((p) => `
              <div class="item">
                <div style="min-width:0"><div class="t">${esc(p.title)}</div><div class="s">${esc(p.category)}</div></div>
                <span class="v">♥ ${fmt(p.likes)}</span>
              </div>`).join('') || '<p class="hint">لا توجد بيانات</p>'}
          </div>
        </div>
        <div class="card card-white">
          <h3 style="font-size:14px;margin-bottom:10px">أحدث المستخدمين</h3>
          <div class="list-mini">
            ${latestUsers.map((u) => `
              <div class="item">
                ${avatar(u, 26)}
                <div style="min-width:0"><div class="t">${esc(u.name)}</div><div class="s">@${esc(u.username)}</div></div>
                <span class="v">${u.promptCount || 0}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  async function loadUsers() {
    body.innerHTML = skeletonAdminTab('users');
    const { items } = await ctx.api('/admin/users', { admin: true });
    body.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>المستخدم</th><th>البريد</th><th>الدور</th><th>التوثيق</th><th>البرومبتات</th><th></th></tr></thead>
          <tbody>
            ${items.map((u) => `
              <tr>
                <td><span class="td-user">${avatar(u, 26)}<span>${esc(u.name)}</span>${u.verified ? VCHECK : ''}</span></td>
                <td class="mono" style="font-size:12px;color:var(--slate)" dir="ltr">${esc(u.email)}</td>
                <td><span class="tag mono">${u.role === 'admin' ? 'إدارة' : 'عضو'}</span></td>
                <td>${u.verified ? '<span class="badge">موثّق</span>' : '<span class="tag">غير موثّق</span>'}</td>
                <td class="mono">${u.promptCount || 0}</td>
                <td><div class="td-actions">
                  <button class="btn btn-outline btn-sm" data-verify="${u.id}">${u.verified ? 'إلغاء' : 'توثيق'}</button>
                  <button class="btn btn-danger btn-sm" data-del="${u.id}">${ICON.trash}</button>
                </div></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    body.querySelectorAll('[data-verify]').forEach((b) => b.addEventListener('click', async () => {
      try { await ctx.api(`/admin/users/${b.dataset.verify}/verify`, { method: 'POST', admin: true }); ctx.toast('تم'); loadUsers(); }
      catch (e) { ctx.toast(e.message, 'error'); }
    }));
    body.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('سيُحذف المستخدم وكل برومبتاته. متابعة؟')) return;
      try { await ctx.api(`/admin/users/${b.dataset.del}`, { method: 'DELETE', admin: true }); ctx.toast('تم الحذف'); loadUsers(); }
      catch (e) { ctx.toast(e.message, 'error'); }
    }));
  }

  async function loadPrompts() {
    body.innerHTML = skeletonAdminTab('prompts');
    const { items } = await ctx.api('/admin/prompts', { admin: true });
    body.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>العنوان</th><th>التصنيف</th><th>الكاتب</th><th>♥</th><th>نسخ</th><th></th></tr></thead>
          <tbody>
            ${items.map((p) => `
              <tr>
                <td><a href="#/prompt/${p.id}" style="font-weight:500">${esc(p.title)}</a></td>
                <td><span class="tag mono">${esc(p.category)}</span></td>
                <td>${esc(p.author?.name || '—')}</td>
                <td class="mono">${fmt(p.likes)}</td>
                <td class="mono">${fmt(p.copies)}</td>
                <td><button class="btn btn-danger btn-sm" data-delp="${p.id}">${ICON.trash}</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    body.querySelectorAll('[data-delp]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('حذف البرومبت نهائياً؟')) return;
      try { await ctx.api(`/admin/prompts/${b.dataset.delp}`, { method: 'DELETE', admin: true }); ctx.toast('تم'); loadPrompts(); }
      catch (e) { ctx.toast(e.message, 'error'); }
    }));
  }

  async function loadVerify() {
    body.innerHTML = skeletonAdminTab('users');
    const { items } = await ctx.api('/admin/eligible', { admin: true });
    if (!items.length) {
      body.innerHTML = emptyState(ICON.shield, 'لا يوجد مؤهّلون', 'سيظهر هنا من استوفى الشروط.');
      return;
    }
    body.innerHTML = `
      <p class="hint" style="margin-bottom:14px">${items.length} مستخدم استوفى الشروط.</p>
      <div class="stack gap-10">
        ${items.map(({ user: u }) => `
          <div class="card card-white row gap-14" style="flex-wrap:wrap;align-items:center">
            ${avatar(u, 40)}
            <div style="flex:1;min-width:160px">
              <div style="font-weight:500">${esc(u.name)}</div>
              <div class="mono" style="font-size:12px;color:var(--ash)">@${esc(u.username)}</div>
            </div>
            <div class="row gap-12" style="font-size:12px;color:var(--slate)">
              <span>${u.promptCount} برومبت</span>
              <span>♥ ${fmt(u.totalLikes)}</span>
            </div>
            <div class="row gap-8">
              <a class="btn btn-outline btn-sm" href="#/u/${u.id}">عرض</a>
              <button class="btn btn-primary btn-sm" data-v="${u.id}">توثيق</button>
            </div>
          </div>`).join('')}
      </div>`;
    body.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', async () => {
      try { await ctx.api(`/admin/users/${b.dataset.v}/verify`, { method: 'POST', admin: true }); ctx.toast('تم'); loadVerify(); }
      catch (e) { ctx.toast(e.message, 'error'); }
    }));
  }

  await loadOverview();
}

/* ══════════ 10 — انقطاع الاتصال ══════════ */
async function offline(root, ctx) {
  root.innerHTML = `
  <div class="state" style="margin:72px auto;max-width:500px;border-style:solid">
    <div class="icon">${ICON.wifiOff}</div>
    <h3>لا يوجد اتصال بالإنترنت</h3>
    <p>تعذّر الوصول إلى خيال. سنعيد المحاولة عند عودة الاتصال.</p>
    <button class="btn btn-primary" id="retry">إعادة المحاولة</button>
  </div>`;
  root.querySelector('#retry').addEventListener('click', async () => {
    try {
      await ctx.api('/meta');
      ctx.state.online = true;
      const strip = document.getElementById('offline-strip');
      if (strip) strip.hidden = true;
      ctx.toast('عاد الاتصال');
      ctx.navigate('#/');
    } catch { ctx.toast('ما زال الاتصال مقطوعاً', 'error'); }
  });
  const onOnline = () => { ctx.navigate('#/'); window.removeEventListener('online', onOnline); };
  window.addEventListener('online', onOnline);
}

export const Screens = {
  home, login, register, explore, prompt,
  newPrompt, profile, favorites, admin, offline
};