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
  var appState={lastTalkQuestion:'',lastDevFiles:null};

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
  function resetChat(){
    closePreview();
    thread.innerHTML='';
    document.body.classList.remove('namaa-has-messages');
    history=[];
    appState.lastTalkQuestion='';
    appState.lastDevFiles=null;
    var meta=agentConfig(currentAgent);
    var welcome=document.createElement('div');
    welcome.className='namaa-welcome';
    welcome.id='namaaHero';
    welcome.innerHTML='<div class="namaa-orb" aria-hidden="true"><span>N</span></div>'+ 
      '<p class="namaa-kicker" id="namaaHeroKicker">'+utils.escapeHtml(meta.hero.kicker)+'</p>'+ 
      '<h1 id="namaaHeroTitle">'+utils.escapeHtml(meta.hero.title)+'</h1>'+ 
      '<p class="namaa-intro" id="namaaHeroIntro">'+utils.escapeHtml(meta.hero.intro)+'</p>'+ 
      '<div class="namaa-chip-row" aria-label="Exemples de questions">'+promptButtonsHtml()+'</div>';
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
  function answerAsync(question){
    var apiEnabled=!!(config.api && config.api.enabled && services.api);
    if(apiEnabled && currentAgent==='talk' && services.api.talk){
      return services.api.talk(question,history.slice()).then(function(result){return applyResult(result);}).catch(function(error){
        var fallback=localAnswer(question);
        return '<div class="namaa-answer-head"><span>Namaa backup</span><strong>Temporary issue</strong></div><p>Namaa used a local backup response so the conversation stays smooth.</p>'+fallback;
      });
    }
    if(apiEnabled && currentAgent==='dev' && services.api.dev){
      return services.api.dev(question,history.slice()).then(function(result){return applyResult(result);}).catch(function(error){
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
      updateAiMessage(loading,html);
      addHistory('assistant',html.replace(/<[^>]*>/g,' '));
    }).catch(function(error){
      updateAiMessage(loading,'<p>Namaa had a temporary problem: '+utils.escapeHtml(error.message || 'Unknown error')+'</p>');
    });
  }
  function bindPromptButtons(scope){
    (scope||document).querySelectorAll('[data-prompt]').forEach(function(btn){
      btn.addEventListener('click',function(){
        input.value=this.getAttribute('data-prompt') || '';
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
      pdfBtn.textContent='PDF flow ready';
      addMessage('ai',services.pdf.placeholder(appState.lastTalkQuestion));
      return;
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
