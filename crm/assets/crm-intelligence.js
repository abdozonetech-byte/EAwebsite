(() => {
  "use strict";

  const state = { locale: "en", loading: true, error: "", leads: [], categories: [], batches: [], discoveryBatches: [], discoveryCandidates: [], discoveryBatch: null, discoverySelected: new Set(), discoveryPreview: null, summary: {}, pagination: { page: 1, pages: 1, total: 0 }, filters: { search: "", status: "all", category: "all", sort: "recent_analysis" }, selected: new Set(), detail: null, timer: null, jobTimer: null, jobRetries: 0 };
  let mounted = false;
  let activeJob = null;
  let modalFocus = null;

  const words = {
    en: { eyebrow: "AI LEAD INTELLIGENCE", title: "AI Intelligence", subtitle: "Run secure OpenAI research directly from the CRM backend and save verified results automatically.", prepare: "Run AI Analysis", find: "Find New Leads", total: "Total leads", completed: "Analyzed leads", queued: "Awaiting AI", processing: "In progress", notAnalyzed: "Unanalyzed", failed: "Failed analyses", high: "High opportunity", search: "Search businesses, cities...", allStatuses: "All research statuses", allCategories: "All categories", sortRecent: "Recent analyses", sortOpportunity: "Highest opportunity", sortNewest: "Newest leads", selectPage: "Select page", selected: "selected", lead: "Business", category: "Category", status: "Research status", scores: "Scores", action: "Action", noData: "No leads match these filters.", one: "Analyze", view: "View intelligence", previous: "Previous", next: "Next", recentBatches: "Recent research batches", noBatches: "No research batch yet.", close: "Close", back: "Back to intelligence", download: "Download Markdown", current: "Current digital situation", website: "Website analysis", landing: "Landing-page opportunities", seo: "SEO analysis", geo: "GEO analysis", social: "Social media analysis", marketing: "Marketing opportunities", crmAi: "CRM & AI opportunities", services: "Recommended services", plan: "Action plan", evidence: "Supporting evidence", report: "Full Markdown report", unknown: "Not researched yet", researchDate: "Research date", confidence: "Confidence" },
    fr: { eyebrow: "INTELLIGENCE LEADS IA", title: "Intelligence IA", subtitle: "Lancez la recherche OpenAI directement depuis le backend CRM et enregistrez automatiquement les résultats vérifiés.", prepare: "Lancer l’analyse IA", find: "Trouver de nouveaux leads", total: "Total leads", completed: "Leads analysés", queued: "En attente IA", processing: "En cours", notAnalyzed: "Non analysés", failed: "Analyses échouées", high: "Forte opportunité", search: "Rechercher entreprises, villes...", allStatuses: "Tous les statuts", allCategories: "Toutes les catégories", sortRecent: "Analyses récentes", sortOpportunity: "Meilleure opportunité", sortNewest: "Nouveaux leads", selectPage: "Sélectionner la page", selected: "sélectionnés", lead: "Entreprise", category: "Catégorie", status: "Statut recherche", scores: "Scores", action: "Action", noData: "Aucun lead pour ces filtres.", one: "Analyser", view: "Voir l’intelligence", previous: "Précédent", next: "Suivant", recentBatches: "Lots de recherche récents", noBatches: "Aucun lot de recherche.", close: "Fermer", back: "Retour à l’intelligence", download: "Télécharger Markdown", current: "Situation digitale actuelle", website: "Analyse du site", landing: "Opportunités landing pages", seo: "Analyse SEO", geo: "Analyse GEO", social: "Analyse réseaux sociaux", marketing: "Opportunités marketing", crmAi: "Opportunités CRM & IA", services: "Services recommandés", plan: "Plan d’action", evidence: "Sources", report: "Rapport Markdown complet", unknown: "Pas encore analysé", researchDate: "Date de recherche", confidence: "Confiance" },
  };

  const t = (key) => words[state.locale]?.[key] || words.en[key] || key;
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const icon = (name) => `<svg aria-hidden="true"><use href="#icon-${name}"/></svg>`;
  const formatDate = (value) => value ? new Intl.DateTimeFormat(state.locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

  async function api(path, options = {}) {
    const response = await fetch(`/api/crm/${path}`, { method: options.method || "GET", credentials: "same-origin", headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}) }, body: options.body ? JSON.stringify(options.body) : undefined });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { location.assign("/crm/login/"); throw new Error("Unauthorized"); }
    if (!response.ok) throw new Error(data.message || "CRM request failed.");
    return data;
  }

  function toast(message) {
    const node = document.getElementById("toast"); if (!node) return;
    node.textContent = message; node.classList.add("on"); clearTimeout(state.timer); state.timer = setTimeout(() => node.classList.remove("on"), 2800);
  }

  function openModal(body) {
    const modal = document.getElementById("appModal");
    const wasOpen = document.body.classList.contains("modal-open");
    if (!wasOpen) modalFocus = document.activeElement;
    modal.innerHTML = body; modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
    if (!wasOpen) modal.querySelector("input,select,textarea,button")?.focus();
    updateJobNotice();
  }

  function closeModal() {
    document.body.classList.remove("modal-open"); document.getElementById("appModal")?.setAttribute("aria-hidden", "true");
    modalFocus?.isConnected && modalFocus.focus();
    updateJobNotice();
  }

  function updateJobNotice() {
    let notice = document.getElementById("intelJobNotice");
    if (!activeJob) return;
    if (!notice) {
      notice = document.createElement("button");
      notice.id = "intelJobNotice"; notice.className = "ux-job-notice";
      notice.dataset.intelAction = "track-job"; notice.type = "button";
      document.body.append(notice);
    }
    const terminal = ["completed", "partial", "failed"].includes(activeJob.status);
    notice.innerHTML = `${icon("ai")}<span><strong>${esc(state.locale === "fr" ? (terminal ? "Résultats de l’analyse IA" : "Analyse IA en cours") : (terminal ? "AI research results" : "AI research is running"))}</strong><small>${esc(activeJob.batchCode || "")} · ${esc(state.locale === "fr" ? "Voir le suivi" : "View progress")}</small></span>`;
    notice.hidden = document.body.classList.contains("modal-open") || (terminal && activeJob.seen);
  }

  function statusMeta(status) {
    const map = { not_analyzed: [state.locale === "fr" ? "Non analysé" : "Not analyzed", "neutral"], queued: [state.locale === "fr" ? "En attente IA" : "Awaiting AI", "queued"], processing: [state.locale === "fr" ? "Analyse en cours" : "Analysis in progress", "processing"], completed: [state.locale === "fr" ? "Analyse terminée" : "Analysis completed", "completed"], failed: [state.locale === "fr" ? "Analyse échouée" : "Analysis failed", "failed"] };
    return map[status] || map.not_analyzed;
  }

  function metric(label, value, tone, glyph) { return `<article class="intel-metric ${tone}"><span class="intel-metric-icon">${glyph}</span><b>${Number(value || 0)}</b><span>${esc(label)}</span></article>`; }

  function score(value, label) { return value === null || value === undefined ? `<span class="intel-score empty">—</span>` : `<span class="intel-score" title="${esc(label)}">${Number(value)}/100</span>`; }

  function leadRow(lead) {
    const [label, tone] = statusMeta(lead.analysisStatus);
    const checked = state.selected.has(lead.id) ? " checked" : "";
    const action = lead.analysisStatus === "completed" ? `<button class="intel-link" data-intel-action="view" data-id="${lead.id}">${t("view")} →</button>` : `<button class="intel-link" data-intel-action="prepare-one" data-id="${lead.id}">${t("one")} →</button>`;
    return `<tr><td><input class="intel-check" type="checkbox" data-intel-select="${lead.id}" aria-label="Select ${esc(lead.fullName)}"${checked}></td><td><strong>${esc(lead.company || lead.fullName)}</strong><small>${esc(lead.city || "—")}</small></td><td>${esc(lead.businessSector || "—")}</td><td><span class="intel-status ${tone}"><i></i>${esc(label)}</span>${lead.batchCode ? `<small>${esc(lead.batchCode)}</small>` : ""}</td><td><div class="intel-score-row">${score(lead.digitalMaturityScore, "Digital maturity")}${score(lead.opportunityScore, "Opportunity")}${score(lead.salesPriorityScore, "Sales priority")}</div></td><td>${action}</td></tr>`;
  }

  function leadCard(lead) {
    const [label, tone] = statusMeta(lead.analysisStatus); const checked = state.selected.has(lead.id) ? " checked" : "";
    return `<article class="intel-lead-card"><div class="intel-card-top"><input class="intel-check" type="checkbox" data-intel-select="${lead.id}" aria-label="Select ${esc(lead.fullName)}"${checked}><span class="intel-status ${tone}"><i></i>${esc(label)}</span></div><h3>${esc(lead.company || lead.fullName)}</h3><p>${esc(lead.businessSector || "—")} · ${esc(lead.city || "—")}</p><div class="intel-score-row">${score(lead.digitalMaturityScore, "Digital maturity")}${score(lead.opportunityScore, "Opportunity")}${score(lead.salesPriorityScore, "Sales priority")}</div><button class="button button-secondary" data-intel-action="${lead.analysisStatus === "completed" ? "view" : "prepare-one"}" data-id="${lead.id}">${lead.analysisStatus === "completed" ? t("view") : t("one")}</button></article>`;
  }

  function dashboard() {
    if (state.loading) return `<section class="page-stack"><div class="intel-loading"><span></span><p>Loading lead intelligence…</p></div></section>`;
    if (state.error) return `<section class="page-stack"><div class="empty-state"><div class="empty-icon">!</div><h3>${esc(state.error)}</h3><button class="button" data-intel-action="retry">Retry</button></div></section>`;
    const s = state.summary;
    return `<section class="page-stack intelligence-page"><header class="intel-hero"><div><p class="eyebrow">${t("eyebrow")}</p><h1>${t("title")}</h1><p>${t("subtitle")}</p></div><div class="header-actions"><button class="button button-secondary" data-intel-action="find">${icon("search")} ${t("find")}</button><button class="button" data-intel-action="prepare-selected" ${state.selected.size ? "" : "disabled"}>${icon("ai")} ${t("prepare")}</button></div></header><div class="intel-metrics">${metric(t("total"), s.total, "ink", "∑")}${metric(t("completed"), s.completed, "green", "✓")}${metric(t("queued"), s.queued, "yellow", "◷")}${metric(t("processing"), s.processing, "blue", "↻")}${metric(t("notAnalyzed"), s.notAnalyzed, "gray", "○")}${metric(t("failed"), s.failed, "red", "!")}${metric(t("high"), s.highOpportunity, "violet", "↑")}</div><div class="panel intel-panel"><div class="intel-toolbar"><label class="intel-search">${icon("search")}<input id="intelSearch" value="${esc(state.filters.search)}" placeholder="${t("search")}"></label><select id="intelStatus"><option value="all">${t("allStatuses")}</option>${["not_analyzed","queued","processing","completed","failed"].map((value) => `<option value="${value}"${state.filters.status === value ? " selected" : ""}>${esc(statusMeta(value)[0])}</option>`).join("")}</select><select id="intelCategory"><option value="all">${t("allCategories")}</option>${state.categories.map((value) => `<option value="${esc(value)}"${state.filters.category === value ? " selected" : ""}>${esc(value)}</option>`).join("")}</select><select id="intelSort"><option value="recent_analysis"${state.filters.sort === "recent_analysis" ? " selected" : ""}>${t("sortRecent")}</option><option value="opportunity_desc"${state.filters.sort === "opportunity_desc" ? " selected" : ""}>${t("sortOpportunity")}</option><option value="newest"${state.filters.sort === "newest" ? " selected" : ""}>${t("sortNewest")}</option></select></div><div class="intel-selection"><label><input type="checkbox" id="intelSelectPage"${state.leads.length && state.leads.every((lead) => state.selected.has(lead.id)) ? " checked" : ""}> ${t("selectPage")}</label><span><b>${state.selected.size}</b> ${t("selected")}</span><button class="intel-link" data-intel-action="prepare-all">${state.locale === "fr" ? "Préparer tous" : "Prepare all"}</button>${state.filters.category !== "all" ? `<button class="intel-link" data-intel-action="prepare-category">${state.locale === "fr" ? "Préparer cette catégorie" : "Prepare this category"}</button>` : ""}</div><div class="intel-table-wrap"><table class="intel-table"><thead><tr><th></th><th>${t("lead")}</th><th>${t("category")}</th><th>${t("status")}</th><th>${t("scores")}</th><th>${t("action")}</th></tr></thead><tbody>${state.leads.length ? state.leads.map(leadRow).join("") : `<tr><td colspan="6" class="intel-empty">${t("noData")}</td></tr>`}</tbody></table></div><div class="intel-cards">${state.leads.map(leadCard).join("")}</div><footer class="intel-pagination"><span>${state.pagination.total} leads</span><div><button class="button button-secondary button-sm" data-intel-action="page" data-page="${state.pagination.page - 1}" ${state.pagination.page <= 1 ? "disabled" : ""}>${t("previous")}</button><span>${state.pagination.page} / ${state.pagination.pages}</span><button class="button button-secondary button-sm" data-intel-action="page" data-page="${state.pagination.page + 1}" ${state.pagination.page >= state.pagination.pages ? "disabled" : ""}>${t("next")}</button></div></footer></div><section class="panel intel-batches"><div class="panel-title"><div><p class="eyebrow">QUEUE</p><h2>${t("recentBatches")}</h2></div></div>${state.batches.length ? `<div class="intel-batch-list">${state.batches.map((batch) => `<article><span class="intel-status ${statusMeta(batch.status === "processing" ? "processing" : batch.status === "completed" ? "completed" : batch.status === "failed" ? "failed" : "queued")[1]}"><i></i>${esc(batch.status)}</span><strong>${esc(batch.code)}</strong><small>${batch.completedLeads}/${batch.totalLeads} completed · ${formatDate(batch.createdAt)}</small></article>`).join("")}</div>` : `<div class="empty-state"><p>${t("noBatches")}</p></div>`}</section><section class="panel intel-batches"><div class="panel-title"><div><p class="eyebrow">LEAD DISCOVERY REVIEW</p><h2>${state.locale === "fr" ? "Nouveaux prospects proposés" : "Proposed new prospects"}</h2></div></div>${state.discoveryBatches.length ? `<div class="intel-batch-list">${state.discoveryBatches.map((batch) => `<article><span class="intel-status ${batch.status === "completed" ? "completed" : batch.status === "failed" ? "failed" : batch.status === "ready_for_review" ? "processing" : "queued"}"><i></i>${esc(batch.status)}</span><strong>${esc(batch.code)}</strong><small>${esc(batch.category || "Any category")} · ${esc(batch.city)}</small>${batch.status === "ready_for_review" ? `<button class="intel-link" data-intel-action="review-discovery" data-id="${batch.id}">${state.locale === "fr" ? "Examiner les candidats" : "Review candidates"} →</button>` : ""}</article>`).join("")}</div>` : `<div class="empty-state"><p>${state.locale === "fr" ? "Aucune recherche de nouveaux prospects." : "No lead discovery batch yet."}</p></div>`}</section></section>`;
  }

  function safeMarkdown(markdown) {
    return esc(markdown || "").split("\n").map((line) => {
      if (/^###\s/.test(line)) return `<h4>${line.replace(/^###\s/, "")}</h4>`;
      if (/^##\s/.test(line)) return `<h3>${line.replace(/^##\s/, "")}</h3>`;
      if (/^#\s/.test(line)) return `<h2>${line.replace(/^#\s/, "")}</h2>`;
      if (/^[-*]\s/.test(line)) return `<li>${line.replace(/^[-*]\s/, "")}</li>`;
      return line ? `<p>${line}</p>` : "";
    }).join("");
  }

  function detailBase() {
    const lead = state.detail; if (!lead) return dashboard();
    const [label, tone] = statusMeta(lead.analysisStatus);
    const section = (title, value) => `<article class="intel-analysis-card"><h2>${esc(title)}</h2><p>${esc(value || t("unknown"))}</p></article>`;
    const list = (title, values) => `<article class="intel-analysis-card"><h2>${esc(title)}</h2>${values?.length ? `<ol>${values.map((value) => `<li>${esc(value)}</li>`).join("")}</ol>` : `<p>${t("unknown")}</p>`}</article>`;
    return `<section class="page-stack intelligence-page"><button class="intel-back" data-intel-action="back">← ${t("back")}</button><header class="intel-detail-hero"><div><span class="intel-status ${tone}"><i></i>${esc(label)}</span><h1>${esc(lead.company || lead.fullName)}</h1><p>${esc(lead.businessSector || "—")} · ${esc(lead.city || "—")}</p>${lead.website ? `<a href="${esc(lead.website)}" target="_blank" rel="noopener noreferrer">${esc(lead.website)} ↗</a>` : ""}</div><div class="header-actions">${lead.reportMarkdown ? `<button class="button button-secondary" data-intel-action="download" data-id="${lead.id}">${icon("download")} ${t("download")}</button>` : ""}</div></header><div class="intel-detail-meta"><span>${t("researchDate")} <b>${formatDate(lead.researchedAt)}</b></span><span>${t("confidence")} <b>${esc(lead.researchConfidence || "—")}</b></span>${lead.batchCode ? `<span>Batch <b>${esc(lead.batchCode)}</b></span>` : ""}</div><div class="intel-score-cards"><article><span>Digital maturity</span><b>${lead.digitalMaturityScore ?? "—"}<small>/100</small></b><p>${esc(lead.scoreExplanations?.digital_maturity || "Heuristic assessment, not a sales probability.")}</p></article><article><span>Business opportunity</span><b>${lead.opportunityScore ?? "—"}<small>/100</small></b><p>${esc(lead.scoreExplanations?.business_opportunity || "Heuristic assessment, not a sales probability.")}</p></article><article><span>Sales priority</span><b>${lead.salesPriorityScore ?? "—"}<small>/100</small></b><p>${esc(lead.scoreExplanations?.sales_priority || "Heuristic assessment, not a closing probability.")}</p></article></div><div class="intel-analysis-grid">${section(t("current"), lead.currentSituation)}${section(t("website"), lead.websiteAnalysis)}${section(t("landing"), lead.landingPageAnalysis)}${section(t("seo"), lead.seoAnalysis)}${section(t("geo"), lead.geoAnalysis)}${section(t("social"), lead.socialAnalysis)}${section(t("marketing"), lead.marketingAnalysis)}${section(t("crmAi"), lead.crmAutomationAnalysis)}${list(t("services"), lead.recommendedServices)}${list(t("plan"), lead.actionPlan)}</div><article class="panel intel-evidence"><h2>${t("evidence")}</h2>${lead.evidence?.length ? `<div>${lead.evidence.map((item) => `<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(item.title || new URL(item.url).hostname)}</strong><span>${esc(item.claim || item.url)}</span></a>`).join("")}</div>` : `<p>${t("unknown")}</p>`}</article>${lead.reportMarkdown ? `<article class="panel intel-report"><h2>${t("report")}</h2><div class="intel-markdown">${safeMarkdown(lead.reportMarkdown)}</div></article>` : ""}</section>`;
  }

  function detail() {
    return detailBase().replace('<div class="intel-analysis-grid">', `<section id="leadProjectWorkspace" aria-label="Project workspace"></section><div class="intel-analysis-grid">`);
  }

  function render() { return state.detail ? detail() : dashboard(); }
  function renderInto() {
    const node = document.getElementById("appContent");
    if (!node || !location.hash.startsWith("#intelligence")) return;
    const focused = document.activeElement;
    const restore = node.contains(focused) && focused.id ? { id: focused.id, start: focused.selectionStart, end: focused.selectionEnd } : null;
    node.innerHTML = render();
    if (state.detail) window.CrmProject?.mount(state.detail);
    if (restore) {
      const replacement = document.getElementById(restore.id);
      replacement?.focus({ preventScroll: true });
      if (replacement?.setSelectionRange && restore.start !== null && restore.start !== undefined) replacement.setSelectionRange(restore.start, restore.end);
    }
  }

  async function refresh(page = state.pagination.page || 1) {
    state.loading = !state.leads.length; state.error = ""; renderInto();
    const query = new URLSearchParams({ page: String(page), pageSize: "25", sort: state.filters.sort });
    if (state.filters.search) query.set("search", state.filters.search);
    if (state.filters.status !== "all") query.set("analysisStatus", state.filters.status);
    if (state.filters.category !== "all") query.set("category", state.filters.category);
    try {
      const [leadData, categoryData, batchData, discoveryData] = await Promise.all([api(`intelligence/leads?${query}`), api("intelligence/categories"), api("intelligence/batches?pageSize=8"), api("intelligence/find")]);
      state.leads = leadData.leads; state.summary = leadData.summary; state.pagination = leadData.pagination; state.categories = categoryData.categories; state.batches = batchData.batches; state.discoveryBatches = discoveryData.batches || []; state.loading = false; renderInto();
    } catch (error) { state.loading = false; state.error = error.message; renderInto(); }
  }

  function prepareDialog(scope, leadIds = [], category = "") {
    const count = scope === "selected" || scope === "one" ? leadIds.length : scope === "category" ? state.pagination.total : state.summary.total;
    return `<div class="modal-header"><div><p class="eyebrow">BACKEND AI RESEARCH</p><h2 id="modalTitle">${t("prepare")}</h2></div><button class="close-button" data-intel-action="close">×</button></div><div class="modal-body"><div class="intel-confirm-visual">${icon("ai")}</div><h3>${state.locale === "fr" ? "Lancer la recherche depuis le CRM ?" : "Run research directly from the CRM?"}</h3><p>${count} ${state.locale === "fr" ? "lead(s) seront analysés par OpenAI avec recherche web et sources vérifiables." : "lead(s) will be analyzed by OpenAI with web research and verifiable sources."}</p><div class="intel-safety-note">${state.locale === "fr" ? "Cette action utilise votre crédit API OpenAI. La clé reste secrète côté serveur." : "This action uses your OpenAI API credit. The key stays secret on the server."}</div><div class="modal-actions"><button class="button button-secondary" data-intel-action="close">${t("close")}</button><button class="button" data-intel-action="confirm-prepare" data-scope="${scope}" data-ids="${esc(leadIds.join(","))}" data-category="${esc(category)}">${t("prepare")}</button></div></div>`;
  }

  function jobDialog(job) {
    const finished = ["completed", "partial"].includes(job.status); const failed = job.status === "failed";
    const fr = state.locale === "fr";
    const queued = ["starting", "queued", "awaiting_chatgpt"].includes(job.status);
    const total = Math.max(0, Number(job.total || 0));
    const processed = Math.max(0, Number(job.completed || 0)) + Math.max(0, Number(job.failed || 0));
    const progress = finished ? 100 : total && processed ? Math.min(99, Math.round(processed / total * 100)) : null;
    const title = failed ? (fr ? "Analyse interrompue" : "Research stopped") : job.status === "partial" ? (fr ? "Terminé · à vérifier" : "Finished · needs review") : finished ? (fr ? "Votre analyse est prête" : "Your research is ready") : queued ? (fr ? "Préparation de l’analyse" : "Preparing your research") : (fr ? "Analyse des sources publiques" : "Researching public sources");
    const steps = fr ? ["Préparer", "Rechercher", "Enregistrer"] : ["Prepare", "Research", "Save results"];
    const current = finished ? 3 : queued ? 0 : 1;
    const summary = failed ? esc(job.error || (fr ? "Réessayez depuis la liste des leads." : "Try again from the leads list.")) : finished ? (job.kind === "discovery" ? `${Number(job.saved || 0)} ${fr ? "entreprises prêtes à vérifier." : "businesses ready for your review."}` : `${Number(job.completed || 0)} / ${total} ${fr ? "analyses enregistrées" : "analyses saved"}${Number(job.failed || 0) ? ` · ${Number(job.failed)} ${fr ? "échouées" : "failed"}` : ""}.`) : (fr ? "Les sources sont recherchées et les résultats seront enregistrés. Le temps varie selon les entreprises." : "Sources are being researched and results will be saved. Timing varies by business.");
    return `<div class="modal-header"><div><p class="eyebrow">${fr ? "SUIVI DE L’ANALYSE IA" : "AI RESEARCH PROGRESS"}</p><h2 id="modalTitle">${fr ? "Votre assistant de recherche" : "Your research assistant"}</h2></div><button class="close-button" data-intel-action="close" aria-label="${t("close")}">×</button></div><div class="modal-body ux-job" data-job-id="${esc(job.batchId)}"><div class="ux-job-ring ${failed ? "failed" : finished ? "done" : progress === null ? "pending" : ""}" data-job-progress role="progressbar" aria-label="${fr ? "Progression de l’analyse" : "Research progress"}" aria-valuemin="0" aria-valuemax="100" ${progress === null ? `aria-valuetext="${esc(title)}"` : `aria-valuenow="${progress}"`} style="--progress:${progress ?? 0}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ux-ring-track" cx="60" cy="60" r="52"/><circle class="ux-ring-value" cx="60" cy="60" r="52" pathLength="100"/></svg><div aria-hidden="true"><strong>${failed ? "!" : progress === null ? "AI" : `<span data-job-count="${progress}">${progress}</span>%`}</strong><small>${finished ? (fr ? "terminé" : "complete") : failed ? (fr ? "interrompu" : "stopped") : (fr ? "en cours" : "working")}</small></div></div><h3 role="status">${title}</h3><p>${summary}</p><ol class="ux-job-steps">${steps.map((step, index) => `<li class="${index < current ? "done" : index === current && !failed ? "active" : ""}">${index < current ? "✓" : `0${index + 1}`} · ${step}</li>`).join("")}</ol><p class="ux-job-summary">${esc(job.batchCode || "")}${job.model ? ` · ${esc(job.model)}` : ""}</p>${!finished && !failed ? `<p class="ux-job-summary">${fr ? "Vous pouvez fermer cette fenêtre et continuer à utiliser le CRM." : "You can close this window and keep using the CRM."}</p>` : ""}<div class="modal-actions"><button class="button button-secondary" data-intel-action="close">${finished || failed ? t("close") : (fr ? "Continuer dans le CRM" : "Continue in CRM")}</button>${finished && job.kind === "discovery" ? `<button class="button" data-intel-action="review-discovery" data-id="${esc(job.batchId)}">${fr ? "Vérifier les entreprises" : "Review businesses"}</button>` : ""}</div></div>`;
  }

  function findDialog() {
    return `<div class="modal-header"><div><p class="eyebrow">COMPLIANT LEAD DISCOVERY</p><h2 id="modalTitle">${t("find")}</h2></div><button class="close-button" data-intel-action="close">×</button></div><div class="modal-body"><form id="intelFindForm" class="form-grid"><label class="form-field"><span>Business category</span><input name="category" required placeholder="Aesthetic clinics"></label><label class="form-field"><span>City</span><input name="city" required value="Casablanca"></label><label class="form-field"><span>Business type</span><input name="businessType" placeholder="Clinic, school, restaurant..."></label><label class="form-field"><span>Keywords</span><input name="keywords" placeholder="booking, local business..."></label><div class="intel-safety-note full">Candidates will be saved to a review queue. They are never inserted as CRM leads automatically.</div><div class="modal-actions full"><button type="button" class="button button-secondary" data-intel-action="close">${t("close")}</button><button class="button" type="submit">Create discovery batch</button></div></form></div>`;
  }

  function discoveryReviewDialog() {
    const batch = state.discoveryBatch; const candidates = state.discoveryCandidates;
    return `<div class="modal-header"><div><p class="eyebrow">REVIEW BEFORE SAVING</p><h2 id="modalTitle">${esc(batch?.code || "Discovery candidates")}</h2></div><button class="close-button" data-intel-action="close">×</button></div><div class="modal-body"><p>${state.locale === "fr" ? "Sélectionnez les entreprises à valider. Les doublons seront détectés avant tout enregistrement." : "Select candidates to validate. CRM duplicates are detected before anything is saved."}</p><div class="intel-candidate-list">${candidates.length ? candidates.map((candidate) => `<label><input type="checkbox" data-discovery-select="${candidate.id}"${state.discoverySelected.has(candidate.id) ? " checked" : ""}><span><strong>${esc(candidate.businessName)}</strong><small>${esc(candidate.category || "—")} · ${esc(candidate.city || "—")}</small><a href="${esc(candidate.sourceUrl)}" target="_blank" rel="noopener noreferrer">Evidence source ↗</a></span></label>`).join("") : `<div class="empty-state"><p>No candidates available.</p></div>`}</div><div class="modal-actions"><button class="button button-secondary" data-intel-action="close">${t("close")}</button><button class="button" data-intel-action="preview-discovery" ${state.discoverySelected.size ? "" : "disabled"}>${state.locale === "fr" ? "Valider la sélection" : "Validate selected"}</button></div></div>`;
  }

  function discoveryPreviewDialog() {
    const preview = state.discoveryPreview;
    return `<div class="modal-header"><div><p class="eyebrow">DUPLICATE CHECK COMPLETE</p><h2 id="modalTitle">Approve CRM import</h2></div><button class="close-button" data-intel-action="close">×</button></div><div class="modal-body"><div class="import-summary-grid"><article class="good"><b>${preview.summary.ready}</b><span>Ready</span></article><article class="warn"><b>${preview.summary.duplicates}</b><span>Duplicates</span></article><article class="bad"><b>${preview.summary.invalid}</b><span>Invalid</span></article><article><b>${preview.summary.total}</b><span>Reviewed</span></article></div><div class="mini-preview"><table class="data-table"><thead><tr><th>Business</th><th>Result</th></tr></thead><tbody>${preview.rows.map((row) => `<tr><td>${esc(row.fullName)}</td><td><span class="intel-status ${row.disposition === "ready" ? "completed" : row.disposition === "duplicate" ? "queued" : "failed"}"><i></i>${esc(row.disposition)}</span></td></tr>`).join("")}</tbody></table></div><label class="confirm-import"><input type="checkbox" id="confirmDiscoveryImport"><span><strong>Confirm approved candidates</strong><small>Ready candidates become CRM leads; duplicates are linked, not inserted again.</small></span></label><div class="modal-actions"><button class="button button-secondary" data-intel-action="review-discovery" data-id="${state.discoveryBatch.id}">Back</button><button class="button" data-intel-action="commit-discovery">Save approved leads</button></div></div>`;
  }

  async function openDiscoveryReview(id) {
    try { const data = await api(`intelligence/discovery/${encodeURIComponent(id)}`); state.discoveryBatch = data.batch; state.discoveryCandidates = data.candidates.filter((candidate) => candidate.reviewStatus === "pending"); state.discoverySelected = new Set(state.discoveryCandidates.map((candidate) => candidate.id)); state.discoveryPreview = null; openModal(discoveryReviewDialog()); }
    catch (error) { toast(error.message); }
  }

  async function previewDiscovery() {
    try { state.discoveryPreview = await api(`intelligence/discovery/${state.discoveryBatch.id}/review`, { method: "POST", body: { mode: "preview", candidateIds: [...state.discoverySelected] } }); openModal(discoveryPreviewDialog()); }
    catch (error) { toast(error.message); }
  }

  async function commitDiscovery() {
    if (!document.getElementById("confirmDiscoveryImport")?.checked) { toast("Confirm the reviewed candidates first."); return; }
    try { const data = await api(`intelligence/discovery/${state.discoveryBatch.id}/review`, { method: "POST", body: { mode: "commit", candidateIds: [...state.discoverySelected], confirmation: state.discoveryPreview.confirmation } }); closeModal(); toast(`${data.result.inserted} approved leads saved; ${data.result.duplicates} duplicates skipped.`); await refresh(1); }
    catch (error) { toast(error.message); }
  }

  async function prepare(scope, ids, category) {
    const button = document.querySelector('[data-intel-action="confirm-prepare"]'); if (button) button.disabled = true;
    try { const data = await api("intelligence/prepare", { method: "POST", body: { scope, leadIds: ids, category } }); state.selected.clear(); await startAutomation("analysis", data.batch); await refresh(1); }
    catch (error) { toast(error.message); if (button) button.disabled = false; }
  }

  async function startAutomation(kind, batch) {
    clearTimeout(state.jobTimer);
    state.jobRetries = 0;
    activeJob = { kind, batchId: batch.id, batchCode: batch.code, status: "starting" };
    openModal(jobDialog(activeJob));
    let data;
    try { data = await api("intelligence/automation", { method: "POST", body: { kind, batchId: batch.id } }); }
    catch (error) {
      activeJob = { ...activeJob, status: "failed", error: error.message, seen: true };
      openModal(jobDialog(activeJob));
      throw error;
    }
    activeJob = data.job;
    openModal(jobDialog(data.job));
    if (!["completed", "partial", "failed"].includes(data.job.status)) state.jobTimer = setTimeout(() => pollAutomation(kind, batch.id), 4000);
  }

  async function pollAutomation(kind, batchId) {
    try {
      const data = await api(`intelligence/automation?kind=${encodeURIComponent(kind)}&batchId=${encodeURIComponent(batchId)}`);
      activeJob = data.job;
      const jobIsOpen = document.querySelector("[data-job-id]")?.dataset.jobId === batchId && document.body.classList.contains("modal-open");
      if (jobIsOpen) {
        const focusAction = document.activeElement?.dataset.intelAction;
        openModal(jobDialog(data.job));
        if (focusAction) document.querySelector(`[data-intel-action="${focusAction}"]`)?.focus();
        if (["completed", "partial", "failed"].includes(data.job.status)) activeJob.seen = true;
      }
      state.jobRetries = 0;
      updateJobNotice();
      if (["completed", "partial", "failed"].includes(data.job.status)) { await refresh(1); return; }
      state.jobTimer = setTimeout(() => pollAutomation(kind, batchId), 5000);
    } catch (error) {
      state.jobRetries += 1;
      toast(error.message);
      if (state.jobRetries <= 6) state.jobTimer = setTimeout(() => pollAutomation(kind, batchId), 10000);
      else toast(state.locale === "fr" ? "Suivi en pause. Cliquez sur le suivi IA pour reprendre." : "Live updates paused. Open AI progress to reconnect.");
    }
  }

  async function viewLead(id) {
    state.loading = true; renderInto();
    try { const data = await api(`intelligence/leads/${encodeURIComponent(id)}`); state.detail = data.lead; state.loading = false; renderInto(); history.replaceState(null, "", `#intelligence/lead/${id}`); window.scrollTo(0, 0); }
    catch (error) { state.loading = false; toast(error.message); state.detail = null; renderInto(); }
  }

  function downloadReport() {
    if (!state.detail?.reportMarkdown) return;
    const blob = new Blob([state.detail.reportMarkdown], { type: "text/markdown;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${(state.detail.company || state.detail.fullName || "lead").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-intelligence.md`; link.click(); URL.revokeObjectURL(url);
  }

  function click(event) {
    const target = event.target.closest("[data-intel-action]"); if (!target) return;
    const action = target.dataset.intelAction;
    if (action === "track-job" && activeJob) {
      activeJob.seen = true;
      openModal(jobDialog(activeJob));
      if (!["completed", "partial", "failed"].includes(activeJob.status)) { clearTimeout(state.jobTimer); state.jobRetries = 0; pollAutomation(activeJob.kind, activeJob.batchId); }
    }
    else if (action === "close") closeModal();
    else if (action === "retry") refresh(1);
    else if (action === "find") openModal(findDialog());
    else if (action === "review-discovery") openDiscoveryReview(target.dataset.id);
    else if (action === "preview-discovery") previewDiscovery();
    else if (action === "commit-discovery") commitDiscovery();
    else if (action === "prepare-selected") openModal(prepareDialog("selected", [...state.selected]));
    else if (action === "prepare-one") openModal(prepareDialog("one", [target.dataset.id]));
    else if (action === "prepare-all") openModal(prepareDialog("all"));
    else if (action === "prepare-category") openModal(prepareDialog("category", [], state.filters.category));
    else if (action === "confirm-prepare") prepare(target.dataset.scope, (target.dataset.ids || "").split(",").filter(Boolean), target.dataset.category || "");
    else if (action === "view") viewLead(target.dataset.id);
    else if (action === "back") { state.detail = null; history.replaceState(null, "", "#intelligence"); renderInto(); window.scrollTo(0, 0); }
    else if (action === "download") downloadReport();
    else if (action === "page") refresh(Number(target.dataset.page));
  }

  function change(event) {
    if (event.target.matches("[data-discovery-select]")) { event.target.checked ? state.discoverySelected.add(event.target.dataset.discoverySelect) : state.discoverySelected.delete(event.target.dataset.discoverySelect); openModal(discoveryReviewDialog()); return; }
    if (event.target.matches("[data-intel-select]")) { event.target.checked ? state.selected.add(event.target.dataset.intelSelect) : state.selected.delete(event.target.dataset.intelSelect); renderInto(); return; }
    if (event.target.id === "intelSelectPage") { for (const lead of state.leads) event.target.checked ? state.selected.add(lead.id) : state.selected.delete(lead.id); renderInto(); return; }
    if (event.target.id === "intelStatus") { state.filters.status = event.target.value; refresh(1); }
    if (event.target.id === "intelCategory") { state.filters.category = event.target.value; refresh(1); }
    if (event.target.id === "intelSort") { state.filters.sort = event.target.value; refresh(1); }
  }

  function input(event) {
    if (event.target.id !== "intelSearch") return; clearTimeout(state.timer); state.filters.search = event.target.value; state.timer = setTimeout(() => refresh(1), 300);
  }

  async function submit(event) {
    if (event.target.id !== "intelFindForm") return; event.preventDefault();
    const form = event.target; const data = Object.fromEntries(new FormData(form)); form.querySelectorAll("button,input").forEach((node) => { node.disabled = true; });
    try { const result = await api("intelligence/find", { method: "POST", body: data }); await startAutomation("discovery", result.batch); await refresh(1); }
    catch (error) { toast(error.message); form.querySelectorAll("button,input").forEach((node) => { node.disabled = false; }); }
  }

  function mount({ locale = "en" } = {}) {
    state.locale = locale === "fr" ? "fr" : "en";
    if (!mounted) { document.addEventListener("click", click); document.addEventListener("change", change); document.addEventListener("input", input); document.addEventListener("submit", submit); new MutationObserver(updateJobNotice).observe(document.body, { attributes: true, attributeFilter: ["class"] }); mounted = true; }
    const match = location.hash.match(/^#intelligence\/lead\/([0-9a-f-]{36})$/i);
    if (match) viewLead(match[1]); else if (!state.leads.length && !state.error) refresh(1); else renderInto();
  }

  window.CrmIntelligence = { render: ({ locale = state.locale } = {}) => { state.locale = locale; return render(); }, mount, refresh };
})();
