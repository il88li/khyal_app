import { Screens } from './screens.js';

const BEARER_KEY = 'khayal_token_bearer';
const ADMIN_KEY = 'khayal_admin';

export const APP_VERSION = '10.0.0';

export const state = {
  user: null,
  meta: { categories: [], models: [], stats: {} },
  online: true,
  adminToken: sessionStorage.getItem(ADMIN_KEY) || null,
  unreadCount: 0,
  networkFailStreak: 0
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getCsrfToken() {
  const m = document.cookie.match(/(?:^|;\s*)kh_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function showOfflineStrip(show) {
  const strip = document.getElementById('offline-strip');
  if (strip) strip.hidden = !show;
}

function markReachable() {
  const wasOffline = !state.online;
  state.networkFailStreak = 0;
  state.online = true;
  const strip = document.getElementById('offline-strip');
  if (strip && !strip.hidden) showOfflineStrip(false);
  if (wasOffline) {
    renderTopbar();
    if (currentScreen() === 'offline') navigate('#/');
  }
}

function markUnreachable() {
  state.networkFailStreak++;
  if (state.networkFailStreak < 3) return;
  const wasOnline = state.online;
  state.online = false;
  showOfflineStrip(true);
  if (wasOnline) {
    renderTopbar();
    if (currentScreen() !== 'offline') navigate('#/offline');
  }
}

export async function api(path, { method = 'GET', body, admin = false, useCache = true } = {}) {
  const isGet = method === 'GET';
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const bearer = localStorage.getItem(BEARER_KEY);
  if (bearer) headers['Authorization'] = 'Bearer ' + bearer;
  if (!isGet && !admin) {
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }
  if (admin && state.adminToken) headers['x-admin-token'] = state.adminToken;

  let res;
  try {
    res = await fetch('/api' + path, { method, headers, credentials: 'include', body: body ? JSON.stringify(body) : undefined });
    markReachable();
  } catch {
    markUnreachable();
    throw new ApiError('تعذّر الاتصال بالخادم', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'حدث خطأ غير متوقع', res.status);
  return data;
}

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
  }, 2200);
}

export const navigate = (hash) => {
  if (location.hash === hash) render();
  else location.hash = hash;
};

function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  return { parts, query };
}

const SCREEN_NAMES = {
  '': 'home', login: 'login', register: 'register', explore: 'explore',
  prompt: 'prompt', p: 'prompt', new: 'newPrompt', edit: 'editPrompt',
  profile: 'profile', u: 'profile', favorites: 'favorites',
  admin: 'admin', offline: 'offline', notifications: 'notifications'
};

function currentScreen() {
  try {
    const { parts } = parseRoute();
    return SCREEN_NAMES[parts[0] ?? ''] || 'home';
  } catch { return 'home'; }
}

