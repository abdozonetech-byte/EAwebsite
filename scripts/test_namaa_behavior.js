const fs = require('fs');

const source = fs.readFileSync('functions/api/namaa/agent.js', 'utf8');
const body = source
  .replace(
    /^import[\s\S]*?from '\.\/_api-config\.js';\n\n/,
    `const safeText = (value, max = 4000) => String(value || '').trim().slice(0, max);
const NAMAA_API_CONFIG = { talk: {} };
const callGemini = () => {};
const jsonResponse = () => {};
const normalizeHistory = () => [];
const optionsResponse = () => {};
const readJson = () => {};
`
  )
  .replace(/export\s+/g, '');

const factory = new Function(`${body}
return {
  inferLanguageStyle,
  buildUserPrompt,
  softCtaInstruction,
  cleanPublicAnswer,
};
`);

const {
  inferLanguageStyle,
  buildUserPrompt,
  softCtaInstruction,
  cleanPublicAnswer,
} = factory();

const cases = [
  {
    label: 'Darija greeting',
    text: 'salam',
    style: 'darija-latin',
    cta: false,
    contact: false,
    long: false,
  },
  {
    label: 'Darija idea',
    text: 'bghit fikra business f morocco',
    style: 'darija-latin',
    cta: false,
    contact: false,
    long: false,
  },
  {
    label: 'Arabic site improve',
    text: 'أريد تحسين موقعي',
    style: 'arabic-script',
    cta: true,
    contact: false,
    long: false,
  },
  {
    label: 'French strategy',
    text: 'Je veux une stratégie marketing',
    style: 'french',
    cta: true,
    contact: false,
    long: false,
  },
  {
    label: 'English startup idea',
    text: 'I need a startup idea',
    style: 'english',
    cta: false,
    contact: false,
    long: false,
  },
  {
    label: 'Simple CRM definition',
    text: 'What is CRM?',
    style: 'english',
    cta: false,
    contact: false,
    long: false,
  },
  {
    label: 'Full roadmap',
    text: 'Give me a full roadmap for an AI automation agency',
    style: 'english',
    cta: true,
    contact: false,
    long: true,
  },
  {
    label: 'Unrelated sports',
    text: "Who won yesterday's match?",
    style: 'english',
    cta: false,
    contact: false,
    long: false,
  },
  {
    label: 'Landing page and ads',
    text: 'I need a landing page and ads system',
    style: 'english',
    cta: true,
    contact: false,
    long: false,
  },
  {
    label: 'French website',
    text: 'Je veux créer un site pour mon business',
    style: 'french',
    cta: true,
    contact: false,
    long: false,
  },
  {
    label: 'Arabic marketing strategy',
    text: 'أريد استراتيجية تسويق لمشروعي',
    style: 'arabic-script',
    cta: true,
    contact: false,
    long: false,
  },
  {
    label: 'Darija landing page',
    text: 'bghit ndir landing page l service dyali',
    style: 'darija-latin',
    cta: true,
    contact: false,
    long: false,
  },
  {
    label: 'Strong execution intent',
    text: 'I want someone to build this for me',
    style: 'english',
    cta: true,
    contact: true,
    long: false,
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log('Running Namaa behavior checks...\n');

for (const testCase of cases) {
  const style = inferLanguageStyle(testCase.text);
  const prompt = buildUserPrompt(testCase.text, style, '', []);
  const cta = /Soft CTA is allowed|Strong execution\/contact intent detected/.test(prompt);
  const contact = prompt.includes('https://wa.me/212687321925')
    && prompt.includes('linkedin.com/in/elboubakry-abdessamad-a77360192');
  const long = /longer answer|asked for depth/.test(prompt);

  assert(style === testCase.style, `${testCase.label}: expected ${testCase.style}, got ${style}`);
  assert(cta === testCase.cta, `${testCase.label}: expected cta=${testCase.cta}, got ${cta}`);
  assert(contact === testCase.contact, `${testCase.label}: expected contact=${testCase.contact}, got ${contact}`);
  assert(long === testCase.long, `${testCase.label}: expected long=${testCase.long}, got ${long}`);

  console.log(`${testCase.label}: ok`);
}

const repeated = softCtaInstruction('I need a landing page', 'english', [
  { role: 'assistant', content: 'Elboubakry Abdessamad can help.' },
]);
assert(/Do not mention Elboubakry/.test(repeated), 'Repeated CTA guard failed');
console.log('Repeated CTA guard: ok');

const declined = softCtaInstruction('I need a landing page', 'english', [
  { role: 'user', content: 'No thanks, not interested.' },
]);
assert(/declined|resisted/i.test(declined), 'Declined CTA guard failed');
console.log('Declined CTA guard: ok');

const cleaned = cleanPublicAnswer('Gemini and ChatGPT');
assert(cleaned === 'Namaa Talk and Namaa Talk', 'Provider cleanup failed');
console.log('Provider cleanup: ok');

console.log('\nChecks complete.');
