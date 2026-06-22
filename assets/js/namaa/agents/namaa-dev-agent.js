(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  var services=window.NamaaServices;
  window.NamaaAgents=window.NamaaAgents || {};
  function previewHtml(question){
    var files=services.dev.buildFiles(question);
    var b=files.blueprint;
    return '<div class="namaa-dev-result">'+
      '<div class="namaa-dev-status"><span>💻 Landing page generated</span><small>Template preview</small></div>'+ 
      '<div class="namaa-dev-brief">'+
        '<div><span>Sector</span><strong>'+utils.escapeHtml(b.sector)+'</strong></div>'+ 
        '<div><span>City</span><strong>'+utils.escapeHtml(b.city)+'</strong></div>'+ 
        '<div><span>Tone</span><strong>'+utils.escapeHtml(b.tone)+'</strong></div>'+ 
      '</div>'+ 
      '<div class="namaa-dev-tabs" role="tablist" aria-label="NamaaDev preview and code tabs">'+
        '<button class="is-active" type="button" data-dev-tab="preview">Preview</button>'+ 
        '<button type="button" data-dev-tab="html">HTML</button>'+ 
        '<button type="button" data-dev-tab="css">CSS</button>'+ 
        '<button type="button" data-dev-tab="js">JS</button>'+ 
      '</div>'+ 
      '<div class="namaa-dev-panels">'+
        '<section class="namaa-dev-panel is-active" data-dev-panel="preview"><iframe class="namaa-dev-frame" title="NamaaDev generated landing page preview" sandbox="" srcdoc="'+utils.escapeHtml(files.previewDoc)+'"></iframe></section>'+ 
        '<section class="namaa-dev-panel" data-dev-panel="html"><pre><code>'+utils.escapeHtml(files.html)+'</code></pre></section>'+ 
        '<section class="namaa-dev-panel" data-dev-panel="css"><pre><code>'+utils.escapeHtml(files.css)+'</code></pre></section>'+ 
        '<section class="namaa-dev-panel" data-dev-panel="js"><pre><code>'+utils.escapeHtml(files.js)+'</code></pre></section>'+ 
      '</div>'+ 
      '<div class="namaa-dev-actions"><button class="namaa-mini-button" type="button" data-dev-copy="true">Copy ready later</button><button class="namaa-mini-button secondary" type="button" disabled>Download files soon</button></div>'+ 
      '<p class="namaa-preview-note">Template NamaaDev organisé dans le panneau droit avec preview, HTML, CSS et JS.</p>'+ 
    '</div>';
  }
  function answerHtml(question){
    var files=services.dev.buildFiles(question);
    return '<div class="namaa-answer-head"><span>Dev mode</span><strong>NamaaDev — Landing page draft</strong></div>'+ 
      '<h2>Landing page générée dans le panneau droit.</h2>'+ 
      '<p><strong>Demande :</strong> '+utils.escapeHtml(question)+'</p>'+ 
      '<p><strong>Résultat :</strong> '+utils.escapeHtml(files.blueprint.pageName)+' avec preview, HTML, CSS et JS prêts en mode template.</p>'+ 
      '<ul class="namaa-compact-list">'+
        '<li><span class="namaa-compact-index">1</span><span>Le panneau droit montre la preview du site.</span></li>'+ 
        '<li><span class="namaa-compact-index">2</span><span>Les onglets HTML/CSS/JS organisent la structure du site.</span></li>'+ 
        '<li><span class="namaa-compact-index">3</span><span>Ajoutez la ville, la cible et l’offre pour rendre le résultat plus personnalisé.</span></li>'+ 
      '</ul>';
  }
  window.NamaaAgents.dev={
    id:'dev',
    reply:function(context){
      return {answerHtml:answerHtml(context.question),preview:{type:'NamaaDev',title:'Landing page HTML/CSS/JS',bodyHtml:previewHtml(context.question)}};
    }
  };
})(window);
