(function () {
  var form = document.getElementById('namaaForm');
  var prompt = document.getElementById('namaaPrompt');
  var language = document.getElementById('namaaLanguage');
  var chat = document.getElementById('namaaChat');
  if (!form || !prompt || !chat) return;

  function cleanText(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function detectSector(text) {
    var t = text.toLowerCase();
    if (t.indexOf('clinique') !== -1 || t.indexOf('esthétique') !== -1 || t.indexOf('laser') !== -1) return 'clinique esthétique';
    if (t.indexOf('restaurant') !== -1 || t.indexOf('café') !== -1 || t.indexOf('cafe') !== -1) return 'restaurant ou café';
    if (t.indexOf('e-commerce') !== -1 || t.indexOf('ecommerce') !== -1 || t.indexOf('shop') !== -1) return 'e-commerce';
    if (t.indexOf('immobilier') !== -1 || t.indexOf('real estate') !== -1) return 'immobilier';
    if (t.indexOf('école') !== -1 || t.indexOf('formation') !== -1 || t.indexOf('school') !== -1) return 'école ou centre de formation';
    return 'business marocain';
  }

  function addUserMessage(text) {
    var article = document.createElement('article');
    article.className = 'namaa-message namaa-message-user';
    article.innerHTML = '<div class="namaa-avatar" aria-hidden="true">V</div><div class="namaa-bubble"><p>' + escapeHtml(text) + '</p></div>';
    chat.appendChild(article);
  }

  function addAiMessage(text, lang) {
    var sector = detectSector(text);
    var article = document.createElement('article');
    article.className = 'namaa-message namaa-message-ai';
    article.innerHTML = [
      '<div class="namaa-avatar" aria-hidden="true">N</div>',
      '<div class="namaa-bubble">',
      '<p class="namaa-bubble-title">Aperçu Namaa AI pour votre ' + escapeHtml(sector) + '</p>',
      '<p>Voici un exemple de structure. Dans les prochaines versions, cette réponse sera reliée à la base de connaissance business Maroc.</p>',
      '<div class="namaa-result-grid">',
      '<div class="namaa-result-mini"><strong>Diagnostic rapide</strong><span>Clarifier l’offre, la cible, la ville, le budget et le blocage principal avant toute publicité.</span></div>',
      '<div class="namaa-result-mini"><strong>Plan 30 jours</strong><span>Jour 1-7: offre + page. Jour 8-15: contenu + WhatsApp. Jour 16-30: test Ads + suivi leads.</span></div>',
      '<div class="namaa-result-mini"><strong>Canaux prioritaires</strong><span>Meta Ads pour la demande rapide, WhatsApp pour conversion, Google/SEO local pour intention forte.</span></div>',
      '<div class="namaa-result-mini"><strong>Prochaine action</strong><span>Préparer un diagnostic humain pour transformer ce plan en système réel de leads.</span></div>',
      '</div>',
      '<a class="namaa-result-cta" href="/reserver-diagnostic/?source=namaa-ai-result">Réserver un diagnostic gratuit</a>',
      '</div>'
    ].join('');
    chat.appendChild(article);
    chat.scrollTop = chat.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, function (s) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s];
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var value = cleanText(prompt.value);
    if (!value) {
      prompt.focus();
      return;
    }
    addUserMessage(value);
    prompt.value = '';
    window.setTimeout(function () { addAiMessage(value, language ? language.value : 'fr'); }, 320);
  });

  document.querySelectorAll('[data-prompt]').forEach(function (button) {
    button.addEventListener('click', function () {
      prompt.value = button.getAttribute('data-prompt') || '';
      prompt.focus();
    });
  });

  prompt.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
}());
