(function(window){
  'use strict';
  window.NamaaConfig={
    version:'20260622-u56-final-qa-agent-flow',
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
      strategyOutputMaxWords:900,
      normalChatMaxWords:100,
      smartBriefBuilder:true,
      deliverableRequiresConfirmation:true,
      imagePackEngine:'category-based-logo-mockup-board-v56-final-qa',
      marketTaxonomy:'morocco-categories-cities-v39',
      keysLocation:'server-environment-only'
    },
    agents:{
      talk:{
        id:'talk',
        label:'Namaa Talk',
        bodyClass:'talk',
        placeholder:'Free Talk: ask Namaa about business, AI, IT, marketing, startups in Morocco...',
        hero:{
          kicker:'Namaa Talk',
          title:'Namaa AI Talk — free chat first, Project Build when needed.',
          intro:'Free Talk huwa chat only. Ila bghiti agents ykhdmo result ready, Project Build kayjme3 Project DNA f popup organised.'
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
      {index:'01',label:'Free Talk',prompt:'Salam Namaa, bghit nhder 3la business idea'},
      {index:'02',label:'Project Build',prompt:'Lancer le brief projet'},
      {index:'03',label:'Morocco Market',prompt:'Bghit research 3la market f Morocco l project dyali'},
      {index:'04',label:'Project DNA',prompt:'Bghit nbni Project DNA bach agents ykhdmo 3lih'}
    ],
    ui:{
      apiBadgeText:'Namaa modes',
      resultPanelLabel:'Right result panel'
    }
  };
})(window);
