# Namaa AI — Update 46: MUI Template Rebuild

This update rebuilds the Namaa UI direction using a cleaner MUI template-style layout.

## Main UX changes

- Simplified first screen.
- Free Talk and Build My Project are now the only visible primary choices.
- Right result panel stays hidden until a PDF, mockup, or website preview exists.
- Sidebar is minimal at first; Strategy/Design/Web agent hub appears only during project-building stages.
- Reduced repeated labels like Factory Cockpit / Agent Hub / route map on the first view.
- Kept Gemini Talk / Images / Dev API structure untouched.
- Kept trusted sources and live grounding from Update 45.

## UI direction

- MUI dashboard/template-inspired structure.
- Cleaner cards, appbar, sidebar, entry cards, and responsive mobile layout.
- More premium “assistant first, factory when needed” experience.

## Safety

No API key is added to project files. Gemini key remains in Cloudflare environment secrets.
