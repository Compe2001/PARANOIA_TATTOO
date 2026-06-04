/*  Búsqueda por palabras clave con sugerencias y redirección.
   - Coloca search-data.json en la misma carpeta o activa EMBED_DATA.
   - Ajusta routes para apuntar a tus páginas reales. */

(() => {
  // ---------- CONFIG ----------
  const EMBED_DATA = false; // true para usar EMBED_SEARCH_DATA en vez de fetch
  const DATA_URL = './data/searchbar-data.json'; // ruta al JSON
  const MIN_CHARS = 1; // empezar a sugerir
  const MAX_SUGGESTIONS = 6;
  const FUZZY_THRESHOLD = 0.45; // 0..1 (menor = más estricto)

  // Rutas de destino por categoría (ajusta nombres de archivos)
  const routes = {
    "tatuadores": "tatuadores.html",
    "merch": "merch.html",
    "supply": "supply.html",
    "agenda": "citas.html",
    "artists": "artists.html",
    "cursos": "cursos.html"
  };

  // ---------- EMBED DATA (opcional) ----------


  // ---------- UTILIDADES ----------
  const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Distancia de Levenshtein (para fuzzy)
  function levenshtein(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = Array.from({length: b.length + 1}, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  }

  // score 0..1 (1 = idéntico)
  function similarity(a, b) {
    a = normalize(a);
    b = normalize(b);
    if (a === b) return 1;
    const dist = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    return 1 - (dist / maxLen);
  }

  // ---------- DOM helpers ----------
  const input = document.querySelector('.search-bar input[type="search"], .search-bar input[type="text"]');
  const button = document.querySelector('.search-bar button');
  if (!input || !button) return console.warn('Search bar elements not found.');

  // Crear contenedor de sugerencias
  const suggestions = document.createElement('ul');
  suggestions.className = 'suggestions';
  suggestions.setAttribute('role', 'listbox');
  suggestions.hidden = true;
  // Asegurar que header sea relativo para posicionar la lista
  const header = document.querySelector('header') || document.body;
  header.appendChild(suggestions);

  let searchData = null;
  let itemsFlat = []; // {keyword, category}

  function buildFlatList(data) {
    const out = [];
    (data.entries || []).forEach(entry => {
      const cat = entry.category;
      (entry.keywords || []).forEach(k => out.push({ keyword: k, category: cat }));
    });
    return out;
  }

  function loadData() {
    if (EMBED_DATA) {
      searchData = EMBED_SEARCH_DATA;
      itemsFlat = buildFlatList(searchData);
      return Promise.resolve();
    }
    return fetch(DATA_URL, {cache: "no-cache"})
      .then(r => {
        if (!r.ok) throw new Error('No se pudo cargar searchbar-data.json');
        return r.json();
      })
      .then(json => {
        searchData = json;
        itemsFlat = buildFlatList(searchData);
      })
      .catch(err => {
        console.error(err);
        // fallback a embed
        searchData = EMBED_SEARCH_DATA;
        itemsFlat = buildFlatList(searchData);
      });
  }

  // Buscar coincidencias: combina includes, startsWith y fuzzy
  function findMatches(q) {
    q = normalize(q);
    if (!q) return [];
    const results = [];
    for (const it of itemsFlat) {
      const k = normalize(it.keyword);
      let score = 0;
      if (k === q) score = 1.0;
      else if (k.startsWith(q)) score = 0.95;
      else if (k.includes(q)) score = 0.85;
      else {
        const sim = similarity(q, k);
        if (sim >= (1 - FUZZY_THRESHOLD)) score = sim * 0.9;
      }
      if (score > 0) results.push({ keyword: it.keyword, category: it.category, score });
    }
    // Agrupar por categoría y keyword, quedarnos con mejor score
    const map = new Map();
    results.forEach(r => {
      const key = `${r.category}||${r.keyword}`;
      if (!map.has(key) || map.get(key).score < r.score) map.set(key, r);
    });
    const uniq = Array.from(map.values());
    uniq.sort((a,b) => b.score - a.score);
    return uniq.slice(0, MAX_SUGGESTIONS);
  }

  // Render sugerencias
  let focusedIndex = -1;
  function renderSuggestions(list) {
    suggestions.innerHTML = '';
    if (!list.length) {
      suggestions.hidden = true;
      return;
    }
    list.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.setAttribute('role', 'option');
      li.setAttribute('data-category', item.category);
      li.setAttribute('data-keyword', item.keyword);
      li.id = `sugg-${idx}`;
      li.innerHTML = `<strong>${escapeHtml(item.keyword)}</strong> <span style="opacity:.7; margin-left:8px; font-size:.9em">${escapeHtml(item.category)}</span>`;
      li.addEventListener('click', () => selectSuggestion(item));
      li.addEventListener('mousemove', () => setFocus(idx));
      suggestions.appendChild(li);
    });
    focusedIndex = -1;
    suggestions.hidden = false;
  }

  function setFocus(idx) {
    const nodes = suggestions.querySelectorAll('.suggestion-item');
    if (!nodes.length) return;
    if (focusedIndex >= 0 && nodes[focusedIndex]) nodes[focusedIndex].removeAttribute('aria-selected');
    focusedIndex = Math.max(0, Math.min(idx, nodes.length - 1));
    nodes[focusedIndex].setAttribute('aria-selected', 'true');
    nodes[focusedIndex].scrollIntoView({ block: 'nearest' });
  }

  function clearSuggestions() {
    suggestions.innerHTML = '';
    suggestions.hidden = true;
    focusedIndex = -1;
  }

  // Acción al seleccionar sugerencia
  function selectSuggestion(item) {
    // redirigir a la ruta de la categoría
    const cat = item.category;
    const route = routes[cat];
    if (route) {
      // opcional: pasar querystring con keyword
      const url = `${route}?q=${encodeURIComponent(item.keyword)}`;
      window.location.href = url;
    } else {
      // si no hay ruta, buscar por palabra exacta en sitio (fallback)
      window.location.href = `search.html?q=${encodeURIComponent(item.keyword)}`;
    }
  }

  // Acción al enviar (Enter o botón)
  function submitSearch(q) {
    if (!q || !q.trim()) return;
    const matches = findMatches(q);
    if (matches.length) {
      // priorizar la mejor coincidencia
      selectSuggestion(matches[0]);
    } else {
      // fallback: redirigir a página de búsqueda general con query
      window.location.href = `search.html?q=${encodeURIComponent(q.trim())}`;
    }
  }

  // Escape HTML para seguridad en render
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
  }

  // ---------- Eventos UI ----------
  input.addEventListener('input', (e) => {
    const q = e.target.value;
    if (q.length < MIN_CHARS) { clearSuggestions(); return; }
    const matches = findMatches(q);
    renderSuggestions(matches);
  });

  input.addEventListener('keydown', (e) => {
    const nodes = suggestions.querySelectorAll('.suggestion-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (nodes.length === 0) return;
      setFocus((focusedIndex === -1) ? 0 : focusedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (nodes.length === 0) return;
      setFocus((focusedIndex === -1) ? nodes.length - 1 : focusedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && nodes[focusedIndex]) {
        const cat = nodes[focusedIndex].getAttribute('data-category');
        const kw = nodes[focusedIndex].getAttribute('data-keyword');
        selectSuggestion({ category: cat, keyword: kw });
      } else {
        submitSearch(input.value);
      }
    } else if (e.key === 'Escape') {
      clearSuggestions();
    }
  });

  // Click en el botón
  button.addEventListener('click', (e) => {
    e.preventDefault();
    submitSearch(input.value);
  });

  // Click fuera: cerrar sugerencias
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) clearSuggestions();
  });

  // Cargar datos y listo
  loadData().then(() => {
    // itemsFlat ya listo
  });

})();
