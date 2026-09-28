import { Screens } from './screens.js';
import { prefetchPrompt, idbGet, idbSet, idbClear, cleanupOldEntries } from './cache.js';

const TOKEN_KEY = 'khayal_token';
const ADMIN_KEY = 'khayal_admin';

export const APP_VERSION = '5.0.0';

export const state = {
  user: null,
  meta: { categories: [], models: [], stats: {} },
  online: navigator.onLine,
  adminToken: sessionStorage.getItem(ADMIN_KEY) || null,
  unreadCount: 0
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/* ═══════════ API ═══════════ */
export async function api(path, { method = 'GET', body, admin = false, useCache = true } = {}) {
  const isGet = method === 'GET';
  const cacheKey = isGet ? path : null;
  const isPublicPath = /^\/(prompts|users|comments|meta)/.test(path);

  if (isGet && useCache && isPublicPath && !admin) {
    const cached = await idbGet('api:' + cacheKey);
    if (cached) {
      _bgRefresh(path, admin);
      return cached;
    }
  }

  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) headers['Authorization'] = 'Bearer ' + t;
  if (admin && state.adminToken) headers['x-admin-token'] = state.adminToken;

  let res;
  try {
    res = await fetch('/api' + path, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    setOnline(false);
    if (isGet && isPublicPath) {
      const cached = await idbGet('api:' + cacheKey);
      if (cached) return cached;
    }
    throw new ApiError('تعذّر الاتصال بالخادم', 0);
  }

  if (!res.ok && res.status >= 500) setOnline(false);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'حدث خطأ غير متوقع', res.status);

  if (isGet && useCache && isPublicPath && !admin) {
    idbSet('api:' + cacheKey, data);
  }

  return data;
}

async function _bgRefresh(path, admin) {
  try {
    const headers = {};
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) headers['Authorization'] = 'Bearer ' + t;
    if (admin && state.adminToken) headers['x-admin-token'] = state.adminToken;
    const res = await fetch('/api' + path, { headers });
    if (res.ok) {
      const data = await res.json();
      idbSet('api:' + path, data);
    }
  } catch { /* تجاهل */ }
}

/* ═══════════ Toast ═══════════ */
export function toast(message, type = 'info') {
  const box = document.getElementById('toasts');
  if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (type === 'error' ? 'err' : 'ok');
  el.innerHTML = `<span class="dot"></span><span>${message}</span>`;
  box.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px) scale(.94)';
    setTimeout(() => el.remove(), 300);
  }, 2400);
}

export const navigate = (hash) => {
  if (location.hash === hash) render();
  else location.hash = hash;
};

/* ═══════════ Online/Offline ═══════════ */
function setOnline(v) {
  if (state.online === v) return;
  state.online = v;
  const strip = document.getElementById('offline-strip');
  if (strip) strip.hidden = v;
  renderTopbar();
  if (!v && currentScreen() !== 'offline') navigate('#/offline');
}

/* ═══════════ Route parsing ═══════════ */
function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  return { parts, query };
}

const SCREEN_NAMES = {
  '': 'home', login: 'login', register: 'register', explore: 'explore',
  prompt: 'prompt', p: 'prompt',
  new: 'newPrompt', edit: 'editPrompt',
  profile: 'profile', u: 'profile',
  favorites: 'favorites', admin: 'admin', offline: 'offline',
  notifications: 'notifications'
};

function currentScreen() {
  try {
    const { parts } = parseRoute();
    return SCREEN_NAMES[parts[0] ?? ''] || 'home';
  } catch { return 'home'; }
}

/* ═══════════ Screen metadata (for topbar title) ═══════════ */
function getScreenMeta() {
  const { parts, query } = parseRoute();
  const root = parts[0] ?? '';
  switch (root) {
    case '': return { title: 'الرئيسية', sub: 'أحدث البرومبتات العربية' };
    case 'explore': return { title: 'استكشف', sub: query.q ? `بحث: ${query.q}` : 'تصفح المكتبة' };
    case 'p': case 'prompt': return { title: 'تفاصيل البرومبت', sub: '' };
    case 'new': return { title: 'نشر برومبت', sub: 'شارك إبداعك' };
    case 'edit': return { title: 'تعديل البرومبت', sub: '' };
    case 'profile': case 'u': return { title: 'الملف الشخصي', sub: '' };
    case 'favorites': return { title: 'تفضيلاتي', sub: 'ما أعجبك' };
    case 'notifications': return { title: 'الإشعارات', sub: state.unreadCount > 0 ? `${state.unreadCount} غير مقروء` : '' };
    case 'admin': return { title: 'لوحة الإدارة', sub: '' };
    case 'login': return { title: 'تسجيل الدخول', sub: '' };
    case 'register': return { title: 'حساب جديد', sub: '' };
    default: return { title: 'خيال', sub: '' };
  }
}

