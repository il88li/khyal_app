import {
  skeletonGrid, skeletonProfile, skeletonPromptDetail,
  skeletonAdminTab, skeletonSectionHead,
  skeletonComments, skeletonNotifications
} from './skeleton.js';

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */
const esc = (s = '') => String(s).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const attr = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')
  .replace(/`/g, '&#96;');

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
    ? `<img src="${esc(u.avatar)}" alt="" loading="lazy" decoding="async">`
    : esc(initials(u?.name || '؟'));
  return `<span class="avatar ${u?.verified ? 'verified' : ''}" style="--s:${size}px">${inner}</span>`;
};

const VCHECK = `<span class="verify-check" title="موثّق">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9 17.5 20 6.5"/></svg>
</span>`;

/* ═══════════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════════ */
const ICON = {
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/></svg>`,
  heartFill: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.2 10.7 19C5.4 14.4 2 11.5 2 7.9 2 5 4.2 3 7 3c1.6 0 3.1.7 4 1.9C12 3.7 13.5 3 15.1 3 17.9 3 20 5 20 7.9c0 3.6-3.4 6.5-8.7 11.1Z"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9 17.5 20 6.5"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z"/></svg>`,
  chev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="chev"><path d="m6 9 6 6 6-6"/></svg>`,
  expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4Z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>`,
  empty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"/><path d="M12 12v8M4 8.5 12 12l8-3.5"/></svg>`,
  wifiOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.8a10 10 0 0 1 3-1.9M16 10.9a10 10 0 0 1 3 1.9M2 9.2A15 15 0 0 1 8 6.1M16 6.1a15 15 0 0 1 6 3.1"/><circle cx="12" cy="20" r=".6" fill="currentColor"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16v4ZM14 6l4 4"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 15v5h14v-5"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>`,
  userPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="8.5" r="3.5"/><path d="M3 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/><path d="M18 8v6M15 11h6"/></svg>`,
  userCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="8.5" r="3.5"/><path d="M3 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/><path d="m16 11 2 2 4-4"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>`,
  fileText: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12l4 4v12H4z"/><path d="M8 10h8M8 14h6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`
};

/* ═══════════════════════════════════════════════
   بطاقة البرومبت v7 — Split Layout
   ═══════════════════════════════════════════════ */
function promptCard(p, idx = 0) {
  const mark = (p.category || p.title || 'خ').charAt(0);
  const slugPath = p.slug || p.id;
  const isOwner = !!p.isOwner;
  const isFollowing = !!p.isFollowingAuthor;
  const tags = (p.tags || []).slice(0, 3);
  const desc = p.description || p.body.replace(/\s+/g, ' ').slice(0, 140);

  const coverContent = p.cover
    ? `<img class="pc-media-img" src="${esc(p.cover)}" alt="" loading="lazy" decoding="async">`
    : `<span class="pc-media-mark">${esc(mark)}</span>`;

  const floatAvatar = p.author?.avatar
    ? `<img src="${esc(p.author.avatar)}" alt="" loading="lazy" decoding="async">`
    : esc(initials(p.author?.name || '؟'));

  return `
  <article class="prompt-card" data-prompt="${attr(p.id)}" data-slug="${attr(slugPath)}" data-author="${attr(p.authorId)}">
    <div class="pc-media-split">
      ${coverContent}
      ${p.category ? `<span class="pc-badge">${esc(p.category)}</span>` : ''}
      <a class="pc-float-av ${p.author?.verified ? 'verified' : ''}"
         href="#/u/${attr(p.authorId)}"
         title="${esc(p.author?.name || '')}"
         aria-label="زيارة الملف الشخصي">${floatAvatar}</a>
      <div class="pc-dots-nav" aria-hidden="true">
        <i class="active"></i>
      </div>
    </div>

    <div class="pc-body-split">
      <div class="pc-head">
        <a class="pc-name" href="#/u/${attr(p.authorId)}">
          <span>${esc(p.author?.name || 'مجهول')}</span>
          ${p.author?.verified ? VCHECK : ''}
        </a>
        ${isOwner
          ? `<span class="pc-self">أنت</span>`
          : `<button class="pc-follow ${isFollowing ? 'following' : ''}"
                     data-follow="${attr(p.authorId)}"
                     data-following="${isFollowing ? '1' : '0'}">
               ${isFollowing ? 'متابَع' : '+ متابعة'}
             </button>`}
      </div>

      <a class="pc-title-new" href="#/p/${attr(slugPath)}">${esc(p.title)}</a>

      ${desc ? `<p class="pc-desc-new">${esc(desc)}</p>` : ''}

      ${tags.length ? `
      <div class="pc-tags-new">
        ${tags.map((t) => `<a class="pc-tag" href="#/explore?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}
      </div>` : ''}

      <div class="pc-footer">
        <button class="pc-stat ${p.liked ? 'liked' : ''}"
                data-like="${attr(p.id)}"
                data-liked="${p.liked ? '1' : '0'}"
                aria-label="إعجاب">
          ${p.liked ? ICON.heartFill : ICON.heart}
          <span class="pc-num">${fmt(p.likes)}</span>
        </button>

        <button class="pc-stat" data-expand="${attr(p.id)}" aria-label="التعليقات">
          ${ICON.chat}
          <span class="pc-num">${fmt(p.commentsCount || 0)}</span>
        </button>

        <button class="pc-stat" data-share="${attr(p.id)}" aria-label="مشاركة" style="padding:6px 8px">
          ${ICON.share}
        </button>

        <button class="pc-view-new" data-expand="${attr(p.id)}">
          <span>عرض</span>
          <span class="pc-chev">${ICON.chev}</span>
        </button>
      </div>
    </div>

    <div class="pc-panel" data-panel="${attr(p.id)}">
      <div class="pc-panel-inner">
        <div class="pc-panel-body">
          <div class="pc-prompt">
            <div class="pc-prompt-head">
              <span class="pc-dots"><i></i><i></i><i></i></span>
              <span class="pc-prompt-name">prompt.txt</span>
              <button class="pc-mini-btn" data-copy="${attr(p.id)}" title="نسخ" aria-label="نسخ">
                ${ICON.copy}
              </button>
            </div>
            <div class="pc-prompt-scroll">
              <pre class="pc-prompt-text">${esc(p.body)}</pre>
            </div>
          </div>

          <div class="pc-comments" data-comments="${attr(p.id)}">
            <div class="pc-comments-loading">…</div>
          </div>
        </div>
      </div>
    </div>
  </article>`;
}

const grid = (items) => `<div class="grid-cards">${items.map((p, i) => promptCard(p, i)).join('')}</div>`;

/* ═══════════════════════════════════════════════
   bindCards — ربط الأحداث بالبطاقات
   ═══════════════════════════════════════════════ */
function bindCards(root, ctx) {
  root.querySelectorAll('[data-like]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!ctx.state.user) {
        ctx.toast('سجّل الدخول للإعجاب', 'error');
        return ctx.navigate('#/login');
      }
      const id = btn.dataset.like;
      const wasLiked = btn.dataset.liked === '1';
      const nEl = btn.querySelector('.pc-num');
      const wasCount = parseInt(nEl.textContent.replace(/[^\d]/g, '')) || 0;
      const newLiked = !wasLiked;
      const newCount = Math.max(0, wasCount + (newLiked ? 1 : -1));

      btn.dataset.liked = newLiked ? '1' : '0';
      btn.classList.toggle('liked', newLiked);
      if (newLiked) {
        btn.classList.add('just-liked');
        setTimeout(() => btn.classList.remove('just-liked'), 600);
      }
      const svg = btn.querySelector('svg');
      if (svg) svg.outerHTML = newLiked ? ICON.heartFill : ICON.heart;
      nEl.textContent = fmt(newCount);

      ctx.api(`/prompts/${id}/like`, { method: 'POST', useCache: false })
        .then((r) => {
          btn.dataset.liked = r.liked ? '1' : '0';
          btn.classList.toggle('liked', r.liked);
          const s2 = btn.querySelector('svg');
          if (s2) s2.outerHTML = r.liked ? ICON.heartFill : ICON.heart;
          nEl.textContent = fmt(r.likes);
        })
        .catch((ex) => {
          btn.dataset.liked = wasLiked ? '1' : '0';
          btn.classList.toggle('liked', wasLiked);
          const s3 = btn.querySelector('svg');
          if (s3) s3.outerHTML = wasLiked ? ICON.heartFill : ICON.heart;
          nEl.textContent = fmt(wasCount);
          ctx.toast(ex.message, 'error');
        });
    });
  });

  root.querySelectorAll('[data-follow]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!ctx.state.user) {
        ctx.toast('سجّل الدخول للمتابعة', 'error');
        return ctx.navigate('#/login');
      }
      const authorId = btn.dataset.follow;
      const isNow = btn.dataset.following === '1';
      const newState = !isNow;

      btn.dataset.following = newState ? '1' : '0';
      btn.classList.toggle('following', newState);
      btn.textContent = newState ? 'متابَع' : '+ متابعة';

      ctx.api(`/users/${authorId}/follow`, { method: 'POST', useCache: false })
        .then((r) => {
          const actual = !!r.following;
          btn.dataset.following = actual ? '1' : '0';
          btn.classList.toggle('following', actual);
          btn.textContent = actual ? 'متابَع' : '+ متابعة';
          ctx.toast(actual ? 'تتابع الآن' : 'ألغيت المتابعة');
        })
        .catch((ex) => {
          btn.dataset.following = isNow ? '1' : '0';
          btn.classList.toggle('following', isNow);
          btn.textContent = isNow ? 'متابَع' : '+ متابعة';
          ctx.toast(ex.message, 'error');
        });
    });
  });

  root.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.copy;
      const card = btn.closest('.prompt-card');
      const pre = card?.querySelector('.pc-prompt-text');
      const text = pre?.textContent || '';
      if (!text) return;

      try { await navigator.clipboard.writeText(text); }
      catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      ctx.api(`/prompts/${id}/copy`, { method: 'POST', useCache: false }).catch(() => {});

      btn.classList.add('copied');
      const old = btn.innerHTML;
      btn.innerHTML = ICON.check;
      ctx.toast('تم النسخ');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = old;
      }, 1500);
    });
  });

  root.querySelectorAll('[data-share]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.share;
      const card = btn.closest('.prompt-card');
      const slug = card?.dataset.slug || id;
      const title = card?.querySelector('.pc-title-new')?.textContent || '';
      const url = location.origin + '/#/p/' + slug;

      if (navigator.share) {
        try { await navigator.share({ title, url }); return; } catch { /* تجاهل */ }
      }
      try {
        await navigator.clipboard.writeText(url);
        ctx.toast('تم نسخ الرابط');
      } catch { ctx.toast('تعذّر النسخ', 'error'); }
    });
  });

  root.querySelectorAll('[data-expand]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const id = btn.dataset.expand;
      const card = btn.closest('.prompt-card');
      const panel = card.querySelector(`[data-panel="${id}"]`);
      const viewBtn = card.querySelector('.pc-view-new');
      const isOpen = panel.classList.toggle('open');
      card.classList.toggle('expanded', isOpen);
      if (viewBtn) {
        viewBtn.classList.toggle('open', isOpen);
        const txt = viewBtn.querySelector('span');
        if (txt) txt.textContent = isOpen ? 'إغلاق' : 'عرض';
      }

      if (isOpen) {
        const box = card.querySelector(`[data-comments="${id}"]`);
        if (box && box.dataset.loaded !== '1') {
          box.dataset.loaded = '1';
          await loadInlineComments(box, id, ctx);
        }
      }
    });
  });

  root.querySelectorAll('.prompt-card').forEach((card) => {
    let hoverTimer;
    const startPrefetch = () => {
      hoverTimer = setTimeout(() => {
        const slug = card.dataset.slug;
        if (slug && ctx.prefetchPrompt) {
          ctx.prefetchPrompt(slug);
        }
      }, 200);
    };
    const cancelPrefetch = () => { if (hoverTimer) clearTimeout(hoverTimer); };
    card.addEventListener('mouseenter', startPrefetch);
    card.addEventListener('mouseleave', cancelPrefetch);
    card.addEventListener('touchstart', startPrefetch, { passive: true });
    card.addEventListener('touchend', cancelPrefetch, { passive: true });
    card.addEventListener('touchcancel', cancelPrefetch, { passive: true });
  });
}

