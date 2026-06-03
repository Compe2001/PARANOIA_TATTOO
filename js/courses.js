// ─── Estado ───────────────────────────────────────────────────────────────
let allCourses   = [];
let categories   = [];
let activeFilter = 'Todos';

// ─── Carga el JSON ────────────────────────────────────────────────────────
async function loadCourses() {
  try {
    const res  = await fetch('../data/courses.json');
    const data = await res.json();
    allCourses = data.courses;
    categories = data.categories;
  } catch (e) {
    allCourses = FALLBACK_COURSES;
    categories = ['Todos', 'Principiante', 'Intermedio', 'Avanzado', 'Workshop'];
  }
  init();
}

function init() {
  buildFilters();
  renderGrid();
}

// ─── Filtros ──────────────────────────────────────────────────────────────
function buildFilters() {
  const ctrl = document.getElementById('filterControls');
  ctrl.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === activeFilter ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => { activeFilter = cat; buildFilters(); renderGrid(); };
    ctrl.appendChild(btn);
  });

  const right = document.createElement('div');
  right.className = 'controls-right';
  right.innerHTML = `
    <select class="sort-select" id="sortSelect" onchange="renderGrid()">
      <option value="default">Orden default</option>
      <option value="price-asc">Precio: menor a mayor</option>
      <option value="price-desc">Precio: mayor a menor</option>
      <option value="cupos">Mayor disponibilidad</option>
      <option value="fecha">Próxima fecha</option>
    </select>
    <span class="results-count" id="resultsCount"></span>`;
  ctrl.appendChild(right);
}

// ─── Grid ─────────────────────────────────────────────────────────────────
function renderGrid() {
  const grid    = document.getElementById('coursesGrid');
  const sortVal = document.getElementById('sortSelect')?.value || 'default';

  let filtered = activeFilter === 'Todos'
    ? [...allCourses]
    : allCourses.filter(c => c.category === activeFilter);

  // Búsqueda
  const q = document.getElementById('navSearch')?.value.trim().toLowerCase() || '';
  if (q) filtered = filtered.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.instructor.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );

  // Ordenar
  if      (sortVal === 'price-asc')  filtered.sort((a,b) => a.price - b.price);
  else if (sortVal === 'price-desc') filtered.sort((a,b) => b.price - a.price);
  else if (sortVal === 'cupos')      filtered.sort((a,b) => b.cupos_disponibles - a.cupos_disponibles);
  else if (sortVal === 'fecha')      filtered.sort((a,b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

  document.getElementById('resultsCount').textContent =
    `${filtered.length} curso${filtered.length !== 1 ? 's' : ''}`;

  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state"><span>🔍</span>Sin resultados para esta búsqueda.</div>`;
    return;
  }
  filtered.forEach(c => grid.appendChild(createCourseCard(c)));
}

