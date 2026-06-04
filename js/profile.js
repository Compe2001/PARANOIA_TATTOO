

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. SCROLL REVEAL ────────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger leve entre secciones
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  reveals.forEach(el => revealObserver.observe(el));


  // ─── 2. MASONRY BARS (animar barras de dominio al aparecer) ──
  const masteryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.mastery-fill');
        if (fill) {
          const targetW = fill.style.width;
          fill.style.width = '0%';
          requestAnimationFrame(() => {
            setTimeout(() => { fill.style.width = targetW; }, 100);
          });
        }
        masteryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.style-card').forEach(card => masteryObserver.observe(card));


  // ─── 3. GALERÍA — FILTROS ────────────────────────────────────
  const galleryItems = document.querySelectorAll('.gallery-item');
  const filterContainer = document.getElementById('galleryFilters');

  if (filterContainer && galleryItems.length > 0) {
    // Recoger estilos únicos desde data-style
    const stylesSet = new Set();
    galleryItems.forEach(item => {
      const s = item.getAttribute('data-style');
      if (s) stylesSet.add(s);
    });

    // Botón "Todos"
    const allBtn = makeFilterBtn('Todos', true, () => {
      galleryItems.forEach(i => i.classList.remove('hidden'));
      filterContainer.querySelectorAll('.gal-filter-btn').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
    });
    filterContainer.appendChild(allBtn);

    // Botones por estilo
    stylesSet.forEach(style => {
      const btn = makeFilterBtn(style, false, () => {
        filterContainer.querySelectorAll('.gal-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        galleryItems.forEach(item => {
          const match = item.getAttribute('data-style') === style;
          item.classList.toggle('hidden', !match);
        });
      });
      filterContainer.appendChild(btn);
    });
  }

  function makeFilterBtn(label, active, onClick) {
    const btn = document.createElement('button');
    btn.className = 'gal-filter-btn' + (active ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }


  // ─── 4. LIGHTBOX ─────────────────────────────────────────────
  const lightbox   = document.getElementById('lightbox');
  const lightboxBg = document.getElementById('lightboxBg');
  const lbImg      = document.getElementById('lbImg');
  const lbCaption  = document.getElementById('lbCaption');
  const lbClose    = document.getElementById('lbClose');
  const lbPrev     = document.getElementById('lbPrev');
  const lbNext     = document.getElementById('lbNext');

  let lbImages = [];   // Array de { src, caption }
  let lbCurrent = 0;

  function openLightbox(index) {
    lbCurrent = index;
    updateLightbox();
    lightbox.classList.add('open');
    lightboxBg.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxBg.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const item = lbImages[lbCurrent];
    if (!item) return;
    lbImg.src = item.src;
    lbImg.alt = item.caption;
    lbCaption.textContent = item.caption;
    lbPrev.disabled = lbCurrent === 0;
    lbNext.disabled = lbCurrent === lbImages.length - 1;
  }

  // Recoger imágenes de la galería
  function buildLightboxImages() {
    lbImages = [];
    document.querySelectorAll('.gallery-item:not(.hidden)').forEach(item => {
      const img  = item.querySelector('img');
      const cap  = item.querySelector('.gal-style');
      if (img) {
        lbImages.push({
          src:     img.src,
          caption: cap ? cap.textContent : ''
        });
      }
    });
  }

  // Click en cada item de galería
  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      buildLightboxImages();
      // Encontrar índice según src
      const src = item.querySelector('img')?.src || '';
      const idx = lbImages.findIndex(i => i.src === src);
      openLightbox(idx >= 0 ? idx : 0);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lightboxBg.addEventListener('click', closeLightbox);

  lbPrev.addEventListener('click', () => {
    if (lbCurrent > 0) { lbCurrent--; updateLightbox(); }
  });
  lbNext.addEventListener('click', () => {
    if (lbCurrent < lbImages.length - 1) { lbCurrent++; updateLightbox(); }
  });

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')  { if (lbCurrent > 0) { lbCurrent--; updateLightbox(); } }
    if (e.key === 'ArrowRight') { if (lbCurrent < lbImages.length - 1) { lbCurrent++; updateLightbox(); } }
  });


  // ─── 5. NAVBAR ACTIVE ────────────────────────────────────────
  // Marca "Tatuadores" como activo en el nav al estar en esta página
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.href.includes('tatuadores')) link.classList.add('active');
  });

});


