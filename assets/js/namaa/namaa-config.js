(function(window){
  'use strict';
  window.NamaaConfig={
    version:'20260622-u22-agent-flow',
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
      maxHistoryTurns:3,
      briefTokenBudget:1100,
      strategyOutputMaxWords:820,
      imagePackEngine:'category-based-logo-mockup-board',
      keysLocation:'server-environment-only'
    },
    agents:{
      talk:{
        id:'talk',
        label:'Namaa Talk',
        bodyClass:'talk',
        placeholder:'Talk to Namaa about your project, AI, startup, marketing in Morocco...',
        hero:{
          kicker:'Namaa Talk',
          title:'Parlez naturellement, Namaa organise votre projet.',
          intro:'Un advisor friendly et professionnel : business, IA, startup, marketing, mockups et landing pages pour le marché marocain.'
        }
      },
      images:{
        id:'images',
        label:'Namaa Images',
        bodyClass:'images',
        placeholder:'Describe the mockup you want Namaa Images to prepare...',
        hero:{
          kicker:'Namaa Images',
          title:'Visualisez votre identité et vos mockups.',
          intro:'Namaa Images prépare une direction visuelle, logo concept, mockup desktop/mobile, flyer ou creative pack selon la catégorie du projet.'
        }
      },
      dev:{
        id:'dev',
        label:'NamaaDev',
        bodyClass:'dev',
        placeholder:'Describe the landing page example you want NamaaDev to build...',
        hero:{
          kicker:'NamaaDev',
          title:'Créez un exemple de site pour votre projet.',
          intro:'NamaaDev choisit un template adapté à la catégorie, puis génère une landing page simple avec aperçu desktop/mobile et code organisé.'
        }
      }
    },
    promptChips:[
      {index:'01',label:'Lancer le brief',prompt:'Lancer le brief projet'},
      {index:'02',label:'Food / Restaurant',prompt:'J’ai un restaurant à Casablanca. Comment attirer mes premiers clients ?'},
      {index:'03',label:'E-commerce',prompt:'Je veux lancer un e-commerce au Maroc. Quelles sont les premières étapes ?'},
      {index:'04',label:'Clinique / médical',prompt:'Quelle stratégie marketing pour une clinique esthétique au Maroc ?'}
    ],
    ui:{
      apiBadgeText:'Namaa modes',
      resultPanelLabel:'Right result panel'
    }
  };
})(window);
