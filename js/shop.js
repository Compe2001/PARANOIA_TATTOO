  // ─── Estado ───────────────────────────────────────────────────────────────
  let allProducts   = [];
  let categories    = [];
  let activeFilter  = 'Todos';
  let carouselIndex = 0;
  let carouselItems = [];
  const VISIBLE     = 4; // cards visibles en desktop

  // ─── Carga el JSON ────────────────────────────────────────────────────────
  async function loadProducts() {
    try {
      const res  = await fetch('../data/products.json');
      const data = await res.json();
      allProducts = data.products;
      categories  = data.categories;
    } catch (e) {
      // Fallback: datos embebidos en caso de no tener servidor
      allProducts = FALLBACK_PRODUCTS;
      categories  = ['Todos','Agujas','Tintas','Máquinas','Higiene','Accesorios'];
    }
    init();
  }

  function init() {
    buildFilters();
    // Carousel: productos con descuento o poco stock
    carouselItems = allProducts.filter(p => p.discount > 0 || (p.stock > 0 && p.stock < 15));
    if (carouselItems.length === 0) carouselItems = allProducts.slice(0, 6);
    buildCarousel();
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
        <option value="discount">Mayor descuento</option>
        <option value="stock">Disponibilidad</option>
      </select>
      <span class="results-count" id="resultsCount"></span>`;
    ctrl.appendChild(right);
  }

  // ─── Carousel ─────────────────────────────────────────────────────────────
  function buildCarousel() {
    const track = document.getElementById('carouselTrack');
    const dots  = document.getElementById('carouselDots');
    track.innerHTML = '';
    dots.innerHTML  = '';

    carouselItems.forEach(p => {
      track.appendChild(createCard(p));
    });

    const pages = Math.ceil(carouselItems.length / VISIBLE);
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Página ${i+1}`);
      d.onclick = () => goToPage(i);
      dots.appendChild(d);
    }
    updateCarousel();
  }

  function getCardWidth() {
    const c = document.querySelector('.carousel-track .prod-card');
    if (!c) return 260 + 18;
    return c.offsetWidth + 18;
  }

  function shiftCarousel(dir) {
    const pages = Math.ceil(carouselItems.length / VISIBLE);
    carouselIndex = Math.max(0, Math.min(carouselIndex + dir, pages - 1));
    updateCarousel();
  }

  function goToPage(page) {
    carouselIndex = page;
    updateCarousel();
  }

  function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const cardW = getCardWidth();
    track.style.transform = `translateX(-${carouselIndex * VISIBLE * cardW}px)`;

    // Dots
    document.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === carouselIndex);
    });

    // Flechas
    const pages = Math.ceil(carouselItems.length / VISIBLE);
    document.getElementById('prevBtn').disabled = carouselIndex === 0;
    document.getElementById('nextBtn').disabled = carouselIndex >= pages - 1;
  }

  // ─── Grid ─────────────────────────────────────────────────────────────────
  function renderGrid() {
    const grid      = document.getElementById('productsGrid');
    const sortVal   = document.getElementById('sortSelect')?.value || 'default';
    let filtered    = activeFilter === 'Todos'
                      ? [...allProducts]
                      : allProducts.filter(p => p.category === activeFilter);

    // Búsqueda desde navbar
    const q = document.getElementById('navSearch').value.trim().toLowerCase();
    if (q) filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );

    // Ordenar
    if      (sortVal === 'price-asc')  filtered.sort((a,b) => finalPrice(a) - finalPrice(b));
    else if (sortVal === 'price-desc') filtered.sort((a,b) => finalPrice(b) - finalPrice(a));
    else if (sortVal === 'discount')   filtered.sort((a,b) => b.discount - a.discount);
    else if (sortVal === 'stock')      filtered.sort((a,b) => b.stock - a.stock);

    document.getElementById('resultsCount').textContent =
      `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`;

    grid.innerHTML = '';
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state"><span>🔍</span>Sin resultados para esta búsqueda.</div>`;
      return;
    }
    filtered.forEach(p => grid.appendChild(createCard(p)));
  }

  // ─── Crea una card ────────────────────────────────────────────────────────
  function createCard(p) {
    const fp      = finalPrice(p);
    const oos     = p.stock === 0;
    const lowStock = p.stock > 0 && p.stock <= 10;

    const card = document.createElement('div');
    card.className = 'prod-card' + (oos ? ' out-of-stock' : '');
    card.innerHTML = `
      ${p.discount > 0 ? `<div class="badge-discount">-${p.discount}%</div>` : ''}
      ${lowStock ? `<div class="badge-low">⚡ Últimas ${p.stock}</div>` : ''}
      <div class="card-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x200/161616/444?text=PARANOIA'">
      </div>
      <div class="card-body">
        <div class="card-brand">${p.brand}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.description}</div>
        <div class="card-pricing">
          <span class="price-final">$${fp.toFixed(0)} MXN</span>
          ${p.discount > 0 ? `<span class="price-original">$${p.price} MXN</span>` : ''}
        </div>
        <div class="card-stock">
          <span class="stock-dot ${oos ? 'empty' : lowStock ? 'low' : 'ok'}"></span>
          <span style="color:${oos ? 'var(--red)' : lowStock ? 'var(--gold)' : 'var(--muted)'}">
            ${oos ? 'Agotado' : lowStock ? `Solo ${p.stock} en stock` : `${p.stock} en stock`}
          </span>
        </div>
        ${!oos ? `<button class="btn-add" onclick="addToCart('${p.name}')">+ Agregar al carrito</button>` : ''}
      </div>`;
    return card;
  }

  function finalPrice(p) {
    return p.price * (1 - p.discount / 100);
  }

  // ─── Carrito (toast) ──────────────────────────────────────────────────────
  function addToCart(name) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = `"${name}" agregado al carrito`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function handleNavSearch() {
    renderGrid();
    document.querySelector('.products-grid').scrollIntoView({ behavior: 'smooth' });
  }

  // Búsqueda en tiempo real
  document.getElementById('navSearch').addEventListener('input', () => renderGrid());

  // ─── Fallback datos inline ────────────────────────────────────────────────
  const FALLBACK_PRODUCTS = [
    { id:1, name:"Agujas Round Liner #12", category:"Agujas", price:85, discount:10, stock:200, image:"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80", description:"Agujas RL calibre 12, caja de 50 pzas. Acero quirúrgico.", brand:"Cheyenne" },
    { id:2, name:"Tinta Negra Panthera 1oz", category:"Tintas", price:320, discount:0, stock:45, image:"https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400&q=80", description:"Tinta vegana, alta densidad. Negra profunda.", brand:"Panthera" },
    { id:3, name:"Máquina Pen BISHOP X", category:"Máquinas", price:5800, discount:15, stock:8, image:"https://images.unsplash.com/photo-1567459169668-6e4673db6c3a?w=400&q=80", description:"Rotary pen motor japonés, stroke 3.5mm.", brand:"Bishop" },
    { id:4, name:"Guantes Nitrilo Negro M", category:"Higiene", price:220, discount:5, stock:0, image:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80", description:"Caja 100 pzas. Sin polvo. Talla M.", brand:"Intco" },
    { id:5, name:"Agujas Magnum Curved #10", category:"Agujas", price:95, discount:0, stock:180, image:"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80", description:"Magnum curva para sombreados suaves. Caja 50.", brand:"Kwadron" },
    { id:6, name:"Set Tintas Intenze 10x1oz", category:"Tintas", price:2400, discount:20, stock:12, image:"https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80", description:"Set 10 colores premium. Certificadas.", brand:"Intenze" },
    { id:7, name:"Fuente de poder FK Irons", category:"Máquinas", price:3200, discount:0, stock:5, image:"https://images.unsplash.com/photo-1581092334401-6e8e5d5e0a2f?w=400&q=80", description:"Fuente digital 0–18V. Puerto USB.", brand:"FK Irons" },
    { id:8, name:"Film Segunda Piel 10x15cm", category:"Higiene", price:450, discount:10, stock:300, image:"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80", description:"Rollo 50m. Transpirable, anti-bacteriano.", brand:"TegaDerm" },
    { id:9, name:"Cartuchos PEAK #7RS", category:"Agujas", price:130, discount:0, stock:0, image:"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80", description:"Cartuchos round shader, membrana anti-retorno.", brand:"Peak" },
    { id:10, name:"Clip Cord Cable 2m", category:"Accesorios", price:180, discount:0, stock:60, image:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80", description:"Cable trenzado, conector RCA y clip. 2 metros.", brand:"Generic Pro" },
    { id:11, name:"Vaselina Tatoo Pro 250g", category:"Higiene", price:95, discount:0, stock:150, image:"https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80", description:"Vaselina sin fragancia, uso médico.", brand:"Tattoo Pro" },
    { id:12, name:"Máquina Bobina Tradicional", category:"Máquinas", price:1850, discount:25, stock:3, image:"https://images.unsplash.com/photo-1567459169668-6e4673db6c3a?w=400&q=80", description:"Bobina 8 wraps, marco hierro colado.", brand:"Micky Sharpz" }
  ];

  // ─── Inicializar ──────────────────────────────────────────────────────────
  loadProducts();