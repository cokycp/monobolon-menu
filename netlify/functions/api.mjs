// MonoBolón — API del panel (Netlify Functions v2 + Netlify Blobs)
//   GET  /api/menu            público  -> { menu, version } (menu=null si nunca se publicó nada)
//   POST /api/login           { pin }  -> { token, role }
//   PUT  /api/menu            requiere token (owner|staff)
//   POST /api/upload          requiere token, cuerpo = imagen
//   GET  /api/img/:key        público
//   GET  /api/history         owner
//   POST /api/restore         owner  { key }
import { createHmac, timingSafeEqual, createHash, randomBytes, scryptSync } from 'node:crypto';

const MENU_KEYS = ['bolones_tigrillos', 'desayunos', 'fuertes', 'picadas', 'bebidas'];
const SESSION_HOURS = 12;
const DEFAULT_STAFF_PIN = '2026';
const MAX_FAILS = 5;
const LOCK_MIN = 15;
const MAX_IMG_BYTES = 4 * 1024 * 1024;
const MAX_MENU_BYTES = 600 * 1024;
const HISTORY_KEEP = 20;
const STAFF_FIELDS = ['price', 'entero', 'media', 'image', 'hidden'];

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });

const b64u = (buf) => Buffer.from(buf).toString('base64url');

function secretFrom(env) {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  return createHash('sha256').update(`${env.OWNER_PIN || ''}|${env.STAFF_PIN || ''}|monobolon-v1`).digest('hex');
}
function sign(payload, env) {
  const body = b64u(JSON.stringify(payload));
  const mac = createHmac('sha256', secretFrom(env)).update(body).digest('base64url');
  return `${body}.${mac}`;
}
function verify(token, env, nowMs = Date.now(), ownerV = 0) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const good = createHmac('sha256', secretFrom(env)).update(body).digest('base64url');
  const a = Buffer.from(mac || ''), b = Buffer.from(good);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!p.e || p.e < nowMs) return null;
    if (p.r !== 'owner' && p.r !== 'staff') return null;
    if (p.r === 'owner' && (p.pv || 0) !== ownerV) return null;
    return p;
  } catch { return null; }
}
function hashPin(pin, salt) { return scryptSync(String(pin), salt, 32).toString('hex'); }
function safeEq(a, b) {
  const x = createHash('sha256').update(String(a)).digest();
  const y = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(x, y);
}

// ---------- validación del menú ----------
const IMG_RE = /^(images\/[\w\-./]+|\/api\/img\/[\w\-.]+)$/;
const ID_RE = /^[\w\-.]+$/;

function cleanStr(v, max = 400) {
  return String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, max);
}
function cleanNode(node, depth = 0) {
  if (depth > 8) throw new Error('Estructura demasiado profunda');
  if (Array.isArray(node)) return node.slice(0, 400).map((n) => cleanNode(n, depth + 1));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (!/^[\w\-]+$/.test(k)) continue;
      if (k === 'id') {
        if (typeof v !== 'string' || !ID_RE.test(v) || v.length > 160) throw new Error('id inválido');
        out.id = v;
      } else if (k === 'image') {
        if (v === '' || v == null) out.image = '';
        else if (typeof v === 'string' && IMG_RE.test(v)) out.image = v;
        else throw new Error('Ruta de imagen inválida');
      } else if (k === 'hidden') {
        out.hidden = v === true;
      } else if (v === null) {
        out[k] = null;
      } else if (typeof v === 'string') {
        out[k] = cleanStr(v);
      } else if (typeof v === 'object') {
        out[k] = cleanNode(v, depth + 1);
      }
    }
    return out;
  }
  if (typeof node === 'string') return cleanStr(node);
  return node ?? null;
}
function validateMenu(menu) {
  if (!menu || typeof menu !== 'object' || Array.isArray(menu)) throw new Error('Formato inválido');
  const out = {};
  for (const k of MENU_KEYS) {
    if (!(k in menu)) throw new Error(`Falta la sección ${k}`);
    out[k] = cleanNode(menu[k]);
  }
  const size = Buffer.byteLength(JSON.stringify(out));
  if (size > MAX_MENU_BYTES) throw new Error('El menú es demasiado grande');
  return out;
}
function indexById(node, map = new Map()) {
  if (Array.isArray(node)) node.forEach((n) => indexById(n, map));
  else if (node && typeof node === 'object') {
    if (node.id) map.set(node.id, node);
    Object.values(node).forEach((v) => indexById(v, map));
  }
  return map;
}
// Staff: solo puede cambiar precios, fotos y ocultar. Nada de agregar/quitar/renombrar.
function mergeStaff(stored, submitted) {
  const subMap = indexById(submitted);
  const out = JSON.parse(JSON.stringify(stored));
  (function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === 'object') {
      if (node.id && subMap.has(node.id)) {
        const s = subMap.get(node.id);
        if (!('items' in node)) {   // el equipo no toca las secciones nuevas, solo sus platos
          for (const f of STAFF_FIELDS) {
            if (f in s && (f in node || f === 'hidden' || f === 'image')) node[f] = s[f];
          }
        }
      }
      Object.values(node).forEach(walk);
    }
  })(out);
  return out;
}

