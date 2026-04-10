(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-open"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.matchMedia("(max-width: 960px)").matches) setOpen(false);
    });
  });
})();
