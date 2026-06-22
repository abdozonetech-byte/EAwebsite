(function(window,document){
  'use strict';
  var config=window.NamaaConfig || {};
  var utils=window.NamaaUtils || {escapeHtml:function(value){return String(value || '');}};
  var services=window.NamaaServices || {};
  var agents=window.NamaaAgents || {};
  var brain=window.NamaaBrain || {};

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
  var appState={lastTalkQuestion:'',lastDevFiles:null,projectBrief:null,lastStrategyText:'',lastStrategyHtml:'',flowStage:'intake',lastMockupQuestion:'',lastDevQuestion:'',lastDeliverableType:'',createdDocuments:{}};

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
    return '<div class="namaa-factory-strip" aria-label="Namaa project factory steps">'+
      '<span><b>01</b> Brief</span><span><b>02</b> Strategy PDF</span><span><b>03</b> Logo + mockups</span><span><b>04</b> Landing page</span>'+
    '</div>'+
    '<div class="namaa-guided-card namaa-guided-card-premium">'+
      '<div><span class="namaa-guided-pill">Project Factory</span><h2>Commencez par un brief guidé</h2><p>Namaa collecte فقط المعلومات المهمة، ومن بعد يخرج لك strategy واضحة ومنظمة.</p></div>'+ 
      '<button class="namaa-mini-button" type="button" data-flow-action="guided-intake">Lancer la création</button>'+ 
    '</div>';
  }

  function flowProgressHtml(active){
    var order=['brief','strategy','images','dev'];
    var labels={brief:'Brief',strategy:'Strategy PDF',images:'Logo + mockups',dev:'Landing page'};
    var icons={brief:'01',strategy:'02',images:'03',dev:'04'};
    var activeIndex=Math.max(0,order.indexOf(active || 'brief'));
    return '<div class="namaa-flow-progress" aria-label="Namaa automatic project flow">'+order.map(function(step,index){
      var klass=index<activeIndex?'is-done':index===activeIndex?'is-active':'';
      return '<span class="'+klass+'"><b>'+icons[step]+'</b>'+labels[step]+'</span>';
    }).join('')+'</div>';
  }
  function pdfDocLabel(type){
    var labels={market_research:'Market Research PDF',marketing_strategy:'Marketing Strategy PDF',roadmap:'Launch Roadmap PDF'};
    return labels[type] || 'Namaa PDF';
  }
  function pdfReadyCardHtml(){
    var type=appState.lastDeliverableType || 'marketing_strategy';
    var label=pdfDocLabel(type);
    var nextText=type==='market_research' ? 'Après téléchargement, Namaa vous proposera de transformer ce diagnostic en Marketing Strategy PDF.' : (type==='roadmap' ? 'Après téléchargement, Namaa vous proposera la stratégie marketing détaillée ou le mockup.' : 'Après téléchargement, Namaa vous proposera le logo et les mockups adaptés au projet.');
    return flowProgressHtml('strategy')+
      '<div class="namaa-pdf-card namaa-flow-card namaa-pdf-ready-card" data-current-pdf-type="'+utils.escapeHtml(type)+'"><div><span>📄</span><strong>'+utils.escapeHtml(label)+' prêt</strong><p>Le document est brandé Namaa + Elboubakry : logo, couverture, brief, contenu structuré et prochaines étapes. '+utils.escapeHtml(nextText)+'</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button secondary" type="button" data-namaa-pdf-preview="true">Aperçu PDF</button><button class="namaa-mini-button" type="button" data-namaa-pdf="true">Télécharger le PDF</button></div></div>';
  }
  function documentChoiceCardHtml(){
    return flowProgressHtml('strategy')+
      '<div class="namaa-action-card namaa-controller-card namaa-document-choice"><div><span>🧠</span><strong>Brief prêt. On choisit le bon document.</strong><p>Namaa ما غاديش يخرج وثيقة طويلة بلا موافقتك. اختار شنو بغيتي نوجد ليك ونمشي خطوة بخطوة.</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-talk-action="market_research"><span>🔎</span>Market Research PDF</button><button class="namaa-mini-button" type="button" data-talk-action="marketing_strategy"><span>📈</span>Marketing Strategy PDF</button><button class="namaa-mini-button secondary" type="button" data-talk-action="roadmap"><span>🗺️</span>Roadmap PDF</button></div></div>';
  }
  function imagesEntryCardHtml(){
    return flowProgressHtml('images')+
      '<div class="namaa-flow-card namaa-next-step namaa-agent-handoff"><div><span>🎨</span><strong>PDF téléchargé. Passons au mockup.</strong><p>Je peux créer un pack visuel adapté à votre catégorie : logo concept, mockup principal, social/flyer et direction premium. Vous avez une idée précise ou je laisse Namaa être créatif ?</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-flow-action="creative-mockup">Laisse Namaa être créatif</button><button class="namaa-mini-button secondary" type="button" data-flow-action="custom-mockup">J’ai une idée</button></div></div>';
  }
  function marketToStrategyCardHtml(){
    return flowProgressHtml('strategy')+
      '<div class="namaa-flow-card namaa-next-step namaa-agent-handoff namaa-handoff-choice"><div><span>📈</span><strong>Market research téléchargé. On transforme ça en stratégie ?</strong><p>Le diagnostic marché est prêt. La suite logique est une Marketing Strategy PDF avec plan 30 jours, budget, contenu, WhatsApp et KPIs. Vous pouvez aussi passer directement au mockup.</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-flow-action="create-marketing-strategy">Créer Marketing Strategy</button><button class="namaa-mini-button secondary" type="button" data-flow-action="skip-to-images">Passer au mockup</button></div></div>';
  }
  function roadmapToNextCardHtml(){
    return flowProgressHtml('strategy')+
      '<div class="namaa-flow-card namaa-next-step namaa-agent-handoff namaa-handoff-choice"><div><span>🗺️</span><strong>Roadmap téléchargée. Quelle suite ?</strong><p>Vous avez le plan d’exécution. Namaa peut maintenant préparer la stratégie marketing détaillée ou passer au pack visuel.</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-flow-action="create-marketing-strategy">Créer Marketing Strategy</button><button class="namaa-mini-button secondary" type="button" data-flow-action="skip-to-images">Passer au mockup</button></div></div>';
  }
  function strategyToImagesCardHtml(){
    return flowProgressHtml('images')+
      '<div class="namaa-flow-card namaa-next-step namaa-agent-handoff namaa-handoff-choice"><div><span>🎨</span><strong>Stratégie téléchargée. On crée l’identité visuelle ?</strong><p>Maintenant Namaa Images peut générer un logo concept et les bons mockups selon la catégorie du projet. Vous avez une idée précise ou je laisse Namaa être créatif ?</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-flow-action="creative-mockup">Laisse Namaa être créatif</button><button class="namaa-mini-button secondary" type="button" data-flow-action="custom-mockup">J’ai une idée</button></div></div>';
  }
  function imageNextStepHtml(){
    return flowProgressHtml('images')+
      '<div class="namaa-flow-card namaa-next-step namaa-agent-handoff"><div><span>💻</span><strong>Mockup prêt. On crée la landing page ?</strong><p>NamaaDev peut transformer le même brief en un exemple réel HTML/CSS/JS avec preview desktop/mobile et fichiers téléchargeables.</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-flow-action="start-dev">Créer la landing page</button><button class="namaa-mini-button secondary" type="button" data-flow-action="custom-mockup">Modifier le mockup</button></div></div>';
  }
  function devFinishHtml(){
    return flowProgressHtml('dev')+
      '<div class="namaa-flow-card namaa-next-step namaa-final-card"><div><span>✅</span><strong>Pack projet prêt.</strong><p>Vous avez maintenant la stratégie, le mockup et une landing page simple. Prochaine étape : tester l’offre, brancher WhatsApp/lead form, puis lancer un petit test ads.</p></div><div class="namaa-flow-actions"><a class="namaa-mini-button" href="/reserver-diagnostic/">Demander l’aide d’Abdessamad</a><button class="namaa-mini-button secondary" type="button" data-flow-action="new-project-flow">Nouveau projet</button></div></div>';
  }
  var intakeSteps=[
    {key:'projectName',type:'input',maxLength:60,label:'Quel est le nom de votre projet ?',hint:'Écrivez le nom exactement comme vous voulez l’utiliser.',placeholder:'Exemple : Namaa Kids',footer:'Nom du projet'},
    {key:'stage',label:'Où en est le projet ?',hint:'Choisissez l’étape la plus proche pour préparer le bon pack.',footer:'Étape du projet',options:['Nouveau projet à lancer','Idée initiale à transformer en projet','Projet existant à relancer']},
    {key:'category',label:'Dans quel type entre votre projet ?',hint:'Choisissez la catégorie principale. Namaa affichera ensuite des choix plus précis.',footer:'Type de projet',options:['E-commerce / vente de produits','Clinique / médical','Restaurant / food','SaaS / application','Agence / service pro','Service local','Formation / cours','Immobilier','Beauté / lifestyle','Tourisme / hébergement']},
    {key:'branch',label:'Choisissez la branche',hint:'Sélectionnez la branche qui correspond le mieux au projet.',footer:'Branche',dynamic:true},
    {key:'market',label:'Où le projet démarre-t-il au Maroc ?',hint:'Choisissez tout le Maroc ou une ville précise. Namaa l’utilise pour l’analyse locale et la concurrence.',footer:'Marché',options:['Maroc entier','Casablanca','Rabat','Marrakech','Tanger','Agadir','Fès','Meknès','Kénitra','Oujda','Taroudant']},
    {key:'budget',label:'Quel budget mensuel marketing ?',hint:'Sélectionnez une fourchette réaliste en MAD pour éviter les réponses trop générales.',footer:'Budget',options:['Moins de 1000 DH','1000 - 3000 DH','3000 - 7000 DH','7000 - 15000 DH','Plus de 15000 DH','Pas encore défini']},
    {key:'goal',label:'Quel est l’objectif principal ?',hint:'Choisissez le résultat prioritaire. Namaa va construire la stratégie autour de cet objectif.',footer:'Objectif',options:['Trouver les premiers clients','Générer des leads WhatsApp','Vendre plus en ligne','Lancer une offre claire','Créer une landing page','Améliorer la visibilité','Structurer le marketing']},
    {key:'target',label:'Qui est le client cible ?',hint:'Choisissez la cible principale pour que le message soit précis.',footer:'Cible',options:['Clients locaux proches','PME / professionnels','Familles','Jeunes / étudiants','Femmes intéressées beauté','Acheteurs Instagram/TikTok','Touristes / visiteurs','Pas encore défini']},
    {key:'offer',type:'input',maxLength:180,label:'Quelle est l’offre principale ?',hint:'Une phrase courte suffit. Exemple : diagnostic gratuit, livraison rapide, pack mensuel, réservation WhatsApp...',placeholder:'Exemple : consultation gratuite + plan marketing 30 jours',footer:'Offre'},
    {key:'channels',label:'Quels canaux avez-vous déjà ?',hint:'Vous pouvez choisir plusieurs canaux. Cliquez Suivant quand c’est bon.',footer:'Canaux',multi:true,options:['Aucun canal','Instagram','TikTok','Facebook','WhatsApp','Site web','Google Maps','Publicité déjà lancée']},
    {key:'language',label:'Dans quel style Namaa doit répondre ?',hint:'Choisissez la langue principale du PDF et de la conversation.',footer:'Langue',options:['Français professionnel','Darija simple','Français + Darija','العربية','English']}
  ];
  var branchMap={
    'Clinique / médical':['Dentiste','Clinique esthétique','Dermatologie','Kinésithérapie','Centre ophtalmologique','Laboratoire','Médecin spécialiste'],
    'E-commerce / vente de produits':['Mode / vêtements','Cosmétiques','Produits alimentaires','Électronique','Maison / déco','Produit artisanal','Produit unique à tester'],
    'Restaurant / food':['Restaurant','Café','Fast food','Pâtisserie','Traiteur','Dark kitchen','Food truck'],
    'SaaS / application':['Application mobile','SaaS B2B','Marketplace','IA / automatisation','EdTech','FinTech','Outil interne'],
    'Agence / service pro':['Marketing digital','Design / branding','Développement web','Consulting','Comptabilité','Architecture','Photographie / vidéo'],
    'Service local':['Nettoyage','Déménagement','Réparation','Beauté à domicile','Coaching','Livraison','Maintenance'],
    'Formation / cours':['École privée','Cours de langue','Formation digitale','Coaching professionnel','Centre de soutien','Formation IA'],
    'Immobilier':['Agence immobilière','Projet locatif','Promotion immobilière','Gestion Airbnb','Courtier','Bureau de vente'],
    'Beauté / lifestyle':['Salon de beauté','Barbershop','Spa / bien-être','Coach lifestyle','Cosmétiques locaux','Personal brand beauté'],
    'Tourisme / hébergement':['Riad','Hôtel boutique','Agence voyage','Expérience locale','Restaurant touristique','Airbnb premium']
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
  function briefRows(brief){
    brief=brief || {};
    return [
      ['Nom',brief.projectName],
      ['Étape',brief.stage],
      ['Type',brief.category],
      ['Branche',brief.branch],
      ['Marché',brief.market],
      ['Budget',brief.budget],
      ['Objectif',brief.goal],
      ['Cible',brief.target],
      ['Offre',brief.offer],
      ['Canaux',brief.channels],
      ['Langue',brief.language]
    ].filter(function(row){return briefValue(row[1]);});
  }
  function briefScore(brief){
    var required=['projectName','stage','category','branch','market','budget','goal','target','offer','channels','language'];
    var filled=required.filter(function(key){return briefValue(brief && brief[key]);}).length;
    return Math.round((filled/required.length)*100);
  }
  function formatBrief(brief){
    if(!brief)return '';
    return briefRows(brief).map(function(row){
      var value=briefValue(row[1]);
      if(value.length>240)value=value.slice(0,240)+'…';
      return row[0]+': '+value;
    }).join('\n');
  }
  function compactBrief(brief){
    return briefRows(brief).map(function(row){
      var key=row[0].toLowerCase();
      var value=briefValue(row[1]).replace(/\s+/g,' ').trim();
      if(value.length>160)value=value.slice(0,160)+'…';
      return key+'='+value;
    }).join(' | ');
  }
  function briefSummaryHtml(brief){
    var rows=briefRows(brief).map(function(row){return '<div><dt>'+utils.escapeHtml(row[0])+'</dt><dd>'+utils.escapeHtml(briefValue(row[1]))+'</dd></div>';}).join('');
    return '<div class="namaa-brief-summary namaa-brief-summary-v17"><span>Brief projet contrôlé</span><strong>'+utils.escapeHtml(brief.projectName || 'Projet sans nom')+'</strong><em class="namaa-brief-score">'+briefScore(brief)+'% prêt</em><dl>'+rows+'</dl></div>';
  }
  function buildStrategyPrompt(brief){
    return 'Create the Namaa Market Search + Strategy PDF draft from this compact structured brief.\n'+compactBrief(brief)+'\n\nRules: Morocco-focused, practical, short paragraphs, no generic theory, no fake statistics, no extra questions unless a critical field is missing. Use the requested language style. Required sections: Résumé exécutif, Mini market search Maroc, Cible et positionnement, Offre et message, Plan marketing 30 jours, Budget recommandé, Scripts WhatsApp + contenu, KPI et prochaine étape. Output max 820 words.';
  }
  function buildMockupPrompt(brief,custom){
    var pack=brain.getMockupPack ? brain.getMockupPack(custom || '',brief) : null;
    var assets=pack && pack.assets ? pack.assets.join(', ') : 'logo concept, landing page mockup, social media ad, WhatsApp CTA';
    var base='Create a premium Namaa Images mockup board for this Moroccan project. Compact brief: '+compactBrief(brief)+'\nCategory pack: '+(pack ? pack.label : 'Business Maroc')+'\nRequired visual assets in one board: '+assets+'\nPrimary mockup: '+(pack ? pack.primaryAsset : 'landing page + social creative')+'\nLogo direction: '+(pack ? pack.logoIdea : 'simple premium blue business logo')+'\nStyle: '+(pack ? pack.style : 'clean, modern, high-converting, blue/white premium')+'\nKeep text minimal and readable. Make it professional, beautiful, and category-specific.';
    return custom ? base+'\nUser idea: '+custom : base+'\nBe creative and choose the best visual direction for this category.';
  }
  function buildDevPrompt(brief){
    var template=(window.NamaaDevTemplates && window.NamaaDevTemplates.get) ? window.NamaaDevTemplates.get('',brief) : null;
    var templateLine=template ? ('\nSelected NamaaDev template: '+template.label+' · '+template.layout+' · sections: '+template.sections.join(', ')) : '';
    return 'Create a simple responsive landing page HTML/CSS/JS example for this Moroccan project. Compact brief: '+compactBrief(brief)+templateLine+'\nUse the selected category template, not a generic page. Keep it clean, professional, mobile-friendly.';
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
      return '<input class="namaa-intake-input" data-intake-input value="'+utils.escapeHtml(value)+'" placeholder="'+utils.escapeHtml(step.placeholder || '')+'" '+(step.maxLength?'maxlength="'+step.maxLength+'"':'')+'>'+ (step.maxLength?'<small class="namaa-token-note">Max '+step.maxLength+' caractères pour garder le brief précis.</small>':'');
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
      if(step.maxLength && val.length>step.maxLength){val=val.slice(0,step.maxLength).trim();}
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
    appState.flowStage='brief-ready';
    closeIntakeWizard();
    setAgent('talk');
    document.body.classList.add('namaa-has-messages');
    if(hero){hero.remove();hero=null;}
    var summary=briefSummaryHtml(appState.projectBrief);
    addMessage('user',summary);
    addHistory('user',formatBrief(appState.projectBrief));
    var ready='<p>Parfait. J’ai maintenant un brief clair. Je ne vais pas générer un long document sans votre accord.</p><p>اختار الوثيقة اللي بغيتي Namaa يوجّدها ليك دابا.</p>'+documentChoiceCardHtml();
    addMessage('ai','<div class="namaa-answer-head"><span>Namaa Talk</span><strong>Brief contrôlé</strong></div>'+ready);
    addHistory('assistant','Brief prêt. Choisissez Market Research, Marketing Strategy ou Roadmap.');
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
    appState.lastMockupQuestion='';
    appState.lastDevQuestion='';
    appState.lastDeliverableType='';
    appState.createdDocuments={};
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
    setSidebarNote('＋','New project','Start a guided brief with token control before strategy, mockup and landing page.');
    input.focus();
  }
  function applyResult(result){
    if(result && result.state){
      if(result.state.projectBriefPatch){
        appState.projectBrief=Object.assign({},appState.projectBrief || {},result.state.projectBriefPatch || {});
      }
      Object.keys(result.state).forEach(function(key){
        if(key!=='projectBriefPatch')appState[key]=result.state[key];
      });
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
        return '<div class="namaa-answer-head"><span>Namaa Talk</span><strong>Réponse locale</strong></div><p>Petit souci de connexion, mais Namaa garde la discussion fluide.</p>'+fallback;
      });
    }
    if(apiEnabled && currentAgent==='images' && services.api.images){
      return services.api.images(question,outboundHistory,options).then(function(result){return applyResult(result);}).catch(function(error){
        var fallback=localAnswer(question);
        return '<div class="namaa-answer-head"><span>Namaa Images</span><strong>Mockup local</strong></div><p>Petit souci de génération image, Namaa affiche une direction mockup locale.</p>'+fallback;
      });
    }
    if(apiEnabled && currentAgent==='dev' && services.api.dev){
      return services.api.dev(question,outboundHistory,options).then(function(result){return applyResult(result);}).catch(function(error){
        var fallback=localAnswer(question);
        return '<div class="namaa-answer-head"><span>NamaaDev</span><strong>Template local</strong></div><p>Petit souci de génération, Namaa prépare quand même un exemple de landing page.</p>'+fallback;
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

  function devStore(root,type){
    var el=root && root.querySelector('[data-dev-store="'+type+'"]');
    return el ? el.value : '';
  }
  function devActivePanel(root){
    return root ? root.querySelector('[data-dev-panel].is-active') : null;
  }
  function safeFileName(value){
    return String(value || 'namaa-landing-page').toLowerCase().replace(/[^a-z0-9\u00c0-\u017f]+/g,'-').replace(/^-+|-+$/g,'').slice(0,54) || 'namaa-landing-page';
  }
  function copyText(text,button){
    text=String(text || '');
    if(!text.trim())return;
    var old=button ? button.textContent : '';
    function done(){if(button){button.textContent='Copied ✓';setTimeout(function(){button.textContent=old;},1400);}}
    if(navigator.clipboard && navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done).catch(function(){fallbackCopy(text);done();});}
    else{fallbackCopy(text);done();}
  }
  function fallbackCopy(text){
    var area=document.createElement('textarea');
    area.value=text;
    area.setAttribute('readonly','');
    area.style.position='fixed';
    area.style.left='-9999px';
    document.body.appendChild(area);
    area.select();
    try{document.execCommand('copy');}catch(error){}
    area.remove();
  }
  function buildAllDevCode(root){
    return '/* index.html */\n'+devStore(root,'html')+'\n\n/* style.css */\n'+devStore(root,'css')+'\n\n/* script.js */\n'+devStore(root,'js');
  }
  function downloadBlob(name,text,type){
    var blob=new Blob([String(text || '')],{type:type || 'text/plain;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;
    a.download=name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1200);
  }
  function downloadDevFiles(root,button){
    if(!root)return;
    var base=safeFileName(root.getAttribute('data-project-title'));
    var old=button ? button.textContent : '';
    downloadBlob(base+'-index.html',devStore(root,'preview') || devStore(root,'html'),'text/html;charset=utf-8');
    setTimeout(function(){downloadBlob(base+'-style.css',devStore(root,'css'),'text/css;charset=utf-8');},180);
    setTimeout(function(){downloadBlob(base+'-script.js',devStore(root,'js'),'application/javascript;charset=utf-8');},360);
    if(button){button.textContent='Downloading ✓';setTimeout(function(){button.textContent=old;},1600);}
  }
  function openDevPreview(root){
    var doc=devStore(root,'preview');
    var win=window.open('','_blank','noopener,noreferrer');
    if(win){win.document.open();win.document.write(doc || '<!doctype html><title>NamaaDev</title><p>No preview available.</p>');win.document.close();}
  }
  function generateTalkDeliverable(action){
    var labels={market_research:'Market Research PDF',marketing_strategy:'Marketing Strategy PDF',roadmap:'Launch Roadmap'};
    var brief=appState.projectBrief || {};
    var label=labels[action] || 'Namaa PDF';
    appState.lastDeliverableType=action;
    appState.createdDocuments=appState.createdDocuments || {};
    setAgent('talk');
    document.body.classList.add('namaa-has-messages');
    if(hero){hero.remove();hero=null;}
    var prompt='Créer '+label+' pour '+(brief.projectName || 'ce projet');
    addMessage('user',utils.escapeHtml(prompt));
    addHistory('user',prompt);
    var loading=addMessage('ai','<div class="namaa-typing"><span></span><span></span><span></span><em>Namaa prépare '+utils.escapeHtml(label)+'...</em></div>');
    loading.classList.add('is-loading');
    answerAsync(prompt,{brief:brief,history:[],action:action}).then(function(html){
      appState.flowStage='pdf-ready';
      appState.lastDeliverableType=action;
      appState.createdDocuments=appState.createdDocuments || {};
      appState.createdDocuments[action]=true;
      appState.lastStrategyHtml=html;
      appState.lastStrategyText=html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
      updateAiMessage(loading,html+pdfReadyCardHtml());
      addHistory('assistant',appState.lastStrategyText);
    }).catch(function(error){
      updateAiMessage(loading,'<p>Namaa had a temporary problem: '+utils.escapeHtml(error.message || 'Unknown error')+'</p>');
    });
  }

  function typingLoadingHtml(agent){
    var labels={talk:'Namaa kayفكر شوية...',images:'Namaa kayوجد mockup...',dev:'NamaaDev kayبني preview...'};
    return '<div class="namaa-typing"><span></span><span></span><span></span><em>'+utils.escapeHtml(labels[agent] || 'Namaa kayكتب...')+'</em></div>';
  }
  function waitForHumanTyping(started,agent){
    var minimum=agent==='talk'?760:520;
    var elapsed=Date.now()-started;
    var delay=Math.max(0,minimum-elapsed);
    return new Promise(function(resolve){setTimeout(resolve,delay);});
  }
  function submit(){
    var q=input.value.trim();
    if(!q){input.focus();return;}
    var submittedAgent=currentAgent;
    document.body.classList.add('namaa-has-messages');
    if(hero){hero.remove();hero=null;}
    addMessage('user',utils.escapeHtml(q));
    addHistory('user',q);
    input.value='';
    input.style.height='auto';
    closePlusMenu();
    var loading=addMessage('ai',typingLoadingHtml(submittedAgent));
    loading.classList.add('is-loading');
    var startedAt=Date.now();
    answerAsync(q,{brief:appState.projectBrief || null}).then(function(html){
      return waitForHumanTyping(startedAt,submittedAgent).then(function(){return html;});
    }).then(function(html){
      if(submittedAgent==='images' && appState.projectBrief){
        appState.flowStage='dev-offer';
        appState.lastMockupQuestion=q;
        html+=imageNextStepHtml();
      }
      if(submittedAgent==='dev' && appState.projectBrief){
        appState.flowStage='complete';
        appState.lastDevQuestion=q;
        html+=devFinishHtml();
      }
      updateAiMessage(loading,html);
      if(submittedAgent==='talk' && appState.lastDeliverableType){appState.lastStrategyHtml=html;appState.lastStrategyText=html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
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
    var talkActionBtn=event.target.closest('[data-talk-action]');
    if(talkActionBtn){
      var talkAction=talkActionBtn.getAttribute('data-talk-action');
      if(talkAction==='guided_brief'){startIntakeWizard();return;}
      generateTalkDeliverable(talkAction);
      return;
    }
    var devTab=event.target.closest('[data-dev-tab]');
    if(devTab){
      var root=devTab.closest('.namaa-dev-result');
      if(!root)return;
      var selected=devTab.getAttribute('data-dev-tab');
      root.querySelectorAll('[data-dev-tab]').forEach(function(tab){tab.classList.toggle('is-active',tab===devTab);});
      root.querySelectorAll('[data-dev-panel]').forEach(function(panel){panel.classList.toggle('is-active',panel.getAttribute('data-dev-panel')===selected);});
      return;
    }
    var deviceBtn=event.target.closest('[data-dev-device]');
    if(deviceBtn){
      var deviceRoot=deviceBtn.closest('.namaa-dev-result');
      if(!deviceRoot)return;
      var device=deviceBtn.getAttribute('data-dev-device') || 'desktop';
      deviceRoot.setAttribute('data-device',device);
      deviceRoot.querySelectorAll('[data-dev-device]').forEach(function(btn){btn.classList.toggle('is-active',btn===deviceBtn);});
      return;
    }
    var openDevBtn=event.target.closest('[data-dev-open]');
    if(openDevBtn){
      openDevPreview(openDevBtn.closest('.namaa-dev-result'));
      return;
    }
    var copyBtn=event.target.closest('[data-dev-copy]');
    if(copyBtn){
      var copyRoot=copyBtn.closest('.namaa-dev-result');
      var mode=copyBtn.getAttribute('data-dev-copy');
      var text='';
      if(mode==='all'){
        text=buildAllDevCode(copyRoot);
      }else{
        var active=devActivePanel(copyRoot);
        var type=active ? active.getAttribute('data-dev-panel') : 'html';
        text=type==='preview' ? devStore(copyRoot,'preview') : devStore(copyRoot,type);
      }
      copyText(text,copyBtn);
      return;
    }
    var downloadBtn=event.target.closest('[data-dev-download]');
    if(downloadBtn){
      downloadDevFiles(downloadBtn.closest('.namaa-dev-result'),downloadBtn);
      return;
    }
    var pdfPreviewBtn=event.target.closest('[data-namaa-pdf-preview]');
    if(pdfPreviewBtn){
      var currentPdfType=appState.lastDeliverableType || 'marketing_strategy';
      var previewHtml=services.pdf && services.pdf.renderStrategyPreview ? services.pdf.renderStrategyPreview({brief:appState.projectBrief,strategyHtml:appState.lastStrategyHtml,strategyText:appState.lastStrategyText,documentType:currentPdfType}) : '<p>PDF preview is not ready yet.</p>';
      openPreview('Namaa PDF',pdfDocLabel(currentPdfType),previewHtml);
      return;
    }
    var pdfBtn=event.target.closest('[data-namaa-pdf]');
    if(pdfBtn){
      pdfBtn.disabled=true;
      pdfBtn.textContent='PDF téléchargé';
      var downloadedType=appState.lastDeliverableType || 'marketing_strategy';
      if(services.pdf && services.pdf.openStrategy){services.pdf.openStrategy({brief:appState.projectBrief,strategyHtml:appState.lastStrategyHtml,strategyText:appState.lastStrategyText,documentType:downloadedType});}
      appState.createdDocuments=appState.createdDocuments || {};
      appState.createdDocuments[downloadedType]=true;
      if(downloadedType==='market_research'){
        appState.flowStage='strategy-offer';
        setAgent('talk');
        addMessage('ai',marketToStrategyCardHtml());
      }else if(downloadedType==='roadmap'){
        appState.flowStage='strategy-or-images';
        setAgent('talk');
        addMessage('ai',roadmapToNextCardHtml());
      }else{
        appState.flowStage='images-offer';
        setAgent('images');
        addMessage('ai',strategyToImagesCardHtml());
      }
      return;
    }
    var flowBtn=event.target.closest('[data-flow-action]');
    if(flowBtn){
      var action=flowBtn.getAttribute('data-flow-action');
      if(action==='guided-intake'){startIntakeWizard();return;}
      if(action==='create-marketing-strategy'){
        generateTalkDeliverable('marketing_strategy');
        return;
      }
      if(action==='skip-to-images'){
        appState.flowStage='images-offer';
        setAgent('images');
        addMessage('ai',strategyToImagesCardHtml());
        return;
      }
      if(action==='creative-mockup'){
        appState.flowStage='images-generating';
        setAgent('images');
        input.value=buildMockupPrompt(appState.projectBrief || {},'');
        input.dispatchEvent(new Event('input'));
        submit();
        return;
      }
      if(action==='custom-mockup'){
        appState.flowStage='images-custom';
        setAgent('images');
        input.value='';
        input.placeholder='Décrivez votre idée de mockup pour '+((appState.projectBrief && appState.projectBrief.projectName) || 'votre projet')+'...';
        addMessage('ai','<div class="namaa-flow-card namaa-next-step namaa-agent-handoff"><div><span>🎯</span><strong>Dites-moi votre direction.</strong><p>Exemple : logo minimal, couleurs bleu/blanc, mockup SaaS desktop + mobile, flyer Instagram, roll-up professionnel.</p></div></div>');
        input.focus();
        return;
      }
      if(action==='start-dev'){
        appState.flowStage='dev-generating';
        setAgent('dev');
        input.value=buildDevPrompt(appState.projectBrief || {});
        input.dispatchEvent(new Event('input'));
        submit();
        return;
      }
      if(action==='new-project-flow'){
        resetChat();
        window.setTimeout(function(){startIntakeWizard();},120);
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
        setSidebarNote('⌕','Search projects','This feature will help find saved project briefs later.');
      }else if(action==='library'){
        setSidebarNote('▥','Factory Library','NamaaDev now includes templates for SaaS, restaurant, ecommerce, clinic, agency, local service, education, real estate, beauty, tourism and AI business.');
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
