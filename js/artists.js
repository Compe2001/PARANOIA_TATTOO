// artists.js - Gestión de galería de artistas

let allArtists = [];

// Cargar datos de artistas
async function loadArtists() {
  try {
    const response = await fetch('../data/colaboradores.json');
    const data = await response.json();
    allArtists = data.artistas || [];
    renderArtists(allArtists);
  } catch (error) {
    console.error('Error cargando artistas:', error);
    showNoResults();
  }
}

// Renderizar tarjetas de artistas
function renderArtists(artists) {
  const gallery = document.getElementById('artists-gallery');
  const noResults = document.getElementById('no-results');

  if (!artists || artists.length === 0) {
    gallery.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';
  gallery.innerHTML = artists.map(artist => `
    <div class="artist-card" data-id="${artist.id}">
      <div class="artist-image-container">
        <img src="${artist.imagen}" alt="${artist.artistName}" class="artist-image" onerror="this.src='../public/img/default-artist.jpg'">
        <div class="artist-overlay">
          <div class="artist-overlay-content">
            <p style="color: #bfc8d6; font-size: 0.9rem; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
              📍 ${artist.ubicacion}
            </p>
          </div>
        </div>
      </div>

      <div class="artist-card-info">
        <div class="artist-name">
          <span class="artist-real-name">${artist.name}</span>
          <span class="artist-art-name">"${artist.artistName}"</span>
        </div>

        <div class="artist-experience">
          ⭐ ${artist.experienceYears} años de experiencia
        </div>

        <p class="artist-bio">${artist.bio}</p>

        <div class="artist-styles">
          ${artist.estilos.map(estilo => `
            <span class="style-tag" data-style="${estilo}">${estilo}</span>
          `).join('')}
        </div>

        <div class="artist-actions">
          <button class="artist-btn btn-profile" onclick="goToProfile('${artist.id}')">
            Ver Perfil
          </button>
          <button class="artist-btn btn-contact" onclick="contactArtist('${artist.id}')">
            Contactar
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Agregar event listeners a los style tags
  document.querySelectorAll('.style-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const style = tag.getAttribute('data-style');
      document.getElementById('style-filter').value = style;
      filterArtists();
    });
  });
}

// Filtrar artistas
function filterArtists() {
  const styleFilter = document.getElementById('style-filter').value.toLowerCase();
  const experienceFilter = document.getElementById('experience-filter').value;
  const searchTerm = document.getElementById('artist-search').value.toLowerCase();

  let filtered = allArtists.filter(artist => {
    // Filtro por estilo
    const styleMatch = !styleFilter || artist.estilos.some(e => 
      e.toLowerCase().includes(styleFilter)
    );

    // Filtro por experiencia
    const expMatch = !experienceFilter || artist.experienceYears >= parseInt(experienceFilter);

    // Filtro por búsqueda (nombre, nombre artístico, bio, estilos)
    const searchMatch = !searchTerm || 
      artist.name.toLowerCase().includes(searchTerm) ||
      artist.artistName.toLowerCase().includes(searchTerm) ||
      artist.bio.toLowerCase().includes(searchTerm) ||
      artist.estilos.some(e => e.toLowerCase().includes(searchTerm));

    return styleMatch && expMatch && searchMatch;
  });

  renderArtists(filtered);
}

// Navegar al perfil del artista
function goToProfile(artistId) {
  // Redirigir a la página de perfil del artista
  // Ejemplo: /pages/artist-profile.html?id=oscar-spiker
  window.location.href = `./artist-profile.html?id=${artistId}`;
}

// Contactar al artista
function contactArtist(artistId) {
  const artist = allArtists.find(a => a.id === artistId);
  if (artist && artist.redes.whatsapp) {
    const message = `Hola ${artist.name}, me gustaría agendar una cita para un tatuaje de ${artist.estilos[0]}.`;
    const whatsappUrl = `https://wa.me/${artist.redes.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }
}

// Función auxiliar para no resultados
function showNoResults() {
  document.getElementById('artists-gallery').innerHTML = '';
  document.getElementById('no-results').style.display = 'block';
}

// Event listeners para filtros
document.addEventListener('DOMContentLoaded', () => {
  loadArtists();

  // Filtro por estilo
  const styleFilter = document.getElementById('style-filter');
  if (styleFilter) {
    styleFilter.addEventListener('change', filterArtists);
  }

  // Filtro por experiencia
  const experienceFilter = document.getElementById('experience-filter');
  if (experienceFilter) {
    experienceFilter.addEventListener('change', filterArtists);
  }

  // Búsqueda en tiempo real
  const artistSearch = document.getElementById('artist-search');
  if (artistSearch) {
    artistSearch.addEventListener('input', filterArtists);
  }

  // Búsqueda global desde navbar
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      document.getElementById('artist-search').value = e.target.value;
      filterArtists();
    });
  }
});

// Extraer parámetro de URL (útil para futuros perfiles)
function getUrlParameter(name) {
  const url = new URL(window.location);
  return url.searchParams.get(name);
}

// Si hay un parámetro de búsqueda en la URL, aplicarlo
window.addEventListener('load', () => {
  const searchParam = getUrlParameter('search');
  if (searchParam) {
    document.getElementById('artist-search').value = searchParam;
    filterArtists();
  }
});