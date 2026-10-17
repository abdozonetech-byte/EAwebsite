(() => {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const codes = "MA DZ TN EG FR ES PT GB US CA AE SA QA BE CH DE IT NL SN CI MR TR IN CN JP AU BR ZA".split(" ");
  const catalog = window.CrmDiscoveryOptions;
  function options(items, locale, selected = "", emptyLabel = "") {
    return `<option value="">${esc(emptyLabel)}</option>${items.map(item => {
      const [value, french] = Array.isArray(item) ? item : [item, item];
      return `<option value="${esc(value)}"${selected === value ? " selected" : ""}>${esc(locale === "fr" ? french : value)}</option>`;
    }).join("")}`;
  }
  function cityChoices(country, saved = "") {
    const values = [...new Set(catalog.cities[country] || (country && country !== "unknown" ? [] : Object.values(catalog.cities).flat()))];
    if (saved && !values.includes(saved)) values.unshift(saved);
    return values;
  }
  function areaChoices(country, city) { return catalog.areas[`${country}:${city}`] || []; }
  function countryName(code, locale = "en") { try { return new Intl.DisplayNames([locale], {type:"region"}).of(code); } catch { return code; } }
  function countries(value, locale, all = false) {
    const available = [...codes];
    if (/^[A-Z]{2}$/.test(value) && !available.includes(value)) available.push(value);
    return `${all ? `<option value="">${locale === "fr" ? "Tous les pays" : "All countries"}</option><option value="unknown"${value === "unknown" ? " selected" : ""}>${locale === "fr" ? "Pays non renseigné" : "Country not recorded"}</option>` : ""}${available.map(code => `<option value="${code}"${value === code ? " selected" : ""}>${esc(countryName(code, locale))}</option>`).join("")}`;
  }
  function mapsUrl(criteria, nearby = false) {
    const terms = [criteria.category, criteria.businessType, criteria.keywords];
    if (!terms.some(Boolean)) terms.push("businesses");
    if (!nearby) terms.push(criteria.locality, criteria.city, countryName(criteria.country || "MA"));
    else terms.push("near me");
    return `https://www.google.com/maps/search/?${new URLSearchParams({api:"1", query:terms.filter(Boolean).join(" ").slice(0, 900) || "businesses near me"})}`;
  }
  function dialog(locale) {
    const fr = locale === "fr";
    const label = (en, french) => fr ? french : en;
    return `<div class="modal-header discovery-heading"><div><p class="eyebrow">${label("LOCAL BUSINESS DISCOVERY", "PROSPECTION LOCALE")}</p><h2 id="modalTitle">${label("Find your next client", "Trouvez votre prochain client")}</h2><p>${label("Choose a business. Set a location. Review before saving.", "Choisissez une activité, une zone, puis validez les résultats.")}</p></div><button class="close-button" data-intel-action="close" aria-label="${label("Close", "Fermer")}">×</button></div>
    <div class="modal-body discovery-body"><form id="intelFindForm" data-locale="${fr ? "fr" : "en"}">
      <fieldset class="discovery-section"><legend><span>01</span> ${label("Which businesses?", "Quelles entreprises ?")}</legend><div class="form-grid">
        <label class="form-field"><span>${label("Project / business category", "Catégorie du projet / activité")} *</span><select name="category" required>${options(catalog.categories, locale, "", label("Choose a category", "Choisir une catégorie"))}</select></label>
        <label class="form-field"><span>${label("Business type", "Type d’entreprise")}</span><select name="businessType" disabled>${options([], locale, "", label("Choose a category first", "Choisir d’abord une catégorie"))}</select></label>
      </div></fieldset>
      <fieldset class="discovery-section"><legend><span>02</span> ${label("Where to search?", "Où chercher ?")}</legend><div class="form-grid">
        <label class="form-field"><span>${label("Country", "Pays")} *</span><select name="country" required>${countries("MA", locale)}</select></label>
        <label class="form-field"><span>${label("City", "Ville")} *</span><select name="city" required>${options(cityChoices("MA"), locale, "Casablanca", label("Choose a city", "Choisir une ville"))}</select><small>${label("Curated major cities", "Sélection de villes principales")}</small></label>
        <label class="form-field full"><span>${label("Neighbourhood or area", "Quartier ou zone")} <small>${label("optional", "facultatif")}</small></span><select name="locality">${options(areaChoices("MA", "Casablanca"), locale, "", label("All areas in this city", "Tous les quartiers de cette ville"))}</select><small data-area-help>${label("Select an area, or search the whole city.", "Choisissez un quartier ou recherchez dans toute la ville.")}</small></label>
      </div></fieldset>
      <details class="discovery-advanced"><summary>${label("Refine with keywords", "Affiner avec des mots-clés")}</summary><label class="form-field"><span>${label("Search focus", "Objectif de recherche")}</span><select name="keywords">${options(catalog.keywords, locale, "", label("Any focus", "Tous les objectifs"))}</select></label></details>
      <section class="discovery-map-panel" aria-label="Google Maps"><div><strong>${label("Verify businesses on Google Maps", "Vérifier les entreprises sur Google Maps")}</strong><p id="discoveryMapSummary" aria-live="polite">Casablanca · ${esc(countryName("MA", locale))}</p></div><div class="discovery-map-actions"><a class="button button-secondary" id="discoveryMaps" href="${esc(mapsUrl({city:"Casablanca", country:"MA"}))}" target="_blank" rel="noopener noreferrer">${label("Search Google Maps ↗", "Chercher sur Google Maps ↗")}</a><a class="intel-link" id="discoveryNearby" href="${esc(mapsUrl({}, true))}" target="_blank" rel="noopener noreferrer">${label("Near me ↗", "Près de moi ↗")}</a></div><small>${label("Opens Google Maps. Near me uses Google’s location settings, not the city above. No Maps results are imported automatically. AI discovery uses the country, city and area above—not your device location.", "Ouvre Google Maps. « Près de moi » utilise la localisation de Google, pas la ville ci-dessus. Aucun résultat Maps n’est importé automatiquement. La recherche IA utilise le pays, la ville et le quartier choisis, pas votre position.")}</small></section>
      <label class="discovery-consent"><input type="checkbox" name="confirmAi" required><span><strong>${label("Run backend AI discovery using my API credit", "Lancer la recherche IA avec mon crédit API")}</strong><small>${label("Public-source research → duplicate check → your approval → CRM. No automatic outreach.", "Sources publiques → doublons → votre validation → CRM. Aucun message automatique.")}</small></span></label>
      <div class="modal-actions discovery-footer"><button type="button" class="button button-secondary" data-intel-action="close">${label("Cancel", "Annuler")}</button><button class="button" type="submit">${label("Run AI discovery", "Lancer la recherche IA")} →</button></div>
    </form></div>`;
  }
  function filters(filters, locale) {
    const fr = locale === "fr";
    return `<div class="discovery-filters" data-locale="${fr ? "fr" : "en"}">
      <label>${fr ? "Pays" : "Country"}<select id="intelCountry" data-location-country>${countries(filters.country || "", locale, true)}</select></label>
      <label>${fr ? "Ville" : "City"}<select id="intelCity" data-location-city>${options(cityChoices(filters.country, filters.city), locale, filters.city, fr ? "Toutes les villes" : "All cities")}</select></label>
      <button class="button button-secondary button-sm" data-intel-action="apply-location">${fr ? "Appliquer" : "Apply location"}</button><button class="intel-link" data-intel-action="clear-location">${fr ? "Effacer" : "Clear"}</button><a id="intelNearby" class="intel-link" target="_blank" rel="noopener noreferrer" href="${esc(mapsUrl({category:filters.category === "all" ? "" : filters.category}, true))}">${fr ? "Prospects près de moi · Maps ↗" : "Find nearby prospects · Maps ↗"}</a><small>${fr ? "Filtres CRM : localisation enregistrée uniquement. La recherche à proximité s’ouvre dans Google Maps." : "CRM filters use saved locations only. Nearby prospect search opens Google Maps."}</small></div>`;
  }
  function updateArea(form) {
    const locale = form.dataset.locale;
    const city = form.querySelector('[name="city"]').value;
    const available = areaChoices(form.querySelector('[name="country"]').value, city);
    const select = form.querySelector('[name="locality"]');
    select.innerHTML = options(available, locale, "", locale === "fr" ? "Tous les quartiers de cette ville" : "All areas in this city");
    select.disabled = !city || !available.length;
    form.querySelector('[data-area-help]').textContent = available.length
      ? (locale === "fr" ? "Choisissez un quartier ou recherchez dans toute la ville." : "Select an area, or search the whole city.")
      : (locale === "fr" ? "Pas de liste de quartiers pour cette ville : recherche dans toute la ville." : "No curated neighbourhood list for this city; search covers the whole city.");
  }
  document.addEventListener("change", event => {
    const filterBar = event.target.closest?.(".discovery-filters");
    if (filterBar && event.target.matches('[data-location-country]')) {
      const locale = filterBar.dataset.locale;
      filterBar.querySelector('[data-location-city]').innerHTML = options(cityChoices(event.target.value), locale, "", locale === "fr" ? "Toutes les villes" : "All cities");
      return;
    }
    const form = event.target.closest?.("#intelFindForm"); if (!form) return;
    const locale = form.dataset.locale;
    if (event.target.name === "country") {
      form.querySelector('[name="city"]').innerHTML = options(cityChoices(event.target.value), locale, "", locale === "fr" ? "Choisir une ville" : "Choose a city");
      updateArea(form);
    }
    if (event.target.name === "city") updateArea(form);
    if (event.target.name === "category") {
      const select = form.querySelector('[name="businessType"]');
      select.innerHTML = options(catalog.types[event.target.value] || [], locale, "", locale === "fr" ? "Tous les types de cette catégorie" : "Any type in this category");
      select.disabled = !event.target.value;
    }
    const criteria = Object.fromEntries(new FormData(form));
    const maps = document.getElementById("discoveryMaps"); const nearby = document.getElementById("discoveryNearby");
    if (maps) maps.href = mapsUrl(criteria);
    if (nearby) nearby.href = mapsUrl(criteria, true);
    const summary = document.getElementById("discoveryMapSummary");
    if (summary) summary.textContent = [criteria.category, criteria.locality, criteria.city, countryName(criteria.country, locale)].filter(Boolean).join(" · ");
  });
  window.CrmDiscovery = { dialog, filters, mapsUrl, countries, cityChoices, areaChoices };
})();