// ─── Crea una card con carrusel interno ───────────────────────────────────
function createCourseCard(course) {
  const soldOut   = course.cupos_disponibles === 0;
  const lowCupos  = course.cupos_disponibles > 0 && course.cupos_disponibles <= 2;
  const pct       = Math.round(((course.cupos_total - course.cupos_disponibles) / course.cupos_total) * 100);
  const fillClass = soldOut ? 'fill-empty' : lowCupos ? 'fill-low' : 'fill-ok';
  const cuposColor= soldOut ? 'var(--red)' : lowCupos ? 'var(--gold)' : 'var(--green)';
  const cuposText = soldOut
    ? '<span style="color:var(--red)">Sin lugares disponibles</span>'
    : lowCupos
    ? `<span style="color:var(--gold)">⚡ Solo ${course.cupos_disponibles} lugar${course.cupos_disponibles > 1 ? 'es' : ''} disponible${course.cupos_disponibles > 1 ? 's' : ''}</span>`
    : `<span style="color:var(--green)">${course.cupos_disponibles} lugares disponibles</span>`;

  // Badge
  let badgeHTML = '';
  if (course.badge) {
    const badgeMap = {
      'NUEVO': 'badge-nuevo',
      'AGOTADO': 'badge-agotado',
      'ÚLTIMOS LUGARES': 'badge-ultimos',
      'WORKSHOP': 'badge-workshop'
    };
    const cls = badgeMap[course.badge] || 'badge-nuevo';
    badgeHTML = `<div class="card-badge ${cls}">${course.badge}</div>`;
  }

  // Level class
  const levelClass = {
    'Principiante': 'level-principiante',
    'Intermedio':   'level-intermedio',
    'Avanzado':     'level-avanzado'
  }[course.level] || 'level-intermedio';

  // Fecha formateada
  const fecha = new Date(course.fecha_inicio + 'T00:00:00');
  const fechaStr = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  // Includes
  const includesHTML = course.includes.map(i => `<li>${i}</li>`).join('');

  // Imágenes del carrusel (máx 5)
  const imgs = course.images.slice(0, 5);
  const cardId = `course-${course.id}`;

  const card = document.createElement('div');
  card.className = 'course-card' + (soldOut ? ' sold-out' : '');

  card.innerHTML = `
    ${badgeHTML}

    <!-- CARRUSEL DE IMÁGENES -->
    <div class="card-carousel" id="carousel-${cardId}">
      <div class="card-carousel-track" id="track-${cardId}">
        ${imgs.map((src, i) => `<img src="${src}" alt="${course.title} foto ${i+1}" loading="${i===0?'eager':'lazy'}" onerror="this.src='https://placehold.co/600x220/161616/333?text=PARANOIA'">`).join('')}
      </div>
      ${imgs.length > 1 ? `
        <button class="card-carousel-btn prev" id="prev-${cardId}" onclick="slideCard('${cardId}',-1,${imgs.length})" aria-label="Anterior">‹</button>
        <button class="card-carousel-btn next" id="next-${cardId}" onclick="slideCard('${cardId}',1,${imgs.length})" aria-label="Siguiente">›</button>
        <div class="card-carousel-dots" id="dots-${cardId}">
          ${imgs.map((_,i) => `<button class="card-dot ${i===0?'active':''}" onclick="goCardSlide('${cardId}',${i},${imgs.length})" aria-label="Foto ${i+1}"></button>`).join('')}
        </div>
        <div class="img-counter" id="counter-${cardId}">1 / ${imgs.length}</div>
      ` : ''}
    </div>

    <!-- BODY -->
    <div class="card-body">
      <div class="card-meta">
        <span class="card-level ${levelClass}">${course.level}</span>
        <span class="card-category-tag">${course.category}</span>
      </div>

      <div class="card-title">${course.title}</div>
      <div class="card-subtitle">${course.subtitle}</div>
      <div class="card-instructor">
        <span>🎨</span> ${course.instructor}
      </div>

      <p class="card-description">${course.description}</p>

      <div class="card-info-row">
        <div class="info-chip"><span>⏱</span>${course.duration}</div>
        <div class="info-chip"><span>📅</span>${course.schedule}</div>
        <div class="info-chip"><span>🗓</span>Inicio: ${fechaStr}</div>
      </div>

      <!-- CUPOS -->
      <div class="cupos-section">
        <div class="cupos-header">
          <span class="cupos-label">Cupos</span>
          <span class="cupos-numbers" style="color:${cuposColor}">${course.cupos_disponibles} / ${course.cupos_total}</span>
        </div>
        <div class="cupos-bar-track">
          <div class="cupos-bar-fill ${fillClass}" style="width:${pct}%"></div>
        </div>
        <div class="cupos-tag">${cuposText}</div>
      </div>

      <!-- INCLUYE -->
      <ul class="includes-list">
        ${includesHTML}
      </ul>

      <!-- FOOTER -->
      <div class="card-footer">
        <div class="card-price">
          $${course.price.toLocaleString('es-MX')} MXN
          <small>precio por persona</small>
        </div>
        ${soldOut
          ? `<button class="btn-enroll lista-espera" onclick="joinWaitlist('${course.title}')">Lista de espera</button>`
          : `<button class="btn-enroll" onclick="enrollCourse('${course.title}')">Inscribirme</button>`
        }
      </div>
    </div>`;

  return card;
}

// ─── Carrusel interno de card ─────────────────────────────────────────────
// Guardamos el índice actual de cada carrusel
const carouselIndexMap = {};

function slideCard(cardId, dir, total) {
  if (!(cardId in carouselIndexMap)) carouselIndexMap[cardId] = 0;
  const newIdx = carouselIndexMap[cardId] + dir;
  if (newIdx < 0 || newIdx >= total) return;
  goCardSlide(cardId, newIdx, total);
}

