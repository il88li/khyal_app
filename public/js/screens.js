/* ═══════════════════════════════════════════════
   خيال v9.0 — Futuristic Screens
   ═══════════════════════════════════════════════ */

/* ── Helpers ─── */
function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function attr(s) { return esc(s); }

function initials(name = '') {
  return String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('');
}

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function timeAgo(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'الآن';
  if (diff < 3600) return Math.floor(diff / 60) + ' د';
  if (diff < 86400) return Math.floor(diff / 3600) + ' س';
  if (diff < 2592000) return Math.floor(diff / 86400) + ' ي';
  return d.toLocaleDateString('ar');
}

function avatar(author, size = 32) {
  if (!author) return '';
  const verified = author.verified ? 'verified' : '';
  const img = author.avatar
    ? `<img src="${esc(author.avatar)}" alt="" loading="lazy" decoding="async">`
    : esc(initials(author.name || '؟'));
  return `<span class="avatar ${verified}" style="--s:${size}px">${img}</span>`;
}

/* ── Icons ─── */
const ICON = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/></svg>`,
  explore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/></svg>`,
  heartFill: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg>`,
  login: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 12h10M17 8l3 4-3 4"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  chev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  userPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
  userCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`,
  empty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
};

const VCHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v6c0 5 4 9 9 10 5-1 9-5 9-10V7l-9-5z"/><path d="m9 12 2 2 4-4"/></svg>`;

/* ── Skeletons ─── */
function skeletonGrid(n = 6) {
  return `<div class="grid-cards">${Array(n).fill(0).map(() => `
    <div class="prompt-card">
      <div class="pc-media sk sk-cover"></div>
      <div class="pc-body">
        <div class="sk sk-text" style="width:70%;margin-bottom:8px"></div>
        <div class="sk sk-text" style="width:50%;height:11px"></div>
      </div>
    </div>`).join('')}</div>`;
}

function skeletonPromptDetail() {
  return `
    <div class="sk sk-cover" style="height:280px;margin-bottom:24px"></div>
    <div class="sk sk-text" style="width:60%;height:24px;margin-bottom:12px"></div>
    <div class="sk sk-text" style="width:80%;margin-bottom:8px"></div>
    <div class="sk sk-text" style="width:40%;height:11px"></div>`;
}

function emptyState(icon, title, sub) {
  return `
    <div style="text-align:center;padding:64px 24px;color:var(--color-text-muted)">
      <div style="width:80px;height:80px;margin:0 auto 24px;background:var(--color-bg-elevated);border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;opacity:0.5">${icon}</div>
      <h3 style="font-size:var(--text-xl);margin-bottom:8px;color:var(--color-text-primary)">${esc(title)}</h3>
      <p style="font-size:var(--text-sm)">${esc(sub)}</p>
    </div>`;
}

function sectionHead(num, title, sub) {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6)">
      <div>
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:4px">
          <span style="display:inline-block;width:6px;height:6px;border-radius:var(--radius-full);background:var(--color-primary);margin-inline-end:6px;box-shadow:0 0 10px var(--color-primary)"></span>
          ${num} / ${esc(sub)}
        </div>
        <h2 style="font-size:var(--text-2xl);margin:0;font-weight:700">${esc(title)}</h2>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════
   بطاقة البرومبت v9.0 — Futuristic Card
   ═══════════════════════════════════════════════ */
