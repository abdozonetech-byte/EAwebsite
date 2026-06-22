(function (window) {
  'use strict';

  window.NAMAA_AGENTS = [
    {
      id: 'general',
      name: 'Namaa General',
      icon: 'flaticon-381-networking',
      label: 'Business assistant',
      accent: '#0B2A97',
      heroTitle: 'Namaa General: your Moroccan business brain.',
      subtitle: 'Start with an idea, a problem, or a messy project brief. Namaa turns it into practical next steps for Morocco.',
      placeholder: 'Write to Namaa General in Darija Latin, French, or English...',
      welcome: 'Salam, ana Namaa General. Gol lia chno project dyalek, city, budget, w goal. Ghadi nsowlek b tariqa organized bach nkhrjo plan practical.',
      quickPrompts: [
        ['Start project brief', 'Ana 3andi fikra dyal project f Morocco. Sowlni step by step bach nkhrjo business plan w marketing strategy.'],
        ['Research Morocco market', '3tini market research f Morocco 3la niche dyali: clients, competitors, pricing, cities, risks, opportunities.'],
        ['Build roadmap', 'Sawb lia roadmap practical 30/60/90 days l project dyali f Morocco.']
      ],
      cards: [
        ['AI Mode', 'Conversation', 'Briefs, questions, decisions', 92],
        ['Market Focus', 'Morocco', 'Cities, clients, pricing', 86],
        ['Outputs', 'Plan + Actions', 'Clear next steps', 81]
      ],
      visualTitle: 'Business Brief Flow',
      visualLabel: 'Brief -> Market -> Strategy -> Roadmap',
      visualSteps: ['Understand project', 'Clarify target', 'Map risks', 'Prioritize actions'],
      sideTitle: 'Best Starting Points',
      sideItems: [
        ['Project brief', 'Idea, audience, budget, city, constraints.'],
        ['Decision support', 'Compare options and choose the strongest path.'],
        ['Action plan', 'Turn the answer into tasks for this week.']
      ]
    },
    {
      id: 'market',
      name: 'Market Research Agent',
      icon: 'flaticon-381-search-2',
      label: 'Competitors and demand',
      accent: '#1479FF',
      heroTitle: 'Research Moroccan markets with sharper signals.',
      subtitle: 'Analyze competitors, categories, cities, pricing, demand patterns, and opportunity gaps before spending money.',
      placeholder: 'Ask for competitors, cities, pricing, categories, or opportunities...',
      welcome: 'Ana Market Research Agent. 3tini niche, city, audience, w price range. Ghadi norganisi competitors, demand signals, risks, w opportunities.',
      quickPrompts: [
        ['Analyze competitors', 'Dir lia competitor research f Morocco 3la had niche, m3a positioning, prices, strengths, weaknesses.'],
        ['City filters', 'Qaren lia Casablanca, Rabat, Marrakech, Tanger, Agadir l had business idea.'],
        ['Find opportunity', 'Fin kayn gap f Moroccan market l had category? 3tini opportunities practical.']
      ],
      cards: [
        ['Signal Quality', 'Demand Map', 'Search, social, city intent', 88],
        ['Competitors', 'Positioning', 'Offer, price, trust gaps', 76],
        ['Opportunity', 'White Space', 'Segments to test first', 69]
      ],
      visualTitle: 'Market Signal Cards',
      visualLabel: 'Demand intensity by city and category',
      visualSteps: ['Casablanca: high intent', 'Rabat: premium services', 'Marrakech: tourism angle', 'Tanger: B2B growth'],
      sideTitle: 'Research Prompts',
      sideItems: [
        ['Pricing scan', 'Estimate entry, mid, and premium price bands.'],
        ['Competitor grid', 'Compare offer, trust, delivery, and proof.'],
        ['Category filters', 'Validate by city, audience, and buying moment.']
      ]
    },
    {
      id: 'strategy',
      name: 'Strategy Agent',
      icon: 'flaticon-381-briefcase',
      label: 'Positioning and roadmap',
      accent: '#2454D6',
      heroTitle: 'Build strategy that becomes action.',
      subtitle: 'Shape positioning, offer structure, priorities, and a clean 30/60/90 day plan for a Moroccan business.',
      placeholder: 'Describe your business model, offer, audience, and goal...',
      welcome: 'Ana Strategy Agent. Ghadi nclarifi offer, target, promise, channels, w priorities. Bda b chno katkhdem w chno baghi twsel lih.',
      quickPrompts: [
        ['Create positioning', 'Sawb lia positioning clear l service dyali f Morocco: target, promise, proof, differentiation.'],
        ['Build 30/60/90 plan', 'Dir lia 30/60/90 day plan b priorities, tasks, KPIs, risks.'],
        ['Improve offer', 'Review had offer w 3tini version clearer, stronger, w easier to sell.']
      ],
      cards: [
        ['Positioning', 'Clear Angle', 'Target, promise, proof', 84],
        ['Roadmap', '30/60/90', 'Milestones and decisions', 91],
        ['Offer', 'Sellable Pack', 'Scope, price, guarantee', 78]
      ],
      visualTitle: 'Strategy Timeline',
      visualLabel: '30/60/90 day execution rhythm',
      visualSteps: ['30 days: validate', '60 days: build system', '90 days: scale channel', 'Review: improve offer'],
      sideTitle: 'Strategy Blocks',
      sideItems: [
        ['Positioning', 'Who it is for, why now, why you.'],
        ['Offer design', 'Package the value into something easy to buy.'],
        ['Priorities', 'Decide what matters this month.']
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing Agent',
      icon: 'flaticon-381-promotion',
      label: 'Ads, content and funnels',
      accent: '#006FE6',
      heroTitle: 'Turn attention into qualified Moroccan leads.',
      subtitle: 'Plan Meta Ads, Google Ads, TikTok content, landing pages, scripts, funnels, and lead generation systems.',
      placeholder: 'Ask for Meta strategy, content plan, funnel, CTA, or landing page ideas...',
      welcome: 'Ana Marketing Agent. 3tini service/product, target, budget, w channel. Ghadi nsawb funnel, ads angles, content plan, w CTA practical.',
      quickPrompts: [
        ['Create Meta strategy', 'Create Meta Ads strategy for my Moroccan business: audience, angles, creatives, budget, KPIs.'],
        ['Create content plan', 'Sawb lia 30 days content plan for TikTok, Instagram, LinkedIn m3a hooks w CTA.'],
        ['Improve landing page', 'Review landing page structure dyali w 3tini better sections, CTA, proof, and lead form.']
      ],
      cards: [
        ['Campaigns', 'Meta + Google', 'Angles, budget, KPIs', 87],
        ['Funnel', 'Lead System', 'Landing page to WhatsApp', 82],
        ['Content', '30 Days', 'Hooks, scripts, calendar', 74]
      ],
      visualTitle: 'Funnel Visual',
      visualLabel: 'Ad -> Landing Page -> WhatsApp -> CRM',
      visualSteps: ['Hook', 'Offer', 'Proof', 'Lead capture'],
      sideTitle: 'Campaign Builders',
      sideItems: [
        ['Ad angles', 'Pain, desire, proof, urgency, local trust.'],
        ['CTA scripts', 'Clear next step for WhatsApp and lead forms.'],
        ['Content plan', 'Daily hooks and formats for Moroccan buyers.']
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp & CRM Agent',
      icon: 'flaticon-381-smartphone',
      label: 'Scripts and follow-up',
      accent: '#0E8F72',
      heroTitle: 'Qualify leads and follow up like a real system.',
      subtitle: 'Create WhatsApp scripts, lead qualification questions, follow-up flows, CRM statuses, and response templates.',
      placeholder: 'Ask for WhatsApp scripts, lead qualification, follow-up, or CRM workflow...',
      welcome: 'Ana WhatsApp & CRM Agent. 3tini type dyal leads w offer. Ghadi nbuildi script, questions, status pipeline, w follow-up messages.',
      quickPrompts: [
        ['Write qualification script', 'Sawb lia WhatsApp qualification script for leads f Morocco, professional but friendly.'],
        ['Create follow-up flow', 'Dir lia follow-up sequence 7 days for leads li ma jawabouch.'],
        ['Build CRM workflow', 'Create CRM mini workflow: new lead, qualified, proposal, won, lost, follow-up.']
      ],
      cards: [
        ['Lead Status', 'Qualified', 'Budget, need, timing', 79],
        ['Follow-up', '7 Day Flow', 'Message sequence', 86],
        ['CRM', 'Mini Pipeline', 'Statuses and actions', 83]
      ],
      visualTitle: 'CRM Mini-Flow',
      visualLabel: 'New lead -> Qualified -> Proposal -> Won',
      visualSteps: ['Ask 4 questions', 'Score lead', 'Send offer', 'Schedule follow-up'],
      sideTitle: 'WhatsApp Preview',
      sideItems: [
        ['Opening message', 'Salam, thanks for your interest.'],
        ['Qualification', 'Budget, city, deadline, problem.'],
        ['Follow-up', 'Helpful reminder with a clear next step.']
      ]
    },
    {
      id: 'startup',
      name: 'Startup Launch Agent',
      icon: 'flaticon-381-flag',
      label: 'MVP and launch plan',
      accent: '#3461FF',
      heroTitle: 'Launch a startup with fewer guesses.',
      subtitle: 'Plan MVP scope, validation, pricing, first users, launch timeline, and the founder roadmap.',
      placeholder: 'Ask for MVP steps, validation plan, pricing, or launch timeline...',
      welcome: 'Ana Startup Launch Agent. Describe idea dyalek, users, budget, w launch deadline. Ghadi nsplitiha MVP, validation, pricing, w roadmap.',
      quickPrompts: [
        ['Validate idea', 'Bghit validate startup idea f Morocco. 3tini tests, questions, audience, and success criteria.'],
        ['Define MVP', 'Sawb lia MVP scope: must-have, nice-to-have, launch version, and tech/business tasks.'],
        ['Pricing blocks', 'Suggest pricing and offer blocks for this startup in Morocco.']
      ],
      cards: [
        ['MVP', 'Launch Version', 'Core feature set', 75],
        ['Validation', 'First Users', 'Interviews and tests', 88],
        ['Pricing', 'Offer Blocks', 'Packages and limits', 72]
      ],
      visualTitle: 'Launch Checklist',
      visualLabel: 'Validate -> Build -> Price -> Launch',
      visualSteps: ['Problem interviews', 'MVP scope', 'Pilot users', 'Public launch'],
      sideTitle: 'Founder Tasks',
      sideItems: [
        ['Validation', 'Talk to buyers before building too much.'],
        ['MVP steps', 'Ship the smallest useful version.'],
        ['Launch timeline', 'Weekly actions from idea to first revenue.']
      ]
    },
    {
      id: 'automation',
      name: 'AI & Automation Agent',
      icon: 'flaticon-381-settings-2',
      label: 'Tools and workflows',
      accent: '#1C64F2',
      heroTitle: 'Design AI workflows that save time.',
      subtitle: 'Map AI use cases, automation flows, tool stacks, and business systems for operations, sales, support, and content.',
      placeholder: 'Ask for AI use cases, automation flow, tool stack, or process design...',
      welcome: 'Ana AI & Automation Agent. 3tini repetitive tasks f business dyalek. Ghadi nproposi workflow, tools, data flow, w implementation steps.',
      quickPrompts: [
        ['Suggest AI use cases', 'Suggest AI automation use cases for my Moroccan business, ranked by impact and difficulty.'],
        ['Build workflow', 'Design automation flow: lead form -> WhatsApp -> CRM -> follow-up -> report.'],
        ['Choose tool stack', 'Qaren lia tools for AI, CRM, automation, content, and reporting for a small business.']
      ],
      cards: [
        ['Automation', 'Workflow', 'Triggers and actions', 85],
        ['AI Use Cases', 'Priority Map', 'Impact vs difficulty', 77],
        ['Tool Stack', 'Lean Setup', 'Low cost and scalable', 81]
      ],
      visualTitle: 'Automation Flow Cards',
      visualLabel: 'Trigger -> AI step -> Human review -> CRM',
      visualSteps: ['Capture data', 'Generate output', 'Approve action', 'Sync system'],
      sideTitle: 'Automation Ideas',
      sideItems: [
        ['Lead handling', 'Auto-sort leads and prepare replies.'],
        ['Content system', 'Turn briefs into posts, scripts, and emails.'],
        ['Reporting', 'Weekly dashboard from sheets and CRM.']
      ]
    },
    {
      id: 'website',
      name: 'IT / Website Agent',
      icon: 'flaticon-381-internet',
      label: 'SEO, UX and technical plan',
      accent: '#0B5FD7',
      heroTitle: 'Improve websites, landing pages, SEO, and UX.',
      subtitle: 'Audit website structure, landing page clarity, SEO basics, performance, conversion paths, and technical planning.',
      placeholder: 'Ask for website audit, SEO, landing page structure, performance, or UI/UX improvements...',
      welcome: 'Ana IT / Website Agent. 3tini link, page structure, or goal. Ghadi nreviewi UX, SEO, performance, copy, w conversion path.',
      quickPrompts: [
        ['Audit website', 'Audit my website/landing page for Moroccan leads: UX, copy, trust, SEO, conversion.'],
        ['SEO quick actions', '3tini SEO quick wins for this service in Morocco: titles, sections, keywords, internal links.'],
        ['Landing page structure', 'Sawb lia landing page structure for this offer: hero, proof, sections, FAQ, CTA.']
      ],
      cards: [
        ['Website Audit', 'UX + Trust', 'Clarity and proof', 82],
        ['SEO', 'Quick Wins', 'Pages, titles, intent', 74],
        ['Performance', 'Fast Page', 'Mobile and conversion', 69]
      ],
      visualTitle: 'Landing Page Structure',
      visualLabel: 'Hero -> Proof -> Offer -> FAQ -> CTA',
      visualSteps: ['Clear promise', 'Local proof', 'Service blocks', 'Conversion CTA'],
      sideTitle: 'Website Actions',
      sideItems: [
        ['SEO plan', 'Search intent, page map, internal links.'],
        ['UI/UX prompts', 'Make the page easier to scan and trust.'],
        ['Tech plan', 'Stack, performance, forms, tracking.']
      ]
    }
  ];
})(window);
