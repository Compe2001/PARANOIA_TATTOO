 preloader.style.opacity = "0";
  setTimeout(() => {
    preloader.style.display = "none";
    content.style.display = "block";
  }, 1000); // tiempo del fade-out