function promptCard(p, idx = 0) {
  const mark = (p.category || p.title || 'خ').charAt(0);
  const slugPath = p.slug || p.id;
  const tags = (p.tags || []).slice(0, 3);
  const desc = p.description || p.body.replace(/\s+/g, ' ').slice(0, 100);

  const coverContent = p.cover
    ? `<img class="pc-media-img" src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy" decoding="async">`
    : `<div class="pc-media-placeholder">${esc(mark)}</div>`;

  return `
  <article class="prompt-card" data-prompt="${attr(p.id)}" data-slug="${attr(slugPath)}" data-author="${attr(p.authorId)}">
    <div class="pc-media">
      ${coverContent}
      ${p.category ? `<span class="pc-badge">${esc(p.category)}</span>` : ''}
      <button class="pc-wishlist ${p.liked ? 'liked' : ''}" 
              data-like="${attr(p.id)}" 
              data-liked="${p.liked ? '1' : '0'}"
              aria-label="إضافة للمفضلة">
        <svg viewBox="0 0 24 24" fill="${p.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
    <div class="pc-body">
      <span class="pc-title">${esc(p.title)}</span>
      <p class="pc-meta">${esc(p.author?.name || 'مجهول')} · ${timeAgo(p.createdAt)}</p>
      ${desc ? `<p class="pc-desc">${esc(desc)}</p>` : ''}
      <div class="pc-footer">
        <span class="pc-price">★ ${fmt(p.likes)} إعجاب</span>
      </div>
    </div>
  </article>`;
}

const grid = (items) => `<div class="grid-cards">${items.map((p, i) => promptCard(p, i)).join('')}</div>`;

/* ═══════════ Bind Cards Events ═══════════ */
function bindCards(root, ctx) {
  root.querySelectorAll('[data-like]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.like;
      const liked = btn.dataset.liked === '1';
      try {
        const res = await ctx.api('/prompts/' + id + '/like', { method: 'POST' });
        btn.dataset.liked = res.liked ? '1' : '0';
        btn.classList.toggle('liked', res.liked);
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.setAttribute('fill', res.liked ? 'currentColor' : 'none');
        }
      } catch (err) {
        ctx.toast(err.message, 'error');
      }
    });
  });

  root.querySelectorAll('.prompt-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-like], a, button')) return;
      const slug = card.dataset.slug;
      ctx.navigate('#/p/' + slug);
    });
  });
}

/* ═══════════ 1 — الرئيسية ═══════════ */
async function home(root, ctx) {
  const categories = [
    { name: 'كتابة', icon: '✍️' },
    { name: 'برمجة', icon: '💻' },
    { name: 'تصميم', icon: '🎨' },
    { name: 'تسويق', icon: '' },
    { name: 'تعليم', icon: '📚' },
    { name: 'تحليل بيانات', icon: '' }
  ];

  root.innerHTML = `
  <section class="hero">
    <h1>اكتشف برومبتات عربية <span style="background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">مستقبلية</span></h1>
    <p>منصة متقدمة لمشاركة أوامر الذكاء الاصطناعي — اكتشف، انسخ، وانشر.</p>
    
    <form class="search-capsule" id="hero-search-form">
      <div class="search-field">
        <label>ابحث</label>
        <input id="hero-search-q" placeholder="مثال: كتابة، برمجة، تصميم" autocomplete="off">
      </div>
      <button type="submit" class="search-submit" aria-label="بحث">
        ${ICON.search}
      </button>
    </form>
  </section>

  <section class="section">
    ${sectionHead('01', 'أحدث البرومبتات', 'وصل حديثاً')}
    <div id="home-latest">${skeletonGrid(6)}</div>
  </section>`;

  // Search form
  const form = root.querySelector('#hero-search-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = root.querySelector('#hero-search-q').value.trim();
      if (q) ctx.navigate('#/explore?q=' + encodeURIComponent(q));
    });
  }

  try {
    const latest = await ctx.api('/prompts?sort=new&limit=12');
    const el = root.querySelector('#home-latest');
    el.innerHTML = latest.items.length
      ? grid(latest.items)
      : emptyState(ICON.empty, 'لا توجد برومبتات بعد', 'كن أول من ينشر.');
    bindCards(root, ctx);
  } catch (e) {
    root.querySelector('#home-latest').innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 2 — تسجيل الدخول ═══════════ */
async function login(root, ctx) {
  root.innerHTML = `
    <div style="max-width:420px;margin:48px auto;padding:40px;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg)">
      <h2 style="font-size:var(--text-2xl);margin-bottom:8px;background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">تسجيل الدخول</h2>
      <p style="color:var(--color-text-secondary);margin-bottom:32px">أهلاً بعودتك إلى خيال</p>
      <form id="login-form" style="display:flex;flex-direction:column;gap:20px">
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:8px;color:var(--color-text-secondary)">البريد الإلكتروني</label>
          <input type="email" name="email" required style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:8px;color:var(--color-text-secondary)">كلمة المرور</label>
          <input type="password" name="password" required style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:16px">دخول</button>
      </form>
      <p style="text-align:center;margin-top:24px;font-size:var(--text-sm);color:var(--color-text-secondary)">
        ليس لديك حساب؟ <a href="#/register" style="color:var(--color-primary);font-weight:600">سجّل الآن</a>
      </p>
    </div>`;

  root.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const res = await ctx.api('/auth/login', { method: 'POST', body: Object.fromEntries(fd) });
      ctx.setToken(res.token);
      await ctx.refreshMe();
      ctx.toast('تم تسجيل الدخول');
      ctx.navigate('#/');
    } catch (err) {
      ctx.toast(err.message, 'error');
    }
  });
}

