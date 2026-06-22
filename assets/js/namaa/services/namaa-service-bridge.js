(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  var brain=window.NamaaBrain;
  function apiStatus(){
    var config=window.NamaaConfig || {};
    return {
      enabled:!!(config.api && config.api.enabled),
      provider:(config.api && config.api.provider) || 'openai',
      model:(config.api && config.api.preferredLowCostModel) || 'gpt-5.4-nano',
      endpoints:(config.api || {})
    };
  }
  function pdfPlaceholder(lastQuestion){
    var context=lastQuestion?'<p><strong>Base :</strong> '+utils.escapeHtml(lastQuestion)+'</p>':'';
    return '<h2>PDF Strategy flow is ready.</h2>'+context+
      '<p>For now this is a safe placeholder before API. Later Namaa Talk will transform the conversation into a professional PDF.</p>'+ 
      '<ol class="namaa-pdf-steps">'+
        '<li>Project summary</li>'+ 
        '<li>Moroccan market diagnosis</li>'+ 
        '<li>Offer + target audience</li>'+ 
        '<li>30-day action plan</li>'+ 
        '<li>WhatsApp script and CTA</li>'+ 
      '</ol>'+ 
      '<p class="namaa-note-line">No API connected yet. This button only confirms the PDF position inside Namaa Talk.</p>';
  }
  function uploadPlaceholder(files){
    var count=files && files.length ? files.length : 0;
    return '<h2>Files received locally.</h2><p>'+count+' file(s) selected. Upload analysis will be connected in a later update. For now, the interface is ready before API.</p>';
  }
  function buildDevFiles(question){
    var b=brain.inferDevBlueprint(question);
    var html='<!doctype html>\n'+
      '<html lang="fr">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n'+
      '  <title>'+utils.escapeHtml(b.pageName)+'</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n'+
      '  <header class="hero">\n    <nav><strong>'+utils.escapeHtml(b.pageName)+'</strong><a href="#contact">Contact</a></nav>\n'+
      '    <div class="hero-grid">\n      <section>\n        <p class="eyebrow">'+utils.escapeHtml(b.eyebrow)+'</p>\n        <h1>'+utils.escapeHtml(b.headline)+'</h1>\n        <p class="lead">'+utils.escapeHtml(b.subline)+'</p>\n        <div class="actions"><a class="btn" href="#contact">'+utils.escapeHtml(b.cta)+'</a><a class="btn ghost" href="#method">'+utils.escapeHtml(b.secondCta)+'</a></div>\n      </section>\n'+
      '      <aside class="visual"><span>'+utils.escapeHtml(b.proof[0])+'</span><span>'+utils.escapeHtml(b.proof[1])+'</span><span>'+utils.escapeHtml(b.proof[2])+'</span></aside>\n    </div>\n  </header>\n'+
      '  <main>\n    <section class="cards">\n'+
      b.cards.map(function(card){return '      <article><h2>'+utils.escapeHtml(card[0])+'</h2><p>'+utils.escapeHtml(card[1])+'</p></article>';}).join('\n')+
      '\n    </section>\n    <section class="method" id="method">\n      <h2>Plan simple</h2>\n      <ol>\n'+
      b.steps.map(function(step){return '        <li>'+utils.escapeHtml(step)+'</li>';}).join('\n')+
      '\n      </ol>\n    </section>\n  </main>\n'+
      '  <footer id="contact"><strong>Prêt à avancer ?</strong><a class="btn" href="https://wa.me/212600000000">WhatsApp</a></footer>\n'+
      '  <script src="script.js"></script>\n</body>\n</html>';
    var css=':root{--blue:#2563eb;--dark:#07152f;--soft:#eef6ff;--text:#52657f}\n*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f8fbff;color:var(--dark)}a{text-decoration:none}\n.hero{min-height:70vh;padding:24px;background:radial-gradient(circle at 85% 15%,#bfdbfe,transparent 34%),linear-gradient(135deg,#ffffff,#eef6ff)}\nnav{display:flex;justify-content:space-between;align-items:center;margin-bottom:56px}nav a{color:var(--blue);font-weight:800}.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:28px;align-items:center}.eyebrow{display:inline-flex;padding:8px 12px;border-radius:999px;background:#dbeafe;color:var(--blue);font-size:12px;font-weight:900;text-transform:uppercase}h1{font-size:clamp(38px,7vw,72px);line-height:.92;letter-spacing:-.06em;margin:16px 0}.lead{font-size:18px;line-height:1.6;color:var(--text);max-width:640px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:999px;background:var(--blue);color:#fff;font-weight:900}.btn.ghost{background:#fff;color:var(--blue);border:1px solid #bfdbfe}.visual{min-height:330px;border-radius:32px;background:linear-gradient(145deg,#0f172a,#2563eb);display:grid;align-content:end;gap:12px;padding:26px;box-shadow:0 28px 80px rgba(37,99,235,.24)}.visual span{display:inline-flex;width:max-content;padding:10px 13px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font-weight:900}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:26px}.cards article,.method,footer{background:#fff;border:1px solid #dceaff;border-radius:24px;padding:22px;box-shadow:0 18px 44px rgba(37,99,235,.08)}.cards h2,.method h2{margin:0 0 8px;font-size:22px}.cards p{margin:0;color:var(--text);line-height:1.5}.method{margin:0 26px 26px}.method ol{display:grid;gap:10px;padding-left:22px;color:var(--text);font-weight:800}footer{margin:0 26px 26px;display:flex;align-items:center;justify-content:space-between;gap:12px}@media(max-width:800px){.hero-grid,.cards{grid-template-columns:1fr}.hero{padding:18px}.visual{min-height:220px}.method,footer{margin:0 18px 18px}footer{align-items:flex-start;flex-direction:column}}';
    var js='document.querySelectorAll(\'a[href^="#"]\').forEach(function(link){\n  link.addEventListener(\'click\',function(event){\n    var target=document.querySelector(this.getAttribute(\'href\'));\n    if(target){event.preventDefault();target.scrollIntoView({behavior:\'smooth\'});}\n  });\n});';
    var bodyOnly=html.replace(/^[\s\S]*<body>\n?/,'').replace(/\n?<script[\s\S]*$/,'');
    var previewDoc='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body>'+bodyOnly+'</body></html>';
    return {blueprint:b,html:html,css:css,js:js,previewDoc:previewDoc};
  }
  window.NamaaServices={
    api:{status:apiStatus},
    pdf:{placeholder:pdfPlaceholder},
    upload:{placeholder:uploadPlaceholder},
    dev:{buildFiles:buildDevFiles}
  };
})(window);
