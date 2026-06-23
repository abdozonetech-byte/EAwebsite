# Namaa AI Update 61 — Project Brief Builder

Goal: make Namaa Business Talk act as the main discovery brain before Design / Website / Strategy.

## What changed

- Added Update 61 project brief builder logic inside `/api/namaa/agent`.
- Namaa Business Talk now detects when the user is trying to build a project.
- It collects a compact project brief step by step:
  - project name
  - category
  - offer
  - city / market
  - budget
  - target customer
  - main goal
  - stage
  - current channels
  - preferred language/style
- It asks only the next useful questions instead of giving a long generic answer.
- When the brief is almost ready, it summarizes with a “Fhemtk…” style confirmation and asks if the understanding is correct.
- Frontend now stores the project brief during the conversation and sends it back to the backend with each message.
- UI/UX and animations were kept as they were in Update 60.

## Security notes

- No API key was added to the frontend.
- Gemini stays private through Cloudflare environment secrets.
- The project brief contains only user-provided conversation context.
- No executable or shell files were added.
