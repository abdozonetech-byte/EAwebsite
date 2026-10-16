(() => {
  "use strict";
  const state = { lead: null, data: null, loading: false, error: "", tab: "solution", timer: null, busy: false, draft: "", rating: "5", device: "desktop", selected: {}, message: "", request: null, feedbackVersion: null };
  const active = (item) => ["starting", "queued", "in_progress"].includes(item.status);
  const fr = () => document.documentElement.lang === "fr";
  const tr = (en, french) => fr() ? french : en;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const date = (value) => new Intl.DateTimeFormat(fr() ? "fr-FR" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  const svg = (name) => {
    const paths = { chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 6 9 7 9-7"/>', spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>', layout: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>', feedback: '<path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9Z"/><path d="M8 8h8M8 12h5"/>', copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>' };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  };
  const action = (name, label, icon = "spark", secondary = true) => `<button class="button ${secondary ? "button-secondary" : ""}" type="button" data-project-action="${name}">${svg(icon)}${esc(label)}</button>`;
  const terminalResults = (kind) => (state.data?.generations || []).filter(g => g.kind === kind && g.status === "completed");
  const selected = (kind) => terminalResults(kind).find(g => g.id === state.selected[kind]) || terminalResults(kind)[0];

  async function api(method = "GET", body, poll = false, leadId = state.lead.id) {
    const response = await fetch(`/api/crm/intelligence/leads/${encodeURIComponent(leadId)}/project${poll ? "?poll=1" : ""}`, { method, credentials: "same-origin", headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) { location.assign("/crm/login/"); throw new Error("Sign in to continue."); }
    if (!response.ok) throw new Error(data.message || tr("Project workspace is unavailable. Please try again.", "Espace projet indisponible. Réessayez."));
    return data;
  }

  async function refresh(poll = false) {
    const id = state.lead?.id;
    if (!id) return;
    clearTimeout(state.timer);
    try {
      const data = await api("GET", null, poll, id);
      if (state.lead?.id !== id) return;
      const finished = data.generations.find(g => g.status === "completed" && state.data?.generations.some(old => old.id === g.id && active(old)));
      if (finished) state.message = finished.kind === "mockup" ? tr("New mockup saved. Earlier versions are still available.", "Nouvelle maquette enregistrée. Les versions précédentes sont conservées.") : tr("Solution plan saved. Your outreach drafts are ready.", "Plan de solutions enregistré. Vos brouillons de contact sont prêts.");
      state.data = data; state.error = ""; state.loading = false; render();
      if (data.generations.some(active)) state.timer = setTimeout(() => refresh(true), 4500);
    } catch (error) {
      if (state.lead?.id !== id) return;
      state.error = error.message; state.loading = false; render();
      // A failure stops polling; reconnect explicitly, without starting another paid request.
    }
  }

  function versions(kind) {
    const items = terminalResults(kind);
    if (!items.length) return "";
    return `<label class="project-version">${tr("Saved version", "Version enregistrée")}<select data-project-version="${kind}" aria-label="${tr("Saved version", "Version enregistrée")}">${items.map((g, i) => `<option value="${g.id}"${selected(kind)?.id === g.id ? " selected" : ""}>${esc(date(g.createdAt))}${i ? "" : ` · ${tr("Latest", "Récente")}`}</option>`).join("")}</select></label>`;
  }

  function empty(kind) {
    const isMockup = kind === "mockup";
    return `<div class="project-empty">${svg(isMockup ? "layout" : "spark")}<h3>${isMockup ? tr("Show what better could look like", "Montrez à quoi pourrait ressembler le projet") : tr("Turn this research into a clear proposal", "Transformez la recherche en proposition concrète")}</h3><p>${isMockup ? tr("Generate a landing-page concept with tailored copy, services and a visual direction.", "Créez un concept de landing page avec un message, des services et une direction visuelle adaptés.") : tr("Get paired problems and solutions, recommended services, next steps and outreach drafts.", "Obtenez les problèmes et solutions, services, prochaines étapes et messages de contact.")}</p>${action(`generate-${kind}`, isMockup ? tr("Generate mockup", "Générer la maquette") : tr("Generate solution plan", "Générer le plan de solutions"), isMockup ? "layout" : "spark", false)}</div>`;
  }

  function solution() {
    const result = selected("solution");
    if (!result) return empty("solution");
    const p = result.output;
    return `<div class="project-result-top">${versions("solution")}${action("download-plan", tr("Download plan", "Télécharger le plan"), "copy")}</div><div class="project-summary"><span class="eyebrow">${tr("PROPOSED APPROACH", "APPROCHE PROPOSÉE")}</span><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></div><div class="project-problems">${p.problems.map((item, i) => `<article><header><span class="project-number">${String(i + 1).padStart(2, "0")}</span><span class="project-priority ${item.priority}">${esc(item.priority === "high" ? tr("High priority", "Priorité haute") : item.priority === "medium" ? tr("Medium priority", "Priorité moyenne") : tr("Low priority", "Priorité basse"))}</span></header><h4>${esc(item.problem)}</h4><div class="project-solution"><span>${tr("PROPOSED SOLUTION", "SOLUTION PROPOSÉE")}</span><p>${esc(item.solution)}</p></div><footer><span>${esc(item.service)}</span>${item.evidence_url && /^https?:\/\//i.test(item.evidence_url) ? `<a href="${esc(item.evidence_url)}" target="_blank" rel="noopener noreferrer">${tr("Source", "Source")} ↗</a>` : ""}${item.assumption ? `<small>${tr("Confirm with lead", "À confirmer avec le lead")}</small>` : ""}</footer></article>`).join("")}</div><div class="project-two-col"><article><h3>${tr("Next steps", "Prochaines étapes")}</h3><ol>${p.next_steps.map(item => `<li>${esc(item)}</li>`).join("")}</ol></article><article><h3>${tr("Questions for the lead", "Questions à poser au lead")}</h3><ul>${p.questions.map(item => `<li>${esc(item)}</li>`).join("")}</ul></article></div><div class="project-sales"><h3>${tr("Suggested sales approach", "Approche commerciale suggérée")}</h3><p>${esc(p.sales_approach)}</p>${action("tab-contact", tr("Prepare a conversation", "Préparer la prise de contact"), "chat")}</div>`;
  }

  function mockupMarkup(output) {
    const tr = (en, french) => (selected("mockup")?.locale || document.documentElement.lang) === "fr" ? french : en;
    const initials = (output.brand_name || "").split(/\s+/).slice(0, 2).map(s => s[0] || "").join("");
    return `<div class="project-mockup theme-${esc(output.accent)}"><nav><strong>${esc(output.brand_name)}</strong><span>${tr("Expertise · Approach · Contact", "Expertise · Approche · Contact")}</span></nav><section class="pm-hero"><div><span class="pm-eyebrow">${esc(output.eyebrow)}</span><h3>${esc(output.headline)}</h3><p>${esc(output.description)}</p><span class="pm-cta">${esc(output.cta_label)} ↗</span></div><div class="pm-art" aria-hidden="true"><div class="pm-orbit"></div><span>${esc(initials)}</span><div class="pm-float">${svg("spark")} ${tr("A clearer experience", "Une expérience plus claire")}</div></div></section><div class="pm-features">${output.features.map(feature => `<span>✓ ${esc(feature)}</span>`).join("")}</div><div class="pm-sections">${output.sections.map((section, i) => `<article><span>0${i + 1}</span><h4>${esc(section.title)}</h4><p>${esc(section.body)}</p></article>`).join("")}</div><footer><strong>${esc(output.brand_name)}</strong><span>${tr("Proposed concept · for discussion", "Concept proposé · pour discussion")}</span></footer></div>`;
  }
  function mockup() {
    const result = selected("mockup");
    if (!result) return empty("mockup");
    return `<div class="project-result-top">${versions("mockup")}<div class="project-device"><button type="button" data-project-action="device-desktop" aria-pressed="${state.device === "desktop"}">${tr("Desktop", "Ordinateur")}</button><button type="button" data-project-action="device-mobile" aria-pressed="${state.device === "mobile"}">${tr("Mobile", "Mobile")}</button></div>${action("download-mockup", tr("Download HTML", "Télécharger HTML"), "layout")}</div><p class="project-caption">${tr("AI-generated design concept. Proposed copy and layout, ready to discuss with your lead.", "Concept de design généré par IA. Message et mise en page proposés pour échanger avec votre lead.")}</p><div class="project-canvas ${state.device === "mobile" ? "is-mobile" : ""}">${mockupMarkup(result.output)}</div><div class="project-sales"><h3>${tr("Design direction", "Direction visuelle")}</h3><p>${esc(result.output.design_rationale)}</p></div>`;
  }

  function contactLinks() {
    const contact = state.data?.contact || {};
    let phone = String(contact.phone || "").trim().replace(/[\s().-]/g, "");
    if (/^00/.test(phone)) phone = phone.slice(2);
    if (/^0[5-8]\d{8}$/.test(phone)) phone = "212" + phone.slice(1);
    phone = phone.replace(/^\+/, "");
    const validPhone = /^[1-9]\d{7,14}$/.test(phone);
    const email = String(contact.email || "").trim();
    const validEmail = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email) && email.length <= 160;
    const plan = selected("solution")?.output;
    return { whatsapp: validPhone ? `https://wa.me/${phone}${plan ? `?text=${encodeURIComponent(plan.whatsapp)}` : ""}` : "", email: validEmail ? `mailto:${encodeURIComponent(email).replace(/%40/g, "@").replace(/'/g, "%27")}${plan ? `?subject=${encodeURIComponent(plan.email_subject)}&body=${encodeURIComponent(plan.email_body)}` : ""}` : "" };
  }
  function contacts() {
    const links = contactLinks(), plan = selected("solution")?.output;
    return `<div class="project-contact-intro"><h3>${tr("Start a useful conversation", "Engagez une conversation utile")}</h3><p>${tr("Review the draft and adapt it before sending. Contact details come from the saved CRM lead.", "Relisez et adaptez le message avant de l’envoyer. Les coordonnées proviennent du lead enregistré.")}</p><div class="project-actions">${links.whatsapp ? `<a class="button project-whatsapp" href="${esc(links.whatsapp)}" target="_blank" rel="noopener noreferrer">${svg("chat")}WhatsApp ↗</a>` : `<span class="project-unavailable">${tr("No valid phone saved", "Aucun téléphone valide enregistré")}</span>`}${links.email ? `<a class="button button-secondary" href="${esc(links.email)}">${svg("mail")}${tr("Open email", "Ouvrir l’email")}</a>` : `<span class="project-unavailable">${tr("No valid email saved", "Aucun email valide enregistré")}</span>`}</div></div>${plan ? `<div class="project-two-col"><article><header><h3>WhatsApp</h3>${action("copy-whatsapp", tr("Copy", "Copier"), "copy")}</header><p class="project-draft">${esc(plan.whatsapp)}</p></article><article><header><h3>Email</h3>${action("copy-email", tr("Copy", "Copier"), "copy")}</header><strong>${esc(plan.email_subject)}</strong><p class="project-draft">${esc(plan.email_body)}</p></article></div>` : `<div class="project-inline-note">${tr("Generate a solution plan to get personalized outreach drafts.", "Générez le plan de solutions pour obtenir des messages personnalisés.")} ${action("generate-solution", tr("Generate plan", "Générer le plan"))}</div>`}`;
  }

  function feedback() {
    const version = state.data.generations.find(g => g.id === state.feedbackVersion);
    return `<div class="project-feedback-grid"><form id="projectFeedbackForm"><h3>${tr("Your feedback improves the next version", "Votre retour améliore la prochaine version")}</h3><p>${tr("Save corrections, what you like and what the project should solve. The next AI generation will use this feedback.", "Enregistrez vos corrections, vos préférences et le besoin à résoudre. La prochaine génération IA utilisera ces retours.")}</p><label for="projectRating">${tr("How useful is this direction?", "Cette direction est-elle utile ?")}</label><select id="projectRating" name="rating">${[5, 4, 3, 2, 1].map(n => `<option value="${n}"${state.rating === String(n) ? " selected" : ""}>${n}/5 · ${n >= 4 ? tr("Useful", "Utile") : tr("Needs improvement", "À améliorer")}</option>`).join("")}</select><label for="projectFeedbackBody">${tr("Feedback / project notes", "Retours / notes du projet")}</label><textarea id="projectFeedbackBody" name="body" maxlength="4000" required rows="5" placeholder="${tr("Example: focus on appointment booking, use French copy, simplify the hero…", "Exemple : privilégier la réservation, écrire en français, simplifier le hero…")}">${esc(state.draft)}</textarea><small>${state.draft.length}/4000 · ${version ? tr("Linked to selected saved version", "Lié à la version sélectionnée") : tr("Lead-level project note", "Note du projet liée au lead")}</small><button class="button" type="submit" ${state.busy ? "disabled" : ""}>${svg("feedback")}${state.busy ? tr("Saving…", "Enregistrement…") : tr("Save feedback", "Enregistrer le retour")}</button></form><div class="project-feedback-history"><h3>${tr("Saved feedback", "Retours enregistrés")}</h3>${state.data.feedback.length ? state.data.feedback.map(item => `<article><header><strong>${Number(item.rating)}/5</strong><time>${esc(date(item.created_at))}</time></header><p>${esc(item.body)}</p></article>`).join("") : `<p>${tr("No feedback yet. Add your first project note.", "Aucun retour. Ajoutez votre première note.")}</p>`}</div></div>`;
  }

  function render() {
    const host = document.getElementById("leadProjectWorkspace");
    if (!host || !state.lead || !location.hash.startsWith("#intelligence")) return;
    const focus = host.contains(document.activeElement) ? { id: document.activeElement.id, start: document.activeElement.selectionStart, end: document.activeElement.selectionEnd } : null;
    const job = state.data?.generations?.find(active);
    const failed = state.data?.generations?.find(g => g.status === "failed");
    const tabs = [["solution", tr("Problems & solutions", "Problèmes & solutions"), "spark"], ["mockup", tr("Mockup", "Maquette"), "layout"], ["contact", tr("Contact lead", "Contacter le lead"), "chat"], ["feedback", tr("Feedback", "Retours"), "feedback"]];
    host.innerHTML = `<div class="project-workspace"><header class="project-header"><div><span class="eyebrow">${tr("PROJECT WORKSPACE", "ESPACE PROJET")}</span><h2>${tr("From insight to a useful proposal", "De l’analyse à une proposition utile")}</h2><p>${tr("Build the solution. Show the idea. Start the conversation.", "Construisez la solution. Présentez l’idée. Engagez la conversation.")}</p></div><div class="project-actions">${action("generate-solution", tr("Generate solutions", "Générer des solutions"), "spark", false)}${action("generate-mockup", tr("Generate mockup", "Générer une maquette"), "layout")}${action("tab-feedback", tr("Add feedback", "Ajouter un retour"), "feedback")}</div></header>${state.loading ? `<div class="intel-loading"><span></span><p>${tr("Loading saved project…", "Chargement du projet…")}</p></div>` : `${state.error ? `<div class="project-alert" role="alert">${esc(state.error)} ${action("refresh", tr("Reconnect", "Reconnecter"))}</div>` : ""}${state.message ? `<p class="project-saved" role="status">✓ ${esc(state.message)}</p>` : ""}${job ? `<div class="project-progress" role="status"><span class="project-spinner" aria-hidden="true"></span><div><strong>${job.kind === "mockup" ? tr("Designing your mockup…", "Création de la maquette…") : tr("Building your solution plan…", "Création du plan de solutions…")}</strong><p>${tr("The backend is working. Saved versions stay available below.", "Le backend travaille. Vos versions enregistrées restent disponibles.")}</p></div><span>${tr("In progress", "En cours")}</span></div>` : failed ? `<div class="project-inline-note">${esc(failed.error || tr("Last generation failed; previous versions are still saved.", "La dernière génération a échoué ; les versions précédentes sont conservées."))}</div>` : ""}${state.data ? `<nav class="project-tabs" aria-label="${tr("Project sections", "Sections du projet")}">${tabs.map(([key, label, name]) => `<button type="button" data-project-action="tab-${key}" aria-pressed="${state.tab === key}">${svg(name)}${esc(label)}${key === "feedback" ? `<small>${state.data.feedback.length}</small>` : ""}</button>`).join("")}</nav><div class="project-content">${state.tab === "solution" ? solution() : state.tab === "mockup" ? mockup() : state.tab === "contact" ? contacts() : feedback()}</div>` : ""}`}</div>`;
    const links = contactLinks();
    if (links.whatsapp || links.email) {
      const quick = document.createElement("div"); quick.className = "project-quick-contact";
      quick.innerHTML = `${links.whatsapp ? `<a href="${esc(links.whatsapp)}" target="_blank" rel="noopener noreferrer">${svg("chat")}WhatsApp ↗</a>` : ""}${links.email ? `<a href="${esc(links.email)}">${svg("mail")}${tr("Email lead", "Contacter par email")}</a>` : ""}`;
      host.querySelector(".project-header>div")?.append(quick);
    }
    if (focus?.id) {
      const field = document.getElementById(focus.id); field?.focus({ preventScroll: true });
      if (field?.setSelectionRange && focus.start != null) field.setSelectionRange(focus.start, focus.end);
    }
  }

  let modalFocus;
  function close() { document.body.classList.remove("modal-open"); document.getElementById("appModal").setAttribute("aria-hidden", "true"); modalFocus?.isConnected && modalFocus.focus(); }
  function generateDialog(kind) {
    modalFocus = document.activeElement;
    const modal = document.getElementById("appModal");
    const busy = state.data?.generations?.some(active);
    modal.innerHTML = `<div class="modal-header"><div><p class="eyebrow">${tr("AI PROJECT ASSISTANT", "ASSISTANT PROJET IA")}</p><h2 id="modalTitle">${kind === "mockup" ? tr("Generate a visual mockup", "Générer une maquette visuelle") : tr("Generate a solution plan", "Générer un plan de solutions")}</h2></div><button class="close-button" type="button" data-project-action="close" aria-label="${tr("Close", "Fermer")}">×</button></div><div class="modal-body"><form id="projectGenerateForm" data-kind="${kind}"><p>${tr("Uses the saved research and your latest feedback. Results are saved with this lead.", "Utilise la recherche enregistrée et vos derniers retours. Les résultats seront liés à ce lead.")}</p><label class="form-field"><span>${tr("Project brief (optional)", "Brief du projet (facultatif)")}</span><textarea name="brief" maxlength="3000" rows="4" placeholder="${tr("Goal, audience, services, tone, design preferences…", "Objectif, cible, services, ton, préférences visuelles…")}"></textarea></label><label class="form-field"><span>${tr("Output language", "Langue du résultat")}</span><select name="locale"><option value="fr"${fr() ? " selected" : ""}>Français</option><option value="en"${fr() ? "" : " selected"}>English</option></select></label><label class="project-cost"><input type="checkbox" name="confirmCost" required><span>${tr("Generate using my OpenAI API credit. Includes saved research and project feedback.", "Générer avec mon crédit API OpenAI. Inclut la recherche et les retours du projet.")}</span></label><p id="projectGenerateError" role="alert"></p><div class="modal-actions"><button class="button button-secondary" type="button" data-project-action="close">${tr("Cancel", "Annuler")}</button><button class="button" type="submit" ${busy ? "disabled" : ""}>${svg("spark")}${busy ? tr("A generation is running", "Une génération est en cours") : tr("Generate & save", "Générer et enregistrer")}</button></div></form></div>`;
    state.request = crypto.randomUUID();
    modal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
    modal.querySelector("textarea").focus();
  }
  function download(name, data, type) {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const link = document.createElement("a"); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function planText() {
    const p = selected("solution")?.output;
    return p ? `${p.title}\n\n${p.summary}\n\n${p.problems.map(item => `PROBLEM: ${item.problem}\nSOLUTION: ${item.solution}\nSERVICE: ${item.service}\n${item.assumption ? "Assumption to confirm\n" : ""}${item.evidence_url}`).join("\n\n")}\n\nNEXT STEPS\n${p.next_steps.join("\n")}\n\nQUESTIONS\n${p.questions.join("\n")}\n\n${p.sales_approach}` : "";
  }
  async function click(event) {
    const button = event.target.closest("[data-project-action]");
    if (!button) return;
    const name = button.dataset.projectAction;
    if (name.startsWith("tab-")) {
      if (name === "tab-feedback") state.feedbackVersion = selected(state.tab)?.id || null;
      state.tab = name.slice(4); state.message = ""; render(); return;
    }
    if (name.startsWith("generate-")) { generateDialog(name.slice(9)); return; }
    if (name === "close") return close();
    if (name === "refresh") return refresh(true);
    if (name.startsWith("device-")) { state.device = name.slice(7); render(); return; }
    if (name === "download-plan") return download("solution-plan.txt", planText(), "text/plain;charset=utf-8");
    if (name === "download-mockup" && selected("mockup")) {
      const css = await fetch("/crm/assets/crm-project.css").then(r => { if (!r.ok) throw new Error("Cannot load mockup styles."); return r.text(); }).catch(() => null);
      if (!css) { state.message = tr("Download unavailable. Please try again.", "Téléchargement indisponible. Réessayez."); render(); return; }
      download("landing-page-concept.html", `<!doctype html><html lang="${selected("mockup").locale || "fr"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; base-uri 'none'; form-action 'none'"><title>Proposed landing-page concept</title><style>body{margin:0;padding:24px;font:16px/1.6 system-ui;background:#eef2f8;color:#111827}*{box-sizing:border-box}svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8}${css}</style>${mockupMarkup(selected("mockup").output)}</html>`, "text/html;charset=utf-8"); return;
    }
    if (name.startsWith("copy-")) {
      const p = selected("solution")?.output;
      try { await navigator.clipboard.writeText(name === "copy-whatsapp" ? p.whatsapp : `${p.email_subject}\n\n${p.email_body}`); state.message = tr("Draft copied. Review it before sending.", "Brouillon copié. Relisez-le avant l’envoi."); }
      catch { state.message = tr("Copy unavailable. Select the visible draft and copy it.", "Copie indisponible. Sélectionnez et copiez le texte affiché."); }
      render();
    }
  }
  document.addEventListener("click", click);
  document.addEventListener("input", event => { if (event.target.id === "projectFeedbackBody") { state.draft = event.target.value; const count = event.target.nextElementSibling; if (count) count.textContent = `${state.draft.length}/4000`; } });
  document.addEventListener("change", event => {
    if (event.target.id === "projectRating") state.rating = event.target.value;
    if (event.target.dataset.projectVersion) { state.selected[event.target.dataset.projectVersion] = event.target.value; render(); }
  });
  document.addEventListener("submit", async event => {
    const form = event.target;
    if (!["projectFeedbackForm", "projectGenerateForm"].includes(form.id)) return;
    event.preventDefault();
    if (state.busy) return;
    const leadId = state.lead.id; state.busy = true;
    try {
      if (form.id === "projectFeedbackForm") {
        render();
        await api("POST", { action: "feedback", rating: Number(state.rating), body: state.draft, generationId: state.feedbackVersion }, false, leadId);
        if (state.lead.id !== leadId) return;
        state.draft = ""; state.message = tr("Feedback saved. It will guide the next generation.", "Retour enregistré. Il guidera la prochaine génération.");
      } else {
        const data = new FormData(form);
        form.querySelector('[type="submit"]').disabled = true;
        const response = await api("POST", { action: "generate", kind: form.dataset.kind, brief: data.get("brief") || "", locale: data.get("locale"), requestId: state.request, confirmCost: data.has("confirmCost") }, false, leadId);
        if (state.lead.id !== leadId) return;
        state.selected[response.generation.kind] = response.generation.id;
        state.tab = form.dataset.kind; close();
      }
      await refresh(true);
    } catch (error) {
      if (state.lead.id !== leadId) return;
      const field = document.getElementById("projectGenerateError");
      if (form.id === "projectGenerateForm" && field) { field.textContent = error.message; form.querySelector('[type="submit"]').disabled = false; }
      else state.error = error.message;
    } finally { if (state.lead.id === leadId) { state.busy = false; render(); } }
  });
  window.CrmProject = {
    mount(lead) {
      if (state.lead?.id === lead.id) { state.lead = lead; render(); return; }
      clearTimeout(state.timer); state.lead = lead; state.data = null; state.error = ""; state.loading = true; state.tab = "solution"; state.selected = {}; state.feedbackVersion = null; state.draft = ""; state.message = ""; state.busy = false; render(); refresh(true);
    },
  };
})();