/* ═══════════════════════════════════════════════
   تعليقات البطاقة (Inline)
   ═══════════════════════════════════════════════ */
async function loadInlineComments(box, promptId, ctx) {
  try {
    const { items, total } = await ctx.api(`/prompts/${promptId}/comments?limit=3&offset=0`);

    const renderItem = (c) => `
      <div class="pc-comment">
        <span class="pc-comment-av">
          ${c.author?.avatar
            ? `<img src="${esc(c.author.avatar)}" alt="" loading="lazy" decoding="async">`
            : esc(initials(c.author?.name || '؟'))}
        </span>
        <div class="pc-comment-body">
          <div class="pc-comment-name">
            ${esc(c.author?.name || 'مجهول')}
            ${c.author?.verified ? VCHECK : ''}
            <span class="pc-comment-time">${timeAgo(c.createdAt)}</span>
          </div>
          <div class="pc-comment-text">${esc(c.body)}</div>
        </div>
      </div>`;

    box.innerHTML = `
      ${ctx.state.user ? `
      <div class="pc-comment-form">
        <input class="pc-comment-input" type="text" placeholder="اكتب تعليقاً…" maxlength="500" data-comment-input>
        <button class="pc-comment-send" data-comment-send disabled>${ICON.send}</button>
      </div>` : `
      <div class="pc-comments-empty">
        <a href="#/login" style="color:var(--orange);font-weight:600">سجّل الدخول</a> للتعليق
      </div>`}

      ${items.length
        ? items.map(renderItem).join('')
        : `<div class="pc-comments-empty">لا تعليقات بعد — كن أول من يعلّق</div>`}

      ${total > items.length ? `
      <div class="pc-comments-more">
        <button data-comment-all>عرض الكل (${total})</button>
      </div>` : ''}`;

    const input = box.querySelector('[data-comment-input]');
    const sendBtn = box.querySelector('[data-comment-send]');

    if (input && sendBtn) {
      input.addEventListener('input', () => {
        sendBtn.disabled = input.value.trim().length === 0;
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !sendBtn.disabled) sendBtn.click();
      });
      sendBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const body = input.value.trim();
        if (!body) return;
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:2px"></span>';
        try {
          await ctx.api(`/prompts/${promptId}/comments`, {
            method: 'POST', body: { body }, useCache: false
          });
          input.value = '';
          box.dataset.loaded = '0';
          await loadInlineComments(box, promptId, ctx);
          ctx.toast('تم إرسال التعليق');
        } catch (ex) {
          ctx.toast(ex.message, 'error');
          sendBtn.disabled = false;
          sendBtn.innerHTML = ICON.send;
        }
      });
    }

    const allBtn = box.querySelector('[data-comment-all]');
    if (allBtn) {
      allBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ctx.navigate('#/p/' + promptId);
      });
    }
  } catch (e) {
    box.innerHTML = `<div class="pc-comments-empty">تعذّر تحميل التعليقات</div>`;
  }
}

/* ═══════════════════════════════════════════════
   Shared UI
   ═══════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════
   بطاقة التوثيق — Stepper
   ═══════════════════════════════════════════════ */
function renderVerifyCard(eligibility) {
  const rules = eligibility.rules || [];
  const metCount = rules.filter((r) => r.met).length;
  const totalRules = rules.length;
  const percent = totalRules ? Math.round((metCount / totalRules) * 100) : 0;
  const allMet = metCount === totalRules;

  const icons = {
    prompts: ICON.fileText,
    likes:   ICON.heart,
    copies:  ICON.copy,
    months:  ICON.clock
  };

  const step = (r) => {
    const pct = Math.min(100, Math.round((r.value / r.target) * 100));
    return `
      <div class="verify-step ${r.met ? 'met' : ''}">
        <div class="vs-icon">${icons[r.key] || icons.prompts}</div>
        <div>
          <div class="vs-label">${esc(r.label)}</div>
          <div class="vs-values">
            <span class="vs-current">${fmt(r.value)}</span>
            <span class="vs-target">/ ${fmt(r.target)}</span>
          </div>
          <div class="vs-bar">
            <div class="vs-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>`;
  };

  return `
  <section class="verify-card">
    <div class="verify-head">
      <div class="verify-shield">${ICON.shield}</div>
      <div class="verify-head-text">
        <h3>${allMet ? 'مبروك! أنت مؤهّل للتوثيق' : 'شروط التوثيق'}</h3>
        <p>${allMet
          ? 'أكملت جميع المتطلبات — يمكنك الآن طلب شارة التوثيق.'
          : 'أكمل الشروط التالية للحصول على شارة التوثيق'}</p>
      </div>
      <span class="verify-progress-pill">${metCount}/${totalRules}</span>
    </div>

    <div class="verify-progress-bar">
      <div class="verify-progress-fill" style="width:${percent}%"></div>
    </div>

    <div class="verify-steps">
      ${rules.map(step).join('')}
    </div>

    ${allMet ? `
    <div class="verify-cta">
      <p><strong>خطوة أخيرة:</strong> اطلب من الإدارة مراجعة حسابك للحصول على الشارة.</p>
      <a class="btn btn-primary btn-sm" href="#/admin">
        تقدّم للتوثيق ←
      </a>
    </div>` : ''}
  </section>`;
}

