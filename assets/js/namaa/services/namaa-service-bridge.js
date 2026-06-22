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
  var PDF_DOCUMENTS={
    market_research:{
      key:'market_research',
      badge:'Market Research PDF',
      shortTitle:'Market Research',
      title:'Market Research PDF',
      tag:'Market research · Morocco',
      intro:'A clear market diagnosis for Morocco: customer behavior, alternatives, opportunity gap, risks and validation plan.',
      icon:'🔎',
      sectionTitle:'Market research Maroc',
      sections:['Project snapshot','Morocco market context','Target customer behavior','Competitors and alternatives','Opportunity gap','Risks and assumptions','Positioning recommendation','7-day validation plan'],
      next:['📈 Convert insights into a marketing strategy.','🎨 Create logo + category mockups.','💻 Build a landing page prototype.'],
      footer:'Market research document — not a legal, financial or live-statistics report.'
    },
    marketing_strategy:{
      key:'marketing_strategy',
      badge:'Marketing Strategy PDF',
      shortTitle:'Marketing Strategy',
      title:'Marketing Strategy PDF',
      tag:'Marketing strategy · 30 days',
      intro:'A practical marketing plan: positioning, funnel, ads, content, WhatsApp script, budget split and KPIs.',
      icon:'📈',
      sectionTitle:'Stratégie marketing 30 jours',
      sections:['Executive summary','Positioning and offer message','Funnel content → WhatsApp/landing page','30-day action plan','Ads plan','Budget split in MAD','Content ideas','WhatsApp sales script','KPIs and next actions'],
      next:['🎨 Create a matching visual identity and mockup pack.','💻 Turn the strategy into a landing page.','📲 Launch a small WhatsApp/ads test.'],
      footer:'Marketing strategy document — built for practical testing and iteration.'
    },
    roadmap:{
      key:'roadmap',
      badge:'Launch Roadmap PDF',
      shortTitle:'Launch Roadmap',
      title:'Launch Roadmap PDF',
      tag:'Roadmap · launch plan',
      intro:'A simple launch roadmap: week-by-week execution, tasks, KPIs and decision rules for the project.',
      icon:'🗺️',
      sectionTitle:'Roadmap lancement',
      sections:['Project objective','Week 1: offer and proof','Week 2: content and landing page','Week 3: ads and first leads','Week 4: optimization and scale decision','Task checklist','KPIs and decision rules'],
      next:['🔎 Validate market assumptions.','🎨 Create visual assets for launch.','💻 Build the landing page demo.'],
      footer:'Launch roadmap document — focused on action, not theory.'
    }
  };
  function normalizePdfType(type){
    type=String(type || '').trim();
    if(type==='market_research' || type==='marketing_strategy' || type==='roadmap')return type;
    return 'marketing_strategy';
  }
  function pdfDocConfig(type){return PDF_DOCUMENTS[normalizePdfType(type)] || PDF_DOCUMENTS.marketing_strategy;}
  function pdfPlaceholder(lastQuestion,type){
    var doc=pdfDocConfig(type);
    var context=lastQuestion?'<p><strong>Base :</strong> '+utils.escapeHtml(lastQuestion)+'</p>':'';
    return '<h2>'+utils.escapeHtml(doc.title)+' is ready.</h2>'+context+
      '<p>Namaa Talk can transform the guided project brief into a clean branded document.</p>'+ 
      '<ol class="namaa-pdf-steps">'+
        doc.sections.slice(0,6).map(function(item){return '<li>'+utils.escapeHtml(item)+'</li>';}).join('')+
      '</ol>';
  }
  function stripHtml(html){
    var div=document.createElement('div');
    div.innerHTML=String(html || '');
    return (div.textContent || div.innerText || '').replace(/\s+/g,' ').trim();
  }
  function briefRowData(brief){
    brief=brief || {};
    return [
      ['Projet',brief.projectName],
      ['Étape',brief.stage],
      ['Catégorie',brief.category],
      ['Branche',brief.branch],
      ['Marché',brief.market],
      ['Budget',brief.budget],
      ['Objectif',brief.goal],
      ['Cible',brief.target],
      ['Offre',brief.offer],
      ['Canaux',Array.isArray(brief.channels)?brief.channels.join(', '):brief.channels],
      ['Langue',brief.language]
    ].filter(function(row){return row[1];});
  }
  function makeBriefTable(brief){
    var rows=briefRowData(brief).map(function(row){
      return '<tr><th>'+utils.escapeHtml(row[0])+'</th><td>'+utils.escapeHtml(row[1])+'</td></tr>';
    }).join('');
    return rows || '<tr><th>Projet</th><td>Brief non disponible</td></tr>';
  }
  function cleanStrategyHtml(html,text){
    if(html){
      return String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi,'')
        .replace(/\son\w+="[^"]*"/gi,'')
        .replace(/\son\w+='[^']*'/gi,'');
    }
    return '<p>'+utils.escapeHtml(text || 'Le document sera généré après le brief guidé.').replace(/\n/g,'<br>')+'</p>';
  }
  function renderSectionChips(items){
    return (items || []).map(function(item,i){
      var num=(utils.pad2 ? utils.pad2(i+1) : String(i+1).padStart(2,'0'));
      return '<span><b>'+num+'</b>'+utils.escapeHtml(item)+'</span>';
    }).join('');
  }
  function documentLanguageHint(brief){
    var lang=String((brief && brief.language) || '').toLowerCase();
    if(lang.indexOf('darija')>-1)return 'Darija Latin';
    if(lang.indexOf('arab')>-1 || lang.indexOf('العربية')>-1)return 'Arabic script';
    if(lang.indexOf('english')>-1)return 'English';
    if(lang.indexOf('fr')>-1 || lang.indexOf('français')>-1)return 'Français';
    return 'Darija / Français';
  }
  function safeMeta(value,fallback){
    value=String(value || '').trim();
    return utils.escapeHtml(value || fallback || '—');
  }
  function renderPdfPipeline(type){
    var order=type==='market_research'
      ? ['Market clarity','Audience + behavior','Opportunity gap','Validation plan']
      : type==='roadmap'
        ? ['Setup','Launch actions','Lead test','Scale decision']
        : ['Positioning','Funnel','30-day plan','KPIs'];
    return order.map(function(item,i){
      return '<span><b>'+String(i+1).padStart(2,'0')+'</b>'+utils.escapeHtml(item)+'</span>';
    }).join('');
  }
  function nextCardsHtml(doc){
    return (doc.next || []).map(function(item){return '<div>'+utils.escapeHtml(item)+'</div>';}).join('');
  }

  function normalizeSources(sources){
    return Array.isArray(sources) ? sources.filter(function(source){return source && (source.shortName || source.name || source.domain || source.url || source.uri);}).slice(0,10) : [];
  }
  function sourceLevelLabel(source){
    var level=Number(source && source.trustLevel || 0);
    if(level===1)return 'Official Morocco';
    if(level===2)return 'International';
    if(level===3)return source && source.type==='live_google_search' ? 'Live citation' : 'Industry support';
    return source && source.type==='live_google_search' ? 'Live citation' : 'Reference';
  }
  function renderSourcesPanel(sources,mode){
    sources=normalizeSources(sources);
    if(!sources.length){
      sources=[
        {shortName:'HCP',domain:'hcp.ma',trustLevel:1,note:'Morocco economy, population and market context'},
        {shortName:'ANRT',domain:'anrt.ma',trustLevel:1,note:'Digital, internet and mobile indicators'}
      ];
    }
    var cards=sources.map(function(source){
      var label=utils.escapeHtml(source.shortName || source.title || source.name || 'Source');
      var domain=utils.escapeHtml(source.domain || '');
      var link=source.url || source.uri || '';
      var sourceTitle=link ? '<a href="'+utils.escapeHtml(link)+'" target="_blank" rel="noopener">'+label+'</a>' : label;
      return '<li><strong>'+sourceTitle+'</strong><span>'+domain+'</span><em>'+utils.escapeHtml(sourceLevelLabel(source))+'</em><small>'+utils.escapeHtml(source.note || 'Used as a trusted research reference.')+'</small></li>';

    }).join('');
    var title=mode==='print'?'Sources used':'Sources utilisées';
    var hasLive=sources.some(function(source){return source.type==='live_google_search' || source.url || source.uri;});
    var note=mode==='print'
      ? (hasLive ? 'Namaa combines curated trusted Morocco sources with live Gemini Google Search citations. Exact numbers must still be checked in the original source before legal, financial or investment decisions.' : 'Namaa separates verified/source-backed context from strategic recommendations. Exact numbers must be checked in the original official source before legal, financial or investment decisions.')
      : (hasLive ? 'Namaa dar research b sources trusted + live citations. Exact numbers khas-hom verification men source original.' : 'Namaa kayferreq bin facts w recommendations. Exact numbers khas-hom verification men official source.');
    return '<section class="namaa-sources-panel '+(mode==='print'?'is-print':'')+'"><div class="namaa-sources-head"><span>🔐</span><div><h3>'+title+'</h3><p>'+utils.escapeHtml(note)+'</p></div></div><ol>'+cards+'</ol></section>';
  }

  function renderStrategyPreview(payload){
    payload=payload || {};
    var brief=payload.brief || {};
    var doc=pdfDocConfig(payload.documentType || payload.deliverableType || payload.action);
    var sources=normalizeSources(payload.sources || payload.trustedSources || payload.sourceList);
    var strategyHtml=cleanStrategyHtml(payload.strategyHtml,payload.strategyText);
    var title=brief.projectName || 'Projet Namaa';
    return '<article class="namaa-pdf-preview namaa-pdf-preview-v2" data-pdf-type="'+utils.escapeHtml(doc.key)+'">'+
      '<header class="namaa-pdf-v2-cover">'+
        '<div class="namaa-pdf-v2-brandline"><div class="namaa-mark"><b>N</b></div><div><strong>Namaa AI</strong><small>Project Factory by Elboubakry Abdessamad</small></div><img src="/assets/images/logo-e-blue.png" alt="Elboubakry logo"></div>'+ 
        '<div class="namaa-pdf-v2-kicker"><span>'+utils.escapeHtml(doc.badge)+'</span><em>'+utils.escapeHtml(doc.tag)+'</em></div>'+ 
        '<h2>'+utils.escapeHtml(title)+'</h2>'+ 
        '<p>'+utils.escapeHtml(doc.intro)+'</p>'+ 
        '<div class="namaa-pdf-v2-pipeline">'+renderPdfPipeline(doc.key)+'</div>'+ 
      '</header>'+ 
      '<section class="namaa-pdf-v2-meta">'+
        '<div><small>Document</small><strong>'+safeMeta(doc.shortTitle,'Namaa PDF')+'</strong></div>'+ 
        '<div><small>Marché</small><strong>'+safeMeta(brief.market,'Maroc')+'</strong></div>'+ 
        '<div><small>Budget</small><strong>'+safeMeta(brief.budget,'À valider')+'</strong></div>'+ 
        '<div><small>Langue</small><strong>'+utils.escapeHtml(documentLanguageHint(brief))+'</strong></div>'+ 
      '</section>'+ 
      '<section class="namaa-pdf-v2-box namaa-pdf-preview-map"><h3>Document map</h3><div>'+renderSectionChips(doc.sections)+'</div></section>'+ 
      '<section class="namaa-pdf-v2-box namaa-pdf-preview-brief"><h3>Project DNA</h3><table>'+makeBriefTable(brief)+'</table></section>'+ 
      '<section class="namaa-pdf-v2-box namaa-pdf-preview-strategy"><h3>'+utils.escapeHtml(doc.sectionTitle)+'</h3>'+strategyHtml+'</section>'+ 
      '<section class="namaa-pdf-v2-box namaa-pdf-v2-next"><h3>Next in Namaa Factory</h3><div>'+nextCardsHtml(doc)+'</div></section>'+ 
      renderSourcesPanel(sources,'preview')+
      '<footer class="namaa-pdf-preview-footer namaa-pdf-v2-footer"><strong>Namaa AI · Elboubakry Abdessamad</strong><br>Preview only. Download/print gives the branded PDF layout with cover, Project DNA, document map, CTA and footer.</footer>'+ 
    '</article>';
  }
  function openStrategyPdf(payload){
    payload=payload || {};
    var brief=payload.brief || {};
    var doc=pdfDocConfig(payload.documentType || payload.deliverableType || payload.action);
    var sources=normalizeSources(payload.sources || payload.trustedSources || payload.sourceList);
    var strategyHtml=cleanStrategyHtml(payload.strategyHtml,payload.strategyText);
    var title='Namaa '+doc.shortTitle+' - '+(brief.projectName || 'Project');
    var date=new Date().toLocaleDateString('fr-FR',{year:'numeric',month:'long',day:'numeric'});
    var nextCards=nextCardsHtml(doc);
    var structure=(doc.sections || []).map(function(item,i){return '<li><b>'+String(i+1).padStart(2,'0')+'</b><span>'+utils.escapeHtml(item)+'</span></li>';}).join('');
    var safeTitle=utils.escapeHtml(brief.projectName || doc.title);
    var langHint=documentLanguageHint(brief);
    var brandLogo='/assets/images/logo-e-blue.png';
    var docHtml='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+utils.escapeHtml(title)+'</title><style>'+ 
      '@page{size:A4;margin:13mm}*{box-sizing:border-box}html{background:#eaf2ff}body{margin:0;font-family:Inter,Arial,Helvetica,sans-serif;color:#07152f;background:#fff;line-height:1.55}.page{max-width:980px;margin:0 auto;padding:0 0 26px}.cover{position:relative;min-height:420px;overflow:hidden;border-radius:34px;padding:34px;background:radial-gradient(circle at 82% 10%,rgba(147,197,253,.98),transparent 32%),radial-gradient(circle at 8% 85%,rgba(59,130,246,.34),transparent 34%),linear-gradient(135deg,#06142f 0%,#0f2f6d 48%,#2563eb 100%);color:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact}.cover:before{content:"";position:absolute;inset:18px;border:1px solid rgba(255,255,255,.12);border-radius:26px;pointer-events:none}.cover:after{content:"";position:absolute;right:-92px;bottom:-118px;width:310px;height:310px;border-radius:999px;background:rgba(255,255,255,.12)}.brand{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:34px}.brand-main{display:flex;align-items:center;gap:12px}.namaa-mark{display:grid;place-items:center;width:54px;height:54px;border-radius:19px;background:#fff;color:#1d4ed8;box-shadow:0 16px 44px rgba(0,0,0,.18);font-size:24px;font-weight:1000;letter-spacing:-.08em}.brand img{width:46px;height:46px;border-radius:16px;background:#fff;padding:6px;box-shadow:0 12px 34px rgba(0,0,0,.16)}.brand strong{display:block;font-size:18px;letter-spacing:-.02em}.brand small{display:block;color:#bfdbfe;font-size:12px;font-weight:800}.brand-code{padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.14);font-size:10px;font-weight:950;letter-spacing:.12em;text-transform:uppercase;color:#dbeafe}.tag{position:relative;z-index:1;display:inline-flex;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.14);font-size:11px;font-weight:950;letter-spacing:.11em;text-transform:uppercase}.cover h1{position:relative;z-index:1;max-width:790px;margin:13px 0 12px;font-size:48px;line-height:.96;letter-spacing:-.06em}.cover p{position:relative;z-index:1;max-width:700px;margin:0;color:#dbeafe;font-size:16px;font-weight:760}.pipeline{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:28px}.pipeline span{padding:12px;border-radius:18px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);font-size:11px;font-weight:900;color:#dbeafe}.pipeline b{display:block;color:#fff;font-size:13px;margin-bottom:4px}.meta{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:18px 0 0}.meta div{padding:13px;border-radius:18px;background:#f8fbff;border:1px solid #dbeafe}.meta small{display:block;color:#2563eb;text-transform:uppercase;font-size:9px;font-weight:950;letter-spacing:.1em}.meta b{display:block;margin-top:4px;font-size:12px;color:#0b255d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}section{margin-top:22px}.section-title{display:flex;align-items:center;gap:10px;margin:0 0 12px}.section-title span{display:grid;place-items:center;width:31px;height:31px;border-radius:11px;background:#dbeafe;color:#2563eb;font-size:12px;font-weight:950}.section-title h2{margin:0;font-size:23px;line-height:1.1;letter-spacing:-.035em;color:#0b255d}.doc-map{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:0;padding:0;list-style:none}.doc-map li{display:flex;gap:9px;align-items:center;padding:10px 11px;border-radius:15px;background:#f8fbff;border:1px solid #dbeafe;color:#334155;font-size:12px;font-weight:850}.doc-map b{display:grid;place-items:center;width:25px;height:25px;border-radius:9px;background:#eaf2ff;color:#1d4ed8;font-size:10px;flex:0 0 auto}table{width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;border:1px solid #dbeafe;border-radius:18px}th,td{text-align:left;padding:11px 13px;border-bottom:1px solid #e7f0ff;vertical-align:top}tr:last-child th,tr:last-child td{border-bottom:0}th{width:30%;background:#eff6ff;color:#1d4ed8;font-size:11px;text-transform:uppercase;letter-spacing:.06em}td{color:#1f3557;font-weight:750}.content{border:1px solid #dbeafe;border-radius:24px;padding:22px;background:linear-gradient(180deg,#fbfdff,#fff);box-shadow:0 18px 60px rgba(37,99,235,.06)}.content h1,.content h2,.content h3{break-after:avoid;color:#0b255d;letter-spacing:-.035em}.content h1{font-size:24px}.content h2{font-size:21px;margin:18px 0 9px}.content h3{font-size:17px;margin:15px 0 8px}.content p{color:#334155;margin:8px 0}.content ul,.content ol{padding-left:20px;color:#334155}.content li{margin:6px 0}.next{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:20px}.next div{padding:14px;border-radius:18px;background:#eff6ff;border:1px solid #bfdbfe;color:#0b255d;font-weight:850}.namaa-sources-panel{margin-top:22px;border:1px solid #dbeafe;border-radius:24px;padding:18px;background:#f8fbff}.namaa-sources-head{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}.namaa-sources-head span{display:grid;place-items:center;width:38px;height:38px;border-radius:14px;background:#dbeafe}.namaa-sources-head h3{margin:0;color:#0b255d;font-size:22px;letter-spacing:-.035em}.namaa-sources-head p{margin:4px 0 0;color:#52657f;font-size:12px}.namaa-sources-panel ol{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;list-style:none;margin:0;padding:0}.namaa-sources-panel li{padding:12px;border-radius:16px;background:#fff;border:1px solid #dbeafe;break-inside:avoid}.namaa-sources-panel strong{display:block;color:#0b255d}.namaa-sources-panel span{display:inline-flex;margin-top:3px;color:#2563eb;font-size:11px;font-weight:900}.namaa-sources-panel em{display:inline-flex;margin-left:6px;color:#0f766e;font-size:10px;font-style:normal;font-weight:950;text-transform:uppercase}.namaa-sources-panel small{display:block;margin-top:6px;color:#52657f;font-size:11px;line-height:1.35}.cta{margin-top:22px;border-radius:26px;padding:20px;background:linear-gradient(135deg,#07152f,#123a85);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:18px;print-color-adjust:exact;-webkit-print-color-adjust:exact}.cta strong{display:block;font-size:20px;letter-spacing:-.035em}.cta p{margin:5px 0 0;color:#dbeafe}.cta a{display:inline-flex;text-decoration:none;color:#07152f;background:#fff;border-radius:999px;padding:12px 15px;font-weight:950;white-space:nowrap}.footer{margin-top:20px;padding-top:14px;border-top:1px solid #dbeafe;display:flex;justify-content:space-between;gap:14px;color:#64748b;font-size:12px}.footer b{color:#1d4ed8}.print-button{position:fixed;right:18px;bottom:18px;z-index:10;border:0;border-radius:999px;background:#2563eb;color:#fff;font-weight:950;padding:14px 18px;box-shadow:0 16px 40px rgba(37,99,235,.28);cursor:pointer}.watermark{position:fixed;right:18mm;bottom:12mm;color:#dbeafe;font-size:10px;font-weight:950;letter-spacing:.11em;text-transform:uppercase}@media(max-width:720px){.page{padding:0}.cover{border-radius:0}.cover h1{font-size:34px}.meta{grid-template-columns:1fr 1fr}.pipeline{grid-template-columns:1fr 1fr}.doc-map{grid-template-columns:1fr}.next{grid-template-columns:1fr}.cta{display:block}.cta a{margin-top:12px}}@media print{html{background:#fff}body{background:#fff}.print-button{display:none}.cover{break-inside:avoid}.content{break-inside:auto}.doc-map li,.next div,.cta{break-inside:avoid}.page{max-width:none}.watermark{display:block}}'+
      '</style></head><body><button class="print-button" onclick="window.print()">Save / Print PDF</button><main class="page"><section class="cover"><div class="brand"><div class="brand-main"><div class="namaa-mark">N</div><div><strong>Namaa AI</strong><small>Project Factory · by Elboubakry Abdessamad</small></div></div><img src="'+brandLogo+'" alt="Elboubakry logo"><div class="brand-code">'+utils.escapeHtml(doc.badge)+'</div></div><span class="tag">'+utils.escapeHtml(doc.tag)+'</span><h1>'+safeTitle+'</h1><p>'+utils.escapeHtml(doc.intro)+'</p><div class="pipeline">'+renderPdfPipeline(doc.key)+'</div></section><section class="meta"><div><small>Date</small><b>'+utils.escapeHtml(date)+'</b></div><div><small>Document</small><b>'+utils.escapeHtml(doc.shortTitle)+'</b></div><div><small>Marché</small><b>'+utils.escapeHtml(brief.market || 'Maroc')+'</b></div><div><small>Objectif</small><b>'+utils.escapeHtml(brief.goal || 'Croissance')+'</b></div><div><small>Langue</small><b>'+utils.escapeHtml(langHint)+'</b></div></section><section><div class="section-title"><span>01</span><h2>Project DNA</h2></div><table>'+makeBriefTable(brief)+'</table></section><section><div class="section-title"><span>02</span><h2>Document map</h2></div><ul class="doc-map">'+structure+'</ul></section><section><div class="section-title"><span>03</span><h2>'+utils.escapeHtml(doc.sectionTitle)+'</h2></div><div class="content">'+strategyHtml+'</div></section><section><div class="section-title"><span>04</span><h2>Suite recommandée</h2></div><div class="next">'+nextCards+'</div></section>'+sourcesHtml+'<section class="cta"><div><strong>Besoin d’appliquer cette stratégie ?</strong><p>Namaa peut préparer la vision. Abdessamad Elboubakry peut vous accompagner sur l’exécution: landing page, tracking, contenu, ads, WhatsApp et leads.</p></div><a href="https://elboubakry.com/reserver-diagnostic/">Réserver un diagnostic</a></section><p class="footer"><span><b>Namaa AI</b> · Prepared by Elboubakry Abdessamad · elboubakry.com</span><span>'+utils.escapeHtml(doc.footer)+'</span></p><div class="watermark">Namaa AI · Project Factory</div></main><script>window.onload=function(){setTimeout(function(){window.print()},420)}<\/script></body></html>';
    var win=window.open('','_blank','noopener,noreferrer');
    if(win){win.document.open();win.document.write(docHtml);win.document.close();}
    return stripHtml(strategyHtml);
  }

  function uploadPlaceholder(files){
    var count=files && files.length ? files.length : 0;
    return '<h2>Files received.</h2><p>'+count+' file(s) selected. Namaa will use uploaded files for context when file analysis is enabled.</p>';
  }
  function buildDevFiles(question,brief){
    if(window.NamaaDevTemplates && window.NamaaDevTemplates.buildFiles){
      return window.NamaaDevTemplates.buildFiles(question,brief || null);
    }
    var b=brain.inferDevBlueprint ? brain.inferDevBlueprint(question) : {
      sector:'Business Maroc',city:'Maroc',pageName:'Namaa Landing',eyebrow:'Landing page business',headline:'Transformez votre projet en machine à leads',subline:'Une page simple, claire et mobile-first pour expliquer votre offre, gagner la confiance et convertir les visiteurs en conversations WhatsApp.',cta:'Demander un diagnostic',secondCta:'Voir la méthode',proof:['Mobile-first','WhatsApp CTA','Trust section'],cards:[['Offre claire','Une promesse simple, visible dès le premier écran.'],['Preuve rapide','Avis, photos, garanties et FAQ pour rassurer.'],['Conversion','CTA WhatsApp et formulaire court pour capter les leads.']],steps:['Hero','Offre','Preuve','CTA'],tone:'Premium, clair et orienté conversion'};
    var html='<!doctype html>\n<html lang="fr">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>'+utils.escapeHtml(b.pageName)+'</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n'+
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
    var css=':root{--blue:#2563eb;--dark:#07152f;--soft:#eef6ff;--text:#52657f}*{box-sizing:border-box}body{margin:0;font-family:Inter,Arial,sans-serif;background:#f8fbff;color:var(--dark)}a{text-decoration:none}.hero{min-height:70vh;padding:24px;background:radial-gradient(circle at 85% 15%,#bfdbfe,transparent 34%),linear-gradient(135deg,#ffffff,#eef6ff)}nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:56px}nav a{color:var(--blue);font-weight:800}.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:28px;align-items:center}.eyebrow{display:inline-flex;padding:8px 12px;border-radius:999px;background:#dbeafe;color:var(--blue);font-size:12px;font-weight:900;text-transform:uppercase}h1{font-size:clamp(38px,7vw,72px);line-height:.92;letter-spacing:-.06em;margin:16px 0}.lead{font-size:18px;line-height:1.6;color:var(--text);max-width:640px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:999px;background:var(--blue);color:#fff;font-weight:900}.btn.ghost{background:#fff;color:var(--blue);border:1px solid #bfdbfe}.visual{min-height:330px;border-radius:32px;background:linear-gradient(145deg,#0f172a,#2563eb);display:grid;align-content:end;gap:12px;padding:26px}.visual span{display:inline-flex;width:max-content;padding:10px 13px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font-weight:900}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:26px}.cards article,.method,footer{background:#fff;border:1px solid #dceaff;border-radius:24px;padding:22px}.cards p{color:var(--text);line-height:1.5}.method{margin:0 26px 26px}footer{margin:0 26px 26px;display:flex;align-items:center;justify-content:space-between;gap:12px}@media(max-width:800px){.hero-grid,.cards{grid-template-columns:1fr}.hero{padding:18px}.visual{min-height:220px}.method,footer{margin:0 18px 18px}footer{align-items:flex-start;flex-direction:column}}';
    var js='document.querySelectorAll(\'a[href^="#"]\').forEach(function(link){link.addEventListener(\'click\',function(event){var target=document.querySelector(this.getAttribute(\'href\'));if(target){event.preventDefault();target.scrollIntoView({behavior:\'smooth\'});}});});';
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
  function renderDevFiles(apiResult,question,brief){
    var files=(apiResult && apiResult.files) || buildDevFiles(question,brief);
    var meta=(apiResult && apiResult.meta) || {};
    var title=meta.pageName || (files.blueprint && files.blueprint.pageName) || 'NamaaDev landing page';
    var sector=meta.sector || (files.blueprint && files.blueprint.sector) || 'business';
    var city=meta.city || (files.blueprint && files.blueprint.city) || 'Morocco';
    var templateLabel=meta.templateLabel || (files.blueprint && (files.blueprint.templateLabel || files.blueprint.templateKey)) || (files.template && files.template.label) || 'Namaa template';
    var previewDoc=files.previewDoc || makePreviewDocFromFiles(files);
    var safeTitle=utils.escapeHtml(title);
    return '<div class="namaa-dev-result namaa-dev-builder" data-device="desktop" data-project-title="'+safeTitle+'">'+
      '<textarea hidden data-dev-store="html">'+utils.escapeHtml(files.html || '')+'</textarea>'+ 
      '<textarea hidden data-dev-store="css">'+utils.escapeHtml(files.css || '')+'</textarea>'+ 
      '<textarea hidden data-dev-store="js">'+utils.escapeHtml(files.js || '')+'</textarea>'+ 
      '<textarea hidden data-dev-store="preview">'+utils.escapeHtml(previewDoc || '')+'</textarea>'+ 
      '<div class="namaa-dev-status"><span>💻 Live website builder</span><small>Preview · code · download</small></div>'+ 
      '<div class="namaa-dev-brief">'+
        '<div><span>Page</span><strong>'+safeTitle+'</strong></div>'+ 
        '<div><span>Sector</span><strong>'+utils.escapeHtml(sector)+'</strong></div>'+ 
        '<div><span>City</span><strong>'+utils.escapeHtml(city)+'</strong></div>'+ 
        '<div><span>Template</span><strong>'+utils.escapeHtml(templateLabel)+'</strong></div>'+ 
      '</div>'+ 
      '<div class="namaa-dev-toolbar" aria-label="NamaaDev preview controls">'+
        '<div class="namaa-dev-devices" role="group" aria-label="Preview device">'+
          '<button class="is-active" type="button" data-dev-device="desktop">Desktop</button>'+ 
          '<button type="button" data-dev-device="mobile">Mobile</button>'+ 
        '</div>'+ 
        '<button class="namaa-dev-open" type="button" data-dev-open="true">Open preview ↗</button>'+ 
      '</div>'+ 
      '<div class="namaa-dev-tabs" role="tablist" aria-label="NamaaDev preview and code tabs">'+
        '<button class="is-active" type="button" data-dev-tab="preview">Preview</button>'+ 
        '<button type="button" data-dev-tab="html">HTML</button>'+ 
        '<button type="button" data-dev-tab="css">CSS</button>'+ 
        '<button type="button" data-dev-tab="js">JS</button>'+ 
      '</div>'+ 
      '<div class="namaa-dev-panels">'+
        '<section class="namaa-dev-panel is-active" data-dev-panel="preview"><div class="namaa-dev-device-shell"><iframe class="namaa-dev-frame" title="NamaaDev landing page preview" sandbox="allow-scripts" srcdoc="'+utils.escapeHtml(previewDoc)+'"></iframe></div></section>'+ 
        '<section class="namaa-dev-panel" data-dev-panel="html"><pre><code>'+utils.escapeHtml(files.html || '')+'</code></pre></section>'+ 
        '<section class="namaa-dev-panel" data-dev-panel="css"><pre><code>'+utils.escapeHtml(files.css || '')+'</code></pre></section>'+ 
        '<section class="namaa-dev-panel" data-dev-panel="js"><pre><code>'+utils.escapeHtml(files.js || '')+'</code></pre></section>'+ 
      '</div>'+ 
      '<div class="namaa-dev-actions">'+
        '<button class="namaa-mini-button" type="button" data-dev-copy="active">Copy active tab</button>'+ 
        '<button class="namaa-mini-button secondary" type="button" data-dev-copy="all">Copy all code</button>'+ 
        '<button class="namaa-mini-button secondary" type="button" data-dev-download="true">Download files</button>'+ 
      '</div>'+ 
      '<p class="namaa-preview-note">NamaaDev generated a simple real landing page. Test the preview, then copy or download index.html, style.css and script.js.</p>'+ 
    '</div>';
  }

  function packFromContext(question,brief,apiResult){
    if(apiResult && apiResult.pack && apiResult.pack.assets){return apiResult.pack;}
    if(brain && brain.getMockupPack){return brain.getMockupPack(question,brief);}
    return {label:'Business Maroc',primaryAsset:'Landing page + social mockup',assets:['Logo concept','Landing page','Social post','WhatsApp CTA'],copyAngles:['Launch clearly'],style:'Premium blue business'};
  }
  function packChips(items){
    return (items || []).map(function(item,i){return '<span><b>'+utils.pad2(i+1)+'</b>'+utils.escapeHtml(item)+'</span>';}).join('');
  }
  function renderDesignStages(pack){
    var flow=pack.assetFlow || ['Logo first','Brand board','Category mockups','Launch visuals'];
    var stages=pack.stages || [];
    return '<div class="namaa-logo-workflow">'+flow.map(function(item,i){
      return '<div><span>'+utils.pad2(i+1)+'</span><strong>'+utils.escapeHtml(item)+'</strong><small>'+utils.escapeHtml(stages[i] || '')+'</small></div>';
    }).join('')+'</div>';
  }
  function renderOutputPack(pack){
    return '<div class="namaa-category-output">'+(pack.outputs || pack.assets || []).slice(0,7).map(function(item){return '<span>'+utils.escapeHtml(item)+'</span>';}).join('')+'</div>';
  }
  function renderImageResult(apiResult,question,brief){
    var dataUrl=apiResult && apiResult.image && apiResult.image.dataUrl;
    var aspect=(apiResult && apiResult.aspectRatio) || (apiResult && apiResult.pack && apiResult.pack.ratio) || '16:9';
    var pack=packFromContext(question,brief,apiResult);
    if(!dataUrl){
      return null;
    }
    return '<div class="namaa-image-result namaa-image-result-live namaa-image-result-pack">'+
      '<div class="namaa-image-status"><span>🎨 Logo + mockup pack généré</span><small>'+utils.escapeHtml(pack.label || aspect)+'</small></div>'+ 
      '<div class="namaa-design-system-card"><h3>Logo-first workflow</h3>'+renderDesignStages(pack)+'<p>'+utils.escapeHtml(pack.logoPrompt || pack.logoIdea || 'Logo concept first, then mockups adapted to the project category.')+'</p></div>'+ 
      '<figure class="namaa-live-image-card namaa-live-image-card-pack">'+
        '<img src="'+utils.escapeHtml(dataUrl)+'" alt="Namaa Images generated business mockup pack">'+
        '<figcaption><strong>'+utils.escapeHtml(pack.primaryAsset || 'Namaa Images')+'</strong><span>'+utils.escapeHtml(aspect)+' · Namaa Image Lab</span></figcaption>'+ 
      '</figure>'+ 
      '<div class="namaa-mock-assets"><h3>Category output pack</h3>'+renderOutputPack(pack)+'<div class="namaa-layout-chips namaa-asset-chips">'+packChips(pack.assets || [])+'</div></div>'+
      '<div class="namaa-image-spec">'+
        '<h3>Design request</h3>'+ 
        '<dl>'+ 
          '<div><dt>Prompt</dt><dd>'+utils.escapeHtml(question)+'</dd></div>'+ 
          '<div><dt>Logo</dt><dd>'+utils.escapeHtml(pack.logoIdea || 'Professional mark adapted to the project')+'</dd></div>'+ 
          '<div><dt>Style</dt><dd>'+utils.escapeHtml(pack.style || 'Premium Moroccan business visual')+'</dd></div>'+ 
          '<div><dt>Status</dt><dd>Generated as a mockup board for business validation.</dd></div>'+ 
        '</dl>'+ 
      '</div>'+ 
      '<div class="namaa-copy-angles"><h3>Suggested messages</h3><div>'+packChips(pack.copyAngles || [])+'</div></div>'+
      '<p class="namaa-preview-note">'+utils.escapeHtml(pack.downloadNote || 'Preview only: Namaa shows the creative direction before final export.')+'</p>'+ 
    '</div>';
  }
  function imagesApi(question,history,options){
    options=options || {};
    var endpoint=(window.NamaaConfig && window.NamaaConfig.api && window.NamaaConfig.api.imageEndpoint) || '/api/namaa/images';
    var brief=options.brief || null;
    var localPack=packFromContext(question,brief,null);
    return postJson(endpoint,{prompt:question,history:history || [],brief:brief,pack:localPack,mode:'images',aspectRatio:localPack.ratio || '16:9'}).then(function(data){
      var body=renderImageResult(data,question,brief);
      if(!body){
        throw new Error(data.error || 'No image returned');
      }
      return {
        answerHtml:'<div class="namaa-answer-head"><span>Namaa Images</span><strong>Creative pack prêt</strong></div>'+textToHtml(data.answer || 'Logo + mockup pack généré dans le panneau droit.'),
        preview:{type:'Namaa Images',title:'Logo + mockup pack',bodyHtml:body}
      };
    });
  }


  function renderSmartBriefCoach(data){
    var status=data && data.briefStatus;
    if(!data.showBriefCoach || !status || !data.shortMode || status.isReady)return '';
    var missing=Array.isArray(status.missingFields)?status.missingFields:[];
    var questions=Array.isArray(status.nextQuestions)?status.nextQuestions:[];
    if(!missing.length && !questions.length)return '';
    var score=Number(status.score || data.briefReadiness || 0);
    var chips=missing.slice(0,5).map(function(field){return '<span>'+utils.escapeHtml(field.shortLabel || field.label || field.key)+'</span>';}).join('');
    var qs=questions.slice(0,2).map(function(q){return '<li>'+utils.escapeHtml(q)+'</li>';}).join('');
    return '<div class="namaa-brief-coach" data-readiness="'+utils.escapeHtml(score)+'">'+
      '<div class="namaa-brief-coach-top"><span>Brief intelligence</span><strong>'+utils.escapeHtml(score)+'% prêt</strong></div>'+ 
      '<div class="namaa-brief-meter"><i style="width:'+Math.max(8,Math.min(100,score))+'%"></i></div>'+ 
      '<div class="namaa-brief-missing">'+chips+'</div>'+ 
      (qs?'<ol>'+qs+'</ol>':'')+ 
      '<p>Namaa ghadi ysowlek ghir 3la lma3lomat lmohima bach ykhrrej result wadih bla sda3.</p>'+ 
    '</div>';
  }

  function renderTalkActions(actions, data){
    actions=Array.isArray(actions)?actions:[];
    if(!actions.length)return '';
    var buttons=actions.map(function(action){
      var id=action.id || action;
      var label=action.label || id;
      var icon=id==='market_research'?'🔎':id==='marketing_strategy'?'📈':id==='roadmap'?'🗺️':id==='guided_brief'?'🧭':'✨';
      var attr=id==='guided_brief'?'data-flow-action="guided-intake"':'data-talk-action="'+utils.escapeHtml(id)+'"';
      return '<button class="namaa-mini-button '+(id==='guided_brief'?'secondary':'')+'" type="button" '+attr+'><span>'+icon+'</span>'+utils.escapeHtml(label)+'</button>';
    }).join('');
    return '<div class="namaa-action-card namaa-controller-card"><div><span>⚡</span><strong>Chno bghiti nwjed lik daba?</strong><p>Khtar document li mhtaj, w Namaa ghadi yhawwel brief dyalek l result organised.</p></div><div class="namaa-flow-actions">'+buttons+'</div></div>';
  }

  function talkApi(question,history,options){
    options=options || {};
    var endpoint=(window.NamaaConfig && window.NamaaConfig.api && window.NamaaConfig.api.textEndpoint) || '/api/namaa/talk';
    return postJson(endpoint,{message:question,history:history || [],brief:options.brief || null,action:options.action || null,controlled:!!options.brief,mode:'talk'}).then(function(data){
      var label=data.deliverableLabel || data.conversationLabel || (data.shortMode ? 'Namaa kayhder m3ak' : 'Document business');
      var html='<div class="namaa-answer-head"><span>Namaa Talk</span><strong>'+utils.escapeHtml(label)+'</strong></div>'+textToHtml(data.answer || '');
      html+=renderSmartBriefCoach(data);
      html+=renderTalkActions(data.actions || [],data);
      var state={lastTalkQuestion:question};
      if(data.brief){state.projectBrief=data.brief;}
      if(data.briefPatch){state.projectBriefPatch=data.briefPatch;}
      if(data.briefStatus){state.briefStatus=data.briefStatus;}
      if(data.sources){state.lastSources=data.sources;}
      if(data.liveSources){state.lastLiveSources=data.liveSources;}
      if(data.liveSearch){state.liveSearch=data.liveSearch;}
      if(data.sourcePolicy){state.sourcePolicy=data.sourcePolicy;}
      state.lastDeliverableType=data.shortMode ? '' : (data.action || '');
      return {
        answerHtml:html,
        state:state
      };
    });
  }
  function devApi(question,history,options){
    options=options || {};
    var endpoint=(window.NamaaConfig && window.NamaaConfig.api && window.NamaaConfig.api.devEndpoint) || '/api/namaa/dev';
    var brief=options.brief || null;
    var template=(window.NamaaDevTemplates && window.NamaaDevTemplates.get) ? window.NamaaDevTemplates.get(question,brief) : null;
    return postJson(endpoint,{prompt:question,history:history || [],brief:brief,template:template,mode:'dev'}).then(function(data){
      var answer=data.answer || 'NamaaDev generated a landing page example.';
      var body=data.files ? renderDevFiles(data,question,brief) : renderDevFiles({files:buildDevFiles(question,brief)},question,brief);
      return {
        answerHtml:'<div class="namaa-answer-head"><span>NamaaDev</span><strong>Landing page prête</strong></div>'+textToHtml(answer),
        preview:{type:'NamaaDev',title:'Landing page HTML/CSS/JS',bodyHtml:body}
      };
    });
  }

  window.NamaaServices={
    api:{status:apiStatus,talk:talkApi,images:imagesApi,dev:devApi,textToHtml:textToHtml,renderDevFiles:renderDevFiles,renderImageResult:renderImageResult},
    pdf:{placeholder:pdfPlaceholder,openStrategy:openStrategyPdf,renderStrategyPreview:renderStrategyPreview},
    upload:{placeholder:uploadPlaceholder},
    dev:{buildFiles:buildDevFiles}
  };
})(window);