/* ═══════════ Icons ═══════════ */
const ICON = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/></svg>`,
  explore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg>`,
  login: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  flame: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.5c.6 3.6 3 5 4.7 6.9A6.7 6.7 0 0 1 18.6 14a6.6 6.6 0 0 1-13.2 0c0-2.2 1-3.7 2.3-5.1.5 1 1.2 1.7 2 2-.4-3 .8-6 2.3-8.4Z" fill="#ff4d00"/>
    <path d="M12 21a3 3 0 0 0 3-3c0-1.6-1.2-2.6-3-4.4-1.8 1.8-3 2.8-3 4.4a3 3 0 0 0 3 3Z" fill="#fcddcc"/>
  </svg>`
};

function initials(name = '') {
  return String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('');
}

/* ═══════════ Sidebar ═══════════ */
function renderSidebar() {
  const { parts } = parseRoute();
  const root = parts[0] ?? '';

  const navItem = (href, label, icon, key, badge = 0) => `
    <a class="nav-item ${root === key ? 'active' : ''}" href="${href}">
      ${icon}
      <span>${label}</span>
      ${badge > 0 ? `<span class="nav-badge">${badge > 99 ? '99+' : badge}</span>` : ''}
    </a>`;

  const navHTML = `
    ${navItem('#/', 'الرئيسية', ICON.home, '')}
    ${navItem('#/explore', 'استكشف', ICON.explore, 'explore')}
    ${navItem('#/notifications', 'الإشعارات', ICON.bell, 'notifications', state.unreadCount)}
    ${navItem('#/favorites', 'تفضيلاتي', ICON.heart, 'favorites')}
    <div class="nav-section-label">حسابي</div>
    ${navItem('#/profile', 'الملف الشخصي', ICON.user, 'profile')}
    ${state.user?.role === 'admin' ? navItem('#/admin', 'الإدارة', ICON.shield, 'admin') : ''}
  `;

  document.getElementById('sidebar-nav').innerHTML = navHTML;

  // Foot
  const foot = document.getElementById('sidebar-foot');
  if (state.user) {
    foot.innerHTML = `
      <a class="sidebar-user" href="#/profile">
        <span class="avatar ${state.user.verified ? 'verified' : ''}" style="--s:36px">
          ${state.user.avatar
            ? `<img src="${state.user.avatar}" alt="" loading="lazy" decoding="async">`
            : initials(state.user.name)}
        </span>
        <div class="info">
          <div class="name">${escHtml(state.user.name)}</div>
          <div class="handle">@${escHtml(state.user.username)}</div>
        </div>
      </a>
      <button type="button" class="sidebar-version" id="sidebar-version-btn">
        خيال · الإصدار ${APP_VERSION}
      </button>`;
    foot.querySelector('#sidebar-version-btn')?.addEventListener('click', () => navigate('#/admin'));
  } else {
    foot.innerHTML = `
      <a class="btn btn-primary btn-block btn-sm" href="#/login">
        ${ICON.login} تسجيل الدخول
      </a>
      <button type="button" class="sidebar-version" id="sidebar-version-btn">
        خيال · الإصدار ${APP_VERSION}
      </button>`;
    foot.querySelector('#sidebar-version-btn')?.addEventListener('click', () => navigate('#/admin'));
  }
}

function escHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ═══════════ Topbar ═══════════ */
function renderTopbar() {
  const meta = getScreenMeta();
  const isHome = (location.hash === '' || location.hash === '#/' || location.hash === '#');
  const { parts } = parseRoute();
  const root = parts[0] ?? '';

  const mobileBrandHTML = isHome ? `
    <a class="mobile-brand" href="#/">
      ${ICON.flame}
      <span>خيال</span>
    </a>` : '';

  const titleHTML = `
    <div class="topbar-title">
      ${escHtml(meta.title)}
      ${meta.sub ? `<span class="sub">${escHtml(meta.sub)}</span>` : ''}
    </div>`;

  document.getElementById('topbar').innerHTML = `
    <div class="topbar-inner">
      ${mobileBrandHTML}
      ${!isHome ? titleHTML : ''}
      <div class="topbar-actions">
        <span class="status-chip ${state.online ? '' : 'off'}">
          <span class="dot"></span>
          <span class="lbl">${state.online ? 'متصل' : 'غير متصل'}</span>
        </span>
        ${state.user ? `
          <a href="#/notifications" class="icon-btn" title="الإشعارات" aria-label="الإشعارات">
            ${ICON.bell}
            ${state.unreadCount > 0 ? `<span class="badge">${state.unreadCount > 99 ? '99+' : state.unreadCount}</span>` : ''}
          </a>
        ` : ''}
        ${state.user ? `
          <a href="#/profile" class="avatar-btn" title="${escHtml(state.user.name)}" aria-label="الملف الشخصي">
            <span class="avatar ${state.user.verified ? 'verified' : ''}" style="--s:36px">
              ${state.user.avatar
                ? `<img src="${state.user.avatar}" alt="" loading="lazy" decoding="async">`
                : initials(state.user.name)}
            </span>
          </a>
        ` : `
          <a href="#/login" class="btn btn-outline btn-sm">دخول</a>
        `}
        <a href="#/new" class="btn btn-primary btn-sm" title="انشر">
          ${ICON.plus}
          <span style="display:none" class="publish-label">انشر</span>
        </a>
      </div>
    </div>`;
}

/* ═══════════ Bottom nav (mobile) ═══════════ */
function renderBottomNav() {
  const { parts } = parseRoute();
  const root = parts[0] ?? '';

  const navBtn = (href, label, icon, key, badge = 0) => `
    <a class="nav-btn ${root === key ? 'active' : ''}" href="${href}">
      ${icon}
      <span>${label}</span>
      ${badge > 0 ? `<span class="nav-badge">${badge > 9 ? '9+' : badge}</span>` : ''}
    </a>`;

  document.getElementById('bottomnav').innerHTML = `
    <div class="bottomnav-inner">
      ${navBtn('#/', 'الرئيسية', ICON.home, '')}
      ${navBtn('#/explore', 'استكشف', ICON.explore, 'explore')}
      <a class="fab" href="#/new" aria-label="انشر برومبت">
        ${ICON.plus}
      </a>
      ${navBtn('#/favorites', 'تفضيلاتي', ICON.heart, 'favorites')}
      ${state.user
        ? navBtn('#/profile', 'حسابي', ICON.user, 'profile', state.unreadCount)
        : navBtn('#/login', 'دخول', ICON.login, 'login')}
    </div>`;
}

/* ═══════════ Site footer ═══════════ */
function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <div>
      <a href="#/">خيال</a>
      <span class="sep">·</span>
      <a href="#/explore">استكشف</a>
      <span class="sep">·</span>
      <a href="#/new">انشر</a>
      <span class="sep">·</span>
      <span class="mono">v${APP_VERSION}</span>
    </div>
  `;
}

