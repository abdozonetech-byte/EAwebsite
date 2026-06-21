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
