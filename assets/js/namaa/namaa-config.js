(function(window){
  'use strict';
  window.NamaaConfig={
    version:'20260622-u11-smooth-chatgpt-ui',
    api:{
      enabled:true,
      provider:'gemini',
      talkProvider:'gemini',
      imagesProvider:'local-mockup',
      devProvider:'gemini',
      textEndpoint:'/api/namaa/talk',
      imageEndpoint:'/api/namaa/images',
      devEndpoint:'/api/namaa/dev',
      healthEndpoint:'/api/namaa/health',
      pdfEndpoint:'/api/namaa/pdf',
      preferredLowCostModel:'gemini-3.1-flash-lite',
      maxHistoryTurns:8,
      keysLocation:'server-environment-only'
    },
    agents:{
      talk:{
        id:'talk',
        label:'Namaa Talk',
        bodyClass:'talk',
        placeholder:'Ask Namaa about business, AI, startups, marketing in Morocco...',
        hero:{
          kicker:'Namaa Talk',
          title:'Comment puis-je aider votre business\u00a0?',
          intro:'Posez une question libre sur un projet, une idée, le marché marocain, l’IA business ou une stratégie marketing.'
        }
      },
      images:{
        id:'images',
        label:'Namaa Images',
        bodyClass:'images',
        placeholder:'Describe the mockup you want Namaa Images to prepare...',
        hero:{
          kicker:'Namaa Images',
          title:'Quel mockup voulez-vous visualiser\u00a0?',
          intro:'Décrivez une landing page, une publicité, un hero section ou une direction visuelle. Le panneau résultat s’ouvre à droite quand le mode Images génère un résultat.'
        }
      },
      dev:{
        id:'dev',
        label:'NamaaDev',
        bodyClass:'dev',
        placeholder:'Describe the landing page example you want NamaaDev to build...',
        hero:{
          kicker:'NamaaDev',
          title:'Quelle landing page voulez-vous créer\u00a0?',
          intro:'Décrivez le projet, la cible, la ville et l’objectif. NamaaDev préparera ensuite une structure HTML/CSS/JS avec preview à droite.'
        }
      }
    },
    promptChips:[
      {index:'01',label:'Restaurant',prompt:'J’ai un restaurant à Casablanca. Comment attirer mes premiers clients ?'},
      {index:'02',label:'E-commerce',prompt:'Je veux lancer un e-commerce au Maroc. Quelles sont les premières étapes ?'},
      {index:'03',label:'Leads WhatsApp',prompt:'Comment générer des leads WhatsApp pour un service local au Maroc ?'},
      {index:'04',label:'Clinique',prompt:'Quelle stratégie marketing pour une clinique esthétique au Maroc ?'}
    ],
    ui:{
      apiBadgeText:'Namaa modes',
      resultPanelLabel:'Right result panel'
    }
  };
})(window);
