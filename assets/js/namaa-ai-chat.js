(function(window,document){
  'use strict';
  var config=window.NamaaConfig || {};
  var utils=window.NamaaUtils || {escapeHtml:function(value){return String(value || '');}};
  var services=window.NamaaServices || {};
  var agents=window.NamaaAgents || {};

  var form=document.getElementById('namaaForm');
  var input=document.getElementById('namaaInput');
  var thread=document.getElementById('namaaThread');
  var hero=document.getElementById('namaaHero');
  var activeModeLabel=document.getElementById('namaaActiveMode');
  var heroKicker=document.getElementById('namaaHeroKicker');
  var heroTitle=document.getElementById('namaaHeroTitle');
  var heroIntro=document.getElementById('namaaHeroIntro');
  var plusBtn=document.getElementById('namaaPlusBtn');
  var plusMenu=document.getElementById('namaaPlusMenu');
  var fileInput=document.getElementById('namaaFileInput');
  var workspace=document.getElementById('namaaWorkspace');
  var preview=document.getElementById('namaaPreview');
  var previewClose=document.getElementById('namaaPreviewClose');
  var previewPill=document.getElementById('namaaPreviewPill');
  var previewTitle=document.getElementById('namaaPreviewTitle');
  var previewBody=document.getElementById('namaaPreviewBody');
  var sidebar=document.getElementById('namaaSidebar');
  var sidebarToggle=document.getElementById('namaaSidebarToggle');
  var sidebarClose=document.getElementById('namaaSidebarClose');
  var sidebarBackdrop=document.getElementById('namaaSidebarBackdrop');
  var sidebarNote=document.querySelector('.namaa-sidebar-note');

  var currentAgent='talk';
  var history=[];
  var appState={lastTalkQuestion:'',lastDevFiles:null,projectBrief:null,lastStrategyText:'',lastStrategyHtml:'',flowStage:'intake'};

  if(!form || !input || !thread)return;

  function agentConfig(agent){return (config.agents && config.agents[agent]) || (config.agents && config.agents.talk) || {};}
  function addHistory(role,content){
    history.push({role:role,content:content,agent:currentAgent,createdAt:new Date().toISOString()});
    var max=(config.api && config.api.maxHistoryTurns ? config.api.maxHistoryTurns : 8)*2;
    if(history.length>max)history=history.slice(history.length-max);
  }
  function closePlusMenu(){
    if(!plusMenu||!plusBtn)return;
    plusMenu.hidden=true;
    plusBtn.setAttribute('aria-expanded','false');
  }
  function setSidebarExpanded(open){
    var drawerMode=window.innerWidth<=1120;
    if(sidebarToggle)sidebarToggle.setAttribute('aria-expanded',open?'true':'false');
    if(sidebar)sidebar.setAttribute('aria-hidden',drawerMode?(open?'false':'true'):'false');
  }
  function openSidebar(){
    document.body.classList.add('namaa-sidebar-open');
    if(sidebarBackdrop)sidebarBackdrop.hidden=false;
    setSidebarExpanded(true);
    closePlusMenu();
  }
  function closeSidebar(){
    document.body.classList.remove('namaa-sidebar-open');
    if(sidebarBackdrop)sidebarBackdrop.hidden=true;
    setSidebarExpanded(false);
  }
  function openPreview(type,title,bodyHtml){
    if(!workspace || !preview)return;
    if(previewPill)previewPill.textContent=type || 'Preview';
    if(previewTitle)previewTitle.textContent=title || 'Right result panel';
    if(previewBody && bodyHtml)previewBody.innerHTML=bodyHtml;
    workspace.setAttribute('data-preview','open');
    preview.setAttribute('aria-hidden','false');
  }
  function closePreview(){
    if(!workspace || !preview)return;
    workspace.setAttribute('data-preview','closed');
    preview.setAttribute('aria-hidden','true');
  }
  function setSidebarNote(icon,title,text){
    if(!sidebarNote)return;
    sidebarNote.innerHTML='<span>'+utils.escapeHtml(icon || '⚡')+'</span><p><strong>'+utils.escapeHtml(title || 'Namaa UI phase')+'</strong>'+utils.escapeHtml(text || 'The workspace is ready.')+'</p>';
  }
  function syncAgentButtons(agent){
    document.querySelectorAll('[data-agent]').forEach(function(el){
      el.classList.toggle('is-active',el.getAttribute('data-agent')===agent);
    });
  }
  function setAgent(agent){
    if(!agentConfig(agent).label || !agents[agent])return;
    currentAgent=agent;
    var meta=agentConfig(agent);
    document.body.setAttribute('data-namaa-agent',agent);
    if(activeModeLabel)activeModeLabel.textContent=meta.label;
    input.placeholder=meta.placeholder || '';
    if(hero && meta.hero){
      heroKicker.textContent=meta.hero.kicker;
      heroTitle.textContent=meta.hero.title;
      heroIntro.textContent=meta.hero.intro;
    }
    syncAgentButtons(agent);
    if(agent==='talk')closePreview();
    if(meta.sidebarNote)setSidebarNote(meta.sidebarNote.icon,meta.sidebarNote.title,meta.sidebarNote.text);
    closePlusMenu();
    closeSidebar();
    window.setTimeout(function(){input.focus();},30);
  }
  function addMessage(role,html){
    var wrap=document.createElement('div');
    wrap.className='namaa-message '+role;
    if(role==='ai'){
      wrap.innerHTML='<div class="namaa-avatar">N</div><div class="namaa-bubble">'+html+'</div>';
    }else{
      wrap.innerHTML='<div class="namaa-bubble">'+html+'</div>';
    }
    thread.appendChild(wrap);
    thread.scrollTop=thread.scrollHeight;
    return wrap;
  }
  function promptButtonsHtml(){
    var chips=config.promptChips || [];
    return chips.map(function(chip){
      return '<button type="button" data-prompt="'+utils.escapeHtml(chip.prompt)+'"><span>'+utils.escapeHtml(chip.index)+'</span> '+utils.escapeHtml(chip.label)+'</button>';
    }).join('');
  }
  function guidedCtaHtml(){
    return '<div class="namaa-guided-card">'+
      '<div><span class="namaa-guided-pill">Smart brief</span><h2>Commencez par un brief guidé</h2><p>Namaa collecte les bonnes informations en 8 étapes, limite les tokens, puis prépare une stratégie PDF, un mockup et une landing page.</p></div>'+ 
      '<button class="namaa-mini-button" type="button" data-flow-action="guided-intake">Lancer le brief projet</button>'+ 
    '</div>';
  }
  var intakeSteps=[
    {key:'projectName',type:'input',label:'Quel est le nom de votre projet ?',hint:'Écrivez le nom exactement comme vous voulez l’utiliser.',placeholder:'Exemple : Namaa Kids',footer:'Nom du projet'},
    {key:'stage',label:'Où en est le projet ?',hint:'Choisissez l’étape la plus proche pour préparer le bon pack.',footer:'Étape du projet',options:['Nouveau projet à lancer','Idée initiale à transformer en projet','Projet existant à relancer']},
    {key:'category',label:'Dans quel type entre votre projet ?',hint:'Choisissez la catégorie principale. Namaa affichera ensuite des choix plus précis.',footer:'Type de projet',options:['E-commerce / vente de produits','Clinique / médical','Restaurant / food','SaaS / application','Agence / service pro','Service local','Formation / cours','Immobilier']},
    {key:'branch',label:'Choisissez la branche',hint:'Sélectionnez la branche qui correspond le mieux au projet.',footer:'Branche',dynamic:true},
    {key:'market',label:'Où le projet démarre-t-il au Maroc ?',hint:'Choisissez tout le Maroc ou une ville précise. Namaa l’utilise pour l’analyse locale et la concurrence.',footer:'Marché',options:['Maroc entier','Casablanca','Rabat','Marrakech','Tanger','Agadir','Fès','Meknès','Kénitra','Oujda']},
    {key:'budget',label:'Quel budget mensuel marketing ?',hint:'Sélectionnez une fourchette réaliste en MAD pour éviter les réponses trop générales.',footer:'Budget',options:['Moins de 1000 DH','1000 - 3000 DH','3000 - 7000 DH','7000 - 15000 DH','Plus de 15000 DH','Pas encore défini']},
    {key:'goal',label:'Quel est l’objectif principal ?',hint:'Choisissez le résultat prioritaire. Namaa va construire la stratégie autour de cet objectif.',footer:'Objectif',options:['Trouver les premiers clients','Générer des leads WhatsApp','Vendre plus en ligne','Lancer une offre claire','Créer une landing page','Améliorer la visibilité','Structurer le marketing']},
    {key:'channels',label:'Quels canaux avez-vous déjà ?',hint:'Vous pouvez choisir plusieurs canaux. Cliquez Suivant quand c’est bon.',footer:'Canaux',multi:true,options:['Aucun canal','Instagram','TikTok','Facebook','WhatsApp','Site web','Google Maps','Publicité déjà lancée']}
  ];
  var branchMap={
    'Clinique / médical':['Dentiste','Clinique esthétique','Dermatologie','Kinésithérapie','Centre ophtalmologique','Laboratoire','Médecin spécialiste'],
    'E-commerce / vente de produits':['Mode / vêtements','Cosmétiques','Produits alimentaires','Électronique','Maison / déco','Produit artisanal','Produit unique à tester'],
    'Restaurant / food':['Restaurant','Café','Fast food','Pâtisserie','Traiteur','Dark kitchen','Food truck'],
    'SaaS / application':['Application mobile','SaaS B2B','Marketplace','IA / automatisation','EdTech','FinTech','Outil interne'],
    'Agence / service pro':['Marketing digital','Design / branding','Développement web','Consulting','Comptabilité','Architecture','Photographie / vidéo'],
    'Service local':['Nettoyage','Déménagement','Réparation','Beauté à domicile','Coaching','Livraison','Maintenance'],
    'Formation / cours':['École privée','Cours de langue','Formation digitale','Coaching professionnel','Centre de soutien','Formation IA'],
    'Immobilier':['Agence immobilière','Projet locatif','Promotion immobilière','Gestion Airbnb','Courtier','Bureau de vente']
  };
  function getIntakeStep(index){
    var step=intakeSteps[index];
    if(step && step.dynamic){
      var category=(appState.projectBriefDraft && appState.projectBriefDraft.category) || '';
      step=Object.assign({},step,{options:branchMap[category] || ['Général','Premium','Low-cost','B2B','B2C']});
    }
    return step;
  }
  function briefValue(value){return Array.isArray(value)?value.join(', '):(value || '');}
  function formatBrief(brief){
    if(!brief)return '';
    return [
      'Nom: '+briefValue(brief.projectName),
      'Étape: '+briefValue(brief.stage),
      'Type: '+briefValue(brief.category),
      'Branche: '+briefValue(brief.branch),
      'Marché: '+briefValue(brief.market),
      'Budget: '+briefValue(brief.budget),
      'Objectif: '+briefValue(brief.goal),
      'Canaux: '+briefValue(brief.channels)
    ].filter(function(line){return !/:\s*$/.test(line);}).join('\n');
  }
  function briefSummaryHtml(brief){
    return '<div class="namaa-brief-summary"><span>Brief projet</span><strong>'+utils.escapeHtml(brief.projectName || 'Projet sans nom')+'</strong><dl>'+ 
      '<div><dt>Étape</dt><dd>'+utils.escapeHtml(briefValue(brief.stage))+'</dd></div>'+ 
      '<div><dt>Type</dt><dd>'+utils.escapeHtml(briefValue(brief.category))+'</dd></div>'+ 
      '<div><dt>Branche</dt><dd>'+utils.escapeHtml(briefValue(brief.branch))+'</dd></div>'+ 
      '<div><dt>Marché</dt><dd>'+utils.escapeHtml(briefValue(brief.market))+'</dd></div>'+ 
      '<div><dt>Budget</dt><dd>'+utils.escapeHtml(briefValue(brief.budget))+'</dd></div>'+ 
      '<div><dt>Objectif</dt><dd>'+utils.escapeHtml(briefValue(brief.goal))+'</dd></div>'+ 
      '<div><dt>Canaux</dt><dd>'+utils.escapeHtml(briefValue(brief.channels))+'</dd></div>'+ 
    '</dl></div>';
  }
  function buildStrategyPrompt(brief){
    return 'Namaa Project Brief\n'+formatBrief(brief)+'\n\nTask: Create a professional Morocco-focused market diagnosis and 30-day marketing strategy. Keep it clear, concise, practical, and ready to export as PDF. Use the same language style as the brief user interface: French with small Darija if useful. Do not ask more questions unless a critical field is missing.';
  }
  function buildMockupPrompt(brief,custom){
    var base='Create a premium 16:9 visual mockup for this Moroccan project.\n'+formatBrief(brief)+'\nStyle: clean, modern, high-converting landing page hero/ad concept, blue/white premium, strong CTA, realistic business layout, minimal readable text.';
    return custom ? base+'\nUser idea: '+custom : base+'\nBe creative and choose the best visual direction.';
  }
  function buildDevPrompt(brief){
    return 'Create a simple responsive landing page HTML/CSS/JS example for this Moroccan project.\n'+formatBrief(brief)+'\nSections: hero, offer, benefits, trust, 30-day plan, FAQ, CTA. Keep it clean, professional, mobile-friendly.';
  }
  function startIntakeWizard(){
    appState.projectBriefDraft=Object.assign({},appState.projectBrief || {});
    renderIntakeWizard(0);
  }
  function closeIntakeWizard(){
    var modal=document.querySelector('.namaa-intake-modal');
    if(modal)modal.remove();
  }
  function renderIntakeWizard(index){
    closeIntakeWizard();
    var step=getIntakeStep(index);
    if(!step)return;
    var draft=appState.projectBriefDraft || {};
    var value=draft[step.key] || (step.multi?[]:'');
    var progress=Math.round(((index+1)/intakeSteps.length)*100);
    var modal=document.createElement('div');
    modal.className='namaa-intake-modal';
    modal.innerHTML='<div class="namaa-intake-backdrop"></div>'+ 
      '<section class="namaa-intake-card" role="dialog" aria-modal="true" aria-label="Lancer la création du projet">'+ 
        '<header><div><span>Super Agent Namaa</span><h2>Lancer la création du projet</h2></div><button type="button" data-intake-close aria-label="Fermer">×</button></header>'+ 
        '<div class="namaa-intake-progress"><i style="width:'+progress+'%"></i></div>'+ 
        '<div class="namaa-intake-body"><h3>'+utils.escapeHtml(step.label)+'</h3><p>'+utils.escapeHtml(step.hint || '')+'</p>'+renderIntakeControl(step,value)+'</div>'+ 
        '<footer><strong>'+utils.escapeHtml(step.footer || '')+' · '+(index+1)+'/'+intakeSteps.length+'</strong><div><button type="button" class="namaa-intake-back" data-intake-back '+(index===0?'disabled':'')+'>Retour</button><button type="button" class="namaa-intake-next" data-intake-next>'+(index===intakeSteps.length-1?'Créer la stratégie':'Suivant')+'</button></div></footer>'+ 
      '</section>';
    document.body.appendChild(modal);
    modal.dataset.step=String(index);
    var textInput=modal.querySelector('[data-intake-input]');
    if(textInput){window.setTimeout(function(){textInput.focus();},60);}
  }
  function renderIntakeControl(step,value){
    if(step.type==='input'){
      return '<input class="namaa-intake-input" data-intake-input value="'+utils.escapeHtml(value)+'" placeholder="'+utils.escapeHtml(step.placeholder || '')+'">';
    }
    return '<div class="namaa-intake-options '+(step.multi?'is-multi':'')+'">'+(step.options || []).map(function(option){
      var active=step.multi ? (Array.isArray(value) && value.indexOf(option)>-1) : value===option;
      return '<button type="button" data-intake-option="'+utils.escapeHtml(option)+'" class="'+(active?'is-selected':'')+'">'+utils.escapeHtml(option)+'</button>';
    }).join('')+'</div>';
  }
  function saveIntakeStep(index){
    var modal=document.querySelector('.namaa-intake-modal');
    var step=getIntakeStep(index);
    if(!modal || !step)return false;
    appState.projectBriefDraft=appState.projectBriefDraft || {};
    if(step.type==='input'){
      var inputEl=modal.querySelector('[data-intake-input]');
      var val=inputEl?inputEl.value.trim():'';
      if(!val){modal.classList.add('is-shaking');setTimeout(function(){modal.classList.remove('is-shaking');},300);return false;}
      appState.projectBriefDraft[step.key]=val;
      return true;
    }
    var selected=[].slice.call(modal.querySelectorAll('[data-intake-option].is-selected')).map(function(btn){return btn.getAttribute('data-intake-option');});
    if(!selected.length){modal.classList.add('is-shaking');setTimeout(function(){modal.classList.remove('is-shaking');},300);return false;}
    appState.projectBriefDraft[step.key]=step.multi?selected:selected[0];
    return true;
  }
  function finishIntake(){
    appState.projectBrief=Object.assign({},appState.projectBriefDraft || {});
    appState.flowStage='strategy';
    closeIntakeWizard();
    setAgent('talk');
    document.body.classList.add('namaa-has-messages');
    if(hero){hero.remove();hero=null;}
    var summary=briefSummaryHtml(appState.projectBrief);
    addMessage('user',summary);
    addHistory('user',formatBrief(appState.projectBrief));
    var q=buildStrategyPrompt(appState.projectBrief);
    var loading=addMessage('ai','<p>Namaa prépare une stratégie claire et contrôlée...</p>');
    loading.classList.add('is-loading');
    answerAsync(q,{brief:appState.projectBrief,history:[]}).then(function(html){
      appState.lastStrategyHtml=html;
      appState.lastStrategyText=html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
      var next='<div class="namaa-pdf-card namaa-flow-card"><div><span>📄</span><strong>Stratégie prête</strong><p>Générez le PDF, puis Namaa passera automatiquement à l’étape mockup.</p></div><button class="namaa-mini-button" type="button" data-namaa-pdf="true">Télécharger le PDF</button></div>';
      updateAiMessage(loading,html+next);
      addHistory('assistant',appState.lastStrategyText);
    }).catch(function(error){
      updateAiMessage(loading,'<p>Namaa had a temporary problem: '+utils.escapeHtml(error.message || 'Unknown error')+'</p>');
    });
  }
  function resetChat(){
    closePreview();
    thread.innerHTML='';
    document.body.classList.remove('namaa-has-messages');
    history=[];
    appState.lastTalkQuestion='';
    appState.lastDevFiles=null;
    appState.projectBrief=null;
    appState.lastStrategyText='';
    appState.lastStrategyHtml='';
    appState.flowStage='intake';
    var meta=agentConfig(currentAgent);
    var welcome=document.createElement('div');
    welcome.className='namaa-welcome';
    welcome.id='namaaHero';
    welcome.innerHTML='<div class="namaa-orb" aria-hidden="true"><span>N</span></div>'+ 
      '<p class="namaa-kicker" id="namaaHeroKicker">'+utils.escapeHtml(meta.hero.kicker)+'</p>'+ 
      '<h1 id="namaaHeroTitle">'+utils.escapeHtml(meta.hero.title)+'</h1>'+ 
      '<p class="namaa-intro" id="namaaHeroIntro">'+utils.escapeHtml(meta.hero.intro)+'</p>'+ 
      '<div class="namaa-chip-row" aria-label="Exemples de questions">'+promptButtonsHtml()+'</div>'+guidedCtaHtml();
    thread.appendChild(welcome);
    hero=welcome;
    heroKicker=document.getElementById('namaaHeroKicker');
    heroTitle=document.getElementById('namaaHeroTitle');
    heroIntro=document.getElementById('namaaHeroIntro');
    bindPromptButtons(welcome);
    input.value='';
    input.style.height='auto';
    closeSidebar();
    setSidebarNote('＋','New chat','Start a fresh Namaa conversation in the active mode.');
    input.focus();
  }
  function applyResult(result){
    if(result && result.state){
      Object.keys(result.state).forEach(function(key){appState[key]=result.state[key];});
    }
    if(result && result.preview)openPreview(result.preview.type,result.preview.title,result.preview.bodyHtml);
    return (result && result.answerHtml) || '<p>Namaa is ready.</p>';
  }
  function localAnswer(question){
    var agent=agents[currentAgent] || agents.talk;
    return applyResult(agent.reply({question:question,history:history.slice(),state:appState,config:config}));
  }
  function answerAsync(question,options){
    options=options || {};
    var outboundHistory=options.history || history.slice();
    var apiEnabled=!!(config.api && config.api.enabled && services.api);
    if(apiEnabled && currentAgent==='talk' && services.api.talk){
      return services.api.talk(question,outboundHistory,options).then(function(result){return applyResult(result);}).catch(function(error){
        var fallback=localAnswer(question);
        return '<div class="namaa-answer-head"><span>Namaa backup</span><strong>Temporary issue</strong></div><p>Namaa used a local backup response so the conversation stays smooth.</p>'+fallback;
      });
    }
    if(apiEnabled && currentAgent==='images' && services.api.images){
      return services.api.images(question,outboundHistory,options).then(function(result){return applyResult(result);}).catch(function(error){
        var fallback=localAnswer(question);
        return '<div class="namaa-answer-head"><span>Namaa backup</span><strong>Temporary issue</strong></div><p>Namaa Images used the local mockup panel so your design flow stays available.</p>'+fallback;
      });
    }
    if(apiEnabled && currentAgent==='dev' && services.api.dev){
      return services.api.dev(question,outboundHistory,options).then(function(result){return applyResult(result);}).catch(function(error){
        var fallback=localAnswer(question);
        return '<div class="namaa-answer-head"><span>Namaa backup</span><strong>Temporary issue</strong></div><p>NamaaDev used a local landing-page template so the preview stays available.</p>'+fallback;
      });
    }
    return Promise.resolve(localAnswer(question));
  }
  function updateAiMessage(wrap,html){
    if(!wrap)return;
    var bubble=wrap.querySelector('.namaa-bubble');
    if(bubble)bubble.innerHTML=html;
    wrap.classList.remove('is-loading');
    thread.scrollTop=thread.scrollHeight;
  }
  function submit(){
    var q=input.value.trim();
    if(!q){input.focus();return;}
    document.body.classList.add('namaa-has-messages');
    if(hero){hero.remove();hero=null;}
    addMessage('user',utils.escapeHtml(q));
    addHistory('user',q);
    input.value='';
    input.style.height='auto';
    closePlusMenu();
    var loading=addMessage('ai','<p>Namaa is typing...</p>');
    loading.classList.add('is-loading');
    answerAsync(q).then(function(html){
      if(currentAgent==='images' && appState.projectBrief){
        html+='<div class="namaa-flow-card namaa-next-step"><div><span>💻</span><strong>Mockup prêt. Voulez-vous une landing page simple ?</strong><p>NamaaDev peut créer un exemple HTML/CSS/JS basé sur le même brief.</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-flow-action="start-dev">Créer la landing page</button></div></div>';
      }
      updateAiMessage(loading,html);
      if(currentAgent==='talk'){appState.lastStrategyHtml=html;appState.lastStrategyText=html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
      addHistory('assistant',html.replace(/<[^>]*>/g,' '));
    }).catch(function(error){
      updateAiMessage(loading,'<p>Namaa had a temporary problem: '+utils.escapeHtml(error.message || 'Unknown error')+'</p>');
    });
  }
  function bindPromptButtons(scope){
    (scope||document).querySelectorAll('[data-prompt]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var prompt=this.getAttribute('data-prompt') || '';
        if(prompt==='Lancer le brief projet'){startIntakeWizard();return;}
        input.value=prompt;
        input.focus();
        input.dispatchEvent(new Event('input'));
      });
    });
  }

  form.addEventListener('submit',function(event){event.preventDefault();submit();});
  input.addEventListener('keydown',function(event){if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submit();}});
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,160)+'px';});
  bindPromptButtons(document);

  document.addEventListener('click',function(event){
    var devTab=event.target.closest('[data-dev-tab]');
    if(devTab){
      var root=devTab.closest('.namaa-dev-result');
      if(!root)return;
      var selected=devTab.getAttribute('data-dev-tab');
      root.querySelectorAll('[data-dev-tab]').forEach(function(tab){tab.classList.toggle('is-active',tab===devTab);});
      root.querySelectorAll('[data-dev-panel]').forEach(function(panel){panel.classList.toggle('is-active',panel.getAttribute('data-dev-panel')===selected);});
      return;
    }
    var copyBtn=event.target.closest('[data-dev-copy]');
    if(copyBtn){
      copyBtn.textContent='Copy in next update';
      copyBtn.disabled=true;
      return;
    }
    var pdfBtn=event.target.closest('[data-namaa-pdf]');
    if(pdfBtn){
      pdfBtn.disabled=true;
      pdfBtn.textContent='PDF opened';
      if(services.pdf && services.pdf.openStrategy){services.pdf.openStrategy({brief:appState.projectBrief,strategyHtml:appState.lastStrategyHtml,strategyText:appState.lastStrategyText});}
      setAgent('images');
      addMessage('ai','<div class="namaa-flow-card namaa-next-step"><div><span>🎨</span><strong>PDF prêt. Passons au mockup.</strong><p>Voulez-vous me donner une idée précise, ou laisser Namaa être créatif pour votre projet ?</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-flow-action="creative-mockup">Laisse Namaa être créatif</button><button class="namaa-mini-button secondary" type="button" data-flow-action="custom-mockup">J’ai une idée</button></div></div>');
      return;
    }
    var flowBtn=event.target.closest('[data-flow-action]');
    if(flowBtn){
      var action=flowBtn.getAttribute('data-flow-action');
      if(action==='guided-intake'){startIntakeWizard();return;}
      if(action==='creative-mockup'){
        setAgent('images');
        input.value=buildMockupPrompt(appState.projectBrief || {},'');
        input.dispatchEvent(new Event('input'));
        submit();
        return;
      }
      if(action==='custom-mockup'){
        setAgent('images');
        input.value='';
        input.placeholder='Décrivez votre idée de mockup pour '+((appState.projectBrief && appState.projectBrief.projectName) || 'votre projet')+'...';
        input.focus();
        return;
      }
      if(action==='start-dev'){
        setAgent('dev');
        input.value=buildDevPrompt(appState.projectBrief || {});
        input.dispatchEvent(new Event('input'));
        submit();
        return;
      }
    }
  });


  document.addEventListener('click',function(event){
    var modal=event.target.closest('.namaa-intake-modal');
    if(event.target.closest('[data-intake-close]') || event.target.classList.contains('namaa-intake-backdrop')){closeIntakeWizard();return;}
    var opt=event.target.closest('[data-intake-option]');
    if(opt && modal){
      var index=parseInt(modal.dataset.step || '0',10);
      var step=getIntakeStep(index);
      if(step.multi){
        if(opt.textContent.trim()==='Aucun canal'){
          modal.querySelectorAll('[data-intake-option]').forEach(function(btn){btn.classList.remove('is-selected');});
        }else{
          var none=[].slice.call(modal.querySelectorAll('[data-intake-option]')).find(function(btn){return btn.textContent.trim()==='Aucun canal';});
          if(none)none.classList.remove('is-selected');
        }
        opt.classList.toggle('is-selected');
      }else{
        modal.querySelectorAll('[data-intake-option]').forEach(function(btn){btn.classList.remove('is-selected');});
        opt.classList.add('is-selected');
      }
      return;
    }
    if(event.target.closest('[data-intake-back]') && modal){
      var current=parseInt(modal.dataset.step || '0',10);
      if(current>0)renderIntakeWizard(current-1);
      return;
    }
    if(event.target.closest('[data-intake-next]') && modal){
      var i=parseInt(modal.dataset.step || '0',10);
      if(!saveIntakeStep(i))return;
      if(i>=intakeSteps.length-1){finishIntake();}else{renderIntakeWizard(i+1);}
      return;
    }
  });
  document.addEventListener('keydown',function(event){
    var modal=document.querySelector('.namaa-intake-modal');
    if(!modal)return;
    if(event.key==='Enter' && !event.shiftKey){
      var next=modal.querySelector('[data-intake-next]');
      if(next){event.preventDefault();next.click();}
    }
  });

  document.querySelectorAll('[data-agent]').forEach(function(btn){btn.addEventListener('click',function(){setAgent(this.getAttribute('data-agent'));});});
  document.querySelectorAll('[data-sidebar-action]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var action=this.getAttribute('data-sidebar-action');
      document.querySelectorAll('[data-sidebar-action]').forEach(function(el){el.classList.remove('is-active');});
      this.classList.add('is-active');
      if(action==='new-chat'){
        resetChat();
      }else if(action==='search'){
        setSidebarNote('⌕','Search chats','This feature will help find saved conversations later.');
      }else if(action==='library'){
        setSidebarNote('▥','Namaa Library','Templates and Moroccan business examples will appear here later.');
      }else if(action==='more'){
        var status=services.api && services.api.status ? services.api.status() : {model:'gpt-5.4-nano'};
        setSidebarNote('•••','More','More Namaa workspace actions will appear here later.');
      }
    });
  });

  if(plusBtn&&plusMenu){
    plusBtn.addEventListener('click',function(event){
      event.stopPropagation();
      var open=plusMenu.hidden;
      plusMenu.hidden=!open;
      plusBtn.setAttribute('aria-expanded',open?'true':'false');
      if(open)closeSidebar();
    });
  }
  document.addEventListener('click',function(event){
    if(plusMenu && !plusMenu.hidden && !event.target.closest('.namaa-plus-wrap'))closePlusMenu();
  });
  document.addEventListener('keydown',function(event){
    if(event.key==='Escape'){
      closePlusMenu();
      closeSidebar();
      closePreview();
    }
  });
  document.querySelectorAll('[data-plus-action="upload"]').forEach(function(btn){
    btn.addEventListener('click',function(){closePlusMenu();if(fileInput)fileInput.click();});
  });
  if(fileInput){
    fileInput.addEventListener('change',function(){
      if(!fileInput.files || !fileInput.files.length)return;
      document.body.classList.add('namaa-has-messages');
      if(hero){hero.remove();hero=null;}
      addMessage('ai',services.upload.placeholder(fileInput.files));
      fileInput.value='';
    });
  }
  if(previewClose)previewClose.addEventListener('click',closePreview);
  if(sidebarToggle)sidebarToggle.addEventListener('click',openSidebar);
  if(sidebarClose)sidebarClose.addEventListener('click',closeSidebar);
  if(sidebarBackdrop)sidebarBackdrop.addEventListener('click',closeSidebar);
  window.addEventListener('resize',function(){if(window.innerWidth>1120)closeSidebar();});

  setSidebarExpanded(false);
  syncAgentButtons(currentAgent);
  document.body.setAttribute('data-namaa-agent',currentAgent);
})(window,document);
