/*
 * hydrate.js — carta MonoBolón (v2)
 * Lee el menú publicado desde /api/menu (o, si aún no se ha publicado nada,
 * desde content/*.json) y lo aplica a la página:
 *   - platos que ya existen en el HTML: se reutiliza su fila (conserva el diseño)
 *   - platos nuevos: se clona una fila existente como plantilla
 *   - platos quitados u ocultos: su fila se elimina
 */
(function () {
  var S = window.MENU_SCHEMA;
  if (!S) return;
  var KEYS = S.menus.map(function (m) { return m.key; });
  var NEUTRAL = '__ID__';

  function isBi(v) { return v && typeof v === 'object' && !Array.isArray(v) && ('es' in v); }
  function byId(id) { return document.getElementById(id); }
  function setText(el, t) { if (el) el.textContent = t; }
  function langSpans(es, en) {
    var h = document.createDocumentFragment();
    ['es', 'en'].forEach(function (l) {
      var s = document.createElement('span'); s.setAttribute('data-lang', l);
      s.textContent = l === 'es' ? es : en; h.appendChild(s);
    });
    return h;
  }

  function applyField(itemId, key, val) {
    if (key === 'image') {
      var img = byId(itemId + '.image') || byId(itemId);
      if (!img) return;
      if (val) { img.src = val; img.style.display = ''; }
      else {
        var box = img.closest('.dish-img,.ff-img,.sb-photo');
        if (box && box.parentNode) box.parentNode.removeChild(box);
        else { img.removeAttribute('src'); img.style.display = 'none'; }
      }
      return;
    }
    if (isBi(val)) {
      var es = byId(itemId + '.' + key + '.es'), en = byId(itemId + '.' + key + '.en');
      if (es && en) { setText(es, val.es || ''); setText(en, val.en || val.es || ''); return; }
      var plain = byId(itemId + '.' + key);
      if (!plain) return;
      var ve = val.es || '', vn = val.en || val.es || '';
      if (ve === vn) { plain.textContent = ve; }
      else { plain.textContent = ''; plain.appendChild(langSpans(ve, vn)); }
      return;
    }
    if (typeof val === 'string') setText(byId(itemId + '.' + key), val);
  }

  function buildIngs(row, item, isNew) {
    var box = row.querySelector('.cocktail-ings');
    if (!box) return;
    var ings = item.ings;
    if (!ings || !((ings.es || '').trim() || (ings.en || '').trim())) {
      if (isNew && box.parentNode) box.parentNode.removeChild(box);
      return;
    }
    var es = (ings.es || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    var en = (ings.en || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    box.textContent = '';
    es.forEach(function (e, i) {
      var tag = document.createElement('span'); tag.className = 'ing-tag';
      var n = en[i] || e;
      if (n === e) tag.textContent = e; else tag.appendChild(langSpans(e, n));
      box.appendChild(tag);
    });
  }

  function fillItem(row, item, fields, isNew) {
    fields.forEach(function (f) {
      if (f.kind === 'list') return;
      applyField(item.id, f.key, item[f.key]);
    });
    if ('upsell' in item) {
      var ub = row.querySelector('.upsell-badge');
      if (ub && !(item.upsell && (item.upsell.es || '').trim())) ub.parentNode.removeChild(ub);
    }
    if ('ings' in item || isNew) buildIngs(row, item, isNew);
    if (isNew) {
      var tag = row.querySelector('.dish-tag');
      if (tag) tag.parentNode.removeChild(tag);
    }
    var extra = row.querySelector('.mb-thumb,.mb-photo');
    if (extra && !item.image) extra.parentNode.removeChild(extra);
    else if (extra) extra.src = item.image;
    var img = row.querySelector('img');
    if (!img && item.image) addExtraPhoto(row, item.image);
    var t = item.name || item.badge;
    if (img && t) img.alt = (isBi(t) ? t.es : String(t)) || '';
    row.classList.add('visible');
  }
  function addExtraPhoto(row, src) {
    var im = document.createElement('img'); im.src = src; im.alt = '';
    if (/\b(drink-item|extra-item|sb-line|price-table-row)\b/.test(row.className)) {
      im.className = 'mb-thumb';
      var lead = row.firstElementChild;
      if (lead && lead.tagName === 'SPAN') lead.insertBefore(im, lead.firstChild); else row.insertBefore(im, row.firstChild);
    } else { im.className = 'mb-photo'; row.insertBefore(im, row.firstChild); }
  }

  // ---------- plantillas para platos nuevos ----------
  function fieldsOfRow(row, itemId) {
    var set = {};
    var els = row.querySelectorAll('[id^="' + itemId + '."]');
    for (var i = 0; i < els.length; i++) set[els[i].id.slice(itemId.length + 1).split('.')[0]] = 1;
    return set;
  }
  function isEmptyVal(v) {
    if (v == null) return true;
    if (typeof v === 'string') return v.trim() === '';
    if (isBi(v)) return !((v.es || '').trim() || (v.en || '').trim());
    return false;
  }
  function wantedFields(item, fields) {
    var w = {};
    fields.forEach(function (f) {
      if (f.kind === 'list') w[f.key] = 1;
      else if (!isEmptyVal(item[f.key])) w[f.key] = 1;
    });
    return w;
  }
  function pruneEmpty(el, stopAt) {
    var p = el.parentNode;
    if (!p) return;
    p.removeChild(el);
    while (p && p !== stopAt && !p.children.length && !p.textContent.trim()) {
      var q = p.parentNode; if (!q) break; q.removeChild(p); p = q;
    }
  }
  function chooseVariant(variants, want) {
    var wk = Object.keys(want), best = null, exact = null;
    variants.forEach(function (v) {
      var vk = Object.keys(v.sig);
      var covers = wk.every(function (k) { return v.sig[k]; });
      if (covers && vk.length === wk.length) exact = exact || v;
      if (covers && (!best || vk.length < Object.keys(best.sig).length)) best = v;
    });
    if (exact) return exact;
    if (best) return best;
    return variants.slice().sort(function (x, y) { return Object.keys(y.sig).length - Object.keys(x.sig).length; })[0];
  }

  function findRows(prefix, rowClass) {
    var els = document.querySelectorAll('[id^="' + prefix + '"]');
    var rows = [];
    for (var i = 0; i < els.length; i++) {
      var r = els[i].closest('.' + rowClass);
      if (r && rows.indexOf(r) < 0) rows.push(r);
    }
    return rows;
  }
  function itemIdOfRow(row, prefix) {
    var el = row.querySelector('[id^="' + prefix + '"]');
    if (!el) return null;
    return prefix + el.id.slice(prefix.length).split('.')[0];
  }

  function renderList(prefix, rowClass, fields, items) {
    var rows = findRows(prefix, rowClass);
    if (!rows.length) return;
    var existing = {}, variants = [];
    rows.forEach(function (r) {
      var rid = itemIdOfRow(r, prefix);
      existing[rid] = r;
      var sig = fieldsOfRow(r, rid);
      var key = Object.keys(sig).sort().join('|');
      if (variants.some(function (v) { return v.key === key; })) return;
      var tpl = r.cloneNode(true);
      [tpl].concat([].slice.call(tpl.querySelectorAll('[id]'))).forEach(function (el) {
        if (el.id && el.id.indexOf(rid) === 0) el.id = NEUTRAL + el.id.slice(rid.length);
      });
      variants.push({ key: key, sig: sig, tpl: tpl });
    });

    // una lista puede repartirse en varias columnas (varios padres): se conserva el reparto
    var groups = [];
    rows.forEach(function (r) {
      var g = groups.filter(function (x) { return x.parent === r.parentNode; })[0];
      if (!g) { g = { parent: r.parentNode, n: 0, last: r }; groups.push(g); }
      g.n++; g.last = r;
    });
    var shown = items.filter(function (it) { return it.hidden !== true; });
    var counts;
    if (shown.length === rows.length) counts = groups.map(function (g) { return g.n; });
    else {
      var base = Math.floor(shown.length / groups.length), extra = shown.length % groups.length;
      counts = groups.map(function (g, i) { return base + (i < extra ? 1 : 0); });
    }
    groups.forEach(function (g) {
      g.anchor = document.createComment('');
      g.parent.insertBefore(g.anchor, g.last.nextSibling);
    });

    var gi = 0, used = 0, kept = [];
    shown.forEach(function (item) {
      while (gi < groups.length - 1 && used >= counts[gi]) { gi++; used = 0; }
      used++;
      var anchor = groups[gi].anchor, row = existing[item.id], isNew = !row;
      if (isNew) {
        var want = wantedFields(item, fields);
        var v = chooseVariant(variants, want);
        row = v.tpl.cloneNode(true);
        [row].concat([].slice.call(row.querySelectorAll('[id]'))).forEach(function (el) {
          if (el.id && el.id.indexOf(NEUTRAL) === 0) el.id = item.id + el.id.slice(NEUTRAL.length);
        });
        anchor.parentNode.insertBefore(row, anchor);
        Object.keys(v.sig).forEach(function (k) {
          if (want[k]) return;
          [].slice.call(row.querySelectorAll('[id^="' + item.id + '.' + k + '"]')).forEach(function (el) {
            if (row.contains(el) && el !== row) pruneEmpty(el, row);
          });
        });
      } else {
        anchor.parentNode.insertBefore(row, anchor);
        kept.push(row);
      }
      fillItem(row, item, fields, isNew);
      fields.forEach(function (f) {
        if (f.kind === 'list') renderList(item.id + f.suffix, f.rowClass, f.fields, item[f.key] || []);
      });
    });
    rows.forEach(function (r) { if (kept.indexOf(r) < 0 && r.parentNode) r.parentNode.removeChild(r); });
    groups.forEach(function (g) { if (g.anchor.parentNode) g.anchor.parentNode.removeChild(g.anchor); });
  }

  // listas "fijas" (p. ej. los 2 desayunos): se rellenan en su sitio; solo se redibujan sus sublistas
  function fillFixed(fields, items) {
    items.forEach(function (item) {
      fields.forEach(function (f) {
        if (f.kind === 'list') renderList(item.id + f.suffix, f.rowClass, f.fields, item[f.key] || []);
        else applyField(item.id, f.key, item[f.key]);
      });
    });
  }


  // ---------- secciones: título, ocultar, secciones nuevas ----------
  var STYLE = '.mb-hide{display:none!important}.mb-thumb{width:34px;height:34px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-right:8px}.mb-photo{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;border-radius:6px 6px 0 0;margin-bottom:8px}.mb-cdesc{display:block;font-size:10.5px;color:#777;margin-top:1px}';
  function injectStyle() {
    if (document.getElementById('mb-style')) return;
    var st = document.createElement('style'); st.id = 'mb-style'; st.textContent = STYLE; document.head.appendChild(st);
  }
  function fillTitle(te, title, accent) {
    te.textContent = '';
    ['es', 'en'].forEach(function (l) {
      var txt = ((title[l] || title.es || '') + '').trim();
      var span = document.createElement('span'); span.setAttribute('data-lang', l);
      if (accent) {
        var words = txt.split(/\s+/), last = words.pop();
        if (words.length) span.appendChild(document.createTextNode(words.join(' ') + ' '));
        var a = document.createElement('span'); a.className = 'accent'; a.textContent = last; span.appendChild(a);
      } else span.textContent = txt;
      te.appendChild(span);
    });
  }
  function hasText(t) { return t && (((t.es || '') + '').trim() || ((t.en || '') + '').trim()); }
  function setBlockTitle(blockEl, b, title) {
    var te = b.titleSel ? blockEl.querySelector(b.titleSel) : null;
    var accent = b.titleSel ? !!b.accent && /^h2/.test(b.titleSel) : true;
    if (!te) {
      te = document.createElement('h2'); te.className = 'section-title fade-up visible';
      blockEl.insertBefore(te, blockEl.firstChild);
    }
    fillTitle(te, title, accent);
  }
  function applyBlocks(m, data) {
    var meta = data._blocks || {};
    (m.blocks || []).forEach(function (b) {
      var el = byId(b.id); if (!el) return;
      var mt = meta[b.id] || {};
      el.classList.toggle('mb-hide', mt.hidden === true);
      if (hasText(mt.title)) setBlockTitle(el, b, mt.title);
    });
  }
  function div(cls) { var d = document.createElement('div'); d.className = cls; return d; }
  function biNode(tag, v) {
    var el = document.createElement(tag);
    el.appendChild(langSpans((v && v.es) || '', (v && (v.en || v.es)) || ''));
    return el;
  }
  function buildCustom(c) {
    var sec = document.createElement('section'); sec.className = 'section'; sec.id = c.id; sec.setAttribute('data-mb-custom', '1');
    var h2 = document.createElement('h2'); h2.className = 'section-title fade-up visible';
    fillTitle(h2, c.title || { es: '', en: '' }, true); sec.appendChild(h2);
    var group = div('drink-group fade-up visible');
    (c.items || []).forEach(function (it) {
      if (it.hidden === true) return;
      if (it.image) {
        var card = div('ff-card fade-up visible'), imgBox = div('ff-img landscape'), im = document.createElement('img');
        im.src = it.image; im.alt = (it.name && it.name.es) || ''; imgBox.appendChild(im); card.appendChild(imgBox);
        var body = div('ff-body'), left = document.createElement('div');
        left.appendChild(Object.assign(biNode('div', it.name), { className: 'ff-name' }));
        if (hasText(it.desc)) left.appendChild(Object.assign(biNode('div', it.desc), { className: 'ff-desc' }));
        body.appendChild(left);
        if ((it.price || '').trim()) { var p = div('ff-price'); p.textContent = it.price; body.appendChild(p); }
        card.appendChild(body); group.appendChild(card);
      } else {
        var row = div('drink-item'), lead = document.createElement('span');
        lead.appendChild(biNode('span', it.name));
        if (hasText(it.desc)) { var d = biNode('span', it.desc); d.className = 'mb-cdesc'; lead.appendChild(d); }
        row.appendChild(lead);
        var b = document.createElement('b'); b.textContent = it.price || ''; row.appendChild(b);
        group.appendChild(row);
      }
    });
    sec.appendChild(group);
    return sec;
  }
  function applyCustom(m, data) {
    var last = {};
    (data._custom || []).forEach(function (c) {
      if (c.hidden === true) return;
      var aid = c.after && byId(c.after) ? c.after : (m.blocks.length ? m.blocks[m.blocks.length - 1].id : null);
      var anchor = aid && byId(aid); if (!anchor) return;
      var sec = buildCustom(c), ref = last[aid] || anchor;
      ref.parentNode.insertBefore(sec, ref.nextSibling); last[aid] = sec;
    });
  }

  function apply(menu) {
    injectStyle();
    [].slice.call(document.querySelectorAll('[data-mb-custom]')).forEach(function (e) { e.parentNode.removeChild(e); });
    S.menus.forEach(function (m) {
      var data = menu[m.key];
      if (!data) return;
      applyBlocks(m, data);
      applyCustom(m, data);
      m.sections.forEach(function (sec) {
        var v = data[sec.key];
        if (v == null) return;
        if (sec.type === 'hero') { if (v.image) applyField(v.id, 'image', v.image); return; }
        if (sec.fixed) fillFixed(sec.fields, v);
        else renderList(sec.prefix, sec.rowClass, sec.fields, v);
      });
    });
  }

  function withTimeout(p, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error('timeout')); }, ms);
      p.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }
  function loadStatic() {
    return Promise.all(KEYS.map(function (k) {
      return fetch('content/' + k + '.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
    })).then(function (arr) {
      var o = {}; KEYS.forEach(function (k, i) { o[k] = arr[i]; }); return o;
    });
  }
  function load() {
    return withTimeout(fetch('/api/menu', { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('api ' + r.status);
      return r.json();
    }), 5000).then(function (j) {
      if (j && j.menu) return j.menu;
      throw new Error('sin menú publicado');
    }).catch(function () { return loadStatic(); });
  }
  function start() {
    load().then(apply).catch(function (e) { console.warn('[menu] no se pudo cargar el menú', e && (e.stack || e.message)); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.__menuApply = apply;
})();
