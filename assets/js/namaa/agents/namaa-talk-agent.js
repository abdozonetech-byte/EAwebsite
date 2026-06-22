(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  var brain=window.NamaaBrain;
  window.NamaaAgents=window.NamaaAgents || {};

  function greetingAnswer(){
    return '<h2>Salam 👋 je suis Namaa.</h2>'+
      '<p>Parlez-moi naturellement de votre projet. Je vais garder la discussion simple, business, et utile — bla lhadra bzaf 😄.</p>'+ 
      '<ul class="namaa-compact-list">'+
        '<li><span class="namaa-compact-index">1</span><span><strong>Option rapide :</strong> cliquez sur “Lancer le brief” pour créer une stratégie PDF propre.</span></li>'+ 
        '<li><span class="namaa-compact-index">2</span><span><strong>Option libre :</strong> écrivez votre question avec ville, budget, projet et objectif.</span></li>'+ 
      '</ul>'+
      '<p><strong>Question simple :</strong> c’est quoi le projet que vous voulez lancer ou améliorer ?</p>';
  }

  function outOfScopeAnswer(){
    return '<h2>Namaa reste focus business.</h2>'+
      '<p>سمح ليا، أنا Namaa متخصص فـ business, startups, AI tools, marketing, landing pages, ads, leads و المشاريع فالمغرب.</p>'+ 
      '<p>رجعني للمجال ديالي 😄 عطيني فكرة مشروعك، المدينة، budget، أو المشكل ديالك فالماركتينغ ونعاونك بخطة عملية.</p>';
  }

  function strategyAnswer(question){
    if(brain.isGreeting(question))return greetingAnswer();
    if(!brain.isBusinessQuestion(question))return outOfScopeAnswer();
    var sector=brain.inferSector(question);
    var objective=brain.inferObjective(question);
    return '<div class="namaa-answer-head"><span>Namaa Talk</span><strong>Advisor business</strong></div>'+
      '<h2>Je vois l’idée. On va la rendre testable.</h2>'+ 
      '<p><strong>Ce que je comprends :</strong> vous parlez d’un projet <strong>'+utils.escapeHtml(sector)+'</strong> avec un objectif principal : <strong>'+utils.escapeHtml(objective)+'</strong>.</p>'+ 
      '<div class="namaa-strategy-grid">'+
        '<div><span>01</span><strong>Offre</strong><p>Une promesse simple : à qui vous aidez, quel résultat, et pourquoi vous choisir.</p></div>'+ 
        '<div><span>02</span><strong>Canal</strong><p>Au Maroc, commencez léger : WhatsApp + Instagram/TikTok + page simple si besoin.</p></div>'+ 
        '<div><span>03</span><strong>Preuve</strong><p>Photos réelles, avis, FAQ, localisation et réponse rapide. Trust kaybi3.</p></div>'+ 
        '<div><span>04</span><strong>Test</strong><p>Testez une offre 7 jours, mesurez les messages utiles, puis augmentez doucement.</p></div>'+ 
      '</div>'+ 
      '<ul class="namaa-compact-list">'+
        '<li><span class="namaa-compact-index">1</span><span><strong>Plan court :</strong> clarifier l’offre, créer 2 contenus, lancer un petit test, suivre les leads WhatsApp.</span></li>'+ 
        '<li><span class="namaa-compact-index">2</span><span><strong>Erreur à éviter :</strong> dépenser beaucoup avant de valider l’offre. Budget kaymchi bzzaf ila lmessage machi wadih.</span></li>'+ 
        '<li><span class="namaa-compact-index">3</span><span><strong>Next step :</strong> donnez-moi la ville, budget et type de client, ou lancez le brief guidé.</span></li>'+ 
      '</ul>'+ 
      '<div class="namaa-pdf-card">'+
        '<div><span>📄</span><strong>Stratégie PDF</strong><p>Le PDF s’active quand le brief projet est clair.</p></div>'+ 
        '<button class="namaa-mini-button" type="button" data-flow-action="guided-intake">Lancer le brief</button>'+ 
      '</div>'+ 
      '<div class="namaa-cta-row"><a class="namaa-mini-cta" href="/reserver-diagnostic/">Réserver un diagnostic</a><a class="namaa-mini-cta secondary" href="/">Retour au site</a></div>';
  }

  window.NamaaAgents.talk={
    id:'talk',
    reply:function(context){
      return {answerHtml:strategyAnswer(context.question),state:{lastTalkQuestion:context.question}};
    }
  };
})(window);
