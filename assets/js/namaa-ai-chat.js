(function(window,document){
  'use strict';
  var config=window.NamaaConfig || {};
  var utils=window.NamaaUtils || {escapeHtml:function(value){return String(value || '');}};
  var services=window.NamaaServices || {};
  var agents=window.NamaaAgents || {};
  var brain=window.NamaaBrain || {};
  var taxonomy=window.NamaaMarketTaxonomy || {};
  var taxonomyCategories=taxonomy.categoryOptions || null;
  var taxonomyCities=taxonomy.cityOptions || null;

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
  var appState={lastTalkQuestion:'',lastDevFiles:null,projectBrief:null,lastStrategyText:'',lastStrategyHtml:'',flowStage:'intake',lastMockupQuestion:'',lastDevQuestion:'',lastDeliverableType:'',createdDocuments:{},lastSources:[],sourcePolicy:''};
  window.NamaaRuntime=window.NamaaRuntime || {};
  window.NamaaRuntime.getState=function(){return Object.assign({},appState,{currentAgent:currentAgent});};
  function setFlowStage(stage){
    appState.flowStage=stage || 'intake';
    document.body.setAttribute('data-namaa-flow-stage',appState.flowStage);
    try{window.dispatchEvent(new CustomEvent('namaa:flow-stage',{detail:{stage:appState.flowStage,state:window.NamaaRuntime.getState()}}));}catch(error){}
  }
  setFlowStage(appState.flowStage);

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
      wrap.innerHTML='<div class="namaa-avatar">N</div><div class="namaa-bubble" dir="auto">'+html+'</div>';
    }else{
      wrap.innerHTML='<div class="namaa-bubble" dir="auto">'+html+'</div>';
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
  function factoryEntryHtml(){
    return '<div class="namaa-entry-grid" aria-label="Choisir le mode Namaa">'+
      '<button class="namaa-entry-card namaa-entry-talk" type="button" data-flow-action="free-talk-mode"><span>💬</span><strong>Free Talk</strong><small>Hder m3a Namaa 3la AI, business, IT, marketing. Quick and natural.</small><em>Conversation libre</em></button>'+ 
      '<button class="namaa-entry-card namaa-entry-build" type="button" data-flow-action="build-project-flow"><span>🏗️</span><strong>Build My Project</strong><small>Brief guidé → strategy PDF → logo/mockups → landing page.</small><em>Project factory</em></button>'+ 
    '</div>';
  }
  function agentMapHtml(){
    return '<div class="namaa-agent-map" aria-label="Namaa agent map">'+
      '<article><i>🧠</i><b>Namaa Talk</b><small>Free talk + project direction</small></article>'+ 
      '<article><i>📊</i><b>Strategy Agent</b><small>Market research / roadmap / PDF</small></article>'+ 
      '<article><i>🎨</i><b>Design Agent</b><small>Logo + category mockups</small></article>'+ 
      '<article><i>💻</i><b>Web Agent</b><small>Real HTML/CSS/JS preview</small></article>'+ 
    '</div>';
  }
  function entryChoiceHeroHtml(){
    return '<div class="namaa-choice-stage" aria-label="Namaa entry choice">'+
      '<div class="namaa-choice-badge"><span>✨</span><strong>Namaa Project Factory</strong><small>Free talk + project build</small></div>'+
      '<h2>شنو بغيتي نديرو اليوم؟</h2>'+
      '<p>اختار الطريقة اللي مريحة ليك: نهضرو بحرية على AI, business, IT, startups وmarketing، أو نبنيو مشروعك step by step مع Strategy, Design وWeb agents.</p>'+
      '<div class="namaa-entry-grid namaa-entry-grid-premium" aria-label="Choisir le mode Namaa">'+
        '<button class="namaa-entry-card namaa-entry-talk" type="button" data-flow-action="free-talk-mode"><span>💬</span><strong>Free Talk</strong><small>Hder m3a Namaa b Darija Latin, العربية, Français ola English. Quick, friendly, business-aware.</small><em>Conversation libre</em></button>'+ 
        '<button class="namaa-entry-card namaa-entry-build" type="button" data-flow-action="build-project-flow"><span>🏗️</span><strong>Build My Project</strong><small>اختيارات سهلة → brief واضح → PDF strategy → logo/mockups → landing page.</small><em>Guided factory</em></button>'+ 
      '</div>'+
      '<div class="namaa-language-strip" aria-label="Supported languages"><span>Darija Latin</span><span>العربية</span><span>Français</span><span>English</span></div>'+
    '</div>';
  }
  function guidedCtaHtml(){
    return entryChoiceHeroHtml()+
    '<div class="namaa-factory-strip" aria-label="Namaa project factory steps">'+
      '<span><b>01</b> Brief</span><span><b>02</b> Strategy</span><span><b>03</b> Design</span><span><b>04</b> Web</span>'+
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
  var intakeStepIcons={
    projectName:'✨',stage:'🚦',category:'🏷️',branch:'🧩',market:'🇲🇦',budget:'💰',goal:'🎯',target:'👥',offer:'🎁',channels:'📣',language:'🌍'
  };
  var optionIconMap={
    'Nouveau projet à lancer':'🚀','Idée initiale à transformer en projet':'💡','Projet existant à relancer':'🔁',
    'E-commerce / vente de produits':'🛒','Clinique / médical':'🏥','Restaurant / food':'🍽️','SaaS / application':'🤖','Agence / service pro':'💼','Service local':'🛠️','Formation / cours':'🎓','Immobilier':'🏠','Beauté / lifestyle':'✨','Tourisme / hébergement':'🏨','AI automation / IT':'⚙️','Marketplace':'🏪','Mobile app':'📱',
    'Maroc entier':'🇲🇦','Casablanca':'🏙️','Rabat':'🏛️','Marrakech':'🌴','Tanger':'🌊','Agadir':'☀️','Fès':'🕌','Meknès':'🏰','Kénitra':'🌿','Oujda':'🧭','Taroudant':'🌵','Tétouan':'🏔️','El Jadida':'🌊','Safi':'⚓','Béni Mellal':'⛰️','Nador':'🌊','Laâyoune':'🏜️','Autre ville / région':'✍️',
    'Moins de 1000 DH':'💸','1000 - 3000 DH':'💰','3000 - 7000 DH':'💰','7000 - 15000 DH':'💎','Plus de 15000 DH':'🏦','Pas encore défini':'❔',
    'Trouver les premiers clients':'🧲','Générer des leads WhatsApp':'🟢','Vendre plus en ligne':'🛒','Lancer une offre claire':'🎁','Créer une landing page':'💻','Améliorer la visibilité':'📣','Structurer le marketing':'📊','Trouver une idée rentable':'💡',
    'Aucun canal':'🧊','Instagram':'📸','TikTok':'🎵','Facebook':'f','WhatsApp':'🟢','Site web':'🌐','Google Maps':'📍','Publicité déjà lancée':'📢',
    'Français professionnel':'FR','Darija Latin':'DA','Français + Darija':'FR+DA','العربية':'AR','English':'EN'
  };
  var intakeSteps=[
    {key:'projectName',type:'input',maxLength:60,label:'Smiya dyal project?',hint:'Ktib smiya b tariqa بسيطة. Ila mazal ma 3andkch smiya, ktib idea dyalek.',placeholder:'Exemple : Namaa Kids',footer:'Nom du projet',micro:'Namaa ghadi يبني الهوية ديال المشروع على هاد الاسم.'},
    {key:'stage',label:'Fin وصل المشروع دابا؟',hint:'اختار المرحلة الأقرب باش Namaa يعرف واش يخدم launch, relance ولا validation.',footer:'Étape du projet',options:['Nouveau projet à lancer','Idée initiale à transformer en projet','Projet existant à relancer']},
    {key:'category',label:'Chno type dyal project?',hint:'اختار الكاتيجوري الرئيسية. من بعد نعطيك branches أدق.',footer:'Type de projet',options:(taxonomyCategories || ['SaaS / application','E-commerce / vente de produits','Clinique / médical','Restaurant / food','Agence / service pro','Service local','Formation / cours','Immobilier','Beauté / lifestyle','Tourisme / hébergement','AI automation / IT','Marketplace','Mobile app'])},
    {key:'branch',label:'شنو الفرع الأقرب؟',hint:'هاد الاختيار كيعاون Strategy, Design وWeb Agent يختارو template وmockups المناسبين.',footer:'Branche',dynamic:true},
    {key:'market',label:'Fin غادي تخدم؟',hint:'اختار المغرب كامل أو مدينة باش market research يكون محلي ومفيد.',footer:'Marché',options:(taxonomyCities || ['Maroc entier','Casablanca','Rabat','Marrakech','Tanger','Agadir','Fès','Meknès','Kénitra','Oujda','Taroudant','Tétouan','El Jadida','Safi','Béni Mellal','Nador','Laâyoune','Autre ville / région'])},
    {key:'budget',label:'Ch7al budget marketing?',hint:'ميزانية تقريبية كافية. Namaa غادي يقترح plan واقعي بلا تضخيم.',footer:'Budget',options:['Moins de 1000 DH','1000 - 3000 DH','3000 - 7000 DH','7000 - 15000 DH','Plus de 15000 DH','Pas encore défini']},
    {key:'goal',label:'شنو الهدف الأول؟',hint:'اختار النتيجة اللي باغيها دابا، ماشي كلشي مرة وحدة.',footer:'Objectif',options:['Trouver les premiers clients','Générer des leads WhatsApp','Vendre plus en ligne','Lancer une offre claire','Créer une landing page','Améliorer la visibilité','Structurer le marketing','Trouver une idée rentable']},
    {key:'target',label:'شكون أول client?',hint:'حدد أول فئة من الناس اللي باغي توصل ليها. هادي كتقوي الرسائل والإعلانات.',footer:'Cible',options:['Clients locaux proches','PME / professionnels','Familles','Jeunes / étudiants','Femmes intéressées beauté','Acheteurs Instagram/TikTok','Touristes / visiteurs','Entrepreneurs / startups','Pas encore défini']},
    {key:'offer',type:'input',maxLength:180,label:'شنو العرض أو الخدمة؟',hint:'جملة وحدة كافية: شنو غادي تبيع أو تقدم، وشنو الميزة الرئيسية؟',placeholder:'Exemple : consultation gratuite + plan marketing 30 jours',footer:'Offre',micro:'Namaa ghadi يحولها ل positioning ورسائل بيع.'},
    {key:'channels',label:'شنو عندك دابا من قنوات؟',hint:'يمكن تختار أكثر من قناة. إذا ما عندك والو، اختار Aucun canal.',footer:'Canaux',multi:true,options:['Aucun canal','Instagram','TikTok','Facebook','WhatsApp','Site web','Google Maps','Publicité déjà lancée']},
    {key:'language',label:'بأي لغة يخرج Namaa النتيجة؟',hint:'اختار اللغة الرئيسية للPDF والمحادثة. Darija = Latin letters إلا طلبتي العربية.',footer:'Langue',options:['Darija Latin','Français professionnel','Français + Darija','العربية','English']}
  ];
  var branchMap={
    'Clinique / médical':['Dentiste','Clinique esthétique','Dermatologie','Kinésithérapie','Centre ophtalmologique','Laboratoire','Médecin spécialiste','Centre laser','Nutrition / coaching santé'],
    'E-commerce / vente de produits':['Mode / vêtements','Cosmétiques','Produits alimentaires','Électronique','Maison / déco','Produit artisanal','Produit unique à tester','Accessoires mobile','Parapharmacie'],
    'Restaurant / food':['Restaurant','Café','Fast food','Pâtisserie','Traiteur','Dark kitchen','Food truck','Glacier / dessert','Healthy food'],
    'SaaS / application':['Application mobile','SaaS B2B','Marketplace','IA / automatisation','EdTech','FinTech','Outil interne','CRM / dashboard','Booking system'],
    'Agence / service pro':['Marketing digital','Design / branding','Développement web','Consulting','Comptabilité','Architecture','Photographie / vidéo','RH / recrutement','Business consulting'],
    'Service local':['Nettoyage','Déménagement','Réparation','Beauté à domicile','Coaching','Livraison','Maintenance','Sécurité','Jardinage'],
    'Formation / cours':['École privée','Cours de langue','Formation digitale','Coaching professionnel','Centre de soutien','Formation IA','Bootcamp tech','Cours en ligne'],
    'Immobilier':['Agence immobilière','Projet locatif','Promotion immobilière','Gestion Airbnb','Courtier','Bureau de vente','Coliving','Conciergerie'],
    'Beauté / lifestyle':['Salon de beauté','Barbershop','Spa / bien-être','Coach lifestyle','Cosmétiques locaux','Personal brand beauté','Studio makeup','Nails / lashes'],
    'Tourisme / hébergement':['Riad','Hôtel boutique','Agence voyage','Expérience locale','Restaurant touristique','Airbnb premium','Guide local','Excursions'],
    'AI automation / IT':['AI assistant','Chatbot business','Automation WhatsApp','Internal tool','Data dashboard','IT support','Cybersecurity service','AI agency'],
    'Marketplace':['Marketplace services','Marketplace produits','Marketplace talents','Booking marketplace','Delivery marketplace','B2B marketplace'],
    'Mobile app':['App services locaux','App livraison','App éducation','App finance','App santé','App communauté','App productivité']
  };
  function intakeIcon(value,key){return optionIconMap[value] || (taxonomy.iconFor ? taxonomy.iconFor(value) : '') || intakeStepIcons[key] || '•';}
  function intakeBriefPreviewHtml(currentIndex){
    var draft=appState.projectBriefDraft || {};
    var keys=['projectName','stage','category','branch','market','budget','goal','target','offer','channels','language'];
    var filled=keys.filter(function(k){return briefValue(draft[k]);}).length;
    var score=Math.round((filled/keys.length)*100);
    var rows=keys.map(function(k){
      var step=intakeSteps.find(function(item){return item.key===k;}) || {footer:k};
      var value=briefValue(draft[k]);
      return '<li class="'+(value?'is-filled':'')+'"><span>'+utils.escapeHtml(intakeStepIcons[k] || '•')+'</span><b>'+utils.escapeHtml(step.footer || k)+'</b><em>'+utils.escapeHtml(value || 'À remplir')+'</em></li>';
    }).join('');
    var categoryNote=draft.category && taxonomy.getCategoryNote ? taxonomy.getCategoryNote(draft.category) : '';
    var cityNote=draft.market && taxonomy.getCityNote ? taxonomy.getCityNote(draft.market) : '';
    var insight=(categoryNote || cityNote) ? '<div class="namaa-taxonomy-insight"><strong>Market intelligence</strong><span>'+utils.escapeHtml(categoryNote || cityNote)+'</span>'+(categoryNote && cityNote?'<small>'+utils.escapeHtml(cityNote)+'</small>':'')+'</div>' : '';
    return '<aside class="namaa-intake-preview" aria-label="Project DNA preview"><div class="namaa-intake-preview-head"><span>Project DNA</span><strong>'+score+'%</strong></div><div class="namaa-intake-preview-ring" style="--brief-score:'+score+'"><i>'+score+'%</i></div><p>Namaa kayجمع brief صغير وواضح باش Strategy, Design وWeb Agent يخدمو بلا prompt معقد.</p>'+insight+'<ul>'+rows+'</ul></aside>';
  }
  function intakeStageRailHtml(currentIndex){
    var groups=[['Brief','projectName'],['Type','category'],['Market','market'],['Goal','goal'],['Launch','language']];
    return '<div class="namaa-intake-stage-rail">'+groups.map(function(item){
      var relatedIndex=intakeSteps.findIndex(function(step){return step.key===item[1];});
      var klass=currentIndex>=relatedIndex?'is-active':'';
      return '<span class="'+klass+'"><b></b>'+utils.escapeHtml(item[0])+'</span>';
    }).join('')+'</div>';
  }
  function getIntakeStep(index){
    var step=intakeSteps[index];
    if(step && step.dynamic){
      var category=(appState.projectBriefDraft && appState.projectBriefDraft.category) || '';
      step=Object.assign({},step,{options:(taxonomy.getBranches ? taxonomy.getBranches(category) : null) || branchMap[category] || ['Général','Premium','Low-cost','B2B','B2C']});
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
    modal.className='namaa-intake-modal namaa-intake-modal-v38';
    modal.innerHTML='<div class="namaa-intake-backdrop"></div>'+ 
      '<section class="namaa-intake-card namaa-intake-card-v38" role="dialog" aria-modal="true" aria-label="Build My Project wizard">'+ 
        '<header><div><span>🏗️ Build My Project</span><h2>Namaa Project Wizard</h2><p>اختيارات سهلة، brief واضح، وagents خدامين بلا ما المستخدم يعرف prompts.</p></div><button type="button" data-intake-close aria-label="Fermer">×</button></header>'+ 
        intakeStageRailHtml(index)+
        '<div class="namaa-intake-progress"><i style="width:'+progress+'%"></i></div>'+ 
        '<div class="namaa-intake-layout">'+
          '<div class="namaa-intake-body"><div class="namaa-intake-step-badge"><span>'+utils.escapeHtml(intakeStepIcons[step.key] || '✨')+'</span><b>Step '+(index+1)+'/'+intakeSteps.length+'</b><em>'+progress+'% ready</em></div><h3>'+utils.escapeHtml(step.label)+'</h3><p>'+utils.escapeHtml(step.hint || '')+'</p>'+renderIntakeControl(step,value)+(step.micro?'<small class="namaa-intake-micro">'+utils.escapeHtml(step.micro)+'</small>':'')+'</div>'+
          intakeBriefPreviewHtml(index)+
        '</div>'+ 
        '<footer><strong>'+utils.escapeHtml(step.footer || '')+' · '+(index+1)+'/'+intakeSteps.length+'</strong><div><button type="button" class="namaa-intake-back" data-intake-back '+(index===0?'disabled':'')+'>Retour</button><button type="button" class="namaa-intake-next" data-intake-next>'+(index===intakeSteps.length-1?'Créer le brief':'Suivant')+'</button></div></footer>'+ 
      '</section>';
    document.body.appendChild(modal);
    modal.dataset.step=String(index);
    var textInput=modal.querySelector('[data-intake-input]');
    if(textInput){window.setTimeout(function(){textInput.focus();},60);}
  }
  function renderIntakeControl(step,value){
    if(step.type==='input'){
      return '<div class="namaa-intake-input-wrap"><input class="namaa-intake-input" data-intake-input value="'+utils.escapeHtml(value)+'" placeholder="'+utils.escapeHtml(step.placeholder || '')+'" '+(step.maxLength?'maxlength="'+step.maxLength+'"':'')+'>'+ (step.maxLength?'<small class="namaa-token-note">Max '+step.maxLength+' caractères pour garder le brief précis.</small>':'')+'</div>';
    }
    return '<div class="namaa-intake-options '+(step.multi?'is-multi':'')+'">'+(step.options || []).map(function(option){
      var active=step.multi ? (Array.isArray(value) && value.indexOf(option)>-1) : value===option;
      return '<button type="button" data-intake-option="'+utils.escapeHtml(option)+'" class="'+(active?'is-selected':'')+'"><span>'+utils.escapeHtml(intakeIcon(option,step.key))+'</span><strong>'+utils.escapeHtml(option)+'</strong></button>';
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
    setFlowStage('brief-ready');
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
    setFlowStage('intake');
    appState.lastMockupQuestion='';
    appState.lastDevQuestion='';
    appState.lastDeliverableType='';
    appState.createdDocuments={};
    appState.lastSources=[];
    appState.sourcePolicy='';
    var meta=agentConfig(currentAgent);
    var welcome=document.createElement('div');
    welcome.className='namaa-welcome';
    welcome.id='namaaHero';
    welcome.innerHTML='<div class="namaa-orb" aria-hidden="true"><span>N</span></div>'+ 
      '<p class="namaa-kicker" id="namaaHeroKicker">'+utils.escapeHtml(meta.hero.kicker)+'</p>'+ 
      '<h1 id="namaaHeroTitle">Namaa AI, chno bghiti ndirou lyoum?</h1>'+ 
      '<p class="namaa-intro" id="namaaHeroIntro">Hder m3a Namaa 3la AI, business, IT — ola bni project step by step.</p>'+ 
      guidedCtaHtml()+
      '<div class="namaa-chip-row namaa-quick-prompts" aria-label="Exemples de questions">'+promptButtonsHtml()+'</div>';
    thread.appendChild(welcome);
    hero=welcome;
    heroKicker=document.getElementById('namaaHeroKicker');
    heroTitle=document.getElementById('namaaHeroTitle');
    heroIntro=document.getElementById('namaaHeroIntro');
    bindPromptButtons(welcome);
    input.value='';
    input.style.height='auto';
    closeSidebar();
    setSidebarNote('＋','New chat','Choose Free Talk or Build Project. Details appear only when needed.');
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
    wrap.classList.add('is-complete');
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
  function startFreeTalkMode(){
    setAgent('talk');
    document.body.classList.add('namaa-has-messages');
    if(hero){hero.remove();hero=null;}
    var html='<div class="namaa-mode-start namaa-mode-free"><span>💬</span><strong>Free Talk ready</strong><p>Hani m3ak 👋 hder b tariqa 3adiya f AI, business, IT, startups, marketing, strategy w projects. Ila bghiti nbniw project step by step, ghir gol: build project.</p></div>';
    addMessage('ai',html);
    addHistory('assistant','Free Talk ready.');
    setFlowStage('free-talk');
    setSidebarNote('💬','Free Talk','Namaa will talk naturally but stays around AI, business, IT, startups, marketing and projects.');
    input.placeholder='Hder m3a Namaa f business, AI, IT, startups, marketing...';
    input.focus();
  }
  function startProjectFactoryMode(){
    setAgent('talk');
    setFlowStage('project-builder');
    setSidebarNote('🏗️','Project Factory','Build Project Wizard: category, city, budget, goal, audience, channels and language.');
    startIntakeWizard();
  }

  function strategyAgentDocMeta(type){
    var docs={
      market_research:{icon:'🔎',title:'Market Research Agent',label:'Market Research PDF',badge:'Research mode',verb:'kayحلل السوق',accent:'research',sections:['Brief cleanup','Morocco market context','Customer behavior','Alternatives/competitors','Opportunity gap','Validation plan'],note:'Namaa kayqra lbrief, kayرتب السوق, w kayخرج diagnostic واضح قبل أي strategy.'},
      marketing_strategy:{icon:'📈',title:'Marketing Strategy Agent',label:'Marketing Strategy PDF',badge:'Strategy mode',verb:'kayبني plan marketing',accent:'strategy',sections:['Positioning','Offer message','Funnel map','30-day action plan','Budget split','WhatsApp/KPIs'],note:'Namaa kayحوّل المعطيات لخطة عملية: content, ads, WhatsApp, budget w KPIs.'},
      roadmap:{icon:'🗺️',title:'Roadmap Agent',label:'Launch Roadmap PDF',badge:'Execution mode',verb:'kayوجد roadmap',accent:'roadmap',sections:['Launch objective','Week 1 setup','Week 2 content','Week 3 ads/leads','Week 4 optimization','Decision rules'],note:'Namaa kayقسم المشروع لخطوات أسبوعية باش التنفيذ يكون واضح وماشي عشوائي.'}
    };
    return docs[type] || docs.marketing_strategy;
  }
  function strategyBriefMiniHtml(brief){
    brief=brief || {};
    var rows=[
      ['Project',brief.projectName || 'Projet Namaa'],
      ['Category',brief.category || 'Business project'],
      ['Market',brief.market || 'Morocco'],
      ['Budget',brief.budget || 'To define'],
      ['Goal',brief.goal || 'Growth'],
      ['Audience',brief.target || 'Target customer']
    ];
    return rows.map(function(row){return '<span><small>'+utils.escapeHtml(row[0])+'</small><strong>'+utils.escapeHtml(row[1])+'</strong></span>';}).join('');
  }
  function strategyFactoryLoadingHtml(type,brief){
    var meta=strategyAgentDocMeta(type);
    var sections=meta.sections.map(function(item,index){return '<li><b>'+utils.escapeHtml(utils.pad2?utils.pad2(index+1):String(index+1).padStart(2,'0'))+'</b><span>'+utils.escapeHtml(item)+'</span><i></i></li>';}).join('');
    return '<div class="namaa-strategy-agent-loader" data-strategy-type="'+utils.escapeHtml(type || 'marketing_strategy')+'">'+
      '<div class="namaa-strategy-loader-head"><div class="namaa-agent-orbit"><span>'+utils.escapeHtml(meta.icon)+'</span><i></i><i></i></div><div><em>'+utils.escapeHtml(meta.badge)+'</em><strong>'+utils.escapeHtml(meta.title)+' is working</strong><p>'+utils.escapeHtml(meta.verb)+'… Namaa kayوجد document بطريقة منظمة، ماشي جواب عشوائي.</p></div></div>'+ 
      '<div class="namaa-strategy-live-brief">'+strategyBriefMiniHtml(brief)+'</div>'+ 
      '<ol class="namaa-strategy-build-steps">'+sections+'</ol>'+ 
      '<div class="namaa-strategy-loader-bar"><span></span></div>'+ 
      '<p class="namaa-strategy-loader-note">خد نفس صغير ☕ Strategy Agent kayخدم على '+utils.escapeHtml(meta.label)+' باش تكون النتيجة clean وPDF-ready.</p>'+ 
    '</div>';
  }
  function strategyFactoryPreviewHtml(type,brief,phase){
    var meta=strategyAgentDocMeta(type);
    var isDone=phase==='done';
    var sections=meta.sections.map(function(item,index){return '<li class="'+(isDone?'is-done':index<2?'is-active':'')+'"><b>'+utils.escapeHtml(utils.pad2?utils.pad2(index+1):String(index+1).padStart(2,'0'))+'</b><span>'+utils.escapeHtml(item)+'</span></li>';}).join('');
    return '<section class="namaa-strategy-agent-preview '+(isDone?'is-done':'is-working')+'" data-strategy-type="'+utils.escapeHtml(type || 'marketing_strategy')+'">'+
      '<header><div class="namaa-agent-orbit"><span>'+utils.escapeHtml(meta.icon)+'</span><i></i><i></i></div><div><small>'+utils.escapeHtml(meta.badge)+'</small><h3>'+utils.escapeHtml(meta.label)+'</h3><p>'+utils.escapeHtml(meta.note)+'</p></div></header>'+ 
      '<div class="namaa-strategy-preview-status"><span>'+utils.escapeHtml(isDone?'Document ready':'Agent working')+'</span><strong>'+utils.escapeHtml(isDone?'100%':'AI factory in progress')+'</strong></div>'+ 
      '<div class="namaa-strategy-preview-meter"><i style="width:'+(isDone?'100':'62')+'%"></i></div>'+ 
      '<div class="namaa-strategy-preview-brief"><h4>Project DNA</h4><div>'+strategyBriefMiniHtml(brief)+'</div></div>'+ 
      '<div class="namaa-strategy-preview-sections"><h4>Document sections</h4><ol>'+sections+'</ol></div>'+ 
      '<p class="namaa-preview-note">Right panel kayوريك شنو كيدير Strategy Agent. ملي يسالي، غادي يبان PDF preview هنا.</p>'+ 
    '</section>';
  }
  function strategyFactoryDoneCardHtml(type,brief){
    var meta=strategyAgentDocMeta(type);
    return flowProgressHtml('strategy')+
      '<div class="namaa-strategy-done-card namaa-flow-card"><div><span>'+utils.escapeHtml(meta.icon)+'</span><strong>'+utils.escapeHtml(meta.label)+' generated</strong><p>Strategy Agent سالا المرحلة الأولى. دابا تقدر تشوف PDF preview ولا download document brandé Namaa + Elboubakry.</p></div></div>';
  }


  function designAgentPack(question,brief){
    if(brain && brain.getMockupPack){return brain.getMockupPack(question || '',brief || appState.projectBrief || {});}
    return {label:'Business Maroc',primaryAsset:'Landing page + social mockup',assets:['Logo concept','Landing page mockup','Social post','WhatsApp CTA'],visuals:['brand board','landing page','social ad'],copyAngles:['Launch clearly','Get clients','Build trust'],style:'Premium blue/white business direction',logoIdea:'Simple premium logo mark'};
  }
  function designMiniBriefHtml(brief){
    brief=brief || {};
    var rows=[
      ['Project',brief.projectName || 'Projet Namaa'],
      ['Category',brief.category || 'Business'],
      ['Market',brief.market || 'Morocco'],
      ['Goal',brief.goal || 'Launch / growth']
    ];
    return rows.map(function(row){return '<span><small>'+utils.escapeHtml(row[0])+'</small><strong>'+utils.escapeHtml(row[1])+'</strong></span>';}).join('');
  }
  function designAssetChipsHtml(pack){
    return (pack.assets || []).slice(0,6).map(function(asset,index){return '<span><b>'+utils.escapeHtml(utils.pad2?utils.pad2(index+1):String(index+1).padStart(2,'0'))+'</b>'+utils.escapeHtml(asset)+'</span>';}).join('');
  }
  function designFactoryLoadingHtml(question,brief){
    var pack=designAgentPack(question,brief);
    return '<div class="namaa-design-agent-loader" data-pack="'+utils.escapeHtml(pack.label || 'Business Maroc')+'">'+
      '<div class="namaa-design-loader-head"><div class="namaa-agent-orbit namaa-design-orbit"><span>🎨</span><i></i><i></i></div><div><em>Design Agent</em><strong>Namaa kayصاوب logo + mockups</strong><p>Kanqra lbrief, kanختار visual direction, w kanحضّر board adapté lcategory.</p></div></div>'+ 
      '<div class="namaa-design-live-brief">'+designMiniBriefHtml(brief)+'</div>'+ 
      '<div class="namaa-design-canvas-skeleton"><div class="namaa-design-logo-skel"><i></i><strong>Logo concept</strong><small>'+utils.escapeHtml(pack.logoIdea || 'Premium mark')+'</small></div><div class="namaa-design-device-skel"><span></span><span></span><span></span><b>'+utils.escapeHtml(pack.primaryAsset || 'Mockup board')+'</b></div></div>'+ 
      '<ol class="namaa-design-build-steps"><li class="is-active"><b>01</b><span>Reading Project DNA</span><i></i></li><li><b>02</b><span>Generating logo direction</span><i></i></li><li><b>03</b><span>Preparing category mockups</span><i></i></li><li><b>04</b><span>Rendering preview board</span><i></i></li></ol>'+ 
      '<div class="namaa-design-loader-bar"><span></span></div>'+ 
      '<p class="namaa-design-loader-note">Sna chwya 🎨 Design Agent kayخدم بحال atelier: logo, mockup, social/print assets حسب المشروع.</p>'+ 
    '</div>';
  }
  function designFactoryPreviewHtml(question,brief,phase){
    var pack=designAgentPack(question,brief);
    var done=phase==='done';
    return '<section class="namaa-design-agent-preview '+(done?'is-done':'is-working')+'">'+
      '<header><div class="namaa-agent-orbit namaa-design-orbit"><span>🎨</span><i></i><i></i></div><div><small>'+utils.escapeHtml(done?'Creative board ready':'Design Agent working')+'</small><h3>'+utils.escapeHtml(pack.label || 'Logo + mockup pack')+'</h3><p>'+utils.escapeHtml(pack.style || 'Premium business visual direction')+'</p></div></header>'+ 
      '<div class="namaa-design-preview-status"><span>'+utils.escapeHtml(done?'Ready':'Factory in progress')+'</span><strong>'+utils.escapeHtml(done?'100%':'Logo → Mockup → Board')+'</strong></div>'+ 
      '<div class="namaa-design-preview-meter"><i style="width:'+(done?'100':'68')+'%"></i></div>'+ 
      '<div class="namaa-design-preview-board"><div class="namaa-design-preview-logo"><b>N</b><span>Logo</span></div><div class="namaa-design-preview-device"><i></i><i></i><i></i><strong>'+utils.escapeHtml(pack.primaryAsset || 'Main mockup')+'</strong></div></div>'+ 
      '<div class="namaa-design-preview-brief"><h4>Project DNA</h4><div>'+designMiniBriefHtml(brief)+'</div></div>'+ 
      '<div class="namaa-design-preview-assets"><h4>Assets prepared</h4><div class="namaa-layout-chips">'+designAssetChipsHtml(pack)+'</div></div>'+ 
      '<p class="namaa-preview-note">Right panel kayوريك Design Agent وهو خدام. ملي يسالي غادي يبان logo/mockup board هنا.</p>'+ 
    '</section>';
  }
  function designFactoryDoneCardHtml(question,brief){
    var pack=designAgentPack(question,brief);
    return flowProgressHtml('images')+
      '<div class="namaa-flow-card namaa-design-done-card"><div><span>🎨</span><strong>Design Agent salat lmockup pack.</strong><p>'+utils.escapeHtml(pack.label || 'Creative pack')+' واجد ف right panel: logo direction, mockup board, assets w style. Daba nقدر ندوزو ل Web Agent.</p></div></div>';
  }

  function generateTalkDeliverable(action){
    var labels={market_research:'Market Research PDF',marketing_strategy:'Marketing Strategy PDF',roadmap:'Launch Roadmap'};
    var brief=appState.projectBrief || {};
    var label=labels[action] || 'Namaa PDF';
    var meta=strategyAgentDocMeta(action);
    appState.lastDeliverableType=action;
    appState.createdDocuments=appState.createdDocuments || {};
    setAgent('talk');
    setFlowStage('strategy-generating');
    document.body.classList.add('namaa-has-messages');
    if(hero){hero.remove();hero=null;}
    var prompt='Créer '+label+' pour '+(brief.projectName || 'ce projet');
    addMessage('user',utils.escapeHtml(prompt));
    addHistory('user',prompt);
    openPreview('Strategy Agent',meta.label,strategyFactoryPreviewHtml(action,brief,'working'));
    var loading=addMessage('ai',strategyFactoryLoadingHtml(action,brief));
    loading.classList.add('is-loading');
    answerAsync(prompt,{brief:brief,history:[],action:action}).then(function(html){
      setFlowStage('pdf-ready');
      appState.lastDeliverableType=action;
      appState.createdDocuments=appState.createdDocuments || {};
      appState.createdDocuments[action]=true;
      appState.lastStrategyHtml=html;
      appState.lastStrategyText=html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
      updateAiMessage(loading,strategyFactoryDoneCardHtml(action,brief)+html+pdfReadyCardHtml());
      if(services.pdf && services.pdf.renderStrategyPreview){
        openPreview('Namaa PDF',pdfDocLabel(action),services.pdf.renderStrategyPreview({brief:brief,strategyHtml:appState.lastStrategyHtml,strategyText:appState.lastStrategyText,documentType:action,sources:appState.lastSources}));
      }else{
        openPreview('Strategy Agent',meta.label,strategyFactoryPreviewHtml(action,brief,'done'));
      }
      addHistory('assistant',appState.lastStrategyText);
    }).catch(function(error){
      setFlowStage('strategy-error');
      updateAiMessage(loading,'<p>Namaa had a temporary problem: '+utils.escapeHtml(error.message || 'Unknown error')+'</p>');
      openPreview('Strategy Agent','Temporary issue','<div class="namaa-strategy-agent-preview is-error"><header><div class="namaa-agent-orbit"><span>⚠️</span></div><div><small>Retry available</small><h3>Strategy Agent stopped</h3><p>'+utils.escapeHtml(error.message || 'Unknown error')+'</p></div></header></div>');
    });
  }

  function typingLoadingHtml(agent){
    var labels={talk:'Namaa kayjawb...',images:'Namaa kayوجد mockup...',dev:'NamaaDev kayبني preview...'};
    return '<div class="namaa-typing"><span></span><span></span><span></span><em>'+utils.escapeHtml(labels[agent] || 'Namaa kayكتب...')+'</em></div>';
  }
  function waitForHumanTyping(started,agent){
    var minimum=agent==='talk'?240:520;
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
    if(submittedAgent==='images'){
      setFlowStage('images-generating');
      openPreview('Design Agent','Logo + mockup factory',designFactoryPreviewHtml(q,appState.projectBrief || null,'working'));
      var loadingBubble=loading.querySelector('.namaa-bubble');
      if(loadingBubble)loadingBubble.innerHTML=designFactoryLoadingHtml(q,appState.projectBrief || null);
      loading.classList.add('is-design-loading');
    }
    var startedAt=Date.now();
    answerAsync(q,{brief:appState.projectBrief || null}).then(function(html){
      return waitForHumanTyping(startedAt,submittedAgent).then(function(){return html;});
    }).then(function(html){
      if(submittedAgent==='images' && appState.projectBrief){
        setFlowStage('dev-offer');
        appState.lastMockupQuestion=q;
        html=designFactoryDoneCardHtml(q,appState.projectBrief)+html+imageNextStepHtml();
      }
      if(submittedAgent==='dev' && appState.projectBrief){
        setFlowStage('complete');
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
      var previewHtml=services.pdf && services.pdf.renderStrategyPreview ? services.pdf.renderStrategyPreview({brief:appState.projectBrief,strategyHtml:appState.lastStrategyHtml,strategyText:appState.lastStrategyText,documentType:currentPdfType,sources:appState.lastSources}) : '<p>PDF preview is not ready yet.</p>';
      openPreview('Namaa PDF',pdfDocLabel(currentPdfType),previewHtml);
      return;
    }
    var pdfBtn=event.target.closest('[data-namaa-pdf]');
    if(pdfBtn){
      pdfBtn.disabled=true;
      pdfBtn.textContent='PDF téléchargé';
      var downloadedType=appState.lastDeliverableType || 'marketing_strategy';
      if(services.pdf && services.pdf.openStrategy){services.pdf.openStrategy({brief:appState.projectBrief,strategyHtml:appState.lastStrategyHtml,strategyText:appState.lastStrategyText,documentType:downloadedType,sources:appState.lastSources});}
      appState.createdDocuments=appState.createdDocuments || {};
      appState.createdDocuments[downloadedType]=true;
      if(downloadedType==='market_research'){
        setFlowStage('strategy-offer');
        setAgent('talk');
        addMessage('ai',marketToStrategyCardHtml());
      }else if(downloadedType==='roadmap'){
        setFlowStage('strategy-or-images');
        setAgent('talk');
        addMessage('ai',roadmapToNextCardHtml());
      }else{
        setFlowStage('images-offer');
        setAgent('images');
        addMessage('ai',strategyToImagesCardHtml());
      }
      return;
    }
    var flowBtn=event.target.closest('[data-flow-action]');
    if(flowBtn){
      var action=flowBtn.getAttribute('data-flow-action');
      if(action==='free-talk-mode'){startFreeTalkMode();return;}
      if(action==='build-project-flow'){startProjectFactoryMode();return;}
      if(action==='guided-intake'){startProjectFactoryMode();return;}
      if(action==='create-marketing-strategy'){
        generateTalkDeliverable('marketing_strategy');
        return;
      }
      if(action==='skip-to-images'){
        setFlowStage('images-offer');
        setAgent('images');
        addMessage('ai',strategyToImagesCardHtml());
        return;
      }
      if(action==='creative-mockup'){
        setFlowStage('images-generating');
        setAgent('images');
        input.value=buildMockupPrompt(appState.projectBrief || {},'');
        input.dispatchEvent(new Event('input'));
        submit();
        return;
      }
      if(action==='custom-mockup'){
        setFlowStage('images-custom');
        setAgent('images');
        input.value='';
        input.placeholder='Décrivez votre idée de mockup pour '+((appState.projectBrief && appState.projectBrief.projectName) || 'votre projet')+'...';
        addMessage('ai','<div class="namaa-flow-card namaa-next-step namaa-agent-handoff"><div><span>🎯</span><strong>Dites-moi votre direction.</strong><p>Exemple : logo minimal, couleurs bleu/blanc, mockup SaaS desktop + mobile, flyer Instagram, roll-up professionnel.</p></div></div>');
        input.focus();
        return;
      }
      if(action==='start-dev'){
        setFlowStage('dev-generating');
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
        setSidebarNote('▥','Factory Library','Factory Library: Morocco categories, city market notes, strategy prompts, design packs and NamaaDev templates are organized here.');
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
