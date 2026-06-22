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
    return '<h2>PDF Strategy is ready.</h2>'+context+
      '<p>Namaa Talk can transform the guided project brief into a clean strategy document.</p>'+ 
      '<ol class="namaa-pdf-steps">'+
        '<li>Project summary</li>'+ 
        '<li>Moroccan market diagnosis</li>'+ 
        '<li>Offer + target audience</li>'+ 
        '<li>30-day action plan</li>'+ 
        '<li>WhatsApp script and CTA</li>'+ 
      '</ol>';
  }
  function stripHtml(html){
    var div=document.createElement('div');
    div.innerHTML=String(html || '');
    return (div.textContent || div.innerText || '').replace(/\s+/g,' ').trim();
  }
  function openStrategyPdf(payload){
    payload=payload || {};
    var brief=payload.brief || {};
    var strategyHtml=payload.strategyHtml || '<p>'+utils.escapeHtml(payload.strategyText || 'Strategy not available yet.')+'</p>';
    var title='Namaa Strategy - '+(brief.projectName || 'Project');
    var briefRows=[
      ['Nom du projet',brief.projectName],['Étape',brief.stage],['Type',brief.category],['Branche',brief.branch],['Marché',brief.market],['Budget',brief.budget],['Objectif',brief.goal],['Canaux',Array.isArray(brief.channels)?brief.channels.join(', '):brief.channels]
    ].filter(function(row){return row[1];}).map(function(row){return '<tr><th>'+utils.escapeHtml(row[0])+'</th><td>'+utils.escapeHtml(row[1])+'</td></tr>';}).join('');
    var doc='<!doctype html><html><head><meta charset="utf-8"><title>'+utils.escapeHtml(title)+'</title><style>'+ 
      '@page{size:A4;margin:18mm}body{font-family:Arial,sans-serif;color:#0f172a;background:#fff;line-height:1.55}header{border-bottom:4px solid #2563eb;padding-bottom:18px;margin-bottom:22px}small{color:#2563eb;font-weight:800;letter-spacing:.08em;text-transform:uppercase}h1{font-size:34px;line-height:1.05;margin:8px 0 4px}h2{font-size:22px;margin:22px 0 10px;color:#0b255d}p{margin:8px 0;color:#334155}table{width:100%;border-collapse:collapse;margin:14px 0 22px}th,td{border:1px solid #dbeafe;text-align:left;padding:10px 12px;vertical-align:top}th{width:31%;background:#eff6ff;color:#1d4ed8}ul{padding-left:20px}li{margin:7px 0}.footer{margin-top:34px;padding-top:14px;border-top:1px solid #dbeafe;color:#64748b;font-size:12px}.cta{background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:14px;margin:18px 0;color:#0b255d;font-weight:700}@media print{button{display:none}}' +
      '</style></head><body><header><small>Namaa AI · Business Maroc</small><h1>Stratégie marketing du projet</h1><p>Document généré par Namaa Talk pour préparer le mockup et la landing page.</p></header>'+ 
      '<section><h2>Brief projet</h2><table>'+briefRows+'</table></section>'+ 
      '<section><h2>Stratégie</h2>'+strategyHtml+'</section>'+ 
      '<div class="cta">Prochaine étape : transformer cette stratégie en mockup visuel puis en landing page simple.</div>'+ 
      '<p class="footer">Namaa AI by Elboubakry Abdessamad · elboubakry.com</p><script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>';
    var win=window.open('','_blank','noopener,noreferrer');
    if(win){win.document.open();win.document.write(doc);win.document.close();}
    return stripHtml(strategyHtml);
  }
  function uploadPlaceholder(files){
    var count=files && files.length ? files.length : 0;
    return '<h2>Files received.</h2><p>'+count+' file(s) selected. Namaa will use uploaded files for context when file analysis is enabled.</p>';
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

  function textToHtml(text){
    var cleaned=String(text || '').replace(/\*\*/g,'').replace(/^\s*[\"'`]+|[\"'`]+\s*$/gm,'');
    var safe=utils.escapeHtml(cleaned);
    var lines=safe.split(/\n+/).map(function(line){return line.trim();}).filter(Boolean);
    if(!lines.length)return '<p>Namaa is ready.</p>';
    var html='';
    var inList=false;
    lines.forEach(function(line){
      var isBullet=/^([-*•]|\d+[.)])\s+/.test(line);
      if(isBullet){
        if(!inList){html+='<ul class="namaa-compact-list">';inList=true;}
        html+='<li><span>'+line.replace(/^([-*•]|\d+[.)])\s+/,'')+'</span></li>';
      }else{
        if(inList){html+='</ul>';inList=false;}
        if(/^#{1,3}\s+/.test(line)){
          html+='<h2>'+line.replace(/^#{1,3}\s+/,'')+'</h2>';
        }else{
          html+='<p>'+line+'</p>';
        }
      }
    });
    if(inList)html+='</ul>';
    return html;
  }
  function postJson(endpoint,payload){
    return fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload||{})}).then(function(response){
      return response.json().catch(function(){return {};}).then(function(data){
        if(!response.ok){
          var err=new Error(data.error || data.message || 'Namaa request failed');
          err.status=response.status;
          err.data=data;
          throw err;
        }
        return data;
      });
    });
  }
  function makePreviewDocFromFiles(files){
    files=files || {};
    var html=String(files.html || '<main><h1>NamaaDev preview</h1><p>No HTML returned yet.</p></main>');
    var css=String(files.css || 'body{font-family:Arial,sans-serif;padding:24px;background:#f8fbff;color:#07152f}');
    var js=String(files.js || '');
    var body=html;
    if(/<body[\s>]/i.test(html)){
      body=html.replace(/^[\s\S]*<body[^>]*>/i,'').replace(/<\/body>[\s\S]*$/i,'');
    }
    if(/<!doctype|<html[\s>]/i.test(html) && !/<body[\s>]/i.test(html)){
      body=html.replace(/^[\s\S]*<html[^>]*>/i,'').replace(/<\/html>[\s\S]*$/i,'');
    }
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body>'+body+'<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script></body></html>';
  }
  function renderDevFiles(apiResult,question){
    var files=(apiResult && apiResult.files) || buildDevFiles(question);
    var meta=(apiResult && apiResult.meta) || {};
    var title=meta.pageName || (files.blueprint && files.blueprint.pageName) || 'NamaaDev landing page';
    var sector=meta.sector || (files.blueprint && files.blueprint.sector) || 'business';
    var city=meta.city || (files.blueprint && files.blueprint.city) || 'Morocco';
    var previewDoc=files.previewDoc || makePreviewDocFromFiles(files);
    return '<div class="namaa-dev-result">'+
      '<div class="namaa-dev-status"><span>💻 Landing page preview</span><small>HTML · CSS · JS</small></div>'+ 
      '<div class="namaa-dev-brief">'+
        '<div><span>Page</span><strong>'+utils.escapeHtml(title)+'</strong></div>'+ 
        '<div><span>Sector</span><strong>'+utils.escapeHtml(sector)+'</strong></div>'+ 
        '<div><span>City</span><strong>'+utils.escapeHtml(city)+'</strong></div>'+ 
      '</div>'+ 
      '<div class="namaa-dev-tabs" role="tablist" aria-label="NamaaDev preview and code tabs">'+
        '<button class="is-active" type="button" data-dev-tab="preview">Preview</button>'+ 
        '<button type="button" data-dev-tab="html">HTML</button>'+ 
        '<button type="button" data-dev-tab="css">CSS</button>'+ 
        '<button type="button" data-dev-tab="js">JS</button>'+ 
      '</div>'+ 
      '<div class="namaa-dev-panels">'+
        '<section class="namaa-dev-panel is-active" data-dev-panel="preview"><iframe class="namaa-dev-frame" title="NamaaDev Gemini landing page preview" sandbox="" srcdoc="'+utils.escapeHtml(previewDoc)+'"></iframe></section>'+ 
        '<section class="namaa-dev-panel" data-dev-panel="html"><pre><code>'+utils.escapeHtml(files.html || '')+'</code></pre></section>'+ 
        '<section class="namaa-dev-panel" data-dev-panel="css"><pre><code>'+utils.escapeHtml(files.css || '')+'</code></pre></section>'+ 
        '<section class="namaa-dev-panel" data-dev-panel="js"><pre><code>'+utils.escapeHtml(files.js || '')+'</code></pre></section>'+ 
      '</div>'+ 
      '<div class="namaa-dev-actions"><button class="namaa-mini-button" type="button" data-dev-copy="true">Copy ready later</button><button class="namaa-mini-button secondary" type="button" disabled>Download files soon</button></div>'+ 
      '<p class="namaa-preview-note">Preview generated inside NamaaDev. Review the structure before using it in a real project.</p>'+ 
    '</div>';
  }

  function renderImageResult(apiResult,question){
    var dataUrl=apiResult && apiResult.image && apiResult.image.dataUrl;
    var model=(apiResult && apiResult.model) || 'Gemini image';
    var aspect=(apiResult && apiResult.aspectRatio) || '16:9';
    if(!dataUrl){
      return null;
    }
    return '<div class="namaa-image-result namaa-image-result-live">'+
      '<div class="namaa-image-status"><span>🎨 Mockup generated</span><small>'+utils.escapeHtml(aspect)+'</small></div>'+ 
      '<figure class="namaa-live-image-card">'+
        '<img src="'+utils.escapeHtml(dataUrl)+'" alt="Namaa Images generated business mockup">'+
        '<figcaption><strong>Namaa Images</strong><span>'+utils.escapeHtml(model)+'</span></figcaption>'+ 
      '</figure>'+ 
      '<div class="namaa-image-spec">'+
        '<h3>Design request</h3>'+ 
        '<dl>'+ 
          '<div><dt>Prompt</dt><dd>'+utils.escapeHtml(question)+'</dd></div>'+ 
          '<div><dt>Usage</dt><dd>Mockup visuel pour business, startup, marketing ou landing page au Maroc.</dd></div>'+ 
          '<div><dt>Status</dt><dd>Generated securely as a mockup direction.</dd></div>'+ 
        '</dl>'+ 
      '</div>'+ 
      '<p class="namaa-preview-note">Image générée dans le panneau droit. Utilisez-la comme direction visuelle avant design final.</p>'+ 
    '</div>';
  }
  function imagesApi(question,history,options){
    options=options || {};
    var endpoint=(window.NamaaConfig && window.NamaaConfig.api && window.NamaaConfig.api.imageEndpoint) || '/api/namaa/images';
    return postJson(endpoint,{prompt:question,history:history || [],brief:options.brief || null,mode:'images',aspectRatio:'16:9'}).then(function(data){
      var body=renderImageResult(data,question);
      if(!body){
        throw new Error(data.error || 'No image returned');
      }
      return {
        answerHtml:'<div class="namaa-answer-head"><span>Namaa Images</span><strong>Mockup generated</strong></div>'+textToHtml(data.answer || 'Mockup generated in the right panel.'),
        preview:{type:'Namaa Images',title:'Generated mockup',bodyHtml:body}
      };
    });
  }

  function talkApi(question,history,options){
    options=options || {};
    var endpoint=(window.NamaaConfig && window.NamaaConfig.api && window.NamaaConfig.api.textEndpoint) || '/api/namaa/talk';
    return postJson(endpoint,{message:question,history:history || [],brief:options.brief || null,controlled:!!options.brief,mode:'talk'}).then(function(data){
      return {
        answerHtml:'<div class="namaa-answer-head"><span>Namaa Talk</span><strong>Business Maroc</strong></div>'+textToHtml(data.answer || ''),
        state:{lastTalkQuestion:question}
      };
    });
  }
  function devApi(question,history,options){
    options=options || {};
    var endpoint=(window.NamaaConfig && window.NamaaConfig.api && window.NamaaConfig.api.devEndpoint) || '/api/namaa/dev';
    return postJson(endpoint,{prompt:question,history:history || [],brief:options.brief || null,mode:'dev'}).then(function(data){
      var answer=data.answer || 'NamaaDev generated a landing page example.';
      var body=data.files ? renderDevFiles(data,question) : renderDevFiles({files:buildDevFiles(question)},question);
      return {
        answerHtml:'<div class="namaa-answer-head"><span>NamaaDev</span><strong>Landing page</strong></div>'+textToHtml(answer),
        preview:{type:'NamaaDev',title:'Landing page HTML/CSS/JS',bodyHtml:body}
      };
    });
  }

  window.NamaaServices={
    api:{status:apiStatus,talk:talkApi,images:imagesApi,dev:devApi,textToHtml:textToHtml,renderDevFiles:renderDevFiles,renderImageResult:renderImageResult},
    pdf:{placeholder:pdfPlaceholder,openStrategy:openStrategyPdf},
    upload:{placeholder:uploadPlaceholder},
    dev:{buildFiles:buildDevFiles}
  };
})(window);