/* ═══════════ 1 — الدخول ═══════════ */
async function login(root, ctx) {
  if (ctx.state.user) return ctx.navigate('#/');
  root.innerHTML = `
  <div style="max-width:400px;margin:16px auto">
    <div style="text-align:center;margin-bottom:20px">
      <h1 class="section-title" style="font-size:22px">مرحباً بعودتك</h1>
      <p class="section-sub">سجّل دخولك لمتابعة برومبتاتك</p>
    </div>
    <form class="card card-white" id="login-form">
      <div class="stack gap-14">
        <div class="field">
          <label class="label" for="email">البريد الإلكتروني</label>
          <input class="input" id="email" type="email" dir="ltr" placeholder="you@example.com" autocomplete="email" required>
        </div>
        <div class="field">
          <label class="label" for="password">كلمة المرور</label>
          <input class="input" id="password" type="password" dir="ltr" placeholder="••••••••" autocomplete="current-password" required>
        </div>
        <p class="err-text" id="login-err" hidden></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="login-btn">دخول</button>
      </div>
    </form>
    <p style="text-align:center;margin-top:14px;font-size:13px;color:var(--slate)">
      ليس لديك حساب؟ <a href="#/register" style="color:var(--orange);font-weight:600">أنشئ حساباً</a>
    </p>
    <div class="lock-note" style="text-align:center">تجريبي: sara@khayal.app / 123456</div>
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
        body: { email: form.email.value.trim(), password: form.password.value },
        useCache: false
      });
      ctx.setToken(token);
      ctx.state.user = user;
      ctx.toast('مرحباً بك');
      ctx.navigate('#/');
      ctx.refreshUnread();
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'دخول';
    }
  });
}

/* ═══════════ 2 — تسجيل ═══════════ */
async function register(root, ctx) {
  if (ctx.state.user) return ctx.navigate('#/');
  root.innerHTML = `
  <div style="max-width:400px;margin:16px auto">
    <div style="text-align:center;margin-bottom:20px">
      <h1 class="section-title" style="font-size:22px">انضم إلى خيال</h1>
      <p class="section-sub">شارك برومبتاتك مع المجتمع</p>
    </div>
    <form class="card card-white" id="reg-form">
      <div class="stack gap-14">
        <div class="field">
          <label class="label">الاسم الكامل</label>
          <input class="input" id="name" placeholder="سارة الشمري" required>
        </div>
        <div class="field">
          <label class="label">اسم المستخدم <span class="opt">(اختياري)</span></label>
          <input class="input" id="username" dir="ltr" placeholder="sara">
        </div>
        <div class="field">
          <label class="label">البريد الإلكتروني</label>
          <input class="input" id="reg-email" type="email" dir="ltr" placeholder="you@example.com" autocomplete="email" required>
        </div>
        <div class="field">
          <label class="label">كلمة المرور</label>
          <input class="input" id="reg-password" type="password" dir="ltr" placeholder="6 أحرف على الأقل" required>
        </div>
        <p class="err-text" id="reg-err" hidden></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="reg-btn">إنشاء حساب</button>
      </div>
    </form>
    <p style="text-align:center;margin-top:14px;font-size:13px;color:var(--slate)">
      لديك حساب بالفعل؟ <a href="#/login" style="color:var(--orange);font-weight:600">سجّل دخولك</a>
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
          username: form.username.value.trim() || undefined,
          email: form.querySelector('#reg-email').value.trim(),
          password: form.querySelector('#reg-password').value
        },
        useCache: false
      });
      ctx.setToken(token);
      ctx.state.user = user;
      ctx.toast('تم إنشاء الحساب');
      ctx.navigate('#/');
      ctx.refreshUnread();
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'إنشاء حساب';
    }
  });
}

