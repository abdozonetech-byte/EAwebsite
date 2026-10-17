const ANALYSIS_STATUSES = new Set(["not_analyzed", "queued", "processing", "completed", "failed"]);
const MAX_ANALYSIS_TEXT = 12000;

function cleanIntelligenceText(value, max = MAX_ANALYSIS_TEXT) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, max);
}

function normalizeScore(value) {
  if (value === "" || value === null || value === undefined) return null;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? Math.round(score) : null;
}

function normalizeStringList(value, maxItems = 12, maxLength = 500) {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\n|;/)
      : [];
  return items
    .map((item) => cleanIntelligenceText(item, maxLength).replace(/^[-*\d.)\s]+/, ""))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeEvidence(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const evidence = [];
  for (const entry of value.slice(0, 30)) {
    const rawUrl = typeof entry === "string" ? entry : entry?.url;
    let url;
    try {
      const parsed = new URL(cleanIntelligenceText(rawUrl, 1200));
      if (!/^https?:$/.test(parsed.protocol)) continue;
      parsed.hash = "";
      url = parsed.toString().slice(0, 1200);
    } catch {
      continue;
    }
    if (seen.has(url)) continue;
    seen.add(url);
    evidence.push({
      url,
      title: cleanIntelligenceText(typeof entry === "string" ? "" : entry?.title, 240),
      claim: cleanIntelligenceText(typeof entry === "string" ? "" : entry?.claim, 700),
    });
  }
  return evidence;
}

function normalizeConfidence(value) {
  if (typeof value === "number" && Number.isFinite(value)) return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
  const text = cleanIntelligenceText(value, 80).toLowerCase();
  const aliases = { high: "high", haute: "high", medium: "medium", moyenne: "medium", low: "low", faible: "low" };
  if (aliases[text]) return aliases[text];
  if (/^\d{1,3}%$/.test(text) && Number(text.slice(0, -1)) <= 100) return text;
  return cleanIntelligenceText(value, 80);
}

function analysisLeadId(item) {
  return cleanIntelligenceText(item?.lead_id || item?.leadId || item?.crm_lead_id || item?.crmId, 80);
}

function normalizeAnalysisItem(item, index = 0) {
  const leadId = analysisLeadId(item);
  const digitalMaturityScore = normalizeScore(item?.digital_maturity_score ?? item?.digitalMaturityScore);
  const opportunityScore = normalizeScore(item?.opportunity_score ?? item?.opportunityScore);
  const salesPriorityScore = normalizeScore(item?.sales_priority_score ?? item?.salesPriorityScore);
  const researchConfidence = normalizeConfidence(item?.research_confidence ?? item?.researchConfidence);
  const currentSituation = cleanIntelligenceText(item?.current_situation ?? item?.currentSituation);
  const websiteAnalysis = cleanIntelligenceText(item?.website_analysis ?? item?.websiteAnalysis);
  const landingPageAnalysis = cleanIntelligenceText(item?.landing_page_analysis ?? item?.landingPageAnalysis);
  const seoAnalysis = cleanIntelligenceText(item?.seo_analysis ?? item?.seoAnalysis);
  const geoAnalysis = cleanIntelligenceText(item?.geo_analysis ?? item?.geoAnalysis);
  const socialAnalysis = cleanIntelligenceText(item?.social_analysis ?? item?.socialAnalysis);
  const marketingAnalysis = cleanIntelligenceText(item?.marketing_analysis ?? item?.marketingAnalysis);
  const crmAutomationAnalysis = cleanIntelligenceText(item?.crm_automation_analysis ?? item?.crmAutomationAnalysis);
  const scoreExplanations = {
    digital_maturity: cleanIntelligenceText(item?.score_explanations?.digital_maturity ?? item?.scoreExplanations?.digitalMaturity, 2000),
    business_opportunity: cleanIntelligenceText(item?.score_explanations?.business_opportunity ?? item?.scoreExplanations?.businessOpportunity, 2000),
    sales_priority: cleanIntelligenceText(item?.score_explanations?.sales_priority ?? item?.scoreExplanations?.salesPriority, 2000),
  };
  const weaknesses = normalizeStringList(item?.weaknesses);
  const opportunities = normalizeStringList(item?.opportunities);
  const recommendedServices = normalizeStringList(item?.recommended_services ?? item?.recommendedServices, 3);
  const actionPlan = normalizeStringList(item?.action_plan ?? item?.actionPlan, 12, 800);
  const salesApproach = cleanIntelligenceText(item?.sales_approach ?? item?.salesApproach);
  const evidence = normalizeEvidence(item?.evidence ?? item?.source_urls ?? item?.sourceUrls);
  const reportMarkdown = cleanIntelligenceText(item?.report_markdown ?? item?.reportMarkdown, 50000);
  const researchedAtRaw = cleanIntelligenceText(item?.researched_at ?? item?.researchedAt, 80);
  const researchedAt = researchedAtRaw && !Number.isNaN(new Date(researchedAtRaw).getTime())
    ? new Date(researchedAtRaw).toISOString()
    : "";
  const issues = [];
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(leadId)) issues.push("invalid_lead_id");
  if (digitalMaturityScore === null) issues.push("invalid_digital_maturity_score");
  if (opportunityScore === null) issues.push("invalid_opportunity_score");
  if (salesPriorityScore === null) issues.push("invalid_sales_priority_score");
  if (!researchConfidence) issues.push("missing_research_confidence");
  if (!currentSituation) issues.push("missing_current_situation");
  if (!websiteAnalysis) issues.push("missing_website_analysis");
  if (!landingPageAnalysis) issues.push("missing_landing_page_analysis");
  if (!seoAnalysis) issues.push("missing_seo_analysis");
  if (!geoAnalysis) issues.push("missing_geo_analysis");
  if (!socialAnalysis) issues.push("missing_social_analysis");
  if (!marketingAnalysis) issues.push("missing_marketing_analysis");
  if (!crmAutomationAnalysis) issues.push("missing_crm_automation_analysis");
  if (!scoreExplanations.digital_maturity || !scoreExplanations.business_opportunity || !scoreExplanations.sales_priority) issues.push("missing_score_explanations");
  if (!weaknesses.length) issues.push("missing_weaknesses");
  if (!opportunities.length) issues.push("missing_opportunities");
  if (!recommendedServices.length) issues.push("missing_recommended_services");
  if (!salesApproach) issues.push("missing_sales_approach");
  if (!evidence.length) issues.push("missing_evidence_urls");
  if (!researchedAt) issues.push("missing_or_invalid_research_date");
  return {
    index,
    leadId,
    digitalMaturityScore,
    opportunityScore,
    salesPriorityScore,
    researchConfidence,
    currentSituation,
    websiteAnalysis,
    landingPageAnalysis,
    seoAnalysis,
    geoAnalysis,
    socialAnalysis,
    marketingAnalysis,
    crmAutomationAnalysis,
    scoreExplanations,
    weaknesses,
    opportunities,
    recommendedServices,
    actionPlan,
    salesApproach,
    evidence,
    reportMarkdown,
    researchedAt,
    issues,
  };
}

