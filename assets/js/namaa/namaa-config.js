(function(window){
  'use strict';
  window.NamaaConfig={
    version:'20260622-u14-guided-flow',
    api:{
      enabled:true,
      provider:'gemini',
      talkProvider:'gemini',
      imagesProvider:'gemini-nano-banana',
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
        placeholder:'Ask freely, or launch the guided project brief for a cleaner strategy...',
        hero:{
          kicker:'Namaa Talk',
          title:'Créons une stratégie claire pour votre projet\u00a0?',
          intro:'Commencez par un brief guidé pour obtenir une stratégie PDF, puis un mockup et une landing page. Vous pouvez aussi poser une question libre.'
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
      {index:'01',label:'Brief guidé',prompt:'Lancer le brief projet'},
      {index:'02',label:'Restaurant',prompt:'J’ai un restaurant à Casablanca. Comment attirer mes premiers clients ?'},
      {index:'03',label:'E-commerce',prompt:'Je veux lancer un e-commerce au Maroc. Quelles sont les premières étapes ?'},
      {index:'04',label:'Clinique',prompt:'Quelle stratégie marketing pour une clinique esthétique au Maroc ?'}
    ],
    ui:{
      apiBadgeText:'Namaa modes',
      resultPanelLabel:'Right result panel'
    }
  };
})(window);
