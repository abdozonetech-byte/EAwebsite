/* Homepage interactions — production bundle. */

/* ===== SOURCE: elboubakry-mobile-motion.js ===== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileMotion = window.matchMedia("(max-width: 991px)");
  var motionSelector = [
    ".rs-banner-one .rs-banner-title",
    ".rs-banner-one .ea-hero-role-line",
    ".rs-banner-one .rs-banner-description",
    ".rs-banner-one .rs-btn-group",
    ".rs-banner-one .rs-theme-social",
    ".rs-banner-one .rs-banner-thumb-wrapper",
    "#homemarketingsystem .ea-transform-head",
    "#homemarketingsystem .ea-core-person",
    "#homemarketingsystem .ea-orbit-item",
    "#homemarketingsystem .ea-transform-values > div",
    "#homeservices .ea-funnel-copy",
    "#homeservices .ea-funnel-visual",
    "#homeservices .ea-funnel-strategy",
    "#homeguides .ea-home-guide-card",
    ".ea-home-faq .ea-home-faq-item",
    ".ea-footer-v11 .ea-footer-trust-row span",
    ".ea-footer-v11 .ea-footer-block"
  ].join(",");

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function prepareRevealMotion() {
    if (!mobileMotion.matches || reduceMotion.matches || !("IntersectionObserver" in window)) {
      return;
    }

    var elements = Array.prototype.slice.call(document.querySelectorAll(motionSelector));
    var groups = new Map();

    elements.forEach(function (element) {
      var group = element.closest("section, footer, .rs-banner-one") || document.body;
      var index = groups.get(group) || 0;
      groups.set(group, index + 1);
      element.classList.add("ea-mobile-motion");
      element.style.setProperty("--ea-motion-delay", Math.min(index * 54, 270) + "ms");
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("ea-mobile-inview");
        observer.unobserve(entry.target);
      });
    }, {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12
    });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function clearPanelStyles(panel) {
    panel.style.maxHeight = "";
    panel.style.opacity = "";
    panel.style.overflow = "";
    panel.style.transform = "";
    panel.style.transition = "";
  }

  function animateFaq() {
    if (reduceMotion.matches) {
      return;
    }

    Array.prototype.slice.call(document.querySelectorAll(".ea-home-faq-item")).forEach(function (details) {
      var summary = details.querySelector("summary");
      var panel = details.querySelector("p");

      if (!summary || !panel) {
        return;
      }

      summary.addEventListener("click", function (event) {
        if (!mobileMotion.matches) {
          return;
        }

        event.preventDefault();

        if (details.dataset.animating === "true") {
          return;
        }

        var isOpen = details.hasAttribute("open");
        var end = function () {
          details.dataset.animating = "false";
          clearPanelStyles(panel);
        };

        details.dataset.animating = "true";
        panel.style.overflow = "hidden";
        panel.style.transition = "max-height .32s cubic-bezier(.22,.61,.36,1), opacity .22s ease, transform .22s ease";

        if (isOpen) {
          panel.style.maxHeight = panel.scrollHeight + "px";
          panel.style.opacity = "1";
          panel.style.transform = "translate3d(0,0,0)";

          window.requestAnimationFrame(function () {
            panel.style.maxHeight = "0px";
            panel.style.opacity = "0";
            panel.style.transform = "translate3d(0,-4px,0)";
          });

          window.setTimeout(function () {
            details.removeAttribute("open");
            end();
          }, 330);
        } else {
          details.setAttribute("open", "");
          panel.style.maxHeight = "0px";
          panel.style.opacity = "0";
          panel.style.transform = "translate3d(0,-4px,0)";

          window.requestAnimationFrame(function () {
            panel.style.maxHeight = panel.scrollHeight + "px";
            panel.style.opacity = "1";
            panel.style.transform = "translate3d(0,0,0)";
          });

          window.setTimeout(end, 330);
        }
      });
    });
  }

  ready(function () {
    if (reduceMotion.matches) {
      document.documentElement.classList.add("ea-reduce-motion");
      return;
    }

    prepareRevealMotion();
    animateFaq();
  });
})();

/* ===== SOURCE: elboubakry-funnel-lightbox.js ===== */
(function () {
  "use strict";

  var triggers = Array.prototype.slice.call(document.querySelectorAll("#homeservices .ea-funnel-image-trigger"));

  if (!triggers.length) {
    return;
  }

  var items = triggers.map(function (trigger) {
    var image = trigger.querySelector("img");

    return {
      src: image ? image.getAttribute("src") : "",
      alt: image ? image.getAttribute("alt") : "Image du processus",
      label: trigger.getAttribute("aria-label") || "Voir l'image"
    };
  });
  var currentIndex = 0;
  var previousFocus = null;
  var lightbox = null;
  var lightboxImage = null;
  var closeButton = null;
  var switchTimer = null;

  function buildLightbox() {
    lightbox = document.createElement("div");
    lightbox.className = "ea-funnel-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Apercu agrandi des images Avant et Apres");
    lightbox.innerHTML = [
      '<div class="ea-funnel-lightbox-panel">',
      '<button class="ea-funnel-lightbox-close" type="button" aria-label="Fermer l’aperçu">&times;</button>',
      '<button class="ea-funnel-lightbox-nav ea-funnel-lightbox-prev" type="button" aria-label="Image précédente">‹</button>',
      '<img class="ea-funnel-lightbox-image" alt="" />',
      '<button class="ea-funnel-lightbox-nav ea-funnel-lightbox-next" type="button" aria-label="Image suivante">›</button>',
      "</div>"
    ].join("");

    document.body.appendChild(lightbox);

    lightboxImage = lightbox.querySelector(".ea-funnel-lightbox-image");
    closeButton = lightbox.querySelector(".ea-funnel-lightbox-close");

    closeButton.addEventListener("click", closeLightbox);
    lightbox.querySelector(".ea-funnel-lightbox-prev").addEventListener("click", function () {
      showItem(currentIndex - 1, "prev");
    });
    lightbox.querySelector(".ea-funnel-lightbox-next").addEventListener("click", function () {
      showItem(currentIndex + 1, "next");
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  function setItem(index) {
    currentIndex = (index + items.length) % items.length;
    lightboxImage.src = items[currentIndex].src;
    lightboxImage.alt = items[currentIndex].alt;
  }

  function showItem(index, direction) {
    if (!lightbox || !lightbox.classList.contains("is-open")) {
      setItem(index);
      return;
    }

    window.clearTimeout(switchTimer);
    lightbox.classList.remove("is-switching-prev", "is-switching-next");
    lightbox.classList.add(direction === "prev" ? "is-switching-prev" : "is-switching-next");

    switchTimer = window.setTimeout(function () {
      setItem(index);
      lightbox.classList.remove("is-switching-prev", "is-switching-next");
    }, 160);
  }

  function openLightbox(index, trigger) {
    if (!lightbox) {
      buildLightbox();
    }

    previousFocus = trigger || document.activeElement;
    setItem(index);
    document.body.classList.add("ea-funnel-lightbox-open");
    lightbox.classList.remove("is-closing");

    window.requestAnimationFrame(function () {
      lightbox.classList.add("is-open");
      closeButton.focus({ preventScroll: true });
      window.setTimeout(function () {
        closeButton.focus({ preventScroll: true });
      }, 40);
    });
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains("is-open")) {
      return;
    }

    window.clearTimeout(switchTimer);
    lightbox.classList.remove("is-switching-prev", "is-switching-next");
    lightbox.classList.add("is-closing");
    lightbox.classList.remove("is-open");

    window.setTimeout(function () {
      document.body.classList.remove("ea-funnel-lightbox-open");
      lightbox.classList.remove("is-closing");

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus({ preventScroll: true });
      }
    }, 260);
  }

  function getFocusableElements() {
    if (!lightbox) {
      return [];
    }

    return Array.prototype.slice.call(lightbox.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
      .filter(function (element) {
        return !element.disabled && element.offsetParent !== null;
      });
  }

  function handleKeydown(event) {
    if (!lightbox || !lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      showItem(currentIndex - 1, "prev");
      return;
    }

    if (event.key === "ArrowRight") {
      showItem(currentIndex + 1, "next");
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    var focusable = getFocusableElements();

    if (!focusable.length) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  triggers.forEach(function (trigger, index) {
    trigger.addEventListener("click", function () {
      openLightbox(index, trigger);
    });
  });

  document.addEventListener("keydown", handleKeydown);
})();

/* ===== SOURCE: elboubakry-preloader-safe.js ===== */
(function () {
  'use strict';

  function hidePreloader() {
    var preloader = document.getElementById('pre-load');
    if (!preloader) return;
    preloader.style.transition = 'opacity 0.35s ease';
    preloader.style.opacity = '0';
    window.setTimeout(function () {
      preloader.style.display = 'none';
      preloader.setAttribute('aria-hidden', 'true');
    }, 380);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.setTimeout(hidePreloader, 900);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      window.setTimeout(hidePreloader, 900);
    });
  }

  window.addEventListener('load', function () {
    window.setTimeout(hidePreloader, 700);
  });

  /* Safety fallback: never leave the visitor blocked by the loading screen. */
  window.setTimeout(hidePreloader, 3200);
})();

