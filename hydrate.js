/*
 * hydrate.js — MonoBolón content loader
 * ---------------------------------------------------------
 * Carga los archivos content/*.json (editados desde el panel
 * de administración) y aplica cada precio/nombre/descripción
 * /imagen al elemento correspondiente del HTML por su "id".
 *
 * No cambia el diseño ni la estructura de la página — solo
 * reemplaza el TEXTO y las IMÁGENES que ya están ahí.
 */
(function () {
  var CONTENT_FILES = [
    'content/bolones_tigrillos.json',
    'content/desayunos.json',
    'content/fuertes.json',
    'content/picadas.json',
    'content/bebidas.json'
  ];

  function isBilingual(v) {
    return v && typeof v === 'object' && !Array.isArray(v) &&
      typeof v.es === 'string' && typeof v.en === 'string';
  }

  function applyBilingual(id, key, value) {
    var esEl = document.getElementById(id + '.' + key + '.es');
    var enEl = document.getElementById(id + '.' + key + '.en');
    if (esEl && enEl) {
      esEl.textContent = value.es;
      enEl.textContent = value.en;
      return;
    }
    var plainEl = document.getElementById(id + '.' + key);
    if (plainEl) {
      plainEl.textContent = value.es;
    }
  }

  function applyImage(id, value) {
    var imgEl = document.getElementById(id + '.image') || document.getElementById(id);
    if (imgEl && value) {
      imgEl.src = value;
    }
  }

  function applyPlain(id, key, value) {
    var el = document.getElementById(id + '.' + key);
    if (el) {
      el.textContent = value;
    }
  }

  function hydrateItem(item) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || !item.id) return;
    var id = item.id;
    Object.keys(item).forEach(function (key) {
      if (key === 'id') return;
      var value = item[key];
      if (Array.isArray(value)) {
        value.forEach(hydrateItem);
      } else if (key === 'image' && typeof value === 'string') {
        applyImage(id, value);
      } else if (isBilingual(value)) {
        applyBilingual(id, key, value);
      } else if (typeof value === 'string') {
        applyPlain(id, key, value);
      }
    });
  }

  function walk(node) {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === 'object') {
      if (node.id) {
        hydrateItem(node);
      } else {
        Object.keys(node).forEach(function (k) { walk(node[k]); });
      }
    }
  }

  function loadOne(path) {
    return fetch(path, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) { walk(data); })
      .catch(function (err) {
        console.warn('[hydrate] No se pudo cargar', path, err);
      });
  }

  function loadAll() {
    return Promise.all(CONTENT_FILES.map(loadOne));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