/* ═══════════ 3 — الرئيسية ═══════════ */
async function home(root, ctx) {
  root.innerHTML = `
    <div class="section" style="margin-top:0">
      ${sectionHead('01', 'الرئيسية', 'أحدث <span class="hl">البرومبتات</span>')}
    </div>
    <div id="home-results">${skeletonGrid(4)}</div>`;
  
  try {
    const { items } = await ctx.api('/prompts?sort=latest&limit=20');
    const container = root.querySelector('#home-results');
    if (!items.length) {
      container.innerHTML = emptyState(ICON.empty, 'لا توجد برومبتات بعد',
        'كن أول من يشارك إبداعه مع المجتمع.',
        `<a class="btn btn-primary" href="#/new">انشر برومبتاً</a>`);
      return;
    }
    container.innerHTML = grid(items);
    bindCards(container, ctx);
  } catch (e) {
    root.querySelector('#home-results').innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 4 — استكشف ═══════════ */
async function explore(root, ctx) {
  const q = ctx.params.q || '';
  root.innerHTML = `
    <div class="section" style="margin-top:0">
      ${sectionHead('02', 'استكشف', q ? `نتائج البحث: <span class="hl">${esc(q)}</span>` : 'تصفح <span class="hl">المكتبة</span>')}
      <div class="search-box" style="margin-top:16px">
        <form id="search-form" class="row gap-8">
          <div class="field grow" style="margin:0">
            <input class="input" id="search-input" type="text" placeholder="ابحث عن برومبت، فئة، أو كاتب…" value="${esc(q)}">
          </div>
          <button class="btn btn-primary" type="submit">${ICON.search}</button>
        </form>
      </div>
    </div>
    <div id="explore-results">${skeletonGrid(4)}</div>`;

  const form = root.querySelector('#search-form');
  const input = root.querySelector('#search-input');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    ctx.navigate(val ? `#/explore?q=${encodeURIComponent(val)}` : '#/explore');
  });

  try {
    const path = q ? `/prompts?search=${encodeURIComponent(q)}&limit=40` : '/prompts?sort=latest&limit=40';
    const { items } = await ctx.api(path);
    const container = root.querySelector('#explore-results');
    if (!items.length) {
      container.innerHTML = emptyState(ICON.search, 'لا توجد نتائج',
        q ? `لم نجد شيئاً يطابق "${esc(q)}"` : 'المكتبة فارغة حالياً.',
        q ? `<a class="btn btn-outline" href="#/explore">مسح البحث</a>` : '');
      return;
    }
    container.innerHTML = grid(items);
    bindCards(container, ctx);
  } catch (e) {
    root.querySelector('#explore-results').innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

/* ═══════════ 5 — تفاصيل البرومبت ═══════════ */
async function prompt(root, ctx) {
  const id = ctx.id;
  if (!id) return ctx.navigate('#/');

  root.innerHTML = skeletonPromptDetail();
  try {
    const { prompt: p, comments } = await ctx.api(`/prompts/${id}`);
    const isOwner = ctx.state.user?.id === p.authorId;
    const tags = (p.tags || []).slice(0, 5);
    
    root.innerHTML = `
    <div class="prompt-detail">
      <div class="pd-header">
        <div class="pd-author">
          ${avatar(p.author, 48)}
          <div>
            <a class="pd-name" href="#/u/${attr(p.authorId)}">
              ${esc(p.author?.name || 'مجهول')}
              ${p.author?.verified ? VCHECK : ''}
            </a>
            <div class="pd-time">${timeAgo(p.createdAt)}</div>
          </div>
        </div>
        <div class="pd-actions">
          ${isOwner ? `
            <a class="btn btn-outline btn-sm" href="#/edit/${attr(p.id)}">${ICON.edit} تعديل</a>
          ` : ''}
          <button class="btn btn-outline btn-sm" id="pd-share">${ICON.share} مشاركة</button>
        </div>
      </div>

      <h1 class="pd-title">${esc(p.title)}</h1>
      ${p.description ? `<p class="pd-desc">${esc(p.description)}</p>` : ''}
      
      ${tags.length ? `
      <div class="pd-tags">
        ${tags.map((t) => `<a class="pd-tag" href="#/explore?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}
      </div>` : ''}

      <div class="pd-prompt-box">
        <div class="pd-prompt-head">
          <span class="pd-dots"><i></i><i></i><i></i></span>
          <span class="pd-prompt-name">prompt.txt</span>
          <button class="btn btn-outline btn-xs" id="pd-copy">${ICON.copy} نسخ</button>
        </div>
        <pre class="pd-prompt-text">${esc(p.body)}</pre>
      </div>

      <div class="pd-stats">
        <button class="pd-stat-btn ${p.liked ? 'liked' : ''}" id="pd-like" data-liked="${p.liked ? '1' : '0'}">
          ${p.liked ? ICON.heartFill : ICON.heart}
          <span>${fmt(p.likes)} إعجاب</span>
        </button>
        <span class="pd-stat-btn">
          ${ICON.chat}
          <span>${fmt(p.commentsCount || 0)} تعليق</span>
        </span>
        <span class="pd-stat-btn">
          ${ICON.copy}
          <span>${fmt(p.copies || 0)} نسخة</span>
        </span>
      </div>

      <div class="pd-comments-section">
        <h3>التعليقات</h3>
        ${ctx.state.user ? `
        <div class="pd-comment-form">
          <textarea class="textarea" id="pd-comment-input" placeholder="اكتب تعليقاً…" rows="3" maxlength="500"></textarea>
          <div class="row" style="justify-content:flex-end;margin-top:8px">
            <button class="btn btn-primary btn-sm" id="pd-comment-send" disabled>${ICON.send} إرسال</button>
          </div>
        </div>` : `
        <div class="pd-comment-form-locked">
          <p>سجّل الدخول للمشاركة في النقاش.</p>
          <a class="btn btn-outline btn-sm" href="#/login">تسجيل الدخول</a>
        </div>`}

        <div class="pd-comments-list" id="pd-comments-list">
          ${comments.items.length ? comments.items.map((c) => `
            <div class="pd-comment-item">
              ${avatar(c.author, 32)}
              <div class="pd-comment-body">
                <div class="pd-comment-name">
                  ${esc(c.author?.name || 'مجهول')}
                  ${c.author?.verified ? VCHECK : ''}
                  <span class="pd-comment-time">${timeAgo(c.createdAt)}</span>
                </div>
                <div class="pd-comment-text">${esc(c.body)}</div>
              </div>
            </div>
          `).join('') : '<p class="hint">لا توجد تعليقات بعد.</p>'}
        </div>
      </div>
    </div>`;

    // ربط الأحداث
    root.querySelector('#pd-copy')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(p.body); } catch {}
      ctx.api(`/prompts/${p.id}/copy`, { method: 'POST', useCache: false }).catch(() => {});
      ctx.toast('تم النسخ');
    });

    root.querySelector('#pd-share')?.addEventListener('click', async () => {
      const url = location.origin + '/#/p/' + (p.slug || p.id);
      if (navigator.share) {
        try { await navigator.share({ title: p.title, url }); return; } catch {}
      }
      try { await navigator.clipboard.writeText(url); ctx.toast('تم نسخ الرابط'); } catch {}
    });

    root.querySelector('#pd-like')?.addEventListener('click', async () => {
      if (!ctx.state.user) { ctx.toast('سجّل الدخول للإعجاب', 'error'); return ctx.navigate('#/login'); }
      const btn = root.querySelector('#pd-like');
      const wasLiked = btn.dataset.liked === '1';
      const newLiked = !wasLiked;
      
      btn.dataset.liked = newLiked ? '1' : '0';
      btn.classList.toggle('liked', newLiked);
      btn.querySelector('svg')?.replaceWith(newLiked ? ICON.heartFill : ICON.heart);
      
      try {
        const r = await ctx.api(`/prompts/${p.id}/like`, { method: 'POST', useCache: false });
        btn.dataset.liked = r.liked ? '1' : '0';
        btn.classList.toggle('liked', r.liked);
        btn.querySelector('span').textContent = `${fmt(r.likes)} إعجاب`;
        btn.querySelector('svg')?.replaceWith(r.liked ? ICON.heartFill : ICON.heart);
      } catch (ex) {
        btn.dataset.liked = wasLiked ? '1' : '0';
        btn.classList.toggle('liked', wasLiked);
        ctx.toast(ex.message, 'error');
      }
    });

    const commentInput = root.querySelector('#pd-comment-input');
    const commentSend = root.querySelector('#pd-comment-send');
    if (commentInput && commentSend) {
      commentInput.addEventListener('input', () => {
        commentSend.disabled = commentInput.value.trim().length === 0;
      });
      commentSend.addEventListener('click', async () => {
        const body = commentInput.value.trim();
        if (!body) return;
        commentSend.disabled = true;
        commentSend.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:2px"></span>';
        try {
          await ctx.api(`/prompts/${p.id}/comments`, { method: 'POST', body: { body }, useCache: false });
          ctx.toast('تم إرسال التعليق');
          prompt(root, ctx); // إعادة التحميل
        } catch (ex) {
          ctx.toast(ex.message, 'error');
          commentSend.disabled = false;
          commentSend.innerHTML = `${ICON.send} إرسال`;
        }
      });
    }

  } catch (e) {
    root.innerHTML = emptyState(ICON.empty, 'تعذّر تحميل البرومبت', e.message, `<a class="btn btn-primary" href="#/">العودة للرئيسية</a>`);
    if (e instanceof ctx.ApiError && e.status === 404) {
      root.innerHTML = emptyState(ICON.empty, 'غير موجود', 'هذا البرومبت غير موجود أو تم حذفه.', `<a class="btn btn-primary" href="#/">العودة للرئيسية</a>`);
    }
  }
}

/* ═══════════ 6 — نشر / تعديل ═══════════ */
async function newPrompt(root, ctx) {
  if (!ctx.state.user) { ctx.toast('سجّل الدخول', 'error'); return ctx.navigate('#/login'); }
  renderPromptForm(root, ctx, null);
}

async function editPrompt(root, ctx) {
  if (!ctx.state.user) { ctx.toast('سجّل الدخول', 'error'); return ctx.navigate('#/login'); }
  const id = ctx.id;
  if (!id) return ctx.navigate('#/');

  root.innerHTML = skeletonSectionHead();
  try {
    const { prompt: p } = await ctx.api(`/prompts/${id}`);
    if (p.authorId !== ctx.state.user.id) {
      ctx.toast('غير مسموح', 'error');
      return ctx.navigate('#/p/' + id);
    }
    renderPromptForm(root, ctx, p);
  } catch (e) {
    root.innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
  }
}

function renderPromptForm(root, ctx, p) {
  const isEdit = !!p;
  root.innerHTML = `
  <div style="max-width:640px;margin:0 auto">
    <div class="section-head" style="margin-bottom:20px">
      <div class="eyebrow"><span class="dot"></span>06 / ${isEdit ? 'تعديل' : 'نشر'}</div>
      <h2 class="section-title">${isEdit ? 'تعديل البرومبت' : 'نشر برومبت جديد'}</h2>
      <p class="section-sub">${isEdit ? 'حدّث تفاصيل البرومبت' : 'شارك إبداعك مع المجتمع'}</p>
    </div>

    <form class="card card-white" id="prompt-form">
      <div class="stack gap-14">
        <div class="field">
          <label class="label">العنوان</label>
          <input class="input" id="p-title" value="${esc(p?.title || '')}" required maxlength="120">
        </div>
        
        <div class="field">
          <label class="label">الفئة</label>
          <select class="input" id="p-category">
            <option value="">اختر فئة…</option>
            ${(ctx.state.meta.categories || []).map(c => `<option value="${esc(c)}" ${p?.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
          </select>
        </div>

        <div class="field">
          <label class="label">نموذج الذكاء الاصطناعي</label>
          <select class="input" id="p-model">
            <option value="">عام / غير محدد</option>
            ${(ctx.state.meta.models || []).map(m => `<option value="${esc(m)}" ${p?.model === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}
          </select>
        </div>

        <div class="field">
          <label class="label">البرومبت (الأمر)</label>
          <textarea class="textarea" id="p-body" rows="10" required maxlength="4000" style="font-family:var(--font-mono);font-size:13px">${esc(p?.body || '')}</textarea>
        </div>

        <div class="field">
          <label class="label">الوصف المختصر <span class="opt">(اختياري)</span></label>
          <input class="input" id="p-desc" value="${esc(p?.description || '')}" maxlength="200" placeholder="شرح موجز لما يفعله هذا البرومبت">
        </div>

        <div class="field">
          <label class="label">الوسوم <span class="opt">(اختياري)</span></label>
          <input class="input" id="p-tags" value="${esc((p?.tags || []).join(', '))}" placeholder="مثال: كتابة, تسويق, ChatGPT" maxlength="100">
        </div>

        <p class="err-text" id="p-err" hidden></p>

        <div class="row gap-8" style="justify-content:flex-end;margin-top:8px">
          <button type="button" class="btn btn-ghost btn-sm" onclick="history.back()">إلغاء</button>
          <button type="submit" class="btn btn-primary btn-sm" id="p-btn">${isEdit ? 'حفظ التعديلات' : 'نشر البرومبت'}</button>
        </div>
      </div>
    </form>
  </div>`;

  // إصلاح onclick في زر الإلغاء
  root.querySelector('.btn-ghost')?.addEventListener('click', () => history.back());

  const form = root.querySelector('#prompt-form');
  const err = root.querySelector('#p-err');
  const btn = root.querySelector('#p-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.hidden = true; btn.disabled = true; btn.textContent = 'جارٍ الحفظ…';
    
    const tagsRaw = root.querySelector('#p-tags').value;
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    const payload = {
      title: root.querySelector('#p-title').value.trim(),
      category: root.querySelector('#p-category').value || null,
      model: root.querySelector('#p-model').value || null,
      body: root.querySelector('#p-body').value.trim(),
      description: root.querySelector('#p-desc').value.trim() || null,
      tags
    };

    try {
      if (isEdit) {
        const { prompt: updated } = await ctx.api(`/prompts/${p.id}`, { method: 'PATCH', body: payload, useCache: false });
        ctx.toast('تم الحفظ');
        ctx.navigate('#/p/' + (updated.slug || updated.id));
      } else {
        const { prompt: created } = await ctx.api('/prompts', { method: 'POST', body: payload, useCache: false });
        ctx.toast('تم النشر');
        ctx.navigate('#/p/' + (created.slug || created.id));
      }
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
      btn.disabled = false; btn.textContent = isEdit ? 'حفظ' : 'نشر البرومبت';
    }
  });
}

/* ═══════════ 7 — البروفايل ═══════════ */
async function profile(root, ctx) {
  const userId = ctx.id || ctx.state?.user?.id;
  if (!userId) {
    ctx.toast('سجّل الدخول', 'error');
    return ctx.navigate('#/login');
  }

  root.innerHTML = skeletonProfile();
  const { user: u, prompts, eligibility } = await ctx.api('/users/' + userId);

  const months = Math.max(0, Math.floor(
    (Date.now() - new Date(u.joined).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ));
  const avatarInner = u.avatar
    ? `<img src="${esc(u.avatar)}" alt="" decoding="async">`
    : esc(initials(u.name));

  root.innerHTML = `
  <div class="profile-head">
    <div class="profile-avatar ${u.verified ? 'verified' : ''}">${avatarInner}</div>
    <div class="who">
      <h1 class="profile-name">${esc(u.name)}${u.verified ? VCHECK : ''}</h1>
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
      <button class="settings-btn" id="settings-btn" title="الإعدادات" aria-label="الإعدادات">${ICON.settings}</button>
    </div>` : `
    <div class="profile-actions">
      <button class="btn ${u.isFollowing ? 'btn-soft' : 'btn-outline'} btn-sm" id="follow-btn" data-following="${u.isFollowing ? '1' : '0'}">
        ${u.isFollowing ? ICON.userCheck + ' متابَع' : ICON.userPlus + ' متابعة'}
      </button>
    </div>`}
  </div>

  ${u.isSelf ? `
  <div class="card hidden" id="settings-panel" style="margin-bottom:16px">
    <div class="stack gap-14">
      <h3 style="font-size:15px;display:flex;align-items:center;gap:8px">${ICON.settings} الإعدادات</h3>
      <div class="row gap-12" style="flex-wrap:wrap;align-items:flex-start">
        <div id="avatar-preview" class="profile-avatar" style="width:60px;height:60px;font-size:22px;flex-shrink:0">${avatarInner}</div>
        <div class="stack gap-8 grow">
          <input class="input" id="edit-avatar" dir="ltr" placeholder="رابط الصورة" value="${esc(u.avatar || '')}">
          <div class="row gap-8">
            <input type="file" id="edit-avatar-file" accept="image/*" hidden>
            <button type="button" class="btn btn-outline btn-xs" id="edit-avatar-pick">رفع صورة</button>
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
        <button type="button" class="btn btn-primary btn-sm" id="edit-save">حفظ البيانات</button>
      </div>
      <div class="password-section">
        <h4>${ICON.lock} تغيير كلمة المرور</h4>
        <div class="stack gap-10">
          <div class="field">
            <label class="label">كلمة المرور الحالية</label>
            <input class="input" id="pw-current" type="password" dir="ltr" placeholder="••••••••">
          </div>
          <div class="field">
            <label class="label">كلمة المرور الجديدة</label>
            <input class="input" id="pw-new" type="password" dir="ltr" placeholder="6 أحرف على الأقل">
          </div>
          <div class="field">
            <label class="label">تأكيد كلمة المرور</label>
            <input class="input" id="pw-confirm" type="password" dir="ltr" placeholder="••••••••">
          </div>
          <p class="err-text" id="pw-err" hidden></p>
          <button type="button" class="btn btn-outline btn-sm" id="pw-save" style="align-self:flex-start">
            تحديث كلمة المرور
          </button>
        </div>
      </div>
      <div class="danger-zone">
        <h4>الأمان</h4>
        <p style="font-size:12.5px;color:var(--graphite);margin-bottom:10px;line-height:1.65">
          إن كنت مسجّلًا على أجهزة أخرى ولا تريد ذلك، يمكنك إبطال جميع الجلسات. ستحتفظ أنت بالجلسة الحالية.
        </p>
        <div class="row gap-8" style="flex-wrap:wrap">
          <button type="button" class="btn btn-danger btn-sm" id="logout-all">إبطال الجلسات الأخرى</button>
          <button type="button" class="btn btn-ghost btn-sm" id="logout">تسجيل الخروج</button>
        </div>
      </div>
    </div>
  </div>` : ''}

  <div class="stat-strip">
    <div class="stat-pill" data-nav="prompts">
      <div class="v">${u.promptCount || 0}</div><div class="k">برومبت</div>
    </div>
    <div class="stat-pill">
      <div class="v">${fmt(u.totalLikes || 0)}</div><div class="k">إعجاب</div>
    </div>
    <div class="stat-pill" data-nav="followers">
      <div class="v">${fmt(u.followers || 0)}</div><div class="k">متابع</div>
    </div>
  </div>

  ${u.isSelf && eligibility ? renderVerifyCard(eligibility) : ''}

  <div class="tabs" id="profile-tabs">
    <button class="tab active" data-tab="prompts">البرومبتات (${prompts.length})</button>
    ${u.isSelf ? `<button class="tab" data-tab="likes">الإعجابات <span id="likes-count">…</span></button>` : ''}
    <button class="tab" data-tab="followers">المتابعون (${fmt(u.followers || 0)})</button>
    <button class="tab" data-tab="following">يتابع (${fmt(u.following || 0)})</button>
  </div>

  <div id="profile-content"></div>`;

  const content = root.querySelector('#profile-content');
  const tabButtons = root.querySelectorAll('.tab');

  function activateTab(name) {
    tabButtons.forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  }

  async function showPrompts() {
    if (!prompts.length) {
      content.innerHTML = emptyState(ICON.empty, 'لا توجد برومبتات بعد',
        u.isSelf ? 'ابدأ بمشاركة أول برومبت.' : 'لم ينشر هذا المستخدم شيئاً.',
        u.isSelf ? `<a class="btn btn-primary" href="#/new">انشر برومبتاً</a>` : '');
      return;
    }
    content.innerHTML = grid(prompts);
    bindCards(content, ctx);
  }

  async function showLikes() {
    content.innerHTML = skeletonGrid(3);
    try {
      const { items } = await ctx.api('/favorites', { useCache: false });
      const el = root.querySelector('#likes-count');
      if (el) el.textContent = items.length;
      if (!items.length) {
        content.innerHTML = emptyState(ICON.heart, 'لا توجد إعجابات', 'اضغط زر الإعجاب في أي برومبت.', `<a class="btn btn-primary" href="#/explore">استكشف</a>`);
        return;
      }
      content.innerHTML = grid(items);
      bindCards(content, ctx);
    } catch (e) {
      content.innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
    }
  }

  function userMiniCard(x) {
    return `
      <div class="user-mini" data-uid="${attr(x.id)}">
        ${avatar(x, 42)}
        <div class="info">
          <div class="nm">${esc(x.name)}${x.verified ? VCHECK : ''}</div>
          <div class="hn">@${esc(x.username)}</div>
        </div>
        <div class="st">←</div>
      </div>`;
  }

  async function showFollowers() {
    content.innerHTML = skeletonGrid(3);
    try {
      const { items } = await ctx.api(`/users/${u.id}/followers?limit=100`);
      if (!items.length) {
        content.innerHTML = emptyState(ICON.empty, 'لا يوجد متابعون بعد', 'سيظهر هنا من يتابعون هذا الحساب.');
        return;
      }
      content.innerHTML = `<div class="users-grid">${items.map(userMiniCard).join('')}</div>`;
      content.querySelectorAll('.user-mini').forEach((el) => {
        el.addEventListener('click', () => ctx.navigate('#/u/' + el.dataset.uid));
      });
    } catch (e) {
      content.innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
    }
  }

  async function showFollowing() {
    content.innerHTML = skeletonGrid(3);
    try {
      const { items } = await ctx.api(`/users/${u.id}/following?limit=100`);
      if (!items.length) {
        content.innerHTML = emptyState(ICON.empty, 'لا يتابع أحداً بعد', 'عند متابعة الآخرين سيظهرون هنا.');
        return;
      }
      content.innerHTML = `<div class="users-grid">${items.map(userMiniCard).join('')}</div>`;
      content.querySelectorAll('.user-mini').forEach((el) => {
        el.addEventListener('click', () => ctx.navigate('#/u/' + el.dataset.uid));
      });
    } catch (e) {
      content.innerHTML = emptyState(ICON.empty, 'تعذّر التحميل', e.message);
    }
  }

  const tabLoaders = {
    prompts: showPrompts, likes: showLikes,
    followers: showFollowers, following: showFollowing
  };

  tabButtons.forEach((tab) => {
    tab.addEventListener('click', async () => {
      activateTab(tab.dataset.tab);
      await tabLoaders[tab.dataset.tab]();
    });
  });

  root.querySelectorAll('.stat-pill[data-nav]').forEach((pill) => {
    pill.addEventListener('click', async () => {
      const target = pill.dataset.nav;
      if (tabLoaders[target]) {
        activateTab(target);
        await tabLoaders[target]();
        root.querySelector('#profile-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  await showPrompts();
  if (u.isSelf) {
    ctx.api('/favorites', { useCache: false }).then(({ items }) => {
      const el = root.querySelector('#likes-count');
      if (el) el.textContent = items.length;
    }).catch(() => {});
  }

  const panel = root.querySelector('#settings-panel');
  root.querySelector('#settings-btn')?.addEventListener('click', () => {
    if (!panel) return;
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  root.querySelector('#edit-cancel')?.addEventListener('click', () => panel.classList.add('hidden'));

  let editAvatar = u.avatar || '';
  const avatarPreview = root.querySelector('#avatar-preview');
  const avatarInput = root.querySelector('#edit-avatar');
  const avatarFile = root.querySelector('#edit-avatar-file');
  const setAvatar = (v) => {
    editAvatar = v;
    if (avatarPreview) avatarPreview.innerHTML = v ? `<img src="${esc(v)}" alt="">` : esc(initials(u.name));
  };
  avatarInput?.addEventListener('input', () => setAvatar(avatarInput.value.trim()));
  root.querySelector('#edit-avatar-pick')?.addEventListener('click', () => avatarFile.click());
  avatarFile?.addEventListener('change', () => {
    const f = avatarFile.files?.[0];
    if (!f) return;
    if (f.size > 1.5 * 1024 * 1024) return ctx.toast('حجم الصورة > 1.5MB', 'error');
    const r = new FileReader();
    r.onload = () => { avatarInput.value = ''; setAvatar(r.result); };
    r.readAsDataURL(f);
  });

  root.querySelector('#edit-save')?.addEventListener('click', async () => {
    if (!ctx.requireOnline()) return;
    const err = root.querySelector('#edit-err');
    err.hidden = true;
    const saveBtn = root.querySelector('#edit-save');
    const payload = {
      name: root.querySelector('#edit-name').value.trim(),
      username: root.querySelector('#edit-username').value.trim(),
      bio: root.querySelector('#edit-bio').value.trim(),
      avatar: editAvatar
    };
    saveBtn.disabled = true; saveBtn.textContent = 'جارٍ الحفظ…';
    try {
      const { user: updated } = await ctx.api('/me', { method: 'PATCH', body: payload, useCache: false });
      ctx.state.user = updated;
      ctx.toast('تم التحديث');
      await profile(root, ctx);
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
      saveBtn.disabled = false; saveBtn.textContent = 'حفظ البيانات';
    }
  });

  root.querySelector('#pw-save')?.addEventListener('click', async () => {
    if (!ctx.requireOnline()) return;
    const err = root.querySelector('#pw-err');
    err.hidden = true;
    const cur = root.querySelector('#pw-current').value;
    const newP = root.querySelector('#pw-new').value;
    const confirm = root.querySelector('#pw-confirm').value;
    if (!cur || !newP) { err.textContent = 'املأ كل الحقول'; err.hidden = false; return; }
    if (newP.length < 6) { err.textContent = 'كلمة المرور 6 أحرف على الأقل'; err.hidden = false; return; }
    if (newP !== confirm) { err.textContent = 'كلمتا المرور غير متطابقتين'; err.hidden = false; return; }
    const btn = root.querySelector('#pw-save');
    btn.disabled = true; btn.textContent = 'جارٍ التحديث…';
    try {
      await ctx.api('/auth/password', { method: 'PATCH', body: { current: cur, next: newP }, useCache: false });
      ctx.toast('تم تحديث كلمة المرور');
      root.querySelector('#pw-current').value = '';
      root.querySelector('#pw-new').value = '';
      root.querySelector('#pw-confirm').value = '';
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
    } finally {
      btn.disabled = false; btn.textContent = 'تحديث كلمة المرور';
    }
  });

  root.querySelector('#logout-all')?.addEventListener('click', async () => {
    if (!ctx.requireOnline()) return;
    if (!confirm('سيتم إبطال جميع الجلسات على الأجهزة الأخرى. متابعة؟')) return;
    try {
      const { revoked } = await ctx.api('/auth/logout-all', { method: 'POST', useCache: false });
      ctx.toast(`تم إبطال ${revoked} جلسة`);
    } catch (e) { ctx.toast(e.message, 'error'); }
  });

  root.querySelector('#logout')?.addEventListener('click', async () => {
    if (!confirm('تسجيل الخروج؟')) return;
    try { await ctx.api('/auth/logout', { method: 'POST', useCache: false }); } catch {}
    ctx.logout();
    ctx.toast('تم الخروج');
    ctx.navigate('#/');
  });

  const followBtn = root.querySelector('#follow-btn');
  followBtn?.addEventListener('click', () => {
    if (!ctx.state.user) {
      ctx.toast('سجّل الدخول', 'error');
      return ctx.navigate('#/login');
    }
    const isNow = followBtn.dataset.following === '1';
    const newState = !isNow;
    followBtn.dataset.following = newState ? '1' : '0';
    followBtn.className = 'btn ' + (newState ? 'btn-soft' : 'btn-outline') + ' btn-sm';
    followBtn.innerHTML = newState ? `${ICON.userCheck} متابَع` : `${ICON.userPlus} متابعة`;
    ctx.api(`/users/${u.id}/follow`, { method: 'POST', useCache: false })
      .then((r) => {
        const actual = !!r.following;
        followBtn.dataset.following = actual ? '1' : '0';
        followBtn.className = 'btn ' + (actual ? 'btn-soft' : 'btn-outline') + ' btn-sm';
        followBtn.innerHTML = actual ? `${ICON.userCheck} متابَع` : `${ICON.userPlus} متابعة`;
        ctx.toast(actual ? 'تتابع الآن' : 'ألغيت المتابعة');
      })
      .catch((e) => {
        followBtn.dataset.following = isNow ? '1' : '0';
        followBtn.className = 'btn ' + (isNow ? 'btn-soft' : 'btn-outline') + ' btn-sm';
        followBtn.innerHTML = isNow ? `${ICON.userCheck} متابَع` : `${ICON.userPlus} متابعة`;
        ctx.toast(e.message, 'error');
      });
  });
}

/* ═══════════ 8 — تفضيلاتي ═══════════ */
async function favorites(root, ctx) {
  if (!ctx.state.user) {
    ctx.toast('سجّل الدخول', 'error');
    return ctx.navigate('#/login');
  }
  root.innerHTML = `
    <div class="section" style="margin-top:0">
      ${sectionHead('04', 'تفضيلاتي', 'البرومبتات التي <span class="hl">أعجبتك</span>')}
    </div>
    <div id="fav-results">${skeletonGrid(4)}</div>`;
  const { items } = await ctx.api('/favorites', { useCache: false });
  const container = root.querySelector('#fav-results');
  if (!items.length) {
    container.innerHTML = emptyState(ICON.heart, 'لا توجد إعجابات بعد',
      'اضغط على زر الإعجاب في أي برومبت.',
      `<a class="btn btn-primary" href="#/explore">استكشف</a>`);
    return;
  }
  container.innerHTML = grid(items);
  bindCards(container, ctx);
}

/* ═══════════ 9 — الإشعارات ═══════════ */
async function notifications(root, ctx) {
  if (!ctx.state.user) {
    ctx.toast('سجّل الدخول', 'error');
    return ctx.navigate('#/login');
  }
  root.innerHTML = `
  <div class="section" style="margin-top:0">
    <div class="head-row">
      <div>
        <div class="eyebrow"><span class="dot"></span>09 / الإشعارات</div>
        <h2 class="section-title">آخر <span class="hl">التفاعلات</span></h2>
      </div>
      <button class="btn btn-outline btn-sm" id="mark-all">تعليم الكل كمقروء</button>
    </div>
  </div>
  <div class="notif-list" id="nf-list">${skeletonNotifications(6)}</div>
  <div id="nf-more"></div>`;

  const list = root.querySelector('#nf-list');
  const more = root.querySelector('#nf-more');
  let offset = 0, all = [], hasMore = true, loading = false;
  const PAGE = 20;

  function notifItem(n) {
    const actor = n.actor || {};
    let line = '', target = '';
    if (n.type === 'like') {
      line = `<strong>${esc(actor.name || 'مجهول')}</strong> أعجب ببرومبتك`;
      target = n.promptSlug ? `<a class="n-target" href="#/p/${attr(n.promptSlug)}">${esc(n.promptTitle || '')}</a>` : '';
    } else if (n.type === 'follow') {
      line = `<strong>${esc(actor.name || 'مجهول')}</strong> بدأ متابعتك`;
    } else if (n.type === 'comment') {
      line = `<strong>${esc(actor.name || 'مجهول')}</strong> علّق على`;
      target = n.promptSlug ? `<a class="n-target" href="#/p/${attr(n.promptSlug)}">${esc(n.promptTitle || '')}</a>` : '';
    }
    const icon = n.type === 'like' ? ICON.heart
      : n.type === 'follow' ? ICON.userPlus : ICON.chat;
    const href = n.promptSlug ? '#/p/' + attr(n.promptSlug) : '#/u/' + attr(actor.id);
    return `
    <a class="notif-item ${n.isRead ? '' : 'unread'}" href="${href}" data-nid="${attr(n.id)}" data-read="${n.isRead ? '1' : '0'}">
      <div class="n-icon">${icon}</div>
      <div class="n-body">
        <div class="n-line">${line}${target ? ' ' + target : ''}</div>
        ${n.commentBody ? `<div class="n-comment">${esc(n.commentBody)}</div>` : ''}
        <div class="n-time">${timeAgo(n.createdAt)}</div>
      </div>
    </a>`;
  }

  async function load(reset = false) {
    if (loading) return;
    loading = true;
    if (reset) {
      offset = 0; all = []; hasMore = true;
      list.innerHTML = skeletonNotifications(6);
      more.innerHTML = '';
    }
    try {
      const { items, hasMore: hm } = await ctx.api(`/notifications?limit=${PAGE}&offset=${offset}`, { useCache: false });
      all = reset ? items : all.concat(items);
      offset = all.length;
      hasMore = hm;
      if (!all.length) {
        list.innerHTML = emptyState(ICON.bell, 'لا توجد إشعارات',
          'عندما يتفاعل أحد مع برومبتاتك أو حسابك، ستظهر هنا.');
        more.innerHTML = '';
        return;
      }
      list.innerHTML = all.map(notifItem).join('');
      bindNotifClicks();
      if (hasMore) {
        more.innerHTML = `<div class="load-more-wrap"><button class="load-more-btn" id="nf-lm">تحميل المزيد ↓</button></div>`;
        more.querySelector('#nf-lm').addEventListener('click', () => load(false));
      } else {
        more.innerHTML = all.length > PAGE
          ? `<div class="all-loaded">نهاية الإشعارات · ${all.length}</div>` : '';
      }
    } catch (e) {
      list.innerHTML = emptyState(ICON.bell, 'تعذّر التحميل', e.message);
    } finally { loading = false; }
  }

  function bindNotifClicks() {
    list.querySelectorAll('.notif-item').forEach((el) => {
      el.addEventListener('click', async () => {
        const nid = el.dataset.nid;
        const wasRead = el.dataset.read === '1';
        if (!wasRead) {
          el.classList.remove('unread');
          el.dataset.read = '1';
          ctx.decrementUnread(1);
          ctx.api(`/notifications/${nid}/read`, { method: 'POST', useCache: false }).catch(() => {});
        }
      });
    });
  }

  root.querySelector('#mark-all').addEventListener('click', async () => {
    if (!ctx.requireOnline()) return;
    try {
      const { updated } = await ctx.api('/notifications/read-all', { method: 'POST', useCache: false });
      list.querySelectorAll('.notif-item').forEach((el) => {
        el.classList.remove('unread');
        el.dataset.read = '1';
      });
      ctx.state.unreadCount = 0;
      ctx.refreshUnread();
      ctx.toast(`تم تعليم ${updated} إشعاراً`);
    } catch (e) { ctx.toast(e.message, 'error'); }
  });

  await load(true);
  ctx.refreshUnread();
}

/* ═══════════ 10 — لوحة الإدارة ═══════════ */
async function admin(root, ctx) {
  if (!ctx.state.adminToken) {
    root.innerHTML = `
    <div class="lock-screen">
      <div class="shield">${ICON.shield}</div>
      <h2>لوحة الإدارة</h2>
      <p>منطقة المشرفين فقط.</p>
      <form id="lock-form" class="stack gap-12">
        <input class="input" id="lock-pass" type="password" dir="ltr" placeholder="كلمة المرور" required>
        <p class="err-text" id="lock-err" hidden></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="lock-btn">دخول</button>
      </form>
      <div class="lock-note">التجريبية: khayal-admin</div>
    </div>`;
    const form = root.querySelector('#lock-form');
    const err = root.querySelector('#lock-err');
    const btn = root.querySelector('#lock-btn');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.hidden = true; btn.disabled = true; btn.textContent = '…';
      try {
        const { token } = await ctx.api('/admin/unlock', {
          method: 'POST', body: { password: root.querySelector('#lock-pass').value }, useCache: false
        });
        ctx.setAdminToken(token);
        ctx.toast('تم الفتح');
        admin(root, ctx);
      } catch (ex) {
        err.textContent = ex.message; err.hidden = false;
        btn.disabled = false; btn.textContent = 'دخول';
      }
    });
    return;
  }

  root.innerHTML = `
  <div class="admin-head">
    <div>
      <div class="eyebrow"><span class="dot"></span>10 / الإدارة</div>
      <h1>لوحة التحكم</h1>
    </div>
    <button class="btn btn-outline btn-sm" id="admin-exit">خروج</button>
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
    ctx.navigate('#/profile');
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
    const { stats, topPrompts, latestUsers } = await ctx.api('/admin/overview', { admin: true, useCache: false });
    body.innerHTML = `
      <div class="stat-cards">
        <div class="stat-card"><div class="k">المستخدمون</div><div class="v">${fmt(stats.users)}</div></div>
        <div class="stat-card"><div class="k">البرومبتات</div><div class="v">${fmt(stats.prompts)}</div></div>
        <div class="stat-card"><div class="k">الإعجابات</div><div class="v">${fmt(stats.likes)}</div></div>
        <div class="stat-card"><div class="k">التعليقات</div><div class="v">${fmt(stats.comments || 0)}</div></div>
      </div>
      <div class="two-col">
        <div class="card">
          <h3 style="font-size:13.5px;margin-bottom:10px">أعلى البرومبتات</h3>
          <div class="list-mini">
            ${topPrompts.map((p) => `
              <div class="item">
                <div class="grow"><div class="t">${esc(p.title)}</div><div class="s">${esc(p.category || '—')}</div></div>
                <span class="v">♥ ${fmt(p.likes)}</span>
              </div>`).join('') || '<p class="hint">لا يوجد</p>'}
          </div>
        </div>
        <div class="card">
          <h3 style="font-size:13.5px;margin-bottom:10px">أحدث المستخدمين</h3>
          <div class="list-mini">
            ${latestUsers.map((u) => `
              <div class="item">
                ${avatar(u, 26)}
                <div class="grow"><div class="t">${esc(u.name)}</div><div class="s">@${esc(u.username)}</div></div>
                <span class="v">${u.promptCount || 0}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  async function loadUsers() {
    body.innerHTML = skeletonAdminTab('users');
    const { items } = await ctx.api('/admin/users', { admin: true, useCache: false });
    body.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>المستخدم</th><th>البريد</th><th>الدور</th><th>التوثيق</th><th>البرومبتات</th><th></th></tr></thead>
          <tbody>
            ${items.map((u) => `
              <tr>
                <td><span class="td-user">${avatar(u, 26)}<span>${esc(u.name)}</span></span></td>
                <td class="mono" style="font-size:11px;color:var(--slate)" dir="ltr">${esc(u.email)}</td>
                <td><span class="badge badge-soft mono">${u.role === 'admin' ? 'إدارة' : 'عضو'}</span></td>
                <td>${u.verified ? '<span class="badge">موثّق</span>' : '<span class="badge badge-soft">لا</span>'}</td>
                <td class="mono">${u.promptCount || 0}</td>
                <td><div class="td-actions">
                  <button class="btn btn-outline btn-xs" data-verify="${attr(u.id)}">${u.verified ? 'إلغاء' : 'توثيق'}</button>
                  <button class="btn btn-danger btn-xs" data-del="${attr(u.id)}">${ICON.trash}</button>
                </div></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    body.querySelectorAll('[data-verify]').forEach((b) => b.addEventListener('click', async () => {
      try { await ctx.api(`/admin/users/${b.dataset.verify}/verify`, { method: 'POST', admin: true, useCache: false }); loadUsers(); }
      catch (e) { ctx.toast(e.message, 'error'); }
    }));
    body.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('حذف المستخدم وكل برومبتاته؟')) return;
      try { await ctx.api(`/admin/users/${b.dataset.del}`, { method: 'DELETE', admin: true, useCache: false }); ctx.toast('تم'); loadUsers(); }
      catch (e) { ctx.toast(e.message, 'error'); }
    }));
  }

  async function loadPrompts() {
    body.innerHTML = skeletonAdminTab('prompts');
    const { items } = await ctx.api('/admin/prompts', { admin: true, useCache: false });
    body.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>العنوان</th><th>الرابط</th><th>الكاتب</th><th>♥</th><th>💬</th><th>نسخ</th><th></th></tr></thead>
          <tbody>
            ${items.map((p) => `
              <tr>
                <td><a href="#/p/${attr(p.slug || p.id)}" style="font-weight:600">${esc(p.title)}</a></td>
                <td class="mono" style="font-size:11px;color:var(--ash)">${p.slug ? '/' + esc(p.slug) : '—'}</td>
                <td>${esc(p.author?.name || '—')}</td>
                <td class="mono">${fmt(p.likes)}</td>
                <td class="mono">${fmt(p.commentsCount || 0)}</td>
                <td class="mono">${fmt(p.copies)}</td>
                <td><button class="btn btn-danger btn-xs" data-delp="${attr(p.id)}">${ICON.trash}</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    body.querySelectorAll('[data-delp]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('حذف نهائياً؟')) return;
      try { await ctx.api(`/admin/prompts/${b.dataset.delp}`, { method: 'DELETE', admin: true, useCache: false }); ctx.toast('تم'); loadPrompts(); }
      catch (e) { ctx.toast(e.message, 'error'); }
    }));
  }

  async function loadVerify() {
    body.innerHTML = skeletonAdminTab('users');
    const { items } = await ctx.api('/admin/eligible', { admin: true, useCache: false });
    if (!items.length) {
      body.innerHTML = emptyState(ICON.shield, 'لا يوجد مؤهّلون', 'سيظهر هنا من استوفى الشروط.');
      return;
    }
    body.innerHTML = `
      <p class="hint" style="margin-bottom:12px">${items.length} مؤهّل.</p>
      <div class="stack gap-8">
        ${items.map(({ user: u }) => `
          <div class="card row gap-14" style="flex-wrap:wrap;padding:14px">
            ${avatar(u, 42)}
            <div class="grow">
              <div style="font-weight:600;font-size:14px">${esc(u.name)}</div>
              <div class="mono" style="font-size:11px;color:var(--ash)">@${esc(u.username)}</div>
            </div>
            <div class="row gap-12" style="font-size:12px;color:var(--slate)">
              <span>${u.promptCount} برومبت</span>
              <span>♥ ${fmt(u.totalLikes)}</span>
            </div>
            <div class="row gap-6">
              <a class="btn btn-outline btn-xs" href="#/u/${attr(u.id)}">عرض</a>
              <button class="btn btn-primary btn-xs" data-v="${attr(u.id)}">توثيق</button>
            </div>
          </div>`).join('')}
      </div>`;
    body.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', async () => {
      try { await ctx.api(`/admin/users/${b.dataset.v}/verify`, { method: 'POST', admin: true, useCache: false }); ctx.toast('تم'); loadVerify(); }
      catch (e) { ctx.toast(e.message, 'error'); }
    }));
  }

  await loadOverview();
}

/* ═══════════ 11 — انقطاع الاتصال ═══════════ */
async function offline(root, ctx) {
  root.innerHTML = `
  <div class="state" style="margin:40px auto;max-width:480px">
    <div class="icon">${ICON.wifiOff}</div>
    <h3>لا يوجد اتصال</h3>
    <p>تعذّر الوصول. سنعيد المحاولة عند عودة الاتصال.</p>
    <button class="btn btn-primary" id="retry">إعادة المحاولة</button>
  </div>`;
  root.querySelector('#retry').addEventListener('click', async () => {
    try {
      await ctx.api('/meta', { useCache: false });
      ctx.state.online = true;
      ctx.state.networkFailStreak = 0;
      const strip = document.getElementById('offline-strip');
      if (strip) strip.hidden = true;
      ctx.toast('عاد الاتصال');
      ctx.navigate('#/');
    } catch { ctx.toast('ما زال مقطوعاً', 'error'); }
  });
  const onOnline = () => { ctx.navigate('#/'); window.removeEventListener('online', onOnline); };
  window.addEventListener('online', onOnline);
}

/* ═══════════ Exports ═══════════ */
export const Screens = {
  home, login, register, explore, prompt,
  newPrompt, editPrompt, profile, favorites, admin, offline,
  notifications
};