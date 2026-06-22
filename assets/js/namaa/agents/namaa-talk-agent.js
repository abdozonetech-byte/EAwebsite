(function(window){
  'use strict';
  var utils=window.NamaaUtils;
  var brain=window.NamaaBrain;
  window.NamaaAgents=window.NamaaAgents || {};
  function greetingAnswer(){
    return '<h2>Salam, je suis Namaa AI.</h2>'+ 
    '<p>Donnez-moi votre projet, ville, budget et objectif. Je prépare une première lecture business claire.</p>'+ 
    '<ul class="namaa-compact-list">'+
      '<li><span class="namaa-compact-index">1</span><span><strong>Exemple :</strong> J’ai un café à Casablanca avec 4000 DH. Comment attirer mes premiers clients ?</span></li>'+ 
      '<li><span class="namaa-compact-index">2</span><span><strong>Exemple :</strong> Bghit nbda ecommerce b 3000dh, kifach ntesti l’idée ?</span></li>'+ 
    '</ul>';
  }
  function outOfScopeAnswer(){
    return '<h2>Namaa reste spécialisé business.</h2>'+ 
      '<p>سمح ليا، Namaa AI f had version kayjawb ghir 3la business, startups, AI tools, marketing, ads, WhatsApp sales, landing pages, leads, w Moroccan market.</p>'+ 
      '<p>3tini question 3la projet dyalek, budget, ville, ola kifach tjib clients, w n3tik plan pratique.</p>';
  }
  function strategyAnswer(question){
    if(brain.isGreeting(question))return greetingAnswer();
    if(!brain.isBusinessQuestion(question))return outOfScopeAnswer();
    var sector=brain.inferSector(question);
    var objective=brain.inferObjective(question);
    return '<div class="namaa-answer-head"><span>Namaa mode</span><strong>Namaa Talk — Strategy draft</strong></div>'+ 
    '<h2>Première stratégie pour votre projet.</h2>'+ 
    '<p><strong>Ce que je comprends :</strong> vous parlez d’un <strong>'+utils.escapeHtml(sector)+'</strong> avec comme objectif principal : <strong>'+utils.escapeHtml(objective)+'</strong>.</p>'+ 
    '<div class="namaa-strategy-grid">'+
      '<div><span>01</span><strong>Offre</strong><p>Clarifier une promesse simple : problème, résultat, prix ou premier package.</p></div>'+ 
      '<div><span>02</span><strong>Canal</strong><p>Priorité Maroc : WhatsApp + Instagram/TikTok + page simple si besoin.</p></div>'+ 
      '<div><span>03</span><strong>Trust</strong><p>Ajouter preuves, avis, photos réelles, FAQ et réponse rapide sur WhatsApp.</p></div>'+ 
      '<div><span>04</span><strong>Test 7 jours</strong><p>Tester une offre, 2 contenus, 1 campagne légère et mesurer les messages utiles.</p></div>'+ 
    '</div>'+ 
    '<ul class="namaa-compact-list">'+
      '<li><span class="namaa-compact-index">1</span><span><strong>Questions manquantes :</strong> ville, budget, cible, canal actuel et délai.</span></li>'+ 
      '<li><span class="namaa-compact-index">2</span><span><strong>Conseil marocain :</strong> ne commencez pas par trop de théorie. Testez vite une offre claire et suivez chaque lead WhatsApp.</span></li>'+ 
      '<li><span class="namaa-compact-index">3</span><span><strong>Étape suivante :</strong> envoyez “ville + budget + projet” et Namaa pourra organiser un plan 30 jours.</span></li>'+ 
    '</ul>'+ 
    '<div class="namaa-pdf-card">'+
      '<div><span>📄</span><strong>PDF stratégie</strong><p>Le PDF reste dans Namaa Talk et s’active après une stratégie claire.</p></div>'+ 
      '<button class="namaa-mini-button" type="button" data-namaa-pdf="true">Generate PDF Strategy</button>'+ 
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