// ---------- fábrica del handler (inyectable para pruebas) ----------
export function createHandler({ env, menuStore, imgStore, loadBaseline, now = () => Date.now() }) {
  const staffPin = () => env.STAFF_PIN || DEFAULT_STAFF_PIN;
  const getOwnerRec = async () => (await menuStore.get('owner-pin', { type: 'json' })) || null;
  const authOf = async (req) => {
    const h = req.headers.get('authorization') || '';
    const rec = await getOwnerRec();
    return verify(h.startsWith('Bearer ') ? h.slice(7) : '', env, now(), rec ? rec.v : 0);
  };
  const ownerMatches = async (pin) => {
    const rec = await getOwnerRec();
    if (rec) return safeEq(hashPin(pin, rec.salt), rec.hash);
    return !!env.OWNER_PIN && safeEq(pin, env.OWNER_PIN);
  };
  const ipOf = (req) =>
    (req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();

  async function saveMenu(data, role) {
    const prev = await menuStore.get('current', { type: 'json' });
    if (prev) {
      await menuStore.setJSON(`h-${String(prev.v).padStart(14, '0')}`, prev);
      const { blobs } = await menuStore.list({ prefix: 'h-' });
      const old = blobs.map((b) => b.key).sort().reverse().slice(HISTORY_KEEP);
      for (const k of old) await menuStore.delete(k);
    }
    const rec = { v: now(), by: role, data };
    await menuStore.setJSON('current', rec);
    return rec;
  }

  return async function handler(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    const method = req.method;

    try {
      // ---- público ----
      if (path === '/api/menu' && method === 'GET') {
        const rec = await menuStore.get('current', { type: 'json' });
        return json({ menu: rec ? rec.data : null, version: rec ? rec.v : null });
      }
      if (path.startsWith('/api/img/') && method === 'GET') {
        const key = decodeURIComponent(path.slice('/api/img/'.length));
        if (!/^[\w\-.]+$/.test(key)) return json({ error: 'No encontrada' }, 404);
        const r = await imgStore.getWithMetadata(key, { type: 'arrayBuffer' });
        if (!r || !r.data) return json({ error: 'No encontrada' }, 404);
        return new Response(r.data, {
          headers: {
            'content-type': (r.metadata && r.metadata.contentType) || 'image/jpeg',
            'cache-control': 'public, max-age=31536000, immutable',
          },
        });
      }

      // ---- login ----
      if (path === '/api/login' && method === 'POST') {
        if (!env.OWNER_PIN && !(await getOwnerRec())) {
          return json({ error: 'El PIN del dueño aún no está configurado en Netlify (OWNER_PIN).' }, 503);
        }
        const ip = ipOf(req);
        const rlKey = `rl-${createHash('sha256').update(ip).digest('hex').slice(0, 24)}`;
        const rl = (await menuStore.get(rlKey, { type: 'json' })) || { n: 0, until: 0 };
        if (rl.until > now()) {
          const mins = Math.ceil((rl.until - now()) / 60000);
          return json({ error: `Demasiados intentos. Espera ${mins} min.` }, 429);
        }
        let body = {};
        try { body = await req.json(); } catch {}
        const pin = String(body.pin || '');
        let role = null;
        if (pin && (await ownerMatches(pin))) role = 'owner';
        else if (pin && safeEq(pin, staffPin())) role = 'staff';
        if (!role) {
          const n = (rl.n || 0) + 1;
          const rec = n >= MAX_FAILS ? { n: 0, until: now() + LOCK_MIN * 60000 } : { n, until: 0 };
          await menuStore.setJSON(rlKey, rec);
          return json({ error: n >= MAX_FAILS ? `Demasiados intentos. Espera ${LOCK_MIN} min.` : 'PIN incorrecto' }, 401);
        }
        if (rl.n) await menuStore.setJSON(rlKey, { n: 0, until: 0 });
        const exp = now() + SESSION_HOURS * 3600 * 1000;
        const orec = await getOwnerRec();
        return json({ token: sign({ r: role, e: exp, pv: role === 'owner' ? (orec ? orec.v : 0) : 0 }, env), role, exp });
      }

      // ---- autenticado ----
      const auth = await authOf(req);
      if (!auth) return json({ error: 'Sesión vencida. Vuelve a ingresar tu PIN.' }, 401);

      if (path === '/api/menu' && method === 'PUT') {
        const raw = await req.text();
        if (raw.length > MAX_MENU_BYTES * 2) return json({ error: 'Demasiado grande' }, 413);
        let body;
        try { body = JSON.parse(raw); } catch { return json({ error: 'JSON inválido' }, 400); }
        let submitted;
        try { submitted = validateMenu(body.menu); } catch (e) { return json({ error: e.message }, 400); }
        let finalMenu = submitted;
        if (auth.r === 'staff') {
          let base;
          const rec = await menuStore.get('current', { type: 'json' });
          base = rec ? rec.data : await loadBaseline(url.origin);
          if (!base) return json({ error: 'No se pudo cargar el menú base' }, 500);
          finalMenu = mergeStaff(base, submitted);
        }
        const rec = await saveMenu(finalMenu, auth.r);
        return json({ ok: true, version: rec.v, menu: finalMenu });
      }

      if (path === '/api/upload' && method === 'POST') {
        const buf = Buffer.from(await req.arrayBuffer());
        if (!buf.length) return json({ error: 'Archivo vacío' }, 400);
        if (buf.length > MAX_IMG_BYTES) return json({ error: 'Imagen demasiado grande (máx. 4 MB)' }, 413);
        let ext = null, type = null;
        if (buf[0] === 0xff && buf[1] === 0xd8) { ext = 'jpg'; type = 'image/jpeg'; }
        else if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) { ext = 'png'; type = 'image/png'; }
        else if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') { ext = 'webp'; type = 'image/webp'; }
        if (!ext) return json({ error: 'Formato no soportado (usa JPG, PNG o WebP)' }, 415);
        const key = `${now().toString(36)}-${randomBytes(4).toString('hex')}.${ext}`;
        await imgStore.set(key, buf, { metadata: { contentType: type } });
        return json({ ok: true, url: `/api/img/${key}` });
      }

      // ---- solo dueño ----
      if (path === '/api/change-pin' && method === 'POST') {
        if (auth.r !== 'owner') return json({ error: 'Solo el dueño' }, 403);
        const body = await req.json().catch(() => ({}));
        const cur = String(body.current || ''), np = String(body.newPin || '');
        if (!(await ownerMatches(cur))) return json({ error: 'El PIN actual no es correcto' }, 401);
        if (!/^\d{4,8}$/.test(np)) return json({ error: 'El PIN nuevo debe tener de 4 a 8 números' }, 400);
        if (safeEq(np, staffPin())) return json({ error: 'Ese PIN ya lo usa el equipo. Elige otro.' }, 400);
        const prev = await getOwnerRec();
        const salt = randomBytes(16).toString('hex');
        const rec = { salt, hash: hashPin(np, salt), v: ((prev && prev.v) || 0) + 1 };
        await menuStore.setJSON('owner-pin', rec);
        const exp = now() + SESSION_HOURS * 3600 * 1000;
        return json({ ok: true, token: sign({ r: 'owner', e: exp, pv: rec.v }, env), role: 'owner', exp });
      }
      if (path === '/api/history' && method === 'GET') {
        if (auth.r !== 'owner') return json({ error: 'Solo el dueño' }, 403);
        const { blobs } = await menuStore.list({ prefix: 'h-' });
        const keys = blobs.map((b) => b.key).sort().reverse();
        const items = [];
        for (const k of keys) {
          const r = await menuStore.get(k, { type: 'json' });
          if (r) items.push({ key: k, v: r.v, by: r.by });
        }
        return json({ items });
      }
      if (path === '/api/restore' && method === 'POST') {
        if (auth.r !== 'owner') return json({ error: 'Solo el dueño' }, 403);
        const body = await req.json().catch(() => ({}));
        if (!/^h-\d+$/.test(body.key || '')) return json({ error: 'Versión inválida' }, 400);
        const r = await menuStore.get(body.key, { type: 'json' });
        if (!r) return json({ error: 'Versión no encontrada' }, 404);
        const rec = await saveMenu(r.data, 'owner');
        return json({ ok: true, version: rec.v, menu: r.data });
      }

      return json({ error: 'No encontrado' }, 404);
    } catch (e) {
      console.error('[api]', e);
      return json({ error: 'Error del servidor' }, 500);
    }
  };
}

// ---------- entrada real de Netlify ----------
let _handler;
export default async (req) => {
  if (!_handler) {
    const { getStore } = await import('@netlify/blobs');
    const env = {
      OWNER_PIN: process.env.OWNER_PIN,
      STAFF_PIN: process.env.STAFF_PIN,   // opcional; por defecto 2026
      SESSION_SECRET: process.env.SESSION_SECRET,
    };
    _handler = createHandler({
      env,
      menuStore: getStore({ name: 'menu', consistency: 'strong' }),
      imgStore: getStore({ name: 'images', consistency: 'strong' }),
      loadBaseline: async (origin) => {
        const out = {};
        for (const k of MENU_KEYS) {
          const r = await fetch(`${origin}/content/${k}.json`);
          if (!r.ok) return null;
          out[k] = await r.json();
        }
        return out;
      },
    });
  }
  return _handler(req);
};

export const config = { path: '/api/*' };
