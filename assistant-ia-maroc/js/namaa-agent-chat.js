(function () {
  'use strict';

  const AGENTS = {
    business: {
      title: 'شنو بغيتي نديرو اليوم؟',
      kicker: 'Namaa Talk',
      subtitle: 'نهضرو عادي على البيزنس والذكاء الاصطناعي، ولا نقادو مشروعك خطوة بخطوة بلا أسئلة كثيرة.',
      placeholder: 'كتب رسالتك هنا... مثال: بغيت نقاد مشروع',
      context: 'Namaa Talk = Namaa AI conversational brain created by Elboubakry Abdessamad. Same-language rule is strict: Darija Latin stays Darija Latin, Arabic script stays Arabic script, French stays French, English stays English. Scope: business, AI, IT, startups, ideas, marketing, websites, automation, CRM, sales, branding, content, entrepreneurship and Moroccan market. Politely redirect unrelated topics to a useful business/AI/IT/marketing angle.'
    },
    design: {
      title: 'Namaa Design',
      kicker: 'Namaa Design',
      subtitle: 'غادي نوجد لك اللوغو والموكابات داخل الشات، بلا تقرير طويل.',
      placeholder: 'جاوب بـ نعم باش نوجد لك اللوغو والموكابات...',
      context: 'Namaa Design = visual lab for logo + category mockups only. It generates a real visual board from the confirmed brief, then hands it to Namaa Website.'
    },
    website: {
      title: 'Namaa Dev',
      kicker: 'Namaa Website / Dev',
      subtitle: 'غادي نوجد لك موكاب ديال landing page داخل الشات: desktop و mobile.',
      placeholder: 'جاوب بـ نعم باش نوجد موكاب ديال الصفحة...',
      context: 'Namaa Website = Namaa Dev workspace. Gemini creates a real standalone HTML/CSS/JS landing page internally and the UI shows only desktop and mobile visual mockups, not source code.'
    },
    strategy: {
      title: 'Namaa Strategy',
      kicker: 'Namaa Strategy',
      subtitle: 'آخر خطوة: غادي نخرج لك 3 صور منظمة: بحث السوق، الخطة الرقمية، والروودماب.',
      placeholder: 'جاوب بـ نعم باش نوجد الصور الاستراتيجية النهائية...',
      context: 'Namaa Strategy = final chat-first step after Namaa Talk, Namaa Design and Namaa Website. It asks for confirmation, then creates 3 branded visual boards inside the chat: Market Research, Digital Marketing Strategy, and Roadmap.'
    }
  };

  const shell = document.querySelector('.namaa-shell');
  const sidebar = document.getElementById('namaaSidebar');
  const menuButton = document.getElementById('namaaMenuButton');
  const newChatButton = document.getElementById('namaaNewChat');
  const form = document.getElementById('namaaChatForm');
  const input = document.getElementById('namaaInput');
  const sendButton = document.getElementById('namaaSendButton');
  const messages = document.getElementById('namaaMessages');
  const stage = document.getElementById('namaaChatStage');
  const scrollBottomButton = document.getElementById('namaaScrollBottom');
  const title = document.getElementById('namaaMainTitle');
  const subtitle = document.getElementById('namaaSubtitle');
  const kicker = document.getElementById('namaaAgentKicker');
  const agentButtons = Array.from(document.querySelectorAll('[data-agent]'));

  const designWorkspace = document.getElementById('namaaDesignWorkspace');
  const designIntro = document.getElementById('namaaDesignIntro');
  const designGenerate = document.getElementById('namaaDesignGenerate');
  const designBackTalk = document.getElementById('namaaDesignBackTalk');
  const designToWebsite = document.getElementById('namaaDesignToWebsite');

  const websiteWorkspace = document.getElementById('namaaWebsiteWorkspace');
  const websiteIntro = document.getElementById('namaaWebsiteIntro');
  const websiteGenerate = document.getElementById('namaaWebsiteGenerate');
  const websiteBackTalk = document.getElementById('namaaWebsiteBackTalk');
  const websiteToStrategy = document.getElementById('namaaWebsiteToStrategy');
  const websiteCodeBlock = document.getElementById('namaaWebsiteCodeBlock');
  const websiteCopyCode = document.getElementById('namaaCopyWebsiteCode');
  const websiteDownloadCode = document.getElementById('namaaDownloadWebsiteCode');
  const websitePreviewFrame = document.getElementById('namaaWebsitePreviewFrame');
  const websiteBrowserUrl = document.getElementById('namaaWebsiteBrowserUrl');
  const websiteDesktopFrame = document.getElementById('namaaWebsiteDesktopFrame');
  const websiteMobileFrame = document.getElementById('namaaWebsiteMobileFrame');
  const websitePreviewDesktop = document.getElementById('namaaPreviewDesktop');
  const websitePreviewMobile = document.getElementById('namaaPreviewMobile');

  const strategyWorkspace = document.getElementById('namaaStrategyWorkspace');
  const strategyIntro = document.getElementById('namaaStrategyIntro');
  const strategyGenerate = document.getElementById('namaaStrategyGenerate');
  const strategyBackTalk = document.getElementById('namaaStrategyBackTalk');
  const strategyToDesign = document.getElementById('namaaStrategyToDesign');
  const strategyToWebsite = document.getElementById('namaaStrategyToWebsite');
  const strategyModal = document.getElementById('namaaStrategyModal');
  const strategyModalTitle = document.getElementById('namaaStrategyModalTitle');
  const strategyModalContent = document.getElementById('namaaStrategyModalContent');
  const strategyModalCloseButtons = Array.from(document.querySelectorAll('[data-strategy-modal-close]'));
  const strategyOpenButtons = Array.from(document.querySelectorAll('[data-strategy-open]'));

  const packModal = document.getElementById('namaaPackModal');
  const packForm = document.getElementById('namaaPackForm');
  const packEmail = document.getElementById('namaaPackEmail');
  const packSubmit = document.getElementById('namaaPackSubmit');
  const packStatus = document.getElementById('namaaPackStatus');
  const openPackPopupButton = document.getElementById('namaaOpenPackPopup');
  const packCloseButtons = Array.from(document.querySelectorAll('[data-pack-close]'));

  let activeAgent = 'business';
  let isSending = false;
  let lastUserPrompt = '';
  let lastAgentAnswer = '';
  let lastDesignAnswer = '';
  let lastWebsiteAnswer = '';
  let lastStrategyAnswer = '';
  let lastWebsiteCode = '';
  let chatHistory = [];
  let projectBrief = {};
  let projectBriefStatus = null;
  let projectBriefConfirmed = false;
  let strategyPackPopupShown = false;
  let designAutoStarted = false;
  let designChatIntroShown = false;
  let designAwaitingStart = false;
  let websiteChatIntroShown = false;
  let websiteAwaitingStart = false;
  let strategyChatIntroShown = false;
  let strategyAwaitingStart = false;
  const flowState = { designReady: false, websiteReady: false, strategyReady: false, packRequested: false };

  const talkUX = {
    mode: 'start',
    language: 'darija_ar',
    askedBasics: false,
    awaitingConfirmation: false,
    basicsTries: 0
  };

  function looksLikeGreeting(value) {
    const text = String(value || '').trim().toLowerCase();
    return /^(hi|hello|hey|salam|salam alikom|salam alaikom|السلام|سلام|مرحبا|اهلا|أهلا|cv|slm|bonjour)$/i.test(text);
  }

  function wantsBuildProject(value) {
    const text = String(value || '').toLowerCase();
    return /(build\s*project|bni|nbni|n9ado|nqado|نقادو|نبنيو|نبني|بناء|مشروع|project|بروجي|projet|بناء مشروع)/i.test(text);
  }

  function wantsFreeTalk(value) {
    const text = String(value || '').toLowerCase();
    return /(free\s*talk|دردشة|نهضرو|نهضر|نهدرو|هضرة عادية|نهضرو عادي|dwi|dwik|دوي|هضرة|سؤال عادي|business talk)/i.test(text);
  }

  function isTinyAgreement(value) {
    const text = String(value || '').trim().toLowerCase();
    return /^(oui|yes|ok|oki|okay|اه|ايه|نعم|واخا|سافي|safi|ah|iyah|yeh|تمام)$/i.test(text);
  }

  function detectLanguageStyle(value) {
    const raw = String(value || '').trim();
    const lower = raw.toLowerCase();
    if (/[\u0600-\u06FF]/.test(raw)) return 'arabic';
    if (/\b(bghit|wach|chno|kifach|3lach|3ndi|daba|dyal|mzyan|khass|n9der|nqder|n9ado|nqado|ndir|fikra|projet|salam|labas|safi|asahbi|hna|f morocco|f maroc)\b/i.test(lower)) return 'darija_latin';
    if (/\b(bonjour|salut|merci|je veux|j'ai|projet|idée|idee|marché|marche|entreprise|stratégie|strategie|site web|automatisation)\b/i.test(lower)) return 'french';
    return 'english';
  }

  function languageInstructionFor(value) {
    const style = detectLanguageStyle(value || lastUserPrompt || '');
    if (style === 'darija_latin') return 'Moroccan Darija Latin only. Do not use Arabic script.';
    if (style === 'arabic') return 'Arabic script only.';
    if (style === 'french') return 'French only.';
    return 'English only.';
  }

  function replyByLanguage(value, variants) {
    const style = detectLanguageStyle(value);
    return variants[style] || variants.english || variants.darija_latin || variants.arabic || '';
  }

  function loadingTextFor(value) {
    return replyByLanguage(value, {
      darija_latin: 'Namaa kayfhem message dyalek...',
      arabic: 'Namaa كايفهم الرسالة...',
      french: 'Namaa analyse ton message...',
      english: 'Namaa is reading your message...'
    });
  }

  function extractProjectBasics(value) {
    const raw = String(value || '').trim();
    const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const joined = raw.replace(/\s+/g, ' ').trim();
    const data = { name: '', description: '', city: '' };
    lines.forEach((line) => {
      const clean = line.replace(/^[-•*\d.)\s]+/, '').trim();
      const lower = clean.toLowerCase();
      if (!data.name && /(اسم|سميت|name|nom)/i.test(lower)) data.name = clean.replace(/^(اسم|سميت|سميتو|project name|name|nom)\s*[:：-]?\s*/i, '').trim();
      else if (!data.description && /(وصف|فكرة|description|desc|شنو|كيدير|كتدير)/i.test(lower)) data.description = clean.replace(/^(وصف|فكرة|description|desc)\s*[:：-]?\s*/i, '').trim();
      else if (!data.city && /(مدينة|المدينة|فين|city|market|casablanca|casa|rabat|marrakech|agadir|tanger|morocco|maroc|المغرب)/i.test(lower)) data.city = clean.replace(/^(المدينة|مدينة|city|market|فين غادي يخدم|فين)\s*[:：-]?\s*/i, '').trim();
    });
    if (!data.city) {
      const m = joined.match(/(casablanca|casa|rabat|marrakech|agadir|tanger|fes|fès|meknes|kenitra|tetouan|oujda|المغرب كامل|المغرب|الدار البيضاء|كازا|الرباط|مراكش|اكادير|أكادير|طنجة)/i);
      if (m) data.city = m[0];
    }
    if (!data.name) {
      const m = joined.match(/(?:سميت(?:و| المشروع)?|اسم(?: المشروع)?|name|nom)\s*[:：-]?\s*([^،,.\n]{2,50})/i);
      if (m) data.name = m[1].trim();
    }
    if (!data.description) {
      const cleaned = joined.replace(/^(build project|بغيت نبني مشروع|بغيت نقاد مشروع|نبني مشروع|نقادو مشروع)\s*/i, '').trim();
      if (cleaned.length > 18) data.description = cleaned.slice(0, 260);
    }
    if (!data.name && data.description) {
      const firstWords = data.description.split(/\s+/).slice(0, 4).join(' ');
      data.name = firstWords || 'مشروع جديد';
    }
    return data;
  }

  function mergeLocalBriefPatch(patch) {
    projectBrief = Object.assign({}, projectBrief || {}, {
      projectName: patch.name || projectBrief.projectName || projectBrief.project || '',
      project: patch.name || projectBrief.project || projectBrief.projectName || '',
      description: patch.description || projectBrief.description || projectBrief.offer || '',
      offer: patch.description || projectBrief.offer || projectBrief.description || '',
      city: patch.city || projectBrief.city || projectBrief.market || '',
      market: patch.city || projectBrief.market || projectBrief.city || '',
      source: 'Namaa Talk UX'
    });
    const hasName = Boolean(projectBrief.projectName || projectBrief.project);
    const hasDesc = Boolean(projectBrief.description || projectBrief.offer);
    const hasCity = Boolean(projectBrief.city || projectBrief.market);
    const score = (hasName ? 35 : 0) + (hasDesc ? 40 : 0) + (hasCity ? 25 : 0);
    projectBriefStatus = { score: score, level: score >= 75 ? 'ready' : 'collecting', isReady: score >= 75, missing: [!hasName && 'اسم المشروع', !hasDesc && 'وصف قصير', !hasCity && 'المدينة ولا المغرب كامل'].filter(Boolean) };
  }

  function talkWelcome(value) {
    return replyByLanguage(value, {
      darija_latin: 'Salam, ana Namaa.\n\nN9der n3awnek b joj toroq:\n\n**Free Talk**: nhadro 3adi f business, AI, IT, marketing.\n**Build Project**: nbniw projet dyalek step by step.',
      arabic: 'سلام، أنا Namaa.\n\nنقدر نعاونك بطريقتين:\n\n**Free Talk**: نهضرو عادي فـ business، AI، IT، marketing.\n**Build Project**: نبنيو مشروعك خطوة بخطوة.',
      french: 'Bonjour, je suis Namaa.\n\nJe peux t’aider de deux façons :\n\n**Free Talk** : discuter business, IA, IT ou marketing.\n**Build Project** : construire ton projet étape par étape.',
      english: 'Hi, I’m Namaa.\n\nI can help in two ways:\n\n**Free Talk**: discuss business, AI, IT, or marketing.\n**Build Project**: build your project step by step.'
    });
  }

  function askProjectBasics(value) {
    talkUX.askedBasics = true;
    talkUX.basicsTries += 1;
    return replyByLanguage(value, {
      darija_latin: 'Mzyan. Bach nbniw projet bla ma ntwlo, 3tini ghir 3 infos f message wa7da:\n\n1. **Smit projet**\n2. **Description 9sira**: chno kaydir?\n3. **Fin ghadi ykhdem?** chi ville ola Morocco kaml?\n\nExample: CasaFit, app kayrbet coaches m3a clients, f Casa.',
      arabic: 'زوين، باش نبني معاك المشروع بلا ما نطول عليك، عطيني غير 3 معلومات فـ رسالة وحدة:\n\n1. **سميت المشروع**\n2. **وصف قصير**: شنو كيدير المشروع؟\n3. **فين غادي يخدم؟** مدينة معينة ولا المغرب كامل؟\n\nمثال: سميتو CasaFit، تطبيق كيربط الكوتشات مع الناس، فـ كازا.',
      french: 'Très bien. Pour construire le projet sans te noyer de questions, donne-moi juste 3 infos en un message :\n\n1. **Nom du projet**\n2. **Description courte** : que fait-il ?\n3. **Marché** : ville précise ou tout le Maroc ?\n\nExemple : CasaFit, une app qui connecte coachs et clients à Casablanca.',
      english: 'Great. To build the project without too many questions, send me just 3 things in one message:\n\n1. **Project name**\n2. **Short description**: what does it do?\n3. **Market**: one city or all Morocco?\n\nExample: CasaFit, an app connecting coaches with clients in Casablanca.'
    });
  }

  function confirmBriefText(value) {
    const name = projectBrief.projectName || projectBrief.project || 'مشروع جديد';
    const desc = projectBrief.description || projectBrief.offer || 'فكرة مشروع';
    const city = projectBrief.city || projectBrief.market || 'المغرب';
    return replyByLanguage(value, {
      darija_latin: 'Wakha, fhemtk.\n\n**Projet:** ' + name + '\n**Fikra:** ' + desc + '\n**Market:** ' + city + '\n\nWash had l-fhem s7i7? Ila oui, nmchiw directement l **Namaa Design** bach nkhrjo logo w mockups.',
      arabic: 'واخا، فهمت عليك.\n\n**المشروع:** ' + name + '\n**الفكرة:** ' + desc + '\n**السوق:** ' + city + '\n\nواش هاد الفهم صحيح؟ إلا نعم، غادي نمشيو مباشرة لـ **Namaa Design** باش نخرجو اللوغو والموكابات.',
      french: 'Très bien, voilà ce que j’ai compris.\n\n**Projet :** ' + name + '\n**Idée :** ' + desc + '\n**Marché :** ' + city + '\n\nC’est correct ? Si oui, on passe à **Namaa Design** pour le logo et les mockups.',
      english: 'Got it. Here is what I understood.\n\n**Project:** ' + name + '\n**Idea:** ' + desc + '\n**Market:** ' + city + '\n\nIs this correct? If yes, we move to **Namaa Design** for the logo and mockups.'
    });
  }

  function addChoiceButtons(targetItem, choices) {
    if (!targetItem || !Array.isArray(choices) || !choices.length) return;
    const wrap = targetItem.querySelector('.message-wrap') || targetItem;
    const actions = document.createElement('div');
    actions.className = 'namaa-mode-actions';
    choices.forEach((choice) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = choice.label;
      button.addEventListener('click', function () {
        sendPrompt(choice.value, { displayMessage: choice.label });
      });
      actions.appendChild(button);
    });
    wrap.appendChild(actions);
  }

  function localBusinessReplyFor(message) {
    const raw = String(message || '').trim();
    if (!raw) return null;
    talkUX.language = detectLanguageStyle(raw);
    if (looksLikeGreeting(raw) && talkUX.mode === 'start') {
      talkUX.mode = 'choice';
      return { reply: talkWelcome(raw), choices: [
        { label: replyByLanguage(raw, { darija_latin: 'Nhadro 3adi', arabic: 'نهضرو عادي', french: 'Free Talk', english: 'Free Talk' }), value: replyByLanguage(raw, { darija_latin: 'nhadro 3adi', arabic: 'نهضرو عادي', french: 'Free Talk', english: 'Free Talk' }) },
        { label: replyByLanguage(raw, { darija_latin: 'N9ado projet', arabic: 'نقادو مشروع', french: 'Build Project', english: 'Build Project' }), value: replyByLanguage(raw, { darija_latin: 'n9ado projet', arabic: 'نقادو مشروع', french: 'Build Project', english: 'Build Project' }) }
      ] };
    }
    if (wantsFreeTalk(raw)) {
      talkUX.mode = 'free';
      return { reply: replyByLanguage(raw, {
        darija_latin: 'Wakha, nkheliwha Free Talk.\nSowelni 3la AI, business, IT, marketing ola chi fikra 3ndek, w njawebk direct.',
        arabic: 'واخا، نخليوها Free Talk.\nسولني على AI، business، IT، marketing ولا شي فكرة عندك، ونجاوبك بطريقة مباشرة.',
        french: 'Parfait, on reste en Free Talk.\nPose-moi ta question sur l’IA, le business, l’IT, le marketing ou une idée de projet, et je te réponds directement.',
        english: 'Perfect, we’ll keep it as Free Talk.\nAsk me about AI, business, IT, marketing, or a project idea, and I’ll answer directly.'
      }) };
    }
    if (wantsBuildProject(raw) && !hasReadyBrief()) {
      talkUX.mode = 'collecting';
      return { reply: askProjectBasics(raw) };
    }
    if (talkUX.mode === 'collecting' && !hasReadyBrief()) {
      if (isTinyAgreement(raw)) {
        return { reply: replyByLanguage(raw, {
          darija_latin: 'Wakha, fhemtk mtaf9. Ba9i khasni ghir infos dyal projet:\n\n**Smit projet + description 9sira + ville ola Morocco kaml**\n\nKtebhom f message wa7da, w n7llelhom direct.',
          arabic: 'تمام، فهمت أنك موافق. باقي خاصني غير المعلومات ديال المشروع:\n\n**سميت المشروع + وصف قصير + المدينة ولا المغرب كامل**\n\nكتبهم فـ رسالة وحدة، وأنا نحللهم مباشرة.',
          french: 'Parfait, j’ai compris que tu es d’accord. Il me manque juste les infos du projet :\n\n**Nom + description courte + ville ou Maroc entier**\n\nEnvoie-les en un seul message, et je les analyse directement.',
          english: 'Perfect, I understood that you agree. I still need the project info:\n\n**Name + short description + city or all Morocco**\n\nSend them in one message and I’ll analyze them directly.'
        }) };
      }
      const patch = extractProjectBasics(raw);
      mergeLocalBriefPatch(patch);
      if (hasReadyBrief()) {
        talkUX.awaitingConfirmation = true;
        return { reply: confirmBriefText(raw) };
      }
      const missing = (projectBriefStatus && projectBriefStatus.missing && projectBriefStatus.missing.length) ? projectBriefStatus.missing.join('، ') : 'وصف أوضح';
      return { reply: replyByLanguage(raw, {
        darija_latin: 'Qrib nfhemk mzyan. Ba9i khasni: **' + missing + '**.\n\n3tiniha b ikhtisar, bla details bzaf.',
        arabic: 'قريب نفهمك مزيان. باقي خاصني: **' + missing + '**.\n\nعطينيها باختصار، وما نحتاجش تفاصيل كثيرة.',
        french: 'On est presque bon. Il me manque : **' + missing + '**.\n\nDonne-moi ça brièvement, sans trop de détails.',
        english: 'We’re almost there. I still need: **' + missing + '**.\n\nSend it briefly, no need for too many details.'
      }) };
    }
    if (talkUX.awaitingConfirmation && isAffirmationMessage(raw) && hasReadyBrief()) {
      projectBriefConfirmed = true;
      talkUX.awaitingConfirmation = false;
      updateAgentLocks();
      return { reply: replyByLanguage(raw, {
        darija_latin: 'Mzyan, daba projet wade7.\nStep jaya hiya **Namaa Design** bach nkhrjo logo w mockups mnasbin.',
        arabic: 'مزيان، دابا المشروع واضح.\nالخطوة الجاية هي **Namaa Design** باش نخرجو logo و mockups مناسبين للمشروع.',
        french: 'Très bien, le projet est clair.\nLa prochaine étape est **Namaa Design** pour créer le logo et les mockups adaptés.',
        english: 'Great, the project is clear now.\nNext step is **Namaa Design** so we can create the right logo and mockups.'
      }), handoffs: [{
        agent: 'design',
        label: 'فتح Namaa Design',
        agentLabel: 'Namaa Design',
        displayMessage: 'فتح Namaa Design with this confirmed project brief',
        prompt: 'Use the confirmed Namaa project brief from Business Talk. Create logo + category-specific mockups only. This is step 2 after Namaa Talk.'
      }] };
    }
    return null;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function formatMessageHtml(value) {
    return escapeHtml(value)
      .replace(/\*\*([^*]{1,80})\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function formatStrategyText(value, options) {
    const text = String(value || '').replace(/\r/g, '').trim();
    if (!text) return '<p>Waiting for Namaa Strategy output.</p>';
    const lines = text.split('\n').map(function (line) { return line.trim(); }).filter(Boolean);
    const chunks = [];
    let list = [];
    function flushList() {
      if (!list.length) return;
      chunks.push('<ul class="strategy-mini-list">' + list.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>');
      list = [];
    }
    lines.slice(0, options && options.maxLines ? options.maxLines : 28).forEach(function (line) {
      const cleaned = line.replace(/^[-•*\d.)\s]+/, '').trim();
      if (!cleaned) return;
      const safe = escapeHtml(cleaned).replace(/^([^:]{2,34}):\s*(.*)$/u, '<strong>$1:</strong> $2');
      if (/^[-•*\d.)\s]/.test(line) || line.includes(':')) {
        list.push(safe);
      } else {
        flushList();
        chunks.push('<p>' + safe + '</p>');
      }
    });
    flushList();
    return chunks.join('') || '<p>' + escapeHtml(text.slice(0, 600)) + '</p>';
  }

  function strategyIcon(slot) {
    return slot === 'market' ? '⌁' : slot === 'digital' ? '◎' : '↗';
  }

  function strategyBoardMeta(slot) {
    const labels = {
      market: ['01', 'Market Research', 'Understand demand, audience and opportunity'],
      digital: ['02', 'Digital Marketing Strategy', 'Turn attention into qualified leads'],
      roadmap: ['03', 'Roadmap', '30/60/90 days execution plan']
    };
    return labels[slot] || ['00', 'Namaa Strategy', 'Final visual board'];
  }

  function strategyBulletItems(value, limit) {
    const text = String(value || '').replace(/\r/g, '').trim();
    const lines = text.split('\n').map(function (line) { return line.trim(); }).filter(Boolean);
    const items = [];
    lines.forEach(function (line) {
      const cleaned = line
        .replace(/^#{1,6}\s*/, '')
        .replace(/^[-•*\d.)\s]+/, '')
        .replace(/\*\*/g, '')
        .trim();
      if (!cleaned) return;
      if (/^(PICTURE|STRATEGY SNAPSHOT|KPI DASHBOARD|FINAL ACTION)/i.test(cleaned)) return;
      items.push(cleaned);
    });
    return items.slice(0, limit || 7);
  }

  function boardHtml(slot, text, loading) {
    const meta = strategyBoardMeta(slot);
    const items = strategyBulletItems(text, 6);
    const loadingClass = loading ? ' is-loading' : '';
    const fallback = {
      market: ['شنو كاين فالسوق؟', 'شكون هو الجمهور المناسب؟', 'فين كاينة الفرصة؟', 'شنو خاصنا نبينو باش نبنيو الثقة؟'],
      digital: ['وعد واضح للعرض', 'قنوات التسويق الأولى', 'محتوى كيجيب الثقة', 'WhatsApp/CRM باش ما يضيع حتى lead'],
      roadmap: ['30 يوم: إطلاق منظم', '60 يوم: تحسين وقياس', '90 يوم: توسيع اللي خدام', 'أهم KPI خاص يتراقب']
    }[slot] || ['Namaa board will appear here'];
    const finalItems = (items.length ? items : fallback).slice(0, 6);
    return '<div class="strategy-diagram-board strategy-board-modal-view' + loadingClass + '" data-board-kind="' + escapeHtml(slot) + '">'
      + '<div class="strategy-diagram-bg">Namaa</div>'
      + '<div class="strategy-board-brand-mini"><span class="brand-n">N</span><div><strong>Namaa AI</strong><small>Created by Elboubakry Abdessamad</small></div></div>'
      + '<div class="strategy-diagram-head">'
        + '<span class="strategy-diagram-icon">' + strategyIcon(slot) + '</span>'
        + '<div><small>' + meta[0] + ' / ' + escapeHtml(meta[1]).toUpperCase() + '</small><h3>' + escapeHtml(meta[1]) + '</h3><p>' + escapeHtml(meta[2]) + '</p></div>'
      + '</div>'
      + '<div class="strategy-diagram-flow">' + finalItems.map(function (item, index) {
          return '<div class="strategy-diagram-step"><span>' + String(index + 1).padStart(2, '0') + '</span><p>' + escapeHtml(item) + '</p></div>';
        }).join('') + '</div>'
      + '<div class="strategy-diagram-footer"><span>Namaa AI</span><strong>Strategy board</strong></div>'
      + '</div>';
  }

  function strategyCompactCardHtml(slot, text) {
    const meta = strategyBoardMeta(slot);
    const items = strategyBulletItems(text, 3);
    const fallback = {
      market: ['السوق والجمهور', 'المنافسين والفرصة', 'الثقة والطلب'],
      digital: ['العرض والقنوات', 'المحتوى والإعلانات', 'WhatsApp و CRM'],
      roadmap: ['30 يوم', '60 يوم', '90 يوم']
    }[slot] || ['ملخص', 'خطوات', 'نتيجة'];
    const finalItems = (items.length ? items : fallback).slice(0, 3);
    return '<div class="strategy-compact-card" data-board-kind="' + escapeHtml(slot) + '">'
      + '<div class="strategy-compact-top"><span>' + meta[0] + '</span><strong>' + escapeHtml(meta[1]) + '</strong><em>' + strategyIcon(slot) + '</em></div>'
      + '<p>' + escapeHtml(meta[2]) + '</p>'
      + '<ul>' + finalItems.map(function(item){ return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>'
      + '<small>كليكي باش تشوف التفاصيل</small>'
      + '</div>';
  }

  function cardHtml(text, loading) {
    return '<div class="strategy-card-content' + (loading ? ' is-loading' : '') + '">' + formatStrategyText(text, { maxLines: 18 }) + '</div>';
  }


  function hasProjectBrief() {
    return Boolean(projectBrief && typeof projectBrief === 'object' && Object.keys(projectBrief).length);
  }

  function hasReadyBrief() {
    return hasProjectBrief() && (projectBriefConfirmed || (projectBriefStatus && (projectBriefStatus.isReady || projectBriefStatus.level === 'ready' || projectBriefStatus.score >= 85)));
  }

  function updateFlowState(kind, ready) {
    if (!kind || !(kind in flowState)) return;
    flowState[kind] = Boolean(ready);
    updateAgentLocks();
  }

  function flowWarning(targetAgent) {
    if (targetAgent === 'design' && !hasReadyBrief()) {
      return 'خاصك تبدا من Namaa Talk: عطيو فكرة المشروع، خليه يفهمها، ومن بعد جاوب بنعم. ملي brief يتأكد، Namaa Design غادي يتحل.';
    }
    if (targetAgent === 'website' && !flowState.designReady) {
      return 'كمّل Namaa Design الأول. Website خاصو logo و mockups باش يبني preview مزيان.';
    }
    if (targetAgent === 'strategy' && !flowState.websiteReady) {
      return 'كمّل Namaa Website الأول. Strategy هي آخر خطوة: market research + strategy + roadmap من بعد preview.';
    }
    return '';
  }

  function isAgentUnlocked(agent) {
    if (agent === 'business') return true;
    if (agent === 'design') return hasReadyBrief();
    if (agent === 'website') return Boolean(flowState.designReady);
    if (agent === 'strategy') return Boolean(flowState.websiteReady);
    return false;
  }

  function lockedAgentLabel(agent) {
    if (agent === 'design') return 'كيحل من بعد Namaa Talk';
    if (agent === 'website') return 'كيحل من بعد Namaa Design';
    if (agent === 'strategy') return 'كيحل من بعد Namaa Website';
    return '';
  }

  function updateAgentLocks() {
    agentButtons.forEach(function (button) {
      const agent = button.dataset.agent;
      const unlocked = isAgentUnlocked(agent);
      button.classList.toggle('is-locked', !unlocked);
      button.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
      button.dataset.locked = unlocked ? 'false' : 'true';
      const oldBadge = button.querySelector('.agent-lock-badge');
      if (oldBadge) oldBadge.remove();
      if (!unlocked) {
        const badge = document.createElement('em');
        badge.className = 'agent-lock-badge';
        badge.textContent = 'Locked';
        badge.setAttribute('aria-hidden', 'true');
        button.appendChild(badge);
        button.title = lockedAgentLabel(agent);
      } else {
        button.removeAttribute('title');
      }
    });
  }

  function showWorkspaceNotice(agent, text) {
    const message = String(text || '').trim();
    if (!message) return;
    if (agent === 'design' && designIntro) designIntro.textContent = message;
    if (agent === 'website' && websiteIntro) websiteIntro.textContent = message;
    if (agent === 'strategy' && strategyIntro) strategyIntro.textContent = message;
  }

  function ensureFlowStep(agent) {
    const warning = flowWarning(agent);
    if (!warning) return true;
    showWorkspaceNotice(agent, warning);
    return false;
  }

  function startDesignAutoIfReady() {
    if (activeAgent !== 'design') return;
    if (!hasReadyBrief()) return;
    if (designAutoStarted || flowState.designReady || isSending) return;
    designAutoStarted = true;
    window.setTimeout(function () {
      if (activeAgent !== 'design' || flowState.designReady || isSending) return;
      const prompt = 'Use the confirmed project brief. Generate ONLY a visual design pack: one logo concept first, then category-specific mockups. No long explanation, no color section, no strategy. The final result must guide Gemini image generation for a single premium mockup board like a design lab: logo + relevant mockups for this project category.';
      sendDesignPrompt(prompt, { handoffFrom: 'auto-design-lab' });
    }, 350);
  }

  function normalizeReply(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    return data.answer || data.reply || data.text || data.output || data.content || data.message || (data.data && (data.data.answer || data.data.reply || data.data.text)) || '';
  }


  function designChatIntroText() {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const project = b.projectName || b.project || 'المشروع ديالك';
    const desc = b.description || b.offer || 'الفكرة اللي شرحتي';
    const city = b.city || b.market || 'المغرب';
    return 'مرحبا، أنا Namaa Design 🎨\n\nفهمت المشروع ديالك هكذا:\n\n**المشروع:** ' + project + '\n**الفكرة:** ' + desc + '\n**السوق:** ' + city + '\n\nنقدر نوجد لك دابا **logo + mockups** مناسبين للمشروع.\n\nواش نبدأ؟';
  }

  function startDesignChatIfReady() {
    if (activeAgent !== 'design') return;
    if (!hasReadyBrief()) return;
    if (designChatIntroShown) return;
    designChatIntroShown = true;
    designAwaitingStart = true;
    const item = addMessage('assistant', designChatIntroText());
    addChoiceButtons(item, [{ label: 'نعم، وجد التصميم', value: 'نعم وجد التصميم' }]);
    if (input) input.placeholder = 'جاوب بنعم باش Namaa Design يخرج logo و mockups...';
  }

  function designFallbackBoardHtml() {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const project = escapeHtml(b.projectName || b.project || 'Namaa Project');
    const city = escapeHtml(b.city || b.market || 'Morocco');
    const labels = mockupLabelsFromHint().slice(0, 6);
    const safeLabels = labels.length ? labels : ['Logo', 'Landing hero', 'Mobile app', 'LinkedIn', 'Pitch cover', 'Dashboard'];
    return '<div class="chat-visual-board is-premium-fallback">'
      + '<div class="chat-visual-hero"><div class="chat-visual-logo">N</div><div><strong>' + project + '</strong><span>' + city + ' · logo + visual mockups</span></div></div>'
      + '<div class="visual-mockup-scene">'
        + '<div class="mockup-laptop"><div class="mockup-bar"><i></i><i></i><i></i><span>' + project + '</span></div><div class="mockup-hero"><b>' + project + '</b><small>' + city + '</small><em>Landing page preview</em></div></div>'
        + '<div class="mockup-phone"><div class="phone-notch"></div><div class="phone-logo">N</div><p>' + project + '</p><span>Mobile app</span></div>'
        + '<div class="mockup-brand-card"><strong>N</strong><span>Logo concept</span></div>'
      + '</div>'
      + '<div class="chat-visual-grid compact">' + safeLabels.map(function(label){ return '<div class="chat-visual-tile"><span>' + escapeHtml(label) + '</span></div>'; }).join('') + '</div>'
      + '<p class="chat-visual-note">ها هو visual pack الأولي ديال المشروع. نقدر دابا نكملو لـ Namaa Dev باش يخرج landing page mockup.</p>'
      + '</div>';
  }

  function designImageBubbleHtml(imageUrl, mimeType) {
    return '<div class="chat-generated-visual">'
      + '<p><strong>ها هو أول باك بصري ديال المشروع ✅</strong><br>اللوغو والموكابات واجدين. إلا عجبك الاتجاه، دوز لـ Namaa Dev.</p>'
      + '<div class="chat-generated-frame"><img src="' + escapeHtml(imageUrl) + '" alt="Namaa Design logo and mockups" /></div>'
      + '</div>';
  }

  async function sendDesignChatPrompt(raw, extra) {
    const message = String(raw || '').trim();
    if (!message || isSending) return;
    if (!ensureFlowStep('design')) { setAgent('business'); return; }
    isSending = true;
    lastUserPrompt = message;
    chatHistory.push({ role: 'user', content: message });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    const displayMessage = extra && extra.displayMessage ? String(extra.displayMessage).trim() : message;
    addMessage('user', displayMessage || message);
    if (input) { input.value = ''; resizeInput(); }
    const loading = addMessage('assistant', 'تمام، كنوجد لك اللوغو والموكابات دابا... لحظة صغيرة 🎨', { loading: true });
    const imagePrompt = imagePromptFromDesign('Create the final visual result now. No text report. Generate one premium board with logo and project-specific mockups only.');
    const result = await callImageGeneration(imagePrompt);
    const data = result.data || {};
    const image = data.image || {};
    const imageUrl = image.dataUrl || image.url || image.src || data.imageUrl;
    let html = '';
    if (result.ok && imageUrl) {
      html = designImageBubbleHtml(imageUrl, image.mimeType || 'image/jpeg');
      lastDesignAnswer = 'Namaa Design generated a visual logo and mockups board for the confirmed project.';
    } else {
      html = '<p><strong>ها هو أول visual pack ديال المشروع ✅</strong></p>' + designFallbackBoardHtml();
      lastDesignAnswer = 'Namaa Design prepared a fallback visual mockup board because image generation was unavailable.';
    }
    flowState.designReady = true;
    updateAgentLocks();
    if (loading) {
      loading.classList.remove('loading');
      const bubble = loading.querySelector('.message-bubble');
      if (bubble) bubble.innerHTML = html;
      addHandoffs(loading, frontendHandoffsForActive());
    } else {
      const item = addMessage('assistant', 'Design ready.');
      const bubble = item && item.querySelector('.message-bubble');
      if (bubble) bubble.innerHTML = html;
      addHandoffs(item, frontendHandoffsForActive());
    }
    lastAgentAnswer = lastDesignAnswer;
    chatHistory.push({ role: 'assistant', content: lastDesignAnswer });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    isSending = false;
    if (sendButton) sendButton.disabled = false;
    if (input) input.focus();
    scrollToBottom();
  }

  function setAgent(agent) {
    const next = AGENTS[agent] ? agent : 'business';
    activeAgent = next;
    if (shell) shell.dataset.agent = next;
    const data = AGENTS[next];
    if (title) title.textContent = data.title;
    if (subtitle) subtitle.textContent = data.subtitle;
    if (kicker) kicker.textContent = data.kicker;
    if (input) input.placeholder = data.placeholder;
    agentButtons.forEach((button) => button.classList.toggle('active', button.dataset.agent === next));
    updateAgentLocks();
    document.body.classList.remove('sidebar-open');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
    if (next === 'design') {
      refreshDesignBriefCard();
      if (ensureFlowStep('design')) startDesignChatIfReady();
    } else if (next === 'website') {
      refreshWebsiteBriefCard();
      if (ensureFlowStep('website')) startWebsiteChatIfReady();
    } else if (next === 'strategy') {
      refreshStrategyBriefCard();
      if (ensureFlowStep('strategy')) startStrategyChatIfReady();
    } else if (input) {
      input.focus();
    }
  }

  function resetChat() {
    if (messages) messages.innerHTML = '';
    if (stage) stage.classList.remove('has-messages');
    lastUserPrompt = '';
    lastAgentAnswer = '';
    lastDesignAnswer = '';
    lastWebsiteAnswer = '';
    lastStrategyAnswer = '';
    lastWebsiteCode = '';
    chatHistory = [];
    projectBrief = {};
    projectBriefStatus = null;
    projectBriefConfirmed = false;
    strategyPackPopupShown = false;
    flowState.designReady = false;
    flowState.websiteReady = false;
    flowState.strategyReady = false;
    flowState.packRequested = false;
    designAutoStarted = false;
    designChatIntroShown = false;
    designAwaitingStart = false;
    websiteChatIntroShown = false;
    websiteAwaitingStart = false;
    strategyChatIntroShown = false;
    strategyAwaitingStart = false;
    talkUX.mode = 'start';
    talkUX.language = 'darija_ar';
    talkUX.askedBasics = false;
    talkUX.awaitingConfirmation = false;
    talkUX.basicsTries = 0;
    resetDesignWorkspace();
    resetWebsiteWorkspace();
    resetStrategyWorkspace();
    if (input) {
      input.value = '';
      resizeInput();
      input.focus();
    }
    setAgent('business');
    updateAgentLocks();
  }

  function addMessage(role, text, options) {
    if (!messages || !stage) return null;
    stage.classList.add('has-messages');
    const item = document.createElement('div');
    item.className = 'namaa-message ' + (role === 'user' ? 'user' : 'assistant') + (options && options.loading ? ' loading' : '');
    const avatar = role === 'user' ? '' : '<div class="message-avatar">N</div>';
    item.innerHTML = avatar + '<div class="message-wrap"><div class="message-bubble" dir="auto">' + formatMessageHtml(text) + '</div></div>';
    messages.appendChild(item);
    requestAnimationFrame(scrollToBottom);
    return item;
  }

  function addHandoffs(targetItem, handoffs) {
    if (!targetItem) return;
    const safeFlowHandoffs = frontendHandoffsForActive();
    const sourceHandoffs = safeFlowHandoffs.length ? safeFlowHandoffs : (Array.isArray(handoffs) ? handoffs : []);
    const allowed = sourceHandoffs.filter(function (handoff) {
      const targetAgent = handoff.agent || handoff.target || 'business';
      if (activeAgent === 'business') return targetAgent === 'design' && hasReadyBrief();
      if (activeAgent === 'design') return targetAgent === 'website' && flowState.designReady;
      if (activeAgent === 'website') return targetAgent === 'strategy' && flowState.websiteReady;
      return false;
    });
    if (!allowed.length) return;
    const wrapper = targetItem.querySelector('div:last-child');
    if (!wrapper) return;
    const actions = document.createElement('div');
    actions.className = 'namaa-handoffs';
    allowed.slice(0, 1).forEach((handoff) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'handoff-button';
      button.textContent = handoff.label || ('Continue with ' + (handoff.agentLabel || handoff.agent));
      button.addEventListener('click', function () {
        const fromAgent = activeAgent;
        const sourcePrompt = lastUserPrompt;
        const sourceAnswer = lastAgentAnswer;
        const targetAgent = handoff.agent || handoff.target || 'business';
        const prompt = handoff.prompt || ('Continue this work with ' + targetAgent);
        const displayMessage = handoff.displayMessage || ('Open ' + (handoff.agentLabel || targetAgent) + ' with this project brief');
        if (!canOpenAgent(targetAgent)) {
          addMessage('assistant', explainLockedAgent(targetAgent));
          return;
        }
        setAgent(targetAgent);
        if (targetAgent === 'design' || targetAgent === 'website') {
          return;
        }
        sendPrompt(prompt, {
          handoffFrom: fromAgent,
          previousUserPrompt: sourcePrompt,
          previousAgentAnswer: sourceAnswer,
          handoffBrief: projectBrief,
          displayMessage: displayMessage
        });
      });
      actions.appendChild(button);
    });
    wrapper.appendChild(actions);
  }

  function validPackEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value || '').trim());
  }

  function isAffirmationMessage(value) {
    const text = String(value || '').trim().toLowerCase();
    return /^(yes|yes sir|oui|ok|okay|safi|s7i7|sah|صح|نعم|ايه|ah|iyeh|yep|correct|true|تمام)$/i.test(text);
  }

  function requiredAgentFor(targetAgent) {
    if (targetAgent === 'design') return 'business';
    if (targetAgent === 'website') return flowState.designReady ? 'website' : (hasReadyBrief() ? 'design' : 'business');
    if (targetAgent === 'strategy') {
      if (flowState.websiteReady) return 'strategy';
      if (flowState.designReady) return 'website';
      return hasReadyBrief() ? 'design' : 'business';
    }
    return targetAgent;
  }

  function canOpenAgent(targetAgent) {
    return !flowWarning(targetAgent);
  }

  function explainLockedAgent(targetAgent) {
    const warning = flowWarning(targetAgent);
    if (!warning) return '';
    const required = requiredAgentFor(targetAgent);
    const requiredLabel = required === 'business' ? 'Namaa Business Talk' : (required === 'design' ? 'Namaa Design' : (required === 'website' ? 'Namaa Website' : 'Namaa Strategy'));
    return warning + '\n\nدابا خاصك تكمل الخطوة اللي قبل: ' + requiredLabel + '.';
  }

  function frontendHandoffsForActive() {
    if (activeAgent === 'business' && hasReadyBrief()) {
      return [{
        agent: 'design',
        label: 'فتح Namaa Design',
        agentLabel: 'Namaa Design',
        displayMessage: 'فتح Namaa Design with this confirmed project brief',
        prompt: 'فتح Namaa Design chat with the confirmed project brief. Ask for confirmation, then generate a logo and mockups visual board inside the chat.'
      }];
    }
    if (activeAgent === 'design' && flowState.designReady) {
      return [{
        agent: 'website',
        label: 'فتح Namaa Dev',
        agentLabel: 'Namaa Website',
        displayMessage: 'فتح Namaa Dev with this design',
        prompt: 'Use the previous Namaa Design output and current project brief. Build a real landing page and show it as a live browser preview. Do not show source code in the UI.'
      }];
    }
    if (activeAgent === 'website' && flowState.websiteReady) {
      return [{
        agent: 'strategy',
        label: 'فتح Namaa Strategy',
        agentLabel: 'Namaa Strategy',
        displayMessage: 'فتح Namaa Strategy with this website preview',
        prompt: 'Use the confirmed project brief, previous Namaa Design output, and current Namaa Website landing page preview. Generate the final Namaa Strategy boards: market research, digital marketing strategy, roadmap and a short founder message. This is the final step after Talk → Design → Website.'
      }];
    }
    return [];
  }

  function packModalMessage(text, isError) {
    if (!packStatus) return;
    packStatus.textContent = text || '';
    packStatus.classList.toggle('is-error', Boolean(isError));
  }

  function openPackModal(auto) {
    if (!packModal) return;
    if (auto && strategyPackPopupShown) return;
    strategyPackPopupShown = true;
    packModal.classList.add('is-open');
    packModal.setAttribute('aria-hidden', 'false');
    packModalMessage('', false);
    window.setTimeout(function () {
      if (packEmail) packEmail.focus();
    }, 80);
  }

  function closePackModal() {
    if (!packModal) return;
    packModal.classList.remove('is-open');
    packModal.setAttribute('aria-hidden', 'true');
  }

  function compactPackText(value, max) {
    const text = String(value || '').replace(/\r/g, '').trim();
    return text.length > max ? text.slice(0, max - 3) + '...' : text;
  }

  function base64UrlEncodeUnicode(value) {
    const json = String(value || '');
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function buildPackSnapshot(email) {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    return {
      brand: 'Namaa AI',
      createdBy: 'Elboubakry Abdessamad',
      email: String(email || '').trim().toLowerCase(),
      generatedAt: new Date().toISOString(),
      flow: 'Namaa Talk → Namaa Design → Namaa Website → Namaa Strategy',
      projectTitle: b.projectName || b.category || b.offer || b.goal || 'Namaa AI Project',
      projectBrief: b,
      designOutput: compactPackText(lastDesignAnswer, 2600),
      websiteOutput: compactPackText(lastWebsiteAnswer, 1900),
      strategyOutput: compactPackText(lastStrategyAnswer, 3600),
      websitePreviewReady: Boolean(lastWebsiteCode)
    };
  }

  function buildPackLink(email) {
    const snapshot = buildPackSnapshot(email);
    const target = new URL('pack/', window.location.href);
    target.hash = 'p=' + base64UrlEncodeUnicode(JSON.stringify(snapshot));
    return target.toString();
  }

  function packPayload(email) {
    const packLink = buildPackLink(email);
    return {
      email: String(email || '').trim(),
      packLink: packLink,
      pack_link: packLink,
      leadType: 'Namaa Full Pack Request',
      source: 'Namaa AI',
      page: window.location.href,
      flow: 'Namaa Talk → Namaa Design → Namaa Website → Namaa Strategy',
      projectBrief: projectBrief || {},
      briefStatus: projectBriefStatus || null,
      designOutput: lastDesignAnswer || '',
      websiteOutput: lastWebsiteAnswer || '',
      websitePreviewReady: Boolean(lastWebsiteCode),
      strategyOutput: lastStrategyAnswer || '',
      createdAt: new Date().toISOString()
    };
  }

  async function submitPackLead(email) {
    // CRM/Sheet is intentionally parked until the final CRM update.
    // We still create the pack link locally so the final wiring can reuse it.
    const payload = packPayload(email);
    return { ok: true, parked: true, email: payload.email, packLink: payload.packLink, emailSent: false };
  }

  function isStageNearBottom() {
    if (!stage) return true;
    return stage.scrollHeight - stage.scrollTop - stage.clientHeight < 96;
  }

  function updateScrollButton() {
    if (!scrollBottomButton || !stage) return;
    const canScroll = stage.scrollHeight > stage.clientHeight + 80;
    const show = canScroll && !isStageNearBottom();
    scrollBottomButton.hidden = !show;
    scrollBottomButton.classList.toggle('is-visible', show);
  }

  function scrollToBottom(options) {
    if (!stage) return;
    const smooth = options && options.smooth;
    stage.scrollTo({
      top: stage.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
    window.setTimeout(updateScrollButton, smooth ? 260 : 40);
  }

  function resizeInput() {
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 180) + 'px';
  }

  function mergeBriefFromResponse(data) {
    if (!data || typeof data !== 'object') return;
    if (data.brief && typeof data.brief === 'object') projectBrief = data.brief;
    if (data.briefStatus && typeof data.briefStatus === 'object') projectBriefStatus = data.briefStatus;
    if (data.briefConfirmed === true) {
      projectBriefConfirmed = true;
      updateAgentLocks();
    }
  }

  function cleanText(value, max) {
    const text = String(value || '').replace(/\r/g, '').trim();
    return max ? text.slice(0, max) : text;
  }

  function briefSummary() {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const rows = [
      ['Project', b.projectName || b.category || b.offer],
      ['City / market', b.city || b.market],
      ['Target', b.targetCustomer || b.target],
      ['Budget', b.budget],
      ['Goal', b.goal],
      ['Stage', b.stage],
      ['Style', b.style || b.language]
    ].filter((row) => row[1]);
    if (!rows.length) return 'No confirmed brief yet. Start with Namaa Business Talk, confirm the brief, then open Namaa Design.';
    return rows.map((row) => row[0] + ': ' + row[1]).join('\n');
  }

  function sectionFrom(text, starts, stops) {
    const source = cleanText(text);
    const lower = source.toLowerCase();
    let startIndex = -1;
    let startLength = 0;
    starts.some(function (label) {
      const i = lower.indexOf(label.toLowerCase());
      if (i >= 0) {
        startIndex = i;
        startLength = label.length;
        return true;
      }
      return false;
    });
    if (startIndex < 0) return '';
    let endIndex = source.length;
    stops.forEach(function (label) {
      const i = lower.indexOf(label.toLowerCase(), startIndex + startLength);
      if (i >= 0 && i < endIndex) endIndex = i;
    });
    return source.slice(startIndex + startLength, endIndex).replace(/^[:\s\-–—]+/, '').trim();
  }

  function setSlot(slot, text, loading) {
    const card = designWorkspace && designWorkspace.querySelector('[data-design-slot="' + slot + '"] .design-card-body');
    if (!card) return;
    card.classList.toggle('is-loading', Boolean(loading));
    card.textContent = text || 'Waiting for Namaa Design output.';
  }

  function designBody(slot) {
    return designWorkspace && designWorkspace.querySelector('[data-design-slot="' + slot + '"] .design-card-body');
  }

  function mockupLabelsFromHint() {
    const hint = designCategoryHint ? designCategoryHint() : '';
    if (/SaaS|app/i.test(hint)) return ['Logo', 'Dashboard', 'Mobile app', 'Landing hero', 'Pitch cover', 'LinkedIn'];
    if (/E-commerce/i.test(hint)) return ['Logo', 'Packaging', 'Product page', 'Mobile store', 'Instagram ad', 'COD card'];
    if (/Clinic|beauty/i.test(hint)) return ['Logo', 'Booking page', 'Service card', 'Instagram post', 'Signage', 'Appointment'];
    if (/Restaurant/i.test(hint)) return ['Logo', 'Menu', 'Flyer', 'Storefront', 'Instagram', 'Reservation'];
    if (/Real estate/i.test(hint)) return ['Logo', 'Listing page', 'Brochure', 'Visit card', 'Social post', 'Map card'];
    if (/Education/i.test(hint)) return ['Logo', 'Course page', 'Certificate', 'Program cards', 'Social post', 'Enrollment'];
    if (/Agency|service/i.test(hint)) return ['Logo', 'Landing hero', 'Service cards', 'Proposal', 'LinkedIn', 'WhatsApp'];
    return ['Logo', 'Website', 'Mobile', 'Social', 'Business card', 'WhatsApp'];
  }

  function renderDesignLabCards(state) {
    const logo = designBody('logo');
    if (logo) {
      logo.className = 'design-card-body design-logo-lab' + (state === 'loading' ? ' is-loading' : '');
      logo.innerHTML = '<div class="logo-lab-mark">N</div><p>' + escapeHtml(state === 'done' ? 'Logo concept ready in visual board.' : state === 'loading' ? 'Namaa kayوجد logo...' : 'Logo concept ghadi yban hna.') + '</p>';
    }
    const mockups = designBody('mockups');
    if (mockups) {
      mockups.className = 'design-card-body design-mockup-lab' + (state === 'loading' ? ' is-loading' : '');
      mockups.innerHTML = mockupLabelsFromHint().slice(0, 6).map(function (label) { return '<div class="mockup-tile">' + escapeHtml(label) + '</div>'; }).join('');
    }
  }

  function imageExtension(mimeType) {
    const mime = String(mimeType || '').toLowerCase();
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
    if (mime.includes('webp')) return 'webp';
    if (mime.includes('png')) return 'png';
    return 'jpg';
  }

  function projectFileName(prefix, mimeType) {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const base = (b.projectName || b.category || b.offer || 'namaa-design')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 52) || 'namaa-design';
    return prefix + '-' + base + '.' + imageExtension(mimeType);
  }

  function designCategoryHint() {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const value = Object.values(b).flat().join(' ').toLowerCase() + ' ' + String(lastUserPrompt || '').toLowerCase();
    if (/saas|application|app|logiciel|software|dashboard|marketplace/.test(value)) return 'SaaS/app mockups: app logo, desktop dashboard, mobile app screen, landing hero, pitch cover, LinkedIn launch post.';
    if (/ecommerce|e-commerce|boutique|store|shop|produit|product|cod|packaging|vêtement|vetement|hwayej|l7wayej/.test(value)) return 'E-commerce mockups: logo, product packaging, product page, Instagram ad, mobile store screen, delivery/COD card.';
    if (/clinic|clinique|medical|médecin|medecin|beauty|beauté|aesthetic|laser|salon|spa/.test(value)) return 'Clinic/beauty mockups: logo, appointment page, service card, Instagram post, booking card, reception/signage card.';
    if (/restaurant|cafe|café|food|snack|patisserie|pâtisserie/.test(value)) return 'Restaurant mockups: logo, menu, flyer, storefront/roll-up, Instagram post, delivery/reservation card.';
    if (/immobilier|real estate|property|airbnb/.test(value)) return 'Real estate mockups: logo, property listing page, brochure cover, visit booking card, social post, map/location card.';
    if (/formation|school|école|ecole|cours|education|coaching/.test(value)) return 'Education mockups: logo, course landing page, certificate, program cards, Instagram post, enrollment CTA.';
    if (/agence|agency|consulting|consultant|marketing|service/.test(value)) return 'Agency/service mockups: logo, landing hero, service cards, proposal cover, LinkedIn cover, WhatsApp lead card.';
    return 'Moroccan business mockups: logo, landing page hero, mobile preview, social post, business card or service card, WhatsApp CTA card.';
  }

  function imagePromptFromDesign(text) {
    return [
      'Create ONE premium realistic design-lab mockup board for Namaa Design.',
      'The image must look like a professional branding/mockup presentation, similar to a clean portfolio mockup board.',
      'Show only visual assets, not long explanations.',
      'Required composition:',
      '1. Main logo concept first, large and clear.',
      '2. Category-specific mockups around it, based on the project type.',
      '3. Realistic devices, papers, cards, packaging, social screens or business assets depending on category.',
      '4. Clean white/soft background, premium lighting, strong hierarchy, Moroccan business-ready style.',
      '5. Minimal readable labels only: project name, Namaa, and short asset labels if needed. Avoid paragraphs and tiny text.',
      '',
      'CATEGORY MOCKUP HINT:',
      designCategoryHint(),
      '',
      'PROJECT BRIEF:',
      briefSummary(),
      '',
      'DESIGN NOTES FOR IMAGE MODEL:',
      cleanText(text, 1300)
    ].join('\n');
  }

  function setImagePlaceholder(text, imageUrl, imageMeta) {
    const frame = document.getElementById('namaaDesignImageFrame');
    if (!frame) return;
    if (imageUrl) {
      const mimeType = imageMeta && imageMeta.mimeType || 'image/jpeg';
      projectFileName('namaa-jpg-preview', mimeType);
      frame.innerHTML = '<div class="generated-image-wrap">'
        + '<img src="' + escapeHtml(imageUrl) + '" alt="Namaa Design generated JPG visual" />'
        + '<div class="generated-image-actions">'
        + '<span class="generated-image-note">Logo + mockups ready. Review the visual, then continue to Website.</span>'
        + '<button type="button" id="namaaRegenerateImage">Regenerate mockups</button>'
        + '</div>'
        + '</div>';
      const retry = document.getElementById('namaaRegenerateImage');
      if (retry) retry.addEventListener('click', function () { generateDesignImage(lastDesignAnswer || briefSummary()); });
      return;
    }
    frame.innerHTML = '<div><div class="design-preview-mark">N</div><p>' + escapeHtml(text || 'Logo + mockups board ghadi yban hna.') + '</p></div>';
  }

  function setImageLoading(text) {
    const frame = document.getElementById('namaaDesignImageFrame');
    if (!frame) return;
    frame.innerHTML = '<div class="image-loading"><div class="design-preview-mark">N</div><p>' + escapeHtml(text || 'Namaa Design kay9ad logo + mockups daba...') + '</p><span>● ● ●</span></div>';
  }

  async function callImageGeneration(prompt) {
    const controller = new AbortController();
    const timeout = window.setTimeout(function () { controller.abort(); }, 90000);
    try {
      const response = await fetch('/api/namaa/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: prompt,
          message: prompt,
          brief: projectBrief,
          aspectRatio: '16:9',
          ratio: '16:9',
          source: 'namaa-design-workspace-update-79'
        })
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();
      return { ok: response.ok, data: data };
    } catch (error) {
      return { ok: false, data: { error: error && error.name === 'AbortError' ? 'Image generation timed out. Try again with a shorter prompt.' : 'Image generation failed. Check Gemini image model/secret and redeploy.' } };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function generateDesignImage(designText) {
    const prompt = imagePromptFromDesign(designText);
    setImageLoading('Namaa Design kay9ad logo + mockups f board wa7da. لحظة صغيرة...');
    const result = await callImageGeneration(prompt);
    const data = result.data || {};
    const image = data.image || {};
    const imageUrl = image.dataUrl || image.url || image.src || data.imageUrl;
    if (result.ok && imageUrl) {
      updateDesignProgress('website');
      setImagePlaceholder('', imageUrl, { mimeType: image.mimeType || 'image/jpeg' });
      return true;
    }
    const message = (data && (data.error || data.message)) || 'Gemini image generation did not return a JPG yet. The text design is ready; check GEMINI_IMAGE_MODEL or try Regenerate visual.';
    updateDesignProgress('website');
    setImagePlaceholder('Image generation ma jawbatch دابا. جرّب Regenerate mockups من بعد.');
    return false;
  }


  function websiteBriefSummary() {
    const base = briefSummary();
    if (lastDesignAnswer) {
      return base + '\n\nDesign context detected from Namaa Design. Namaa Website will use it for visual direction, CTA style, colors, hero layout and mobile hierarchy.';
    }
    return base;
  }

  function setWebsiteSlot(slot, text, loading) {
    const card = websiteWorkspace && websiteWorkspace.querySelector('[data-website-slot="' + slot + '"] .website-card-body');
    if (!card) return;
    card.classList.toggle('is-loading', Boolean(loading));
    card.textContent = text || 'Waiting for Namaa Website output.';
  }

  function setWebsiteCode(code) {
    // Namaa Website uses HTML/CSS/JS internally, but the public UI must show the working page only.
    lastWebsiteCode = String(code || '').trim();
    if (websiteCodeBlock) {
      websiteCodeBlock.textContent = lastWebsiteCode ? 'Live landing page generated. Source code is hidden in this Namaa preview interface.' : 'No live landing page generated yet.';
    }
    renderWebsitePreview(lastWebsiteCode);
  }

  function extractCode(text) {
    const source = String(text || '');
    const fenced = source.match(/```(?:html|HTML)?\s*([\s\S]*?)```/);
    if (fenced && fenced[1]) return fenced[1].trim();
    const docIndex = source.toLowerCase().indexOf('<!doctype html');
    if (docIndex >= 0) return source.slice(docIndex).trim();
    const htmlIndex = source.toLowerCase().indexOf('<html');
    if (htmlIndex >= 0) return source.slice(htmlIndex).trim();
    return '';
  }

  function safeText(value, fallback) {
    return escapeHtml(String(value || fallback || '').trim());
  }

  function fallbackLandingPageHtml(reason) {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const project = safeText(b.projectName || b.category || b.offer, 'Your Moroccan Business');
    const city = safeText(b.city || b.market, 'Morocco');
    const target = safeText(b.targetCustomer || b.target, 'clients prêts à acheter');
    const goal = safeText(b.goal, 'generate qualified leads');
    const offer = safeText(b.offer || b.category || b.projectName, 'a clear service offer');
    const style = safeText(b.style || b.language, 'modern, clean and trustworthy');
    const note = safeText(reason || 'Preview generated from the confirmed Namaa brief.', 'Preview generated from the confirmed Namaa brief.');
    const designHint = safeText(cleanText(lastDesignAnswer, 260) || 'A clean visual direction from Namaa Design will be reflected here.', 'A clean visual direction from Namaa Design will be reflected here.');
    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${project} — Namaa Preview</title>
<style>
:root{--blue:#1858f2;--dark:#071226;--muted:#667085;--soft:#f5f8ff;--line:rgba(15,23,42,.1)}
*{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:#111827;background:#fff} a{text-decoration:none;color:inherit}
.hero{min-height:92vh;display:grid;place-items:center;padding:42px 22px;background:radial-gradient(circle at 85% 10%,rgba(24,88,242,.16),transparent 34%),linear-gradient(180deg,#fff 0%,#f4f7ff 100%)}
.wrap{width:min(1120px,100%);margin:auto}.nav{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:56px}.brand{display:flex;align-items:center;gap:12px;font-weight:900}.mark{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#1ab7ff,#1438d4);display:grid;place-items:center;color:#fff;box-shadow:0 18px 45px rgba(24,88,242,.22)}
.pill{display:inline-flex;padding:10px 14px;border-radius:999px;background:#fff;color:var(--blue);font-weight:900;font-size:12px;box-shadow:0 12px 32px rgba(15,23,42,.08)}
.grid{display:grid;grid-template-columns:1.05fr .95fr;gap:42px;align-items:center}.eyebrow{color:var(--blue);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.18em;margin:0 0 14px}.hero h1{font-size:clamp(42px,6vw,78px);line-height:.95;letter-spacing:-.07em;margin:0 0 20px}.hero p{font-size:18px;line-height:1.75;color:var(--muted);margin:0 0 28px;max-width:650px}.actions{display:flex;gap:12px;flex-wrap:wrap}.btn{display:inline-flex;min-height:54px;align-items:center;justify-content:center;padding:0 22px;border-radius:999px;background:var(--blue);color:#fff;font-weight:900;box-shadow:0 20px 50px rgba(24,88,242,.24)}.btn.secondary{background:#fff;color:#111827;box-shadow:0 14px 36px rgba(15,23,42,.08)}
.card{background:rgba(255,255,255,.86);backdrop-filter:blur(14px);border:1px solid var(--line);border-radius:32px;padding:24px;box-shadow:0 28px 90px rgba(15,23,42,.12)}.mock{border-radius:24px;background:#071226;color:#fff;padding:18px;min-height:390px;display:grid;gap:12px}.bar{height:46px;border-radius:16px;background:rgba(255,255,255,.08);display:flex;align-items:center;padding:0 14px;gap:8px}.dot{width:10px;height:10px;border-radius:50%;background:#27c79a}.panel{background:#fff;color:#111827;border-radius:22px;padding:20px}.panel h3{margin:0 0 10px;font-size:24px;letter-spacing:-.04em}.list{display:grid;gap:10px;margin-top:16px}.item{padding:14px;border-radius:16px;background:#f4f7ff;border:1px solid #e8eeff;font-weight:800;color:#27364f}.section{padding:68px 22px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.mini{border:1px solid var(--line);border-radius:24px;padding:22px;background:#fff;box-shadow:0 16px 45px rgba(15,23,42,.06)}.mini h3{margin:0 0 10px;font-size:22px;letter-spacing:-.04em}.mini p{color:var(--muted);line-height:1.65;margin:0}.cta{text-align:center;border-radius:34px;background:var(--dark);color:#fff;padding:48px 22px}.cta p{color:rgba(255,255,255,.72)}
@media(max-width:820px){.grid,.cards{grid-template-columns:1fr}.nav{margin-bottom:34px}.hero{padding:28px 18px}.hero h1{font-size:44px}.hero p{font-size:15.5px}.mock{min-height:320px}.cards{gap:12px}}
</style>
</head>
<body>
<section class="hero"><div class="wrap"><div class="nav"><div class="brand"><span class="mark">N</span><span>${project}</span></div><span class="pill">Namaa live preview</span></div><div class="grid"><div><p class="eyebrow">${city} · ${style}</p><h1>Launch ${project} with a clear offer and a premium first impression.</h1><p>This landing page preview was prepared for ${target}. The goal is to ${goal} with a simple message, strong trust signals and a direct conversion path.</p><div class="actions"><a class="btn" href="#contact">Start now</a><a class="btn secondary" href="#offer">See the offer</a></div></div><div class="card"><div class="mock"><div class="bar"><span class="dot"></span><strong>namaa.preview/${websitePreviewSlug()}</strong></div><div class="panel"><h3>${offer}</h3><p>${designHint}</p><div class="list"><div class="item">Clear positioning for ${city}</div><div class="item">Mobile-first conversion layout</div><div class="item">Trust + WhatsApp lead flow</div></div></div></div></div></div></div></section>
<section class="section" id="offer"><div class="wrap"><div class="cards"><div class="mini"><h3>Offer</h3><p>Simple service promise, clear value and fast path to contact.</p></div><div class="mini"><h3>Trust</h3><p>Professional layout, proof sections and answers to objections.</p></div><div class="mini"><h3>Leads</h3><p>CTA built around WhatsApp, form or appointment request.</p></div></div></div></section>
<section class="section" id="contact"><div class="wrap"><div class="cta"><h2>Ready to turn this preview into a full project?</h2><p>${note}</p><a class="btn" href="#">Contact on WhatsApp</a></div></div></section>
</body>
</html>`;
  }

  function websitePreviewSlug() {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const base = (b.projectName || b.category || b.offer || 'landing-page')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 42) || 'landing-page';
    return base;
  }

  function updateWebsiteBrowserUrl(ready) {
    if (!websiteBrowserUrl) return;
    websiteBrowserUrl.textContent = ready ? ('https://namaa.preview/' + websitePreviewSlug()) : 'namaa.preview/landing-page';
  }

  function renderWebsitePreview(code) {
    const hasDeviceFrames = Boolean(websiteDesktopFrame && websiteMobileFrame);
    if (!websitePreviewFrame && !hasDeviceFrames) return;
    if (!code || String(code).indexOf('<') < 0) {
      const placeholderHtml = fallbackLandingPageHtml('Namaa Dev will replace this temporary mockup with the generated landing page after you click Generate website mockup.');
      if (hasDeviceFrames) {
        websiteDesktopFrame.srcdoc = placeholderHtml;
        websiteMobileFrame.srcdoc = placeholderHtml;
        updateWebsiteBrowserUrl(false);
        return;
      }
      updateWebsiteBrowserUrl(false);
      if (websitePreviewFrame) websitePreviewFrame.innerHTML = '<div><div class="website-preview-mark">W</div><p>The landing page mockup will appear here after Namaa Dev generates it.</p></div>';
      return;
    }
    const safe = String(code || '');
    if (hasDeviceFrames) {
      websiteDesktopFrame.srcdoc = safe;
      websiteMobileFrame.srcdoc = safe;
      updateWebsiteBrowserUrl(true);
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'Namaa Website landing page browser preview');
    iframe.setAttribute('sandbox', 'allow-forms allow-scripts');
    iframe.srcdoc = safe;
    websitePreviewFrame.innerHTML = '';
    websitePreviewFrame.appendChild(iframe);
    updateWebsiteBrowserUrl(true);
  }

  function setWebsitePreviewDevice(device) {
    if (!websitePreviewFrame) return;
    const mobile = device === 'mobile';
    websitePreviewFrame.classList.toggle('is-mobile', mobile);
    if (websitePreviewDesktop) websitePreviewDesktop.classList.toggle('active', !mobile);
    if (websitePreviewMobile) websitePreviewMobile.classList.toggle('active', mobile);
  }

  function websiteFileName() {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const base = (b.projectName || b.category || b.offer || 'namaa-landing-page')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 52) || 'namaa-landing-page';
    return base + '.html';
  }

  function resetWebsiteWorkspace() {
    setWebsiteSlot('brief', 'No confirmed brief yet. Start with Namaa Business Talk, then Design, then open Namaa Website.');
    setWebsiteSlot('blueprint', 'Namaa Dev will generate the landing page and display it as desktop + mobile mockups.');
    setWebsiteSlot('hero', 'Hero, offer and CTA will appear inside the desktop and mobile mockups.');
    setWebsiteSlot('sections', 'Page sections will appear inside the scrollable mockups.');
    setWebsiteSlot('leadflow', 'WhatsApp/form lead flow will appear inside the generated page mockup.');
    setWebsiteSlot('checklist', 'Mockup is ready to review visually inside Namaa Dev.');
    setWebsiteCode('');
    if (websiteIntro) websiteIntro.textContent = 'Open this workspace after Namaa Design. Namaa Dev builds the landing page internally and shows desktop + mobile mockups. After review, open Namaa Strategy as the final step.';
  }

  function refreshWebsiteBriefCard() {
    setWebsiteSlot('brief', websiteBriefSummary());
    if (websiteIntro) {
      websiteIntro.textContent = Object.keys(projectBrief || {}).length
        ? 'Current brief detected. Generate the website mockup: desktop browser + scrollable mobile preview. Source code stays hidden.'
        : 'No brief detected yet. Go back to Namaa Talk, confirm the project brief, then open Namaa Design before Website.';
    }
  }

  function renderWebsiteLoading() {
    refreshWebsiteBriefCard();
    setWebsiteSlot('blueprint', 'Namaa Dev is preparing the landing page structure', true);
    setWebsiteSlot('hero', 'Namaa Dev is writing the hero, offer and CTA', true);
    setWebsiteSlot('sections', 'Namaa Dev is organizing the page sections', true);
    setWebsiteSlot('leadflow', 'Namaa Dev is preparing WhatsApp/form lead flow', true);
    setWebsiteSlot('checklist', 'Namaa Dev is preparing the desktop and mobile mockups', true);
    if (websiteCodeBlock) websiteCodeBlock.textContent = 'Generating desktop + mobile website mockup. Source code hidden.';
    lastWebsiteCode = '';
    renderWebsitePreview(fallbackLandingPageHtml('Namaa is preparing the final Gemini landing page preview. This temporary preview keeps the browser area active while generation runs.'));
  }

  function renderWebsiteWorkspace(reply) {
    const text = cleanText(reply);
    lastWebsiteAnswer = text;
    setWebsiteSlot('brief', websiteBriefSummary());
    setWebsiteSlot('blueprint', sectionFrom(text, ['LANDING PAGE BLUEPRINT', 'PAGE BLUEPRINT', 'SECTION MAP', 'Landing page blueprint'], ['HERO AND OFFER', 'SECTIONS AND COPY', 'CTA AND LEAD FLOW', 'HTML CSS JS', 'PREVIEW / INTEGRATION CHECKLIST']) || text.slice(0, 1200));
    setWebsiteSlot('hero', sectionFrom(text, ['HERO AND OFFER', 'HERO + OFFER', 'Hero and offer'], ['SECTIONS AND COPY', 'CTA AND LEAD FLOW', 'HTML CSS JS', 'PREVIEW / INTEGRATION CHECKLIST']) || 'Hero and offer will appear inside the live page preview.');
    setWebsiteSlot('sections', sectionFrom(text, ['SECTIONS AND COPY', 'SECTION-BY-SECTION COPY', 'Sections and copy'], ['CTA AND LEAD FLOW', 'HTML CSS JS', 'PREVIEW / INTEGRATION CHECKLIST']) || 'Sections and copy were not clearly separated. Ask Namaa Website to regenerate sections only.');
    setWebsiteSlot('leadflow', sectionFrom(text, ['CTA AND LEAD FLOW', 'CTA + LEAD FLOW', 'WhatsApp lead flow'], ['HTML CSS JS', 'PREVIEW / INTEGRATION CHECKLIST']) || 'CTA/lead flow will be inside the generated page. Ask Namaa Website to regenerate lead flow only if needed.');
    setWebsiteSlot('checklist', sectionFrom(text, ['PREVIEW / INTEGRATION CHECKLIST', 'INTEGRATION CHECKLIST', 'Checklist'], []) || 'Live preview generated. Review the page visually inside Namaa Website.');
    const code = extractCode(text);
    const livePage = code || fallbackLandingPageHtml('Gemini returned planning text instead of a full HTML document, so Namaa opened a clean live preview from the confirmed brief. Click Generate again for a richer visual version.');
    setWebsiteCode(livePage);
    updateFlowState('websiteReady', true);
    if (websiteIntro) websiteIntro.textContent = code ? 'Website mockup generated. Review desktop and mobile scroll previews. Source code stays hidden. Next: open final Namaa Strategy.' : 'Namaa opened a working website mockup from the brief. You can regenerate for a richer Gemini visual version, or continue to final Namaa Strategy.';
  }

  async function sendWebsitePrompt(raw, extra) {
    const message = String(raw || '').trim();
    if (!message || isSending) return;
    isSending = true;
    lastUserPrompt = message;
    chatHistory.push({ role: 'user', content: message });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    if (websiteGenerate) websiteGenerate.disabled = true;
    renderWebsiteLoading();
    const result = await callAgent(message, extra || {});
    const fallback = 'Namaa Dev mockup is ready, but the live AI route did not answer yet. Check the private backend connection and redeploy, then generate the website mockup again.';
    const reply = result.reply || fallback;
    renderWebsiteWorkspace(reply);
    lastAgentAnswer = reply;
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    isSending = false;
    if (websiteGenerate) websiteGenerate.disabled = false;
  }


  function websiteChatIntroText() {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const project = b.projectName || b.project || 'المشروع ديالك';
    const desc = b.description || b.offer || 'الفكرة اللي شرحتي';
    const city = b.city || b.market || 'المغرب';
    return 'مرحبا، أنا Namaa Dev 💻\n\nوصلني التصميم ديال المشروع، وفهمت السياق هكذا:\n\n**المشروع:** ' + project + '\n**الفكرة:** ' + desc + '\n**السوق:** ' + city + '\n\nنقدر نبني لك دابا **landing page mockup**: نسخة Desktop ونسخة Mobile قابلة للسكرول، بلا ما نوريك الكود.\n\nواش نبدأ؟';
  }

  function startWebsiteChatIfReady() {
    if (activeAgent !== 'website') return;
    if (!flowState.designReady) return;
    if (websiteChatIntroShown) return;
    websiteChatIntroShown = true;
    websiteAwaitingStart = true;
    const item = addMessage('assistant', websiteChatIntroText());
    addChoiceButtons(item, [{ label: 'نعم، وجد landing page', value: 'نعم وجد landing page' }]);
    if (input) input.placeholder = 'جاوب بنعم باش Namaa Dev يبني landing page mockup...';
  }

  function websiteChatMockupShellHtml() {
    return '<div class="chat-website-result">'
      + '<p><strong>ها landing page mockup وجدات ✅</strong><br>شوفها فـ Desktop وMobile. إلا الاتجاه مزيان، دوز لـ Namaa Strategy.</p>'
      + '<div class="chat-website-devices">'
        + '<div class="chat-desktop-mockup">'
          + '<div class="chat-device-label">Desktop preview</div>'
          + '<div class="chat-browser-shell">'
            + '<div class="chat-browser-top"><span><i></i><i></i><i></i></span><strong>namaa.preview/' + escapeHtml(websitePreviewSlug()) + '</strong></div>'
            + '<div class="chat-browser-scroll"><iframe title="Namaa desktop landing page result" sandbox="allow-forms allow-scripts"></iframe></div>'
          + '</div>'
        + '</div>'
        + '<div class="chat-phone-mockup">'
          + '<div class="chat-device-label">Mobile scroll</div>'
          + '<div class="chat-phone-shell"><div class="chat-phone-speaker"></div><div class="chat-phone-scroll"><iframe title="Namaa mobile landing page result" sandbox="allow-forms allow-scripts"></iframe></div></div>'
        + '</div>'
      + '</div>'
      + '</div>';
  }

  function mountWebsiteChatPreview(targetItem, htmlCode) {
    if (!targetItem) return;
    const bubble = targetItem.querySelector('.message-bubble');
    if (!bubble) return;
    bubble.innerHTML = websiteChatMockupShellHtml();
    const iframes = bubble.querySelectorAll('iframe');
    iframes.forEach(function (frame) {
      frame.srcdoc = htmlCode || fallbackLandingPageHtml('Namaa Dev generated a temporary visual landing page from the project brief.');
    });
  }

  async function sendWebsiteChatPrompt(raw, extra) {
    const message = String(raw || '').trim();
    if (!message || isSending) return;
    if (!ensureFlowStep('website')) { setAgent('design'); return; }
    isSending = true;
    lastUserPrompt = message;
    chatHistory.push({ role: 'user', content: message });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    const displayMessage = extra && extra.displayMessage ? String(extra.displayMessage).trim() : message;
    addMessage('user', displayMessage || message);
    if (input) { input.value = ''; resizeInput(); }
    const loading = addMessage('assistant', 'تمام، كنبني لك landing page mockup دابا... غادي يبان فـ Desktop وMobile بلا كود 💻', { loading: true });
    const buildPrompt = 'Use the confirmed project brief and previous Namaa Design output. Generate a complete premium one-file HTML/CSS/JS landing page for live visual preview only. Return only the full HTML document inside one html fenced code block. No explanation outside the code block. The page must look like a real landing page: strong hero, offer, benefits, trust, FAQ, CTA, mobile responsive CSS and light JS if useful.';
    const result = await callAgent(buildPrompt, extra || {});
    const reply = result.reply || '';
    const code = extractCode(reply) || fallbackLandingPageHtml('Gemini returned no full HTML document, so Namaa Dev opened a clean working landing page mockup from your confirmed brief.');
    lastWebsiteAnswer = reply || 'Namaa Dev generated a landing page mockup visual preview from the confirmed brief and design.';
    lastWebsiteCode = code;
    renderWebsitePreview(code);
    updateFlowState('websiteReady', true);
    if (loading) {
      loading.classList.remove('loading');
      mountWebsiteChatPreview(loading, code);
      addHandoffs(loading, frontendHandoffsForActive());
    } else {
      const item = addMessage('assistant', 'Landing page mockup ready.');
      mountWebsiteChatPreview(item, code);
      addHandoffs(item, frontendHandoffsForActive());
    }
    lastAgentAnswer = lastWebsiteAnswer;
    chatHistory.push({ role: 'assistant', content: lastWebsiteAnswer });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    isSending = false;
    if (sendButton) sendButton.disabled = false;
    if (input) input.focus();
    scrollToBottom();
  }


  function updateDesignProgress(stage) {
    const steps = designWorkspace ? Array.from(designWorkspace.querySelectorAll('.design-flow-step')) : [];
    if (!steps.length) return;
    const order = ['brief', 'logo', 'mockups', 'visual', 'website'];
    const activeIndex = Math.max(0, order.indexOf(stage || 'brief'));
    steps.forEach(function (step) {
      const key = step.getAttribute('data-design-step');
      const idx = order.indexOf(key);
      step.classList.toggle('is-active', idx === activeIndex);
      step.classList.toggle('is-done', idx >= 0 && idx < activeIndex);
    });
  }

  function resetDesignWorkspace() {
    updateDesignProgress('brief');
    setSlot('brief', 'Start with Namaa Talk, confirm the brief, then open Namaa Design.');
    setSlot('logo', 'Logo concept ghadi yban hna.');
    setSlot('mockups', 'Category mockups ghadi ybano hna.');
    setSlot('handoff', 'Mli visual pack ykml, dوز لـ Namaa Website.');
    renderDesignLabCards('idle');
    setImagePlaceholder('Logo + mockups board ghadi yban hna.');
    if (designIntro) designIntro.textContent = 'Mli brief ykon confirmed, Namaa Design kaykhdem logo + mockups automatically. Bla ktaba bzaf.';
  }

  function refreshDesignBriefCard() {
    setSlot('brief', briefSummary());
    if (designIntro) {
      designIntro.textContent = Object.keys(projectBrief || {}).length
        ? 'Brief detected. Namaa Design ghadi ykhdem logo first, b3dha mockups li kaynassbo project.'
        : 'No brief yet. رجع لـ Namaa Talk، وصف المشروع، وأكد brief.';
    }
  }

  function renderDesignLoading() {
    updateDesignProgress('logo');
    refreshDesignBriefCard();
    setSlot('logo', 'Namaa kayوجد logo concept...', true);
    setSlot('mockups', 'Namaa kayختار mockups حسب category ديال project...', true);
    setSlot('handoff', 'Website handoff ghadi yban من بعد visual pack.', true);
    renderDesignLabCards('loading');
    updateDesignProgress('visual');
    setImageLoading('Namaa Design kay9ad logo + mockups f board wa7da...');
  }

  function renderDesignWorkspace(reply, data) {
    const text = cleanText(reply);
    lastDesignAnswer = text;
    setSlot('brief', briefSummary());
    setSlot('logo', 'Logo concept generated for this project. The real visual appears in the board.');
    setSlot('mockups', 'Mockup pack selected by category: ' + designCategoryHint());
    setSlot('handoff', 'Visual pack ready. If it looks good, open Namaa Website to turn it into a landing page preview.');
    renderDesignLabCards('done');
    const imageUrl = data && data.imageUrl || data && data.image && (data.image.url || data.image.src || data.image.dataUrl);
    updateDesignProgress('website');
    setImagePlaceholder('Visual board ready.', imageUrl);
    updateFlowState('designReady', true);
    if (designIntro) designIntro.textContent = 'Logo + mockups wajdin. Ila 3jbk l direction, dوز لـ Namaa Website.';
  }


  function strategyFounderMessage(notes) {
    const clean = String(notes || '').replace(/\*\*/g, '').trim();
    const extra = clean ? '<p>' + escapeHtml(clean).slice(0, 480) + '</p>' : '';
    return '<h3>رسالة من Namaa لصاحب المشروع</h3>'
      + '<p>Project ديالك باين فيه potential مزيان. إلا بغيتي تحول الفكرة لنظام واضح، landing page، content، ads و WhatsApp/CRM بطريقة منظمة، Namaa كيقترح تاخذ free consultation مع Elboubakry Abdessamad.</p>'
      + extra
      + '<div class="strategy-founder-actions"><a href="https://wa.me/212600000000" target="_blank" rel="noopener">WhatsApp</a><a href="https://www.linkedin.com/in/elboubakry-abdessamad" target="_blank" rel="noopener">LinkedIn</a><a href="/reserver-diagnostic/">Free consultation</a></div>';
  }

  function openStrategyBoard(slot) {
    if (!strategyModal || !strategyModalContent) return;
    const card = strategyWorkspace && strategyWorkspace.querySelector('[data-strategy-slot="' + slot + '"] .strategy-board-body');
    if (!card) return;
    const meta = strategyBoardMeta(slot);
    if (strategyModalTitle) strategyModalTitle.textContent = meta[1];
    strategyModalContent.innerHTML = card.innerHTML;
    strategyModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('strategy-modal-open');
  }

  function closeStrategyBoard() {
    if (!strategyModal) return;
    strategyModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('strategy-modal-open');
  }

  function strategyBriefSummary() {
    const base = briefSummary();
    if (lastDesignAnswer) return base + '\n\nDesign context detected from Namaa Design. Strategy will keep the same visual promise and landing page direction.';
    if (lastWebsiteAnswer) return base + '\n\nWebsite context detected from Namaa Website. Strategy will align roadmap and channels with the landing page.';
    return base;
  }

  function setStrategySlot(slot, text, loading) {
    const isBoard = slot === 'market' || slot === 'digital' || slot === 'roadmap';
    const body = strategyWorkspace && strategyWorkspace.querySelector('[data-strategy-slot="' + slot + '"] ' + (isBoard ? '.strategy-board-body' : '.strategy-card-body'));
    if (!body) return;
    body.classList.toggle('is-loading', Boolean(loading));
    if (isBoard) {
      body.innerHTML = boardHtml(slot, text || 'Waiting for Namaa Strategy output.', Boolean(loading));
    } else {
      body.innerHTML = cardHtml(text || 'Waiting for Namaa Strategy output.', Boolean(loading));
    }
  }

  function strategySection(text, starts, stops) {
    return sectionFrom(text, starts, stops);
  }

  function resetStrategyWorkspace() {
    setStrategySlot('brief', 'No confirmed brief yet. Best flow: Namaa Talk → Design → Website → Strategy final boards.');
    setStrategySlot('market', 'Market research board will appear here: audience, demand signals, competitors, opportunity, objections and trust signals.');
    setStrategySlot('digital', 'Digital marketing strategy board will appear here: offer, funnel, channels, content pillars, ads, WhatsApp/CRM and conversion logic.');
    setStrategySlot('roadmap', 'Roadmap board will appear here: 30/60/90 actions, priorities, risks and what to do next.');
    setStrategySlot('handoff', strategyFounderMessage());
    if (strategyIntro) strategyIntro.textContent = 'Final step after Namaa Talk → Namaa Design → Namaa Website. Namaa Strategy will create three branded visual boards: market research, digital marketing strategy and 30/60/90 roadmap.';
    if (openPackPopupButton) { openPackPopupButton.disabled = true; openPackPopupButton.hidden = true; }
  }

  function refreshStrategyBriefCard() {
    setStrategySlot('brief', strategyBriefSummary());
    if (strategyIntro) {
      strategyIntro.textContent = Object.keys(projectBrief || {}).length
        ? 'Current brief detected. Final step: generate three picture-style boards after the design and website preview: market research, digital strategy and roadmap.'
        : 'No brief detected yet. Best flow: Namaa Talk → Namaa Design → Namaa Website → Namaa Strategy final boards.';
    }
  }

  function renderStrategyLoading() {
    refreshStrategyBriefCard();
    setStrategySlot('market', 'Namaa Strategy is building the Morocco market research board', true);
    setStrategySlot('digital', 'Namaa Strategy is building the digital marketing strategy board', true);
    setStrategySlot('roadmap', 'Namaa Strategy is building the 30/60/90 roadmap board', true);
    setStrategySlot('handoff', 'Namaa is preparing the final friendly message and free consultation CTA.', true);
  }

  function renderStrategyWorkspace(reply) {
    const text = cleanText(reply);
    lastStrategyAnswer = text;
    setStrategySlot('brief', strategyBriefSummary());
    const market = strategySection(text, ['PICTURE 1 MARKET RESEARCH', 'PICTURE 01 MARKET RESEARCH', 'MARKET RESEARCH PICTURE', 'MARKET RESEARCH'], ['PICTURE 2 DIGITAL MARKETING STRATEGY', 'PICTURE 02 DIGITAL MARKETING STRATEGY', 'DIGITAL MARKETING STRATEGY', 'PICTURE 3 ROADMAP', 'KPI DASHBOARD', 'NAMAA DESIGN HANDOFF']);
    const digital = strategySection(text, ['PICTURE 2 DIGITAL MARKETING STRATEGY', 'PICTURE 02 DIGITAL MARKETING STRATEGY', 'DIGITAL MARKETING STRATEGY PICTURE', 'DIGITAL MARKETING STRATEGY'], ['PICTURE 3 ROADMAP', 'PICTURE 03 ROADMAP', 'ROADMAP', 'KPI DASHBOARD', 'NAMAA DESIGN HANDOFF']);
    const roadmap = strategySection(text, ['PICTURE 3 ROADMAP', 'PICTURE 03 ROADMAP', 'ROADMAP PICTURE', '30/60/90 ROADMAP', 'ROADMAP'], ['KPI DASHBOARD', 'NAMAA DESIGN HANDOFF', 'NAMAA WEBSITE STARTER HANDOFF']);
    const finalNotes = strategySection(text, ['FINAL ACTION NOTES', 'FINAL NOTES', 'FOUNDER MESSAGE'], []);
    setStrategySlot('market', market || text.slice(0, 1200));
    setStrategySlot('digital', digital || 'Digital strategy board was not clearly separated. Click Generate again and Namaa will structure it into picture 02.');
    setStrategySlot('roadmap', roadmap || 'Roadmap board was not clearly separated. Click Generate again and Namaa will structure it into picture 03.');
    setStrategySlot('handoff', strategyFounderMessage(finalNotes));
    updateFlowState('strategyReady', true);
    if (strategyIntro) strategyIntro.textContent = 'Final strategy generated as three branded visual boards. Review them as the final Namaa project output. CRM/email pack link will be activated in the final update.';
    if (openPackPopupButton) { openPackPopupButton.disabled = true; openPackPopupButton.hidden = true; }
    // CRM/email popup is parked until the final CRM update.
  }


  function strategyChatIntroText() {
    const b = projectBrief && typeof projectBrief === 'object' ? projectBrief : {};
    const project = b.projectName || b.project || 'المشروع ديالك';
    const desc = b.description || b.offer || 'الفكرة اللي شرحتي';
    const city = b.city || b.market || 'المغرب';
    return 'مرحبا، أنا Namaa Strategy 🧭\n\nوصلنا للمرحلة الأخيرة. غادي نبني لك strategy نهائية على هاد الأساس:\n\n**المشروع:** ' + project + '\n**الفكرة:** ' + desc + '\n**السوق:** ' + city + '\n\nغادي نوجد لك 3 boards منظمين:\n\n1. Market Research\n2. Digital Marketing Strategy\n3. Roadmap\n\nواش نبدأ دابا؟';
  }

  function startStrategyChatIfReady() {
    if (activeAgent !== 'strategy') return;
    if (!flowState.websiteReady) return;
    if (strategyChatIntroShown) return;
    strategyChatIntroShown = true;
    strategyAwaitingStart = true;
    const item = addMessage('assistant', strategyChatIntroText());
    addChoiceButtons(item, [{ label: 'نعم، وجد strategy', value: 'نعم وجد strategy' }]);
    if (input) input.placeholder = 'جاوب بنعم باش Namaa Strategy يخرج 3 boards النهائية...';
  }

  function splitStrategyBoards(text) {
    const source = cleanText(text || '');
    const market = strategySection(source, ['PICTURE 1 MARKET RESEARCH', 'PICTURE 01 MARKET RESEARCH', 'MARKET RESEARCH PICTURE', 'MARKET RESEARCH'], ['PICTURE 2 DIGITAL MARKETING STRATEGY', 'PICTURE 02 DIGITAL MARKETING STRATEGY', 'DIGITAL MARKETING STRATEGY', 'PICTURE 3 ROADMAP', 'KPI DASHBOARD', 'NAMAA DESIGN HANDOFF']);
    const digital = strategySection(source, ['PICTURE 2 DIGITAL MARKETING STRATEGY', 'PICTURE 02 DIGITAL MARKETING STRATEGY', 'DIGITAL MARKETING STRATEGY PICTURE', 'DIGITAL MARKETING STRATEGY'], ['PICTURE 3 ROADMAP', 'PICTURE 03 ROADMAP', 'ROADMAP', 'KPI DASHBOARD', 'NAMAA DESIGN HANDOFF']);
    const roadmap = strategySection(source, ['PICTURE 3 ROADMAP', 'PICTURE 03 ROADMAP', 'ROADMAP PICTURE', '30/60/90 ROADMAP', 'ROADMAP'], ['KPI DASHBOARD', 'NAMAA DESIGN HANDOFF', 'NAMAA WEBSITE STARTER HANDOFF', 'FINAL ACTION NOTES', 'FINAL NOTES', 'FOUNDER MESSAGE']);
    const finalNotes = strategySection(source, ['FINAL ACTION NOTES', 'FINAL NOTES', 'FOUNDER MESSAGE'], []);
    return { market: market || source.slice(0, 1000), digital: digital || 'Offer, funnel, channels, content pillars, ads, WhatsApp/CRM and conversion logic.', roadmap: roadmap || '30/60/90 days execution roadmap with priorities, risks and actions.', finalNotes: finalNotes };
  }

  function strategyChatBoardsHtml(text, loading) {
    const parts = splitStrategyBoards(text || '');
    if (loading) {
      return '<div class="chat-strategy-result is-loading"><p><strong>كنوجد لك 3 outputs نهائيين...</strong><br>غادي يبان لك ملخص صغير هنا، والتفاصيل كتفتح فـ popup منظم.</p></div>';
    }
    return '<div class="chat-strategy-result chat-strategy-compact">'
      + '<div class="strategy-final-intro"><strong>الاستراتيجية النهائية واجدة ✅</strong><span>خليتها مختصرة هنا باش الشات يبقى نقي. كليكي على أي بطاقة وتشوف board كامل ومنظم.</span></div>'
      + '<div class="chat-strategy-grid">'
      + '<button type="button" class="chat-strategy-board" data-chat-strategy="market">' + strategyCompactCardHtml('market', parts.market) + '</button>'
      + '<button type="button" class="chat-strategy-board" data-chat-strategy="digital">' + strategyCompactCardHtml('digital', parts.digital) + '</button>'
      + '<button type="button" class="chat-strategy-board" data-chat-strategy="roadmap">' + strategyCompactCardHtml('roadmap', parts.roadmap) + '</button>'
      + '</div>'
      + '<div class="chat-founder-message">' + strategyFounderMessage(parts.finalNotes) + '</div>'
      + '</div>';
  }

  function wireChatStrategyBoards(targetItem, sourceText) {
    if (!targetItem) return;
    const buttons = Array.from(targetItem.querySelectorAll('[data-chat-strategy]'));
    const parts = splitStrategyBoards(sourceText || lastStrategyAnswer || '');
    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        const slot = button.getAttribute('data-chat-strategy') || 'market';
        const meta = strategyBoardMeta(slot);
        if (strategyModalTitle) strategyModalTitle.textContent = meta[1];
        if (strategyModalContent) strategyModalContent.innerHTML = boardHtml(slot, parts[slot] || '', false);
        if (strategyModal) {
          strategyModal.setAttribute('aria-hidden', 'false');
          document.body.classList.add('strategy-modal-open');
        }
      });
    });
  }

  async function sendStrategyChatPrompt(raw, extra) {
    const message = String(raw || '').trim();
    if (!message || isSending) return;
    if (!ensureFlowStep('strategy')) { setAgent('website'); return; }
    isSending = true;
    lastUserPrompt = message;
    chatHistory.push({ role: 'user', content: message });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    const displayMessage = extra && extra.displayMessage ? String(extra.displayMessage).trim() : message;
    addMessage('user', displayMessage || message);
    if (input) { input.value = ''; resizeInput(); }
    const loading = addMessage('assistant', 'تمام، كنوجد لك 3 صور استراتيجية دابا... لحظة صغيرة 🧭', { loading: true });
    const buildPrompt = 'Use the confirmed Namaa project brief, previous Namaa Design result, and Namaa Website landing page preview. Create the FINAL Namaa Strategy output as 3 premium picture-style boards. Use exact headings: STRATEGY SNAPSHOT, PICTURE 1 MARKET RESEARCH, PICTURE 2 DIGITAL MARKETING STRATEGY, PICTURE 3 ROADMAP, FINAL ACTION NOTES. For each picture board write compact label:value bullets, no long paragraphs, max 7 key bullets per board, practical Morocco-first logic, assumptions clearly marked, and board-ready wording. Every board must respect Namaa AI branding and Created by Elboubakry Abdessamad. This is the final step after Talk → Design → Website.';
    const result = await callAgent(buildPrompt, extra || {});
    const fallback = 'STRATEGY SNAPSHOT\nNamaa Strategy prepared the final boards.\n\nPICTURE 1 MARKET RESEARCH\nAudience: Define who needs this solution.\nDemand: Validate if the city/market has active demand.\nCompetitors: Check direct and indirect competitors.\nPain points: Identify trust, price and speed concerns.\nOpportunity: Build a simple offer with clear proof.\n\nPICTURE 2 DIGITAL MARKETING STRATEGY\nPositioning: Explain the value in one clear promise.\nFunnel: Landing page → WhatsApp/lead form → follow-up.\nContent: Education, proof, before/after and FAQs.\nAds: Start with one focused Meta campaign.\nCRM: Track every lead and response.\n\nPICTURE 3 ROADMAP\n30 days: Launch offer, landing page and first creatives.\n60 days: Optimize ads, content and WhatsApp scripts.\n90 days: Scale what converts and build retargeting.\nRisk: Avoid too many services at launch.\nKPI: Cost per qualified lead and confirmed appointments.\n\nFINAL ACTION NOTES\nProject fih potential. Ila bghiti founder system, digital marketing execution, funnel w growth plan, tواصل m3a Elboubakry Abdessamad for free consultation.';
    const reply = result.reply || fallback;
    lastStrategyAnswer = reply;
    lastAgentAnswer = reply;
    updateFlowState('strategyReady', true);
    if (loading) {
      loading.classList.remove('loading');
      const bubble = loading.querySelector('.message-bubble');
      if (bubble) bubble.innerHTML = strategyChatBoardsHtml(reply, false);
      wireChatStrategyBoards(loading, reply);
    } else {
      const item = addMessage('assistant', 'Strategy ready.');
      const bubble = item && item.querySelector('.message-bubble');
      if (bubble) bubble.innerHTML = strategyChatBoardsHtml(reply, false);
      wireChatStrategyBoards(item, reply);
    }
    chatHistory.push({ role: 'assistant', content: 'Namaa Strategy generated 3 final visual boards inside the chat.' });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    isSending = false;
    if (sendButton) sendButton.disabled = false;
    if (input) input.focus();
    scrollToBottom();
  }

  async function sendStrategyPrompt(raw, extra) {
    const message = String(raw || '').trim();
    if (!message || isSending) return;
    isSending = true;
    lastUserPrompt = message;
    chatHistory.push({ role: 'user', content: message });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    if (strategyGenerate) strategyGenerate.disabled = true;
    renderStrategyLoading();
    const result = await callAgent(message, extra || {});
    const fallback = 'STRATEGY SNAPSHOT\nNamaa Strategy workspace is ready with Namaa logo and Created by Elboubakry Abdessamad branding, but the live AI route did not answer yet. Check the private backend connection and redeploy.\n\nPICTURE 1 MARKET RESEARCH\nSend project type, city, target and offer to build the market research board.\n\nPICTURE 2 DIGITAL MARKETING STRATEGY\nChannels, offer, funnel, content pillars and WhatsApp/CRM will appear here.\n\nPICTURE 3 ROADMAP\n30/60/90 actions, priorities and risks will appear here.\n\nFINAL ACTION NOTES\nProject fih potential. Ila bghiti founder system, digital marketing execution, funnel w growth plan, tواصل m3a Elboubakry Abdessamad for free consultation.';
    const reply = result.reply || fallback;
    renderStrategyWorkspace(reply);
    lastAgentAnswer = reply;
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    isSending = false;
    if (strategyGenerate) strategyGenerate.disabled = false;
  }

  async function callAgent(message, extra) {
    const controller = new AbortController();
    const timeout = window.setTimeout(function () { controller.abort(); }, 45000);
    try {
      const response = await fetch('/api/namaa/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          agent: activeAgent,
          mode: activeAgent,
          message: message,
          prompt: message,
          history: chatHistory.slice(-10),
          brief: projectBrief,
          briefStatus: projectBriefStatus,
          context: AGENTS[activeAgent].context,
          languageStyle: detectLanguageStyle(message),
          languageInstruction: languageInstructionFor(message),
          systemBehavior: 'You are Namaa AI, created by Elboubakry Abdessamad. You are Namaa Talk, not Gemini and not ChatGPT. Keep the answer in the same language as the user. Stay focused on business, AI, IT, startups, ideas, marketing, websites, automation, CRM, sales, branding, content, entrepreneurship and Moroccan market. If unrelated, politely redirect to one of those angles.',
          source: 'namaa-simple-chat-update-92-mobile-language-personality',
          handoffFrom: extra && extra.handoffFrom,
          previousUserPrompt: extra && extra.previousUserPrompt,
          previousAgentAnswer: extra && extra.previousAgentAnswer,
          handoffBrief: extra && extra.handoffBrief,
          handoffAction: extra && extra.handoffAction
        })
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();
      mergeBriefFromResponse(data);
      return { ok: response.ok, data: data, reply: normalizeReply(data), handoffs: data && data.handoffSuggestions, brief: data && data.brief, briefStatus: data && data.briefStatus };
    } catch (error) {
      return { ok: false, data: null, reply: '' };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function sendDesignPrompt(raw, extra) {
    const message = String(raw || '').trim();
    if (!message || isSending) return;
    isSending = true;
    lastUserPrompt = message;
    chatHistory.push({ role: 'user', content: message });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    if (designGenerate) designGenerate.disabled = true;
    renderDesignLoading();
    const result = await callAgent(message, extra || {});
    const fallback = 'LOGO + MOCKUPS\nNamaa Design Lab is ready. Generate one logo concept and category mockups from the confirmed brief.';
    const reply = result.reply || fallback;
    renderDesignWorkspace(reply, result.data);
    await generateDesignImage(reply);
    lastAgentAnswer = reply;
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    isSending = false;
    if (designGenerate) designGenerate.disabled = false;
  }

  async function sendPrompt(raw, extra) {
    const message = String(raw || '').trim();
    if (!message || isSending) return;
    if (activeAgent === 'design') {
      return sendDesignChatPrompt(message, extra || {});
    }
    if (activeAgent === 'website') {
      return sendWebsiteChatPrompt(message, extra || {});
    }
    if (activeAgent === 'strategy') {
      return sendStrategyChatPrompt(message, extra || {});
    }
    const displayMessage = extra && extra.displayMessage ? String(extra.displayMessage).trim() : message;
    isSending = true;
    lastUserPrompt = message;
    chatHistory.push({ role: 'user', content: message });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    if (sendButton) sendButton.disabled = true;
    addMessage('user', displayMessage || message);
    if (input) {
      input.value = '';
      resizeInput();
    }
    const localFlow = localBusinessReplyFor(message);
    if (activeAgent === 'business' && localFlow) {
      const assistantItem = addMessage('assistant', localFlow.reply);
      addChoiceButtons(assistantItem, localFlow.choices);
      addHandoffs(assistantItem, localFlow.handoffs);
      lastAgentAnswer = localFlow.reply;
      chatHistory.push({ role: 'assistant', content: localFlow.reply });
      if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
      isSending = false;
      if (sendButton) sendButton.disabled = false;
      if (input) input.focus();
      scrollToBottom();
      return;
    }
    const localConfirmed = isAffirmationMessage(message) && hasProjectBrief() && (projectBriefStatus && (projectBriefStatus.isReady || projectBriefStatus.level === 'ready' || projectBriefStatus.score >= 75));
    const loading = addMessage('assistant', loadingTextFor(message), { loading: true });
    const result = await callAgent(message, extra || {});
    if (localConfirmed) {
      projectBriefConfirmed = true;
      updateAgentLocks();
    }
    const fallback = 'Namaa واجد، ولكن الرد الذكي ما جاوبش دابا. جرّب مرة أخرى بعد لحظات.';
    const reply = result.reply || fallback;
    if (loading) {
      loading.classList.remove('loading');
      const bubble = loading.querySelector('.message-bubble');
      if (bubble) bubble.innerHTML = formatMessageHtml(reply);
      addHandoffs(loading, result.handoffs);
    } else {
      addMessage('assistant', reply);
    }
    lastAgentAnswer = reply;
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    isSending = false;
    if (sendButton) sendButton.disabled = false;
    if (input) input.focus();
    scrollToBottom();
  }

  agentButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const targetAgent = button.dataset.agent;
      if (targetAgent && targetAgent !== 'business' && !canOpenAgent(targetAgent)) {
        const required = requiredAgentFor(targetAgent);
        setAgent(required);
        addMessage('assistant', explainLockedAgent(targetAgent));
        return;
      }
      setAgent(targetAgent);
    });
  });

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      sendPrompt(input ? input.value : '');
    });
  }

  if (input) {
    input.addEventListener('input', resizeInput);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendPrompt(input.value);
      }
    });
  }

  if (designGenerate) {
    designGenerate.addEventListener('click', function () {
      if (!ensureFlowStep('design')) { setAgent('business'); return; }
      const prompt = Object.keys(projectBrief || {}).length
        ? 'Use the current confirmed Namaa project brief. Generate ONLY logo + category-specific mockups for Namaa Design Lab. No long text, no color section, no strategy, no website plan. Prepare one premium image-generation direction: logo first, then realistic mockups that match the project category, and a short handoff to Namaa Website.'
        : 'Ask me only for the missing essentials: project name, short description, and city/market.';
      sendDesignPrompt(prompt, { handoffFrom: 'design-workspace-button' });
    });
  }
  if (designBackTalk) designBackTalk.addEventListener('click', function () { setAgent('business'); });
  if (designToWebsite) {
    designToWebsite.addEventListener('click', function () {
      if (!ensureFlowStep('website')) return;
      setAgent('website');
    });
  }




  strategyOpenButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      openStrategyBoard(button.dataset.strategyOpen);
    });
    button.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openStrategyBoard(button.dataset.strategyOpen);
      }
    });
  });
  strategyModalCloseButtons.forEach(function (button) { button.addEventListener('click', closeStrategyBoard); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeStrategyBoard();
  });

  if (strategyGenerate) {
    strategyGenerate.addEventListener('click', function () {
      if (!ensureFlowStep('strategy')) return;
      const prompt = Object.keys(projectBrief || {}).length || lastAgentAnswer
        ? 'Use the confirmed Namaa project brief, previous Namaa Design direction and previous Namaa Website preview result. Create the FINAL Namaa Strategy workspace as 3 premium picture-style boards. Use exact headings: STRATEGY SNAPSHOT, PICTURE 1 MARKET RESEARCH, PICTURE 2 DIGITAL MARKETING STRATEGY, PICTURE 3 ROADMAP, FINAL ACTION NOTES. For each picture board write compact label:value bullets, no long paragraphs, max 7 key bullets per board, practical Morocco-first logic, assumptions clearly marked, and board-ready wording. Every board must respect the visual reference: Namaa logo, Namaa AI branding, and Created by Elboubakry Abdessamad. This is the final step after Talk → Design → Website.'
        : 'Ask me only for the missing essentials to create Namaa Strategy: project/service, city/market, target customer, budget, goal, current stage and channels.';
      sendStrategyChatPrompt(prompt, { handoffFrom: 'strategy-workspace-button', previousAgentAnswer: lastAgentAnswer });
    });
  }
  if (strategyBackTalk) strategyBackTalk.addEventListener('click', function () { setAgent('business'); });
  if (strategyToDesign) {
    strategyToDesign.addEventListener('click', function () {
      setAgent('design');
      sendPrompt('Use the previous Namaa Strategy output and current project brief. Transform the strategy into logo directions, mockups, brand system and Nano Banana/Gemini prompts. Keep it premium and organized.', {
        handoffFrom: 'strategy',
        previousUserPrompt: lastUserPrompt,
        previousAgentAnswer: lastStrategyAnswer || lastAgentAnswer,
        handoffBrief: projectBrief,
        displayMessage: 'فتح Namaa Design with this strategy'
      });
    });
  }
  if (strategyToWebsite) {
    strategyToWebsite.addEventListener('click', function () {
      setAgent('website');
      sendPrompt('Use the previous Namaa Strategy output and current project brief. Build a real landing page and show it as a live browser preview. Do not show source code in the UI.', {
        handoffFrom: 'strategy',
        previousUserPrompt: lastUserPrompt,
        previousAgentAnswer: lastStrategyAnswer || lastAgentAnswer,
        handoffBrief: projectBrief,
        displayMessage: 'فتح Namaa Dev with this strategy'
      });
    });
  }

  if (websiteGenerate) {
    websiteGenerate.addEventListener('click', function () {
      if (!ensureFlowStep('website')) return;
      const prompt = Object.keys(projectBrief || {}).length || lastDesignAnswer
        ? 'Use the current confirmed Namaa project brief and any previous Namaa Design output. Generate a complete premium standalone one-file HTML/CSS/JS landing page for live preview. Important: return only the full HTML document inside one html fenced code block. No explanation outside the code block. The page should look like a real landing page in a browser preview: strong hero, offer, benefits, trust, FAQ, CTA, mobile responsive CSS, and small JS only if useful.'
        : 'Ask me only for the missing essentials to build a real landing page: project/service, city/market, target customer, offer, CTA, visual style and language.';
      sendWebsitePrompt(prompt, { handoffFrom: 'website-workspace-button', previousAgentAnswer: lastDesignAnswer || lastAgentAnswer });
    });
  }

  if (websiteToStrategy) {
    websiteToStrategy.addEventListener('click', function () {
      if (!ensureFlowStep('strategy')) return;
      setAgent('strategy');
      sendPrompt('Use the confirmed project brief, previous Namaa Design output, and current Namaa Website landing page preview. Generate the final Namaa Strategy boards: market research, digital marketing strategy, roadmap and a short founder message. This is the final step after Talk → Design → Website.', {
        handoffFrom: 'website',
        previousUserPrompt: lastUserPrompt,
        previousAgentAnswer: [lastDesignAnswer, lastWebsiteAnswer || lastAgentAnswer].filter(Boolean).join('\n\n--- WEBSITE / DESIGN CONTEXT ---\n\n'),
        handoffBrief: projectBrief,
        displayMessage: 'فتح Namaa Strategy with this website preview'
      });
    });
  }

  if (websiteBackTalk) websiteBackTalk.addEventListener('click', function () { setAgent('business'); });
  if (websiteCopyCode) {
    websiteCopyCode.textContent = 'Source hidden';
    websiteCopyCode.disabled = true;
  }
  if (websiteDownloadCode) {
    websiteDownloadCode.textContent = 'Preview only';
    websiteDownloadCode.disabled = true;
  }


  if (websitePreviewDesktop) websitePreviewDesktop.addEventListener('click', function () { setWebsitePreviewDevice('desktop'); });
  if (websitePreviewMobile) websitePreviewMobile.addEventListener('click', function () { setWebsitePreviewDevice('mobile'); });

  if (openPackPopupButton) {
    openPackPopupButton.disabled = true;
    openPackPopupButton.addEventListener('click', function () { openPackModal(false); });
  }

  packCloseButtons.forEach(function (button) {
    button.addEventListener('click', closePackModal);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && packModal && packModal.classList.contains('is-open')) {
      closePackModal();
    }
  });

  if (packForm) {
    packForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const email = packEmail ? packEmail.value.trim() : '';
      if (!validPackEmail(email)) {
        packModalMessage('دخل email صحيح باش نرسلو لك Namaa Pack.', true);
        if (packEmail) packEmail.focus();
        return;
      }
      if (packSubmit) packSubmit.disabled = true;
      packModalMessage('رابط الباك توجد محليا. CRM/Sheet غادي نربطوه فآخر update.', false);
      try {
        const data = await submitPackLead(email);
        flowState.packRequested = true;
        packModalMessage('صافي. CRM/Sheet باقي مخلييناه لآخر update؛ رابط الباك توجد بنجاح.', false);
        if (packSubmit) packSubmit.textContent = 'Email saved';
        window.setTimeout(closePackModal, 1600);
      } catch (error) {
        packModalMessage(error && error.message ? error.message : 'Makanch connection mzyan. 3awed jreb.', true);
        if (packSubmit) packSubmit.disabled = false;
      }
    });
  }

  if (newChatButton) newChatButton.addEventListener('click', resetChat);
  if (scrollBottomButton) {
    scrollBottomButton.addEventListener('click', function () {
      scrollToBottom({ smooth: true });
      if (input) input.focus();
    });
  }
  if (stage) stage.addEventListener('scroll', updateScrollButton, { passive: true });
  window.addEventListener('resize', updateScrollButton);
  if (menuButton) menuButton.addEventListener('click', function () {
    const isOpen = document.body.classList.toggle('sidebar-open');
    menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  document.addEventListener('click', function (event) {
    if (!document.body.classList.contains('sidebar-open')) return;
    if (sidebar && sidebar.contains(event.target)) return;
    if (menuButton && menuButton.contains(event.target)) return;
    document.body.classList.remove('sidebar-open');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
  });

  resetDesignWorkspace();
  resetWebsiteWorkspace();
  resetStrategyWorkspace();
  setAgent('business');
  resizeInput();
  updateAgentLocks();
  updateScrollButton();
})();
