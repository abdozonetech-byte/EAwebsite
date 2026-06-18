(function () {
  "use strict";

  const articles = window.ELBOUBAKRY_INSIGHTS_ARTICLES || [];
  const grid = document.querySelector("[data-insights-grid]");
  const filters = document.querySelector("[data-insights-filters]");
  const count = document.querySelector("[data-insights-count]");
  let activeFilter = "Tous";

  function uniqueCategories() {
    return Array.from(new Set(articles.map((article) => article.category).filter(Boolean)));
  }

  function getVisibleArticles() {
    return activeFilter === "Tous" ? articles : articles.filter((article) => article.category === activeFilter);
  }

  const iconMap = {
    "Stratégie Marketing": "ri-route-line",
    "Publicité Digitale": "ri-megaphone-line",
    "Génération de Leads": "ri-filter-3-line",
    "Landing Pages": "ri-layout-4-line",
    "SEO & Contenu": "ri-search-2-line",
    "Analytics & Tracking": "ri-bar-chart-box-line",
    "Automatisation": "ri-loop-left-line",
    "Marketing Local Maroc": "ri-map-pin-line",
    "IA & Productivité": "ri-sparkling-2-line",
    "Méthode & Confiance": "ri-shield-check-line",
    "Vidéo & Contenu": "ri-movie-2-line"
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderFilters() {
    if (!filters) return;
    filters.innerHTML = ["Tous", ...uniqueCategories()].map((label) => (
      `<button class="ea-insight-filter${label === activeFilter ? " is-active" : ""}" type="button" data-filter="${escapeHtml(label)}" aria-pressed="${label === activeFilter}">
        ${escapeHtml(label)}
      </button>`
    )).join("");
  }

  function articleUrl(article) {
    const slug = encodeURIComponent(article.slug || article.id);
    return `/insights/${slug}/`;
  }

  function renderArticles() {
    if (!grid) return;
    const visible = getVisibleArticles();

    grid.innerHTML = visible.map((article, index) => {
      const icon = iconMap[article.category] || "ri-article-line";
      const keyword = article.keywords && article.keywords[0] ? article.keywords[0] : "Insight pratique";
      return `
        <article class="ea-insight-card wow fadeInUp" data-wow-delay="${Math.min(index % 3, 2) * 0.08 + 0.12}s" data-wow-duration=".8s">
          <a class="ea-insight-card-button" href="${articleUrl(article)}" aria-label="Lire le guide : ${escapeHtml(article.title)}">
            <span class="ea-insight-top">
              <span class="ea-insight-tag"><i class="${icon}" aria-hidden="true"></i>${escapeHtml(article.category)}</span>
              <span class="ea-insight-time">${escapeHtml(article.readingTime)}</span>
            </span>
            <span class="ea-insight-body">
              <h3>${escapeHtml(article.title)}</h3>
              <p>${escapeHtml(article.excerpt)}</p>
              <span class="ea-insight-keyword">${escapeHtml(keyword)}</span>
              <span class="ea-insight-link">Lire le guide <i class="ri-arrow-right-up-line" aria-hidden="true"></i></span>
            </span>
          </a>
        </article>
      `;
    }).join("");

    if (count) {
      count.textContent = `${visible.length} guides affichés`;
    }

    if (!visible.length) {
      grid.innerHTML = '<p class="ea-insights-empty">Aucun guide dans ce filtre pour le moment.</p>';
    }
  }

  function injectStructuredData() {
    if (!articles.length) return;
    const itemList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": "https://elboubakry.com/insights/#articles",
      "itemListElement": articles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": article.title,
        "url": `https://elboubakry.com/insights/${article.slug || article.id}/`
      }))
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(itemList);
    document.head.appendChild(script);
  }

  if (!grid) return;

  renderFilters();
  renderArticles();
  injectStructuredData();

  filters && filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    activeFilter = button.dataset.filter;
    renderFilters();
    renderArticles();
  });
})();
