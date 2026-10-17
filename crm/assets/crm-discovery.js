(() => {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const codes = "MA DZ TN EG FR ES PT GB US CA AE SA QA BE CH DE IT NL SN CI MR TR IN CN JP AU BR ZA".split(" ");
  const categories = ["Aesthetic clinics", "Dental clinics", "Schools & training", "Restaurants & cafés", "Hotels & tourism", "Real estate", "Retail & e-commerce", "Professional services", "Fitness & wellness", "Industry & construction"];
  const cities = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Meknès", "Oujda", "Tétouan", "Kénitra", "El Jadida"];
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
    <div class="modal-body discovery-body"><form id="intelFindForm">
      <fieldset class="discovery-section"><legend><span>01</span> ${label("Which businesses?", "Quelles entreprises ?")}</legend><div class="form-grid">
        <label class="form-field"><span>${label("Project / business category", "Catégorie du projet / activité")} *</span><input name="category" list="discoveryCategories" required maxlength="160" placeholder="${label("Choose or type a category", "Choisir ou saisir une catégorie")}"><datalist id="discoveryCategories">${categories.map(c=>`<option value="${esc(c)}">`).join("")}</datalist></label>
        <label class="form-field"><span>${label("Business type", "Type d’entreprise")}</span><input name="businessType" maxlength="160" placeholder="${label("Independent clinic, private school…", "Clinique indépendante, école privée…")}"></label>
      </div></fieldset>
      <fieldset class="discovery-section"><legend><span>02</span> ${label("Where to search?", "Où chercher ?")}</legend><div class="form-grid">
        <label class="form-field"><span>${label("Country", "Pays")} *</span><select name="country" required>${countries("MA", locale)}</select></label>
        <label class="form-field"><span>${label("City", "Ville")} *</span><input name="city" list="discoveryCities" required maxlength="100" value="Casablanca"><datalist id="discoveryCities">${cities.map(c=>`<option value="${esc(c)}">`).join("")}</datalist></label>
        <label class="form-field full"><span>${label("Neighbourhood or area", "Quartier ou zone")} <small>${label("optional", "facultatif")}</small></span><input name="locality" maxlength="160" placeholder="${label("e.g. Maarif, Anfa, near a landmark…", "Ex. Maârif, Anfa, près d’un lieu…")}"></label>
      </div></fieldset>
      <details class="discovery-advanced"><summary>${label("Refine with keywords", "Affiner avec des mots-clés")}</summary><label class="form-field"><span>${label("Keywords", "Mots-clés")}</span><input name="keywords" maxlength="500" placeholder="${label("Laser treatments, booking, training…", "Laser, rendez-vous, formation…")}"></label></details>
      <section class="discovery-map-panel" aria-label="Google Maps"><div><strong>${label("Verify businesses on Google Maps", "Vérifier les entreprises sur Google Maps")}</strong><p id="discoveryMapSummary" aria-live="polite">Casablanca · ${esc(countryName("MA", locale))}</p></div><div class="discovery-map-actions"><a class="button button-secondary" id="discoveryMaps" href="${esc(mapsUrl({city:"Casablanca", country:"MA"}))}" target="_blank" rel="noopener noreferrer">${label("Search Google Maps ↗", "Chercher sur Google Maps ↗")}</a><a class="intel-link" id="discoveryNearby" href="${esc(mapsUrl({}, true))}" target="_blank" rel="noopener noreferrer">${label("Near me ↗", "Près de moi ↗")}</a></div><small>${label("Opens Google Maps. Near me uses Google’s location settings, not the city above. No Maps results are imported automatically. AI discovery uses the country, city and area above—not your device location.", "Ouvre Google Maps. « Près de moi » utilise la localisation de Google, pas la ville ci-dessus. Aucun résultat Maps n’est importé automatiquement. La recherche IA utilise le pays, la ville et le quartier choisis, pas votre position.")}</small></section>
      <label class="discovery-consent"><input type="checkbox" name="confirmAi" required><span><strong>${label("Run backend AI discovery using my API credit", "Lancer la recherche IA avec mon crédit API")}</strong><small>${label("Public-source research → duplicate check → your approval → CRM. No automatic outreach.", "Sources publiques → doublons → votre validation → CRM. Aucun message automatique.")}</small></span></label>
      <div class="modal-actions discovery-footer"><button type="button" class="button button-secondary" data-intel-action="close">${label("Cancel", "Annuler")}</button><button class="button" type="submit">${label("Run AI discovery", "Lancer la recherche IA")} →</button></div>
    </form></div>`;
  }
  function filters(filters, locale) {
    const fr = locale === "fr";
    return `<div class="discovery-filters"><label>${fr ? "Pays" : "Country"}<select id="intelCountry">${countries(filters.country || "", locale, true)}</select></label><label>${fr ? "Ville" : "City"}<input id="intelCity" value="${esc(filters.city || "")}" maxlength="100" placeholder="${fr ? "Toutes les villes" : "All cities"}"></label><button class="button button-secondary button-sm" data-intel-action="apply-location">${fr ? "Appliquer" : "Apply location"}</button><button class="intel-link" data-intel-action="clear-location">${fr ? "Effacer" : "Clear"}</button><a id="intelNearby" class="intel-link" target="_blank" rel="noopener noreferrer" href="${esc(mapsUrl({category:filters.category === "all" ? "" : filters.category}, true))}">${fr ? "Prospects près de moi · Maps ↗" : "Find nearby prospects · Maps ↗"}</a><small>${fr ? "Filtres CRM : localisation enregistrée uniquement. La recherche à proximité s’ouvre dans Google Maps." : "CRM filters use saved locations only. Nearby prospect search opens Google Maps."}</small></div>`;
  }
  document.addEventListener("input", event => {
    const form = event.target.closest?.("#intelFindForm"); if (!form) return;
    if (event.target.name === "country") {
      form.querySelector('[name="city"]').value = "";
      form.querySelector('[name="locality"]').value = "";
      const suggestions = document.getElementById("discoveryCities");
      if (suggestions) suggestions.innerHTML = event.target.value === "MA" ? cities.map(city => `<option value="${esc(city)}">`).join("") : "";
    }
    const criteria = Object.fromEntries(new FormData(form));
    const maps = document.getElementById("discoveryMaps"); const nearby = document.getElementById("discoveryNearby");
    if (maps) maps.href = mapsUrl(criteria);
    if (nearby) nearby.href = mapsUrl(criteria, true);
    const summary = document.getElementById("discoveryMapSummary");
    if (summary) summary.textContent = [criteria.category, criteria.locality, criteria.city, countryName(criteria.country, document.documentElement.lang || "en")].filter(Boolean).join(" · ");
  });
  window.CrmDiscovery = { dialog, filters, mapsUrl, countries };
})();
