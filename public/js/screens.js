/* ═══════════════════════════════════════════════
   بطاقة البرومبت v8.0 — Airbnb Style Card
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
  <article class="prompt-card" data-prompt="${attr(p.id)}" data-slug="${attr(slugPath)}">
    <div class="pc-media">
      ${coverContent}
      ${p.category ? `<span class="pc-badge">${esc(p.category)}</span>` : ''}
      <button class="pc-wishlist" aria-label="إضافة للمفضلة" data-like="${attr(p.id)}">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="${p.liked ? 'var(--color-rausch)' : 'rgba(255,255,255,0.8)'}" stroke="${p.liked ? 'var(--color-rausch)' : '#ffffff'}" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
    <div class="pc-body">
      <div class="pc-head">
        <span class="pc-title">${esc(p.title)}</span>
      </div>
      <p class="pc-meta">${esc(p.author?.name || 'مجهول')} · ${timeAgo(p.createdAt)}</p>
      ${desc ? `<p class="pc-desc">${esc(desc)}</p>` : ''}
      <div class="pc-footer">
        <span class="pc-price">★ ${fmt(p.likes)} إعجاب</span>
      </div>
    </div>
  </article>`;
}

const grid = (items) => `<div class="grid-cards">${items.map((p, i) => promptCard(p, i)).join('')}</div>`;

/* ═══════════ الصفحة الرئيسية v8.0 ═══════════ */
async function home(root, ctx) {
  root.innerHTML = `
  <section class="hero" style="text-align: center; padding: 48px 0 64px;">
    <h1 style="font-size: 32px; margin-bottom: 12px;">اكتشف برومبتات عربية <span style="color: var(--color-rausch);">مكتوبة بإتقان</span></h1>
    <p style="color: var(--color-foggy); font-size: 16px; margin-bottom: 32px;">مكتبة مفتوحة لمشاركة أوامر الذكاء الاصطناعي — اكتشف، انسخ، وانشر.</p>
    
    <form class="search-capsule" id="hero-search-form">
      <div class="search-field">
        <label>المجال</label>
        <input id="hero-search-q" placeholder="ابحث عن برومبت (مثال: كتابة، برمجة)" autocomplete="off">
      </div>
      <button type="submit" class="search-submit" aria-label="بحث">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>
    </form>
  </section>

  <section class="section">
    <div class="section-title">
      <span>أحدث البرومبتات</span>
      <a class="btn btn-ghost" style="padding: 8px 16px; font-size: 14px;" href="#/explore?sort=new">عرض الكل ←</a>
    </div>
    <div id="home-latest">${skeletonGrid(6)}</div>
  </section>`;

  try {
    const latest = await ctx.api('/prompts?sort=new&limit=12');
    const el = root.querySelector('#home-latest');
    el.innerHTML = latest.items.length
      ? grid(latest.items)
      : `<div style="text-align:center; padding: 48px; color: var(--color-foggy);">لا توجد برومبتات بعد. كن أول من ينشر!</div>`;
    bindCards(root, ctx);
  } catch (e) {
    root.querySelector('#home-latest').innerHTML = `<div style="text-align:center; padding: 48px; color: var(--color-rausch);">تعذّر التحميل. يرجى المحاولة لاحقاً.</div>`;
  }
}