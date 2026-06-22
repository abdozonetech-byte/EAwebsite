import { NAMAA_API_CONFIG, jsonResponse, optionsResponse, readJson, safeText } from './_api-config.js';
import { controlTalk, getMissingBriefFields } from './_conversation-controller.js';
import { getSmartBriefStatus } from './_smart-brief-builder.js';

const READY_BRIEF = {
  projectName: 'Namaa Test Restaurant',
  category: 'Restaurant / food',
  offer: 'Menu lunch and delivery',
  market: 'Casablanca',
  budget: '3000 DH',
  target: 'Young professionals and nearby families',
  goal: 'Generate WhatsApp orders',
  stage: 'Nouveau projet à lancer',
  channels: 'Instagram, WhatsApp',
  language: 'Darija Latin',
};

const TEST_CASES = [
  { id: 'small_talk', message: 'salam kifach nta', expectGenerate: false, expectIntent: 'small_talk' },
  { id: 'language_switch_darija', message: 'darija', expectGenerate: false, expectIntent: 'language_switch' },
  { id: 'short_command', message: 'jawb', expectGenerate: false, expectIntent: 'casual_conversation' },
  { id: 'football_bridge', message: 'chkon ghadi yrba7 match lyoum?', expectGenerate: false, expectIntent: 'friendly_off_topic_bridge' },
  { id: 'brief_needed', message: 'bghit ndir projet ecommerce f casa budget 3000dh', expectGenerate: false },
  { id: 'deliverable_blocked_until_brief', message: 'create market research pdf', expectGenerate: false, expectIntent: 'brief_required' },
  { id: 'deliverable_ready', message: 'create market research pdf', brief: READY_BRIEF, expectGenerate: true, expectIntent: 'market_research' },
];

function summarizeDecision(decision) {
  const brief = decision.brief || {};
  const briefStatus = decision.briefStatus || getSmartBriefStatus(brief, decision.language);
  return {
    intent: decision.intent,
    generate: Boolean(decision.generate),
    action: decision.action || null,
    shortMode: !decision.generate,
    answerPreview: decision.answer ? String(decision.answer).slice(0, 180) : '',
    briefReadiness: briefStatus.score,
    missingBriefFields: getMissingBriefFields(brief).map((field) => field.key),
    nextQuestions: briefStatus.nextQuestions || [],
  };
}

function runCase(test) {
  const decision = controlTalk({ message: test.message, brief: test.brief || null, action: test.action || null });
  const summary = summarizeDecision(decision);
  const passedGenerate = typeof test.expectGenerate === 'boolean' ? summary.generate === test.expectGenerate : true;
  const passedIntent = test.expectIntent ? summary.intent === test.expectIntent : true;
  return {
    id: test.id,
    passed: passedGenerate && passedIntent,
    expected: {
      generate: test.expectGenerate,
      intent: test.expectIntent || 'any',
    },
    result: summary,
  };
}

export async function onRequestOptions() {
  return optionsResponse();
}

export async function onRequestGet(context) {
  const env = context.env || {};
  const cases = TEST_CASES.map(runCase);
  const allPassed = cases.every((item) => item.passed);
  return jsonResponse({
    ok: allPassed,
    service: 'Namaa Diagnostics',
    update: '31-premium-fast-conversation',
    note: 'This endpoint tests Namaa routing logic without calling Gemini. Live chat uses a tiny fast local small-talk + Gemini micro-conversation mode for more human replies.',
    geminiConfigured: Boolean(env[NAMAA_API_CONFIG.talk.apiKeyEnv]),
    activeTextModel: env[NAMAA_API_CONFIG.talk.modelEnv] || NAMAA_API_CONFIG.talk.fallbackModel,
    activeImageModel: env[NAMAA_API_CONFIG.images.modelEnv] || NAMAA_API_CONFIG.images.fallbackModel,
    checks: cases,
  }, allPassed ? 200 : 500);
}

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  const message = safeText(body.message || body.prompt || body.question, 1200);
  const brief = body.brief && typeof body.brief === 'object' ? body.brief : null;
  const action = safeText(body.action || body.deliverable || '', 80) || null;

  const decision = controlTalk({ message, brief, action });
  return jsonResponse({
    ok: true,
    service: 'Namaa Diagnostics',
    update: '31-premium-fast-conversation',
    note: 'Controller preview only. No Gemini call was made here. Live /talk uses fast local small-talk + Gemini micro-conversation mode to rewrite short replies naturally while keeping scope safe.',
    input: { message, action, hasBrief: Boolean(brief) },
    decision: summarizeDecision(decision),
  });
}