function toAnalysisRecord(item) {
  return {
    lead_id: item.leadId,
    analysis_status: "completed",
    digital_maturity_score: item.digitalMaturityScore,
    opportunity_score: item.opportunityScore,
    sales_priority_score: item.salesPriorityScore,
    research_confidence: item.researchConfidence,
    current_situation: item.currentSituation,
    website_analysis: item.websiteAnalysis,
    landing_page_analysis: item.landingPageAnalysis,
    seo_analysis: item.seoAnalysis,
    geo_analysis: item.geoAnalysis,
    social_analysis: item.socialAnalysis,
    marketing_analysis: item.marketingAnalysis,
    crm_automation_analysis: item.crmAutomationAnalysis,
    score_explanations: item.scoreExplanations,
    weaknesses: item.weaknesses,
    opportunities: item.opportunities,
    recommended_services: item.recommendedServices,
    action_plan: item.actionPlan,
    sales_approach: item.salesApproach,
    evidence: item.evidence,
    report_markdown: item.reportMarkdown || null,
    researched_at: item.researchedAt,
    research_source: "chatgpt_mcp",
    error_message: null,
  };
}

function publicResearchLead(row) {
  return {
    crm_lead_id: row.id,
    business_name: row.full_name || "",
    company: row.company_name || "",
    category: row.business_sector || "",
    city: row.city || "",
    country: row.country || "",
    website: row.landing_page_url || "",
    context: cleanIntelligenceText(row.message, 1200),
  };
}

function mapIntelligenceRow(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    company: row.company_name || "",
    businessSector: row.business_sector || "",
    city: row.city || "",
    country: row.country || "",
    website: row.landing_page_url || "",
    status: row.status || "new",
    priority: row.priority || "medium",
    analysisStatus: row.analysis_status || "not_analyzed",
    digitalMaturityScore: row.digital_maturity_score,
    opportunityScore: row.opportunity_score,
    salesPriorityScore: row.sales_priority_score,
    researchConfidence: row.research_confidence || "",
    currentSituation: row.current_situation || "",
    websiteAnalysis: row.website_analysis || "",
    landingPageAnalysis: row.landing_page_analysis || "",
    seoAnalysis: row.seo_analysis || "",
    geoAnalysis: row.geo_analysis || "",
    socialAnalysis: row.social_analysis || "",
    marketingAnalysis: row.marketing_analysis || "",
    crmAutomationAnalysis: row.crm_automation_analysis || "",
    scoreExplanations: row.score_explanations || {},
    weaknesses: row.weaknesses || [],
    opportunities: row.opportunities || [],
    recommendedServices: row.recommended_services || [],
    actionPlan: row.action_plan || [],
    salesApproach: row.sales_approach || "",
    evidence: row.evidence || [],
    reportMarkdown: row.report_markdown || "",
    researchedAt: row.researched_at || "",
    researchSource: row.research_source || "",
    errorMessage: row.error_message || "",
    batchId: row.batch_id || "",
    batchCode: row.batch_code || "",
    batchLeadStatus: row.batch_lead_status || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export {
  ANALYSIS_STATUSES,
  cleanIntelligenceText,
  mapIntelligenceRow,
  normalizeAnalysisItem,
  normalizeEvidence,
  normalizeScore,
  publicResearchLead,
  toAnalysisRecord,
};
