(function () {
  "use strict";

  var rail = document.querySelector("#homeportfolio .elb-carousel-rail");
  var track = document.querySelector("#homeportfolio .elb-mockup-track");

  if (!rail || !track) {
    return;
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var resetPoint = 0;
  var speed = window.innerWidth < 768 ? 18 : 34;
  var scrollPosition = 0;
  var rafId = null;
  var lastFrameTime = 0;
  var userHoldUntil = 0;
  var internalScrollUntil = 0;
  var normalizeFrame = null;
  var activePointerId = null;
  var startX = 0;
  var startY = 0;
  var startScrollLeft = 0;
  var dragDeltaX = 0;
  var dragging = false;
  var clickSuppressed = false;
  var touchActive = false;
  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartScrollLeft = 0;
  var touchMoved = false;
  var lightboxOpen = false;
  var currentIndex = 0;
  var positionIndex = 1;
  var resumeTimer = null;
  var wheelTimer = null;
  var lightbox = null;
  var lightboxViewport = null;
  var lightboxTrack = null;
  var closeButton = null;
  var lightboxPointerId = null;
  var lightboxDragStartX = 0;
  var lightboxDragStartY = 0;
  var lightboxDragDeltaX = 0;
  var lightboxDragActive = false;
  var lightboxDragFrame = null;

  var DRAG_THRESHOLD = 6;
  var AUTO_RESUME_DELAY = 1900;
  var DESKTOP_AUTO_SPEED = 34;
  var MOBILE_AUTO_SPEED = 18;
  var items = Array.prototype.slice.call(track.querySelectorAll(".elb-mockup-slide:not([aria-hidden]) img")).map(function (image) {
    return {
      src: image.getAttribute("src"),
      alt: image.getAttribute("alt") || "Service mockup"
    };
  });

  function now() {
    return window.performance && window.performance.now ? window.performance.now() : Date.now();
  }

  function measure() {
    var firstDuplicate = track.querySelector('[aria-hidden="true"]');
    var visibleWidth = firstDuplicate && window.getComputedStyle(firstDuplicate).display !== "none" ? track.scrollWidth / 2 : track.scrollWidth;
    resetPoint = Math.max(0, visibleWidth);
    speed = window.innerWidth < 768 ? MOBILE_AUTO_SPEED : DESKTOP_AUTO_SPEED;
    normalizeRailScroll();
  }

  function normalizeValue(value) {
    if (!resetPoint || resetPoint <= rail.clientWidth) {
      return Math.max(0, value);
    }

    while (value >= resetPoint) {
      value -= resetPoint;
    }

    while (value < 0) {
      value += resetPoint;
    }

    return value;
  }

  function setRailScroll(value) {
    scrollPosition = normalizeValue(value);
    internalScrollUntil = now() + 80;
    rail.scrollLeft = scrollPosition;
  }

  function syncRailScrollPosition() {
    scrollPosition = normalizeValue(rail.scrollLeft || scrollPosition);
  }

  function normalizeRailScroll() {
    syncRailScrollPosition();
    setRailScroll(scrollPosition);
  }

  function holdAutoScroll(delay) {
    userHoldUntil = Math.max(userHoldUntil, now() + (typeof delay === "number" ? delay : 280));
  }

  function shouldAutoScroll(timestamp) {
    return !lightboxOpen && activePointerId === null && !touchActive && !dragging && !reduceMotion.matches && resetPoint > rail.clientWidth && timestamp >= userHoldUntil;
  }

  function tick(timestamp) {
    if (!lastFrameTime) {
      lastFrameTime = timestamp;
    }

    var deltaTime = Math.min(48, timestamp - lastFrameTime);
    lastFrameTime = timestamp;

    if (shouldAutoScroll(timestamp)) {
      setRailScroll(scrollPosition + speed * (deltaTime / 1000));
    }

    rafId = window.requestAnimationFrame(tick);
  }

  function setDragging(active) {
    dragging = active;
    rail.classList.toggle("is-dragging", active);
  }

  function suppressNextClick() {
    clickSuppressed = true;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(function () {
      clickSuppressed = false;
    }, 260);
  }

  function pointerDown(event) {
    if (lightboxOpen || activePointerId !== null || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    activePointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dragDeltaX = 0;
    syncRailScrollPosition();
    startScrollLeft = scrollPosition;
    holdAutoScroll(AUTO_RESUME_DELAY);
  }

  function pointerMove(event) {
    if (activePointerId === null || event.pointerId !== activePointerId) {
      return;
    }

    var deltaX = event.clientX - startX;
    var deltaY = event.clientY - startY;
    dragDeltaX = deltaX;

    if (!dragging) {
      if (Math.abs(deltaX) < DRAG_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY) * 1.08) {
        return;
      }

      setDragging(true);
      holdAutoScroll(AUTO_RESUME_DELAY);

      if (event.pointerType === "mouse" && rail.setPointerCapture) {
        try {
          rail.setPointerCapture(event.pointerId);
        } catch (error) {
          /* Ignore synthetic pointer capture errors. */
        }
      }
    }

    if (event.pointerType === "mouse") {
      event.preventDefault();
      setRailScroll(startScrollLeft - dragDeltaX);
    } else if (Math.abs(rail.scrollLeft - startScrollLeft) < Math.abs(dragDeltaX) * .2) {
      setRailScroll(startScrollLeft - dragDeltaX);
    } else {
      syncRailScrollPosition();
    }
  }

  function pointerEnd(event) {
    if (activePointerId === null || (event && event.pointerId !== activePointerId)) {
      return;
    }

    var wasDragging = dragging;
    activePointerId = null;
    setDragging(false);
    normalizeRailScroll();

    if (wasDragging || Math.abs(dragDeltaX) > DRAG_THRESHOLD) {
      suppressNextClick();
    }

    dragDeltaX = 0;
    holdAutoScroll(AUTO_RESUME_DELAY);
  }

  function touchStart(event) {
    if (lightboxOpen || !event.touches || event.touches.length !== 1) {
      return;
    }

    var touch = event.touches[0];
    touchActive = true;
    touchMoved = false;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    syncRailScrollPosition();
    touchStartScrollLeft = scrollPosition;
    holdAutoScroll(AUTO_RESUME_DELAY);
  }

  function touchMove(event) {
    if (!touchActive || !event.touches || event.touches.length !== 1) {
      return;
    }

    var touch = event.touches[0];
    var deltaX = touch.clientX - touchStartX;
    var deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) < DRAG_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY) * 1.08) {
      return;
    }

    touchMoved = true;
    holdAutoScroll(AUTO_RESUME_DELAY);

    if (Math.abs(rail.scrollLeft - touchStartScrollLeft) < Math.abs(deltaX) * .2) {
      setRailScroll(touchStartScrollLeft - deltaX);
    } else {
      syncRailScrollPosition();
    }
  }

  function touchEnd() {
    if (!touchActive) {
      return;
    }

    touchActive = false;
    normalizeRailScroll();

    if (touchMoved) {
      suppressNextClick();
    }

    holdAutoScroll(AUTO_RESUME_DELAY);
  }

  function handleWheel(event) {
    var horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;

    if (horizontalDelta) {
      holdAutoScroll(AUTO_RESUME_DELAY);
      return;
    }

    if (!event.shiftKey || !event.deltaY) {
      return;
    }

    event.preventDefault();
    syncRailScrollPosition();
    setRailScroll(scrollPosition + event.deltaY);
    holdAutoScroll(AUTO_RESUME_DELAY);
  }

  function handleRailScroll() {
    var userDrivenScroll = now() > internalScrollUntil;

    if (dragging) {
      return;
    }

    if (userDrivenScroll) {
      holdAutoScroll(AUTO_RESUME_DELAY);
    }

    syncRailScrollPosition();

    if (!resetPoint || resetPoint <= rail.clientWidth) {
      return;
    }

    if (rail.scrollLeft >= resetPoint || rail.scrollLeft < 0) {
      if (!normalizeFrame) {
        normalizeFrame = window.requestAnimationFrame(function () {
          normalizeFrame = null;
          normalizeRailScroll();
        });
      }
    }
  }

  function buildLightbox() {
    lightbox = document.createElement("div");
    lightbox.className = "elb-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Aperçu agrandi du mockup");
    lightbox.innerHTML = [
      '<div class="elb-lightbox-panel">',
      '<button class="elb-lightbox-close" type="button" aria-label="Fermer l’aperçu">&times;</button>',
      '<button class="elb-lightbox-nav elb-lightbox-prev" type="button" aria-label="Image précédente">‹</button>',
      '<div class="elb-lightbox-viewport" aria-live="polite">',
      '<div class="elb-lightbox-track"></div>',
      '</div>',
      '<button class="elb-lightbox-nav elb-lightbox-next" type="button" aria-label="Image suivante">›</button>',
      "</div>"
    ].join("");

    document.body.appendChild(lightbox);
    lightboxViewport = lightbox.querySelector(".elb-lightbox-viewport");
    lightboxTrack = lightbox.querySelector(".elb-lightbox-track");
    closeButton = lightbox.querySelector(".elb-lightbox-close");

    renderLightboxSlides();

    closeButton.addEventListener("click", closeLightbox);
    lightbox.querySelector(".elb-lightbox-prev").addEventListener("click", function () {
      showLightboxItem(currentIndex - 1);
    });
    lightbox.querySelector(".elb-lightbox-next").addEventListener("click", function () {
      showLightboxItem(currentIndex + 1);
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
    lightboxTrack.addEventListener("transitionend", normalizeLightboxPosition);
    lightboxViewport.addEventListener("pointerdown", startLightboxDrag);
    lightboxViewport.addEventListener("pointermove", moveLightboxDrag);
    lightboxViewport.addEventListener("pointerup", endLightboxDrag);
    lightboxViewport.addEventListener("pointercancel", endLightboxDrag);
    lightboxViewport.addEventListener("lostpointercapture", endLightboxDrag);
    lightboxViewport.addEventListener("wheel", handleLightboxWheel, { passive: false });
  }

  function lightboxSlides() {
    return items.length ? [items[items.length - 1]].concat(items, [items[0]]) : [];
  }

  function renderLightboxSlides() {
    lightboxTrack.innerHTML = lightboxSlides().map(function (item) {
      return '<div class="elb-lightbox-slide"><img class="elb-lightbox-image" src="' + item.src + '" alt="' + item.alt.replace(/"/g, "&quot;") + '" draggable="false" /></div>';
    }).join("");
  }

  function viewportWidth() {
    return lightboxViewport ? lightboxViewport.getBoundingClientRect().width : 0;
  }

  function setLightboxTransition(enabled) {
    if (lightboxTrack) {
      lightboxTrack.style.transition = enabled ? "" : "none";
    }
  }

  function updateLightboxTransform(deltaX) {
    if (!lightboxTrack) {
      return;
    }

    lightboxTrack.style.transform = "translate3d(" + ((positionIndex * viewportWidth() * -1) + (deltaX || 0)) + "px,0,0)";
  }

  function setLightboxImage(index, immediate) {
    if (!items.length) {
      return;
    }

    currentIndex = (index + items.length) % items.length;
    positionIndex = currentIndex + 1;
    setLightboxTransition(!immediate);
    updateLightboxTransform(0);

    if (immediate) {
      window.requestAnimationFrame(function () {
        setLightboxTransition(true);
      });
    }
  }

  function normalizeLightboxPosition() {
    if (!items.length || lightboxDragActive) {
      return;
    }

    if (positionIndex === 0) {
      currentIndex = items.length - 1;
      positionIndex = items.length;
    } else if (positionIndex === items.length + 1) {
      currentIndex = 0;
      positionIndex = 1;
    } else {
      currentIndex = positionIndex - 1;
    }

    setLightboxTransition(false);
    updateLightboxTransform(0);
    window.requestAnimationFrame(function () {
      setLightboxTransition(true);
    });
  }

  function showLightboxItem(index) {
    if (!items.length || !lightboxTrack) {
      return;
    }

    setLightboxTransition(true);

    if (index < 0) {
      positionIndex = 0;
    } else if (index >= items.length) {
      positionIndex = items.length + 1;
    } else {
      positionIndex = index + 1;
    }

    currentIndex = (index + items.length) % items.length;
    updateLightboxTransform(0);
  }

  function openLightbox(index) {
    if (!lightbox) {
      buildLightbox();
    }

    setLightboxImage(index, true);
    lightboxOpen = true;
    document.body.classList.add("elb-lightbox-open");
    window.requestAnimationFrame(function () {
      lightbox.classList.add("is-open");
      updateLightboxTransform(0);
    });
    closeButton.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }

    lightboxOpen = false;
    lightboxDragActive = false;
    lightboxPointerId = null;
    window.cancelAnimationFrame(lightboxDragFrame);
    lightbox.classList.remove("is-dragging", "is-open");
    window.setTimeout(function () {
      document.body.classList.remove("elb-lightbox-open");
    }, 260);
  }

  function startLightboxDrag(event) {
    if (!lightboxOpen || !items.length || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    lightboxPointerId = event.pointerId;
    lightboxDragStartX = event.clientX;
    lightboxDragStartY = event.clientY;
    lightboxDragDeltaX = 0;
    lightboxDragActive = true;
    lightbox.classList.add("is-dragging");
    setLightboxTransition(false);

    if (lightboxViewport.setPointerCapture) {
      try {
        lightboxViewport.setPointerCapture(event.pointerId);
      } catch (error) {
        /* Ignore synthetic pointer capture errors. */
      }
    }
  }

  function moveLightboxDrag(event) {
    if (!lightboxDragActive || event.pointerId !== lightboxPointerId) {
      return;
    }

    var deltaX = event.clientX - lightboxDragStartX;
    var deltaY = event.clientY - lightboxDragStartY;

    if (Math.abs(deltaX) > 4 && Math.abs(deltaX) > Math.abs(deltaY) * 0.72) {
      event.preventDefault();
    }

    lightboxDragDeltaX = deltaX;
    window.cancelAnimationFrame(lightboxDragFrame);
    lightboxDragFrame = window.requestAnimationFrame(function () {
      updateLightboxTransform(lightboxDragDeltaX);
    });
  }

  function endLightboxDrag(event) {
    if (!lightboxDragActive || (event && event.pointerId !== lightboxPointerId)) {
      return;
    }

    var threshold = Math.min(90, Math.max(50, viewportWidth() * 0.12));
    var deltaX = lightboxDragDeltaX;

    lightboxDragActive = false;
    lightboxPointerId = null;
    lightboxDragDeltaX = 0;
    lightbox.classList.remove("is-dragging");
    setLightboxTransition(true);

    if (deltaX < threshold * -1) {
      showLightboxItem(currentIndex + 1);
    } else if (deltaX > threshold) {
      showLightboxItem(currentIndex - 1);
    } else {
      updateLightboxTransform(0);
    }
  }

  function handleLightboxWheel(event) {
    if (!lightboxOpen || Math.abs(event.deltaX) < Math.abs(event.deltaY) || Math.abs(event.deltaX) < 24) {
      return;
    }

    event.preventDefault();

    if (wheelTimer) {
      return;
    }

    showLightboxItem(currentIndex + (event.deltaX > 0 ? 1 : -1));
    wheelTimer = window.setTimeout(function () {
      wheelTimer = null;
    }, 320);
  }

  function handleKeydown(event) {
    if (!lightboxOpen) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowLeft") {
      showLightboxItem(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      showLightboxItem(currentIndex + 1);
    }
  }

  measure();
  window.addEventListener("resize", function () {
    measure();
    if (lightboxOpen) {
      setLightboxImage(currentIndex, true);
    }
  }, { passive: true });

  rail.addEventListener("pointerdown", pointerDown);
  rail.addEventListener("pointermove", pointerMove);
  rail.addEventListener("pointerup", pointerEnd);
  rail.addEventListener("pointercancel", pointerEnd);
  rail.addEventListener("lostpointercapture", pointerEnd);
  rail.addEventListener("pointerleave", function (event) {
    if (event.pointerType === "mouse" && dragging) {
      pointerEnd(event);
    }
  });
  rail.addEventListener("wheel", handleWheel, { passive: false });
  rail.addEventListener("scroll", handleRailScroll, { passive: true });
  rail.addEventListener("touchstart", touchStart, { passive: true });
  rail.addEventListener("touchmove", touchMove, { passive: true });
  rail.addEventListener("touchend", touchEnd, { passive: true });
  rail.addEventListener("touchcancel", touchEnd, { passive: true });
  rail.addEventListener("click", function (event) {
    if (clickSuppressed) {
      event.preventDefault();
      event.stopPropagation();
      clickSuppressed = false;
    }
  }, true);

  track.addEventListener("click", function (event) {
    var trigger = event.target.closest(".elb-mockup-open");

    if (!trigger || clickSuppressed) {
      return;
    }

    openLightbox(Number(trigger.getAttribute("data-mockup-index")) || 0);
  });

  document.addEventListener("keydown", handleKeydown);

  rafId = window.requestAnimationFrame(tick);

  window.addEventListener("pagehide", function () {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  });
})();