function goCardSlide(cardId, idx, total) {
  carouselIndexMap[cardId] = idx;

  const track   = document.getElementById(`track-${cardId}`);
  const dots    = document.getElementById(`dots-${cardId}`);
  const counter = document.getElementById(`counter-${cardId}`);
  const prevBtn = document.getElementById(`prev-${cardId}`);
  const nextBtn = document.getElementById(`next-${cardId}`);

  if (track)   track.style.transform = `translateX(-${idx * 100}%)`;
  if (counter) counter.textContent   = `${idx + 1} / ${total}`;
  if (dots) {
    dots.querySelectorAll('.card-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  if (prevBtn) prevBtn.disabled = idx === 0;
  if (nextBtn) nextBtn.disabled = idx >= total - 1;
}

// ─── Acciones ─────────────────────────────────────────────────────────────
function enrollCourse(title) {
  showToast(`✅`, `Inscripción para "${title}" iniciada`);
}
function joinWaitlist(title) {
  showToast(`📋`, `Te agregamos a la lista de espera para "${title}"`);
}

function showToast(icon, msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent   = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Búsqueda en tiempo real ──────────────────────────────────────────────
document.getElementById('navSearch')?.addEventListener('input', () => renderGrid());

// ─── Fallback ─────────────────────────────────────────────────────────────
const FALLBACK_COURSES = [
  {
    id:1, title:"Fundamentos del Tatuaje", subtitle:"Teoría y práctica base",
    category:"Principiante", instructor:"Carlos 'Ink' Herrera",
    duration:"4 semanas", schedule:"Sábados 10:00 – 14:00",
    price:3500, cupos_total:8, cupos_disponibles:3, level:"Principiante",
    description:"Aprende los fundamentos del tatuaje: seguridad e higiene, manejo de máquina, técnicas de línea y sombreado básico. Incluye kit de práctica.",
    includes:["Kit de agujas y tintas","Material de higiene","Certificado de finalización","Acceso a grupo privado"],
    images:[
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80",
      "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&q=80",
      "https://images.unsplash.com/photo-1567459169668-6e4673db6c3a?w=600&q=80"
    ],
    fecha_inicio:"2026-07-05", badge:"NUEVO"
  },
  {
    id:2, title:"Realismo en Blanco y Negro", subtitle:"Domina el sombreado avanzado",
    category:"Avanzado", instructor:"Daniela Voss",
    duration:"6 semanas", schedule:"Martes y Jueves 16:00 – 19:00",
    price:6800, cupos_total:6, cupos_disponibles:1, level:"Avanzado",
    description:"Técnicas avanzadas de sombreado para lograr realismo fotográfico. Retratos, texturas de piel, pelo y ojos.",
    includes:["Práctica sobre piel sintética","Retroalimentación individual","Certificado avanzado","Consulta post-curso 1 mes"],
    images:[
      "https://images.unsplash.com/photo-1567459169668-6e4673db6c3a?w=600&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
      "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&q=80"
    ],
    fecha_inicio:"2026-07-14", badge:"ÚLTIMOS LUGARES"
  },
  {
    id:3, title:"Color y Acuarela", subtitle:"Técnicas de color vibrante",
    category:"Intermedio", instructor:"Sofía Ramírez",
    duration:"5 semanas", schedule:"Domingos 11:00 – 15:00",
    price:5200, cupos_total:10, cupos_disponibles:6, level:"Intermedio",
    description:"Domina la mezcla de tintas, degradados y el estilo acuarela.",
    includes:["Set tintas Intenze 10 colores","Material de práctica","Guía técnica digital","Certificado intermedio"],
    images:[
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
      "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&q=80"
    ],
    fecha_inicio:"2026-07-19", badge:null
  },
  {
    id:4, title:"Workshop Japonés Tradicional", subtitle:"Irezumi y Neo-Japonés",
    category:"Workshop", instructor:"Kenji Morales",
    duration:"2 días intensivos", schedule:"Vie 14:00–20:00 · Sáb 10:00–18:00",
    price:4500, cupos_total:8, cupos_disponibles:8, level:"Intermedio",
    description:"Workshop intensivo sobre el estilo japonés tradicional e irezumi. Motivos, composición y escuela neo-japonesa moderna.",
    includes:["Material incluido","Comida durante el taller","Portfolio review","Diploma workshop"],
    images:[
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
      "https://images.unsplash.com/photo-1567459169668-6e4673db6c3a?w=600&q=80"
    ],
    fecha_inicio:"2026-08-07", badge:"WORKSHOP"
  },
  {
    id:5, title:"Líneas Finas & Minimalismo", subtitle:"Precisión y delicadeza",
    category:"Intermedio", instructor:"Ana Bello",
    duration:"3 semanas", schedule:"Miércoles 17:00 – 20:00",
    price:3800, cupos_total:8, cupos_disponibles:0, level:"Intermedio",
    description:"El arte de la línea fina: control de velocidad, presión y composición minimalista.",
    includes:["Agujas especializadas liner","Guía de configuración de máquina","Certificado de especialidad"],
    images:[
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80"
    ],
    fecha_inicio:"2026-07-08", badge:"AGOTADO"
  },
  {
    id:6, title:"Neotrad y Ilustración", subtitle:"Estilo contemporáneo",
    category:"Avanzado", instructor:"Mario Fuentes",
    duration:"5 semanas", schedule:"Lunes 15:00 – 19:00",
    price:5900, cupos_total:7, cupos_disponibles:4, level:"Avanzado",
    description:"Neotradional e ilustración aplicada al tatuaje. Color saturado, líneas gruesas, composición narrativa.",
    includes:["Kit de tintas Sailor Jerry","Material de práctica","Retroalimentación de portfolio","Certificado avanzado"],
    images:[
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
      "https://images.unsplash.com/photo-1567459169668-6e4673db6c3a?w=600&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80"
    ],
    fecha_inicio:"2026-08-03", badge:null
  }
];

// ─── Inicializar ──────────────────────────────────────────────────────────
loadCourses();