/* ═══════════ Render (router) ═══════════ */
let _rendering = false;
async function render() {
  if (_rendering) return;
  _rendering = true;

  const loadingEl = document.getElementById('route-loading');
  if (loadingEl) loadingEl.hidden = false;

  try {
    renderSidebar();
    renderTopbar();
    renderBottomNav();
    renderFooter();

    if (!state.online && currentScreen() !== 'offline') {
      location.hash = '#/offline';
      return;
    }

    const { parts, query } = parseRoute();
    const name = currentScreen();
    const screen = Screens[name] || Screens.home;

    const root = document.getElementById('app');
    root.innerHTML = `<div style="padding:80px 0"><div class="spinner"></div></div>`;

    const ctx = {
      api, navigate, toast, state, ApiError,
      appVersion: APP_VERSION,
      prefetchPrompt,
      params: query,
      id: parts[1] || null,
      requireOnline() {
        if (!state.online) {
          toast('تحقّق من اتصالك بالإنترنت', 'error');
          return false;
        }
        return true;
      },
      async refreshUnread() { await refreshUnread(); },
      decrementUnread(n = 1) {
        state.unreadCount = Math.max(0, state.unreadCount - n);
        renderTopbar(); renderSidebar(); renderBottomNav();
      },
      async refreshMe() {
        try {
          const { user } = await api('/me', { useCache: false });
          state.user = user;
          renderTopbar(); renderSidebar(); renderBottomNav();
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            state.user = null;
            renderTopbar(); renderSidebar(); renderBottomNav();
          }
        }
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        state.user = null;
        state.unreadCount = 0;
        idbClear().catch(() => {});
        renderTopbar(); renderSidebar(); renderBottomNav();
      },
      setToken(t) { localStorage.setItem(TOKEN_KEY, t); },
      getToken() { return localStorage.getItem(TOKEN_KEY); },
      setAdminToken(t) {
        state.adminToken = t;
        if (t) sessionStorage.setItem(ADMIN_KEY, t);
        else sessionStorage.removeItem(ADMIN_KEY);
      }
    };

    try {
      await screen(root, ctx);
    } catch (e) {
      console.error('screen error:', e);
      root.innerHTML = `
        <div class="state" style="margin-top:60px">
          <div class="icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5M12 16.5v.01"/><circle cx="12" cy="12" r="9"/></svg>
          </div>
          <h3>حدث خطأ</h3>
          <p>${escHtml(e.message)}</p>
          <button class="btn btn-outline" onclick="location.reload()">إعادة المحاولة</button>
        </div>`;
    }

    window.scrollTo(0, 0);
  } finally {
    _rendering = false;
    if (loadingEl) setTimeout(() => { loadingEl.hidden = true; }, 200);
  }
}

