// main.js - Preloader y efectos globales
(function() {
  // Esperar a que todo el contenido (imágenes, videos, etc.) esté completamente cargado
  window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    const content = document.getElementById('content');
    
    if (preloader && content) {
      // Transición de salida del preloader
      preloader.style.transition = 'opacity 0.6s ease';
      preloader.style.opacity = '0';
      
      setTimeout(() => {
        preloader.style.display = 'none';
        content.style.display = 'block';
        // Pequeño detalle: forzar reflow para que la animación CSS funcione bien
        content.style.animation = 'none';
        content.offsetHeight; // reflow
        content.style.animation = 'fadeInContent 0.5s ease';
      }, 550);
    }
  });

  // Opcional: Si deseas algún comportamiento adicional para los enlaces del mapa
  // o para tracking, puedes añadirlo aquí.
  console.log('Paranoia Studio - Módulo JS cargado correctamente');
})();