/* ══════════ 3 — تسجيل حساب جديد ═══════════ */
async function register(root, ctx) {
  root.innerHTML = `
    <div style="max-width:420px;margin:48px auto;padding:40px;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg)">
      <h2 style="font-size:var(--text-2xl);margin-bottom:8px;background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">حساب جديد</h2>
      <p style="color:var(--color-text-secondary);margin-bottom:32px">انضم إلى مجتمع خيال</p>
      <form id="register-form" style="display:flex;flex-direction:column;gap:20px">
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:8px;color:var(--color-text-secondary)">الاسم</label>
          <input type="text" name="name" required style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:8px;color:var(--color-text-secondary)">اسم المستخدم</label>
          <input type="text" name="username" required pattern="[a-zA-Z0-9_]+" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:8px;color:var(--color-text-secondary)">البريد الإلكتروني</label>
          <input type="email" name="email" required style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:8px;color:var(--color-text-secondary)">كلمة المرور</label>
          <input type="password" name="password" required minlength="6" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:16px">إنشاء الحساب</button>
      </form>
      <p style="text-align:center;margin-top:24px;font-size:var(--text-sm);color:var(--color-text-secondary)">
        لديك حساب؟ <a href="#/login" style="color:var(--color-primary);font-weight:600">سجّل دخولك</a>
      </p>
    </div>`;

  root.querySelector('#register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const res = await ctx.api('/auth/register', { method: 'POST', body: Object.fromEntries(fd) });
      ctx.setToken(res.token);
      await ctx.refreshMe();
      ctx.toast('تم إنشاء الحساب');
      ctx.navigate('#/');
    } catch (err) {
      ctx.toast(err.message, 'error');
    }
  });
}

