
(function () {
  'use strict';

  const form = document.getElementById('namaaChatForm');
  const input = document.getElementById('namaaInput');
  const messages = document.getElementById('namaaMessages');

  const endpoints = ['/api/namaa/chat', '/api/namaa/talk', '/api/namaa'];

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[char];
    });
  }

  function addMessage(role, text, loading) {
    if (!messages) return null;
    const item = document.createElement('div');
    item.className = 'namaa-message ' + (role === 'user' ? 'namaa-message-user' : 'namaa-message-ai') + (loading ? ' namaa-loading' : '');
    const avatar = role === 'user' ? 'You' : 'N';
    item.innerHTML = '<div class="namaa-avatar">' + avatar + '</div><div class="namaa-bubble">' + escapeHtml(text) + '</div>';
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  function normalizeReply(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    return data.reply || data.answer || data.text || data.output || data.content || data.message || (data.data && (data.data.reply || data.data.text || data.data.answer)) || '';
  }

  async function callNamaa(prompt) {
    const payload = {
      message: prompt,
      prompt: prompt,
      mode: 'conversation',
      source: 'namaa-dashboard-ui',
      language: 'auto',
      context: 'Moroccan business assistant focused on business, AI, IT, startups, marketing and Morocco market.'
    };

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        });
        if (!response.ok) continue;
        const type = response.headers.get('content-type') || '';
        const data = type.includes('application/json') ? await response.json() : await response.text();
        const reply = normalizeReply(data);
        if (reply) return reply;
      } catch (error) {
        // Try next endpoint, keep UI alive without exposing errors to visitors.
      }
    }

    return 'Namaa UI is ready, but the chat API endpoint is not connected yet. Connect this page to /api/namaa/chat or /api/namaa/talk, then I will answer live.';
  }

  async function sendPrompt(prompt) {
    const clean = String(prompt || '').trim();
    if (!clean) return;
    addMessage('user', clean);
    if (input) input.value = '';
    const loading = addMessage('ai', 'Namaa is thinking', true);
    const reply = await callNamaa(clean);
    if (loading) {
      loading.classList.remove('namaa-loading');
      const bubble = loading.querySelector('.namaa-bubble');
      if (bubble) bubble.textContent = reply;
    } else {
      addMessage('ai', reply);
    }
    messages.scrollTop = messages.scrollHeight;
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      sendPrompt(input ? input.value : '');
    });
  }

  document.addEventListener('click', function (event) {
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
})();
