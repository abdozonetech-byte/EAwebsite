# Namaa AI — Update 44: Trusted Sources & Research Engine

## What changed

- Added a curated Morocco source registry for market research and strategy PDFs.
- Added source selector logic based on project category, market, goal and document type.
- Updated Market Research, Marketing Strategy and Roadmap prompts to include source rules.
- Added strict rule: no fake statistics, no unnamed “studies”, and exact numbers must be verified from official sources.
- Added “Sources used” section inside PDF preview and printable/downloadable PDF.
- Added fact vs recommendation behavior in the backend prompt.
- Added diagnostic preview for selected sources.

## Core source levels

1. Official Morocco sources: HCP, ANRT, Bank Al-Maghrib, INDH, Maroc PME, ministries.
2. International institutions: World Bank, ITU.
3. Industry/supporting sources: DataReportal, GSMA, Google Trends.

## Important note

This update does not expose API keys and does not add a new paid API. The current implementation starts with a curated trusted-source registry and source-aware prompts. A future update can add live Gemini Search Grounding or a research fetcher if needed.
