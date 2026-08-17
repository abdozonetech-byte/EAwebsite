(() => {
  "use strict";

  const DATA_KEY = "elboubakry-crm-demo-data-v3";
  const LANG_KEY = "elboubakry-crm-language";
  const VALID_VIEWS = new Set(["dashboard", "leads", "appointments", "calendar", "settings"]);
  const STATUS_ORDER = ["new", "contacted", "follow_up", "appointment", "no_show", "won", "lost"];
  const PRIORITIES = ["low", "normal", "high"];
  const SECTORS = [
    "Santé / Cabinet médical",
    "Éducation / Formation",
    "E-commerce / Vente en ligne",
    "Immobilier",
    "Services locaux",
    "Restaurant / Café",
    "Application / Startup",
    "Marque personnelle",
    "Autre",
  ];
  const SOURCES = ["Diagnostic site", "WhatsApp", "Google Ads", "Referral", "Ajout manuel"];

  const SECTOR_EN = {
    "Santé / Cabinet médical": "Healthcare / Medical practice",
    "Éducation / Formation": "Education / Training",
    "E-commerce / Vente en ligne": "E-commerce / Online sales",
    Immobilier: "Real estate",
    "Services locaux": "Local services",
    "Restaurant / Café": "Restaurant / Cafe",
    "Application / Startup": "App / Startup",
    "Marque personnelle": "Personal brand",
    Autre: "Other",
  };
  const SOURCE_LABELS = {
    "Ajout manuel": { en: "Manual entry", fr: "Ajout manuel" },
    "Diagnostic site": { en: "Website diagnostic", fr: "Diagnostic site" },
    WhatsApp: { en: "WhatsApp", fr: "WhatsApp" },
    "Google Ads": { en: "Google Ads", fr: "Google Ads" },
    Referral: { en: "Referral", fr: "Recommandation" },
  };

  const strings = {
    en: {
      workspace: "WORKSPACE", dashboard: "Dashboard", leads: "Leads", appointments: "Appointments", calendar: "Calendar", settings: "Settings", administrator: "Administrator", logout: "Log out", search: "Search leads, companies, cities...", demoData: "Demo data",
      commandCenter: "LEAD COMMAND CENTER", greeting: "Good afternoon, Abdessamad.", dashboardSubtitle: "Here is what needs attention across your client pipeline.", newLead: "+ New lead", reset: "Reset demo",
      totalLeads: "Total leads", totalHelp: "All received leads", new: "New", newHelp: "Requests to qualify", contacted: "Contacted", contactedHelp: "Clients contacted", followUp: "Follow up", followUpHelp: "Follow-ups to plan", appointment: "Appointment", appointmentHelp: "Lead has an appointment", noShow: "No-show", noShowHelp: "Missed appointments", won: "Won clients", wonHelp: "Final conversions", lost: "Not interested", lostHelp: "Closed / lost", today: "Today", todayHelp: "Appointments today", ofLeads: "of leads",
      priorities: "PRIORITIES", handleNow: "Handle now", newToQualify: "New lead to qualify", followUpAction: "Follow-up due", highPriority: "High-priority opportunity", agenda: "AGENDA", upcomingAppointments: "Upcoming appointments", schedule: "+ Schedule", recent: "RECENT ACTIVITY", latestLeads: "Latest website leads", viewAll: "View all",
      leadsEyebrow: "PIPELINE", leadsTitle: "Lead management", leadsDescription: "Search, qualify and follow every website opportunity from one place.", filters: "Filters", allStatuses: "All statuses", allSectors: "All sectors", allSources: "All sources", clear: "Clear", results: "results", lead: "Lead", contact: "Contact", sector: "Sector", source: "Source", status: "Status", priority: "Priority", created: "Created", noLeads: "No leads found", noLeadsText: "Change the filters or add a new lead.",
      appointmentsEyebrow: "FOLLOW-UP", appointmentsTitle: "Appointments", appointmentsDescription: "Keep diagnostics, follow-ups and client meetings attached to the right lead.", scheduleAppointment: "+ Schedule appointment", dateTime: "Date & time", appointmentTitle: "Appointment", client: "Lead / client", notes: "Notes", scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled", markComplete: "Complete", noAppointments: "No appointments yet", noAppointmentsText: "Schedule the first appointment for a lead.",
      calendarEyebrow: "PLANNING", calendarTitle: "Calendar", calendarDescription: "See scheduled client activity across the month.", previous: "Previous", next: "Next", goToday: "Today",
      settingsEyebrow: "WORKSPACE", settingsTitle: "Settings", settingsDescription: "CRM language, data mode, integration status and local demo controls.", interface: "Interface", language: "Language", officialLanguage: "Official language", english: "English", french: "French", languageHelp: "English is the official CRM language. French is available at any time.", dataAndIntegration: "Data & integration", dataMode: "Data mode", localDemo: "Local demo repository", supabase: "Supabase", notConnected: "Not connected yet", websiteFlow: "Website lead flow", pending: "Next phase", security: "Security", cloudflareAuth: "Cloudflare authentication", serverProtected: "Server protected", session: "Session", sessionHelp: "24-hour signed HttpOnly cookie", demoControls: "Demo controls", demoControlsText: "Reset only browser-local CRM demo records. Public website content is never affected.", resetDemoData: "Reset demo data",
      leadProfile: "LEAD PROFILE", leadInfo: "Lead information", phone: "Phone", email: "Email", company: "Company", city: "City", message: "Message", actions: "Quick actions", whatsapp: "WhatsApp", call: "Call", emailAction: "Email", leadState: "Lead state", leadNotes: "Notes & activity", addNote: "Add note", notePlaceholder: "Add a private follow-up note...", noNotes: "No notes for this lead yet.", attribution: "Diagnostic attribution", landing: "Landing page", referrer: "Referrer", utmSource: "UTM source", utmMedium: "UTM medium", utmCampaign: "UTM campaign", close: "Close",
      addLeadTitle: "Add a new lead", addLeadEyebrow: "MANUAL ENTRY", fullName: "Full name", businessSector: "Business sector", optional: "optional", saveLead: "Save lead", cancel: "Cancel", phoneExample: "06 12 34 56 78", companyPlaceholder: "Company / brand", cityPlaceholder: "Casablanca", messagePlaceholder: "Project context or lead request...", chooseSector: "Choose a sector", chooseSource: "Choose a source",
      addAppointmentTitle: "Schedule appointment", appointmentEyebrow: "CLIENT FOLLOW-UP", chooseLead: "Choose a lead", startsAt: "Starts at", titlePlaceholder: "Acquisition diagnostic", appointmentNotesPlaceholder: "Meeting objective or preparation notes...", saveAppointment: "Save appointment",
      validationName: "Enter at least 2 characters.", validationPhone: "Enter a valid Moroccan mobile number.", validationEmail: "Enter a valid email address.", validationSector: "Choose a business sector.", validationLead: "Choose a lead.", validationAppointmentTitle: "Enter an appointment title.", validationAppointmentDate: "Choose a valid date and time.",
      saved: "Saved.", leadAdded: "Lead added to the local demo repository.", appointmentAdded: "Appointment scheduled.", noteAdded: "Note added.", statusUpdated: "Lead status updated.", priorityUpdated: "Lead priority updated.", appointmentCompleted: "Appointment marked as completed.", demoReset: "Demo data reset.", signedOut: "Signed out.", logoutFailed: "Could not contact the logout endpoint. Redirecting to login.",
      low: "Low", normal: "Normal", high: "High", websiteDiagnostic: "Website diagnostic", manualEntry: "Manual entry", referral: "Referral",
      sourceDiagnostic: "Website diagnostic", sourceManual: "Manual entry", sourceReferral: "Referral",
    },
    fr: {
      workspace: "ESPACE DE TRAVAIL", dashboard: "Tableau de bord", leads: "Leads", appointments: "Rendez-vous", calendar: "Calendrier", settings: "Paramètres", administrator: "Administrateur", logout: "Déconnexion", search: "Rechercher leads, entreprises, villes...", demoData: "Données démo",
      commandCenter: "CENTRE DE PILOTAGE LEADS", greeting: "Bonjour, Abdessamad.", dashboardSubtitle: "Voici ce qui demande votre attention dans le pipeline clients.", newLead: "+ Nouveau lead", reset: "Réinitialiser la démo",
      totalLeads: "Total leads", totalHelp: "Tous les leads reçus", new: "Nouveaux", newHelp: "Demandes à qualifier", contacted: "Contactés", contactedHelp: "Clients contactés", followUp: "À relancer", followUpHelp: "Relances à planifier", appointment: "Rendez-vous", appointmentHelp: "Lead avec rendez-vous", noShow: "No-show", noShowHelp: "Rendez-vous manqués", won: "Clients finaux", wonHelp: "Conversions finales", lost: "Non intéressés", lostHelp: "Clôturés / perdus", today: "Aujourd'hui", todayHelp: "Rendez-vous aujourd'hui", ofLeads: "des leads",
      priorities: "PRIORITÉS", handleNow: "À traiter maintenant", newToQualify: "Nouveau lead à qualifier", followUpAction: "Relance à effectuer", highPriority: "Opportunité prioritaire", agenda: "AGENDA", upcomingAppointments: "Prochains rendez-vous", schedule: "+ Planifier", recent: "ACTIVITÉ RÉCENTE", latestLeads: "Derniers leads du site", viewAll: "Voir tout",
      leadsEyebrow: "PIPELINE", leadsTitle: "Gestion des leads", leadsDescription: "Recherchez, qualifiez et suivez chaque opportunité du site depuis un seul espace.", filters: "Filtres", allStatuses: "Tous les statuts", allSectors: "Tous les secteurs", allSources: "Toutes les sources", clear: "Effacer", results: "résultats", lead: "Lead", contact: "Contact", sector: "Secteur", source: "Source", status: "Statut", priority: "Priorité", created: "Créé le", noLeads: "Aucun lead trouvé", noLeadsText: "Modifiez les filtres ou ajoutez un nouveau lead.",
      appointmentsEyebrow: "SUIVI", appointmentsTitle: "Rendez-vous", appointmentsDescription: "Gardez les diagnostics, relances et réunions liés au bon lead.", scheduleAppointment: "+ Planifier un rendez-vous", dateTime: "Date et heure", appointmentTitle: "Rendez-vous", client: "Lead / client", notes: "Notes", scheduled: "Planifié", completed: "Terminé", cancelled: "Annulé", markComplete: "Terminer", noAppointments: "Aucun rendez-vous", noAppointmentsText: "Planifiez le premier rendez-vous pour un lead.",
      calendarEyebrow: "PLANIFICATION", calendarTitle: "Calendrier", calendarDescription: "Visualisez l'activité client planifiée sur le mois.", previous: "Précédent", next: "Suivant", goToday: "Aujourd'hui",
      settingsEyebrow: "ESPACE", settingsTitle: "Paramètres", settingsDescription: "Langue du CRM, mode de données, état des intégrations et contrôles de démo.", interface: "Interface", language: "Langue", officialLanguage: "Langue officielle", english: "Anglais", french: "Français", languageHelp: "L'anglais est la langue officielle du CRM. Le français reste disponible à tout moment.", dataAndIntegration: "Données et intégrations", dataMode: "Mode de données", localDemo: "Référentiel démo local", supabase: "Supabase", notConnected: "Pas encore connecté", websiteFlow: "Flux de leads du site", pending: "Prochaine phase", security: "Sécurité", cloudflareAuth: "Authentification Cloudflare", serverProtected: "Protégé côté serveur", session: "Session", sessionHelp: "Cookie HttpOnly signé valable 24 heures", demoControls: "Contrôles démo", demoControlsText: "Réinitialise uniquement les données CRM locales du navigateur. Le site public n'est jamais modifié.", resetDemoData: "Réinitialiser les données démo",
      leadProfile: "FICHE LEAD", leadInfo: "Informations du lead", phone: "Téléphone", email: "Email", company: "Entreprise", city: "Ville", message: "Message", actions: "Actions rapides", whatsapp: "WhatsApp", call: "Appeler", emailAction: "Email", leadState: "État du lead", leadNotes: "Notes et activité", addNote: "Ajouter la note", notePlaceholder: "Ajouter une note privée de suivi...", noNotes: "Aucune note pour ce lead.", attribution: "Attribution du diagnostic", landing: "Page d'arrivée", referrer: "Référent", utmSource: "UTM source", utmMedium: "UTM medium", utmCampaign: "UTM campagne", close: "Fermer",
      addLeadTitle: "Ajouter un nouveau lead", addLeadEyebrow: "AJOUT MANUEL", fullName: "Nom complet", businessSector: "Secteur d'activité", optional: "optionnel", saveLead: "Enregistrer le lead", cancel: "Annuler", phoneExample: "06 12 34 56 78", companyPlaceholder: "Entreprise / marque", cityPlaceholder: "Casablanca", messagePlaceholder: "Contexte du projet ou demande du lead...", chooseSector: "Choisissez un secteur", chooseSource: "Choisissez une source",
      addAppointmentTitle: "Planifier un rendez-vous", appointmentEyebrow: "SUIVI CLIENT", chooseLead: "Choisissez un lead", startsAt: "Début", titlePlaceholder: "Diagnostic acquisition", appointmentNotesPlaceholder: "Objectif de la réunion ou notes de préparation...", saveAppointment: "Enregistrer le rendez-vous",
      validationName: "Saisissez au moins 2 caractères.", validationPhone: "Saisissez un numéro mobile marocain valide.", validationEmail: "Saisissez une adresse email valide.", validationSector: "Choisissez un secteur d'activité.", validationLead: "Choisissez un lead.", validationAppointmentTitle: "Saisissez un titre de rendez-vous.", validationAppointmentDate: "Choisissez une date et une heure valides.",
      saved: "Enregistré.", leadAdded: "Lead ajouté au référentiel démo local.", appointmentAdded: "Rendez-vous planifié.", noteAdded: "Note ajoutée.", statusUpdated: "Statut du lead mis à jour.", priorityUpdated: "Priorité du lead mise à jour.", appointmentCompleted: "Rendez-vous marqué comme terminé.", demoReset: "Données démo réinitialisées.", signedOut: "Déconnexion effectuée.", logoutFailed: "Impossible de contacter le point de déconnexion. Redirection vers la connexion.",
      low: "Faible", normal: "Normale", high: "Haute", websiteDiagnostic: "Diagnostic site", manualEntry: "Ajout manuel", referral: "Recommandation",
      sourceDiagnostic: "Diagnostic site", sourceManual: "Ajout manuel", sourceReferral: "Recommandation",
    },
  };

  let locale = localStorage.getItem(LANG_KEY) === "fr" ? "fr" : "en";
  let currentView = VALID_VIEWS.has(location.hash.slice(1)) ? location.hash.slice(1) : "dashboard";
  let currentCalendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let filters = { query: "", status: "all", sector: "all", source: "all" };
  let state = loadState();
  let toastTimer = null;
  let lastFocused = null;

  const content = document.getElementById("appContent");
  const toast = document.getElementById("toast");
  const drawer = document.getElementById("leadDrawer");
  const modal = document.getElementById("appModal");
  const globalSearch = document.getElementById("globalSearch");

  function t(key) { return strings[locale]?.[key] || strings.en[key] || key; }
  function esc(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
  function uid(prefix) { return `${prefix}-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`; }
  function pad(value) { return String(value).padStart(2, "0"); }
  function localDateTimeValue(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
  function isoAt(dayOffset, hour, minute = 0) { const now = new Date(); const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, minute, 0, 0); return date.toISOString(); }
  function localeCode() { return locale === "fr" ? "fr-FR" : "en-GB"; }
  function formatDate(value) { return new Intl.DateTimeFormat(localeCode(), { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)); }
  function formatDateTime(value) { return new Intl.DateTimeFormat(localeCode(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
  function formatPhone(value) { const digits = String(value || "").replace(/\D/g, ""); return digits.startsWith("212") && digits.length >= 12 ? `+212 ${digits.slice(3, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}` : value; }
  function normalizePhone(value) { const digits = String(value || "").replace(/\D/g, ""); if (digits.startsWith("212")) return digits; if (digits.startsWith("0") && digits.length >= 10) return `212${digits.slice(1)}`; return digits; }
  function statusLabel(value) { const labels = { en: { new: "New", contacted: "Contacted", follow_up: "Follow up", appointment: "Appointment", no_show: "No-show", won: "Won", lost: "Not interested" }, fr: { new: "Nouveau", contacted: "Contacté", follow_up: "À relancer", appointment: "Rendez-vous", no_show: "No-show", won: "Client final", lost: "Non intéressé" } }; return labels[locale][value] || value; }
  function appointmentStatusLabel(value) { return value === "scheduled" ? t("scheduled") : value === "completed" ? t("completed") : t("cancelled"); }
  function priorityLabel(value) { return value === "low" ? t("low") : value === "high" ? t("high") : t("normal"); }
  function sectorLabel(value) { return locale === "fr" ? value : (SECTOR_EN[value] || value); }
  function sourceLabel(value) { return SOURCE_LABELS[value]?.[locale] || value; }
  function dayKey(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }

  function createDemoData() {
    const fixtures = [
      ["lead-demo-01", "Yasmine Alaoui", "212600000001", "yasmine@example.com", "Atelier Yasmine - Demo", "Casablanca", "E-commerce / Vente en ligne", "new", "high", "Diagnostic site", 0, "Souhaite clarifier les priorités Meta Ads et conversion."],
      ["lead-demo-02", "Omar Bennani", "212600000002", "omar@example.com", "Cabinet Bennani - Demo", "Rabat", "Santé / Cabinet médical", "follow_up", "high", "Diagnostic site", -1, "Premier contact effectué. Relance demandée."],
      ["lead-demo-03", "Salma Idrissi", "212600000003", "salma@example.com", "FormaLab - Demo", "Casablanca", "Éducation / Formation", "contacted", "normal", "Diagnostic site", -2, "Besoin d'améliorer l'acquisition de nouveaux apprenants."],
      ["lead-demo-04", "Nabil Tazi", "212600000004", "", "Tazi Immobilier - Demo", "Marrakech", "Immobilier", "appointment", "high", "WhatsApp", -3, "Diagnostic acquisition et conversion."],
      ["lead-demo-05", "Imane Rachidi", "212600000005", "imane@example.com", "Studio Imane - Demo", "Agadir", "Marque personnelle", "won", "normal", "Diagnostic site", -7, "Projet confirmé comme client final."],
      ["lead-demo-06", "Anas El Fassi", "212600000006", "", "Local Services - Demo", "Fès", "Services locaux", "no_show", "normal", "Referral", -5, "Relance à planifier après no-show."],
      ["lead-demo-07", "Meriem Amrani", "212600000007", "meriem@example.com", "Cafe Atlas - Demo", "Casablanca", "Restaurant / Café", "lost", "low", "Diagnostic site", -10, "Pas de priorité immédiate."],
      ["lead-demo-08", "Hamza Chraibi", "212600000008", "hamza@example.com", "SaaS Maroc - Demo", "Rabat", "Application / Startup", "new", "normal", "Google Ads", 0, "Recherche un plan d'acquisition B2B."],
      ["lead-demo-09", "Lina Berrada", "212600000009", "lina@example.com", "Académie Lina - Demo", "Casablanca", "Éducation / Formation", "follow_up", "normal", "Diagnostic site", -4, "Relance dans deux jours."],
    ];
    const leads = fixtures.map((item) => {
      const createdAt = isoAt(item[10], 9 + Math.abs(item[10] % 6));
      return { id: item[0], fullName: item[1], phone: item[2], email: item[3], company: item[4], city: item[5], businessSector: item[6], status: item[7], priority: item[8], source: item[9], message: item[11], createdAt, updatedAt: createdAt, utmSource: item[9] === "Google Ads" ? "google" : item[9] === "Diagnostic site" ? "website" : "", utmMedium: item[9] === "Google Ads" ? "cpc" : item[9] === "Diagnostic site" ? "organic" : "", utmCampaign: item[9] === "Google Ads" ? "diagnostic-marketing-demo" : "", landingPageUrl: item[9] === "Diagnostic site" ? "https://elboubakry.com/reserver-diagnostic/" : "", referrer: item[9] === "Diagnostic site" ? "https://elboubakry.com/" : "" };
    });
    const notes = [
      { id: "note-demo-1", leadId: "lead-demo-02", body: "Premier appel effectué. Relance demandée après validation interne.", createdAt: isoAt(-1, 16) },
      { id: "note-demo-2", leadId: "lead-demo-04", body: "Diagnostic confirmé. Rendez-vous de cadrage planifié.", createdAt: isoAt(-2, 14) },
      { id: "note-demo-3", leadId: "lead-demo-05", body: "Projet confirmé en client final. Données fictives de démonstration.", createdAt: isoAt(-6, 10) },
    ];
    const appointments = [
      { id: "appointment-demo-1", leadId: "lead-demo-04", title: "Diagnostic acquisition", startsAt: isoAt(0, 15, 30), status: "scheduled", notes: "Revoir acquisition, conversion et mesure.", createdAt: isoAt(-2, 14) },
      { id: "appointment-demo-2", leadId: "lead-demo-06", title: "Relance après no-show", startsAt: isoAt(1, 10, 0), status: "scheduled", notes: "", createdAt: isoAt(0, 9) },
      { id: "appointment-demo-3", leadId: "lead-demo-05", title: "Point de lancement", startsAt: isoAt(-4, 11, 0), status: "completed", notes: "", createdAt: isoAt(-7, 12) },
    ];
    return { version: 3, leads, notes, appointments };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DATA_KEY) || "null");
      if (parsed?.version === 3 && Array.isArray(parsed.leads) && Array.isArray(parsed.notes) && Array.isArray(parsed.appointments)) return parsed;
    } catch {}
    const demo = createDemoData();
    localStorage.setItem(DATA_KEY, JSON.stringify(demo));
    return demo;
  }
  function saveState() { localStorage.setItem(DATA_KEY, JSON.stringify(state)); }
  function resetDemo() { state = createDemoData(); saveState(); filters = { query: "", status: "all", sector: "all", source: "all" }; globalSearch.value = ""; render(); showToast(t("demoReset")); }

  function metrics() {
    const today = dayKey(new Date());
    return {
      total: state.leads.length,
      new: state.leads.filter((lead) => lead.status === "new").length,
      contacted: state.leads.filter((lead) => lead.status === "contacted").length,
      followUp: state.leads.filter((lead) => lead.status === "follow_up").length,
      appointment: state.leads.filter((lead) => lead.status === "appointment").length,
      noShow: state.leads.filter((lead) => lead.status === "no_show").length,
      won: state.leads.filter((lead) => lead.status === "won").length,
      lost: state.leads.filter((lead) => lead.status === "lost").length,
      today: state.appointments.filter((item) => item.status === "scheduled" && dayKey(new Date(item.startsAt)) === today).length,
    };
  }

  function sortedLeads() { return [...state.leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
  function getLead(id) { return state.leads.find((lead) => lead.id === id); }
  function getLeadNotes(id) { return state.notes.filter((note) => note.leadId === id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); }
  function getLeadAppointments(id) { return state.appointments.filter((item) => item.leadId === id).sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt)); }

  function statusChip(status) { return `<span class="status-chip status-${esc(status)}">${esc(statusLabel(status))}</span>`; }
  function priorityChip(priority) { return `<span class="priority-chip priority-${esc(priority)}">${esc(priorityLabel(priority))}</span>`; }
  function metricCard(value, label, helper, tone, pct) { return `<article class="metric-card tone-${tone}"><div class="metric-top"><b>${value}</b><span class="metric-icon">${esc(label.slice(0, 1))}</span></div><h2>${esc(label)}</h2><p>${esc(helper)}</p><span class="metric-progress" style="--pct:${Math.max(0, Math.min(100, pct))}"></span></article>`; }

  function renderDashboard() {
    const m = metrics();
    const pct = (value) => m.total ? Math.round((value / m.total) * 100) : 0;
    const attention = [...state.leads].filter((lead) => lead.status === "new" || lead.status === "follow_up" || lead.priority === "high").sort((a, b) => (a.priority === "high" ? -1 : 0) - (b.priority === "high" ? -1 : 0) || new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
    const upcoming = [...state.appointments].filter((item) => item.status === "scheduled" && new Date(item.startsAt) >= new Date(Date.now() - 86400000)).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)).slice(0, 3);
    const recent = sortedLeads().slice(0, 5);
    const dateLabel = new Intl.DateTimeFormat(localeCode(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

    return `<div class="page-stack">
      <section class="dashboard-hero"><div><p class="hero-kicker">${esc(t("commandCenter"))}</p><h1>${esc(t("greeting"))} <span aria-hidden="true">&#128075;</span></h1><p>${esc(t("dashboardSubtitle"))}</p><small>${esc(dateLabel)}</small></div><div class="hero-actions"><span class="mode-pill"><span class="live-dot"></span>${esc(t("demoData"))}</span><button class="button button-secondary" data-action="reset-demo" type="button">&#8635; ${esc(t("reset"))}</button><button class="button" data-action="add-lead" type="button">+ ${esc(t("newLead").replace(/^\+\s*/, ""))}</button></div></section>
      <section class="metric-grid" aria-label="Pipeline metrics">
        ${metricCard(m.total, t("totalLeads"), t("totalHelp"), "navy", 100)}
        ${metricCard(m.new, t("new"), t("newHelp"), "blue", pct(m.new))}
        ${metricCard(m.contacted, t("contacted"), t("contactedHelp"), "cyan", pct(m.contacted))}
        ${metricCard(m.followUp, t("followUp"), t("followUpHelp"), "amber", pct(m.followUp))}
        ${metricCard(m.appointment, t("appointment"), t("appointmentHelp"), "violet", pct(m.appointment))}
        ${metricCard(m.noShow, t("noShow"), t("noShowHelp"), "red", pct(m.noShow))}
        ${metricCard(m.won, t("won"), t("wonHelp"), "green", pct(m.won))}
        ${metricCard(m.lost, t("lost"), t("lostHelp"), "slate", pct(m.lost))}
        ${metricCard(m.today, t("today"), t("todayHelp"), "blue", m.appointment ? Math.round((m.today / Math.max(1, m.appointment)) * 100) : 0)}
      </section>
      <section class="dashboard-columns"><article class="panel"><div class="panel-header"><div><p class="eyebrow">${esc(t("priorities"))}</p><h2>${esc(t("handleNow"))}</h2></div><span class="count-pill">${attention.length}</span></div><div class="priority-list">${attention.map((lead) => `<button class="priority-row" type="button" data-lead-id="${esc(lead.id)}"><span class="priority-indicator ${lead.priority === "high" ? "high" : "normal"}"></span><span><strong>${esc(lead.fullName)}</strong><small>${esc(lead.status === "new" ? t("newToQualify") : lead.status === "follow_up" ? t("followUpAction") : t("highPriority"))}</small></span><em>${esc(lead.company || sectorLabel(lead.businessSector))}</em></button>`).join("")}</div></article>
        <article class="panel"><div class="panel-header"><div><p class="eyebrow">${esc(t("agenda"))}</p><h2>${esc(t("upcomingAppointments"))}</h2></div><button class="text-button" data-action="add-appointment" type="button">${esc(t("schedule"))}</button></div><div class="appointment-mini-list">${upcoming.length ? upcoming.map((item) => { const lead = getLead(item.leadId); const date = new Date(item.startsAt); return `<button class="appointment-mini-row" type="button" data-lead-id="${esc(item.leadId)}"><span class="appointment-date"><b>${pad(date.getDate())}</b><small>${esc(new Intl.DateTimeFormat(localeCode(), { month: "short" }).format(date))}</small></span><span><strong>${esc(item.title)}</strong><small>${esc(lead?.fullName || t("lead"))} - ${esc(formatDateTime(item.startsAt))}</small></span></button>`; }).join("") : `<div class="empty-state"><div class="empty-icon">A</div><h3>${esc(t("noAppointments"))}</h3><p>${esc(t("noAppointmentsText"))}</p></div>`}</div></article></section>
      <section class="panel"><div class="panel-header"><div><p class="eyebrow">${esc(t("recent"))}</p><h2>${esc(t("latestLeads"))}</h2></div><button class="text-button" type="button" data-view-link="leads">${esc(t("viewAll"))}</button></div>${renderLeadTable(recent, false)}</section>
    </div>`;
  }

  function filterLeads() {
    const query = filters.query.trim().toLowerCase();
    return sortedLeads().filter((lead) => {
      if (filters.status !== "all" && lead.status !== filters.status) return false;
      if (filters.sector !== "all" && lead.businessSector !== filters.sector) return false;
      if (filters.source !== "all" && lead.source !== filters.source) return false;
      if (!query) return true;
      return [lead.fullName, lead.phone, lead.email, lead.company, lead.city, lead.businessSector, sectorLabel(lead.businessSector), lead.source, sourceLabel(lead.source)].filter(Boolean).join(" ").toLowerCase().includes(query);
    });
  }

  function renderLeadTable(leads, includeCreated = true) {
    if (!leads.length) return `<div class="empty-state"><div class="empty-icon">L</div><h3>${esc(t("noLeads"))}</h3><p>${esc(t("noLeadsText"))}</p></div>`;
    return `<div class="table-wrap desktop-table"><table class="data-table"><thead><tr><th>${esc(t("lead"))}</th><th>${esc(t("contact"))}</th><th>${esc(t("sector"))}</th><th>${esc(t("source"))}</th><th>${esc(t("status"))}</th><th>${esc(t("priority"))}</th>${includeCreated ? `<th>${esc(t("created"))}</th>` : ""}</tr></thead><tbody>${leads.map((lead) => `<tr data-lead-id="${esc(lead.id)}"><td class="lead-name"><strong>${esc(lead.fullName)}</strong><small>${esc(lead.company || lead.city || "-")}</small></td><td><span class="nowrap">${esc(formatPhone(lead.phone))}</span><br><span class="muted">${esc(lead.email || "-")}</span></td><td>${esc(sectorLabel(lead.businessSector))}</td><td>${esc(sourceLabel(lead.source))}</td><td>${statusChip(lead.status)}</td><td>${priorityChip(lead.priority)}</td>${includeCreated ? `<td class="muted nowrap">${esc(formatDate(lead.createdAt))}</td>` : ""}</tr>`).join("")}</tbody></table></div><div class="lead-cards">${leads.map((lead) => `<button class="lead-card" type="button" data-lead-id="${esc(lead.id)}"><div class="lead-card-head"><div><h3>${esc(lead.fullName)}</h3><p>${esc(lead.company || sectorLabel(lead.businessSector))}</p></div>${statusChip(lead.status)}</div><div class="lead-card-meta"><div><small>${esc(t("phone"))}</small><strong>${esc(formatPhone(lead.phone))}</strong></div><div><small>${esc(t("priority"))}</small><strong>${esc(priorityLabel(lead.priority))}</strong></div><div><small>${esc(t("sector"))}</small><strong>${esc(sectorLabel(lead.businessSector))}</strong></div><div><small>${esc(t("source"))}</small><strong>${esc(sourceLabel(lead.source))}</strong></div></div></button>`).join("")}</div>`;
  }

  function renderLeads() {
    const leads = filterLeads();
    const sectorOptions = SECTORS.map((value) => `<option value="${esc(value)}" ${filters.sector === value ? "selected" : ""}>${esc(sectorLabel(value))}</option>`).join("");
    const sourceOptions = SOURCES.map((value) => `<option value="${esc(value)}" ${filters.source === value ? "selected" : ""}>${esc(sourceLabel(value))}</option>`).join("");
    return `<div class="page-stack"><section class="page-header"><div><p class="eyebrow">${esc(t("leadsEyebrow"))}</p><h1>${esc(t("leadsTitle"))}</h1><p>${esc(t("leadsDescription"))}</p></div><div class="header-actions"><button class="button" data-action="add-lead" type="button">+ ${esc(t("newLead").replace(/^\+\s*/, ""))}</button></div></section><section class="panel"><div class="data-toolbar"><label class="toolbar-search"><span>Q</span><input id="leadSearch" value="${esc(filters.query)}" placeholder="${esc(t("search"))}" autocomplete="off"></label><div class="filter-controls"><span class="filter-label">${esc(t("filters"))}</span><select id="statusFilter"><option value="all">${esc(t("allStatuses"))}</option>${STATUS_ORDER.map((value) => `<option value="${value}" ${filters.status === value ? "selected" : ""}>${esc(statusLabel(value))}</option>`).join("")}</select><select id="sectorFilter"><option value="all">${esc(t("allSectors"))}</option>${sectorOptions}</select><select id="sourceFilter"><option value="all">${esc(t("allSources"))}</option>${sourceOptions}</select><button class="button button-ghost button-sm" data-action="clear-filters" type="button">${esc(t("clear"))}</button></div></div><div class="panel-header"><div><p class="eyebrow">${esc(t("lead"))}</p><h2>${leads.length} ${esc(t("results"))}</h2></div><span class="count-pill">${leads.length}</span></div>${renderLeadTable(leads, true)}</section></div>`;
  }

  function renderAppointments() {
    const items = [...state.appointments].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return `<div class="page-stack"><section class="page-header"><div><p class="eyebrow">${esc(t("appointmentsEyebrow"))}</p><h1>${esc(t("appointmentsTitle"))}</h1><p>${esc(t("appointmentsDescription"))}</p></div><div class="header-actions"><button class="button" data-action="add-appointment" type="button">+ ${esc(t("scheduleAppointment").replace(/^\+\s*/, ""))}</button></div></section><section class="panel"><div class="panel-header"><div><p class="eyebrow">${esc(t("agenda"))}</p><h2>${items.length} ${esc(t("appointments"))}</h2></div><span class="count-pill">${items.length}</span></div>${items.length ? `<div class="appointment-list">${items.map((item) => { const lead = getLead(item.leadId); const date = new Date(item.startsAt); return `<div class="appointment-row"><div class="appointment-time"><strong>${pad(date.getHours())}:${pad(date.getMinutes())}</strong><small>${esc(formatDate(item.startsAt))}</small></div><div><h3>${esc(item.title)}</h3><p>${esc(item.notes || "-")}</p></div><div class="appointment-lead"><button class="text-button" type="button" data-lead-id="${esc(item.leadId)}">${esc(lead?.fullName || t("lead"))}</button></div><div class="appointment-status"><span class="status-chip ${item.status === "completed" ? "status-won" : item.status === "cancelled" ? "status-lost" : "status-appointment"}">${esc(appointmentStatusLabel(item.status))}</span></div><div class="appointment-actions">${item.status === "scheduled" ? `<button class="mini-action" data-action="complete-appointment" data-appointment-id="${esc(item.id)}" type="button">${esc(t("markComplete"))}</button>` : ""}</div></div>`; }).join("")}</div>` : `<div class="empty-state"><div class="empty-icon">A</div><h3>${esc(t("noAppointments"))}</h3><p>${esc(t("noAppointmentsText"))}</p></div>`}</section></div>`;
  }

  function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const first = new Date(year, month, 1);
    const weekStartsMonday = (first.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - weekStartsMonday);
    const weekdays = [];
    for (let index = 0; index < 7; index += 1) weekdays.push(new Intl.DateTimeFormat(localeCode(), { weekday: "short" }).format(new Date(2026, 0, 5 + index)));
    const days = [];
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
      const key = dayKey(date);
      const events = state.appointments.filter((item) => dayKey(new Date(item.startsAt)) === key).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
      days.push(`<div class="calendar-day ${date.getMonth() !== month ? "outside" : ""} ${key === dayKey(new Date()) ? "today" : ""}"><span class="calendar-number">${date.getDate()}</span><div class="calendar-events">${events.map((item) => `<button class="calendar-event ${item.status === "completed" ? "completed" : ""}" type="button" data-lead-id="${esc(item.leadId)}" title="${esc(item.title)}">${pad(new Date(item.startsAt).getHours())}:${pad(new Date(item.startsAt).getMinutes())} ${esc(item.title)}</button>`).join("")}</div></div>`);
    }
    const monthLabel = new Intl.DateTimeFormat(localeCode(), { month: "long", year: "numeric" }).format(first);
    return `<div class="page-stack"><section class="page-header"><div><p class="eyebrow">${esc(t("calendarEyebrow"))}</p><h1>${esc(t("calendarTitle"))}</h1><p>${esc(t("calendarDescription"))}</p></div><div class="header-actions"><button class="button" data-action="add-appointment" type="button">+ ${esc(t("scheduleAppointment").replace(/^\+\s*/, ""))}</button></div></section><section class="calendar-shell"><div class="panel"><div class="calendar-toolbar"><h2>${esc(monthLabel)}</h2><div class="calendar-actions"><button class="button button-secondary button-sm" data-action="calendar-prev" type="button">&larr; ${esc(t("previous"))}</button><button class="button button-secondary button-sm" data-action="calendar-today" type="button">${esc(t("goToday"))}</button><button class="button button-secondary button-sm" data-action="calendar-next" type="button">${esc(t("next"))} &rarr;</button></div></div><div class="calendar-grid">${weekdays.map((day) => `<div class="calendar-weekday">${esc(day)}</div>`).join("")}${days.join("")}</div></div></section></div>`;
  }

  function renderSettings() {
    return `<div class="page-stack"><section class="page-header"><div><p class="eyebrow">${esc(t("settingsEyebrow"))}</p><h1>${esc(t("settingsTitle"))}</h1><p>${esc(t("settingsDescription"))}</p></div></section><section class="settings-grid"><article class="panel setting-card"><h2>${esc(t("interface"))}</h2><p>${esc(t("languageHelp"))}</p><div class="setting-row"><div><strong>${esc(t("officialLanguage"))}</strong><small>${esc(t("languageHelp"))}</small></div><span class="status-pill demo">${esc(t("english"))}</span></div><div class="setting-row"><div><strong>${esc(t("language"))}</strong><small>EN / FR</small></div><div class="language-switch"><button type="button" data-lang="en" class="${locale === "en" ? "active" : ""}">EN</button><button type="button" data-lang="fr" class="${locale === "fr" ? "active" : ""}">FR</button></div></div></article><article class="panel setting-card"><h2>${esc(t("dataAndIntegration"))}</h2><p>${esc(t("settingsDescription"))}</p><div class="setting-row"><div><strong>${esc(t("dataMode"))}</strong><small>${esc(t("localDemo"))}</small></div><span class="status-pill demo">${esc(t("demoData"))}</span></div><div class="setting-row"><div><strong>${esc(t("supabase"))}</strong><small>${esc(t("notConnected"))}</small></div><span class="status-pill pending">${esc(t("pending"))}</span></div><div class="setting-row"><div><strong>${esc(t("websiteFlow"))}</strong><small>elboubakry.com/reserver-diagnostic/ &rarr; CRM</small></div><span class="status-pill pending">${esc(t("pending"))}</span></div></article><article class="panel setting-card"><h2>${esc(t("security"))}</h2><p>${esc(t("cloudflareAuth"))}</p><div class="setting-row"><div><strong>${esc(t("cloudflareAuth"))}</strong><small>Cloudflare Pages Functions</small></div><span class="status-pill">${esc(t("serverProtected"))}</span></div><div class="setting-row"><div><strong>${esc(t("session"))}</strong><small>${esc(t("sessionHelp"))}</small></div><span class="status-pill">HttpOnly</span></div></article><article class="panel setting-card"><h2>${esc(t("demoControls"))}</h2><p>${esc(t("demoControlsText"))}</p><div class="setting-row"><div><strong>${esc(t("resetDemoData"))}</strong><small>${esc(t("demoControlsText"))}</small></div><button class="button button-danger button-sm" type="button" data-action="reset-demo">${esc(t("reset"))}</button></div></article></section></div>`;
  }

  function render() {
    document.documentElement.lang = locale;
    localStorage.setItem(LANG_KEY, locale);
    currentView = VALID_VIEWS.has(currentView) ? currentView : "dashboard";
    if (location.hash.slice(1) !== currentView) history.replaceState(null, "", `#${currentView}`);
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === currentView));
    document.querySelectorAll("[data-lang]").forEach((button) => { const active = button.dataset.lang === locale; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); });
    document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
    if (currentView !== "leads") globalSearch.value = "";
    else globalSearch.value = filters.query;
    content.innerHTML = currentView === "dashboard" ? renderDashboard() : currentView === "leads" ? renderLeads() : currentView === "appointments" ? renderAppointments() : currentView === "calendar" ? renderCalendar() : renderSettings();
    document.title = `${t(currentView)} | Elboubakry Leads CRM`;
  }

  function navigate(view) {
    if (!VALID_VIEWS.has(view)) return;
    currentView = view;
    location.hash = view;
    render();
    content.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function openLead(id) {
    const lead = getLead(id);
    if (!lead) return;
    lastFocused = document.activeElement;
    const notes = getLeadNotes(id);
    const appointments = getLeadAppointments(id);
    const whatsappPhone = normalizePhone(lead.phone);
    drawer.innerHTML = `<div class="drawer-header"><div><p class="eyebrow">${esc(t("leadProfile"))}</p><h2 id="drawerTitle">${esc(lead.fullName)}</h2><p>${esc(lead.company || sectorLabel(lead.businessSector))}</p></div><button class="close-button" type="button" data-action="close-drawer" aria-label="${esc(t("close"))}">X</button></div><div class="drawer-body"><section class="drawer-section"><h3>${esc(t("actions"))}</h3><div class="action-grid"><a class="contact-action" href="https://wa.me/${esc(whatsappPhone)}" target="_blank" rel="noopener noreferrer">${esc(t("whatsapp"))}</a><a class="contact-action" href="tel:+${esc(whatsappPhone)}">${esc(t("call"))}</a>${lead.email ? `<a class="contact-action" href="mailto:${esc(lead.email)}">${esc(t("emailAction"))}</a>` : `<span class="contact-action muted">${esc(t("emailAction"))}</span>`}</div></section><section class="drawer-section"><h3>${esc(t("leadInfo"))}</h3><div class="detail-grid"><div class="detail-box"><small>${esc(t("phone"))}</small><strong>${esc(formatPhone(lead.phone))}</strong></div><div class="detail-box"><small>${esc(t("email"))}</small><strong>${esc(lead.email || "-")}</strong></div><div class="detail-box"><small>${esc(t("company"))}</small><strong>${esc(lead.company || "-")}</strong></div><div class="detail-box"><small>${esc(t("city"))}</small><strong>${esc(lead.city || "-")}</strong></div><div class="detail-box"><small>${esc(t("sector"))}</small><strong>${esc(sectorLabel(lead.businessSector))}</strong></div><div class="detail-box"><small>${esc(t("source"))}</small><strong>${esc(sourceLabel(lead.source))}</strong></div></div>${lead.message ? `<div class="detail-box" style="margin-top:10px"><small>${esc(t("message"))}</small><strong>${esc(lead.message)}</strong></div>` : ""}</section><section class="drawer-section"><h3>${esc(t("leadState"))}</h3><div class="drawer-selects"><label>${esc(t("status"))}<select class="field-control" data-lead-status="${esc(lead.id)}">${STATUS_ORDER.map((value) => `<option value="${value}" ${lead.status === value ? "selected" : ""}>${esc(statusLabel(value))}</option>`).join("")}</select></label><label>${esc(t("priority"))}<select class="field-control" data-lead-priority="${esc(lead.id)}">${PRIORITIES.map((value) => `<option value="${value}" ${lead.priority === value ? "selected" : ""}>${esc(priorityLabel(value))}</option>`).join("")}</select></label></div><button class="button button-secondary" style="margin-top:10px" type="button" data-action="add-appointment" data-lead-id="${esc(lead.id)}">+ ${esc(t("scheduleAppointment").replace(/^\+\s*/, ""))}</button></section><section class="drawer-section"><h3>${esc(t("leadNotes"))}</h3><div class="note-list">${notes.length ? notes.map((note) => `<div class="note-item"><p>${esc(note.body)}</p><small>${esc(formatDateTime(note.createdAt))}</small></div>`).join("") : `<p class="muted" style="font-size:9px">${esc(t("noNotes"))}</p>`}</div><form class="note-form" data-note-form="${esc(lead.id)}"><label><span>${esc(t("addNote"))}</span><textarea name="note" placeholder="${esc(t("notePlaceholder"))}" maxlength="1000" required></textarea></label><button class="button button-secondary button-sm" type="submit">${esc(t("addNote"))}</button></form></section><section class="drawer-section"><h3>${esc(t("attribution"))}</h3><div class="detail-grid"><div class="detail-box"><small>${esc(t("utmSource"))}</small><strong>${esc(lead.utmSource || "-")}</strong></div><div class="detail-box"><small>${esc(t("utmMedium"))}</small><strong>${esc(lead.utmMedium || "-")}</strong></div><div class="detail-box"><small>${esc(t("utmCampaign"))}</small><strong>${esc(lead.utmCampaign || "-")}</strong></div><div class="detail-box"><small>${esc(t("landing"))}</small><strong>${esc(lead.landingPageUrl || "-")}</strong></div><div class="detail-box"><small>${esc(t("referrer"))}</small><strong>${esc(lead.referrer || "-")}</strong></div><div class="detail-box"><small>${esc(t("appointments"))}</small><strong>${appointments.length}</strong></div></div></section></div>`;
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    drawer.querySelector(".close-button")?.focus();
  }

  function closeDrawer() {
    document.body.classList.remove("drawer-open");
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function openModal(html) {
    lastFocused = document.activeElement;
    modal.innerHTML = html;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector("input,select,textarea,button")?.focus();
  }
  function closeModal() { document.body.classList.remove("modal-open"); modal.setAttribute("aria-hidden", "true"); modal.innerHTML = ""; if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus(); }

  function leadFormTemplate() {
    return `<div class="modal-header"><div><p class="eyebrow">${esc(t("addLeadEyebrow"))}</p><h2 id="modalTitle">${esc(t("addLeadTitle"))}</h2></div><button class="close-button" type="button" data-action="close-modal" aria-label="${esc(t("close"))}">X</button></div><div class="modal-body"><form id="leadForm" novalidate><div class="form-grid"><div class="form-field"><label for="leadName">${esc(t("fullName"))} *</label><input id="leadName" name="fullName" maxlength="120" required><span class="field-error" data-error="fullName"></span></div><div class="form-field"><label for="leadPhone">${esc(t("phone"))} *</label><input id="leadPhone" name="phone" placeholder="${esc(t("phoneExample"))}" maxlength="30" required><span class="field-error" data-error="phone"></span></div><div class="form-field"><label for="leadEmail">${esc(t("email"))} (${esc(t("optional"))})</label><input id="leadEmail" name="email" type="email" maxlength="160"><span class="field-error" data-error="email"></span></div><div class="form-field"><label for="leadCompany">${esc(t("company"))}</label><input id="leadCompany" name="company" placeholder="${esc(t("companyPlaceholder"))}" maxlength="160"></div><div class="form-field"><label for="leadCity">${esc(t("city"))}</label><input id="leadCity" name="city" placeholder="${esc(t("cityPlaceholder"))}" maxlength="100"></div><div class="form-field"><label for="leadSector">${esc(t("businessSector"))} *</label><select id="leadSector" name="businessSector" required><option value="">${esc(t("chooseSector"))}</option>${SECTORS.map((value) => `<option value="${esc(value)}">${esc(sectorLabel(value))}</option>`).join("")}</select><span class="field-error" data-error="businessSector"></span></div><div class="form-field"><label for="leadSource">${esc(t("source"))}</label><select id="leadSource" name="source">${SOURCES.map((value) => `<option value="${esc(value)}" ${value === "Ajout manuel" ? "selected" : ""}>${esc(sourceLabel(value))}</option>`).join("")}</select></div><div class="form-field"><label for="leadPriority">${esc(t("priority"))}</label><select id="leadPriority" name="priority">${PRIORITIES.map((value) => `<option value="${value}" ${value === "normal" ? "selected" : ""}>${esc(priorityLabel(value))}</option>`).join("")}</select></div><div class="form-field full"><label for="leadMessage">${esc(t("message"))}</label><textarea id="leadMessage" name="message" placeholder="${esc(t("messagePlaceholder"))}" maxlength="1200"></textarea></div></div><div class="modal-actions"><button class="button button-secondary" type="button" data-action="close-modal">${esc(t("cancel"))}</button><button class="button" type="submit">${esc(t("saveLead"))}</button></div></form></div>`;
  }

  function appointmentFormTemplate(selectedLeadId = "") {
    const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000); defaultDate.setHours(10, 0, 0, 0);
    return `<div class="modal-header"><div><p class="eyebrow">${esc(t("appointmentEyebrow"))}</p><h2 id="modalTitle">${esc(t("addAppointmentTitle"))}</h2></div><button class="close-button" type="button" data-action="close-modal" aria-label="${esc(t("close"))}">X</button></div><div class="modal-body"><form id="appointmentForm" novalidate><div class="form-grid"><div class="form-field full"><label for="appointmentLead">${esc(t("lead"))} *</label><select id="appointmentLead" name="leadId" required><option value="">${esc(t("chooseLead"))}</option>${sortedLeads().map((lead) => `<option value="${esc(lead.id)}" ${selectedLeadId === lead.id ? "selected" : ""}>${esc(lead.fullName)} — ${esc(lead.company || sectorLabel(lead.businessSector))}</option>`).join("")}</select><span class="field-error" data-error="leadId"></span></div><div class="form-field"><label for="appointmentTitle">${esc(t("appointmentTitle"))} *</label><input id="appointmentTitle" name="title" placeholder="${esc(t("titlePlaceholder"))}" maxlength="160" required><span class="field-error" data-error="title"></span></div><div class="form-field"><label for="appointmentStartsAt">${esc(t("startsAt"))} *</label><input id="appointmentStartsAt" name="startsAt" type="datetime-local" value="${localDateTimeValue(defaultDate)}" required><span class="field-error" data-error="startsAt"></span></div><div class="form-field full"><label for="appointmentNotes">${esc(t("notes"))}</label><textarea id="appointmentNotes" name="notes" placeholder="${esc(t("appointmentNotesPlaceholder"))}" maxlength="1000"></textarea></div></div><div class="modal-actions"><button class="button button-secondary" type="button" data-action="close-modal">${esc(t("cancel"))}</button><button class="button" type="submit">${esc(t("saveAppointment"))}</button></div></form></div>`;
  }

  function validateLead(formData) {
    const errors = {};
    if ((formData.get("fullName") || "").trim().length < 2) errors.fullName = t("validationName");
    if (!/^212[5-7]\d{8}$/.test(normalizePhone(formData.get("phone") || ""))) errors.phone = t("validationPhone");
    const email = (formData.get("email") || "").trim(); if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t("validationEmail");
    if (!(formData.get("businessSector") || "").trim()) errors.businessSector = t("validationSector");
    return errors;
  }
  function validateAppointment(formData) {
    const errors = {};
    if (!(formData.get("leadId") || "")) errors.leadId = t("validationLead");
    if ((formData.get("title") || "").trim().length < 2) errors.title = t("validationAppointmentTitle");
    const date = new Date(formData.get("startsAt") || ""); if (!formData.get("startsAt") || Number.isNaN(date.getTime())) errors.startsAt = t("validationAppointmentDate");
    return errors;
  }
  function showErrors(form, errors) { form.querySelectorAll("[data-error]").forEach((element) => { element.textContent = errors[element.dataset.error] || ""; }); }

  function showToast(message) { toast.textContent = message; toast.classList.add("on"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("on"), 2200); }

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]"); if (viewButton) { navigate(viewButton.dataset.view); return; }
    const viewLink = event.target.closest("[data-view-link]"); if (viewLink) { navigate(viewLink.dataset.viewLink); return; }
    const languageButton = event.target.closest("[data-lang]"); if (languageButton) { locale = languageButton.dataset.lang === "fr" ? "fr" : "en"; render(); if (document.body.classList.contains("drawer-open")) { const id = drawer.querySelector("[data-lead-status]")?.dataset.leadStatus; if (id) openLead(id); } return; }
    const leadTarget = event.target.closest("[data-lead-id]"); if (leadTarget && !event.target.closest("[data-action='add-appointment']")) { openLead(leadTarget.dataset.leadId); return; }
    const action = event.target.closest("[data-action]"); if (!action) return;
    const name = action.dataset.action;
    if (name === "close-drawer") closeDrawer();
    else if (name === "close-modal") closeModal();
    else if (name === "add-lead") openModal(leadFormTemplate());
    else if (name === "add-appointment") openModal(appointmentFormTemplate(action.dataset.leadId || ""));
    else if (name === "reset-demo") resetDemo();
    else if (name === "clear-filters") { filters = { query: "", status: "all", sector: "all", source: "all" }; globalSearch.value = ""; render(); }
    else if (name === "calendar-prev") { currentCalendarDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1); render(); }
    else if (name === "calendar-next") { currentCalendarDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1); render(); }
    else if (name === "calendar-today") { currentCalendarDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1); render(); }
    else if (name === "complete-appointment") { const item = state.appointments.find((entry) => entry.id === action.dataset.appointmentId); if (item) { item.status = "completed"; saveState(); render(); showToast(t("appointmentCompleted")); } }
  });

  document.getElementById("drawerBackdrop").addEventListener("click", closeDrawer);
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);

  document.addEventListener("change", (event) => {
    if (event.target.id === "statusFilter") { filters.status = event.target.value; render(); return; }
    if (event.target.id === "sectorFilter") { filters.sector = event.target.value; render(); return; }
    if (event.target.id === "sourceFilter") { filters.source = event.target.value; render(); return; }
    if (event.target.matches("[data-lead-status]")) { const lead = getLead(event.target.dataset.leadStatus); if (lead && STATUS_ORDER.includes(event.target.value)) { lead.status = event.target.value; lead.updatedAt = new Date().toISOString(); saveState(); showToast(t("statusUpdated")); render(); openLead(lead.id); } }
    if (event.target.matches("[data-lead-priority]")) { const lead = getLead(event.target.dataset.leadPriority); if (lead && PRIORITIES.includes(event.target.value)) { lead.priority = event.target.value; lead.updatedAt = new Date().toISOString(); saveState(); showToast(t("priorityUpdated")); render(); openLead(lead.id); } }
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "leadSearch") { filters.query = event.target.value; globalSearch.value = filters.query; const leads = filterLeads(); const panel = event.target.closest(".panel"); const oldTables = panel.querySelectorAll(".desktop-table,.lead-cards,.empty-state"); oldTables.forEach((node) => node.remove()); const wrapper = document.createElement("div"); wrapper.innerHTML = renderLeadTable(leads, true); while (wrapper.firstChild) panel.appendChild(wrapper.firstChild); const count = panel.querySelector(".count-pill"); if (count) count.textContent = String(leads.length); const heading = panel.querySelector(".panel-header h2"); if (heading) heading.textContent = `${leads.length} ${t("results")}`; }
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id === "leadForm") {
      event.preventDefault(); const form = event.target; const formData = new FormData(form); const errors = validateLead(formData); showErrors(form, errors); if (Object.keys(errors).length) return;
      const now = new Date().toISOString();
      state.leads.push({ id: uid("lead"), fullName: formData.get("fullName").trim(), phone: normalizePhone(formData.get("phone")), email: formData.get("email").trim(), company: formData.get("company").trim(), city: formData.get("city").trim(), businessSector: formData.get("businessSector"), source: formData.get("source") || "Ajout manuel", status: "new", priority: formData.get("priority") || "normal", message: formData.get("message").trim(), createdAt: now, updatedAt: now, utmSource: "", utmMedium: "", utmCampaign: "", landingPageUrl: "", referrer: "" });
      saveState(); closeModal(); render(); showToast(t("leadAdded")); return;
    }
    if (event.target.id === "appointmentForm") {
      event.preventDefault(); const form = event.target; const formData = new FormData(form); const errors = validateAppointment(formData); showErrors(form, errors); if (Object.keys(errors).length) return;
      const starts = new Date(formData.get("startsAt")).toISOString(); state.appointments.push({ id: uid("appointment"), leadId: formData.get("leadId"), title: formData.get("title").trim(), startsAt: starts, status: "scheduled", notes: formData.get("notes").trim(), createdAt: new Date().toISOString() }); const lead = getLead(formData.get("leadId")); if (lead && lead.status !== "won" && lead.status !== "lost") { lead.status = "appointment"; lead.updatedAt = new Date().toISOString(); } saveState(); closeModal(); render(); showToast(t("appointmentAdded")); return;
    }
    if (event.target.matches("[data-note-form]")) {
      event.preventDefault(); const form = event.target; const body = form.elements.note.value.trim(); if (!body) return; state.notes.push({ id: uid("note"), leadId: form.dataset.noteForm, body: body.slice(0, 1000), createdAt: new Date().toISOString() }); saveState(); showToast(t("noteAdded")); openLead(form.dataset.noteForm); return;
    }
  });

  globalSearch.addEventListener("input", () => { filters.query = globalSearch.value; if (currentView !== "leads" && filters.query.trim()) navigate("leads"); else if (currentView === "leads") render(); });
  document.getElementById("logoutButton").addEventListener("click", async () => { try { await fetch("/api/crm/logout", { method: "POST", credentials: "same-origin", headers: { Accept: "application/json" } }); } catch { showToast(t("logoutFailed")); } finally { location.assign("/crm/login/"); } });
  window.addEventListener("hashchange", () => { const next = location.hash.slice(1); if (VALID_VIEWS.has(next) && next !== currentView) { currentView = next; render(); } });
  function trapDialogFocus(event, container) {
    if (event.key !== "Tab" || !container) return;
    const focusable = [...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((element) => element.offsetParent !== null);
    if (!focusable.length) { event.preventDefault(); container.focus?.(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  document.addEventListener("keydown", (event) => {
    const activeDialog = document.body.classList.contains("modal-open") ? modal : document.body.classList.contains("drawer-open") ? drawer : null;
    trapDialogFocus(event, activeDialog);
    if (event.key === "Escape") { if (document.body.classList.contains("modal-open")) closeModal(); else if (document.body.classList.contains("drawer-open")) closeDrawer(); }
  });

  render();
})();
