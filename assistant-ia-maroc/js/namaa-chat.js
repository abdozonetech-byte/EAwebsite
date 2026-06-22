(function () {
  'use strict';

  const agents = window.NAMAA_AGENTS || [];
  const state = {
    agent: agents[0],
    history: {}
  };

  const selectors = {
    agentList: document.getElementById('namaaAgentList'),
    mobileAgentSelect: document.getElementById('namaaMobileAgentSelect'),
    badge: document.getElementById('namaaAgentBadge'),
    title: document.getElementById('namaaHeroTitle'),
    subtitle: document.getElementById('namaaHeroSubtitle'),
    heroIcon: document.getElementById('namaaHeroIcon'),
    heroPills: document.getElementById('namaaHeroPills'),
    quickActions: document.getElementById('namaaQuickActions'),
    cards: document.getElementById('namaaAgentCards'),
    sideTitle: document.getElementById('namaaSideTitle'),
    sideItems: document.getElementById('namaaSideItems'),
    visualTitle: document.getElementById('namaaVisualTitle'),
    visualLabel: document.getElementById('namaaVisualLabel'),
    visualSteps: document.getElementById('namaaVisualSteps'),
    visualBars: document.getElementById('namaaVisualBars'),
    chatTitle: document.getElementById('namaaChatTitle'),
    chatSubtitle: document.getElementById('namaaChatSubtitle'),
    statusBadge: document.getElementById('namaaStatusBadge'),
    form: document.getElementById('namaaChatForm'),
    input: document.getElementById('namaaInput'),
    messages: document.getElementById('namaaMessages'),
    promptWrap: document.getElementById('namaa-prompts')
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[char];
    });
  }

  function getAgent(id) {
    return agents.find(function (agent) { return agent.id === id; }) || agents[0];
  }

  function setAccent(agent) {
    document.documentElement.style.setProperty('--namaa-agent-accent', agent.accent);
  }

  function renderAgentList() {
    if (!selectors.agentList) return;
    selectors.agentList.innerHTML = agents.map(function (agent) {
      return [
        '<li>',
          '<button class="namaa-agent-link" type="button" data-agent-id="' + agent.id + '">',
            '<span class="namaa-agent-icon"><i class="' + agent.icon + '"></i></span>',
            '<span class="namaa-agent-copy">',
              '<span class="namaa-agent-name">' + escapeHtml(agent.name) + '</span>',
              '<span class="namaa-agent-label">' + escapeHtml(agent.label) + '</span>',
            '</span>',
          '</button>',
        '</li>'
      ].join('');
    }).join('');
  }

  function renderMobileSelect() {
    if (!selectors.mobileAgentSelect) return;
    selectors.mobileAgentSelect.innerHTML = agents.map(function (agent) {
      return '<option value="' + agent.id + '">' + escapeHtml(agent.name) + '</option>';
    }).join('');
  }

  function renderPromptButtons(target, prompts, className) {
    if (!target) return;
    target.innerHTML = prompts.map(function (item) {
      return '<button class="' + className + '" type="button" data-prompt="' + escapeHtml(item[1]) + '">' + escapeHtml(item[0]) + '</button>';
    }).join('');
  }

  function renderCards(agent) {
    if (!selectors.cards) return;
    selectors.cards.innerHTML = agent.cards.map(function (card) {
      return [
        '<div class="col-xl-4 col-md-6">',
          '<div class="card avtivity-card namaa-metric-card">',
            '<div class="card-body">',
              '<div class="media align-items-center">',
                '<span class="activity-icon namaa-metric-icon me-md-4 me-3"><i class="' + agent.icon + ' namaa-card-icon"></i></span>',
                '<div class="media-body">',
                  '<p class="fs-14 mb-2">' + escapeHtml(card[0]) + '</p>',
                  '<span class="title text-black font-w600">' + escapeHtml(card[1]) + '</span>',
                  '<small class="d-block mt-1">' + escapeHtml(card[2]) + '</small>',
                '</div>',
              '</div>',
              '<div class="progress" style="height:5px;"><div class="progress-bar namaa-progress" style="width:' + card[3] + '%;height:5px;" role="progressbar" aria-valuenow="' + card[3] + '" aria-valuemin="0" aria-valuemax="100"></div></div>',
            '</div>',
            '<div class="effect"></div>',
          '</div>',
        '</div>'
      ].join('');
    }).join('');
  }

  function renderSidePanel(agent) {
    if (selectors.sideTitle) selectors.sideTitle.textContent = agent.sideTitle;
    if (!selectors.sideItems) return;
    selectors.sideItems.innerHTML = agent.sideItems.map(function (item, index) {
      return [
        '<button class="namaa-side-item" type="button" data-prompt="' + escapeHtml(item[0] + ': ' + item[1]) + '">',
          '<span>' + String(index + 1).padStart(2, '0') + '</span>',
          '<strong>' + escapeHtml(item[0]) + '</strong>',
          '<small>' + escapeHtml(item[1]) + '</small>',
        '</button>'
      ].join('');
    }).join('');
  }

  function renderVisual(agent) {
    if (selectors.visualTitle) selectors.visualTitle.textContent = agent.visualTitle;
    if (selectors.visualLabel) selectors.visualLabel.textContent = agent.visualLabel;
    if (selectors.visualSteps) {
      selectors.visualSteps.innerHTML = agent.visualSteps.map(function (step) {
        return '<li><span></span>' + escapeHtml(step) + '</li>';
      }).join('');
    }
    if (selectors.visualBars) {
      selectors.visualBars.innerHTML = agent.cards.map(function (card, index) {
        return '<span style="height:' + Math.max(32, card[3]) + '%;animation-delay:' + (index * 120) + 'ms"></span>';
      }).join('');
    }
  }

  function emptyMessages(agent) {
    if (!selectors.messages) return;
    selectors.messages.innerHTML = '';
    addMessage('ai', agent.welcome, false, agent);
    addMessage('ai', 'Local Preview mode is active. The UI is ready for a real API later, but these replies are generated in the browser for now.', false, agent, 'LP');
  }

  function renderAgent(agent) {
    state.agent = agent;
    setAccent(agent);
    document.body.setAttribute('data-namaa-agent', agent.id);

    if (selectors.badge) selectors.badge.textContent = agent.name + ' • ' + agent.label;
    if (selectors.title) selectors.title.textContent = agent.heroTitle;
    if (selectors.subtitle) selectors.subtitle.textContent = agent.subtitle;
    if (selectors.heroIcon) selectors.heroIcon.className = agent.icon;
    if (selectors.chatTitle) selectors.chatTitle.textContent = agent.name + ' Chat';
    if (selectors.chatSubtitle) selectors.chatSubtitle.textContent = agent.label + ' for Moroccan business decisions.';
    if (selectors.statusBadge) selectors.statusBadge.textContent = 'Local Preview';
    if (selectors.input) selectors.input.setAttribute('placeholder', agent.placeholder);

    renderPromptButtons(selectors.quickActions, agent.quickPrompts, 'btn btn-primary rounded namaa-chip');
    renderPromptButtons(selectors.promptWrap, agent.quickPrompts, 'namaa-prompt');
    renderCards(agent);
    renderSidePanel(agent);
    renderVisual(agent);

    document.querySelectorAll('.namaa-agent-link').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-agent-id') === agent.id);
    });
    if (selectors.mobileAgentSelect) selectors.mobileAgentSelect.value = agent.id;

    if (!state.history[agent.id]) {
      emptyMessages(agent);
      state.history[agent.id] = selectors.messages ? selectors.messages.innerHTML : '';
    } else if (selectors.messages) {
      selectors.messages.innerHTML = state.history[agent.id];
      selectors.messages.scrollTop = selectors.messages.scrollHeight;
    }

    const main = document.querySelector('.namaa-agent-dashboard');
    if (main) {
      main.classList.remove('namaa-agent-transition');
      void main.offsetWidth;
      main.classList.add('namaa-agent-transition');
    }
  }

  function addMessage(role, text, loading, agent, avatarOverride) {
    if (!selectors.messages) return null;
    const item = document.createElement('div');
    item.className = 'namaa-message ' + (role === 'user' ? 'namaa-message-user' : 'namaa-message-ai') + (loading ? ' namaa-loading' : '');
    const avatar = avatarOverride || (role === 'user' ? 'You' : (agent || state.agent).name.split(' ').map(function (part) { return part.charAt(0); }).join('').slice(0, 2));
    item.innerHTML = '<div class="namaa-avatar">' + escapeHtml(avatar) + '</div><div class="namaa-bubble">' + escapeHtml(text) + '</div>';
    selectors.messages.appendChild(item);
    selectors.messages.scrollTop = selectors.messages.scrollHeight;
    return item;
  }

  function buildDemoReply(agent, prompt) {
    const lower = prompt.toLowerCase();
    const languageHint = lower.indexOf('francais') > -1 || lower.indexOf('français') > -1 ? 'French' : lower.indexOf('english') > -1 ? 'English' : 'Darija Latin / French mix';
    const firstPrompt = agent.quickPrompts[0] ? agent.quickPrompts[0][0] : 'Start';
    const secondPrompt = agent.quickPrompts[1] ? agent.quickPrompts[1][0] : 'Analyze';

    return [
      agent.name + ' - Local Preview',
      '',
      'Fhemt request dyalek. Since this is not connected to a live AI API yet, here is a practical demo response in ' + languageHint + ':',
      '',
      '1. Clarify: chkon target exactly, city/region, budget, deadline, and current assets?',
      '2. Diagnose: focus on ' + agent.label.toLowerCase() + ' with Morocco-specific constraints like trust, price sensitivity, WhatsApp behavior, and local competition.',
      '3. Next action: use "' + firstPrompt + '" or "' + secondPrompt + '" to generate a more structured brief.',
      '',
      'To connect live AI later, send the selected agent id "' + agent.id + '" plus the user message to your API endpoint.'
    ].join('\n');
  }

  async function callNamaa(prompt) {
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve(buildDemoReply(state.agent, prompt));
      }, 420);
    });
  }

  async function sendPrompt(prompt) {
    const clean = String(prompt || '').trim();
    if (!clean) return;
    addMessage('user', clean);
    if (selectors.input) selectors.input.value = '';
    const loading = addMessage('ai', state.agent.name + ' is thinking', true);
    const reply = await callNamaa(clean);
    if (loading) {
      loading.classList.remove('namaa-loading');
      const bubble = loading.querySelector('.namaa-bubble');
      if (bubble) bubble.textContent = reply;
    } else {
      addMessage('ai', reply);
    }
    if (selectors.messages) {
      selectors.messages.scrollTop = selectors.messages.scrollHeight;
      state.history[state.agent.id] = selectors.messages.innerHTML;
    }
  }

  function bindEvents() {
    if (selectors.form) {
      selectors.form.addEventListener('submit', function (event) {
        event.preventDefault();
        sendPrompt(selectors.input ? selectors.input.value : '');
      });
    }

    if (selectors.mobileAgentSelect) {
      selectors.mobileAgentSelect.addEventListener('change', function (event) {
        renderAgent(getAgent(event.target.value));
      });
    }

    document.addEventListener('click', function (event) {
      const agentButton = event.target.closest('[data-agent-id]');
      if (agentButton) {
        event.preventDefault();
        renderAgent(getAgent(agentButton.getAttribute('data-agent-id')));
        return;
      }

      const trigger = event.target.closest('[data-prompt]');
      if (!trigger) return;
      event.preventDefault();
      const prompt = trigger.getAttribute('data-prompt');
      if (selectors.input) {
        selectors.input.value = prompt;
        selectors.input.focus();
      }
      sendPrompt(prompt);
    });
  }

  if (!agents.length) return;
  renderAgentList();
  renderMobileSelect();
  bindEvents();
  renderAgent(agents[0]);
})();
