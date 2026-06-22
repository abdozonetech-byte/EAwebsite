(function () {
  'use strict';

  const form = document.getElementById('namaaChatForm');
  const input = document.getElementById('namaaInput');
  const messages = document.getElementById('namaaMessages');
  const agentTitle = document.getElementById('namaaAgentTitle');
  const agentSubtitle = document.getElementById('namaaAgentSubtitle');
  const activeAgentBadge = document.getElementById('namaaActiveAgentBadge');
  const quickPrompts = document.getElementById('namaa-prompts');
  const sendButton = form ? form.querySelector('button[type="submit"]') : null;
  let isSending = false;

  const endpoints = ['/api/namaa/agent', '/api/namaa/talk', '/api/namaa'];

  const agents = {
    business: {
      id: 'business',
      label: 'Namaa Business Talk',
      badge: 'Business Talk',
      mode: 'conversation',
      placeholder: 'Ask Namaa Business Talk about AI, business, IT, marketing, startups...',
      subtitle: 'Free conversation about AI, business, IT, marketing, startups and Morocco.',
      welcome: '<strong>Switched to Namaa Business Talk.</strong><br>Dwi b 7orriya 3la AI, business, IT, marketing, startups, websites, WhatsApp/CRM, and Moroccan market decisions.',
      context: 'Namaa Business Talk is a free Moroccan business conversation agent focused on AI, business, IT, marketing, startups, websites, WhatsApp/CRM and practical Moroccan market advice.',
      prompts: [
        ['Free project talk', 'Ana baghi ndwi free talk 3la project dyali f AI, business, IT, marketing. Sowlni bach tfhem context.'],
        ['Business advice', '3tini advice practical 3la idea business f Morocco: wach mzyana, risks, w first steps.'],
        ['AI for Morocco', 'Explain lia kifach AI y9der y3awen small business f Morocco b examples practical.'],
        ['Choose direction', 'N9ach m3aya best direction: website, marketing, CRM, automation, or content?']
      ]
    },
    strategy: {
      id: 'strategy',
      label: 'Namaa Strategy',
      badge: 'Strategy',
      mode: 'strategy',
      placeholder: 'Ask Namaa Strategy for market research, digital strategy, roadmap...',
      subtitle: 'Creates digital marketing strategy, market research, roadmaps and a clean brief for Namaa Design.',
      welcome: '<strong>Switched to Namaa Strategy.</strong><br>Give me project type, city, target, budget, offer, and goal. I will prepare market research, first digital strategy, roadmap, and a design-ready brief.',
      context: 'Namaa Strategy creates Moroccan market research, positioning, digital marketing strategy, competitors analysis, roadmaps, budgets, offer structure and handoff briefs for Namaa Design.',
      prompts: [
        ['Start strategy', 'Sowlni 7 questions bach tfhem project dyali, mn b3d 3tini first digital marketing strategy.'],
        ['Market research', 'Dir lia market research f Morocco 3la niche dyali: competitors, price, demand, cities, risks, opportunities.'],
        ['Roadmap', 'Bni lia roadmap 30/60/90 days l launch dyal had project f Morocco.'],
        ['Design brief', 'Khrej lia design brief ultra organise bach Namaa Design y9der ydir visual direction w mockups.']
      ]
    },
    design: {
      id: 'design',
      label: 'Namaa Design',
      badge: 'Design',
      mode: 'design',
      placeholder: 'Ask Namaa Design for logo, mockups, Nano Banana prompts, brand direction...',
      subtitle: 'Generates logo directions, mockup packs, brand systems and Nano Banana/Gemini prompts.',
      welcome: '<strong>Switched to Namaa Design.</strong><br>Give me the brand, audience, style, colors, and project goal. I will generate logo directions, a mini brand system, mockup pack, UI style, and Nano Banana/Gemini-ready prompts.',
      context: 'Namaa Design Generator creates logo directions, mini brand systems, mockup packs, UI/UX direction and Nano Banana or Gemini image-generation prompts for Moroccan businesses.',
      prompts: [
        ['Logo generator', 'Dir lia 3 logo directions professional l brand dyali: symbol idea, typography mood, colors, usage notes, and risks to avoid.'],
        ['Mockup pack', 'Prepare lia complete mockup pack: website hero, mobile screen, social post, business card, WhatsApp preview, and Nano Banana/Gemini prompts.'],
        ['Brand system', 'Bni lia mini brand system: colors with usage, typography mood, icons, image style, UI cards, social media look.'],
        ['Nano Banana prompts', 'Kteb lia 3 copy-ready Nano Banana/Gemini prompts: logo presentation, website mockup, and social ad creative.']
      ]
    },
    website: {
      id: 'website',
      label: 'Namaa Website',
      badge: 'Website',
      mode: 'website',
      placeholder: 'Ask Namaa Website to create a landing page in HTML, CSS, JS...',
      subtitle: 'Builds landing page blueprints and real one-file HTML/CSS/JS when requested.',
      welcome: '<strong>Switched to Namaa Website.</strong><br>Give me service, target, offer, CTA, colors and style. I can create a landing page blueprint or a complete one-file HTML/CSS/JS page.',
      context: 'Namaa Website Builder creates landing page blueprints and complete one-file HTML/CSS/JS pages, including copywriting, CTA, WhatsApp lead flow, responsive sections, trust blocks, FAQ and safe demo forms.',
      prompts: [
        ['Landing blueprint', 'Create lia landing page blueprint: page goal, hero, problem, solution, proof, offer, FAQ, CTA, WhatsApp flow, and mobile notes.'],
        ['One-file code', 'Kteb lia complete one-file HTML/CSS/JS landing page professional, responsive, safe, and ready to paste in index.html.'],
        ['From design brief', 'Transform had design brief into website sections, copywriting, CTA, mobile hierarchy, and code-ready handoff.'],
        ['Improve page', 'Analyse had landing page idea w 3tini UI/UX improvements before coding, with conversion and trust notes.']
      ]
    }
  };

  let activeAgent = agents.business;
  let lastAssistantReply = '';
  let lastUserPrompt = '';
  let lastAgentId = 'business';

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[char];
    });
  }


  function renderAssistantContent(value) {
    const source = String(value || '');
    const parts = [];
    const codeRegex = /```([a-zA-Z0-9#+._-]*)?\s*\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(source)) !== null) {
      const before = source.slice(lastIndex, match.index);
      if (before) parts.push(escapeHtml(before));

      const lang = String(match[1] || 'code').trim() || 'code';
      const code = String(match[2] || '').replace(/^\n+|\n+$/g, '');
      parts.push(
        '<div class="namaa-code-block">' +
          '<div class="namaa-code-head"><span>' + escapeHtml(lang) + '</span><button type="button" data-copy-code>Copy</button></div>' +
          '<pre><code>' + escapeHtml(code) + '</code></pre>' +
        '</div>'
      );
      lastIndex = codeRegex.lastIndex;
    }

    const after = source.slice(lastIndex);
    if (after) parts.push(escapeHtml(after));
    return parts.join('');
  }

  function setBubbleHtml(item, html) {
    const bubble = item && item.querySelector('.namaa-bubble');
    if (bubble) bubble.innerHTML = html;
  }

  function addMessage(role, text, loading, htmlMode) {
    if (!messages) return null;
    const item = document.createElement('div');
    item.className = 'namaa-message ' + (role === 'user' ? 'namaa-message-user' : 'namaa-message-ai') + (loading ? ' namaa-loading' : '');
    const avatar = role === 'user' ? 'You' : 'N';
    item.innerHTML = '<div class="namaa-avatar">' + avatar + '</div><div class="namaa-bubble"></div>';
    const bubble = item.querySelector('.namaa-bubble');
    if (bubble) bubble[htmlMode ? 'innerHTML' : 'textContent'] = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  function normalizeReply(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    return data.reply || data.answer || data.text || data.output || data.content || data.message || (data.data && (data.data.reply || data.data.text || data.data.answer)) || '';
  }

  async function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeoutMs || 38000);
    try {
      return await fetch(url, Object.assign({}, options || {}, {signal: controller.signal}));
    } finally {
      clearTimeout(timer);
    }
  }

  function setSendingState(value) {
    isSending = Boolean(value);
    if (sendButton) {
      sendButton.disabled = isSending;
      sendButton.textContent = isSending ? 'Sending...' : 'Send';
    }
    if (input) input.setAttribute('aria-busy', isSending ? 'true' : 'false');
  }

  function normalizeAgentId(value) {
    const id = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (id === 'business_talk' || id === 'talk' || id === 'chat') return 'business';
    if (id === 'web' || id === 'dev' || id === 'landing') return 'website';
    return agents[id] ? id : 'business';
  }

  function renderPrompts(agent) {
    if (!quickPrompts) return;
    quickPrompts.innerHTML = agent.prompts.map(function (item) {
      return '<button class="namaa-prompt" data-prompt="' + escapeHtml(item[1]) + '">' + escapeHtml(item[0]) + '</button>';
    }).join('');
  }

  function switchAgent(agentId, silent) {
    const nextAgent = agents[normalizeAgentId(agentId)] || agents.business;
    activeAgent = nextAgent;

    if (agentTitle) agentTitle.textContent = nextAgent.label;
    if (agentSubtitle) agentSubtitle.textContent = nextAgent.subtitle;
    if (activeAgentBadge) activeAgentBadge.textContent = nextAgent.badge;
    if (input) input.setAttribute('placeholder', nextAgent.placeholder);
    renderPrompts(nextAgent);

    document.querySelectorAll('[data-agent]').forEach(function (link) {
      link.classList.toggle('active', normalizeAgentId(link.getAttribute('data-agent')) === nextAgent.id);
    });

    if (!silent) {
      addMessage('ai', nextAgent.welcome, false, true);
    }
  }

  function buildLocalHandoffs(agentId) {
    if (agentId === 'strategy') {
      return [
        {target: 'design', label: 'Continue with Namaa Design', prompt: 'Transform this strategy into a premium visual identity, logo direction, mockups and Nano Banana/Gemini prompts.'},
        {target: 'website', label: 'Build landing page with Namaa Website', prompt: 'Transform this strategy into a high-converting landing page structure and HTML/CSS/JS-ready plan.'}
      ];
    }
    if (agentId === 'design') {
      return [
        {target: 'website', label: 'Send design to Namaa Website', prompt: 'Transform this brand system, logo direction and mockup pack into a responsive landing page plan and code-ready sections.'}
      ];
    }
    if (agentId === 'business') {
      return [
        {target: 'strategy', label: 'Turn this into a strategy', prompt: 'Transform this business conversation into market research, digital strategy, roadmap, budget logic and KPIs.'}
      ];
    }
    return [];
  }

  function normalizeHandoffs(data, agentId) {
    const raw = data && (data.handoffSuggestions || data.nextAgentSuggestions || data.handoffs);
    if (Array.isArray(raw) && raw.length) {
      return raw.map(function (item) {
        if (typeof item === 'string') {
          const target = normalizeAgentId(item);
          return {target: target, label: 'Continue with ' + agents[target].label, prompt: 'Continue this result with ' + agents[target].label + ' using the previous answer as context.'};
        }
        const target = normalizeAgentId(item.target || item.agent || item.id || item.nextAgent);
        return {
          target: target,
          label: item.label || ('Continue with ' + agents[target].label),
          prompt: item.prompt || item.readyPrompt || item.instruction || ('Continue this result with ' + agents[target].label + ' using the previous answer as context.')
        };
      }).filter(function (item) { return agents[item.target]; });
    }
    return buildLocalHandoffs(agentId);
  }

  function renderHandoffButtons(handoffs) {
    if (!handoffs || !handoffs.length) return '';
    return '<div class="namaa-handoff-bar" aria-label="Namaa agent handoff options">' + handoffs.map(function (item) {
      return '<button type="button" class="namaa-handoff-btn" data-handoff-agent="' + escapeHtml(item.target) + '" data-handoff-prompt="' + escapeHtml(item.prompt) + '">' + escapeHtml(item.label) + '</button>';
    }).join('') + '</div>';
  }

  async function callNamaa(prompt, options) {
    const opts = options || {};
    const payload = {
      message: prompt,
      prompt: prompt,
      agent: activeAgent.id,
      mode: activeAgent.mode,
      source: 'namaa-dashboard-ui-update-55',
      language: 'auto',
      context: activeAgent.context,
      handoffFrom: opts.handoffFrom || '',
      previousUserPrompt: opts.previousUserPrompt || '',
      previousAgentAnswer: opts.previousAgentAnswer || ''
    };

    for (const endpoint of endpoints) {
      try {
        const response = await fetchWithTimeout(endpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        }, activeAgent.id === 'website' ? 45000 : 32000);
        if (!response.ok) continue;
        const type = response.headers.get('content-type') || '';
        const data = type.includes('application/json') ? await response.json() : await response.text();
        const reply = normalizeReply(data);
        if (reply) return {reply: reply, data: data};
      } catch (error) {
        // Try next endpoint, keep UI alive without exposing errors to visitors.
      }
    }

    return {
      reply: activeAgent.label + ' is ready, but the live AI route did not answer now. Try again in a moment or check the private API setup.',
      data: {handoffSuggestions: buildLocalHandoffs(activeAgent.id)}
    };
  }

  async function sendPrompt(prompt, options) {
    const clean = String(prompt || '').trim();
    if (!clean || isSending) return;
    const opts = options || {};
    setSendingState(true);
    addMessage('user', opts.displayPrompt || clean);
    if (input) input.value = '';
    const loading = addMessage('ai', activeAgent.label + ' is thinking', true);
    const agentAtSend = activeAgent.id;
    try {
      const result = await callNamaa(clean, opts);
      const handoffs = normalizeHandoffs(result.data, agentAtSend);
      const html = renderAssistantContent(result.reply) + renderHandoffButtons(handoffs);

      lastAssistantReply = result.reply;
      lastUserPrompt = clean;
      lastAgentId = agentAtSend;

      if (loading) {
        loading.classList.remove('namaa-loading');
        setBubbleHtml(loading, html);
      } else {
        addMessage('ai', html, false, true);
      }
    } catch (error) {
      if (loading) {
        loading.classList.remove('namaa-loading');
        setBubbleHtml(loading, renderAssistantContent('Namaa is ready, but the request stopped before the answer arrived. Try again in a moment.'));
      }
    } finally {
      setSendingState(false);
      if (messages) messages.scrollTop = messages.scrollHeight;
    }
  }

  function startHandoff(targetAgent, instruction) {
    const target = normalizeAgentId(targetAgent);
    if (!lastAssistantReply) return;
    switchAgent(target);
    const prompt = [
      instruction || ('Continue this work with ' + agents[target].label + '.'),
      '',
      'Previous user request:',
      lastUserPrompt || 'Not provided.',
      '',
      'Previous Namaa agent answer from ' + (agents[lastAgentId] ? agents[lastAgentId].label : lastAgentId) + ':',
      lastAssistantReply
    ].join('\n');
    sendPrompt(prompt, {
      displayPrompt: instruction || ('Continue this work with ' + agents[target].label + '.'),
      handoffFrom: lastAgentId,
      previousUserPrompt: lastUserPrompt,
      previousAgentAnswer: lastAssistantReply
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      sendPrompt(input ? input.value : '');
    });
  }

  document.addEventListener('click', function (event) {
    const copyCode = event.target.closest('[data-copy-code]');
    if (copyCode) {
      event.preventDefault();
      const block = copyCode.closest('.namaa-code-block');
      const code = block && block.querySelector('code') ? block.querySelector('code').textContent : '';
      if (code && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function () {
          copyCode.textContent = 'Copied';
          setTimeout(function () { copyCode.textContent = 'Copy'; }, 1300);
        }).catch(function () { copyCode.textContent = 'Select code'; });
      }
      return;
    }

    const handoff = event.target.closest('[data-handoff-agent]');
    if (handoff) {
      event.preventDefault();
      startHandoff(handoff.getAttribute('data-handoff-agent'), handoff.getAttribute('data-handoff-prompt'));
      return;
    }

    const agentLink = event.target.closest('[data-agent]');
    if (agentLink) {
      event.preventDefault();
      switchAgent(agentLink.getAttribute('data-agent'));
      const chat = document.getElementById('namaa-chat');
      if (chat) chat.scrollIntoView({behavior: 'smooth', block: 'start'});
      return;
    }

    const trigger = event.target.closest('[data-prompt]');
    if (!trigger) return;
    event.preventDefault();
    const prompt = trigger.getAttribute('data-prompt');
    if (input) {
      input.value = prompt;
      input.focus();
    }
    sendPrompt(prompt);
  });

  switchAgent('business', true);
})();