/* ═══════════ Scroll effect ═══════════ */
let _scrollTick = false;
window.addEventListener('scroll', () => {
  if (_scrollTick) return;
  _scrollTick = true;
  requestAnimationFrame(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.classList.toggle('scrolled', window.scrollY > 4);
    _scrollTick = false;
  });
}, { passive: true });

/* ═══════════ WebView bridge ═══════════ */
function setupWebViewBridge() {
  // Notify Android on route change
  window.addEventListener('hashchange', () => {
    if (window.AndroidBack?.onRouteChange) {
      try { window.AndroidBack.onRouteChange(location.hash); } catch {}
    }
  });

  // Prevent double-tap zoom
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch <= 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  document.body.style.overscrollBehaviorY = 'contain';

  // Hardware acceleration hints
  const meta = document.createElement('meta');
  meta.name = 'screen-orientation';
  meta.content = 'portrait';
  // Optional — comment out if landscape is needed
  // document.head.appendChild(meta);
}

/* ═══════════ Service Worker ═══════════ */
async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    setInterval(() => reg.update().catch(() => {}), 3600000);
  } catch { /* تجاهل */ }
}

/* ═══════════ Unread notifications ═══════════ */
async function refreshUnread() {
  if (!localStorage.getItem(TOKEN_KEY) || !state.user) {
    state.unreadCount = 0;
    return;
  }
  try {
    const { unread } = await api('/notifications/unread-count', { useCache: false });
    if (state.unreadCount !== unread) {
      state.unreadCount = unread;
      renderTopbar(); renderSidebar(); renderBottomNav();
    }
  } catch { /* تجاهل */ }
}

/* ═══════════ Boot ═══════════ */
async function boot() {
  setupWebViewBridge();
  registerSW();
  cleanupOldEntries();

  const strip = document.getElementById('offline-strip');
  if (strip) strip.hidden = state.online;

  api('/meta').then(m => state.meta = m).catch(() => {});

  if (localStorage.getItem(TOKEN_KEY)) {
    api('/me', { useCache: false })
      .then(r => { state.user = r.user; })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
        }
      });
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('online', () => {
    setOnline(true);
    toast('عاد الاتصال');
    if (currentScreen() === 'offline') navigate('#/');
    if (localStorage.getItem(TOKEN_KEY) && !state.user) {
      api('/me', { useCache: false }).then(r => {
        state.user = r.user;
        renderTopbar(); renderSidebar(); renderBottomNav();
        refreshUnread();
      }).catch(() => {});
    } else {
      refreshUnread();
    }
  });
  window.addEventListener('offline', () => {
    setOnline(false);
    toast('انقطع الاتصال', 'error');
  });

  refreshUnread();
  setInterval(() => {
    if (state.online && state.user && !document.hidden) refreshUnread();
  }, 45000);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.user) refreshUnread();
  });

  if (!location.hash) location.hash = '#/';
  await render();
}

window.addEventListener('error', (e) => console.error('global:', e.error || e.message));
window.addEventListener('unhandledrejection', (e) => console.error('rejection:', e.reason));

boot().catch((e) => {
  console.error('boot failed:', e);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div class="state" style="margin-top:60px">
        <h3>تعذّر تحميل التطبيق</h3>
        <p>${escHtml(e.message)}</p>
        <button class="btn btn-primary" onclick="location.reload()">إعادة التحميل</button>
      </div>`;
  }
});