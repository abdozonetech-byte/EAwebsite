# Namaa AI Update 49 — Agents Sidebar

This update turns the Namaa dashboard UI into a clearer multi-agent interface while preserving the existing dashboard UI/UX and animations.

## Added agents

- Namaa Business Talk — free conversation about AI, business, IT, marketing, startups, websites and Moroccan market decisions.
- Namaa Strategy — market research, first digital marketing strategy, positioning, roadmap, and a design-ready handoff brief.
- Namaa Design — logo concepts, mockups, brand direction, UI direction and Nano Banana / Gemini image-ready prompts.
- Namaa Website — landing page planning and HTML/CSS/JS-ready outputs.

## Frontend behavior

- Sidebar now has a dedicated Namaa Agents section.
- Clicking an agent updates the chat title, subtitle, badge, placeholder, welcome message and quick prompts.
- The chat payload now sends `agent`, `mode`, and a specific `context` to the API.

## Backend note

This update prepares the UI for agent routing. Gemini backend routing is planned for the next update.
