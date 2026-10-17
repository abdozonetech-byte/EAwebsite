import { cleanIntelligenceText } from "./lead-intelligence.js";

// Only user-entered business search geography, never device coordinates.
export function cleanDiscoveryCriteria(body) {
  const country = cleanIntelligenceText(body?.country, 100).toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw new Error("Choose a country for this search.");
  const criteria = {
    category: cleanIntelligenceText(body?.category, 160),
    city: cleanIntelligenceText(body?.city, 100),
    country,
    locality: cleanIntelligenceText(body?.locality, 160),
    keywords: cleanIntelligenceText(body?.keywords, 500),
    businessType: cleanIntelligenceText(body?.businessType, 160),
  };
  if (!criteria.city || !criteria.category) throw new Error("Choose a business category and city.");
  return criteria;
}

export function locationFilters(params, search) {
  const city = cleanIntelligenceText(params.get("city"), 100).replace(/[*,()"\\]/g, " ").trim();
  const country = cleanIntelligenceText(params.get("country"), 20);
  if (city) search.city = `ilike.${city}`;
  if (country === "unknown") search.country = "is.null";
  else if (/^[A-Za-z]{2}$/.test(country)) search.country = `eq.${country.toUpperCase()}`;
  return search;
}
