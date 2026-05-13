// artists.js
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('artist-search');
  const styleFilter = document.getElementById('style-filter');
  const sortBy = document.getElementById('sort-by');
  const gallery = document.getElementById('gallery');

  function getCards() { return Array.from(gallery.querySelectorAll('.card')); }

  function applyFilters() {
    const q = input.value.trim().toLowerCase();
    const style = styleFilter.value;
    const sort = sortBy.value;
    let cards = getCards();

    // Filtrar por texto y estilo
    cards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const city = (card.dataset.city || '').toLowerCase();
      const styles = (card.dataset.style || '').toLowerCase();
      const matchesText = !q || name.includes(q) || city.includes(q) || styles.includes(q);
      const matchesStyle = !style || styles.includes(style);
      card.style.display = (matchesText && matchesStyle) ? '' : 'none';
    });

    // Orden simple por nombre
    if (sort === 'name-asc' || sort === 'name-desc') {
      const visible = getCards().filter(c => c.style.display !== 'none');
      visible.sort((a,b) => a.dataset.name.localeCompare(b.dataset.name));
      if (sort === 'name-desc') visible.reverse();
      visible.forEach(c => gallery.appendChild(c));
    }
  }

  // Redirigir al presionar Enter en búsqueda
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (!q) return;
      // Buscar coincidencia exacta por nombre
      const match = getCards().find(c => c.dataset.name.toLowerCase() === q.toLowerCase());
      if (match) {
        const link = match.querySelector('.card-link');
        if (link) window.location.href = link.href;
        return;
      }
      // Si no hay match, ir a página general de tatuadores con query
      window.location.href = `tatuadores.html?q=${encodeURIComponent(q)}`;
    }
  });

  // Eventos de UI
  input.addEventListener('input', applyFilters);
  styleFilter.addEventListener('change', applyFilters);
  sortBy.addEventListener('change', applyFilters);

  // Inicial
  applyFilters();
});