function getScreenMeta() {
  const { parts, query } = parseRoute();
  const root = parts[0] ?? '';
  switch (root) {
    case '': return { title: '', sub: '' };
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

function initials(name = '') {
  return String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('');
}

function escHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const ICON = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/></svg>`,
  explore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg>`,
  login: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 12h10M17 8l3 4-3 4"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  flame: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.5c.6 3.6 3 5 4.7 6.9A6.7 6.7 0 0 1 18.6 14a6.6 6.6 0 0 1-13.2 0c0-2.2 1-3.7 2.3-5.1.5 1 1.2 1.7 2 2-.4-3 .8-6 2.3-8.4Z" fill="#ff385c"/><path d="M12 21a3 3 0 0 0 3-3c0-1.6-1.2-2.6-3-4.4-1.8 1.8-3 2.8-3 4.4a3 3 0 0 0 3 3Z" fill="#fcddcc"/></svg>`
};

function renderSidebar() {
  const { parts } = parseRoute();
  const root = parts[0] ?? '';
  const navItem = (href, label, icon, key, badge = 0) => `
    <a class="nav-item ${root === key ? 'active' : ''}" href="${href}">
      ${icon}<span>${label}</span>
      ${badge > 0 ? `<span class="nav-badge">${badge > 99 ? '99+' : badge}</span>` : ''}
    </a>`;

  document.getElementById('sidebar-nav').innerHTML = `
    ${navItem('#/', 'الرئيسية', ICON.home, '')}
    ${navItem('#/explore', 'استكشف', ICON.explore, 'explore')}
    ${navItem('#/notifications', 'الإشعارات', ICON.bell, 'notifications', state.unreadCount)}
    ${navItem('#/favorites', 'تفضيلاتي', ICON.heart, 'favorites')}
    <div class="nav-section-label">حسابي</div>
    ${navItem('#/profile', 'الملف الشخصي', ICON.user, 'profile')}
    ${state.user?.role === 'admin' ? navItem('#/admin', 'الإدارة', ICON.shield, 'admin') : ''}
  `;

  const foot = document.getElementById('sidebar-foot');
  if (state.user) {
    foot.innerHTML = `
      <a class="sidebar-user" href="#/profile">
        <span class="avatar ${state.user.verified ? 'verified' : ''}" style="--s:36px">
          ${state.user.avatar ? `<img src="${state.user.avatar}" alt="" loading="lazy" decoding="async">` : initials(state.user.name)}
        </span>
        <div class="info">
          <div class="name">${escHtml(state.user.name)}</div>
          <div class="handle">@${escHtml(state.user.username)}</div>
        </div>
      </a>
      <button type="button" class="sidebar-version" id="sidebar-version-btn">خيال · v${APP_VERSION}</button>`;
  } else {
    foot.innerHTML = `
      <a class="btn btn-primary" href="#/login" style="width:100%;border-radius:var(--radius-inputs);font-weight:600">${ICON.login} تسجيل الدخول</a>
      <button type="button" class="sidebar-version" id="sidebar-version-btn">خيال · v${APP_VERSION}</button>`;
  }
  foot.querySelector('#sidebar-version-btn')?.addEventListener('click', () => navigate('#/admin'));
}

function renderTopbar() {
  const meta = getScreenMeta();
  const isHome = (location.hash === '' || location.hash === '#/' || location.hash === '#');

  document.getElementById('topbar').innerHTML = `
    <div class="topbar-inner">
      ${!isHome ? `
        <a class="home-icon-btn" href="#/" aria-label="الرئيسية" title="الرئيسية" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;color:var(--color-hof);transition:background 0.2s" onmouseover="this.style.background='var(--color-faint)'" onmouseout="this.style.background='transparent'">
          ${ICON.home}
        </a>
        <div class="topbar-title" style="font-size:15.5px;font-weight:600;letter-spacing:-0.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1">
          ${escHtml(meta.title)}
          ${meta.sub ? `<span class="sub" style="display:block;font-size:11px;font-weight:400;color:var(--color-foggy);letter-spacing:0;margin-top:1px">${escHtml(meta.sub)}</span>` : ''}
        </div>
      ` : `
        <a class="mobile-brand" href="#/" style="display:flex;align-items:center;gap:8px;font-size:20px;font-weight:800;color:var(--color-rausch);letter-spacing:-0.02em;padding:4px 0">
          ${ICON.flame}<span>خيال</span>
        </a>
        <div style="flex:1"></div>
      `}
      <div class="topbar-actions" style="display:flex;align-items:center;gap:6px;flex-shrink:0">
        ${state.user ? `
          <a href="#/notifications" class="icon-btn" title="الإشعارات" aria-label="الإشعارات" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;color:var(--color-hof);background:transparent;transition:all 0.2s;position:relative" onmouseover="this.style.background='var(--color-faint)'" onmouseout="this.style.background='transparent'">
            ${ICON.bell}
            ${state.unreadCount > 0 ? `<span class="badge" style="position:absolute;top:2px;inset-inline-end:2px;min-width:18px;height:18px;padding:0 5px;background:var(--color-rausch);color:#fff;font-family:var(--font-mono);font-size:10px;font-weight:700;line-height:18px;text-align:center;border-radius:9999px;border:2px solid var(--color-white)">${state.unreadCount > 99 ? '99+' : state.unreadCount}</span>` : ''}
          </a>
        ` : ''}
        ${state.user ? `
          <a href="#/profile" class="avatar-btn" title="${escHtml(state.user.name)}" aria-label="الملف الشخصي" style="display:inline-flex;align-items:center;justify-content:center;border-radius:9999px;overflow:hidden;transition:all 0.2s;border:2px solid transparent;flex-shrink:0;cursor:pointer" onmouseover="this.style.borderColor='var(--color-rausch)'" onmouseout="this.style.borderColor='transparent'">
            <span class="avatar ${state.user.verified ? 'verified' : ''}" style="--s:34px">
              ${state.user.avatar ? `<img src="${state.user.avatar}" alt="" loading="lazy" decoding="async">` : initials(state.user.name)}
            </span>
          </a>
        ` : `
          <a href="#/login" class="btn btn-ghost btn-sm" style="border-radius:var(--radius-inputs);font-weight:600">${ICON.login} دخول</a>
        `}
      </div>
    </div>`;
}

function renderBottomNav() {
  const { parts } = parseRoute();
  const root = parts[0] ?? '';
  const navBtn = (href, label, icon, key, badge = 0) => `
    <a class="nav-btn ${root === key ? 'active' : ''}" href="${href}">
      ${icon}<span>${label}</span>
      ${badge > 0 ? `<span class="nav-badge">${badge > 9 ? '9+' : badge}</span>` : ''}
    </a>`;

  document.getElementById('bottomnav').innerHTML = `
    <div class="bottomnav-inner">
      ${navBtn('#/', 'الرئيسية', ICON.home, '')}
      ${navBtn('#/explore', 'استكشف', ICON.explore, 'explore')}
      <a class="fab" href="#/new" aria-label="انشر برومبت">${ICON.plus}</a>
      ${navBtn('#/favorites', 'تفضيلاتي', ICON.heart, 'favorites')}
      ${state.user ? navBtn('#/profile', 'حسابي', ICON.user, 'profile', state.unreadCount) : navBtn('#/login', 'دخول', ICON.login, 'login')}
    </div>`;
}

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;
  el.innerHTML = `
    <div>
      <a href="#/">خيال</a><span class="sep">·</span>
      <a href="#/explore">استكشف</a><span class="sep">·</span>
      <a href="#/new">انشر</a><span class="sep">·</span>
      <span class="mono">v${APP_VERSION}</span>
    </div>`;
}

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

    if (!state.online && state.networkFailStreak >= 3 && currentScreen() !== 'offline') {
      location.hash = '#/offline';
      return;
    }

    const { parts, query } = parseRoute();
    const name = currentScreen();
    const screen = Screens[name] || Screens.home;
    const root = document.getElementById('app');
    root.innerHTML = `<div style="padding:60px 0;display:flex;justify-content:center"><div class="sk" style="width:40px;height:40px;border-radius:50%;animation:skWave 1s infinite"></div></div>`;

    const ctx = {
      api, navigate, toast, state, ApiError, appVersion: APP_VERSION,
      params: query, id: parts[1] || null,
      requireOnline() {
        if (!state.online) { toast('تحقّق من اتصالك بالإنترنت', 'error'); return false; }
        return true;
      },
      async refreshMe() {
        try {
          const { user } = await api('/me', { useCache: false });
          state.user = user;
          renderTopbar(); renderSidebar(); renderBottomNav();
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) {
            state.user = null;
            renderTopbar(); renderSidebar(); renderBottomNav();
          }
        }
      },
      logout() {
        state.user = null; state.unreadCount = 0;
        localStorage.removeItem(BEARER_KEY);
        renderTopbar(); renderSidebar(); renderBottomNav();
      },
      setToken(t) { if (t) localStorage.setItem(BEARER_KEY, t); },
      getToken() { return localStorage.getItem(BEARER_KEY); },
      setAdminToken(t) {
        state.adminToken = t;
        if (t) sessionStorage.setItem(ADMIN_KEY, t);
        else sessionStorage.removeItem(ADMIN_KEY);
      },
      decrementUnread(n = 1) {
        state.unreadCount = Math.max(0, state.unreadCount - n);
        renderTopbar(); renderSidebar(); renderBottomNav();
      }
    };

    try {
      await screen(root, ctx);
    } catch (e) {
      console.error('screen error:', e);
      root.innerHTML = `
        <div style="text-align:center;padding:64px 24px;color:var(--color-foggy)">
          <div style="width:64px;height:64px;margin:0 auto 16px;opacity:0.4">${ICON.empty}</div>
          <h3 style="font-size:20px;margin-bottom:8px;color:var(--color-hof)">حدث خطأ</h3>
          <p style="font-size:14px">${escHtml(e.message)}</p>
          <button class="btn btn-ghost" onclick="location.reload()" style="margin-top:16px;border-radius:var(--radius-inputs)">إعادة المحاولة</button>
        </div>`;
    }
    window.scrollTo(0, 0);
    
    // Hide loading screen after first render
    const loadScreen = document.getElementById('loading-screen');
    if (loadScreen) loadScreen.classList.add('hidden');
  } finally {
    _rendering = false;
    if (loadingEl) setTimeout(() => { loadingEl.hidden = true; }, 200);
  }
}

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

function setupWebViewBridge() {
  window.addEventListener('hashchange', () => {
    if (window.AndroidBack?.onRouteChange) {
      try { window.AndroidBack.onRouteChange(location.hash); } catch {}
    }
  });
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch <= 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });
  document.body.style.overscrollBehaviorY = 'contain';
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    setInterval(() => reg.update().catch(() => {}), 3600000);
  } catch (err) {
    console.warn('SW registration failed:', err);
  }
}

async function refreshUnread() {
  if (!state.user) { state.unreadCount = 0; return; }
  try {
    const { unread } = await api('/notifications/unread-count', { useCache: false });
    if (state.unreadCount !== unread) {
      state.unreadCount = unread;
      renderTopbar(); renderSidebar(); renderBottomNav();
    }
  } catch { /* تجاهل */ }
}

async function boot() {
  setupWebViewBridge();
  registerSW();

  const strip = document.getElementById('offline-strip');
  if (strip) strip.hidden = true;
  state.online = true;
  state.networkFailStreak = 0;

  api('/meta').then(m => { state.meta = m; }).catch(() => {});

  api('/me', { useCache: false })
    .then(r => { state.user = r.user; })
    .catch(() => { state.user = null; });

  window.addEventListener('hashchange', render);
  window.addEventListener('online', () => {
    state.networkFailStreak = 0;
    api('/meta', { useCache: false }).then(() => { markReachable(); toast('عاد الاتصال'); refreshUnread(); }).catch(() => {});
  });

  refreshUnread();
  setInterval(() => {
    if (state.online && state.user && !document.hidden) refreshUnread();
  }, 45000);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      if (state.user) refreshUnread();
    }
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
      <div style="text-align:center;padding:64px 24px;color:var(--color-foggy)">
        <h3 style="font-size:20px;margin-bottom:8px;color:var(--color-hof)">تعذّر تحميل التطبيق</h3>
        <p style="font-size:14px">${e.message}</p>
        <button class="btn btn-primary" onclick="location.reload()" style="margin-top:16px;border-radius:var(--radius-inputs);font-weight:600">إعادة التحميل</button>
      </div>`;
  }
});