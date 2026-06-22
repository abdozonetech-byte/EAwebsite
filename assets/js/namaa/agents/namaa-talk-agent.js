(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  var brain=window.NamaaBrain;
  window.NamaaAgents=window.NamaaAgents || {};

  function greetingAnswer(){
    return '<h2>Salam 👋 je suis Namaa.</h2>'+ 
      '<p>الحمد لله، واجد نخدم معاك 😄 شنو الفكرة أو المشروع اللي بغيتي نطورو اليوم؟</p>';
  }

  function outOfScopeAnswer(){
    return '<h2>Namaa reste focus business.</h2>'+ 
      '<p>سمح ليا، أنا Namaa متخصص فـ AI, business, startups, marketing, landing pages, ads, leads و المشاريع فالمغرب.</p>'+ 
      '<p>رجعني للمجال ديالي 😄 عطيني فكرة مشروعك ولا المشكل التجاري ونعاونك.</p>';
  }

  function localBriefCard(question){
    var sector=brain.inferSector ? brain.inferSector(question) : 'Business Maroc';
    return '<div class="namaa-answer-head"><span>Namaa Talk</span><strong>Conversation courte</strong></div>'+ 
      '<p>Mzyan, فهمت الاتجاه العام: <strong>'+utils.escapeHtml(sector)+'</strong>.</p>'+ 
      '<p>باش ما نعطيكش جواب عام، خاصني غير جوج معلومات: شنو بالضبط غادي تبيع؟ وشحال budget الأول؟</p>'+ 
      '<div class="namaa-action-card namaa-controller-card"><div><span>🧭</span><strong>أفضل طريقة</strong><p>استعمل brief guidé باش Namaa يبني prompt قوي ف backend ويخرج PDF منظم.</p></div><div class="namaa-flow-actions"><button class="namaa-mini-button" type="button" data-flow-action="guided-intake">Lancer le brief</button></div></div>';
  }

  function strategyAnswer(question){
    if(brain.isGreeting && brain.isGreeting(question))return greetingAnswer();
    if(brain.isBusinessQuestion && !brain.isBusinessQuestion(question))return outOfScopeAnswer();
    return localBriefCard(question);
  }

  window.NamaaAgents.talk={
    id:'talk',
    reply:function(context){
      return {answerHtml:strategyAnswer(context.question),state:{lastTalkQuestion:context.question}};
    }
  };
})(window);
