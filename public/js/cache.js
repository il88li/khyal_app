/* ═══════════════════════════════════════════════
   خيال — طبقة التخزين المحلي والتحميل المسبق
   ═══════════════════════════════════════════════ */

const DB_NAME = 'khayal_db';
const DB_VERSION = 1;
const STORE = 'api_cache';
const MAX_AGE_MS = 5 * 60 * 1000;

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

export async function idbGet(key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => {
        const entry = req.result;
        if (!entry) return resolve(null);
        if (Date.now() - entry.timestamp > MAX_AGE_MS) {
          idbDelete(key);
          return resolve(null);
        }
        resolve(entry.value);
      };
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

export async function idbSet(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ key, value, timestamp: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch { return false; }
}

export async function idbDelete(key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch { return false; }
}

export async function idbClear() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch { return false; }
}

/* ═══════════════════════════════════════════════
   Prefetch — تحميل مسبق للبرومبتات
   ═══════════════════════════════════════════════ */

const _prefetched = new Set();

export function prefetchPrompt(slug) {
  if (!slug || _prefetched.has(slug)) return;
  _prefetched.add(slug);

  fetch('/api/prompts/' + slug, {
    credentials: 'include',
    priority: 'low'
  })
    .then((r) => r.ok ? r.json() : null)
    .then((data) => { if (data) idbSet('prompt:' + slug, data); })
    .catch(() => {});
}

/* ═══════════════════════════════════════════════
   تنظيف دوري
   ═══════════════════════════════════════════════ */

export async function cleanupOldEntries() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const index = store.index('timestamp');
    const threshold = Date.now() - MAX_AGE_MS;
    const req = index.openCursor(IDBKeyRange.upperBound(threshold));
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  } catch { /* تجاهل */ }
}