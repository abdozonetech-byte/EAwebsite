(function () {
  'use strict';

  if (typeof window === 'undefined' || window.__NamaaTalkWidgetLoaded) return;
  window.__NamaaTalkWidgetLoaded = true;

  var API_ROUTE = '/api/namaa/agent';
  var MOBILE_QUERY = '(max-width: 640px)';
  var MAX_HISTORY = 8;
  var chips = [
    'Business idea for Morocco',
    'Marketing strategy',
    'AI automation',
    'Improve my website',
    'Startup roadmap',
    'Lead generation system'
  ];

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function create(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'text') node.textContent = attrs[key];
        else if (key === 'html') node.innerHTML = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  function append(parent) {
    for (var index = 1; index < arguments.length; index += 1) {
      if (arguments[index]) parent.appendChild(arguments[index]);
    }
    return parent;
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches;
  }

  function detectLanguageStyle(text) {
    var value = String(text || '').trim();
    var lower = value.toLowerCase();
    if (/[\u0600-\u06FF]/.test(value)) return 'arabic-script';
    if (/\b(bghit|wach|kifach|3afak|salam|smah|daba|mzyan|khdma|projet|fikra|flous|maghrib|maroc|bzaf|chwiya|n9dro|nqder|baghi|bghina)\b/i.test(lower) || /[379]/.test(value)) return 'darija-latin';
    if (/[àâçéèêëîïôùûüÿœ]/i.test(value) || /\b(je|j'ai|j ai|vous|nous|pour|avec|une|des|stratégie|entreprise|idée|bonjour|salut|marché|croissance|publicité)\b/i.test(lower)) return 'french';
    return 'english';
  }

  function languageInstruction(style) {
    if (style === 'arabic-script') return 'Reply in Arabic script, matching the user language and style.';
    if (style === 'darija-latin') return 'Reply in Moroccan Darija written with Latin characters. Do not switch to Arabic script.';
    if (style === 'french') return 'Reply in French.';
    return 'Reply in English.';
  }

  function fallbackMessage(style) {
    if (style === 'arabic-script') return 'سمح ليا، وقع مشكل فالاتصال مع Namaa. عاود جرّب بعد شوية.';
    if (style === 'darija-latin') return 'Smah liya, kayn mochkil f connection m3a Namaa. 3awd jarrb f chi chwia.';
    if (style === 'french') return "Désolé, Namaa a eu un souci de connexion. Réessaie dans un instant.";
    return 'Sorry, Namaa had a connection issue. Please try again in a moment.';
  }

  function timeLabel() {
    try {
      return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date());
    } catch (error) {
      return '';
    }
  }

  function createWidget() {
    if (document.querySelector('[data-namaa-talk-root]')) return;

    var state = {
      open: false,
      loading: false,
      messages: [],
      userNearBottom: true
    };

    var root = create('div', 'namaa-talk', { 'data-namaa-talk-root': 'true' });

    var launcher = create('button', 'namaa-talk__launcher', {
      type: 'button',
      'aria-label': 'Open Namaa Talk',
      'aria-expanded': 'false',
      'aria-controls': 'namaaTalkPanel'
    });
    append(
      launcher,
      create('span', 'namaa-talk__launcher-logo', { text: 'N', 'aria-hidden': 'true' }),
      append(
        create('span', 'namaa-talk__launcher-copy'),
        create('strong', '', { text: 'Namaa Talk' }),
        create('span', '', { text: 'Namaa ready' })
      ),
      create('span', 'namaa-talk__ready-dot', { 'aria-hidden': 'true' })
    );

    var panel = create('section', 'namaa-talk__panel', {
      id: 'namaaTalkPanel',
      role: 'dialog',
      'aria-modal': 'false',
      'aria-hidden': 'true',
      'aria-labelledby': 'namaaTalkTitle'
    });

    var header = create('header', 'namaa-talk__header');
    var closeButton = create('button', 'namaa-talk__close', {
      type: 'button',
      'aria-label': 'Close Namaa Talk',
      text: '×'
    });
    append(
      header,
      append(
        create('div', 'namaa-talk__brand'),
        create('div', 'namaa-talk__brand-logo', { text: 'N', 'aria-hidden': 'true' }),
        append(
          create('div', 'namaa-talk__brand-text'),
          create('h2', 'namaa-talk__title', { id: 'namaaTalkTitle', text: 'Namaa Talk' }),
          create('p', 'namaa-talk__status', { text: 'Namaa ready' })
        )
      ),
      closeButton
    );

    var messagesShell = create('main', 'namaa-talk__messages-shell', {
      tabindex: '0',
      'aria-label': 'Namaa Talk messages'
    });
    var welcome = create('section', 'namaa-talk__welcome', { 'aria-label': 'Namaa Talk welcome' });
    var chipsWrap = create('div', 'namaa-talk__chips');
    chips.forEach(function (label) {
      var chip = create('button', 'namaa-talk__chip', { type: 'button', text: label });
      chip.addEventListener('click', function () {
        submitMessage(label);
      });
      chipsWrap.appendChild(chip);
    });
    append(
      welcome,
      create('div', 'namaa-talk__eyebrow', { text: 'Built for smart business conversations' }),
      create('div', 'namaa-talk__welcome-logo', { text: 'N', 'aria-hidden': 'true' }),
      create('h3', '', { text: "Hi, I'm Namaa Talk 👋" }),
      create('p', '', { text: 'Your AI assistant for business, AI, IT, startups, marketing and ideas.' }),
      create('div', 'namaa-talk__scope', { text: 'Free talk is focused on business, AI, IT, startups, marketing and digital growth.' }),
      chipsWrap,
      create('p', 'namaa-talk__disclaimer', { text: 'Namaa Talk can make mistakes. Verify important business decisions.' })
    );
    var messages = create('div', 'namaa-talk__messages', {
      role: 'log',
      'aria-live': 'polite',
      'aria-relevant': 'additions'
    });
    append(messagesShell, welcome, messages);

    var scrollButton = create('button', 'namaa-talk__scroll-bottom', {
      type: 'button',
      'aria-label': 'Scroll to latest message',
      text: '↓'
    });

    var composer = create('form', 'namaa-talk__composer');
    var input = create('textarea', 'namaa-talk__input', {
      rows: '1',
      maxlength: '1200',
      placeholder: 'Ask Namaa Talk about business, AI, marketing or any idea...',
      'aria-label': 'Message to Namaa Talk',
      autocomplete: 'off',
      spellcheck: 'true'
    });
    var send = create('button', 'namaa-talk__send', {
      type: 'submit',
      'aria-label': 'Send message',
      text: '→'
    });
    append(composer, input, send);
    append(panel, header, messagesShell, scrollButton, composer);
    append(root, launcher, panel);
    document.body.appendChild(root);

    function setBodyLock(locked) {
      document.documentElement.classList.toggle('namaa-talk-lock', locked);
      document.body.classList.toggle('namaa-talk-lock', locked);
    }

    function openPanel() {
      state.open = true;
      root.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      launcher.setAttribute('aria-expanded', 'true');
      setBodyLock(isMobile());
      updateScrollButton();
      window.setTimeout(function () {
        if (!isMobile()) input.focus();
      }, 80);
    }

    function closePanel() {
      state.open = false;
      root.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      launcher.setAttribute('aria-expanded', 'false');
      setBodyLock(false);
      launcher.focus({ preventScroll: true });
    }

    function updateSendState() {
      send.disabled = state.loading || !input.value.trim();
    }

    function resizeInput() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, isMobile() ? 120 : 132) + 'px';
    }

    function scrollToBottom(behavior) {
      messagesShell.scrollTo({
        top: messagesShell.scrollHeight,
        behavior: behavior || 'smooth'
      });
      state.userNearBottom = true;
    }

    function isNearBottom() {
      return messagesShell.scrollHeight - messagesShell.scrollTop - messagesShell.clientHeight < 96;
    }

    function maybeScrollToBottom(behavior) {
      if (state.userNearBottom) scrollToBottom(behavior);
      else updateScrollButton();
    }

    function updateScrollButton() {
      var show = state.open && isMobile() && messagesShell.scrollHeight > messagesShell.clientHeight + 40 && !isNearBottom();
      scrollButton.classList.toggle('is-visible', show);
    }

    function renderMessage(role, content, options) {
      var message = create('article', 'namaa-talk__message namaa-talk__message--' + role);
      var bubble = create('div', 'namaa-talk__bubble');
      bubble.dir = 'auto';
      if (options && options.typing) {
        append(
          bubble,
          create('span', 'namaa-talk__typing', {
            html: '<span></span><span></span><span></span>'
          })
        );
      } else {
        bubble.textContent = content;
      }
      append(message, bubble);
      if (!(options && options.typing)) {
        append(message, create('time', 'namaa-talk__time', { text: timeLabel() }));
      }
      messages.appendChild(message);
      root.classList.add('has-messages');
      updateScrollButton();
      if (options && options.typing) return message;
      return message;
    }

    function remember(role, content) {
      state.messages.push({ role: role, content: String(content || '').slice(0, 1800) });
      if (state.messages.length > MAX_HISTORY) state.messages = state.messages.slice(-MAX_HISTORY);
    }

    function extractAnswer(data) {
      return data && (data.answer || data.reply || data.text || data.message || '');
    }

    async function submitMessage(forcedText) {
      var text = String(forcedText || input.value || '').trim();
      if (!text || state.loading) return;

      if (!state.open) openPanel();

      var style = detectLanguageStyle(text);
      var requestHistory = state.messages.slice(-MAX_HISTORY);

      input.value = '';
      resizeInput();
      state.loading = true;
      updateSendState();
      renderMessage('user', text);
      remember('user', text);
      scrollToBottom('smooth');

      var typing = renderMessage('assistant', '', { typing: true });
      maybeScrollToBottom('smooth');

      try {
        var response = await fetch(API_ROUTE, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            message: text,
            prompt: text,
            source: 'namaa-talk-widget',
            languageStyle: style,
            languageInstruction: languageInstruction(style),
            history: requestHistory
          })
        });
        var data = await response.json().catch(function () { return {}; });
        var answer = extractAnswer(data);
        if (!response.ok || !answer) throw new Error('empty_namaa_response');
        typing.remove();
        renderMessage('assistant', answer);
        remember('assistant', answer);
        maybeScrollToBottom('smooth');
      } catch (error) {
        typing.remove();
        var fallback = fallbackMessage(style);
        renderMessage('assistant', fallback);
        remember('assistant', fallback);
        maybeScrollToBottom('smooth');
      } finally {
        state.loading = false;
        updateSendState();
        updateScrollButton();
      }
    }

    launcher.addEventListener('click', function () {
      if (state.open) closePanel();
      else openPanel();
    });

    closeButton.addEventListener('click', closePanel);

    scrollButton.addEventListener('click', function () {
      scrollToBottom('smooth');
      updateScrollButton();
    });

    composer.addEventListener('submit', function (event) {
      event.preventDefault();
      submitMessage();
    });

    input.addEventListener('input', function () {
      resizeInput();
      updateSendState();
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey && !isMobile()) {
        event.preventDefault();
        submitMessage();
      }
    });

    messagesShell.addEventListener('scroll', function () {
      state.userNearBottom = isNearBottom();
      updateScrollButton();
    }, { passive: true });
    window.addEventListener('resize', function () {
      setBodyLock(state.open && isMobile());
      updateScrollButton();
      resizeInput();
    }, { passive: true });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && state.open) closePanel();
    });

    updateSendState();
  }

  ready(createWidget);
}());
