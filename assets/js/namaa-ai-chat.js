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
  var appState={lastTalkQuestion:'',lastDevFiles:null,projectBrief:null,projectBriefDraft:null,projectDNA:null,lastStrategyText:'',lastStrategyHtml:'',flowStage:'intake',lastMockupQuestion:'',lastDevQuestion:'',lastDeliverableType:'',createdDocuments:{},lastSources:[],sourcePolicy:''};
  var PROJECT_DNA_STORAGE_KEY='namaa_project_dna_v56';
  var PROJECT_DNA_LEGACY_KEYS=['namaa_project_dna_v53'];
  window.NamaaRuntime=window.NamaaRuntime || {};
  function safeLocalStorage(){
    try{return window.localStorage || null;}catch(error){return null;}
  }
  function createProjectDNA(brief){
    brief=Object.assign({},brief || {});
    var previous=appState.projectDNA || {};
    var created=previous.createdAt || new Date().toISOString();
    var score=briefScore(brief);
    return {
      id:previous.id || ('namaa-dna-'+Date.now().toString(36)),
      version:'20260622-u56',
      status:score>=70?'ready':'draft',
      score:score,
      createdAt:created,
      updatedAt:new Date().toISOString(),
      brief:brief,
      agents:{
        market:{status:'ready',output:'market_research'},
        strategy:{status:'ready',output:'marketing_strategy'},
        marketing:{status:'ready',output:'marketing_agent'},
        crm:{status:'ready',output:'crm_agent'},
        startup:{status:'ready',output:'roadmap'},
        automation:{status:'ready',output:'automation_agent'},
        website:{status:'ready',output:'dev'},
        images:{status:'ready',output:'images'}
      }
    };
  }
  function readStoredProjectDNA(){
    var storage=safeLocalStorage();
    if(!storage)return null;
    var keys=[PROJECT_DNA_STORAGE_KEY].concat(PROJECT_DNA_LEGACY_KEYS || []);
    for(var i=0;i<keys.length;i+=1){
      try{
        var raw=storage.getItem(keys[i]);
        if(!raw)continue;
        var dna=JSON.parse(raw);
        if(!dna || !dna.brief)continue;
        dna.score=Number(dna.score || briefScore(dna.brief));
        if(keys[i]!==PROJECT_DNA_STORAGE_KEY){saveProjectDNA(dna);}
        return dna;
      }catch(error){}
    }
    return null;
  }
  function saveProjectDNA(dna){
    var storage=safeLocalStorage();
    if(storage){try{storage.setItem(PROJECT_DNA_STORAGE_KEY,JSON.stringify(dna));}catch(error){}}
  }
  function setProjectDNA(brief){
    var dna=createProjectDNA(brief || {});
    appState.projectDNA=dna;
    appState.projectBrief=Object.assign({},dna.brief || {});
    saveProjectDNA(dna);
    syncProjectDNAUI();
    try{window.dispatchEvent(new CustomEvent('namaa:project-dna',{detail:{projectDNA:dna,state:window.NamaaRuntime.getState()}}));}catch(error){}
    return dna;
  }
  function clearProjectDNA(){
    appState.projectDNA=null;
    appState.projectBrief=null;
    appState.projectBriefDraft=null;
    var storage=safeLocalStorage();
    if(storage){try{storage.removeItem(PROJECT_DNA_STORAGE_KEY);}catch(error){}}
    syncProjectDNAUI();
    try{window.dispatchEvent(new CustomEvent('namaa:project-dna',{detail:{projectDNA:null,state:window.NamaaRuntime.getState()}}));}catch(error){}
  }
  function projectDNAReady(){return !!(appState.projectDNA && appState.projectDNA.brief);}
  var storedProjectDNA=readStoredProjectDNA();
  if(storedProjectDNA){
    appState.projectDNA=storedProjectDNA;
    appState.projectBrief=Object.assign({},storedProjectDNA.brief || {});
    appState.flowStage='brief-ready';
  }
  window.NamaaRuntime.getState=function(){return Object.assign({},appState,{currentAgent:currentAgent});};
  window.NamaaRuntime.getProjectDNA=function(){return appState.projectDNA ? Object.assign({},appState.projectDNA,{brief:Object.assign({},appState.projectDNA.brief || {})}) : null;};
  window.NamaaRuntime.setProjectDNA=function(brief){return setProjectDNA(brief);};
  window.NamaaRuntime.clearProjectDNA=function(){clearProjectDNA();};
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
  function syncProjectDNAUI(){
    var dna=appState.projectDNA;
    var ready=!!(dna && dna.brief);
    document.body.classList.toggle('namaa-project-dna-ready',ready);
    var score=ready ? (Number(dna.score || briefScore(dna.brief)) || 0) : 0;
    var status=document.getElementById('namaaSidebarDnaStatus');
    if(status){
      if(ready){
        var brief=dna.brief || {};
        status.classList.add('is-ready');
        status.innerHTML='<span>🧬</span><div><strong>'+utils.escapeHtml(brief.projectName || 'Project DNA ready')+'</strong><small>'+utils.escapeHtml((brief.category || 'Business')+' · '+(brief.market || 'Morocco')+' · '+score+'% ready')+'</small></div>';
      }else{
        status.classList.remove('is-ready');
        status.innerHTML='<span>🧬</span><div><strong>Project DNA</strong><small>Not ready yet · Build Project first</small></div>';
      }
    }
    var meter=document.querySelector('.namaa-cockpit-meter span');
    if(meter)meter.style.setProperty('--value',ready ? Math.max(10,score)+'%' : '25%');
    var live=document.querySelector('.namaa-cockpit-topline small');
    if(live)live.textContent=ready ? 'DNA active for agents' : 'Appears when needed';
    document.querySelectorAll('[data-dna-agent]').forEach(function(btn){
      btn.classList.toggle('is-locked',!ready);
      btn.classList.toggle('is-dna-ready',ready);
      btn.setAttribute('aria-disabled',ready?'false':'true');
      var em=btn.querySelector('.namaa-agent-copy em');
      if(em)em.textContent=ready ? 'DNA ready' : 'Needs Project DNA';
    });
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
  var adaptiveAgentDashboards={
    market:{
      key:'market',icon:'🔎',label:'Market Research',kicker:'Market intelligence',accent:'#0ea5e9',
      title:'Market Research Agent — Morocco opportunity dashboard',
      intro:'Analyse cities, competitors, price signals, demand angles and first validation steps from the active Project DNA.',
      placeholder:'Ask Market Research Agent about competitors, cities, prices or demand...',
      visual:'market-pulse',
      stats:[['City focus','market'],['Category','category'],['Target','target'],['Budget','budget']],
      cards:[
        {icon:'📍',title:'City and demand signals',text:'Compare the main city, buying behavior and where the first test should start.'},
        {icon:'🏪',title:'Competitor scan',text:'List direct and indirect competitors, their offers, strengths and weak points.'},
        {icon:'💸',title:'Pricing reality',text:'Estimate entry price, premium price and test offer adapted to Moroccan buyers.'}
      ],
      outputs:[['Market Research PDF','market_research'],['Ask in chat','prompt:market'],['Edit DNA','guided-intake']]
    },
    strategy:{
      key:'strategy',icon:'🧭',label:'Strategy Agent',kicker:'Positioning and roadmap',accent:'#2563eb',
      title:'Strategy Agent — offer, positioning and 30/60/90 plan',
      intro:'Turn the Project DNA into a clear business direction: who you serve, why you win, what to launch first and how to execute.',
      placeholder:'Ask Strategy Agent about positioning, roadmap, offer or priorities...',
      visual:'timeline',
      stats:[['Goal','goal'],['Offer','offer'],['Stage','stage'],['Language','language']],
      cards:[
        {icon:'🎯',title:'Positioning',text:'Clarify promise, niche, target pain and trust angle.'},
        {icon:'🧩',title:'Offer architecture',text:'Build entry offer, core offer and upsell without confusing the buyer.'},
        {icon:'🗓️',title:'30/60/90 roadmap',text:'Transform the idea into weekly actions and KPIs.'}
      ],
      outputs:[['Strategy PDF','marketing_strategy'],['Launch roadmap','roadmap'],['Edit DNA','guided-intake']]
    },
    marketing:{
      key:'marketing',icon:'📣',label:'Marketing Agent',kicker:'Ads, content and funnel',accent:'#7c3aed',
      title:'Marketing Agent — funnel, campaigns and lead generation',
      intro:'Create practical Meta/Google/TikTok actions, content angles, CTA ideas and conversion flow based on the Project DNA.',
      placeholder:'Ask Marketing Agent for Meta Ads, content plan, CTA or funnel ideas...',
      visual:'funnel',
      stats:[['Channels','channels'],['Budget','budget'],['Target','target'],['Goal','goal']],
      cards:[
        {icon:'📢',title:'Campaign map',text:'Choose awareness, lead generation or WhatsApp conversion based on the project stage.'},
        {icon:'🧲',title:'Lead magnet / CTA',text:'Build an offer people understand fast and can act on now.'},
        {icon:'🎬',title:'Content angles',text:'Hook, problem, proof and CTA ideas for short videos and carousels.'}
      ],
      outputs:[['Create marketing prompt','prompt:marketing'],['Strategy PDF','marketing_strategy'],['Edit DNA','guided-intake']]
    },
    crm:{
      key:'crm',icon:'🟢',label:'WhatsApp & CRM',kicker:'Lead handling system',accent:'#10b981',
      title:'WhatsApp & CRM Agent — scripts, qualification and follow-up',
      intro:'Prepare WhatsApp replies, lead qualification questions, follow-up timing and CRM status flow for the active project.',
      placeholder:'Ask WhatsApp & CRM Agent for scripts, lead status or follow-up...',
      visual:'whatsapp-flow',
      stats:[['Offer','offer'],['Target','target'],['Channels','channels'],['Market','market']],
      cards:[
        {icon:'💬',title:'First reply script',text:'Fast WhatsApp answer that confirms need, city, budget and urgency.'},
        {icon:'✅',title:'Qualification flow',text:'Separate serious leads from curiosity without sounding robotic.'},
        {icon:'🔁',title:'Follow-up rhythm',text:'Day 0, day 1 and day 3 messages to recover silent prospects.'}
      ],
      outputs:[['Create CRM prompt','prompt:crm'],['Ask in chat','prompt:whatsapp'],['Edit DNA','guided-intake']]
    },
    startup:{
      key:'startup',icon:'🚀',label:'Startup Launch',kicker:'MVP and validation',accent:'#f97316',
      title:'Startup Launch Agent — MVP, validation and launch plan',
      intro:'Convert the Project DNA into MVP scope, validation test, pricing hypothesis and launch checklist.',
      placeholder:'Ask Startup Launch Agent about MVP, validation, pricing or launch...',
      visual:'launch-checklist',
      stats:[['Stage','stage'],['Goal','goal'],['Budget','budget'],['Category','category']],
      cards:[
        {icon:'🧪',title:'Validation test',text:'The smallest test to know if people want the offer before building too much.'},
        {icon:'🧱',title:'MVP scope',text:'What to build now, what to fake manually, and what to delay.'},
        {icon:'💰',title:'Pricing hypothesis',text:'Entry price, premium option and what proof is needed to charge more.'}
      ],
      outputs:[['Launch roadmap','roadmap'],['Ask in chat','prompt:startup'],['Edit DNA','guided-intake']]
    },
    automation:{
      key:'automation',icon:'⚙️',label:'AI & Automation',kicker:'Systems and workflows',accent:'#06b6d4',
      title:'AI & Automation Agent — workflow and tool stack',
      intro:'Map the tasks Namaa can automate: intake, follow-up, reporting, content, CRM and internal operations.',
      placeholder:'Ask AI & Automation Agent about tools, workflows or automations...',
      visual:'automation-flow',
      stats:[['Channels','channels'],['Goal','goal'],['Category','category'],['Budget','budget']],
      cards:[
        {icon:'🤖',title:'AI use cases',text:'Find where AI saves time without making the business look generic.'},
        {icon:'🔗',title:'Workflow map',text:'Connect form, WhatsApp, Sheet/CRM, notification and reporting steps.'},
        {icon:'🧰',title:'Tool stack',text:'Suggest simple tools before expensive custom development.'}
      ],
      outputs:[['Create automation prompt','prompt:automation'],['Ask in chat','prompt:tools'],['Edit DNA','guided-intake']]
    },
    website:{
      key:'website',icon:'💻',label:'IT / Website',kicker:'Landing page and SEO',accent:'#1d4ed8',
      title:'IT / Website Agent — landing page, SEO and UI/UX planning',
      intro:'Prepare a conversion-focused landing page structure, SEO basics, performance checklist and UI/UX direction.',
      placeholder:'Ask IT / Website Agent for landing page, SEO, UI/UX or performance...',
      visual:'website-wireframe',
      stats:[['Offer','offer'],['Target','target'],['Market','market'],['Language','language']],
      cards:[
        {icon:'🧱',title:'Page structure',text:'Hero, proof, offer, process, FAQ and CTA order for conversion.'},
        {icon:'🔍',title:'SEO base',text:'Keywords, title, meta, sections and local signals for Morocco.'},
        {icon:'⚡',title:'Performance & UX',text:'Mobile first, no clutter, readable CTA and fast loading.'}
      ],
      outputs:[['Create landing page','dev'],['Ask in chat','prompt:website'],['Edit DNA','guided-intake']]
    },
    images:{
      key:'images',icon:'🎨',label:'Brand / Mockups',kicker:'Logo and visual assets',accent:'#db2777',
      title:'Brand / Mockups Agent — logo, boards and launch visuals',
      intro:'Use the Project DNA to prepare visual direction: logo concept, brand board, website mockup and launch creative assets.',
      placeholder:'Ask Brand / Mockups Agent for logo, mockups, colors or visual direction...',
      visual:'mockup-board',
      stats:[['Project','projectName'],['Category','category'],['Style','branch'],['Language','language']],
      cards:[
        {icon:'🔷',title:'Logo concept',text:'Simple mark and direction that match the category and trust level.'},
        {icon:'🖼️',title:'Mockup pack',text:'Website screen, social post, flyer or business visual depending on the project.'},
        {icon:'🎨',title:'Brand board',text:'Colors, typography feeling, image style and launch assets.'}
      ],
      outputs:[['Generate mockups','images'],['Custom direction','custom-mockup'],['Edit DNA','guided-intake']]
    }
  };
  function briefTextValue(brief,key,fallback){
    var value=brief && brief[key];
    if(Array.isArray(value))value=value.join(', ');
    value=String(value || '').trim();
    return value || fallback || 'Not defined yet';
  }
  function dashboardPromptFor(key){
    var brief=(appState.projectDNA && appState.projectDNA.brief) || appState.projectBrief || {};
    var project=briefTextValue(brief,'projectName','my project');
    var category=briefTextValue(brief,'category','business');
    var market=briefTextValue(brief,'market','Morocco');
    var prompts={
      market:'Bghit Market Research Agent ydir analyse 3la '+project+' f '+market+' category '+category+': demand, competitors, pricing, cities, opportunities.',
      marketing:'Bghit Marketing Agent ydir plan Meta/Google/TikTok, content angles, funnel and lead generation l '+project+'.',
      crm:'Bghit WhatsApp & CRM Agent yktb scripts, qualification questions and follow-up flow l '+project+'.',
      whatsapp:'Bghit WhatsApp script professional l '+project+' bach nconfirmiw leads w nqualifiwhom.',
      startup:'Bghit Startup Launch Agent y3tini MVP, validation test, pricing and launch checklist l '+project+'.',
      automation:'Bghit AI & Automation Agent y9ter7 workflows and tools bach nautomatiw '+project+'.',
      tools:'Bghit simple AI tool stack for '+project+' without expensive setup.',
      website:'Bghit IT / Website Agent ydir landing page structure, SEO base, performance and UI/UX plan l '+project+'.'
    };
    return prompts[key] || prompts.market;
  }
  function dashboardStatHtml(brief,item){
    var label=item[0];
    var key=item[1];
    return '<span><small>'+utils.escapeHtml(label)+'</small><strong>'+utils.escapeHtml(briefTextValue(brief,key,'Ready after DNA'))+'</strong></span>';
  }
  function agentDashboardVisualHtml(meta,brief){
    var name=briefTextValue(brief,'projectName','Project');
    var category=briefTextValue(brief,'category','Business');
    var market=briefTextValue(brief,'market','Morocco');
    if(meta.visual==='timeline'){
      return '<div class="namaa-agent-visual namaa-visual-timeline"><span>01<em>Positioning</em></span><span>02<em>Offer</em></span><span>03<em>Roadmap</em></span><span>04<em>KPIs</em></span></div>';
    }
    if(meta.visual==='funnel'){
      return '<div class="namaa-agent-visual namaa-visual-funnel"><span>Awareness</span><span>Landing / WhatsApp</span><span>Qualified lead</span><span>Follow-up</span></div>';
    }
    if(meta.visual==='whatsapp-flow'){
      return '<div class="namaa-agent-visual namaa-visual-whatsapp"><p><b>Lead:</b> Salam, bghit info 3la '+utils.escapeHtml(category)+'</p><p><b>Namaa:</b> Mzyan, chno city w goal dyalk?</p><p><b>Status:</b> Qualified → Follow-up</p></div>';
    }
    if(meta.visual==='launch-checklist'){
      return '<div class="namaa-agent-visual namaa-visual-checklist"><label><i></i> Problem validated</label><label><i></i> MVP scope</label><label><i></i> Pricing test</label><label><i></i> First 20 leads</label></div>';
    }
    if(meta.visual==='automation-flow'){
      return '<div class="namaa-agent-visual namaa-visual-automation"><span>Form</span><i></i><span>CRM</span><i></i><span>WhatsApp</span><i></i><span>Report</span></div>';
    }
    if(meta.visual==='website-wireframe'){
      return '<div class="namaa-agent-visual namaa-visual-wireframe"><header></header><section></section><div><span></span><span></span><span></span></div><footer></footer></div>';
    }
    if(meta.visual==='mockup-board'){
      return '<div class="namaa-agent-visual namaa-visual-mockups"><span class="logo">'+utils.escapeHtml((name || 'N').charAt(0).toUpperCase())+'</span><span></span><span></span><span></span></div>';
    }
    return '<div class="namaa-agent-visual namaa-visual-market"><span>'+utils.escapeHtml(market)+'</span><b>'+utils.escapeHtml(category)+'</b><i></i><i></i><i></i></div>';
  }
  function agentDashboardHtml(key){
    var meta=adaptiveAgentDashboards[key] || adaptiveAgentDashboards.market;
    var dna=appState.projectDNA || createProjectDNA(appState.projectBrief || {});
    var brief=dna.brief || {};
    var score=Number(dna.score || briefScore(brief)) || 0;
    var cards=(meta.cards || []).map(function(card){return '<article><span>'+utils.escapeHtml(card.icon)+'</span><strong>'+utils.escapeHtml(card.title)+'</strong><p>'+utils.escapeHtml(card.text)+'</p></article>';}).join('');
    var actions=(meta.outputs || []).map(function(item){
      var label=item[0];
      var action=item[1];
      if(action.indexOf('prompt:')===0)return '<button class="namaa-agent-action secondary" type="button" data-agent-prompt="'+utils.escapeHtml(action.slice(7))+'">'+utils.escapeHtml(label)+'</button>';
      if(action==='guided-intake')return '<button class="namaa-agent-action ghost" type="button" data-flow-action="guided-intake">'+utils.escapeHtml(label)+'</button>';
      if(action==='custom-mockup')return '<button class="namaa-agent-action secondary" type="button" data-flow-action="custom-mockup">'+utils.escapeHtml(label)+'</button>';
      if(action==='dev')return '<button class="namaa-agent-action" type="button" data-agent-output="dev">'+utils.escapeHtml(label)+'</button>';
      if(action==='images')return '<button class="namaa-agent-action" type="button" data-agent-output="images">'+utils.escapeHtml(label)+'</button>';
      return '<button class="namaa-agent-action" type="button" data-agent-output="'+utils.escapeHtml(action)+'">'+utils.escapeHtml(label)+'</button>';
    }).join('');
    return '<section class="namaa-agent-dashboard" style="--agent-accent:'+utils.escapeHtml(meta.accent)+'" data-agent-dashboard="'+utils.escapeHtml(key)+'">'+
      '<header class="namaa-agent-dashboard-head"><div><span>'+utils.escapeHtml(meta.icon)+' '+utils.escapeHtml(meta.kicker)+'</span><h3>'+utils.escapeHtml(meta.title)+'</h3><p>'+utils.escapeHtml(meta.intro)+'</p></div><strong>'+score+'% DNA</strong></header>'+
      '<div class="namaa-agent-dna-strip">'+(meta.stats || []).map(function(item){return dashboardStatHtml(brief,item);}).join('')+'</div>'+
      agentDashboardVisualHtml(meta,brief)+
      '<div class="namaa-agent-card-grid">'+cards+'</div>'+
      projectOutputsMiniHtml(key)+
      '<div class="namaa-agent-dashboard-actions"><button class="namaa-agent-action secondary" type="button" data-output-action="open-outputs">Outputs view</button>'+actions+'</div>'+
      '<p class="namaa-agent-dashboard-note">Dashboard adapted from Project DNA. Namaa AI Talk remains the main chat; this agent only prepares the right workspace and output actions.</p>'+
    '</section>';
  }
  function setDashboardAgent(key){
    var meta=adaptiveAgentDashboards[key];
    if(!meta)return;
    currentAgent=key;
    document.body.setAttribute('data-namaa-agent',key);
    if(activeModeLabel)activeModeLabel.textContent=meta.label;
    if(input)input.placeholder=meta.placeholder || 'Ask Namaa...';
    if(hero && heroTitle){
      heroKicker.textContent=meta.kicker;
      heroTitle.textContent=meta.label+' — dashboard ready from Project DNA.';
      heroIntro.textContent=meta.intro;
    }
    syncAgentButtons(key);
    setSidebarNote(meta.icon,meta.label,'Dashboard adapted to the active Project DNA. Chat stays available on the left.');
    closePlusMenu();
    closeSidebar();
  }
  function openAgentDashboard(key){
    var meta=adaptiveAgentDashboards[key];
    if(!meta)return;
    if(!projectDNAReady()){
      setSidebarNote('🧬','Project DNA needed','Start Project Build first. Namaa AI Talk will collect the info then unlock this dashboard.');
      startProjectFactoryMode();
      return;
    }
    setDashboardAgent(key);
    openPreview(meta.icon+' Namaa Agent',meta.label,agentDashboardHtml(key));
    window.setTimeout(function(){if(input)input.focus();},30);
  }
  function syncAgentButtons(agent){
    document.querySelectorAll('[data-agent]').forEach(function(el){
      el.classList.toggle('is-active',el.getAttribute('data-agent')===agent);
    });
    document.querySelectorAll('[data-dna-agent]').forEach(function(el){
      el.classList.toggle('is-active',el.getAttribute('data-dna-agent')===agent);
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
    return '<p class="namaa-talk-rule">Namaa AI Talk gathers the brief. The sidebar agents use that Project DNA later for research, strategy, marketing, CRM, mockups, automation and website outputs.</p>';
  }
  function entryChoiceHeroHtml(){
    return '<div class="namaa-choice-stage" aria-label="Namaa entry choice">'+
      '<div class="namaa-choice-badge"><span>✨</span><strong>Namaa AI Talk</strong><small>Chat first · agents use Project DNA</small></div>'+
      '<h2>Chno bghiti ndirou lyoum?</h2>'+ 
      '<p>Namaa AI Talk huwa l chat principal. Free Talk = dwi kif bghiti. Project Build = Namaa kaysewlek questions simple bach agents ykhdmo b Project DNA wahd, clean w organised.</p>'+ 
      '<div class="namaa-entry-grid namaa-entry-grid-premium" aria-label="Choisir le mode Namaa">'+
        '<button class="namaa-entry-card namaa-entry-talk" type="button" data-flow-action="free-talk-mode"><span>💬</span><strong>Free Talk</strong><small>Hder m3a Namaa b Darija Latin, French ola English. Business, AI, IT, marketing, startups.</small><em>Chat libre</em></button>'+ 
        '<button class="namaa-entry-card namaa-entry-build" type="button" data-flow-action="build-project-flow"><span>🏗️</span><strong>Project Build</strong><small>Namaa yjme3 Project DNA: category, city, target, offer, budget, goals, channels.</small><em>Agents-ready brief</em></button>'+ 
      '</div>'+ 
      '<div class="namaa-language-strip" aria-label="Supported languages"><span>Darija Latin</span><span>Français</span><span>English</span><span>Arabic on request</span></div>'+ 
    '</div>';
  }
  function guidedCtaHtml(){
    return entryChoiceHeroHtml()+agentMapHtml();
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
      '<div class="namaa-action-card namaa-controller-card namaa-document-choice"><div><span>🧠</span><strong>Brief prêt. On choisit le bon document.</strong><p>Namaa ma ghadi ykhrrej ta document twil bla confirmation dyalek. Khtar chno bghiti nwjdo w nmchiw step by step.</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-talk-action="market_research"><span>🔎</span>Market Research PDF</button><button class="namaa-mini-button" type="button" data-talk-action="marketing_strategy"><span>📈</span>Marketing Strategy PDF</button><button class="namaa-mini-button secondary" type="button" data-talk-action="roadmap"><span>🗺️</span>Roadmap PDF</button></div></div>';
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
    'Français professionnel':'FR','Darija Latin':'DA','Français + Darija':'FR+DA','Arabic on request':'AR','English':'EN'
  };
  var intakeSteps=[
    {key:'projectName',type:'input',maxLength:60,label:'Smiya dyal project?',hint:'Ktib smiya b tariqa simple. Ila mazal ma 3andkch smiya, ktib idea dyalek.',placeholder:'Exemple : Namaa Kids',footer:'Nom du projet',micro:'Namaa ghadi ybni project identity 3la had smiya.'},
    {key:'stage',label:'Fin wsel project daba?',hint:'Khtar l stage li qriba bach Namaa y3ref wach ykhdem launch, relance ola validation.',footer:'Étape du projet',options:['Nouveau projet à lancer','Idée initiale à transformer en projet','Projet existant à relancer']},
    {key:'category',label:'Chno type dyal project?',hint:'Khtar category principale. Men ba3d Namaa y3tik branches aktar diqqa.',footer:'Type de projet',options:(taxonomyCategories || ['SaaS / application','E-commerce / vente de produits','Clinique / médical','Restaurant / food','Agence / service pro','Service local','Formation / cours','Immobilier','Beauté / lifestyle','Tourisme / hébergement','AI automation / IT','Marketplace','Mobile app'])},
    {key:'branch',label:'Chno branch lqrib?',hint:'Had l ikhtiyar kay3awn Strategy, Design w Web Agent ykhtaro template w mockups monasbin.',footer:'Branche',dynamic:true},
    {key:'market',label:'Fin ghadi tkhdem?',hint:'Khtar Morocco kamel ola city bach market research ykoun local w useful.',footer:'Marché',options:(taxonomyCities || ['Maroc entier','Casablanca','Rabat','Marrakech','Tanger','Agadir','Fès','Meknès','Kénitra','Oujda','Taroudant','Tétouan','El Jadida','Safi','Béni Mellal','Nador','Laâyoune','Autre ville / région'])},
    {key:'budget',label:'Ch7al budget marketing?',hint:'Budget taqribi kafi. Namaa ghadi yiqtereh plan waqi3i bla exaggeration.',footer:'Budget',options:['Moins de 1000 DH','1000 - 3000 DH','3000 - 7000 DH','7000 - 15000 DH','Plus de 15000 DH','Pas encore défini']},
    {key:'goal',label:'Chno goal lwel?',hint:'Khtar result li baghi daba, machi kolchi f marra wahda.',footer:'Objectif',options:['Trouver les premiers clients','Générer des leads WhatsApp','Vendre plus en ligne','Lancer une offre claire','Créer une landing page','Améliorer la visibilité','Structurer le marketing','Trouver une idée rentable']},
    {key:'target',label:'Chkoun awel client?',hint:'Hedded awal audience li baghi twsl liha. Hadi katqwi messaging w ads.',footer:'Cible',options:['Clients locaux proches','PME / professionnels','Familles','Jeunes / étudiants','Femmes intéressées beauté','Acheteurs Instagram/TikTok','Touristes / visiteurs','Entrepreneurs / startups','Pas encore défini']},
    {key:'offer',type:'input',maxLength:180,label:'Chno offer ola service?',hint:'Jomla wahda kafya: chno ghadi tbi3 ola tqdem, w chno l advantage principale?',placeholder:'Exemple : consultation gratuite + plan marketing 30 jours',footer:'Offre',micro:'Namaa ghadi yhawwelha l positioning w sales messages.'},
    {key:'channels',label:'Chno 3andk daba men channels?',hint:'Tqder tkhtar aktar men channel. Ila ma 3andk walo, khtar Aucun canal.',footer:'Canaux',multi:true,options:['Aucun canal','Instagram','TikTok','Facebook','WhatsApp','Site web','Google Maps','Publicité déjà lancée']},
    {key:'language',label:'B ay language bghiti Namaa ykhrrej result?',hint:'Khtar l language principale dyal PDF w chat. Darija = Latin letters. Arabic script only if requested.',footer:'Langue',options:['Darija Latin','Français professionnel','Français + Darija','Arabic on request','English']}
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
    return '<aside class="namaa-intake-preview namaa-intake-preview-v51" aria-label="Project DNA preview"><div class="namaa-intake-preview-head"><span>Live Project DNA</span><strong>'+score+'%</strong></div><div class="namaa-intake-preview-ring" style="--brief-score:'+score+'"><i>'+score+'%</i></div><p>Namaa kayjme3 brief wahd, clean w structured. Men had DNA, agents ykhrjo research, strategy, mockups, CRM w website bla prompt chaos.</p>'+insight+intakeAgentHandoffHtml()+'<ul>'+rows+'</ul></aside>';
  }
  function intakeStageRailHtml(currentIndex){
    var groups=[['Brief','projectName'],['Type','category'],['Market','market'],['Offer','offer'],['Channels','channels'],['Output','language']];
    return '<div class="namaa-intake-stage-rail namaa-intake-stage-rail-v51">'+groups.map(function(item){
      var relatedIndex=intakeSteps.findIndex(function(step){return step.key===item[1];});
      var klass=currentIndex>=relatedIndex?'is-active':'';
      return '<span class="'+klass+'"><b></b>'+utils.escapeHtml(item[0])+'</span>';
    }).join('')+'</div>';
  }
  function intakeAgentHandoffHtml(){
    var agentsList=[['🔎','Market'],['🧭','Strategy'],['📣','Marketing'],['🟢','CRM'],['🎨','Mockups'],['💻','Website']];
    return '<div class="namaa-intake-preview-agents" aria-label="Agents using this Project DNA"><strong>Agents li ghadi ykhdmo b had DNA</strong><div>'+agentsList.map(function(item){return '<span><b>'+utils.escapeHtml(item[0])+'</b>'+utils.escapeHtml(item[1])+'</span>';}).join('')+'</div></div>';
  }
  function intakeStepHelpHtml(step,index){
    var tips={
      projectName:['Identity','Smiya kat3awn logo, headline, mockups w website hero.'],
      stage:['Execution level','Stage kay7edded wach Namaa yrkkez 3la validation, launch ola relance.'],
      category:['Agent routing','Category katkhtar market signals, templates, mockup pack w website structure.'],
      branch:['Precision','Branch katkhelli results machi generic, w katqerreb strategy l real Moroccan market.'],
      market:['Local context','City/market kaybeddel pricing, competitors, channels w language tone.'],
      budget:['Realistic plan','Budget kaykhelli marketing plan practical w ma fihch exaggeration.'],
      goal:['Priority','Goal kaykhelli agents ykhdmo 3la result wahed wadih f lwel.'],
      target:['Message fit','Audience kay7edded copywriting, offer angle w ads targeting direction.'],
      offer:['Positioning','Offer hiya l material lkhama dyal headline, CTA, WhatsApp script w pricing logic.'],
      channels:['Workflow','Channels kaybeyen wach nhtajo landing page, WhatsApp CRM, content plan ola ads.'],
      language:['Output style','Language kat7edded kifach ykhrrej PDF, scripts, mockups text w chat tone.']
    };
    var tip=tips[step.key] || ['Project DNA','Had jawab kay3awn agents ykhdmo b clarity.'];
    var agentLabels={projectName:'Brand + Mockups',stage:'Startup Launch',category:'All Agents',branch:'Market + Design',market:'Market Research',budget:'Marketing Agent',goal:'Strategy Agent',target:'Ads + Copy',offer:'Website + CRM',channels:'CRM + Automation',language:'All Outputs'};
    return '<div class="namaa-intake-help"><div><span>Why it matters</span><strong>'+utils.escapeHtml(tip[0])+'</strong><p>'+utils.escapeHtml(tip[1])+'</p></div><em>'+utils.escapeHtml(agentLabels[step.key] || 'Namaa Agents')+'</em></div>';
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
  function projectDnaHandoffHtml(dna){
    if(!dna)return '';
    var brief=dna.brief || {};
    return '<div class="namaa-project-dna-card"><div><span>🧬</span><strong>Project DNA saved</strong><p>'+utils.escapeHtml((brief.projectName || 'Project')+' · '+(brief.category || 'Business')+' · '+(brief.market || 'Morocco'))+'</p></div><small>'+utils.escapeHtml((dna.score || briefScore(brief))+'% agents-ready')+'</small></div>';
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
    modal.className='namaa-intake-modal namaa-intake-modal-v38 namaa-intake-modal-v51';
    modal.innerHTML='<div class="namaa-intake-backdrop"></div>'+ 
      '<section class="namaa-intake-card namaa-intake-card-v38 namaa-intake-card-v51" role="dialog" aria-modal="true" aria-label="Namaa Project DNA Builder">'+ 
        '<header><div><span>🏗️ Project Build</span><h2>Namaa Project DNA Builder</h2><p>One clean popup. One structured brief. All agents use the same data to generate research, strategy, marketing, CRM, mockups and website outputs.</p></div><div class="namaa-intake-header-stats"><b>'+progress+'%</b><small>'+utils.escapeHtml(step.footer || 'Project DNA')+'</small></div><button type="button" data-intake-close aria-label="Fermer">×</button></header>'+ 
        intakeStageRailHtml(index)+
        '<div class="namaa-intake-progress"><i style="width:'+progress+'%"></i></div>'+ 
        '<div class="namaa-intake-layout">'+
          '<div class="namaa-intake-body"><div class="namaa-intake-step-badge"><span>'+utils.escapeHtml(intakeStepIcons[step.key] || '✨')+'</span><b>Step '+(index+1)+'/'+intakeSteps.length+'</b><em>'+progress+'% ready</em></div><h3>'+utils.escapeHtml(step.label)+'</h3><p>'+utils.escapeHtml(step.hint || '')+'</p>'+renderIntakeControl(step,value)+(step.micro?'<small class="namaa-intake-micro">'+utils.escapeHtml(step.micro)+'</small>':'')+intakeStepHelpHtml(step,index)+'</div>'+
          intakeBriefPreviewHtml(index)+
        '</div>'+ 
        '<footer><strong>Project DNA · '+utils.escapeHtml(step.footer || '')+' · '+(index+1)+'/'+intakeSteps.length+'</strong><div><button type="button" class="namaa-intake-back" data-intake-back '+(index===0?'disabled':'')+'>Retour</button><button type="button" class="namaa-intake-next" data-intake-next>'+(index===intakeSteps.length-1?'Create Project DNA':'Suivant')+'</button></div></footer>'+ 
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
    var dna=setProjectDNA(Object.assign({},appState.projectBriefDraft || {}));
    setFlowStage('brief-ready');
    closeIntakeWizard();
    setAgent('talk');
    document.body.classList.add('namaa-has-messages');
    if(hero){hero.remove();hero=null;}
    var summary=briefSummaryHtml(appState.projectBrief)+projectDnaHandoffHtml(dna);
    addMessage('user',summary);
    addHistory('user',formatBrief(appState.projectBrief));
    var ready='<p>Parfait. Project DNA wlla ready w organised. Daba agents yqedro ykhdmo b nafs lma3lomat bla ma n3awdo nsowlok.</p><p>Khtar output li bghiti Namaa ywjed lik daba.</p><div class="namaa-dna-ready-strip"><span>🔎 Market</span><span>🧭 Strategy</span><span>📣 Marketing</span><span>🟢 CRM</span><span>🎨 Mockups</span><span>💻 Website</span></div>'+documentChoiceCardHtml();
    addMessage('ai','<div class="namaa-answer-head"><span>Namaa Talk</span><strong>Project DNA ready</strong></div>'+ready);
    addHistory('assistant','Project DNA ready. Choose Market Research, Marketing Strategy or Roadmap.');
    openPreview('Project Factory','Outputs ready view',projectOutputsReadyHtml('dna-ready'));
  }
  function resetChat(){
    var preservedDNA=appState.projectDNA;
    currentAgent='talk';
    document.body.setAttribute('data-namaa-agent','talk');
    if(activeModeLabel)activeModeLabel.textContent='Namaa Talk';
    if(input)input.placeholder=(agentConfig('talk').placeholder || 'Ask Namaa...');
    syncAgentButtons('talk');
    closePreview();
    thread.innerHTML='';
    document.body.classList.remove('namaa-has-messages');
    history=[];
    appState.lastTalkQuestion='';
    appState.lastDevFiles=null;
    appState.projectBrief=preservedDNA ? Object.assign({},preservedDNA.brief || {}) : null;
    appState.lastStrategyText='';
    appState.lastStrategyHtml='';
    setFlowStage(preservedDNA ? 'brief-ready' : 'intake');
    appState.lastMockupQuestion='';
    appState.lastDevQuestion='';
    appState.lastDeliverableType='';
    appState.createdDocuments={};
    appState.lastSources=[];
    appState.sourcePolicy='';
    syncProjectDNAUI();
    var meta=agentConfig(currentAgent);
    var welcome=document.createElement('div');
    welcome.className='namaa-welcome';
    welcome.id='namaaHero';
    welcome.innerHTML='<div class="namaa-orb" aria-hidden="true"><span>N</span></div>'+ 
      '<p class="namaa-kicker" id="namaaHeroKicker">'+utils.escapeHtml(meta.hero.kicker)+'</p>'+ 
      '<h1 id="namaaHeroTitle">Namaa AI Talk — free chat first, Project Build when needed.</h1>'+ 
      '<p class="namaa-intro" id="namaaHeroIntro">Free Talk is only for conversation. Project Build opens a guided popup that creates one Project DNA for all agents.</p>'+ 
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
        setProjectDNA(Object.assign({},appState.projectBrief || {},result.state.projectBriefPatch || {}));
      }
      Object.keys(result.state).forEach(function(key){
        if(key!=='projectBriefPatch')appState[key]=result.state[key];
      });
      if(result.state.projectDNA || result.state.projectBrief){
        var nextDNA=result.state.projectDNA || createProjectDNA(result.state.projectBrief);
        setProjectDNA(nextDNA.brief || result.state.projectBrief || {});
      }
    }
    if(result && result.preview)openPreview(result.preview.type,result.preview.title,result.preview.bodyHtml);
    return (result && result.answerHtml) || '<p>Namaa is ready.</p>';
  }
  function adaptiveAgentLocalAnswer(question,key){
    var meta=adaptiveAgentDashboards[key];
    if(!meta)return null;
    var brief=(appState.projectDNA && appState.projectDNA.brief) || appState.projectBrief || {};
    var project=briefTextValue(brief,'projectName','your project');
    var category=briefTextValue(brief,'category','business');
    var market=briefTextValue(brief,'market','Morocco');
    var focus={
      market:['Demand and cities','Direct competitors','Pricing signals','First validation test'],
      strategy:['Positioning','Offer architecture','30/60/90 roadmap','Decision KPIs'],
      marketing:['Funnel','Meta/Google/TikTok angles','Content hooks','Lead generation CTA'],
      crm:['First WhatsApp reply','Lead qualification','Status pipeline','Follow-up rhythm'],
      startup:['MVP scope','Validation test','Pricing hypothesis','Launch checklist'],
      automation:['Workflow map','Simple tool stack','AI use cases','Human review points'],
      website:['Landing structure','SEO base','Mobile UX','Performance checklist'],
      images:['Logo direction','Brand board','Website mockup','Launch visual pack']
    }[key] || ['Clear next step','Project context','Practical action','Output direction'];
    var cards=focus.map(function(item,index){return '<li><span class="namaa-compact-index">'+String(index+1).padStart(2,'0')+'</span><span><strong>'+utils.escapeHtml(item)+'</strong><br>'+utils.escapeHtml('Use the active Project DNA for '+project+' · '+category+' · '+market+'.')+'</span></li>';}).join('');
    return '<div class="namaa-answer-head"><span>'+utils.escapeHtml(meta.label)+'</span><strong>Agent response from Project DNA</strong></div>'+
      '<div class="namaa-free-answer"><h2>'+utils.escapeHtml(meta.label)+' kaykhdem 3la '+utils.escapeHtml(project)+'.</h2><p>'+utils.escapeHtml('Based on your question: '+question)+
      '</p><p>Had jawb local preview. Mli API ytkonecta, nafs agent ghadi ykhrrej result aktar deep b nafs Project DNA.</p></div>'+
      '<ul class="namaa-compact-list">'+cards+'</ul>'+
      '<div class="namaa-cta-row namaa-free-cta-row"><button class="namaa-mini-button" type="button" data-agent-output="'+utils.escapeHtml((appState.projectDNA && appState.projectDNA.agents && appState.projectDNA.agents[key] && appState.projectDNA.agents[key].output) || 'marketing_strategy')+'">Build output</button><button class="namaa-mini-button secondary" type="button" data-output-action="open-outputs">Outputs view</button></div>';
  }
  function localAnswer(question){
    var dashboardAnswer=adaptiveAgentLocalAnswer(question,currentAgent);
    if(dashboardAnswer)return dashboardAnswer;
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
  function freeTalkStartHtml(){
    return '<div class="namaa-mode-start namaa-mode-free namaa-free-talk-panel">'+
      '<span>💬</span><strong>Free Talk ready</strong><p>Hani m3ak 👋 Free Talk huwa chat only. Dwi kif bghiti 3la business, AI, IT, marketing, startups, websites, WhatsApp/CRM f Morocco.</p>'+ 
      '<div class="namaa-free-talk-topics"><b>Topics</b><em>Business ideas</em><em>Marketing</em><em>Website</em><em>WhatsApp CRM</em><em>AI automation</em><em>Startup launch</em></div>'+ 
      '<div class="namaa-free-talk-quickgrid">'+
        '<button type="button" data-prompt="3tini 5 business ideas suitable for Morocco"><span>💡</span><strong>Business ideas</strong><small>Ideas + quick validation</small></button>'+ 
        '<button type="button" data-prompt="Create a 7-day content plan for my project in Morocco"><span>📣</span><strong>Marketing plan</strong><small>Content + ads direction</small></button>'+ 
        '<button type="button" data-prompt="Write WhatsApp qualification script for my project"><span>🟢</span><strong>WhatsApp script</strong><small>Lead qualification flow</small></button>'+ 
        '<button type="button" data-flow-action="guided-intake"><span>🏗️</span><strong>Project Build</strong><small>Open Project DNA popup</small></button>'+ 
      '</div>'+ 
    '</div>';
  }
  function startFreeTalkMode(){
    setAgent('talk');
    document.body.classList.add('namaa-has-messages','namaa-free-talk-active');
    if(hero){hero.remove();hero=null;}
    addMessage('ai',freeTalkStartHtml());
    addHistory('assistant','Free Talk ready.');
    setFlowStage('free-talk');
    setSidebarNote('💬','Free Talk','Chat only. Say Project Build anytime to open the guided Project DNA popup for all agents.');
    input.placeholder='Free Talk: hder m3a Namaa f business, AI, IT, marketing, startups...';
    bindPromptButtons(thread.lastElementChild || thread);
    input.focus();
  }
  function shouldOpenProjectBuild(question){
    var text=String(question || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return /\b(build project|project build|build my project|project dna|lancer le brief|brief projet|nbni project|bni project)\b/.test(text);
  }
  function startProjectFactoryMode(){
    setAgent('talk');
    setFlowStage('project-builder');
    setSidebarNote('🏗️','Project Factory','Build Project Wizard: category, city, budget, goal, audience, channels and language.');
    startIntakeWizard();
  }

  function strategyAgentDocMeta(type){
    var docs={
      market_research:{icon:'🔎',title:'Market Research Agent',label:'Market Research PDF',badge:'Research mode',verb:'kayhlel market',accent:'research',sections:['Brief cleanup','Morocco market context','Customer behavior','Alternatives/competitors','Opportunity gap','Validation plan'],note:'Namaa kayqra lbrief, kayrteb market, w kaykhrrej diagnostic clear qbel ay strategy.'},
      marketing_strategy:{icon:'📈',title:'Marketing Strategy Agent',label:'Marketing Strategy PDF',badge:'Strategy mode',verb:'kaybni plan marketing',accent:'strategy',sections:['Positioning','Offer message','Funnel map','30-day action plan','Budget split','WhatsApp/KPIs'],note:'Namaa kayhwel data l plan practical: content, ads, WhatsApp, budget w KPIs.'},
      roadmap:{icon:'🗺️',title:'Roadmap Agent',label:'Launch Roadmap PDF',badge:'Execution mode',verb:'kaywjed roadmap',accent:'roadmap',sections:['Launch objective','Week 1 setup','Week 2 content','Week 3 ads/leads','Week 4 optimization','Decision rules'],note:'Namaa kayqsem project l weekly steps bach execution ykoun clear w machi random.'}
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
      '<div class="namaa-strategy-loader-head"><div class="namaa-agent-orbit"><span>'+utils.escapeHtml(meta.icon)+'</span><i></i><i></i></div><div><em>'+utils.escapeHtml(meta.badge)+'</em><strong>'+utils.escapeHtml(meta.title)+' is working</strong><p>'+utils.escapeHtml(meta.verb)+'… Namaa kaywjed document b tariqa organised, machi random answer.</p></div></div>'+ 
      '<div class="namaa-strategy-live-brief">'+strategyBriefMiniHtml(brief)+'</div>'+ 
      '<ol class="namaa-strategy-build-steps">'+sections+'</ol>'+ 
      '<div class="namaa-strategy-loader-bar"><span></span></div>'+ 
      '<p class="namaa-strategy-loader-note">Khud nafas sghir ☕ Strategy Agent kaykhdem 3la '+utils.escapeHtml(meta.label)+' bach tkoun result clean w PDF-ready.</p>'+ 
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
      '<p class="namaa-preview-note">Right panel kaywrik chno kaydir Strategy Agent. Mlli ysal, PDF preview ghadi yban hna.</p>'+ 
    '</section>';
  }
  function strategyFactoryDoneCardHtml(type,brief){
    var meta=strategyAgentDocMeta(type);
    return flowProgressHtml('strategy')+
      '<div class="namaa-strategy-done-card namaa-flow-card"><div><span>'+utils.escapeHtml(meta.icon)+'</span><strong>'+utils.escapeHtml(meta.label)+' generated</strong><p>Strategy Agent sala l phase lwla. Daba t9der tchouf PDF preview ola download document brandé Namaa + Elboubakry.</p></div></div>';
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
      '<div class="namaa-design-loader-head"><div class="namaa-agent-orbit namaa-design-orbit"><span>🎨</span><i></i><i></i></div><div><em>Design Agent</em><strong>Namaa kaysawb logo + mockups</strong><p>Kanqra lbrief, kankhtar visual direction, w kanhder board adapté lcategory.</p></div></div>'+ 
      '<div class="namaa-design-live-brief">'+designMiniBriefHtml(brief)+'</div>'+ 
      '<div class="namaa-design-canvas-skeleton"><div class="namaa-design-logo-skel"><i></i><strong>Logo concept</strong><small>'+utils.escapeHtml(pack.logoIdea || 'Premium mark')+'</small></div><div class="namaa-design-device-skel"><span></span><span></span><span></span><b>'+utils.escapeHtml(pack.primaryAsset || 'Mockup board')+'</b></div></div>'+ 
      '<ol class="namaa-design-build-steps"><li class="is-active"><b>01</b><span>Reading Project DNA</span><i></i></li><li><b>02</b><span>Generating logo direction</span><i></i></li><li><b>03</b><span>Preparing category mockups</span><i></i></li><li><b>04</b><span>Rendering preview board</span><i></i></li></ol>'+ 
      '<div class="namaa-design-loader-bar"><span></span></div>'+ 
      '<p class="namaa-design-loader-note">Sna chwya 🎨 Design Agent kaykhdem bhal atelier: logo, mockup, social/print assets 7sab l project.</p>'+ 
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
      '<p class="namaa-preview-note">Right panel kaywrik Design Agent howa khdam. Mlli ysal ghadi yban logo/mockup board hna.</p>'+ 
    '</section>';
  }
  function designFactoryDoneCardHtml(question,brief){
    var pack=designAgentPack(question,brief);
    return flowProgressHtml('images')+
      '<div class="namaa-flow-card namaa-design-done-card"><div><span>🎨</span><strong>Design Agent salat lmockup pack.</strong><p>'+utils.escapeHtml(pack.label || 'Creative pack')+' wajed f right panel: logo direction, mockup board, assets w style. Daba nqder ndouzo l Web Agent.</p></div></div>';
  }

  function agentOutputPreviewHtml(agentKey){
    var brief=appState.projectBrief || (appState.projectDNA && appState.projectDNA.brief) || {};
    var meta={
      marketing:{icon:'📣',title:'Marketing Agent ready',text:'Ghayst3mel Project DNA bach ywjed campaign structure, funnel, content plan, CTA and lead generation direction.'},
      crm:{icon:'🟢',title:'WhatsApp & CRM ready',text:'Ghaybni script, qualification questions, statuses and follow-up flow based on the same offer and audience.'},
      automation:{icon:'⚙️',title:'AI & Automation ready',text:'Ghayqtereh tools, workflows and simple systems li yqedro yn9so manual work f had project.'}
    }[agentKey] || {icon:'🧬',title:'Agent ready',text:'Had agent ghadi ykhdem b Project DNA li tsavea daba.'};
    return '<div class="namaa-flow-card namaa-dna-agent-ready"><div><span>'+utils.escapeHtml(meta.icon)+'</span><strong>'+utils.escapeHtml(meta.title)+'</strong><p>'+utils.escapeHtml(meta.text)+'</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-talk-action="marketing_strategy">Create strategy</button><button class="namaa-mini-button secondary" type="button" data-flow-action="guided-intake">Edit DNA</button></div></div>'+projectDnaHandoffHtml(appState.projectDNA || createProjectDNA(brief));
  }

  function projectOutputState(key){
    var docs=appState.createdDocuments || {};
    if(key==='dna')return projectDNAReady() ? 'ready' : 'locked';
    if(key==='market')return docs.market_research ? 'ready' : (projectDNAReady() ? 'available' : 'locked');
    if(key==='strategy')return docs.marketing_strategy ? 'ready' : (projectDNAReady() ? 'available' : 'locked');
    if(key==='roadmap')return docs.roadmap ? 'ready' : (projectDNAReady() ? 'available' : 'locked');
    if(key==='mockups')return (docs.images || !!appState.lastMockupQuestion) ? 'ready' : (projectDNAReady() ? 'available' : 'locked');
    if(key==='website')return (docs.dev || !!appState.lastDevQuestion || !!appState.lastDevFiles) ? 'ready' : (projectDNAReady() ? 'available' : 'locked');
    if(key==='crm')return projectDNAReady() ? 'available' : 'locked';
    return projectDNAReady() ? 'available' : 'locked';
  }
  function projectOutputStatusLabel(state){
    if(state==='ready')return 'Ready';
    if(state==='available')return 'Ready to build';
    return 'Needs DNA';
  }
  function projectOutputItems(){
    return [
      {key:'dna',icon:'🧬',title:'Project DNA',text:'One clean brief that feeds all Namaa agents.',action:'guided-intake',cta:'Edit DNA'},
      {key:'market',icon:'🔎',title:'Market Research',text:'Cities, competitors, demand signals and pricing reality.',action:'market_research',cta:'Build research'},
      {key:'strategy',icon:'🧭',title:'Strategy PDF',text:'Positioning, offer, funnel, budget, KPIs and plan.',action:'marketing_strategy',cta:'Build strategy'},
      {key:'roadmap',icon:'🗺️',title:'Launch Roadmap',text:'30/60/90 execution roadmap with next actions.',action:'roadmap',cta:'Build roadmap'},
      {key:'mockups',icon:'🎨',title:'Logo & Mockups',text:'Logo direction, visual board and ready mockup pack.',action:'images',cta:'Build visuals'},
      {key:'website',icon:'💻',title:'Website Preview',text:'Landing page preview, copy blocks and downloadable files.',action:'dev',cta:'Build website'},
      {key:'crm',icon:'🟢',title:'WhatsApp / CRM',text:'Lead qualification, reply scripts and follow-up flow.',action:'crm_prompt',cta:'Create scripts'}
    ];
  }
  function outputActionButtonHtml(item,state){
    if(state==='locked')return '<button type="button" data-flow-action="guided-intake">Create DNA</button>';
    if(item.action==='guided-intake')return '<button type="button" data-flow-action="guided-intake">'+utils.escapeHtml(item.cta)+'</button>';
    if(item.action==='images')return '<button type="button" data-agent-output="images">'+utils.escapeHtml(item.cta)+'</button>';
    if(item.action==='dev')return '<button type="button" data-agent-output="dev">'+utils.escapeHtml(item.cta)+'</button>';
    if(item.action==='crm_prompt')return '<button type="button" data-output-action="crm-prompt">'+utils.escapeHtml(item.cta)+'</button>';
    return '<button type="button" data-agent-output="'+utils.escapeHtml(item.action)+'">'+utils.escapeHtml(item.cta)+'</button>';
  }
  function projectOutputsReadyHtml(focus){
    var dna=appState.projectDNA || createProjectDNA(appState.projectBrief || {});
    var brief=dna.brief || {};
    var items=projectOutputItems();
    var readyCount=items.filter(function(item){return projectOutputState(item.key)==='ready';}).length;
    var cards=items.map(function(item,index){
      var state=projectOutputState(item.key);
      return '<article class="namaa-output-ready-card is-'+state+'" style="--delay:'+(index*38)+'ms">'+
        '<div class="namaa-output-ready-top"><span>'+utils.escapeHtml(item.icon)+'</span><em>'+utils.escapeHtml(projectOutputStatusLabel(state))+'</em></div>'+
        '<strong>'+utils.escapeHtml(item.title)+'</strong>'+
        '<p>'+utils.escapeHtml(item.text)+'</p>'+
        '<div class="namaa-output-ready-action">'+outputActionButtonHtml(item,state)+'</div>'+
      '</article>';
    }).join('');
    return '<section class="namaa-outputs-ready-view" data-focus="'+utils.escapeHtml(focus || 'all')+'">'+
      '<header class="namaa-outputs-ready-head"><div><span>✅ Project Factory Outputs</span><h3>Outputs ready view</h3><p>Had panel kaybayan chno wajed, chno mazal, w chno t9der tbni daba b nafs Project DNA. No fake promise: ready means generated in this session.</p></div><strong>'+readyCount+'/'+items.length+'</strong></header>'+
      '<div class="namaa-outputs-project-strip">'+
        '<span><small>Project</small><b>'+utils.escapeHtml(brief.projectName || 'Project not named')+'</b></span>'+
        '<span><small>Category</small><b>'+utils.escapeHtml(brief.category || 'Business')+'</b></span>'+
        '<span><small>Market</small><b>'+utils.escapeHtml(brief.market || 'Morocco')+'</b></span>'+
        '<span><small>Goal</small><b>'+utils.escapeHtml(brief.goal || 'Growth')+'</b></span>'+
      '</div>'+
      '<div class="namaa-output-timeline" aria-label="Namaa project factory flow"><i></i><span>Talk</span><span>DNA</span><span>Research</span><span>Strategy</span><span>Mockups</span><span>Website</span><span>CRM</span></div>'+
      '<div class="namaa-outputs-ready-grid">'+cards+'</div>'+
      '<footer><p>Namaa AI Talk stays chat only. Agents and outputs use the Project DNA to prepare organised results in the right panel.</p><button type="button" data-output-action="open-outputs">Refresh view</button></footer>'+
    '</section>';
  }
  function projectOutputsMiniHtml(focus){
    var items=projectOutputItems();
    var mini=items.slice(1,6).map(function(item){
      var state=projectOutputState(item.key);
      return '<span class="is-'+state+'"><b>'+utils.escapeHtml(item.icon)+'</b><small>'+utils.escapeHtml(item.title)+'</small><em>'+utils.escapeHtml(projectOutputStatusLabel(state))+'</em></span>';
    }).join('');
    return '<div class="namaa-agent-outputs-mini"><div><strong>Outputs readiness</strong><button type="button" data-output-action="open-outputs">Open full view</button></div><section>'+mini+'</section></div>';
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
    var labels={talk:'Namaa kayjawb...',images:'Namaa kaywjed mockup...',dev:'NamaaDev kaybni preview...'};
    return '<div class="namaa-typing"><span></span><span></span><span></span><em>'+utils.escapeHtml(labels[agent] || 'Namaa kaykteb...')+'</em></div>';
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
    if(submittedAgent==='talk' && shouldOpenProjectBuild(q)){
      setFlowStage('project-builder');
      addMessage('ai','<div class="namaa-answer-head"><span>Project Build</span><strong>Opening popup</strong></div><p>Mzyan. Namaa AI Talk ghadi yjme3 Project DNA f popup organized, w agents kamlin ghadi ykhdmo b nafs Project DNA men ba3d.</p>');
      addHistory('assistant','Opening Project Build popup.');
      window.setTimeout(function(){startProjectFactoryMode();},180);
      return;
    }
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
        appState.createdDocuments=appState.createdDocuments || {};
        appState.createdDocuments.images=true;
        html=designFactoryDoneCardHtml(q,appState.projectBrief)+html+imageNextStepHtml();
        openPreview('Project Factory','Outputs ready view',projectOutputsReadyHtml('mockups'));
      }
      if(submittedAgent==='dev' && appState.projectBrief){
        setFlowStage('complete');
        appState.lastDevQuestion=q;
        appState.createdDocuments=appState.createdDocuments || {};
        appState.createdDocuments.dev=true;
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
    var outputActionBtn=event.target.closest('[data-output-action]');
    if(outputActionBtn){
      var outputAction=outputActionBtn.getAttribute('data-output-action');
      if(outputAction==='open-outputs'){
        openPreview('Project Factory','Outputs ready view',projectOutputsReadyHtml(currentAgent));
        return;
      }
      if(outputAction==='crm-prompt'){
        if(!projectDNAReady()){startProjectFactoryMode();return;}
        openAgentDashboard('crm');
        input.value=dashboardPromptFor('crm');
        input.dispatchEvent(new Event('input'));
        input.focus();
        return;
      }
    }
    var dnaAgentBtn=event.target.closest('[data-dna-agent]');
    if(dnaAgentBtn){
      var dnaAgent=dnaAgentBtn.getAttribute('data-dna-agent');
      openAgentDashboard(dnaAgent);
      return;
    }
    var agentOutputBtn=event.target.closest('[data-agent-output]');
    if(agentOutputBtn){
      var agentOutput=agentOutputBtn.getAttribute('data-agent-output');
      if(agentOutput==='market_research' || agentOutput==='marketing_strategy' || agentOutput==='roadmap'){
        generateTalkDeliverable(agentOutput);
        return;
      }
      if(agentOutput==='images'){
        setFlowStage('images-offer');
        setAgent('images');
        addMessage('ai',strategyToImagesCardHtml());
        return;
      }
      if(agentOutput==='dev'){
        setFlowStage('dev-offer');
        setAgent('dev');
        addMessage('ai','<div class="namaa-flow-card namaa-next-step namaa-agent-handoff"><div><span>💻</span><strong>IT / Website Agent ready.</strong><p>Project DNA active. NamaaDev yqder ybni landing page preview based on category, offer, market and language.</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-flow-action="start-dev">Create landing page</button><button class="namaa-mini-button secondary" type="button" data-flow-action="guided-intake">Edit DNA</button></div></div>');
        return;
      }
    }
    var agentPromptBtn=event.target.closest('[data-agent-prompt]');
    if(agentPromptBtn){
      input.value=dashboardPromptFor(agentPromptBtn.getAttribute('data-agent-prompt'));
      input.dispatchEvent(new Event('input'));
      input.focus();
      submit();
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
        clearProjectDNA();
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

  document.querySelectorAll('[data-agent]').forEach(function(btn){btn.addEventListener('click',function(){
    var nextAgent=this.getAttribute('data-agent');
    if(nextAgent && nextAgent!=='talk' && !projectDNAReady()){
      setSidebarNote('🧬','Project DNA needed','Namaa AI Talk needs to collect the brief first, then agents can generate adapted outputs.');
      closePlusMenu();
      startProjectFactoryMode();
      return;
    }
    setAgent(nextAgent);
  });});
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
  syncProjectDNAUI();
})(window,document);

/* Namaa Update 56 — final QA runtime helpers */
(function(window,document){
  'use strict';
  var root=document.documentElement;
  var baselineHeight=window.innerHeight || 0;
  function currentViewportHeight(){
    return Math.round((window.visualViewport && window.visualViewport.height) || window.innerHeight || document.documentElement.clientHeight || 0);
  }
  function syncViewport(){
    var h=currentViewportHeight();
    if(!h)return;
    root.style.setProperty('--namaa-vh',h+'px');
    var isMobile=window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
    var keyboardOpen=false;
    if(isMobile){
      var diff=(baselineHeight || h)-h;
      keyboardOpen=diff>120 && document.activeElement && document.activeElement.closest && document.activeElement.closest('.namaa-composer, .namaa-intake-card');
    }
    document.body.classList.toggle('namaa-keyboard-open',!!keyboardOpen);
  }
  function refreshBaseline(){
    if(!window.visualViewport || !document.body.classList.contains('namaa-keyboard-open')){
      baselineHeight=window.innerHeight || baselineHeight;
    }
    syncViewport();
  }
  syncViewport();
  window.addEventListener('resize',refreshBaseline,{passive:true});
  window.addEventListener('orientationchange',function(){window.setTimeout(refreshBaseline,180);},{passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',syncViewport,{passive:true});
    window.visualViewport.addEventListener('scroll',syncViewport,{passive:true});
  }
  document.addEventListener('focusin',function(event){
    if(event.target && event.target.closest && event.target.closest('.namaa-composer textarea, .namaa-intake-input')){
      window.setTimeout(syncViewport,80);
    }
  });
  document.addEventListener('focusout',function(){
    window.setTimeout(function(){document.body.classList.remove('namaa-keyboard-open');refreshBaseline();},120);
  });
})(window,document);
