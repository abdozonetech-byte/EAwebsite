(function(){
  'use strict';
  var form=document.getElementById('namaaForm');
  var input=document.getElementById('namaaInput');
  var thread=document.getElementById('namaaThread');
  var hero=document.getElementById('namaaHero');
  var newChat=document.getElementById('namaaNewChat');
  var sidebar=document.getElementById('namaaSidebar');
  var sidebarToggle=document.getElementById('namaaSidebarToggle');
  var sidebarClose=document.getElementById('namaaSidebarClose');
  var sidebarBackdrop=document.getElementById('namaaSidebarBackdrop');
  var activeMode='general';
  var history=[];
  if(!form||!input||!thread)return;

  function escapeHtml(value){
    return String(value||'').replace(/[&<>'"]/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char];});
  }
  function closeSidebar(){
    document.body.classList.remove('namaa-sidebar-open');
    if(sidebarBackdrop)sidebarBackdrop.hidden=true;
    if(sidebarToggle)sidebarToggle.setAttribute('aria-expanded','false');
  }
  function openSidebar(){
    document.body.classList.add('namaa-sidebar-open');
    if(sidebarBackdrop)sidebarBackdrop.hidden=false;
    if(sidebarToggle)sidebarToggle.setAttribute('aria-expanded','true');
  }
  function addMessage(role,html){
    var item=document.createElement('div');
    item.className='namaa-message '+role;
    item.innerHTML=role==='ai' ? '<div class="namaa-avatar">N</div><div class="namaa-bubble" dir="auto">'+html+'</div>' : '<div class="namaa-bubble" dir="auto">'+html+'</div>';
    thread.appendChild(item);
    thread.scrollTop=thread.scrollHeight;
    return item;
  }
  function removeHero(){
    if(hero){hero.remove();hero=null;}
  }
  function typingHtml(){
    return '<span class="namaa-typing"><span></span><span></span><span></span></span>';
  }
  function detectLanguage(text){
    if(/[\u0600-\u06FF]/.test(text))return 'ar';
    if(/\b(le|la|les|pour|avec|stratégie|marché|projet|entreprise|client|contenu)\b/i.test(text))return 'fr';
    if(/\b(the|for|with|business|market|strategy|website|startup|marketing)\b/i.test(text))return 'en';
    return 'darija';
  }
  function modeIntro(){
    var map={
      general:'I can help with business, AI, IT, marketing, startups, websites, and WhatsApp/CRM for Morocco.',
      market:'Focus: Morocco market check, cities, demand, pricing, competitors, and opportunity gaps.',
      strategy:'Focus: positioning, offer, roadmap, 30/60/90 plan, and execution priorities.',
      marketing:'Focus: Meta Ads, Google Ads, TikTok, content plan, funnels, lead generation, and WhatsApp follow-up.',
      website:'Focus: website structure, landing page, SEO, performance, UI/UX, and technical planning.'
    };
    return map[activeMode] || map.general;
  }
  function answer(question){
    var q=question.toLowerCase();
    var lang=detectLanguage(question);
    var greeting=lang==='fr'?'Bien reçu.':lang==='en'?'Got it.':lang==='ar'?'مفهوم.':'Fhmtk.';
    var base=greeting+' '+modeIntro();
    if(/whatsapp|crm|lead|follow/i.test(q)){
      return '<p>'+escapeHtml(base)+'</p><p><strong>WhatsApp flow simple:</strong></p><ul><li>Salam + confirm the need.</li><li>Ask 2 qualification questions: city, budget, deadline.</li><li>Give one clear next step: call, audit, or offer.</li><li>Save status: New, Qualified, Follow-up, Won, Lost.</li></ul><p>Send me your project type and I will write the exact script.</p>';
    }
    if(/ads|meta|google|tiktok|marketing|content|publicit/i.test(q)){
      return '<p>'+escapeHtml(base)+'</p><p><strong>Marketing plan:</strong></p><ul><li>Clarify offer and target city first.</li><li>Create one landing/WhatsApp path for leads.</li><li>Start with 3 creatives: problem, proof, offer.</li><li>Track cost per lead, qualified lead rate, and appointments.</li></ul><p>Give me your niche, city, budget, and goal, and I will build a clear plan.</p>';
    }
    if(/website|landing|seo|ui|ux|site|page/i.test(q)){
      return '<p>'+escapeHtml(base)+'</p><p><strong>Website direction:</strong></p><ul><li>Hero: clear promise + one CTA.</li><li>Proof: results, process, examples, FAQ.</li><li>Conversion: WhatsApp/booking form above the fold.</li><li>SEO: one page per service/city when possible.</li></ul><p>Share your offer and I will suggest the page structure.</p>';
    }
    if(/idea|startup|business|project|projet|مشروع/i.test(q)){
      return '<p>'+escapeHtml(base)+'</p><p><strong>To validate the idea:</strong></p><ul><li>Who is the customer?</li><li>What painful problem are you solving?</li><li>How will you get the first 10 customers?</li><li>What is the simple paid offer?</li></ul><p>Write your idea in one sentence and I will analyse it for Morocco.</p>';
    }
    if(/market|competitor|morocco|maroc|casablanca|rabat|marrakech|fes|agadir/i.test(q)){
      return '<p>'+escapeHtml(base)+'</p><p><strong>Market check method:</strong></p><ul><li>Choose city and customer segment.</li><li>List direct competitors and alternatives.</li><li>Compare prices, trust signals, and acquisition channels.</li><li>Find one gap: speed, price, quality, language, delivery, or niche.</li></ul><p>Give me the sector and city, and I will structure the research.</p>';
    }
    return '<p>'+escapeHtml(base)+'</p><p>Tell me your project, city, target customer, budget, and goal. I will answer in a practical way with steps, not random theory.</p>';
  }
  function submit(){
    var text=input.value.trim();
    if(!text){input.focus();return;}
    removeHero();
    addMessage('user',escapeHtml(text));
    history.push({role:'user',content:text});
    input.value='';
    input.style.height='auto';
    var loading=addMessage('ai',typingHtml());
    window.setTimeout(function(){
      loading.querySelector('.namaa-bubble').innerHTML=answer(text);
      history.push({role:'assistant',content:loading.textContent||''});
    },320);
  }
  function resetChat(){
    history=[];
    thread.innerHTML='<section class="namaa-hero" id="namaaHero"><div class="namaa-hero-logo">N</div><p class="namaa-kicker">Namaa AI · Morocco Business Assistant</p><h1>Talk with Namaa like ChatGPT, but focused on Morocco business.</h1><p class="namaa-intro">Ask about startups, marketing, AI, IT, websites, WhatsApp scripts, roadmaps, and practical Moroccan business decisions.</p><div class="namaa-language-row" aria-label="Supported languages"><span>Darija Latin</span><span>Français</span><span>English</span><span>Arabic on request</span></div><div class="namaa-prompt-grid" aria-label="Suggested prompts"><button type="button" data-prompt="3tini business idea suitable for Morocco with simple execution plan"><span>💡</span><strong>Business idea</strong><small>Idea + first steps</small></button><button type="button" data-prompt="Bghit marketing strategy for my project in Morocco"><span>📣</span><strong>Marketing strategy</strong><small>Ads, content, leads</small></button><button type="button" data-prompt="Analyze a project idea for Morocco market"><span>🔎</span><strong>Market check</strong><small>Demand + competitors</small></button><button type="button" data-prompt="Write WhatsApp script to qualify leads"><span>🟢</span><strong>WhatsApp script</strong><small>Lead qualification</small></button></div></section>';
    hero=document.getElementById('namaaHero');
    bindPrompts(thread);
    input.focus();
  }
  function bindPrompts(scope){
    (scope||document).querySelectorAll('[data-prompt]').forEach(function(btn){
      btn.addEventListener('click',function(){input.value=this.getAttribute('data-prompt')||'';input.dispatchEvent(new Event('input'));input.focus();});
    });
  }
  form.addEventListener('submit',function(e){e.preventDefault();submit();});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}});
  input.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,170)+'px';});
  if(newChat)newChat.addEventListener('click',function(){resetChat();closeSidebar();});
  document.querySelectorAll('[data-mode]').forEach(function(btn){
    btn.addEventListener('click',function(){
      activeMode=this.getAttribute('data-mode')||'general';
      document.querySelectorAll('[data-mode]').forEach(function(x){x.classList.toggle('is-active',x===btn);});
      closeSidebar();
      input.placeholder='Message Namaa AI about '+this.querySelector('strong').textContent+'...';
      input.focus();
    });
  });
  if(sidebarToggle)sidebarToggle.addEventListener('click',openSidebar);
  if(sidebarClose)sidebarClose.addEventListener('click',closeSidebar);
  if(sidebarBackdrop)sidebarBackdrop.addEventListener('click',closeSidebar);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSidebar();});
  bindPrompts(document);
})();
