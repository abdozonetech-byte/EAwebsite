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
    "#homeportfolio .elb-carousel-shell",
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
