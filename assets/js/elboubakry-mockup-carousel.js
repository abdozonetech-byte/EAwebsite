/*
 * Legacy compatibility asset.
 *
 * This URL was referenced by an older elboubakry.com deployment and is kept
 * so cached documents and search-engine resource checks do not receive a 404.
 * The current homepage carousel behavior lives in elboubakry-homepage-bundle.js.
 */
(function legacyMockupCarouselCompatibility(window, document) {
  "use strict";

  window.ElboubakryLegacyAssets = window.ElboubakryLegacyAssets || {};
  window.ElboubakryLegacyAssets.mockupCarousel = {
    status: "retired",
    replacement: "/assets/js/elboubakry-homepage-bundle.js",
  };

  if (document.documentElement) {
    document.documentElement.setAttribute("data-ea-legacy-carousel", "compatible");
  }
}(window, document));
