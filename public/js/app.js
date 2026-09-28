import { Screens } from './screens.js';

const TOKEN_KEY = 'khayal_token';
const ADMIN_KEY = 'khayal_admin';

export const state = {
  user: null,
  meta: { categories: [], models: [], stats: {} },
  online: navigator.onLine,
  adminToken: sessionStorage.getItem(ADMIN_KEY) || null
};

export async function api(path, { method = 'GET', body, admin = false } = {}) {
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
    throw new Error('تعذّر الاتصال بالخادم');
  }
  if (!res.ok && res.status >= 500) setOnline(false);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'حدث خطأ غير متوقع');
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
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

export const navigate = (hash) => {
  if (location.hash === hash) render();
  else location.hash = hash;
};

function setOnline(v) {
  if (state.online === v) return;
  state.online = v;
  const strip = document.getElementById('offline-strip');
  if (strip) strip.hidden = v;
  renderTopbar();
  if (!v && currentScreen() !== 'offline') navigate('#/offline');
}

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
  favorites: 'favorites', admin: 'admin', offline: 'offline'
};

function currentScreen() {
  try {
    const { parts } = parseRoute();
    return SCREEN_NAMES[parts[0] ?? ''] || 'home';
  } catch { return 'home'; }
}

const FLAME = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 2.5c.6 3.6 3 5 4.7 6.9A6.7 6.7 0 0 1 18.6 14a6.6 6.6 0 0 1-13.2 0c0-2.2 1-3.7 2.3-5.1.5 1 1.2 1.7 2 2-.4-3 .8-6 2.3-8.4Z" fill="#ff4d00"/>
  <path d="M12 21a3 3 0 0 0 3-3c0-1.6-1.2-2.6-3-4.4-1.8 1.8-3 2.8-3 4.4a3 3 0 0 0 3 3Z" fill="#fcddcc"/>
</svg>`;

function initials(name = '') {
  return String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('');
}

function renderTopbar() {
  try {
    const { parts } = parseRoute();
    const root = parts[0] ?? '';
    const link = (href, label, key) =>
      `<a href="${href}" class="${root === key ? 'active' : ''}">${label}</a>`;

    document.getElementById('topbar').innerHTML = `
      <div class="topbar-inner">
        <a class="brand" href="#/">${FLAME}<span class="brand-name">خيال</span></a>
        <nav class="topnav">
          ${link('#/', 'الرئيسية', '')}
          ${link('#/explore', 'استكشف', 'explore')}
          ${link('#/profile', 'بروفيلي', 'profile')}
        </nav>
        <div class="topbar-actions">
          <span class="conn ${state.online ? '' : 'off'}">
            <span class="dot"></span>
            <span class="lbl">${state.online ? 'متصل' : 'غير متصل'}</span>
          </span>
          ${state.user
            ? `<a href="#/profile" title="${state.user.name}">
                 <span class="avatar ${state.user.verified ? 'verified' : ''}" style="--s:32px">
                   ${state.user.avatar ? `<img src="${state.user.avatar}" alt="">` : initials(state.user.name)}
                 </span>
               </a>`
            : `<a class="btn btn-ghost btn-sm" href="#/login">دخول</a>`}
          <a class="btn btn-primary btn-sm" href="#/new">انشر</a>
        </div>
      </div>`;
  } catch (e) { console.error('topbar:', e); }
}

const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/></svg>`,
  explore: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20Z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>`
};

function renderBottomNav() {
  try {
    const { parts } = parseRoute();
    const root = parts[0] ?? '';
    const item = (href, label, icon, key) => `
      <a class="bn-item ${root === key ? 'active' : ''}" href="${href}">
        ${icon}<span>${label}</span>
      </a>`;
    document.getElementById('bottomnav').innerHTML = `
      <div class="bottomnav-inner">
        ${item('#/', 'الرئيسية', ICONS.home, '')}
        ${item('#/explore', 'استكشف', ICONS.explore, 'explore')}
        <a class="bn-share" href="#/new" aria-label="انشر">${ICONS.plus}</a>
        ${item('#/favorites', 'تفضيلاتي', ICONS.heart, 'favorites')}
        ${state.user
          ? item('#/profile', 'حسابي', ICONS.user, 'profile')
          : item('#/login', 'دخول', ICONS.user, 'login')}
      </div>`;
  } catch (e) { console.error('bottomnav:', e); }
}

let _rendering = false;
async function render() {
  if (_rendering) return;
  _rendering = true;
  try {
    renderTopbar();
    renderBottomNav();

    if (!state.online && currentScreen() !== 'offline') {
      location.hash = '#/offline';
      return;
    }

    const { parts, query } = parseRoute();
    const name = currentScreen();
    const screen = Screens[name] || Screens.home;

    const root = document.getElementById('app');
    root.innerHTML = `<div style="padding:110px 0"><div class="spinner"></div></div>`;

    const ctx = {
      api, navigate, toast, state,
      params: query,
      id: parts[1] || null,
      async refreshMe() {
        try {
          const { user } = await api('/me');
          state.user = user;
          renderTopbar(); renderBottomNav();
        } catch {}
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        state.user = null;
        renderTopbar(); renderBottomNav();
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
        <div class="state" style="margin-top:70px">
          <div class="icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 8v5M12 16.5v.01"/><circle cx="12" cy="12" r="9"/></svg>
          </div>
          <h3>حدث خطأ</h3>
          <p>${e.message}</p>
          <button class="btn btn-outline" onclick="location.reload()">إعادة المحاولة</button>
        </div>`;
    }
    window.scrollTo(0, 0);
  } finally {
    _rendering = false;
  }
}

/* ═══════════ Scroll effect على الشريط العلوي ═══════════ */
let _scrollTick = false;
window.addEventListener('scroll', () => {
  if (_scrollTick) return;
  _scrollTick = true;
  requestAnimationFrame(() => {
    const tb = document.querySelector('.topbar');
    if (tb) tb.classList.toggle('scrolled', window.scrollY > 6);
    _scrollTick = false;
  });
}, { passive: true });

/* ═══════════ Android WebView bridge ═══════════ */
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

async function boot() {
  setupWebViewBridge();
  const strip = document.getElementById('offline-strip');
  if (strip) strip.hidden = state.online;

  // جلب meta و /me بالتوازي لتقليل زمن التحميل
  const promises = [api('/meta').then(m => state.meta = m).catch(() => {})];
  if (localStorage.getItem(TOKEN_KEY)) {
    promises.push(
      api('/me').then(r => state.user = r.user)
        .catch(() => localStorage.removeItem(TOKEN_KEY))
    );
  }
  await Promise.all(promises);

  window.addEventListener('hashchange', render);
  window.addEventListener('online', () => {
    setOnline(true);
    toast('عاد الاتصال');
    if (currentScreen() === 'offline') navigate('#/');
  });
  window.addEventListener('offline', () => {
    setOnline(false);
    toast('انقطع الاتصال', 'error');
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
      <div class="state" style="margin-top:70px">
        <h3>تعذّر تحميل التطبيق</h3>
        <p>${e.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">إعادة التحميل</button>
      </div>`;
  }
});