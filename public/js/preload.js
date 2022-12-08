window.onload = function (e) {
  const data = document.querySelectorAll('link[rel="preload"]');
  data.forEach((link) => {
    link.rel = "stylesheet";
  });
};
