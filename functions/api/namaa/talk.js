import {
  NAMAA_API_CONFIG,
  callGemini,
  jsonResponse,
  normalizeHistory,
  optionsResponse,
  readJson,
  safeText,
} from './_api-config.js';

import {
  controlTalk,
  getMissingBriefFields,
} from './_conversation-controller.js';

import {
  getSmartBriefStatus,
} from './_smart-brief-builder.js';

import {
  NAMAA_TALK_SYSTEM_PROMPT,
  buildDeliverablePrompt,
} from './prompts/index.js';

const SYSTEM_PROMPT = NAMAA_TALK_SYSTEM_PROMPT;

const ACTION_LABELS = {
  market_research: 'Market Research PDF',
  marketing_strategy: 'Marketing Strategy PDF',
  roadmap: 'Launch Roadmap PDF',
  guided_brief: 'Lancer le brief guidé',
};

function htmlActionHint(actions = []) {
  return actions.filter(Boolean).map((action) => ({
    id: action,
    label: ACTION_LABELS[action] || action,
  }));
}

export async function onRequestOptions() {
  return optionsResponse();
}

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  const message = safeText(body.message || body.prompt || body.question, 2200);
  const brief = body.brief && typeof body.brief === 'object' ? body.brief : null;
  const requestedAction = safeText(body.action || body.deliverable || '', 80);

  if (!message && !requestedAction) {
    return jsonResponse({ ok: false, error: 'Message is required.' }, 400);
  }

  const decision = controlTalk({ message, brief, action: requestedAction || null });
  const briefStatus = decision.briefStatus || getSmartBriefStatus(decision.brief || brief || {}, decision.language);

  // Most Namaa Talk messages are intentionally short and do not call Gemini.
  // This keeps the conversation natural and avoids long answers before the brief is ready.
  if (!decision.generate) {
    return jsonResponse({
      ok: true,
      route: 'namaa-talk',
      connected: true,
      provider: 'namaa-controller',
      model: 'conversation-controller-v28 + smart-brief-builder + prompt-library + diagnostics',
      intent: decision.intent,
      answer: decision.answer,
      briefPatch: decision.briefPatch || {},
      brief: decision.brief || brief || null,
      missingBriefFields: getMissingBriefFields(decision.brief || brief || {}).map((field) => field.key),
      briefStatus,
      nextQuestions: briefStatus.nextQuestions || [],
      briefReadiness: briefStatus.score,
      actions: htmlActionHint(decision.actions || []),
      shortMode: true,
    });
  }

  const action = decision.action || requestedAction || 'marketing_strategy';
  const prompt = buildDeliverablePrompt(action, decision.brief || brief || {}, decision.language);
  const contents = [
    // Keep history tiny for deliverables to save tokens and avoid messy outputs.
    ...normalizeHistory(body.history).slice(-2),
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const deliverableConfig = {
    ...NAMAA_API_CONFIG.talk,
    maxOutputTokens: NAMAA_API_CONFIG.talk.deliverableMaxOutputTokens || 2200,
    temperature: 0.36,
  };

  const result = await callGemini({
    env: context.env,
    config: deliverableConfig,
    systemInstruction: SYSTEM_PROMPT,
    contents,
  });

  if (!result.ok) {
    return jsonResponse({
      ok: false,
      route: 'namaa-talk',
      connected: false,
      provider: 'gemini',
      model: result.model,
      intent: decision.intent,
      action,
      error: result.error,
    }, result.status || 500);
  }

  return jsonResponse({
    ok: true,
    route: 'namaa-talk',
    connected: true,
    provider: result.provider,
    model: result.model,
    intent: decision.intent,
    action,
    deliverableLabel: ACTION_LABELS[action] || 'Namaa PDF',
    answer: result.text || 'Namaa generated the deliverable, but Gemini returned an empty answer.',
    briefPatch: decision.briefPatch || {},
    brief: decision.brief || brief || null,
    briefStatus,
    nextQuestions: briefStatus.nextQuestions || [],
    briefReadiness: briefStatus.score,
    shortMode: false,
  });
}

export async function onRequestGet(context) {
  const config = NAMAA_API_CONFIG.talk;
  const hasSecret = Boolean(context.env?.[config.apiKeyEnv]);
  const model = context.env?.[config.modelEnv] || config.fallbackModel;
  return jsonResponse({
    ok: true,
    route: 'namaa-talk',
    provider: 'gemini + namaa-controller',
    connected: hasSecret,
    expectedSecret: config.apiKeyEnv,
    model,
    update: '28-testing-gemini-optimization',
    behavior: 'short chat first; smart brief builder asks only missing fields; confirmed deliverables use optimized Gemini prompts and branded PDFs',
  });
}
