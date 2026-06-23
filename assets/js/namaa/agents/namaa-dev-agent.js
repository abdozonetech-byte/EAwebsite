(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  var services=window.NamaaServices;
  window.NamaaAgents=window.NamaaAgents || {};
  function previewHtml(question,brief){
    var files=services.dev.buildFiles(question,brief || null);
    if(services.api && services.api.renderDevFiles){
      return services.api.renderDevFiles({files:files,meta:{pageName:files.blueprint.pageName,sector:files.blueprint.sector,city:files.blueprint.city,templateLabel:files.blueprint.templateLabel || files.blueprint.templateKey}},question,brief || null);
    }
    var b=files.blueprint;
    return '<div class="namaa-dev-result"><div class="namaa-dev-status"><span>💻 Landing page generated</span><small>Template preview</small></div><p>'+utils.escapeHtml(b.pageName)+'</p></div>';
  }
  function answerHtml(question,brief){
    var files=services.dev.buildFiles(question,brief || null);
    return '<div class="namaa-answer-head"><span>Dev mode</span><strong>NamaaDev — Landing page draft</strong></div>'+ 
      '<h2>Landing page générée dans le panneau droit.</h2>'+ 
      '<p><strong>Demande :</strong> '+utils.escapeHtml(question)+'</p>'+ 
      '<p><strong>Résultat :</strong> '+utils.escapeHtml(files.blueprint.pageName)+' avec template '+utils.escapeHtml(files.blueprint.templateLabel || files.blueprint.templateKey || 'NamaaDev')+', preview, HTML, CSS et JS.</p>'+ 
      '<ul class="namaa-compact-list">'+
        '<li><span class="namaa-compact-index">1</span><span>Le panneau droit montre la preview du site.</span></li>'+ 
        '<li><span class="namaa-compact-index">2</span><span>Les onglets HTML/CSS/JS organisent la structure du site.</span></li>'+ 
        '<li><span class="namaa-compact-index">3</span><span>Ajoutez la ville, la cible et l’offre pour rendre le résultat plus personnalisé.</span></li>'+ 
      '</ul>';
  }
  window.NamaaAgents.dev={
    id:'dev',
    reply:function(context){
      var brief=context.state && context.state.projectBrief ? context.state.projectBrief : null;
      return {answerHtml:answerHtml(context.question,brief),preview:{type:'NamaaDev',title:'Landing page HTML/CSS/JS',bodyHtml:previewHtml(context.question,brief)}};
    }
  };
})(window);
