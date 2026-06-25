(function () {
  'use strict';

  if (window.__NamaaPageLoaded) return;
  window.__NamaaPageLoaded = true;

  const API_ROUTE = '/api/namaa/agent';
  const MAX_HISTORY = 10;

  /* ---- Config ---- */

  const FOCUS_MODES = {
    free: {
      label: 'Free Talk',
      greeting: 'Salam 👋 M3ak Namaa. N9der n3awnek f l’business, marketing, AI, wla ay haja o5ra. Ki9ach n9der n3awnek?',
      system: ''
    },
    business: {
      label: 'Business Strategy',
      greeting: 'Salam 👋 Namaa hna bach t3awnek tplanifi l’business dyalk f lmaghrib. Chno projet dyalk? Fash katplan?',
      system: 'Focus on business strategy, market research, business planning, competitive analysis, and growth tactics for Moroccan companies.'
    },
    marketing: {
      label: 'Marketing',
      greeting: 'Salam 👋 Hna t7na f marketing. ads, content, SEO, branding, w kayfa tjib clients f lmaghrib. Bghiti chno?',
      system: 'Focus on marketing strategy, digital advertising, content marketing, SEO, branding, and lead generation for the Moroccan market.'
    },
    website: {
      label: 'Website / IT',
      greeting: 'Salam 👋 N3awnk f sites web, landing pages, hosting, IT, w technology projects. Chno bghiti tbni?',
      system: 'Focus on websites, landing pages, web development, IT infrastructure, hosting, and technical project planning.'
    },
    automation: {
      label: 'AI Automation',
      greeting: 'Salam 👋 Namaa f AI automation. Chatbots, CRM automation, AI tools, workflow automation. Bghiti t7seb chi automatisation f business dyalk?',
      system: 'Focus on AI automation, chatbots, workflow automation, AI tools, and how to automate business processes.'
    },
    whatsapp: {
      label: 'WhatsApp CRM',
      greeting: 'Salam 👋 Namaa f WhatsApp CRM. N3awnk tbni sistema dyal clients via WhatsApp, templates, automation, w kifash tjiwdek l clients b WhatsApp. Chno bghiti?',
      system: 'Focus on WhatsApp CRM, WhatsApp Business API, client communication automation, message templates, and lead nurturing via WhatsApp.'
    }
  };

  const DEMO_RESPONSES = {
    greeting: [
      'Salam 👋 Hna Namaa AI! N9der n3awnek f business, marketing, AI, website, wla idées projets. Bghiti chno?',
      'Salam 3lik 👋 Namaa AI hna bach t3awnek. Kalam 3la projet dyalk, w n3tiwek l hal l mzyan.',
      'Hello 👋, I\'m Namaa AI. Ask me about business, marketing, AI, websites, or your startup idea in Morocco.',
      'Bonjour 👋 Moi c\'est Namaa AI. Je peux t\'aider pour ton business, marketing, site web, ou idée de projet au Maroc.'
    ],
    marketing: [
      'Fhmtk bghiti marketing 🤝 Ghadi nbdaw b: 1) Chno l produit/khidma dyalk 2) Chno target dyalk f lmaghrib 3) Chno budget dyalk. Bhal had l3na9ed, n9dro nbniw Istrategy kamil. Bghiti tzid t3ref?',
      'Marketing f lmaghrib 3ndo spécialité dyalo. L’important hwa: 1) Fr9 bin Dakchi li kayn f sou9 2) Koun wad7 f l’offre 3) Stafed mn local content. Baghi Chi conseil 3la niche m3ayana?',
      'Pour une stratégie marketing qui marche au Maroc : 1. Sois clair sur ton offre 2. Choisis bien tes canaux (Meta Ads, Google, TikTok) 3. Construis une page qui convertit. Tu veux qu\'on détaille un point ?',
      'A strong marketing strategy for Morocco starts with: 1. A clear offer 2. The right channels (Meta Ads, Google, TikTok) 3. A converting landing page. Want me to dive deeper into any of these?'
    ],
    website: [
      'Mzyan 3la website 👌 Pour un site business f lmaghrib, focus 3la: 1) Page d’accueil wad7a 2) Landing pages l kola offre 3) WhatsApp integration 4) Performance (site khfif). Baghi n3awnek f template wla structure?',
      'Site web l business dyalk khasso ykoun: responsive (yakhdem f portable), rapide, w fih CTA wad7a. WordPress wla coded? N9der n3awnek f les 2 👌',
      'Pour un site professionnel au Maroc : vitesse, clarté et intégration WhatsApp sont essentiels. Je peux t\'aider à structurer le contenu et le design.',
      'For a business website in Morocco: keep it fast, mobile-first, and include clear CTAs + WhatsApp integration. I can help with the content structure and layout.'
    ],
    whatsapp: [
      'WhatsApp CRM système f lmaghrib 3la وصف : 1) API WhatsApp Business 2) Tin templates dyal messages 3) Automation l follow-up 4) Tags w tracking dyal clients. Bghiti n3awnk f chi wa7da?',
      'Bach tjib clients b WhatsApp f lmaghrib: 1) Hayed liste dyal numéros ciblés 2) Sift message personnalisé 3) Tabe3 l conversion b CRM. N9der n3tiwek chi script template.',
      'Un système WhatsApp CRM efficace : messages personnalisés, templates approuvés, automation des relances et suivi des conversions. Je peux t\'aider à mettre ça en place.',
      'A WhatsApp CRM system: personalized messages, approved templates, follow-up automation, and conversion tracking. I can help you build this step by step.'
    ],
    startup: [
      'Startup f lmaghrib 👌 L’important hwa: 1) Problem réel 2) Solution simple 3) MVP (produit minimal) 4) Test m3a clients wa9i3in. Chno l problem li baghi t7elo?',
      'Bach tbedi startup f lmaghrib: fr9 bin l’idée w l’execution. Awal haja: tkhrej ttkellem m3a clients potentiels 9bl ma tbni ay haja. Jarebt hadchi?',
      'Pour lancer une startup au Maroc : identifie un vrai problème, construis un MVP rapide, et valide avec des clients réels avant d\'investir lourd.',
      'To launch a startup in Morocco: find a real problem, build a quick MVP, validate with real customers, then scale. What\'s your startup idea?'
    ],
    automation: [
      'AI automation f lmaghrib mazal fih bzaf dyal l’opportunités 👌 1) Chatbots l service client 2) CRM automation 3) AI content creation 4) Lead scoring automatique. Chno interessek?',
      'Bghiti tautomate chi haja f business dyalk? N9der n3awnek: 1) Ntala3 3la l’process 2) Nshofo win kayn l’automatisation 3) Nbniw sistema 😊',
      'L\'automatisation IA au Maroc est encore peu exploitée. Chatbots, CRM automatisé, création de contenu AI... beaucoup d\'opportunités. Tu veux qu\'on explore ensemble ?',
      'AI automation in Morocco is full of opportunities. Chatbots, CRM automation, AI content, lead scoring. Which area interests you most?'
    ],
    'business-idea': [
      'Ajwa 3la l’idée 😊 L’important: had l’idée t7el chi problem 7a9i9i. Chno rayk f: 1) Service local 2) Niche e-commerce 3) B2B automation. Ma bghiti blastek?',
      'Fikra business f lmaghrib khassha tkon: 1) T7el mochkil 2) 3ndha sou9 3) T9der tbediha b capital moyen. N3tiwek 3 dyal l’afkar?',
      'Pour une idée business qui marche au Maroc : résous un vrai problème, cible une niche, et commence petit. Tu veux des idées dans un secteur précis ?',
      'A good business idea in Morocco solves a real problem, targets a specific niche, and can start small. Want ideas for a specific sector?'
    ],
    'moroccan-market': [
      'Lmaghrib sou9 fih bzaf dyal l’opportunités walakin 3ndo spécificités dyalo 👌 L’important: fhem l’3ada dyal l’consommation, l’prix, w l’langue. Baghi n7elto 3la sector mo3ayan?',
      'Sou9 lmaghribi: consommateurs bghaw qualité walakin 7assabin f l’prix. L’digital mazal fih bzaf d’espace. Niche li t9der tkon 3ndek value claire fiha.',
      'Le marché marocain est prometteur mais spécifique : prix, confiance, et langue sont clés. Beaucoup de secteurs sont encore sous-exploités digitalement.',
      'The Moroccan market has great potential but unique dynamics: price sensitivity, trust-building, and language preferences. Many sectors are still under-digitized.'
    ],
    roadmap: [
      'Roadmap 👌 1) Research + validation 2) Business model clair 3) MVP wla landing page 4) Marketing + acquisition 5) Scaling. Baghi n3awnk f étape mo3ayana?',
      'Bach tbni roadmap: 1) Fhem problem 2) Bni solution minimale 3) Test m3a clients 4) Zid features 5) Scale. N3tiwek chi template?',
      'Une roadmap claire : 1. Recherche et validation 2. Modèle économique 3. MVP ou landing page 4. Marketing et acquisition 5. Passage à l\'échelle.',
      'A clear roadmap: 1. Research & validation 2. Business model 3. MVP/landing page 4. Marketing & acquisition 5. Scale. Need help with any step?'
    ],
    default: [
      'Fhmtk. La réponse spécifique 3la had l’question khassha chwiya d’tafkir. N9der n3awnek f: business, marketing, AI, website, startup, wla idée projet. Bghiti tchri7 ktar?',
      'Interesting point! I can help you think through this. My main areas are business strategy, marketing, AI automation, websites, and startups. Want to explore any of these?',
      'Je vois. Je peux t\'aider à réfléchir là-dessus. Mes domaines : business, marketing, IA, sites web et startups. Tu veux approfondir un point ?',
      'Tmam. N9der n3awnek t7el had l’question m3a l’focus 3la business, marketing, wla technology. Chno baghi tzid fih?'
    ]
  };

  /* ---- State ---- */

  let state = {
    messages: [],
    loading: false,
    mode: 'free',
    conversationCount: 0
  };

  /* ---- DOM refs ---- */

  const $ = (id) => document.getElementById(id);
  const el = {
    sidebar: $('namaa-sidebar'),
    overlay: $('namaa-overlay'),
    menuToggle: $('namaa-menu-toggle'),
    newChat: $('namaa-new-chat'),
    mobileNew: $('namaa-mobile-new'),
    welcome: $('namaa-welcome'),
    chatMessages: $('namaa-chat-messages'),
    typing: $('namaa-typing'),
    form: $('namaa-form'),
    input: $('namaa-input'),
    send: $('namaa-send'),
    modes: $('namaa-modes'),
    suggested: $('namaa-suggested'),
    messages: $('namaa-messages')
  };

  /* ---- Helpers ---- */

  function detectLanguage(text) {
    const v = String(text || '').trim().toLowerCase();
    if (/[\u0600-\u06FF]/.test(v)) return 'arabic';
    if (/[àâçéèêëîïôùûüÿœ]/i.test(v) || /\b(je|j'ai|j ai|vous|nous|pour|avec|une|des|est|ce|les|stratégie|entreprise|idée|bonjour|salut|marché)\b/i.test(v)) return 'french';
    if (/\b(bghit|brit|wach|wash|chno|shno|kifach|kifash|3afak|salam|smah|daba|db|mzyan|mezian|khdma|fikra|flous|maghrib|maroc|casa|mdina|bzaf|chwiya|n9dro|nqder|baghi|bghina|khass|khas|3lach|3lash|khoya|khti)\b/i.test(v) || /[379]/.test(v)) return 'darija';
    return 'english';
  }

  function detectIntent(text) {
    const v = String(text || '').toLowerCase();
    if (/\b(hi|hello|hey|salam|salut|bonjour|labas|marhaba)\b/i.test(v) && v.length < 30) return 'greeting';
    if (/\b(marketing|ads|advertising|publicit|annonce|social.media|content|seo|branding|leads|clients)\b/i.test(v)) return 'marketing';
    if (/\b(website|site web|site internet|landing page|web dev|wordpress|page|design ui|frontend|backend|hosting)\b/i.test(v)) return 'website';
    if (/\b(whatsapp|wa|crm|message template|client communication|message automat)\b/i.test(v)) return 'whatsapp';
    if (/\b(startup|start.up|launch|business idea|fikra|project idea|new business|\bidea\b)\b/i.test(v)) return 'startup';
    if (/\b(automation|ai|chatbot|robot|intelligence|automatis|automate|workflow|bot|gpt|machine learning|ia)\b/i.test(v)) return 'automation';
    if (/\b(business idea|idea for business|fikra|idée|projet nouveau|bizness idea)\b/i.test(v)) return 'business-idea';
    if (/\b(moroccan market|marché marocain|sou9 lmaghrib|lmarket dyal lmaghrib|sou9 maghribi)\b/i.test(v)) return 'moroccan-market';
    if (/\b(roadmap|plan|stratégie|strategy|full plan|step by step|feuille de route|khtar lia)\b/i.test(v)) return 'roadmap';
    return 'default';
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function timeLabel() {
    try {
      return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date());
    } catch (e) {
      return '';
    }
  }

  function scrollToBottom(smooth) {
    requestAnimationFrame(function () {
      el.messages.scrollTo({
        top: el.messages.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    });
  }

  /* ---- Render ---- */

  function addMessage(role, content) {
    el.welcome.classList.add('is-hidden');

    var msg = document.createElement('div');
    msg.className = 'namaa-msg namaa-msg--' + role;

    var avatar = document.createElement('span');
    avatar.className = 'namaa-msg-avatar';
    avatar.textContent = role === 'assistant' ? 'N' : 'U';
    avatar.setAttribute('aria-hidden', 'true');

    var contentWrap = document.createElement('div');
    contentWrap.className = 'namaa-msg-content';

    var bubble = document.createElement('div');
    bubble.className = 'namaa-msg-bubble';
    bubble.textContent = content;

    var time = document.createElement('span');
    time.className = 'namaa-msg-time';
    time.textContent = timeLabel();

    contentWrap.appendChild(bubble);
    contentWrap.appendChild(time);
    msg.appendChild(avatar);
    msg.appendChild(contentWrap);
    el.chatMessages.appendChild(msg);
    scrollToBottom(true);
  }

  function showTyping() {
    el.typing.classList.add('is-visible');
    scrollToBottom(true);
  }

  function hideTyping() {
    el.typing.classList.remove('is-visible');
  }

  function setLoading(v) {
    state.loading = v;
    el.send.disabled = v || !el.input.value.trim();
    el.send.setAttribute('aria-busy', v ? 'true' : 'false');
  }

  function updateSend() {
    el.send.disabled = state.loading || !el.input.value.trim();
  }

  function resizeInput() {
    el.input.style.height = 'auto';
    el.input.style.height = Math.min(el.input.scrollHeight, 120) + 'px';
  }

  function clearMessages() {
    el.chatMessages.innerHTML = '';
    el.welcome.classList.remove('is-hidden');
    state.messages = [];
    hideTyping();
  }

  /* ---- Demo response ---- */

  function demoAnswer(text) {
    var lang = detectLanguage(text);
    var intent = detectIntent(text);

    var responses;
    if (intent === 'greeting') responses = DEMO_RESPONSES.greeting;
    else if (intent === 'marketing') responses = DEMO_RESPONSES.marketing;
    else if (intent === 'website') responses = DEMO_RESPONSES.website;
    else if (intent === 'whatsapp') responses = DEMO_RESPONSES.whatsapp;
    else if (intent === 'startup') responses = DEMO_RESPONSES.startup;
    else if (intent === 'automation') responses = DEMO_RESPONSES.automation;
    else if (intent === 'business-idea') responses = DEMO_RESPONSES['business-idea'];
    else if (intent === 'moroccan-market') responses = DEMO_RESPONSES['moroccan-market'];
    else if (intent === 'roadmap') responses = DEMO_RESPONSES.roadmap;
    else responses = DEMO_RESPONSES.default;

    var answer = pick(responses);

    if (lang === 'arabic' && intent !== 'greeting') {
      answer = 'أهلاً 😊 Namaa AI يمكنها مساعدتك في: الأفكار التجارية، التسويق، المواقع الإلكترونية، الأتمتة،和研究 السوق المغربي. ماذا تريد أن نناقش؟';
    }

    if (intent === 'greeting') {
      var modeKey = state.mode;
      if (modeKey !== 'free' && FOCUS_MODES[modeKey]) {
        answer = FOCUS_MODES[modeKey].greeting;
      }
    }

    return answer;
  }

  /* ---- Submit ---- */

  async function submitMessage(forcedText) {
    var text = String(forcedText || el.input.value || '').trim();
    if (!text || state.loading) return;

    el.input.value = '';
    resizeInput();

    addMessage('user', text);
    state.messages.push({ role: 'user', content: text.slice(0, 1800) });
    if (state.messages.length > MAX_HISTORY) state.messages = state.messages.slice(-MAX_HISTORY);

    setLoading(true);
    showTyping();

    var answer;

    try {
      var response = await fetch(API_ROUTE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: text,
          source: 'namaa-page',
          languageStyle: detectLanguage(text),
          history: state.messages.slice(-MAX_HISTORY).map(function (m) {
            return { role: m.role, content: m.content };
          })
        })
      });

      var data = await response.json().catch(function () { return {}; });
      answer = data && (data.answer || data.reply || data.text || data.message || '');
      if (!response.ok || !answer) throw new Error('empty');
    } catch (e) {
      answer = demoAnswer(text);
    }

    hideTyping();

    addMessage('assistant', answer);
    state.messages.push({ role: 'assistant', content: answer.slice(0, 1800) });
    if (state.messages.length > MAX_HISTORY) state.messages = state.messages.slice(-MAX_HISTORY);

    setLoading(false);
  }

  /* ---- Mode switching ---- */

  function setMode(modeKey) {
    state.mode = modeKey;

    var buttons = el.modes.querySelectorAll('.namaa-mode');
    buttons.forEach(function (b) {
      var isActive = b.dataset.mode === modeKey;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-checked', isActive ? 'true' : 'false');
      b.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  /* ---- Events ---- */

  el.form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitMessage();
  });

  el.input.addEventListener('input', function () {
    resizeInput();
    updateSend();
  });

  el.input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  });

  el.send.addEventListener('click', function () {
    submitMessage();
  });

  el.modes.addEventListener('click', function (e) {
    var btn = e.target.closest('.namaa-mode');
    if (!btn) return;
    e.preventDefault();
    setMode(btn.dataset.mode);
    if (window.innerWidth <= 768) closeSidebar();
  });

  el.modes.addEventListener('keydown', function (e) {
    var current = el.modes.querySelector('.namaa-mode.is-active');
    if (!current) return;
    var buttons = Array.from(el.modes.querySelectorAll('.namaa-mode'));
    var idx = buttons.indexOf(current);
    var next;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      next = buttons[(idx + 1) % buttons.length];
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      next = buttons[(idx - 1 + buttons.length) % buttons.length];
    }
    if (next) {
      setMode(next.dataset.mode);
      next.focus();
    }
  });

  el.newChat.addEventListener('click', function () {
    clearMessages();
    el.input.focus();
    state.conversationCount++;
    if (window.innerWidth <= 768) closeSidebar();
  });

  el.mobileNew.addEventListener('click', function () {
    clearMessages();
    el.input.focus();
    state.conversationCount++;
  });

  el.suggested.addEventListener('click', function (e) {
    var chip = e.target.closest('.namaa-suggested-chip');
    if (!chip) return;
    submitMessage(chip.dataset.prompt);
  });

  /* ---- Sidebar toggle ---- */

  function openSidebar() {
    el.sidebar.classList.add('is-open');
    el.overlay.classList.add('is-open');
    el.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    el.sidebar.classList.remove('is-open');
    el.overlay.classList.remove('is-open');
    el.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  el.menuToggle.addEventListener('click', function () {
    if (el.sidebar.classList.contains('is-open')) closeSidebar();
    else openSidebar();
  });

  el.overlay.addEventListener('click', closeSidebar);

  /* ---- Sidebar shortcuts ---- */

  document.querySelector('.namaa-shortcuts').addEventListener('click', function (e) {
    var btn = e.target.closest('.namaa-shortcut');
    if (!btn) return;
    submitMessage(btn.dataset.prompt);
    if (window.innerWidth <= 768) closeSidebar();
  });

  /* ---- Auto-resize on window change ---- */

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && el.sidebar.classList.contains('is-open')) closeSidebar();
  });

  /* ---- Init ---- */

  updateSend();

}());
