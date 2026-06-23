(function () {
  'use strict';

  const AGENTS = {
    business: {
      title: 'How can Namaa help your project?',
      kicker: 'Namaa Business Talk',
      subtitle: 'Free talk about AI, business, IT, marketing, startups, websites, WhatsApp/CRM and the Moroccan market.',
      placeholder: 'Message Namaa Business Talk...',
      context: 'Namaa Business Talk = free talk about AI, business, IT, marketing, startups, websites, WhatsApp/CRM and Morocco-first execution.'
    },
    design: {
      title: 'Namaa Design workspace.',
      kicker: 'Namaa Design',
      subtitle: 'Logo directions, mockup pack, brand system and Nano Banana / Gemini prompts in a clean workspace.',
      placeholder: 'Namaa Design is a workspace. Generate visual pack from the confirmed brief...',
      context: 'Namaa Design = workspace for logo directions, mockups, brand system, Nano Banana/Gemini image prompts and design-to-website handoff.'
    },
    website: {
      title: 'Namaa Website live preview.',
      kicker: 'Namaa Website',
      subtitle: 'Namaa Dev creates a real landing page and opens it as a live browser preview — no source code shown.',
      placeholder: 'Namaa Website opens a live landing page preview, not source code...',
      context: 'Namaa Website = Namaa Dev workspace. Gemini creates a real standalone HTML/CSS/JS landing page internally and the UI shows only the working browser preview, not source code.'
    },
    strategy: {
      title: 'Build your first serious strategy.',
      kicker: 'Namaa Strategy',
      subtitle: 'Final step: market research, digital marketing strategy, 30/60/90 roadmap and KPIs after the website preview.',
      placeholder: 'Namaa Strategy is the final step after Design and Website...',
      context: 'Namaa Strategy = final step after Namaa Talk, Namaa Design and Namaa Website. It creates market research, digital marketing strategy and roadmap as branded boards.'
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
  const websitePreviewDesktop = document.getElementById('namaaPreviewDesktop');
  const websitePreviewMobile = document.getElementById('namaaPreviewMobile');

  const strategyWorkspace = document.getElementById('namaaStrategyWorkspace');
  const strategyIntro = document.getElementById('namaaStrategyIntro');
  const strategyGenerate = document.getElementById('namaaStrategyGenerate');
  const strategyBackTalk = document.getElementById('namaaStrategyBackTalk');
  const strategyToDesign = document.getElementById('namaaStrategyToDesign');
  const strategyToWebsite = document.getElementById('namaaStrategyToWebsite');

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
  const flowState = { designReady: false, websiteReady: false, strategyReady: false, packRequested: false };

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
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

  function boardHtml(slot, text, loading) {
    const labels = {
      market: ['01', 'Market Research', 'Audience • demand • competitors'],
      digital: ['02', 'Digital Strategy', 'Offer • funnel • channels'],
      roadmap: ['03', 'Roadmap', '30 • 60 • 90 days']
    };
    const meta = labels[slot] || ['00', 'Namaa Strategy', 'Final board'];
    const loadingClass = loading ? ' is-loading' : '';
    return '<div class="strategy-board-inner' + loadingClass + '">'
      + '<div class="strategy-board-watermark">Namaa</div>'
      + '<div class="strategy-board-meta"><span>Picture ' + meta[0] + '</span><strong>' + escapeHtml(meta[1]) + '</strong><small>' + escapeHtml(meta[2]) + '</small></div>'
      + '<div class="strategy-board-content">' + formatStrategyText(text, { maxLines: 24 }) + '</div>'
      + '<div class="strategy-board-footer"><span>Namaa AI</span><span>Created by Elboubakry Abdessamad</span></div>'
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
  }

  function flowWarning(targetAgent) {
    if (targetAgent === 'design' && !hasReadyBrief()) {
      return 'Bda b Namaa Talk: 3tih fikra dyal project, khlih yfhem brief, w jaweb b yes/s7i7. Mn b3d Design ghadi ykhdem mzyan.';
    }
    if (targetAgent === 'website' && !flowState.designReady) {
      return 'Kmel Namaa Design lwel. Website khaso brief + visual direction bach ykhdem landing page mzyana, maشي عشوائية.';
    }
    if (targetAgent === 'strategy' && !flowState.websiteReady) {
      return 'Kmel Namaa Website lwel. Strategy hiya final step: market research + marketing strategy + roadmap mn b3d landing page preview.';
    }
    return '';
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

  function normalizeReply(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    return data.answer || data.reply || data.text || data.output || data.content || data.message || (data.data && (data.data.answer || data.data.reply || data.data.text)) || '';
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
    document.body.classList.remove('sidebar-open');
    if (next === 'design') {
      refreshDesignBriefCard();
      ensureFlowStep('design');
    } else if (next === 'website') {
      refreshWebsiteBriefCard();
      ensureFlowStep('website');
    } else if (next === 'strategy') {
      refreshStrategyBriefCard();
      ensureFlowStep('strategy');
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
    resetDesignWorkspace();
    resetWebsiteWorkspace();
    resetStrategyWorkspace();
    if (input) {
      input.value = '';
      resizeInput();
      input.focus();
    }
    setAgent('business');
  }

  function addMessage(role, text, options) {
    if (!messages || !stage) return null;
    stage.classList.add('has-messages');
    const item = document.createElement('div');
    item.className = 'namaa-message ' + (role === 'user' ? 'user' : 'assistant') + (options && options.loading ? ' loading' : '');
    const avatar = role === 'user' ? '' : '<div class="message-avatar">N</div>';
    item.innerHTML = avatar + '<div><div class="message-bubble">' + escapeHtml(text) + '</div></div>';
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
    return warning + '\n\nDaba khdem l-step li qbl: ' + requiredLabel + '.';
  }

  function frontendHandoffsForActive() {
    if (activeAgent === 'business' && hasReadyBrief()) {
      return [{
        agent: 'design',
        label: 'Open Namaa Design',
        agentLabel: 'Namaa Design',
        displayMessage: 'Open Namaa Design with this confirmed project brief',
        prompt: 'Use the confirmed Namaa project brief from Business Talk. Create the polished Namaa Design workspace with exact headings: DESIGN SNAPSHOT, LOGO DIRECTIONS, BRAND SYSTEM, MOCKUP PACK, NANO BANANA / GEMINI PROMPTS, CONTENT NOTES, NAMAA WEBSITE HANDOFF. Keep it card-friendly and ready for website handoff. This is step 2 after Namaa Talk.'
      }];
    }
    if (activeAgent === 'design' && flowState.designReady) {
      return [{
        agent: 'website',
        label: 'Open Namaa Website',
        agentLabel: 'Namaa Website',
        displayMessage: 'Open Namaa Website with this design',
        prompt: 'Use the previous Namaa Design output and current project brief. Build a real landing page and show it as a live browser preview. Do not show source code in the UI.'
      }];
    }
    if (activeAgent === 'website' && flowState.websiteReady) {
      return [{
        agent: 'strategy',
        label: 'Open final Namaa Strategy',
        agentLabel: 'Namaa Strategy',
        displayMessage: 'Open final Namaa Strategy with this website preview',
        prompt: 'Use the confirmed project brief, previous Namaa Design output, and current Namaa Website landing page preview. Generate the final Namaa Strategy boards: market research, digital marketing strategy, 30/60/90 roadmap, KPIs and final action notes. This is the final step after Talk → Design → Website.'
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

  function scrollToBottom() {
    if (stage) stage.scrollTop = stage.scrollHeight;
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
    if (data.briefConfirmed === true) projectBriefConfirmed = true;
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

  function imagePromptFromDesign(text) {
    const promptSection = sectionFrom(String(text || ''), ['NANO BANANA / GEMINI PROMPTS', 'NANO BANANA', 'GEMINI PROMPTS', 'Image prompts'], ['CONTENT NOTES', 'NAMAA WEBSITE HANDOFF']);
    return [
      'Generate the final Namaa Design JPG preview board for this project.',
      'Use the confirmed project brief and the design direction below.',
      'The result must be a premium, organized presentation board with logo first, brand tokens, and category mockups.',
      '',
      'PROJECT BRIEF:',
      briefSummary(),
      '',
      'DESIGN DIRECTION:',
      cleanText(promptSection || text, 2200)
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
        + '<span class="generated-image-note">Visual ready. Full pack will be sent by email at the final step.</span>'
        + '<button type="button" id="namaaRegenerateImage">Regenerate visual</button>'
        + '</div>'
        + '</div>';
      const retry = document.getElementById('namaaRegenerateImage');
      if (retry) retry.addEventListener('click', function () { generateDesignImage(lastDesignAnswer || briefSummary()); });
      return;
    }
    frame.innerHTML = '<div><div class="design-preview-mark">N</div><p>' + escapeHtml(text || 'JPG preview will appear here after Namaa generates the design image.') + '</p></div>';
  }

  function setImageLoading(text) {
    const frame = document.getElementById('namaaDesignImageFrame');
    if (!frame) return;
    frame.innerHTML = '<div class="image-loading"><div class="design-preview-mark">N</div><p>' + escapeHtml(text || 'Namaa is generating the JPG visual preview with Gemini / Nano Banana...') + '</p><span>● ● ●</span></div>';
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
    setImageLoading('Namaa is generating a real JPG preview from this logo + mockup direction. This can take a little time.');
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
    setImagePlaceholder('Text design is ready, but real JPG generation failed: ' + message);
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
    if (!websitePreviewFrame) return;
    if (!code || String(code).indexOf('<') < 0) {
      updateWebsiteBrowserUrl(false);
      websitePreviewFrame.innerHTML = '<div><div class="website-preview-mark">W</div><p>The landing page will open here as a working mini website after Namaa Website generates it.</p></div>';
      return;
    }
    const safe = String(code || '');
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
    setWebsiteSlot('blueprint', 'Namaa will generate the working page directly in the browser preview.');
    setWebsiteSlot('hero', 'Hero, offer and CTA will appear inside the live page preview.');
    setWebsiteSlot('sections', 'Page sections will appear inside the live page preview.');
    setWebsiteSlot('leadflow', 'WhatsApp/form lead flow will appear inside the live page preview.');
    setWebsiteSlot('checklist', 'Preview is ready to test visually inside Namaa Website.');
    setWebsiteCode('');
    if (websiteIntro) websiteIntro.textContent = 'Open this workspace after Namaa Design. Namaa Website builds the real landing page preview from the confirmed brief + design direction. After review, open Namaa Strategy as the final step.';
  }

  function refreshWebsiteBriefCard() {
    setWebsiteSlot('brief', websiteBriefSummary());
    if (websiteIntro) {
      websiteIntro.textContent = Object.keys(projectBrief || {}).length
        ? 'Current brief detected. Generate a real landing page and open it as a live preview. Source code will stay hidden.'
        : 'No brief detected yet. Go back to Namaa Talk, confirm the project brief, then open Namaa Design before Website.';
    }
  }

  function renderWebsiteLoading() {
    refreshWebsiteBriefCard();
    setWebsiteSlot('blueprint', 'Namaa Website is preparing the landing page structure', true);
    setWebsiteSlot('hero', 'Namaa Website is writing the hero, offer and CTA', true);
    setWebsiteSlot('sections', 'Namaa Website is organizing section-by-section copy', true);
    setWebsiteSlot('leadflow', 'Namaa Website is preparing WhatsApp/form lead flow', true);
    setWebsiteSlot('checklist', 'Namaa Website is preparing the integration checklist', true);
    if (websiteCodeBlock) websiteCodeBlock.textContent = 'Generating live landing page preview. Source code hidden.';
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
    if (websiteIntro) websiteIntro.textContent = code ? 'Landing page generated. Review the working page inside the browser preview. Source code stays hidden. Next: open final Namaa Strategy.' : 'Namaa opened a working preview from the brief. You can regenerate for a richer Gemini visual version, or continue to final Namaa Strategy.';
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
    const fallback = 'Namaa Website preview is ready, but the Gemini route did not answer yet. Check GEMINI_API_KEY and redeploy, then generate the live landing page again.';
    const reply = result.reply || fallback;
    renderWebsiteWorkspace(reply);
    lastAgentAnswer = reply;
    chatHistory.push({ role: 'assistant', content: reply });
    if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    isSending = false;
    if (websiteGenerate) websiteGenerate.disabled = false;
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
    setSlot('brief', 'No confirmed brief yet. Start with Namaa Business Talk, confirm the brief, then open Namaa Design.');
    setSlot('logo', 'Logo concepts will appear here.');
    setSlot('brand', 'Colors, typography mood, icons and visual style will appear here.');
    setSlot('mockups', 'Website, mobile, social and business mockups will appear here.');
    setSlot('prompts', 'Copy-ready prompts for logo presentation, website mockup and social/ad creative will appear here.');
    setSlot('handoff', 'Website handoff will appear here after the design is generated.');
    setImagePlaceholder('JPG preview will appear here after Namaa generates the design image.');
    if (designIntro) designIntro.textContent = 'Open this workspace from Namaa Business Talk after confirming the project brief. Namaa Design will organize logo, mockups, visual preview and website handoff.';
  }

  function refreshDesignBriefCard() {
    setSlot('brief', briefSummary());
    if (designIntro) {
      designIntro.textContent = Object.keys(projectBrief || {}).length
        ? 'Current brief detected. Generate the visual direction, logo concepts, mockup pack and Nano Banana prompts from this project.'
        : 'No brief detected yet. Go back to Namaa Talk, describe your project, confirm it, then open Namaa Design.';
    }
  }

  function renderDesignLoading() {
    updateDesignProgress('logo');
    refreshDesignBriefCard();
    setSlot('logo', 'Namaa Design is preparing logo directions', true);
    setSlot('brand', 'Namaa Design is preparing brand colors, typography mood and visual rules', true);
    setSlot('mockups', 'Namaa Design is organizing the mockup pack', true);
    setSlot('prompts', 'Namaa Design is writing Nano Banana / Gemini prompts', true);
    setSlot('handoff', 'Namaa Design is preparing the handoff for Namaa Website', true);
    updateDesignProgress('visual');
    setImagePlaceholder('Preparing visual preview area. Namaa will generate the real JPG after the design direction is ready.');
  }

  function renderDesignWorkspace(reply, data) {
    const text = cleanText(reply);
    lastDesignAnswer = text;
    setSlot('brief', briefSummary());
    setSlot('logo', sectionFrom(text, ['LOGO DIRECTIONS', '2) LOGO DIRECTIONS', 'Logo directions'], ['BRAND SYSTEM', 'MOCKUP PACK', 'NANO BANANA', 'CONTENT NOTES', 'NAMAA WEBSITE HANDOFF']) || text.slice(0, 900));
    setSlot('brand', sectionFrom(text, ['BRAND SYSTEM', '3) BRAND SYSTEM', 'Brand system'], ['MOCKUP PACK', 'NANO BANANA', 'CONTENT NOTES', 'NAMAA WEBSITE HANDOFF']) || 'Brand system was not clearly separated. Review the full output in the prompts/handoff sections.');
    setSlot('mockups', sectionFrom(text, ['MOCKUP PACK', '4) MOCKUP PACK', 'Mockup pack'], ['NANO BANANA', 'GEMINI PROMPTS', 'CONTENT NOTES', 'NAMAA WEBSITE HANDOFF']) || 'Mockup pack was not clearly separated. Ask Namaa Design to regenerate with mockup pack details.');
    setSlot('prompts', sectionFrom(text, ['NANO BANANA / GEMINI PROMPTS', 'NANO BANANA', 'GEMINI PROMPTS', 'Image prompts'], ['CONTENT NOTES', 'NAMAA WEBSITE HANDOFF']) || 'Nano Banana / Gemini prompts were not clearly separated. Ask Namaa Design to regenerate prompts only.');
    setSlot('handoff', sectionFrom(text, ['NAMAA WEBSITE HANDOFF', 'Website handoff'], []) || 'Design handoff ready. Open Namaa Website to convert this visual direction into a landing page.');
    const imageUrl = data && data.imageUrl || data && data.image && (data.image.url || data.image.src);
    updateDesignProgress('website');
    setImagePlaceholder('JPG result area ready.', imageUrl);
    updateFlowState('designReady', true);
    if (designIntro) designIntro.textContent = 'Design generated. Review the sections below. If it looks good, open Namaa Website with this design.';
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
    setStrategySlot('roadmap', 'Roadmap board will appear here: weekly actions, priorities, budget logic, KPIs, risks and what to do next.');
    setStrategySlot('kpi', 'KPIs and budget logic will appear here.');
    setStrategySlot('handoff', 'Final strategy output will appear here. This is the last step after design and website preview. CRM/email capture will be connected in the final update.');
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
    setStrategySlot('kpi', 'Namaa Strategy is preparing KPIs, budget logic and risks', true);
    setStrategySlot('handoff', 'Namaa Strategy is preparing the final output and KPI/action blocks', true);
  }

  function renderStrategyWorkspace(reply) {
    const text = cleanText(reply);
    lastStrategyAnswer = text;
    setStrategySlot('brief', strategyBriefSummary());
    const market = strategySection(text, ['PICTURE 1 MARKET RESEARCH', 'PICTURE 01 MARKET RESEARCH', 'MARKET RESEARCH PICTURE', 'MARKET RESEARCH'], ['PICTURE 2 DIGITAL MARKETING STRATEGY', 'PICTURE 02 DIGITAL MARKETING STRATEGY', 'DIGITAL MARKETING STRATEGY', 'PICTURE 3 ROADMAP', 'KPI DASHBOARD', 'NAMAA DESIGN HANDOFF']);
    const digital = strategySection(text, ['PICTURE 2 DIGITAL MARKETING STRATEGY', 'PICTURE 02 DIGITAL MARKETING STRATEGY', 'DIGITAL MARKETING STRATEGY PICTURE', 'DIGITAL MARKETING STRATEGY'], ['PICTURE 3 ROADMAP', 'PICTURE 03 ROADMAP', 'ROADMAP', 'KPI DASHBOARD', 'NAMAA DESIGN HANDOFF']);
    const roadmap = strategySection(text, ['PICTURE 3 ROADMAP', 'PICTURE 03 ROADMAP', 'ROADMAP PICTURE', '30/60/90 ROADMAP', 'ROADMAP'], ['KPI DASHBOARD', 'NAMAA DESIGN HANDOFF', 'NAMAA WEBSITE STARTER HANDOFF']);
    const kpi = strategySection(text, ['KPI DASHBOARD', 'BUDGET LOGIC AND KPIS', 'KPIS'], ['NAMAA DESIGN HANDOFF', 'NAMAA WEBSITE STARTER HANDOFF']);
    const handoff = strategySection(text, ['FINAL ACTION NOTES', 'FINAL NOTES'], []);
    setStrategySlot('market', market || text.slice(0, 1200));
    setStrategySlot('digital', digital || 'Digital strategy board was not clearly separated. Click Generate again and Namaa will structure it into picture 02.');
    setStrategySlot('roadmap', roadmap || 'Roadmap board was not clearly separated. Click Generate again and Namaa will structure it into picture 03.');
    setStrategySlot('kpi', kpi || 'KPIs and budget logic will appear here when the strategy contains a KPI dashboard.');
    setStrategySlot('handoff', handoff || 'Final strategy boards ready. Review the market research, digital strategy and 30/60/90 roadmap. CRM/email pack link will be activated in the final update.');
    updateFlowState('strategyReady', true);
    if (strategyIntro) strategyIntro.textContent = 'Final strategy generated as three branded visual boards. Review them as the final Namaa project output. CRM/email pack link will be activated in the final update.';
    if (openPackPopupButton) { openPackPopupButton.disabled = true; openPackPopupButton.hidden = true; }
    // CRM/email popup is parked until the final CRM update.
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
    const fallback = 'STRATEGY SNAPSHOT\nNamaa Strategy workspace is ready with Namaa logo and Created by Elboubakry Abdessamad branding, but the Gemini route did not answer yet. Check GEMINI_API_KEY and redeploy.\n\nPICTURE 1 MARKET RESEARCH\nSend project type, city, target and offer to build the market research board.\n\nPICTURE 2 DIGITAL MARKETING STRATEGY\nChannels, offer, funnel, content pillars and WhatsApp/CRM will appear here.\n\nPICTURE 3 ROADMAP\n30/60/90 actions, budget logic and KPIs will appear here.\n\nKPI DASHBOARD\nPerformance indicators will appear here.\n\nNAMAA DESIGN HANDOFF\nDesign handoff will appear here.\n\nNAMAA WEBSITE STARTER HANDOFF\nWebsite handoff will appear here.';
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
          source: 'namaa-simple-chat-update-79-security-speed-clean',
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
    const fallback = 'DESIGN SNAPSHOT\nNamaa Design workspace is ready, but the Gemini route did not answer yet.\n\nLOGO DIRECTIONS\nSend brand name, category, target and style to prepare 3 logo directions.\n\nBRAND SYSTEM\nColors, typography mood and visual rules will appear here.\n\nMOCKUP PACK\nWebsite, mobile, social and business mockups will appear here.\n\nNANO BANANA / GEMINI PROMPTS\nCopy-ready image prompts will appear here once Gemini answers.\n\nNAMAA WEBSITE HANDOFF\nAfter the design is ready, open Namaa Website to build the landing page.';
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
      return sendDesignPrompt(message, extra || {});
    }
    if (activeAgent === 'website') {
      return sendWebsitePrompt(message, extra || {});
    }
    if (activeAgent === 'strategy') {
      return sendStrategyPrompt(message, extra || {});
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
    const localConfirmed = isAffirmationMessage(message) && hasProjectBrief() && (projectBriefStatus && (projectBriefStatus.isReady || projectBriefStatus.level === 'ready' || projectBriefStatus.score >= 75));
    const loading = addMessage('assistant', 'Namaa is thinking', { loading: true });
    const result = await callAgent(message, extra || {});
    if (localConfirmed) projectBriefConfirmed = true;
    const fallback = 'Namaa agents UI is ready. The live AI route did not answer yet. Check the private backend connection, then try again.';
    const reply = result.reply || fallback;
    if (loading) {
      loading.classList.remove('loading');
      const bubble = loading.querySelector('.message-bubble');
      if (bubble) bubble.textContent = reply;
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
        ? 'Use the current confirmed Namaa project brief and generate a polished Namaa Design workspace. Use exact headings: DESIGN SNAPSHOT, LOGO DIRECTIONS, BRAND SYSTEM, MOCKUP PACK, NANO BANANA / GEMINI PROMPTS, CONTENT NOTES, NAMAA WEBSITE HANDOFF. Keep it organized for dashboard cards: short bullets, clear decisions, 3 logo directions, practical mockups, clean color palette, mobile/website visual direction, and a direct handoff to Namaa Website.'
        : 'Ask me only for the missing essentials to create a Namaa Design workspace: brand name, category, target, preferred style and main deliverable.';
      sendDesignPrompt(prompt, { handoffFrom: 'design-workspace-button' });
    });
  }
  if (designBackTalk) designBackTalk.addEventListener('click', function () { setAgent('business'); });
  if (designToWebsite) {
    designToWebsite.addEventListener('click', function () {
      if (!ensureFlowStep('website')) return;
      setAgent('website');
      sendPrompt('Use the previous Namaa Design workspace output and current project brief. Generate a complete standalone one-file HTML/CSS/JS landing page and show it as a live browser preview. Do not show source code in the UI.', {
        handoffFrom: 'design',
        previousUserPrompt: lastUserPrompt,
        previousAgentAnswer: lastDesignAnswer || lastAgentAnswer,
        handoffBrief: projectBrief,
        displayMessage: 'Open Namaa Website with this design'
      });
    });
  }



  if (strategyGenerate) {
    strategyGenerate.addEventListener('click', function () {
      if (!ensureFlowStep('strategy')) return;
      const prompt = Object.keys(projectBrief || {}).length || lastAgentAnswer
        ? 'Use the confirmed Namaa project brief, previous Namaa Design direction and previous Namaa Website preview result. Create the FINAL Namaa Strategy workspace as 3 premium picture-style boards. Use exact headings: STRATEGY SNAPSHOT, PICTURE 1 MARKET RESEARCH, PICTURE 2 DIGITAL MARKETING STRATEGY, PICTURE 3 ROADMAP, KPI DASHBOARD, FINAL ACTION NOTES. For each picture board write compact label:value bullets, no long paragraphs, max 7 key bullets per board, practical Morocco-first logic, assumptions clearly marked, and board-ready wording. Every board must respect the visual reference: Namaa logo, Namaa AI branding, and Created by Elboubakry Abdessamad. This is the final step after Talk → Design → Website.'
        : 'Ask me only for the missing essentials to create Namaa Strategy: project/service, city/market, target customer, budget, goal, current stage and channels.';
      sendStrategyPrompt(prompt, { handoffFrom: 'strategy-workspace-button', previousAgentAnswer: lastAgentAnswer });
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
        displayMessage: 'Open Namaa Design with this strategy'
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
        displayMessage: 'Open Namaa Website with this strategy'
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
      sendPrompt('Use the confirmed project brief, previous Namaa Design output, and current Namaa Website landing page preview. Generate the final Namaa Strategy boards: market research, digital marketing strategy, 30/60/90 roadmap, KPIs and final action notes. This is the final step after Talk → Design → Website.', {
        handoffFrom: 'website',
        previousUserPrompt: lastUserPrompt,
        previousAgentAnswer: [lastDesignAnswer, lastWebsiteAnswer || lastAgentAnswer].filter(Boolean).join('\n\n--- WEBSITE / DESIGN CONTEXT ---\n\n'),
        handoffBrief: projectBrief,
        displayMessage: 'Open final Namaa Strategy with this website preview'
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
        packModalMessage('Dakhl email s7i7 bach nrslo lik Namaa Pack.', true);
        if (packEmail) packEmail.focus();
        return;
      }
      if (packSubmit) packSubmit.disabled = true;
      packModalMessage('Pack link tوجد محليا. CRM/Sheet ghadi nربطوه f update lkhra.', false);
      try {
        const data = await submitPackLead(email);
        flowState.packRequested = true;
        packModalMessage('Safi. CRM/Sheet mazal parked l final update; pack link tوجد b najah.', false);
        if (packSubmit) packSubmit.textContent = 'Email saved';
        window.setTimeout(closePackModal, 1600);
      } catch (error) {
        packModalMessage(error && error.message ? error.message : 'Makanch connection mzyan. 3awed jreb.', true);
        if (packSubmit) packSubmit.disabled = false;
      }
    });
  }

  if (newChatButton) newChatButton.addEventListener('click', resetChat);
  if (menuButton) menuButton.addEventListener('click', function () { document.body.classList.toggle('sidebar-open'); });
  document.addEventListener('click', function (event) {
    if (!document.body.classList.contains('sidebar-open')) return;
    if (sidebar && sidebar.contains(event.target)) return;
    if (menuButton && menuButton.contains(event.target)) return;
    document.body.classList.remove('sidebar-open');
  });

  resetDesignWorkspace();
  resetWebsiteWorkspace();
  resetStrategyWorkspace();
  setAgent('business');
  resizeInput();
})();