/* ═══════════ 4 — استكشف ══════════ */
async function explore(root, ctx) {
  const q = ctx.params.q || '';
  const sort = ctx.params.sort || 'new';
  
  root.innerHTML = `
    <section class="hero" style="padding:var(--space-8) 0">
      <h1 style="font-size:var(--text-3xl)">استكشف البرومبتات</h1>
      <form class="search-capsule" id="explore-search" style="margin-top:var(--space-6)">
        <div class="search-field">
          <input id="explore-q" value="${esc(q)}" placeholder="ابحث..." autocomplete="off">
        </div>
        <button type="submit" class="search-submit">${ICON.search}</button>
      </form>
    </section>
    <section class="section">
      ${sectionHead('02', 'النتائج', q ? `بحث: ${q}` : 'جميع البرومبتات')}
      <div id="explore-results">${skeletonGrid(6)}</div>
    </section>`;

  const form = root.querySelector('#explore-search');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newQ = root.querySelector('#explore-q').value.trim();
    ctx.navigate('#/explore?q=' + encodeURIComponent(newQ) + '&sort=' + sort);
  });

  try {
    const res = await ctx.api('/prompts?sort=' + sort + (q ? '&q=' + encodeURIComponent(q) : '') + '&limit=24');
    const el = root.querySelector('#explore-results');
    el.innerHTML = res.items.length ? grid(res.items) : emptyState(ICON.empty, 'لا نتائج', 'جرّب كلمات بحث أخرى');
    bindCards(root, ctx);
  } catch (e) {
    root.querySelector('#explore-results').innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 5 — تفاصيل البرومبت ═══════════ */
async function prompt(root, ctx) {
  root.innerHTML = `
    <div style="padding:var(--space-2) 0">
      <button class="btn btn-ghost btn-sm" id="back-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        رجوع
      </button>
    </div>
    ${skeletonPromptDetail()}`;

  root.querySelector('#back-btn').addEventListener('click', () => history.back());

  try {
    const { prompt: p, related } = await ctx.api('/prompts/' + ctx.id);
    const mark = (p.category || p.title || 'خ').charAt(0);
    const description = p.description || p.body.replace(/\s+/g, ' ').slice(0, 150);
    const isOwner = ctx.state.user?.id === p.authorId;
    const isFollowingAuthor = !!p.isFollowingAuthor;

    root.innerHTML = `
    <div style="padding:var(--space-2) 0">
      <button class="btn btn-ghost btn-sm" id="back-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        رجوع
      </button>
    </div>

    <div style="margin-top:var(--space-6)">
      <div style="position:relative;aspect-ratio:16/9;background:var(--color-bg-elevated);border-radius:var(--radius-xl);overflow:hidden;margin-bottom:var(--space-6);border:1px solid var(--color-border)">
        ${p.cover 
          ? `<img src="${esc(p.cover)}" alt="" style="width:100%;height:100%;object-fit:cover">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:96px;font-weight:800;background:linear-gradient(135deg,var(--color-bg-elevated),var(--color-bg-card));color:var(--color-text-muted)">${esc(mark)}</div>`}
      </div>

      <h1 style="font-size:var(--text-3xl);font-weight:800;margin-bottom:var(--space-4);background:linear-gradient(135deg,var(--color-text-primary),var(--color-primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${esc(p.title)}</h1>
      <p style="color:var(--color-text-secondary);line-height:1.8;font-size:var(--text-base);margin-bottom:var(--space-6)">${esc(description)}</p>

      <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-6);flex-wrap:wrap;padding:var(--space-4);background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg)">
        ${avatar(p.author, 48)}
        <div style="flex:1">
          <div style="font-size:var(--text-base);font-weight:600">${esc(p.author?.name || 'مجهول')}${p.author?.verified ? VCHECK : ''}</div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);font-family:var(--font-mono)">@${esc(p.author?.username || 'unknown')}</div>
        </div>
        <div style="display:flex;gap:var(--space-2)">
          ${isOwner 
            ? `<a class="btn btn-secondary btn-sm" href="#/edit/${attr(p.id)}">${ICON.edit} تعديل</a>`
            : `<button class="btn btn-secondary btn-sm" id="follow-btn" data-following="${isFollowingAuthor ? '1' : '0'}">
                ${isFollowingAuthor ? ICON.userCheck + ' متابَع' : ICON.userPlus + ' متابعة'}
              </button>`}
        </div>
      </div>

      <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--space-6);margin-bottom:var(--space-6);position:relative;overflow:hidden">
        <div style="position:absolute;top:0;inset-inline:0;height:3px;background:linear-gradient(90deg,var(--color-primary),var(--color-accent))"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4)">
          <span style="font-size:var(--text-xs);font-family:var(--font-mono);color:var(--color-text-muted)">prompt.txt</span>
          <button class="btn btn-ghost btn-sm" id="copy-btn">${ICON.copy} نسخ</button>
        </div>
        <pre id="prompt-body" style="margin:0;font-family:var(--font-mono);font-size:var(--text-sm);line-height:1.8;white-space:pre-wrap;word-break:break-word;color:var(--color-text-primary);background:var(--color-bg-elevated);padding:var(--space-4);border-radius:var(--radius-md);border:1px solid var(--color-border)">${esc(p.body)}</pre>
      </div>

      <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-6)">
        <button class="btn btn-secondary btn-sm" id="like-btn" data-liked="${p.liked ? '1' : '0'}">
          <span id="like-ic">${p.liked ? ICON.heartFill : ICON.heart}</span>
          <span id="like-n">${p.likes}</span>
        </button>
        <button class="btn btn-secondary btn-sm" id="share-btn">${ICON.share} مشاركة</button>
        <button class="btn btn-primary btn-sm" id="copy-bottom">${ICON.copy} نسخ النص</button>
      </div>

      ${(p.tags || []).length ? `
      <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-6)">
        ${(p.tags || []).map((t) => `<a class="btn btn-ghost btn-sm" href="#/explore?q=${encodeURIComponent(t)}" style="border-radius:var(--radius-full)">#${esc(t)}</a>`).join('')}
      </div>` : ''}
    </div>

    ${related.length ? `
    <section class="section" style="margin-top:var(--space-12)">
      ${sectionHead('03', 'ذات صلة', 'برومبتات مشابهة')}
      ${grid(related)}
    </section>` : ''}

    <section class="comments-section" style="margin-top:var(--space-12)">
      <h3 style="font-size:var(--text-xl);margin-bottom:var(--space-6)">${ICON.chat} التعليقات <span style="color:var(--color-text-muted);font-size:var(--text-sm)">(${p.commentsCount || 0})</span></h3>
      <div id="cm-list"></div>
    </section>`;

    // Events
    root.querySelector('#back-btn').addEventListener('click', () => history.back());
    
    root.querySelector('#copy-btn').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(p.body);
        ctx.toast('تم النسخ');
      } catch { ctx.toast('فشل النسخ', 'error'); }
    });

    root.querySelector('#copy-bottom').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(p.body);
        ctx.toast('تم النسخ');
      } catch { ctx.toast('فشل النسخ', 'error'); }
    });

    root.querySelector('#like-btn').addEventListener('click', async () => {
      try {
        const res = await ctx.api('/prompts/' + p.id + '/like', { method: 'POST' });
        root.querySelector('#like-ic').innerHTML = res.liked ? ICON.heartFill : ICON.heart;
        root.querySelector('#like-n').textContent = res.likes;
        root.querySelector('#like-btn').dataset.liked = res.liked ? '1' : '0';
      } catch (err) { ctx.toast(err.message, 'error'); }
    });

    root.querySelector('#share-btn').addEventListener('click', async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title: p.title, url: location.href });
        } else {
          await navigator.clipboard.writeText(location.href);
          ctx.toast('تم نسخ الرابط');
        }
      } catch {}
    });

    const followBtn = root.querySelector('#follow-btn');
    if (followBtn) {
      followBtn.addEventListener('click', async () => {
        try {
          const res = await ctx.api('/users/' + p.authorId + '/follow', { method: 'POST' });
          followBtn.dataset.following = res.following ? '1' : '0';
          followBtn.innerHTML = res.following ? ICON.userCheck + ' متابَع' : ICON.userPlus + ' متابعة';
        } catch (err) { ctx.toast(err.message, 'error'); }
      });
    }

    bindCards(root, ctx);
  } catch (e) {
    root.innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 6 — نشر برومبت ═══════════ */
async function newPrompt(root, ctx) {
  if (!ctx.state.user) {
    ctx.navigate('#/login');
    return;
  }

  root.innerHTML = `
    <div style="max-width:640px;margin:0 auto">
      <h1 style="font-size:var(--text-3xl);margin-bottom:var(--space-2);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">نشر برومبت جديد</h1>
      <p style="color:var(--color-text-secondary);margin-bottom:var(--space-8)">شارك إبداعك مع المجتمع</p>
      
      <form id="new-prompt-form" style="display:flex;flex-direction:column;gap:var(--space-5)">
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">العنوان</label>
          <input type="text" name="title" required style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">الوصف</label>
          <textarea name="description" rows="3" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);resize:vertical;transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'"></textarea>
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">نص البرومبت</label>
          <textarea name="body" required rows="8" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-mono);color:var(--color-text-primary);resize:vertical;transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'"></textarea>
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">التصنيف</label>
          <input type="text" name="category" placeholder="مثال: كتابة، برمجة" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">الوسوم (مفصولة بفاصلة)</label>
          <input type="text" name="tags" placeholder="مثال: gpt4, كتابة, إبداع" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:16px">نشر</button>
      </form>
    </div>`;

  root.querySelector('#new-prompt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    if (data.tags) data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    try {
      const res = await ctx.api('/prompts', { method: 'POST', body: data });
      ctx.toast('تم النشر');
      ctx.navigate('#/p/' + (res.slug || res.id));
    } catch (err) {
      ctx.toast(err.message, 'error');
    }
  });
}

