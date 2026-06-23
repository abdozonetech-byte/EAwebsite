import {
  NAMAA_API_CONFIG,
  callGemini,
  jsonResponse,
  publicRouteStatus,
  getModel,
  shouldEnableGrounding,
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
  NAMAA_VOICE_LAYER_SYSTEM_PROMPT,
  buildNamaaVoicePrompt,
  buildDeliverablePrompt,
} from './prompts/index.js';

import {
  selectTrustedSourcesForBrief,
  compactSourcesForClient,
  mergeTrustedAndLiveSources,
} from './sources/source-registry.js';

const SYSTEM_PROMPT = NAMAA_TALK_SYSTEM_PROMPT;
const CONVERSATION_PROMPT = NAMAA_VOICE_LAYER_SYSTEM_PROMPT || NAMAA_CONVERSATION_SYSTEM_PROMPT;

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

  // Update 33: Namaa Voice Layer.
  // Gemini is the intelligence engine, but the final answer is shaped by Namaa's own voice, language and soft steering rules.
  if (!decision.generate) {
    const hasGemini = Boolean(context.env?.[NAMAA_API_CONFIG.talk.apiKeyEnv]);
    let naturalAnswer = decision.answer;
    let provider = hasGemini ? 'gemini-free-talk' : 'namaa-controller-fallback';
    let model = hasGemini ? (context.env?.[NAMAA_API_CONFIG.talk.modelEnv] || NAMAA_API_CONFIG.talk.fallbackModel) : 'conversation-controller-v33';

    const shouldUseGeminiConversation = hasGemini;

    if (shouldUseGeminiConversation) {
      const chatConfig = {
        ...NAMAA_API_CONFIG.talk,
        maxOutputTokens: NAMAA_API_CONFIG.talk.conversationMaxOutputTokens || 180,
        temperature: 0.74,
        requestTimeoutMs: NAMAA_API_CONFIG.talk.conversationTimeoutMs || 9000,
        retryAttempts: 0,
      };
      const normalizedHistory = normalizeHistory(body.history).slice(-4);
      const recentAssistantReplies = (Array.isArray(body.history) ? body.history : [])
        .filter((item) => item?.role === 'assistant' && typeof item.content === 'string')
        .slice(-3)
        .map((item) => item.content);

      const conversationPrompt = buildNamaaVoicePrompt({
        message,
        decision,
        brief: decision.brief || brief || {},
        fallbackAnswer: decision.answer || '',
        recentAssistantReplies,
      });
      const result = await callGemini({
        env: context.env,
        config: chatConfig,
        systemInstruction: CONVERSATION_PROMPT,
        contents: [
          ...normalizedHistory,
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
      conversationLabel: hasGemini ? 'Namaa Voice · Free Talk' : (decision.intent === 'out_of_scope' ? 'Conversation légère' : 'Namaa kayhder m3ak'),
    });
  }

  const action = decision.action || requestedAction || 'marketing_strategy';
  const deliverableBrief = decision.brief || brief || {};
  const selectedSources = selectTrustedSourcesForBrief(deliverableBrief, action);
  const prompt = buildDeliverablePrompt(action, deliverableBrief, decision.language, selectedSources);
  const contents = [
    // Keep history tiny for deliverables to save tokens and avoid messy outputs.
    ...normalizeHistory(body.history).slice(-2),
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const groundingEnabled = shouldEnableGrounding(context.env, NAMAA_API_CONFIG.talk);
  const groundedModel = (context.env?.[NAMAA_API_CONFIG.talk.groundingModelEnv] || NAMAA_API_CONFIG.talk.groundingFallbackModel || getModel(context.env, NAMAA_API_CONFIG.talk));
  const deliverableConfig = {
    ...NAMAA_API_CONFIG.talk,
    maxOutputTokens: NAMAA_API_CONFIG.talk.deliverableMaxOutputTokens || 2200,
    temperature: 0.34,
    requestTimeoutMs: Math.max(NAMAA_API_CONFIG.talk.requestTimeoutMs || 25000, groundingEnabled ? 34000 : 25000),
  };

  const result = await callGemini({
    env: context.env,
    config: deliverableConfig,
    systemInstruction: SYSTEM_PROMPT,
    contents,
    modelOverride: groundingEnabled ? groundedModel : undefined,
    tools: groundingEnabled ? [{ google_search: {} }] : undefined,
  });

  if (!result.ok) {
    return jsonResponse({
      ok: false,
      route: 'namaa-talk',
      connected: false,
      intent: decision.intent,
      action,
      error: result.error,
    }, result.status || 500);
  }

  const liveSources = result.grounding?.sources || [];
  const mergedSources = mergeTrustedAndLiveSources(selectedSources, liveSources);

  return jsonResponse({
    ok: true,
    route: 'namaa-talk',
    connected: true,
    provider: result.provider,
    model: result.model,
    intent: decision.intent,
    action,
    sources: compactSourcesForClient(mergedSources),
    trustedSources: compactSourcesForClient(selectedSources),
    liveSources: compactSourcesForClient(liveSources),
    liveSearch: {
      enabled: groundingEnabled,
      grounded: Boolean(result.grounding?.grounded),
      queries: result.grounding?.queries || [],
      supportsCount: result.grounding?.supportsCount || 0,
    },
    sourcePolicy: groundingEnabled ? 'Namaa uses curated Morocco trusted sources and Gemini Google Search grounding for fresh citations. Exact figures still need official-source verification before legal, financial or investment decisions.' : 'Namaa uses a curated trusted-source registry. Exact numbers must be verified from official sources; recommendations are separated from facts.',
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
  return jsonResponse(publicRouteStatus('namaa-talk', hasSecret, { service: 'Namaa Business Talk', update: '79-security-speed-clean' }));
}
