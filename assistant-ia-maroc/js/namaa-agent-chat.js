
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
    strategy: {
      title: 'Build your first serious strategy.',
      kicker: 'Namaa Strategy',
      subtitle: 'Market research, first digital marketing strategy, roadmap, positioning, KPIs, and a clean handoff to Namaa Design.',
      placeholder: 'Ask Namaa Strategy for market research, roadmap, or strategy...',
      context: 'Namaa Strategy = create first digital marketing strategy, market research, roadmaps, and prepare a design handoff.'
    },
    design: {
      title: 'Create your visual direction.',
      kicker: 'Namaa Design',
      subtitle: 'Nano Banana / Gemini prompts, mockups, logo directions, brand packs, UI ideas, and design handoff for websites.',
      placeholder: 'Ask Namaa Design for logo, mockups, or Nano Banana prompts...',
      context: 'Namaa Design = Nano Banana/Gemini image prompts, mockups, logo directions, visual system and brand pack.'
    },
    website: {
      title: 'Generate a real landing page.',
      kicker: 'Namaa Website',
      subtitle: 'Landing page plans and complete HTML/CSS/JS when you ask for code, based on strategy and design context.',
      placeholder: 'Ask Namaa Website to create a landing page or HTML/CSS/JS...',
      context: 'Namaa Website = Gemini creates real landing page structure or complete HTML/CSS/JS when requested.'
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

  let activeAgent = 'business';
  let isSending = false;
  let lastUserPrompt = '';
  let lastAgentAnswer = '';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function normalizeReply(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    return data.answer || data.reply || data.text || data.output || data.content || data.message || (data.data && (data.data.answer || data.data.reply || data.data.text)) || '';
  }

  function setAgent(agent) {
    const next = AGENTS[agent] ? agent : 'business';
    activeAgent = next;
    shell.dataset.agent = next;
    const data = AGENTS[next];
    if (title) title.textContent = data.title;
    if (subtitle) subtitle.textContent = data.subtitle;
    if (kicker) kicker.textContent = data.kicker;
    if (input) input.placeholder = data.placeholder;
    agentButtons.forEach((button) => button.classList.toggle('active', button.dataset.agent === next));
    document.body.classList.remove('sidebar-open');
    if (input) input.focus();
  }

  function resetChat() {
    if (messages) messages.innerHTML = '';
    if (stage) stage.classList.remove('has-messages');
    lastUserPrompt = '';
    lastAgentAnswer = '';
    if (input) {
      input.value = '';
      resizeInput();
      input.focus();
    }
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
    if (!targetItem || !Array.isArray(handoffs) || !handoffs.length) return;
    const wrapper = targetItem.querySelector('div:last-child');
    if (!wrapper) return;
    const actions = document.createElement('div');
    actions.className = 'namaa-handoffs';
    handoffs.slice(0, 3).forEach((handoff) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'handoff-button';
      button.textContent = handoff.label || ('Continue with ' + (handoff.agentLabel || handoff.agent));
      button.addEventListener('click', function () {
        const targetAgent = handoff.agent || handoff.target || 'business';
        setAgent(targetAgent);
        const prompt = handoff.prompt || ('Continue this work with ' + targetAgent);
        sendPrompt(prompt, {
          handoffFrom: activeAgent,
          previousUserPrompt: lastUserPrompt,
          previousAgentAnswer: lastAgentAnswer
        });
      });
      actions.appendChild(button);
    });
    wrapper.appendChild(actions);
  }

  function scrollToBottom() {
    if (stage) stage.scrollTop = stage.scrollHeight;
  }

  function resizeInput() {
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 180) + 'px';
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
          context: AGENTS[activeAgent].context,
          source: 'namaa-simple-chat-update-58',
          handoffFrom: extra && extra.handoffFrom,
          previousUserPrompt: extra && extra.previousUserPrompt,
          previousAgentAnswer: extra && extra.previousAgentAnswer
        })
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();
      return { ok: response.ok, data: data, reply: normalizeReply(data), handoffs: data && data.handoffSuggestions };
    } catch (error) {
      return { ok: false, data: null, reply: '' };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function sendPrompt(raw, extra) {
    const message = String(raw || '').trim();
    if (!message || isSending) return;
    isSending = true;
    lastUserPrompt = message;
    if (sendButton) sendButton.disabled = true;
    addMessage('user', message);
    if (input) {
      input.value = '';
      resizeInput();
    }
    const loading = addMessage('assistant', 'Namaa is thinking', { loading: true });
    const result = await callAgent(message, extra || {});
    const fallback = 'Namaa agents UI is ready. The Gemini route did not answer yet. Check Cloudflare Functions and GEMINI_API_KEY, then try again.';
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
    isSending = false;
    if (sendButton) sendButton.disabled = false;
    if (input) input.focus();
    scrollToBottom();
  }

  agentButtons.forEach((button) => {
    button.addEventListener('click', function () {
      setAgent(button.dataset.agent);
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

  if (newChatButton) newChatButton.addEventListener('click', resetChat);
  if (menuButton) menuButton.addEventListener('click', function () { document.body.classList.toggle('sidebar-open'); });
  document.addEventListener('click', function (event) {
    if (!document.body.classList.contains('sidebar-open')) return;
    if (sidebar && sidebar.contains(event.target)) return;
    if (menuButton && menuButton.contains(event.target)) return;
    document.body.classList.remove('sidebar-open');
  });

  setAgent('business');
  resizeInput();
})();
