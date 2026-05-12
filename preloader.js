window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const content = document.getElementById("content");

  preloader.style.opacity = "0";
  setTimeout(() => {
    preloader.style.display = "none";
    content.style.display = "block";
  }, 1000); // tiempo del fade-out
});
