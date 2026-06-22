(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  var brain=window.NamaaBrain;
  window.NamaaAgents=window.NamaaAgents || {};
  function previewHtml(question){
    var d=brain.inferMockupDirection(question);
    var chips=d.layout.map(function(item,i){return '<span><b>'+utils.pad2(i+1)+'</b>'+utils.escapeHtml(item)+'</span>';}).join('');
    return '<div class="namaa-image-result">'+
      '<div class="namaa-image-status"><span>🎨 Mockup generated</span><small>No API yet · static preview</small></div>'+ 
      '<div class="namaa-mock-card">'+
        '<div class="namaa-mock-browser"><i></i><i></i><i></i><strong>Namaa Images</strong></div>'+ 
        '<div class="namaa-mock-hero">'+
          '<div class="namaa-mock-copy">'+
            '<p>'+utils.escapeHtml(d.sector)+'</p>'+ 
            '<h3>'+utils.escapeHtml(d.title)+'</h3>'+ 
            '<span>'+utils.escapeHtml(d.subtitle)+'</span>'+ 
            '<button type="button">'+utils.escapeHtml(d.cta)+'</button>'+ 
          '</div>'+ 
          '<div class="namaa-mock-visual" aria-hidden="true"><em></em><strong>'+utils.escapeHtml(d.visual)+'</strong><small>'+utils.escapeHtml(d.accent)+'</small></div>'+ 
        '</div>'+ 
        '<div class="namaa-mock-proof"><span>Trust</span><span>WhatsApp</span><span>Mobile first</span></div>'+ 
      '</div>'+ 
      '<div class="namaa-image-spec">'+
        '<h3>Design direction</h3>'+ 
        '<dl>'+ 
          '<div><dt>Audience</dt><dd>'+utils.escapeHtml(d.audience)+'</dd></div>'+ 
          '<div><dt>CTA</dt><dd>'+utils.escapeHtml(d.cta)+'</dd></div>'+ 
          '<div><dt>Style</dt><dd>'+utils.escapeHtml(d.accent)+'</dd></div>'+ 
        '</dl>'+ 
      '</div>'+ 
      '<div class="namaa-layout-chips" aria-label="Suggested sections">'+chips+'</div>'+ 
      '<p class="namaa-preview-note">This is a safe mock result before OpenAI image generation. Later this panel will show the real generated image or saved mockup.</p>'+ 
    '</div>';
  }
  function answerHtml(question){
    var d=brain.inferMockupDirection(question);
    return '<div class="namaa-answer-head"><span>Mock mode</span><strong>Namaa Images — Design result</strong></div>'+ 
      '<h2>Mockup généré dans le panneau droit.</h2>'+ 
      '<p><strong>Demande :</strong> '+utils.escapeHtml(question)+'</p>'+ 
      '<p><strong>Direction :</strong> '+utils.escapeHtml(d.title)+' — '+utils.escapeHtml(d.subtitle)+'.</p>'+ 
      '<ul class="namaa-compact-list">'+
        '<li><span class="namaa-compact-index">1</span><span>Le résultat visuel s’ouvre à droite pour garder la conversation propre.</span></li>'+ 
        '<li><span class="namaa-compact-index">2</span><span>En v1, c’est un mockup statique. Après API, Namaa Images générera une vraie image.</span></li>'+ 
      '</ul>';
  }
  window.NamaaAgents.images={
    id:'images',
    reply:function(context){
      return {answerHtml:answerHtml(context.question),preview:{type:'Namaa Images',title:'Design mockup result',bodyHtml:previewHtml(context.question)}};
    }
  };
})(window);
