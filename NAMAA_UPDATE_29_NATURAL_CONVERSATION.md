# Namaa AI — Update 29: Natural Conversation Intelligence

## Goal
Make Namaa feel like a natural Moroccan business advisor instead of a long generic chatbot.

## What changed
- Added Darija smart conversation routing.
- Fixed short messages like: `salam`, `labas 3lik`, `jawb`, `darija`, `malk`.
- Namaa now replies naturally with short friendly answers.
- Added emoji-aware replies based on topic:
  - Business: 💼
  - Money/budget: 💰
  - AI/tech: 🤖
  - Marketing: 📣
  - Idea/mockup: 💡
  - Morocco: 🇲🇦
- Added friendly off-topic bridge for topics like football: Namaa gives one light sentence then returns to business/project work.
- Kept strict domain focus: AI, business, startups, IT, marketing, ecommerce, SaaS, landing pages, leads, and Moroccan market.
- Removed user-facing “backend prompt” wording from missing-info answers.
- Improved typing/loading animation in the chat UI.
- Updated health and diagnostics endpoints to Update 29.

## API behavior
- Small talk does not call Gemini.
- Language switching does not call Gemini.
- Casual short replies do not call Gemini.
- Out-of-scope redirect does not call Gemini.
- Gemini is used only for confirmed deliverables: Market Research PDF, Marketing Strategy PDF, Roadmap, Images, Dev.

## Test examples
- `salam`
- `labas 3lik`
- `jawb`
- `darija`
- `malk`
- `chkon ghadi yrba7 match lyoum?`
- `bghit ndir projet ecommerce f casa budget 3000dh`
