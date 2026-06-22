(function () {
  'use strict';

  var AGENTS = {
    business: {
      id: 'business',
      title: 'Namaa Business Talk',
      subtitle: 'AI, business, IT, marketing',
      placeholder: 'Message Namaa Business Talk...',
      welcome: '<p><strong>Fhmtk. Ana Namaa Business Talk.</strong></p><p>I can help with business, AI, IT, marketing, startups, websites, and WhatsApp/CRM for Morocco.</p><p>Tell me your project, city, target customer, budget, and goal. I will answer in a practical way with steps, not random theory.</p>'
    },
    strategy: {
      id: 'strategy',
      title: 'Namaa Strategy',
      subtitle: 'Market research, roadmap, strategy',
      placeholder: 'Message Namaa Strategy about market research, roadmap, offer, positioning...',
      welcome: '<p><strong>Namaa Strategy ready.</strong></p><p>Send project type, city, target customer, budget, current channels, and goal. I will build first digital marketing strategy, market research logic, roadmap, KPIs and a design handoff.</p>'
    },
    design: {
      id: 'design',
      title: 'Namaa Design',
      subtitle: 'Nano Banana, mockups, logo',
      placeholder: 'Message Namaa Design about logo, mockups, brand pack, image prompts...',
      welcome: '<p><strong>Namaa Design ready.</strong></p><p>Send brand name, category, target, preferred style, colors, and assets needed. I will prepare logo directions, mockup pack, brand system and Nano Banana/Gemini prompts.</p>'
    },
    website: {
      id: 'website',
      title: 'Namaa Website',
      subtitle: 'Landing page, HTML, CSS, JS',
      placeholder: 'Message Namaa Website to create landing page structure or HTML/CSS/JS...',
      welcome: '<p><strong>Namaa Website ready.</strong></p><p>Send service, target, offer, CTA, colors and tell me if you need a blueprint or real one-file HTML/CSS/JS landing page.</p>'
    }
  };

  var state = {
    agent: 'business',
    history: [],
    lastUserPrompt: '',
    lastAgentAnswer: ''
  };

  var form = document.getElementById('namaaChatForm');
  var input = document.getElementById('namaaInput');
  var thread = document.getElementById('namaaMessages');
  var send = document.getElementById('namaaSend');
  var newChat = document.getElementById('namaaNewChat');
  var sidebar = document.getElementById('namaaSidebar');
  var backdrop = document.getElementById('namaaBackdrop');
  var menuBtn = document.getElementById('namaaMenuBtn');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeAgent(value) {
    var id = String(value || '').toLowerCase().trim();
    return AGENTS[id] ? id : 'business';
  }

  function markdownLite(value) {
    var text = escapeHtml(value || '');
    text = text.replace(/```([\s\S]*?)```/g, function (_, code) {
      return '<pre><code>' + code.trim() + '</code></pre>';
    });
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\n{2,}/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');
    return '<p>' + text + '</p>';
  }

  function scrollBottom() {
    var wrap = document.querySelector('.namaa-thread-wrap');
    if (wrap) wrap.scrollTop = wrap.scrollHeight;
  }

  function addMessage(role, html, options) {
    var article = document.createElement('article');
    article.className = 'namaa-message ' + (role === 'user' ? 'namaa-message-user' : 'namaa-message-ai');
    if (options && options.thinking) article.classList.add('namaa-thinking');

    if (role === 'user') {
      article.innerHTML = '<div class="namaa-bubble" dir="auto">' + html + '</div>';
    } else {
      article.innerHTML = '<div class="namaa-avatar">N</div><div class="namaa-bubble" dir="auto">' + html + '</div>';
    }
    thread.appendChild(article);
    scrollBottom();
    return article;
  }

  function setLoading(isLoading) {
    if (!send) return;
    send.disabled = Boolean(isLoading);
    send.querySelector('span').textContent = isLoading ? '...' : 'Send';
  }

  function closeSidebar() {
    document.body.classList.remove('namaa-sidebar-open');
    if (backdrop) backdrop.hidden = true;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  function openSidebar() {
    document.body.classList.add('namaa-sidebar-open');
    if (backdrop) backdrop.hidden = false;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
  }

  function switchAgent(agentId, showWelcome) {
    var id = normalizeAgent(agentId);
    state.agent = id;
    var agent = AGENTS[id];
    document.querySelectorAll('[data-agent]').forEach(function (button) {
      button.classList.toggle('is-active', normalizeAgent(button.getAttribute('data-agent')) === id);
    });
    if (input) input.placeholder = agent.placeholder;
    closeSidebar();
    if (showWelcome) addMessage('ai', agent.welcome);
    if (input) setTimeout(function () { input.focus(); }, 40);
  }

  function resetChat() {
    state.history = [];
    state.lastUserPrompt = '';
    state.lastAgentAnswer = '';
    thread.innerHTML = '';
    addMessage('ai', AGENTS[state.agent].welcome);
    if (input) input.value = '';
  }

  function handoffButtonsHtml(suggestions) {
    if (!Array.isArray(suggestions) || !suggestions.length) return '';
    return '<div class="namaa-handoff-row">' + suggestions.map(function (item) {
      var target = escapeHtml(item.agent || item.target || 'business');
      var label = escapeHtml(item.label || ('Continue with ' + (item.agentLabel || target)));
      return '<button type="button" data-handoff-agent="' + target + '" data-handoff-prompt="' + escapeHtml(item.prompt || '') + '">' + label + '</button>';
    }).join('') + '</div>';
  }

  async function askAgent(message, handoff) {
    setLoading(true);
    var thinking = addMessage('ai', '<p>Namaa kayfker...</p>', { thinking: true });
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 38000);

    try {
      var res = await fetch('/api/namaa/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          agent: state.agent,
          mode: state.agent,
          message: message,
          history: state.history.slice(-8),
          previousUserPrompt: handoff ? state.lastUserPrompt : '',
          previousAgentAnswer: handoff ? state.lastAgentAnswer : '',
          handoffFrom: handoff ? handoff.from || '' : ''
        })
      });

      clearTimeout(timer);
      var data = await res.json().catch(function () { return {}; });
      var answer = data.answer || data.fallbackAnswer || 'Namaa API is ready, but the answer was empty. Try again with more details.';
      var handoffs = data.handoffSuggestions || [];
      thinking.querySelector('.namaa-bubble').innerHTML = markdownLite(answer) + handoffButtonsHtml(handoffs);
      thinking.classList.remove('namaa-thinking');
      state.lastAgentAnswer = answer;
      state.history.push({ role: 'user', parts: [{ text: message }] });
      state.history.push({ role: 'model', parts: [{ text: answer }] });
      state.history = state.history.slice(-10);
    } catch (error) {
      clearTimeout(timer);
      var fallback = error && error.name === 'AbortError'
        ? 'Namaa took too long to answer. Try again with a shorter request.'
        : 'Namaa could not connect to the agent route right now. Check Cloudflare Functions and GEMINI_API_KEY secret.';
      thinking.querySelector('.namaa-bubble').innerHTML = markdownLite(fallback);
      thinking.classList.remove('namaa-thinking');
    } finally {
      setLoading(false);
      scrollBottom();
    }
  }

  document.addEventListener('click', function (event) {
    var agentBtn = event.target.closest('[data-agent]');
    if (agentBtn) {
      switchAgent(agentBtn.getAttribute('data-agent'), true);
      return;
    }

    var handoffBtn = event.target.closest('[data-handoff-agent]');
    if (handoffBtn) {
      var target = normalizeAgent(handoffBtn.getAttribute('data-handoff-agent'));
      var prompt = handoffBtn.getAttribute('data-handoff-prompt') || 'Continue from the previous result.';
      switchAgent(target, false);
      addMessage('user', escapeHtml(prompt));
      askAgent(prompt, { from: 'previous-agent' });
      return;
    }
  });

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var message = (input && input.value || '').trim();
      if (!message) return;
      state.lastUserPrompt = message;
      addMessage('user', escapeHtml(message));
      input.value = '';
      input.style.height = 'auto';
      askAgent(message, null);
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 150) + 'px';
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
  }

  if (newChat) newChat.addEventListener('click', resetChat);
  if (menuBtn) menuBtn.addEventListener('click', openSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);
  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeSidebar();
  });

  switchAgent('business', false);
})();
