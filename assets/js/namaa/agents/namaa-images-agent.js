(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  var brain=window.NamaaBrain;
  window.NamaaAgents=window.NamaaAgents || {};

  function chips(items,klass){
    return (items || []).map(function(item,i){
      return '<span><b>'+utils.pad2(i+1)+'</b>'+utils.escapeHtml(item)+'</span>';
    }).join('');
  }

  function previewHtml(question,brief){
    var d=brain.inferMockupDirection(question,brief);
    var pack=d.pack || brain.getMockupPack(question,brief);
    return '<div class="namaa-image-result namaa-image-result-pack">'+
      '<div class="namaa-image-status"><span>🎨 Creative pack ready</span><small>'+utils.escapeHtml(pack.label)+'</small></div>'+ 
      '<div class="namaa-brand-board">'+
        '<div class="namaa-logo-concept"><span>N</span><strong>Logo concept</strong><small>'+utils.escapeHtml(pack.logoIdea)+'</small></div>'+ 
        '<div class="namaa-board-main">'+
          '<div class="namaa-mock-browser"><i></i><i></i><i></i><strong>'+utils.escapeHtml(pack.primaryAsset)+'</strong></div>'+ 
          '<div class="namaa-mock-hero">'+
            '<div class="namaa-mock-copy"><p>'+utils.escapeHtml(pack.label)+'</p><h3>'+utils.escapeHtml(d.title)+'</h3><span>'+utils.escapeHtml(d.subtitle)+'</span><button type="button">'+utils.escapeHtml(d.cta)+'</button></div>'+ 
            '<div class="namaa-mock-visual" aria-hidden="true"><em></em><strong>'+utils.escapeHtml(pack.visuals[0] || d.visual)+'</strong><small>'+utils.escapeHtml(pack.style)+'</small></div>'+ 
          '</div>'+ 
        '</div>'+ 
      '</div>'+ 
      '<div class="namaa-mock-assets"><h3>Mockup package</h3><div class="namaa-layout-chips namaa-asset-chips" aria-label="Mockup package assets">'+chips(pack.assets)+'</div></div>'+ 
      '<div class="namaa-image-spec">'+
        '<h3>Design direction</h3>'+ 
        '<dl>'+ 
          '<div><dt>Audience</dt><dd>'+utils.escapeHtml(d.audience)+'</dd></div>'+ 
          '<div><dt>CTA</dt><dd>'+utils.escapeHtml(d.cta)+'</dd></div>'+ 
          '<div><dt>Style</dt><dd>'+utils.escapeHtml(pack.style)+'</dd></div>'+ 
          '<div><dt>Logo</dt><dd>'+utils.escapeHtml(pack.logoIdea)+'</dd></div>'+ 
        '</dl>'+ 
      '</div>'+ 
      '<div class="namaa-copy-angles"><h3>Copy angles</h3><div>'+chips(pack.copyAngles)+'</div></div>'+ 
      '<p class="namaa-preview-note">Namaa Images prépare un seul board premium avec logo + mockups adaptés à la catégorie, au lieu d’un visuel générique.</p>'+ 
    '</div>';
  }
  function answerHtml(question,brief){
    var pack=brain.getMockupPack(question,brief);
    return '<div class="namaa-answer-head"><span>Namaa Images</span><strong>Creative pack</strong></div>'+ 
      '<h2>Je prépare un pack visuel adapté à la catégorie.</h2>'+ 
      '<p><strong>Type détecté :</strong> '+utils.escapeHtml(pack.label)+'. Namaa va créer un board avec '+utils.escapeHtml(pack.primaryAsset)+'.</p>'+ 
      '<ul class="namaa-compact-list">'+
        '<li><span class="namaa-compact-index">1</span><span><strong>Logo :</strong> '+utils.escapeHtml(pack.logoIdea)+'</span></li>'+ 
        '<li><span class="namaa-compact-index">2</span><span><strong>Mockups :</strong> '+utils.escapeHtml(pack.assets.slice(0,4).join(', '))+'</span></li>'+ 
        '<li><span class="namaa-compact-index">3</span><span><strong>Style :</strong> '+utils.escapeHtml(pack.style)+'</span></li>'+ 
      '</ul>';
  }
  window.NamaaAgents.images={
    id:'images',
    reply:function(context){
      var brief=context && context.state ? context.state.projectBrief : null;
      return {answerHtml:answerHtml(context.question,brief),preview:{type:'Namaa Images',title:'Logo + mockup pack',bodyHtml:previewHtml(context.question,brief)}};
    }
  };
})(window);
