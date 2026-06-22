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
  NAMAA_CONVERSATION_SYSTEM_PROMPT,
  buildConversationPrompt,
  buildDeliverablePrompt,
} from './prompts/index.js';

const SYSTEM_PROMPT = NAMAA_TALK_SYSTEM_PROMPT;
const CONVERSATION_PROMPT = NAMAA_CONVERSATION_SYSTEM_PROMPT;

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

  // Update 30: natural conversation mode.
  // Short everyday chat is now rewritten by Gemini in a tiny, low-token mode so Namaa feels alive,
  // while the controller still protects scope and keeps big deliverables controlled.
  if (!decision.generate) {
    const hasGemini = Boolean(context.env?.[NAMAA_API_CONFIG.talk.apiKeyEnv]);
    let naturalAnswer = decision.answer;
    let provider = hasGemini ? 'gemini-conversation' : 'namaa-controller';
    let model = hasGemini ? (context.env?.[NAMAA_API_CONFIG.talk.modelEnv] || NAMAA_API_CONFIG.talk.fallbackModel) : 'conversation-controller-v30';

    if (hasGemini) {
      const chatConfig = {
        ...NAMAA_API_CONFIG.talk,
        maxOutputTokens: NAMAA_API_CONFIG.talk.conversationMaxOutputTokens || 220,
        temperature: 0.78,
      };
      const conversationPrompt = buildConversationPrompt({
        message,
        decision,
        brief: decision.brief || brief || {},
        draftAnswer: decision.answer || '',
      });
      const result = await callGemini({
        env: context.env,
        config: chatConfig,
        systemInstruction: CONVERSATION_PROMPT,
        contents: [
          ...normalizeHistory(body.history).slice(-4),
          { role: 'user', parts: [{ text: conversationPrompt }] },
        ],
      });
      if (result.ok && result.text) {
        naturalAnswer = result.text;
        provider = result.provider + '-conversation';
        model = result.model;
      }
    }

    const showBriefCoach = ['business_chat', 'brief_required', 'pdf_choice'].includes(decision.intent) && Boolean(briefStatus?.missingFields?.length);

    return jsonResponse({
      ok: true,
      route: 'namaa-talk',
      connected: hasGemini,
      provider,
      model,
      intent: decision.intent,
      answer: naturalAnswer,
      fallbackAnswer: decision.answer,
      briefPatch: decision.briefPatch || {},
      brief: decision.brief || brief || null,
      missingBriefFields: getMissingBriefFields(decision.brief || brief || {}).map((field) => field.key),
      briefStatus,
      nextQuestions: briefStatus.nextQuestions || [],
      briefReadiness: briefStatus.score,
      actions: htmlActionHint(decision.actions || []),
      shortMode: true,
      showBriefCoach,
      conversationLabel: decision.intent === 'out_of_scope' ? 'Conversation légère' : 'Namaa kayhder m3ak',
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
    update: '30-human-conversation-mode',
    behavior: 'Gemini micro-conversation for natural short replies; soft topic bridge; controlled deliverables use optimized prompts and branded PDFs',
  });
}