/* ══════════ 7 — تعديل برومبت ══════════ */
async function editPrompt(root, ctx) {
  if (!ctx.state.user) { ctx.navigate('#/login'); return; }

  root.innerHTML = `<div style="padding:var(--space-12) 0">${skeletonPromptDetail()}</div>`;

  try {
    const { prompt: p } = await ctx.api('/prompts/' + ctx.id);
    if (ctx.state.user.id !== p.authorId) {
      ctx.toast('ليس لديك صلاحية', 'error');
      ctx.navigate('#/');
      return;
    }

    root.innerHTML = `
    <div style="max-width:640px;margin:0 auto">
      <h1 style="font-size:var(--text-3xl);margin-bottom:var(--space-2);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">تعديل البرومبت</h1>
      <p style="color:var(--color-text-secondary);margin-bottom:var(--space-8)">${esc(p.title)}</p>
      
      <form id="edit-prompt-form" style="display:flex;flex-direction:column;gap:var(--space-5)">
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">العنوان</label>
          <input type="text" name="title" required value="${esc(p.title)}" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">الوصف</label>
          <textarea name="description" rows="3" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);resize:vertical;transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">${esc(p.description || '')}</textarea>
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">نص البرومبت</label>
          <textarea name="body" required rows="8" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-mono);color:var(--color-text-primary);resize:vertical;transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">${esc(p.body)}</textarea>
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">التصنيف</label>
          <input type="text" name="category" value="${esc(p.category || '')}" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:var(--text-xs);font-weight:600;margin-bottom:var(--space-2);color:var(--color-text-secondary)">الوسوم</label>
          <input type="text" name="tags" value="${esc((p.tags || []).join(', '))}" style="width:100%;padding:14px 18px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:var(--text-sm);font-family:var(--font-sans);color:var(--color-text-primary);transition:all 0.3s" onfocus="this.style.borderColor='var(--color-primary)';this.style.boxShadow='var(--shadow-glow)'" onblur="this.style.borderColor='var(--color-border)';this.style.boxShadow='none'">
        </div>
        <div style="display:flex;gap:var(--space-2)">
          <button type="submit" class="btn btn-primary" style="flex:1;padding:16px">حفظ</button>
          <button type="button" class="btn btn-ghost" id="cancel-btn">إلغاء</button>
        </div>
      </form>
    </div>`;

    root.querySelector('#cancel-btn').addEventListener('click', () => history.back());
    root.querySelector('#edit-prompt-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd);
      if (data.tags) data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
      try {
        await ctx.api('/prompts/' + p.id, { method: 'PUT', body: data });
        ctx.toast('تم الحفظ');
        ctx.navigate('#/p/' + (p.slug || p.id));
      } catch (err) { ctx.toast(err.message, 'error'); }
    });
  } catch (e) {
    root.innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 8 — الملف الشخصي ══════════ */
async function profile(root, ctx) {
  const userId = ctx.id || ctx.state.user?.id;
  if (!userId) { ctx.navigate('#/login'); return; }

  root.innerHTML = `<div style="padding:var(--space-12) 0">${skeletonPromptDetail()}</div>`;

  try {
    const { user, prompts } = await ctx.api('/users/' + userId);
    const isMe = ctx.state.user?.id === user.id;

    root.innerHTML = `
    <div style="max-width:800px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:var(--space-5);margin-bottom:var(--space-8);flex-wrap:wrap;padding:var(--space-6);background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-xl)">
        ${avatar(user, 80)}
        <div style="flex:1;min-width:200px">
          <h1 style="font-size:var(--text-2xl);margin-bottom:var(--space-1)">${esc(user.name)}${user.verified ? VCHECK : ''}</h1>
          <p style="color:var(--color-text-muted);font-family:var(--font-mono);font-size:var(--text-sm);margin-bottom:var(--space-2)">@${esc(user.username)}</p>
          ${user.bio ? `<p style="color:var(--color-text-secondary);font-size:var(--text-sm)">${esc(user.bio)}</p>` : ''}
        </div>
        ${!isMe ? `<button class="btn btn-primary btn-sm" id="follow-btn">متابعة</button>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);margin-bottom:var(--space-8)">
        <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);text-align:center;transition:all 0.3s" onmouseover="this.style.borderColor='var(--color-primary)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--color-border)';this.style.transform='none'">
          <div style="font-size:var(--text-2xl);font-weight:800;font-family:var(--font-mono);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${user.promptsCount || 0}</div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-1)">برومبت</div>
        </div>
        <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);text-align:center;transition:all 0.3s" onmouseover="this.style.borderColor='var(--color-primary)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--color-border)';this.style.transform='none'">
          <div style="font-size:var(--text-2xl);font-weight:800;font-family:var(--font-mono);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${user.likesCount || 0}</div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-1)">إعجاب</div>
        </div>
        <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);text-align:center;transition:all 0.3s" onmouseover="this.style.borderColor='var(--color-primary)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--color-border)';this.style.transform='none'">
          <div style="font-size:var(--text-2xl);font-weight:800;font-family:var(--font-mono);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${user.followersCount || 0}</div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-1)">متابع</div>
        </div>
      </div>

      <h2 style="font-size:var(--text-xl);margin-bottom:var(--space-6)">برومبتات ${esc(user.name)}</h2>
      <div id="profile-prompts">
        ${prompts.length ? grid(prompts) : emptyState(ICON.empty, 'لا برومبتات', isMe ? 'انشر أول برومبت لك' : 'لم ينشر بعد')}
      </div>
    </div>`;

    const followBtn = root.querySelector('#follow-btn');
    if (followBtn) {
      followBtn.addEventListener('click', async () => {
        try {
          const res = await ctx.api('/users/' + user.id + '/follow', { method: 'POST' });
          followBtn.textContent = res.following ? 'متابَع' : 'متابعة';
        } catch (err) { ctx.toast(err.message, 'error'); }
      });
    }

    bindCards(root, ctx);
  } catch (e) {
    root.innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 9 — تفضيلاتي ══════════ */
async function favorites(root, ctx) {
  if (!ctx.state.user) { ctx.navigate('#/login'); return; }

  root.innerHTML = `
    <h1 style="font-size:var(--text-3xl);margin-bottom:var(--space-6);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">تفضيلاتي</h1>
    <div id="fav-list">${skeletonGrid(6)}</div>`;

  try {
    const res = await ctx.api('/prompts?sort=liked&limit=24');
    const el = root.querySelector('#fav-list');
    el.innerHTML = res.items.length ? grid(res.items) : emptyState(ICON.empty, 'لا تفضيلات', 'أعجب ببرومبتات لتظهر هنا');
    bindCards(root, ctx);
  } catch (e) {
    root.querySelector('#fav-list').innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 10 — لوحة الإدارة ══════════ */
async function admin(root, ctx) {
  if (ctx.state.user?.role !== 'admin') {
    root.innerHTML = emptyState(ICON.shield, 'وصول مرفوض', 'هذه الصفحة للمشرفين فقط');
    return;
  }

  root.innerHTML = `
    <h1 style="font-size:var(--text-3xl);margin-bottom:var(--space-6);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">لوحة الإدارة</h1>
    <div id="admin-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-4);margin-bottom:var(--space-8)">
      ${[1,2,3,4].map(() => `<div class="sk" style="height:100px;border-radius:var(--radius-lg)"></div>`).join('')}
    </div>
    <div id="admin-content"></div>`;

  try {
    const stats = await ctx.api('/admin/stats', { admin: true });
    root.querySelector('#admin-stats').innerHTML = `
      <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);transition:all 0.3s" onmouseover="this.style.borderColor='var(--color-primary)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--color-border)';this.style.transform='none'">
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-2)">المستخدمون</div>
        <div style="font-size:var(--text-2xl);font-weight:800;font-family:var(--font-mono);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${stats.users || 0}</div>
      </div>
      <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);transition:all 0.3s" onmouseover="this.style.borderColor='var(--color-primary)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--color-border)';this.style.transform='none'">
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-2)">البرومبتات</div>
        <div style="font-size:var(--text-2xl);font-weight:800;font-family:var(--font-mono);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${stats.prompts || 0}</div>
      </div>
      <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);transition:all 0.3s" onmouseover="this.style.borderColor='var(--color-primary)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--color-border)';this.style.transform='none'">
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-2)">التعليقات</div>
        <div style="font-size:var(--text-2xl);font-weight:800;font-family:var(--font-mono);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${stats.comments || 0}</div>
      </div>
      <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);transition:all 0.3s" onmouseover="this.style.borderColor='var(--color-primary)';this.style.transform='translateY(-4px)'" onmouseout="this.style.borderColor='var(--color-border)';this.style.transform='none'">
        <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-bottom:var(--space-2)">الإعجابات</div>
        <div style="font-size:var(--text-2xl);font-weight:800;font-family:var(--font-mono);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${stats.likes || 0}</div>
      </div>`;
  } catch (e) {
    root.querySelector('#admin-stats').innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 11 — غير متصل ══════════ */
async function offline(root, ctx) {
  root.innerHTML = `
    <div style="text-align:center;padding:var(--space-16) var(--space-6)">
      <div style="width:96px;height:96px;margin:0 auto var(--space-6);background:linear-gradient(135deg,var(--color-bg-elevated),var(--color-bg-card));border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;border:1px solid var(--color-border)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
      </div>
      <h2 style="font-size:var(--text-2xl);margin-bottom:var(--space-3)">أنت غير متصل</h2>
      <p style="color:var(--color-text-secondary);margin-bottom:var(--space-8)">تحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
      <button class="btn btn-primary" id="retry-btn" style="padding:16px 32px">إعادة المحاولة</button>
    </div>`;

  root.querySelector('#retry-btn').addEventListener('click', () => {
    ctx.navigate('#/');
  });
}

/* ═══════════ 12 — الإشعارات ═══════════ */
async function notifications(root, ctx) {
  if (!ctx.state.user) { ctx.navigate('#/login'); return; }

  root.innerHTML = `
    <h1 style="font-size:var(--text-3xl);margin-bottom:var(--space-6);background:linear-gradient(135deg,var(--color-primary),var(--color-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">الإشعارات</h1>
    <div id="notif-list">${skeletonGrid(6)}</div>`;

  try {
    const res = await ctx.api('/notifications');
    const el = root.querySelector('#notif-list');
    if (res.items && res.items.length) {
      el.innerHTML = `<div style="display:flex;flex-direction:column;gap:var(--space-3)">
        ${res.items.map(n => `
          <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-4);cursor:pointer;transition:all 0.3s" data-notif="${attr(n.id)}" onmouseover="this.style.borderColor='var(--color-primary)';this.style.transform='translateX(-4px)'" onmouseout="this.style.borderColor='var(--color-border)';this.style.transform='none'">
            <div style="font-size:var(--text-base);font-weight:600;margin-bottom:var(--space-1)">${esc(n.title || n.message)}</div>
            <div style="font-size:var(--text-xs);color:var(--color-text-muted)">${timeAgo(n.createdAt)}</div>
          </div>
        `).join('')}
      </div>`;
    } else {
      el.innerHTML = emptyState(ICON.bell, 'لا إشعارات', 'ستظهر إشعاراتك هنا');
    }
    ctx.decrementUnread(res.items?.length || 0);
  } catch (e) {
    root.querySelector('#notif-list').innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ Exports ══════════ */
export const Screens = {
  home,
  login,
  register,
  explore,
  prompt,
  newPrompt,
  editPrompt,
  profile,
  favorites,
  admin,
  offline,
  notifications
};