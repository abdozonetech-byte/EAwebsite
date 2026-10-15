(() => {
  "use strict";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const animated = new Set();
  let scheduled = false;

  function animateNumber(node, target, key) {
    if (!Number.isFinite(target)) return;
    const skip = reducedMotion.matches || animated.has(key);
    animated.add(key);
    const start = performance.now();
    const tick = (now) => {
      if (!node.isConnected) return;
      const fraction = skip ? 1 : Math.min(1, (now - start) / 1100);
      const value = Math.round(target * (1 - Math.pow(1 - fraction, 3)));
      node.textContent = String(value);
      node.closest(".intel-score-cards article")?.style.setProperty("--score", value);
      node.closest("[data-job-progress]")?.style.setProperty("--progress", value);
      if (fraction < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function enhance() {
    const fr = document.documentElement.lang === "fr";
    document.querySelectorAll("[data-view]").forEach((button) => {
      if (button.classList.contains("active")) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    document.querySelectorAll(".intel-score-cards article:not([data-score-ready])").forEach((card, index) => {
      card.dataset.scoreReady = "true";
      const original = card.querySelector("b");
      const text = original?.firstChild?.textContent?.trim();
      if (!text || text === "—") return;
      const target = Math.max(0, Math.min(100, Number(text)));
      if (!Number.isFinite(target)) return;
      const value = document.createElement("strong");
      value.textContent = String(target);
      original.firstChild.replaceWith(value);
      card.setAttribute("aria-label", `${card.querySelector("span").textContent}: ${target}/100`);
      original.setAttribute("aria-hidden", "true");
      const bar = document.createElement("div");
      bar.className = "ux-score-track";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = "<i></i>";
      original.after(bar);
      animateNumber(value, target, `${location.hash}:${index}:${target}`);
    });
    document.querySelectorAll(".data-table tbody tr[data-lead-id]:not([data-keyboard-ready])").forEach((row) => {
      row.dataset.keyboardReady = "true";
      row.tabIndex = 0;
      row.setAttribute("aria-label", `${fr ? "Ouvrir" : "Open"} ${row.querySelector("strong")?.textContent || "lead"}`);
    });
    const names = { intelSearch: fr ? "Rechercher les leads" : "Search leads", intelStatus: fr ? "Statut de recherche" : "Research status", intelCategory: fr ? "Catégorie" : "Category", intelSort: fr ? "Trier les résultats" : "Sort results", leadSearch: fr ? "Rechercher les leads" : "Search leads", sectorFilter: fr ? "Secteur" : "Sector", sourceFilter: fr ? "Source" : "Source" };
    for (const [id, label] of Object.entries(names)) document.getElementById(id)?.setAttribute("aria-label", label);
    document.querySelectorAll("[data-job-count]:not([data-count-ready])").forEach((node) => {
      node.dataset.countReady = "true";
      animateNumber(node, Number(node.dataset.jobCount), `job:${node.closest("[data-job-id]")?.dataset.jobId}:${node.dataset.jobCount}`);
    });
    document.querySelectorAll(".close-button").forEach((button) => button.setAttribute("aria-label", fr ? "Fermer" : "Close"));
    const panel = document.querySelector(".intel-panel");
    if (panel && !panel.querySelector(".ux-intel-guide")) {
      const guide = document.createElement("div");
      guide.className = "ux-intel-guide";
      guide.textContent = fr ? "1. Sélectionnez vos leads   →   2. Lancez l’analyse IA   →   3. Explorez les opportunités" : "1. Select your leads   →   2. Run AI analysis   →   3. Explore opportunities";
      panel.prepend(guide);
    }
    const selectAll = document.getElementById("intelSelectPage");
    if (selectAll) {
      const boxes = [...document.querySelectorAll(".intel-table [data-intel-select]")];
      selectAll.indeterminate = boxes.some((box) => box.checked) && !boxes.every((box) => box.checked);
    }
  }

  const observer = new MutationObserver((records) => {
    // Count-up text updates must not trigger another enhancement pass.
    if (scheduled || !records.some((record) => [...record.addedNodes].some((node) => node.nodeType === 1))) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  });
  for (const id of ["appContent", "appModal", "leadDrawer"]) {
    const node = document.getElementById(id);
    if (node) observer.observe(node, { childList: true, subtree: true });
  }
  document.addEventListener("keydown", (event) => {
    const row = event.target.closest("tr[data-keyboard-ready]");
    if (row && event.target === row && ["Enter", " "].includes(event.key)) { event.preventDefault(); row.click(); }
  });
  enhance();
})();
