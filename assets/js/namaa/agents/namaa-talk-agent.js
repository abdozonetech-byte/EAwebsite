(function(window){
  'use strict';
  var utils=window.NamaaUtils || {escapeHtml:function(value){return String(value || '');}};
  var brain=window.NamaaBrain || {};
  window.NamaaAgents=window.NamaaAgents || {};

  function normalize(value){
    return String(value || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ').trim();
  }
  function hasAny(text,words){return words.some(function(word){return text.indexOf(word)>-1;});}
  function briefValue(value){return Array.isArray(value)?value.join(', '):String(value || '').trim();}
  function esc(value){return utils.escapeHtml ? utils.escapeHtml(value) : String(value || '');}
  function answerHead(label,strong){return '<div class="namaa-answer-head"><span>'+esc(label || 'Free Talk')+'</span><strong>'+esc(strong || 'Namaa response')+'</strong></div>';}
  function list(items){return '<ul class="namaa-compact-list">'+items.map(function(item,index){return '<li><span class="namaa-compact-index">'+String(index+1).padStart(2,'0')+'</span><span><strong>'+esc(item.title)+'</strong><br>'+esc(item.text)+'</span></li>';}).join('')+'</ul>';}
  function promptButton(label,prompt,secondary){return '<button class="namaa-mini-button '+(secondary?'secondary':'')+'" type="button" data-prompt="'+esc(prompt)+'">'+esc(label)+'</button>';}
  function buildButton(label,secondary){return '<button class="namaa-mini-button '+(secondary?'secondary':'')+'" type="button" data-flow-action="guided-intake">'+esc(label || 'Build Project')+'</button>';}
  function ctaRow(buttons){return '<div class="namaa-cta-row namaa-free-cta-row">'+buttons.join('')+'</div>';}

  function projectContextCard(state){
    var brief=state && state.projectBrief;
    if(!brief)return '';
    var rows=[['Project',briefValue(brief.projectName)||'Project'],['Category',briefValue(brief.category)||'Business'],['Market',briefValue(brief.market)||'Morocco'],['Goal',briefValue(brief.goal)||'Growth']];
    return '<div class="namaa-free-context"><strong>Project DNA active</strong><div>'+rows.map(function(row){return '<span><small>'+esc(row[0])+'</small><b>'+esc(row[1])+'</b></span>';}).join('')+'</div></div>';
  }
  function greetingAnswer(context){
    return answerHead('Free Talk','Natural chat')+
      '<div class="namaa-free-answer"><h2>Salam 👋 ana Namaa AI Talk.</h2><p>Hder m3aya b tariqa 3adiya: Darija Latin, French ola English. Ila bghiti njawebk b Arabic script, ghir tlbha.</p><p>Free Talk kayb9a chat libre. Ila bghiti nbniw project b agents, gol <strong>Project Build</strong> w n7el lik brief popup.</p></div>'+projectContextCard(context.state)+
      ctaRow([buildButton('Start Project Build'),promptButton('Give me business ideas','3tini 5 business ideas suitable for Morocco',true),promptButton('Improve my marketing','Bghit n7ssen marketing dyal project dyali',true)]);
  }
  function outOfScopeAnswer(){
    return answerHead('Free Talk','Focus reminder')+
      '<div class="namaa-free-answer"><h2>Namaa kayb9a focus 3la business.</h2><p>Nqder n3awnk f business, AI, IT, marketing, startups, websites, WhatsApp/CRM, automations w projects f Morocco.</p><p>3tini idea, niche, offer, city, budget ola problem dyal growth w njawbk b tariqa practical.</p></div>'+
      ctaRow([promptButton('Business question','Bghit ndwi 3la business idea f Morocco'),buildButton('Build Project',true)]);
  }
  function buildRequestAnswer(){
    return answerHead('Project Build','Opening brief')+
      '<div class="namaa-free-answer"><h2>Mzyan, ghadi nbniw Project DNA.</h2><p>Namaa AI Talk ghadi ysowlek questions qssar: project name, category, city, budget, target, offer, channels w language. Men ba3d agents kamlin ghadi ykhdmo b nafs Project DNA.</p></div>'+
      ctaRow([buildButton('Open Project Build popup')]);
  }
  function businessIdeaAnswer(question,context){
    var sector=(brain.inferSector && brain.inferSector(question)) || 'Business Morocco';
    return answerHead('Free Talk','Idea direction')+
      '<div class="namaa-free-answer"><h2>Fhmtek: direction dyalek qriba men '+esc(sector)+'.</h2><p>Bach answer maykounch general, khasna nfer9o bin idea, audience, offer w channel. Hadi hiya tariqa li katkhli Namaa y3tik result professional.</p></div>'+
      list([
        {title:'Clarify the offer',text:'Chno exactly ghadi tbi3 ola tqdem? service, product, app, agency, clinic, restaurant...'},
        {title:'Choose first customer',text:'Bda b audience wahda: city, age, problem, budget, urgency.'},
        {title:'Build proof fast',text:'Landing page simple + WhatsApp flow + 7 days content/ads test before big spending.'}
      ])+projectContextCard(context.state)+
      ctaRow([buildButton('Convert to Project DNA'),promptButton('Ask follow-up','3tini questions bach nclarifi l idea dyali',true)]);
  }
  function marketingAnswer(context){
    return answerHead('Marketing Agent preview','Free Talk advice')+
      '<div class="namaa-free-answer"><h2>Marketing mzyan kaybda b offer clear, machi ads directement.</h2><p>F Morocco, khdem b funnel simple: message wadih → landing/WhatsApp → qualification → follow-up → small test budget.</p></div>'+
      list([
        {title:'Hook',text:'Ktaba promise wa7da katjawb 3la pain dyal customer.'},
        {title:'Trust',text:'Zid proof: before/after, testimonials, process, guarantee, clear pricing if possible.'},
        {title:'Lead flow',text:'Form ola WhatsApp b questions qssar bach t3ref wach lead qualified.'}
      ])+projectContextCard(context.state)+
      ctaRow([promptButton('Create content plan','Create a 7-day content plan for my project in Morocco'),promptButton('Improve landing page','Give me a landing page structure for leads in Morocco',true),buildButton('Build full project',true)]);
  }
  function websiteAnswer(context){
    return answerHead('IT / Website preview','Free Talk advice')+
      '<div class="namaa-free-answer"><h2>Website khaso ykhdem 3la conversion, machi ghir design.</h2><p>Best structure: hero strong, problem, solution, offer, proof, process, FAQ, CTA WhatsApp/form. Mobile first darori hit bzaf traffic jay men phone.</p></div>'+
      list([
        {title:'Hero',text:'One clear sentence: what you do, for whom, and result.'},
        {title:'CTA',text:'Button wadih: WhatsApp, diagnostic, booking, order, not many choices.'},
        {title:'Performance',text:'Images optimized, no heavy animation, no horizontal overflow.'}
      ])+projectContextCard(context.state)+
      ctaRow([promptButton('Audit my landing page','Audit my landing page structure for conversion'),buildButton('Create website brief',true)]);
  }
  function whatsappAnswer(context){
    return answerHead('WhatsApp & CRM preview','Free Talk advice')+
      '<div class="namaa-free-answer"><h2>WhatsApp khaso script + status, machi ghir messages random.</h2><p>Goal howa tkhrej lead men interested → qualified → appointment/order → follow-up. Khlli questions qssar w wad7in.</p></div>'+
      list([
        {title:'First reply',text:'Salam, merci 3la message. Chno city dyalek w chno service li bghiti?'},
        {title:'Qualification',text:'Budget, urgency, need, decision maker.'},
        {title:'Follow-up',text:'Message after 2h, then next day, then value proof.'}
      ])+projectContextCard(context.state)+
      ctaRow([promptButton('Write WhatsApp script','Write WhatsApp qualification script for my project'),buildButton('Build CRM flow',true)]);
  }
  function aiAutomationAnswer(context){
    return answerHead('AI & Automation preview','Free Talk advice')+
      '<div class="namaa-free-answer"><h2>AI automation khas-ha tibda men workflow wadih.</h2><p>Ma tbda-ch b tool. Bda b soual: chno task kat3awd kol nhar? leads, content, reports, WhatsApp, CRM, emails, documents...</p></div>'+
      list([
        {title:'Map process',text:'Step by step: input → decision → output → human check.'},
        {title:'Choose tools',text:'Use simple stack first: forms, sheet/CRM, notification, AI draft.'},
        {title:'Measure time saved',text:'Automation khas-ha twffer time ola tzid leads, not ghir technical look.'}
      ])+projectContextCard(context.state)+
      ctaRow([promptButton('Find automations','Give me AI automation ideas for my business'),buildButton('Build automation plan',true)]);
  }
  function startupAnswer(context){
    return answerHead('Startup Launch preview','Free Talk advice')+
      '<div class="namaa-free-answer"><h2>Startup launch khaso validation qbel spending kbir.</h2><p>Sawb MVP simple, landing page, offer, 10 interviews, small ads test, b3d 9rr wach tzid.</p></div>'+
      list([
        {title:'Problem',text:'Define painful problem for one audience.'},
        {title:'MVP',text:'One feature/offer ghir bach tkhtaber demand.'},
        {title:'Launch test',text:'7 to 14 days: content, WhatsApp, tiny ads budget, feedback.'}
      ])+projectContextCard(context.state)+
      ctaRow([promptButton('Validate my startup','Help me validate my startup idea in Morocco'),buildButton('Build launch roadmap',true)]);
  }
  function generalAnswer(question,context){
    var sector=(brain.inferSector && brain.inferSector(question)) || 'Business Morocco';
    return answerHead('Free Talk','Practical answer')+
      '<div class="namaa-free-answer"><h2>Hadi nqder nkhdemha m3ak b tariqa organised.</h2><p>Based on your message, direction qriba men <strong>'+esc(sector)+'</strong>. Free Talk kay3awnk tfkker b sor3a, walakin Project Build kayjme3 data bach agents y3tiw outputs ready.</p></div>'+
      list([
        {title:'Now',text:'3tini context sghir: project type, city, target, goal.'},
        {title:'Next',text:'Namaa ykhrrej lik first plan: offer, audience, first channel.'},
        {title:'After',text:'Ila bghiti serious result, n7el Project Build bach agents ykhdmo b nafs Project DNA.'}
      ])+projectContextCard(context.state)+
      ctaRow([buildButton('Start Project Build'),promptButton('Continue Free Talk','Continue free talk and ask me 3 questions',true)]);
  }
  function strategyAnswer(context){
    var question=context.question || '';
    var text=normalize(question);
    if(hasAny(text,['build project','project build','brief projet','lancer le brief','project dna','nbni project','bni project','build my project']))return buildRequestAnswer();
    if(brain.isGreeting && brain.isGreeting(question))return greetingAnswer(context);
    if(brain.isBusinessQuestion && !brain.isBusinessQuestion(question))return outOfScopeAnswer();
    if(hasAny(text,['marketing','ads','meta','google ads','tiktok','content','funnel','lead','leads','publicite','campaign','campagne']))return marketingAnswer(context);
    if(hasAny(text,['website','site','landing','seo','ui','ux','performance','page','wordpress','web']))return websiteAnswer(context);
    if(hasAny(text,['whatsapp','crm','follow','script','message','qualification','lead status']))return whatsappAnswer(context);
    if(hasAny(text,['automation','automatisation','ai tool','outil ai','workflow','process','zapier','make','n8n']))return aiAutomationAnswer(context);
    if(hasAny(text,['startup','mvp','launch','lancer','validation','pricing','price','prix']))return startupAnswer(context);
    if(hasAny(text,['idea','idee','business idea','projet','project','market','maroc','morocco','startup','service','sell','vente']))return businessIdeaAnswer(question,context);
    return generalAnswer(question,context);
  }
  window.NamaaAgents.talk={
    id:'talk',
    reply:function(context){
      return {answerHtml:strategyAnswer(context || {}),state:{lastTalkQuestion:(context && context.question) || ''}};
    }
  };
})(window);
