// /js/main.js
// Loads shared header/footer partials into each page and highlights the active nav link.

(function () {
  "use strict";

  // Treat "/" as "/index.html" for matching nav links
  function normalizedPath(pathname) {
    if (!pathname) return "/index.html";
    return pathname === "/" ? "/index.html" : pathname;
  }

  async function loadPartial(targetId, url) {
    var el = document.getElementById(targetId);
    if (!el) return false;

    try {
      var res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
      el.innerHTML = await res.text();
      return true;
    } catch (err) {
      console.warn("[main.js] Failed to load:", url, err);
      return false;
    }
  }

  function setActiveNav() {
    var header = document.querySelector("#site-header");
    if (!header) return;

    var current = normalizedPath(window.location.pathname);
    var links = header.querySelectorAll(".nav a[href]");

    links.forEach(function (a) {
      a.classList.remove("active");

      // Use the URL API to safely compare paths, regardless of domain
      var hrefPath;
      try {
        hrefPath = normalizedPath(new URL(a.getAttribute("href"), window.location.origin).pathname);
      } catch (e) {
        hrefPath = normalizedPath(a.getAttribute("href"));
      }

      if (hrefPath === current) a.classList.add("active");
    });
  }

  function wireFooterYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  async function init() {
    // Load partials (works on root-domain deploys with leading slashes)
    var headerLoaded = await loadPartial("site-header", "/partials/header.html");
    var footerLoaded = await loadPartial("site-footer", "/partials/footer.html");

    // After header injects, set active link
    if (headerLoaded) setActiveNav();

    // Footer year helper if you keep <span id="year"></span> in footer
    if (footerLoaded) wireFooterYear();
  }

  // Run after DOM is ready (safe even if script is not deferred)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
