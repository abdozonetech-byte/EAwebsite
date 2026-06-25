const tests = [
  { label: 'Darija greeting', text: 'salam' },
  { label: 'Darija idea', text: 'bghit fikra business' },
  { label: 'Arabic site improve', text: 'أريد تحسين موقعي' },
  { label: 'French strategy', text: 'Je veux une stratégie marketing' },
  { label: 'English CRM', text: 'What is CRM?' },
  { label: 'English landing + ads', text: 'I need a landing page and ads system' },
  { label: 'Unrelated sports', text: "Who won yesterday's match?" },
  { label: 'Deep request', text: 'Give me a full roadmap and deep analysis for launching a SaaS' },
];

function inferLanguageStyle(text) {
  const value = String(text || '').trim();
  const lower = value.toLowerCase();
  if (/[-]|[\u0600-\u06FF]/.test(value) && /[\u0600-\u06FF]/.test(value)) return 'arabic-script';
  if (/\b(bghit|wach|kifach|3afak|salam|smah|daba|mzyan|khdma|projet|fikra|flous|maghrib|maroc|bzaf|chwiya|n9dro|nqder|baghi|bghina)\b/i.test(lower) || /[379]/.test(value)) return 'darija-latin';
  if (/[àâçéèêëîïôùûüÿœ]/i.test(value) || /\b(je|j'ai|j ai|vous|nous|pour|avec|une|des|stratégie|entreprise|idée|bonjour|salut|marché|croissance|publicité)\b/i.test(lower)) return 'french';
  return 'english';
}

function isLongModeRequested(message) {
  return /\b(deep analysis|full plan|roadmap|give me details|explain more|analyze deeply|analyse approfondie|plan complet|feuille de route|détails|شرح مفصل|خطة كاملة|roadmap|تفصيل|b tafsil|khtar lia b tafsil)\b/i.test(message);
}

function isSoftCtaRelevant(message) {
  const value = String(message || '').toLowerCase();
  if (/^(what is|what's|define|explain simply|c'?est quoi|qu'?est-ce que|شنو هو|ما هو|شنو هي|achno huwa|chno howa|wach chno|شنو معنى)\b/i.test(String(message || '').trim())) return false;
  return /\b(marketing strategy|digital strategy|website|site web|landing page|ads|advertising|meta ads|google ads|lead generation|leads|crm|automation|automatisation|business growth|growth|launch|roadmap|full plan|implementation|implement|build|create a site|créer un site|strategie marketing|stratégie marketing|génération de leads|جلب العملاء|استراتيجية تسويق|موقع|صفحة هبوط|إعلانات|عملاء|أتمتة|إطلاق|خطة كاملة|خارطة طريق|landing|ads system|systeme dyal leads|system dyal leads|ndir landing|ndir site|nlaunchi|n9ad|nbni|bghit ndir)\b/i.test(value);
}

console.log('Running Namaa behavior checks...\n');
for (const t of tests) {
  const lang = inferLanguageStyle(t.text);
  const longMode = isLongModeRequested(t.text);
  const softCTA = isSoftCtaRelevant(t.text);
  console.log(`${t.label}:`);
  console.log(`  text: ${t.text}`);
  console.log(`  inferredLanguage: ${lang}`);
  console.log(`  longModeRequested: ${longMode}`);
  console.log(`  softCtaRelevant: ${softCTA}\n`);
}

console.log('Checks complete.');
