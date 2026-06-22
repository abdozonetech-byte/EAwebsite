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

  // Update 32: Gemini Free Talk mode.
  // Namaa uses Gemini for daily/free conversation whenever the key is available.
  // The controller only routes intent, keeps the project brief clean, and provides a fallback if Gemini is unavailable.
  if (!decision.generate) {
    const hasGemini = Boolean(context.env?.[NAMAA_API_CONFIG.talk.apiKeyEnv]);
    let naturalAnswer = decision.answer;
    let provider = hasGemini ? 'gemini-free-talk' : 'namaa-controller-fallback';
    let model = hasGemini ? (context.env?.[NAMAA_API_CONFIG.talk.modelEnv] || NAMAA_API_CONFIG.talk.fallbackModel) : 'conversation-controller-v32';

    const shouldUseGeminiConversation = hasGemini;

    if (shouldUseGeminiConversation) {
      const chatConfig = {
        ...NAMAA_API_CONFIG.talk,
        maxOutputTokens: NAMAA_API_CONFIG.talk.conversationMaxOutputTokens || 180,
        temperature: 0.74,
        requestTimeoutMs: NAMAA_API_CONFIG.talk.conversationTimeoutMs || 9000,
        retryAttempts: 0,
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
          ...normalizeHistory(body.history).slice(-6),
          { role: 'user', parts: [{ text: conversationPrompt }] },
        ],
      });
      if (result.ok && result.text) {
        naturalAnswer = result.text;
        provider = result.provider + '-free-talk';
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
      conversationLabel: hasGemini ? 'AI Talk · Free Talk' : (decision.intent === 'out_of_scope' ? 'Conversation légère' : 'Namaa kayhder m3ak'),
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
    provider: 'gemini + namaa-free-talk-controller',
    connected: hasSecret,
    expectedSecret: config.apiKeyEnv,
    model,
    update: '32-gemini-free-talk',
    behavior: 'Gemini Free Talk for daily conversation, limited to AI/business/IT/startups/marketing/technology/programming; controlled deliverables use optimized prompts and branded PDFs',
  });
}
