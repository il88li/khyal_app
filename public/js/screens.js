/* ═══════════════════════════════════════════════
   خيال v11.0 — Airbnb Design System
   ═══════════════════════════════════════════════ */

/* ── Helpers ─── */
function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
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
  userPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`,
  userCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`,
  empty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
};

const VCHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#ff385c" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v6c0 5 4 9 9 10 5-1 9-5 9-10V7l-9-5z"/><path d="m9 12 2 2 4-4"/></svg>`;

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
    <div style="text-align:center;padding:64px 24px;color:var(--color-foggy)">
      <div style="width:64px;height:64px;margin:0 auto 16px;opacity:0.4;background:var(--color-deco);border-radius:50%;display:flex;align-items:center;justify-content:center">${icon}</div>
      <h3 style="font-size:20px;margin-bottom:8px;color:var(--color-hof)">${esc(title)}</h3>
      <p style="font-size:14px">${esc(sub)}</p>
    </div>`;
}

function sectionHead(num, title, sub) {
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-24)">
      <div>
        <div style="font-size:var(--text-caption);color:var(--color-foggy);margin-bottom:4px">
          <span style="display:inline-block;width:6px;height:6px;border-radius:9999px;background:var(--color-hof);margin-inline-end:6px"></span>
          ${num} / ${esc(sub)}
        </div>
        <h2 style="font-size:var(--text-heading-sm);margin:0;font-weight:500;letter-spacing:-0.02em">${esc(title)}</h2>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════
   بطاقة البرومبت v11.0 — Airbnb Property Card
   ═══════════════════════════════════════════════ */
function promptCard(p, idx = 0) {
  const mark = (p.category || p.title || 'خ').charAt(0);
  const slugPath = p.slug || p.id;
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
        ${p.liked ? ICON.heartFill : ICON.heart}
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

/* ══════════ Bind Cards Events ═══════════ */
function bindCards(root, ctx) {
  root.querySelectorAll('[data-like]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.like;
      try {
        const res = await ctx.api('/prompts/' + id + '/like', { method: 'POST' });
        btn.dataset.liked = res.liked ? '1' : '0';
        btn.classList.toggle('liked', res.liked);
        btn.innerHTML = res.liked ? ICON.heartFill : ICON.heart;
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
  root.innerHTML = `
  <section class="hero">
    <div style="max-width:880px;margin:0 auto;text-align:center">
      <span class="badge-new" style="display:inline-block;padding:6px 16px;background:var(--color-rausch);color:#fff;border-radius:9999px;font-size:12px;font-weight:600;margin-bottom:24px">جديد · برومبتات كل أسبوع</span>
      <h1 style="font-size:40px;font-weight:800;margin-bottom:16px;line-height:1.2;letter-spacing:-0.02em">برومبتات عربية <span style="color:var(--color-rausch)">مكتوبة بإتقان</span><br>لأدوات الذكاء الاصطناعي</h1>
      <p style="font-size:16px;color:var(--color-foggy);margin-bottom:32px;line-height:1.6">مكتبة مفتوحة لمشاركة أوامر الذكاء الاصطناعي بالعربية — اكتشف، انسخ، وانشر.</p>
      
      <form class="search-capsule" id="hero-search-form" style="margin-bottom:32px">
        <div class="search-field">
          <label>ابحث عن برومبت</label>
          <input id="hero-search-q" placeholder="مثال: كتابة، برمجة، تصميم" autocomplete="off">
        </div>
        <button type="submit" class="search-submit" aria-label="بحث">
          ${ICON.search}
        </button>
      </form>

      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
        ${['كتابة ✍️', 'برمجة ', 'تصميم 🎨', 'تسويق 📢', 'تعليم 📚', 'تحليل بيانات 📊'].map(cat => `
          <a href="#/explore?q=${encodeURIComponent(cat.split(' ')[0])}" style="padding:8px 16px;background:var(--color-white);border-radius:9999px;font-size:14px;color:var(--color-hof);text-decoration:none;border:1px solid var(--color-bebe);transition:all 0.2s" onmouseover="this.style.borderColor='var(--color-hof)'" onmouseout="this.style.borderColor='var(--color-bebe)'">${cat}</a>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    ${sectionHead('01', 'أحدث البرومبتات', 'وصل حديثاً')}
    <div id="home-latest">${skeletonGrid(6)}</div>
  </section>`;

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
    <div style="min-height:calc(100vh - 200px);display:flex;align-items:center;justify-content:center;padding:24px">
      <div style="max-width:420px;width:100%;background:var(--color-white);border-radius:var(--radius-xl);padding:40px;box-shadow:var(--shadow-subtle)">
        <div style="text-align:center;margin-bottom:32px">
          <div style="font-size:48px;margin-bottom:16px">🔥</div>
          <h1 style="font-size:28px;font-weight:800;margin-bottom:8px;color:var(--color-hof);letter-spacing:-0.02em">مرحباً بعودتك</h1>
          <p style="color:var(--color-foggy);font-size:14px">سجّل دخولك لمتابعة برومبتاتك</p>
        </div>
        
        <form id="login-form" style="display:flex;flex-direction:column;gap:20px">
          <div>
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">البريد الإلكتروني</label>
            <input type="email" name="email" required placeholder="you@example.com" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">كلمة المرور</label>
            <input type="password" name="password" required placeholder="••••••••" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
          </div>
          <button type="submit" class="btn-primary-full" style="width:100%;padding:16px;background:var(--color-rausch);color:#fff;border:none;border-radius:var(--radius-lg);font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='var(--color-rausch-600)'" onmouseout="this.style.background='var(--color-rausch)'">دخول</button>
        </form>
        
        <div style="text-align:center;margin-top:24px">
          <p style="color:var(--color-foggy);font-size:14px">
            ليس لديك حساب؟ 
            <a href="#/register" style="color:var(--color-rausch);font-weight:600;text-decoration:none">أنشئ حساباً</a>
          </p>
        </div>

        <div style="margin-top:32px;padding:16px;background:var(--color-faint);border-radius:var(--radius-md);text-align:center">
          <p style="font-size:12px;color:var(--color-foggy);margin:0">
            تجريبي: <code style="background:var(--color-white);padding:4px 8px;border-radius:4px">sara@khayal.app</code> / <code style="background:var(--color-white);padding:4px 8px;border-radius:4px">123456</code>
          </p>
        </div>
      </div>
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

/* ═══════════ 3 — تسجيل حساب جديد ═══════════ */
async function register(root, ctx) {
  root.innerHTML = `
    <div style="min-height:calc(100vh - 200px);display:flex;align-items:center;justify-content:center;padding:24px">
      <div style="max-width:420px;width:100%;background:var(--color-white);border-radius:var(--radius-xl);padding:40px;box-shadow:var(--shadow-subtle)">
        <div style="text-align:center;margin-bottom:32px">
          <h1 style="font-size:28px;font-weight:800;margin-bottom:8px;color:var(--color-hof);letter-spacing:-0.02em">حساب جديد</h1>
          <p style="color:var(--color-foggy);font-size:14px">انضم إلى مجتمع خيال</p>
        </div>
        
        <form id="register-form" style="display:flex;flex-direction:column;gap:20px">
          <div>
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">الاسم</label>
            <input type="text" name="name" required style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">اسم المستخدم</label>
            <input type="text" name="username" required pattern="[a-zA-Z0-9_]+" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">البريد الإلكتروني</label>
            <input type="email" name="email" required style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
          </div>
          <div>
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">كلمة المرور</label>
            <input type="password" name="password" required minlength="6" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
          </div>
          <button type="submit" class="btn-primary-full" style="width:100%;padding:16px;background:var(--color-rausch);color:#fff;border:none;border-radius:var(--radius-lg);font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='var(--color-rausch-600)'" onmouseout="this.style.background='var(--color-rausch)'">إنشاء الحساب</button>
        </form>
        
        <div style="text-align:center;margin-top:24px">
          <p style="color:var(--color-foggy);font-size:14px">
            لديك حساب؟ 
            <a href="#/login" style="color:var(--color-rausch);font-weight:600;text-decoration:none">سجّل دخولك</a>
          </p>
        </div>
      </div>
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

/* ══════════ 4 — استكشف ══════════ */
async function explore(root, ctx) {
  const q = ctx.params.q || '';
  const sort = ctx.params.sort || 'new';
  
  root.innerHTML = `
    <section class="hero" style="padding:var(--spacing-32) 0">
      <h1 style="font-size:var(--text-heading);margin-bottom:var(--spacing-24)">استكشف البرومبتات</h1>
      <form class="search-capsule" id="explore-search" style="margin-bottom:var(--spacing-32)">
        <div class="search-field">
          <input id="explore-q" value="${esc(q)}" placeholder="ابحث..." autocomplete="off" style="color:var(--color-hof)">
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
    <div style="padding:var(--spacing-8) 0">
      <button class="btn-ghost btn-sm" id="back-btn" style="border-radius:var(--radius-lg);padding:8px 16px">
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
    <div style="padding:var(--spacing-8) 0">
      <button class="btn-ghost btn-sm" id="back-btn" style="border-radius:var(--radius-lg);padding:8px 16px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        رجوع
      </button>
    </div>

    <div style="margin-top:var(--spacing-24)">
      <div style="position:relative;aspect-ratio:16/9;background:var(--color-deco);border-radius:var(--radius-xl);overflow:hidden;margin-bottom:var(--spacing-24)">
        ${p.cover 
          ? `<img src="${esc(p.cover)}" alt="" style="width:100%;height:100%;object-fit:cover">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:96px;font-weight:700;color:var(--color-grey-500)">${esc(mark)}</div>`}
      </div>

      <h1 style="font-size:var(--text-heading);font-weight:700;margin-bottom:var(--spacing-12);letter-spacing:-0.02em">${esc(p.title)}</h1>
      <p style="color:var(--color-foggy);line-height:1.43;font-size:14px;margin-bottom:var(--spacing-24)">${esc(description)}</p>

      <div style="display:flex;align-items:center;gap:var(--spacing-16);margin-bottom:var(--spacing-24);flex-wrap:wrap;padding:var(--spacing-16);background:var(--color-white);border-radius:var(--radius-cards);box-shadow:var(--shadow-subtle)">
        ${avatar(p.author, 48)}
        <div style="flex:1">
          <div style="font-size:14px;font-weight:600;color:var(--color-hof)">${esc(p.author?.name || 'مجهول')}${p.author?.verified ? VCHECK : ''}</div>
          <div style="font-size:12px;color:var(--color-foggy);font-family:var(--font-mono)">@${esc(p.author?.username || 'unknown')}</div>
        </div>
        <div style="display:flex;gap:var(--spacing-8)">
          ${isOwner 
            ? `<a class="btn-ghost btn-sm" href="#/edit/${attr(p.id)}" style="border-radius:var(--radius-lg);padding:8px 16px">${ICON.edit} تعديل</a>`
            : `<button class="btn-ghost btn-sm" id="follow-btn" data-following="${isFollowingAuthor ? '1' : '0'}" style="border-radius:var(--radius-lg);padding:8px 16px">
                ${isFollowingAuthor ? ICON.userCheck + ' متابَع' : ICON.userPlus + ' متابعة'}
              </button>`}
        </div>
      </div>

      <div style="background:var(--color-white);border-radius:var(--radius-xl);padding:var(--spacing-24);margin-bottom:var(--spacing-24);position:relative;overflow:hidden;box-shadow:var(--shadow-subtle)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--spacing-16)">
          <span style="font-size:12px;font-family:var(--font-mono);color:var(--color-foggy)">prompt.txt</span>
          <button class="btn-ghost btn-sm" id="copy-btn" style="border-radius:var(--radius-lg);padding:8px 16px">${ICON.copy} نسخ</button>
        </div>
        <pre id="prompt-body" style="margin:0;font-family:var(--font-mono);font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word;color:var(--color-hof);background:var(--color-faint);padding:var(--spacing-16);border-radius:var(--radius-lg)">${esc(p.body)}</pre>
      </div>

      <div style="display:flex;gap:var(--spacing-8);flex-wrap:wrap;margin-bottom:var(--spacing-24)">
        <button class="btn-ghost btn-sm" id="like-btn" data-liked="${p.liked ? '1' : '0'}" style="border-radius:var(--radius-lg);padding:8px 16px">
          <span id="like-ic">${p.liked ? ICON.heartFill : ICON.heart}</span>
          <span id="like-n">${p.likes}</span>
        </button>
        <button class="btn-ghost btn-sm" id="share-btn" style="border-radius:var(--radius-lg);padding:8px 16px">${ICON.share} مشاركة</button>
        <button class="btn-primary-full" id="copy-bottom" style="padding:8px 20px;border-radius:var(--radius-lg)">${ICON.copy} نسخ النص</button>
      </div>

      ${(p.tags || []).length ? `
      <div style="display:flex;gap:var(--spacing-8);flex-wrap:wrap;margin-bottom:var(--spacing-24)">
        ${(p.tags || []).map((t) => `<a class="btn-ghost btn-sm" href="#/explore?q=${encodeURIComponent(t)}" style="border-radius:var(--radius-badges);font-size:12px;padding:6px 12px">#${esc(t)}</a>`).join('')}
      </div>` : ''}
    </div>

    ${related.length ? `
    <section class="section" style="margin-top:var(--spacing-48)">
      ${sectionHead('03', 'ذات صلة', 'برومبتات مشابهة')}
      ${grid(related)}
    </section>` : ''}

    <section class="comments-section" style="margin-top:var(--spacing-48)">
      <h3 style="font-size:var(--text-subheading);margin-bottom:var(--spacing-24);font-weight:600">${ICON.chat} التعليقات <span style="color:var(--color-foggy);font-size:14px;font-weight:400">(${p.commentsCount || 0})</span></h3>
      <div id="cm-list"></div>
    </section>`;

    root.querySelector('#back-btn').addEventListener('click', () => history.back());
    
    const copyAction = async () => {
      try {
        await navigator.clipboard.writeText(p.body);
        ctx.toast('تم النسخ');
      } catch { ctx.toast('فشل النسخ', 'error'); }
    };
    root.querySelector('#copy-btn').addEventListener('click', copyAction);
    root.querySelector('#copy-bottom').addEventListener('click', copyAction);

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
  if (!ctx.state.user) { ctx.navigate('#/login'); return; }

  root.innerHTML = `
    <div style="max-width:640px;margin:0 auto;padding:var(--spacing-24)">
      <h1 style="font-size:var(--text-heading);margin-bottom:var(--spacing-8)">نشر برومبت جديد</h1>
      <p style="color:var(--color-foggy);margin-bottom:var(--spacing-32);font-size:14px">شارك إبداعك مع المجتمع</p>
      
      <form id="new-prompt-form" style="display:flex;flex-direction:column;gap:var(--spacing-20);background:var(--color-white);padding:var(--spacing-24);border-radius:var(--radius-xl);box-shadow:var(--shadow-subtle)">
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">العنوان</label>
          <input type="text" name="title" required style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">الوصف</label>
          <textarea name="description" rows="3" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);resize:vertical;transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'"></textarea>
        </div>
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">نص البرومبت</label>
          <textarea name="body" required rows="8" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-mono);color:var(--color-hof);resize:vertical;transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'"></textarea>
        </div>
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">التصنيف</label>
          <input type="text" name="category" placeholder="مثال: كتابة، برمجة" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">الوسوم (مفصولة بفاصلة)</label>
          <input type="text" name="tags" placeholder="مثال: gpt4, كتابة, إبداع" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
        </div>
        <button type="submit" class="btn-primary-full" style="width:100%;padding:16px;background:var(--color-rausch);color:#fff;border:none;border-radius:var(--radius-lg);font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='var(--color-rausch-600)'" onmouseout="this.style.background='var(--color-rausch)'">نشر</button>
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

/* ═══════════ 7 — تعديل برومبت ═══════════ */
async function editPrompt(root, ctx) {
  if (!ctx.state.user) { ctx.navigate('#/login'); return; }
  root.innerHTML = `<div style="padding:var(--spacing-48) 0">${skeletonPromptDetail()}</div>`;

  try {
    const { prompt: p } = await ctx.api('/prompts/' + ctx.id);
    if (ctx.state.user.id !== p.authorId) {
      ctx.toast('ليس لديك صلاحية', 'error');
      ctx.navigate('#/');
      return;
    }

    root.innerHTML = `
    <div style="max-width:640px;margin:0 auto;padding:var(--spacing-24)">
      <h1 style="font-size:var(--text-heading);margin-bottom:var(--spacing-8)">تعديل البرومبت</h1>
      <p style="color:var(--color-foggy);margin-bottom:var(--spacing-32);font-size:14px">${esc(p.title)}</p>
      
      <form id="edit-prompt-form" style="display:flex;flex-direction:column;gap:var(--spacing-20);background:var(--color-white);padding:var(--spacing-24);border-radius:var(--radius-xl);box-shadow:var(--shadow-subtle)">
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">العنوان</label>
          <input type="text" name="title" required value="${esc(p.title)}" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">الوصف</label>
          <textarea name="description" rows="3" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);resize:vertical;transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">${esc(p.description || '')}</textarea>
        </div>
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">نص البرومبت</label>
          <textarea name="body" required rows="8" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-mono);color:var(--color-hof);resize:vertical;transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">${esc(p.body)}</textarea>
        </div>
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">التصنيف</label>
          <input type="text" name="category" value="${esc(p.category || '')}" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
        </div>
        <div>
          <label style="display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:var(--color-hof)">الوسوم</label>
          <input type="text" name="tags" value="${esc((p.tags || []).join(', '))}" style="width:100%;padding:14px 16px;background:var(--color-white);border:1px solid var(--color-bebe);border-radius:var(--radius-lg);font-size:14px;font-family:var(--font-sans);color:var(--color-hof);transition:all 0.2s;outline:none" onfocus="this.style.borderColor='var(--color-hof)';this.style.boxShadow='0 0 0 3px rgba(34,34,34,0.1)'" onblur="this.style.borderColor='var(--color-bebe)';this.style.boxShadow='none'">
        </div>
        <div style="display:flex;gap:var(--spacing-8)">
          <button type="submit" class="btn-primary-full" style="flex:1;padding:16px;background:var(--color-rausch);color:#fff;border:none;border-radius:var(--radius-lg);font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s" onmouseover="this.style.background='var(--color-rausch-600)'" onmouseout="this.style.background='var(--color-rausch)'">حفظ</button>
          <button type="button" class="btn-ghost" id="cancel-btn" style="border-radius:var(--radius-lg);padding:16px">إلغاء</button>
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
  root.innerHTML = `<div style="padding:var(--spacing-48) 0">${skeletonPromptDetail()}</div>`;

  try {
    const { user, prompts } = await ctx.api('/users/' + userId);
    const isMe = ctx.state.user?.id === user.id;

    root.innerHTML = `
    <div style="max-width:800px;margin:0 auto;padding:var(--spacing-24)">
      <div style="display:flex;align-items:center;gap:var(--spacing-20);margin-bottom:var(--spacing-32);flex-wrap:wrap;padding:var(--spacing-24);background:var(--color-white);border-radius:var(--radius-xl);box-shadow:var(--shadow-subtle)">
        ${avatar(user, 80)}
        <div style="flex:1;min-width:200px">
          <h1 style="font-size:var(--text-heading-sm);margin-bottom:var(--spacing-4)">${esc(user.name)}${user.verified ? VCHECK : ''}</h1>
          <p style="color:var(--color-foggy);font-family:var(--font-mono);font-size:12px;margin-bottom:var(--spacing-8)">@${esc(user.username)}</p>
          ${user.bio ? `<p style="color:var(--color-foggy);font-size:14px;line-height:1.43">${esc(user.bio)}</p>` : ''}
        </div>
        ${!isMe ? `<button class="btn-primary-full" id="follow-btn" style="padding:12px 24px;border-radius:var(--radius-lg)">متابعة</button>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--spacing-12);margin-bottom:var(--spacing-32)">
        <div style="background:var(--color-white);border-radius:var(--radius-cards);padding:var(--spacing-20);text-align:center;box-shadow:var(--shadow-subtle)">
          <div style="font-size:var(--text-heading-sm);font-weight:700;font-family:var(--font-mono)">${user.promptsCount || 0}</div>
          <div style="font-size:12px;color:var(--color-foggy);margin-top:var(--spacing-4)">برومبت</div>
        </div>
        <div style="background:var(--color-white);border-radius:var(--radius-cards);padding:var(--spacing-20);text-align:center;box-shadow:var(--shadow-subtle)">
          <div style="font-size:var(--text-heading-sm);font-weight:700;font-family:var(--font-mono)">${user.likesCount || 0}</div>
          <div style="font-size:12px;color:var(--color-foggy);margin-top:var(--spacing-4)">إعجاب</div>
        </div>
        <div style="background:var(--color-white);border-radius:var(--radius-cards);padding:var(--spacing-20);text-align:center;box-shadow:var(--shadow-subtle)">
          <div style="font-size:var(--text-heading-sm);font-weight:700;font-family:var(--font-mono)">${user.followersCount || 0}</div>
          <div style="font-size:12px;color:var(--color-foggy);margin-top:var(--spacing-4)">متابع</div>
        </div>
      </div>

      <h2 style="font-size:var(--text-subheading);margin-bottom:var(--spacing-24);font-weight:600">برومبتات ${esc(user.name)}</h2>
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
    <div style="padding:var(--spacing-24)">
      <h1 style="font-size:var(--text-heading);margin-bottom:var(--spacing-24)">تفضيلاتي</h1>
      <div id="fav-list">${skeletonGrid(6)}</div>
    </div>`;

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
    <div style="padding:var(--spacing-24)">
      <h1 style="font-size:var(--text-heading);margin-bottom:var(--spacing-24)">لوحة الإدارة</h1>
      <div id="admin-stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--spacing-16);margin-bottom:var(--spacing-32)">
        ${[1,2,3,4].map(() => `<div class="sk" style="height:100px;border-radius:var(--radius-cards)"></div>`).join('')}
      </div>
      <div id="admin-content"></div>
    </div>`;

  try {
    const stats = await ctx.api('/admin/stats', { admin: true });
    root.querySelector('#admin-stats').innerHTML = `
      <div style="background:var(--color-white);border-radius:var(--radius-cards);padding:var(--spacing-20);box-shadow:var(--shadow-subtle)">
        <div style="font-size:12px;color:var(--color-foggy);margin-bottom:var(--spacing-8)">المستخدمون</div>
        <div style="font-size:var(--text-heading-sm);font-weight:700;font-family:var(--font-mono)">${stats.users || 0}</div>
      </div>
      <div style="background:var(--color-white);border-radius:var(--radius-cards);padding:var(--spacing-20);box-shadow:var(--shadow-subtle)">
        <div style="font-size:12px;color:var(--color-foggy);margin-bottom:var(--spacing-8)">البرومبتات</div>
        <div style="font-size:var(--text-heading-sm);font-weight:700;font-family:var(--font-mono)">${stats.prompts || 0}</div>
      </div>
      <div style="background:var(--color-white);border-radius:var(--radius-cards);padding:var(--spacing-20);box-shadow:var(--shadow-subtle)">
        <div style="font-size:12px;color:var(--color-foggy);margin-bottom:var(--spacing-8)">التعليقات</div>
        <div style="font-size:var(--text-heading-sm);font-weight:700;font-family:var(--font-mono)">${stats.comments || 0}</div>
      </div>
      <div style="background:var(--color-white);border-radius:var(--radius-cards);padding:var(--spacing-20);box-shadow:var(--shadow-subtle)">
        <div style="font-size:12px;color:var(--color-foggy);margin-bottom:var(--spacing-8)">الإعجابات</div>
        <div style="font-size:var(--text-heading-sm);font-weight:700;font-family:var(--font-mono)">${stats.likes || 0}</div>
      </div>`;
  } catch (e) {
    root.querySelector('#admin-stats').innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 11 — غير متصل ══════════ */
async function offline(root, ctx) {
  root.innerHTML = `
    <div style="text-align:center;padding:var(--spacing-48) var(--spacing-24);min-height:60vh;display:flex;align-items:center;justify-content:center">
      <div>
        <div style="width:80px;height:80px;margin:0 auto var(--spacing-24);background:var(--color-deco);border-radius:50%;display:flex;align-items:center;justify-content:center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-grey-500)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
        </div>
        <h2 style="font-size:var(--text-subheading);margin-bottom:var(--spacing-8)">أنت غير متصل</h2>
        <p style="color:var(--color-foggy);margin-bottom:var(--spacing-32);font-size:14px">تحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
        <button class="btn-primary-full" id="retry-btn" style="padding:12px 32px;border-radius:var(--radius-lg)">إعادة المحاولة</button>
      </div>
    </div>`;
  root.querySelector('#retry-btn').addEventListener('click', () => ctx.navigate('#/'));
}

/* ═══════════ 12 — الإشعارات ═══════════ */
async function notifications(root, ctx) {
  if (!ctx.state.user) { ctx.navigate('#/login'); return; }
  root.innerHTML = `
    <div style="padding:var(--spacing-24)">
      <h1 style="font-size:var(--text-heading);margin-bottom:var(--spacing-24)">الإشعارات</h1>
      <div id="notif-list">${skeletonGrid(6)}</div>
    </div>`;

  try {
    const res = await ctx.api('/notifications');
    const el = root.querySelector('#notif-list');
    if (res.items && res.items.length) {
      el.innerHTML = `<div style="display:flex;flex-direction:column;gap:var(--spacing-12)">
        ${res.items.map(n => `
          <div style="background:var(--color-white);border-radius:var(--radius-cards);padding:var(--spacing-16);cursor:pointer;box-shadow:var(--shadow-subtle);transition:transform 0.2s" data-notif="${attr(n.id)}" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
            <div style="font-size:14px;font-weight:600;margin-bottom:var(--spacing-4);color:var(--color-hof)">${esc(n.title || n.message)}</div>
            <div style="font-size:12px;color:var(--color-foggy)">${timeAgo(n.createdAt)}</div>
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

/* ═══════════ التصدير الصحيح ══════════ */
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