# Design QA — client references

- Source: user-supplied partner-grid reference (`codex-clipboard-37ee029c-82ed-4b48-8ac9-7446723dacc6.png`)
- Implementation: `http://127.0.0.1:4174/#references`
- Desktop validation: 1440 × 780 CSS pixels, normal density
- Mobile validation: 390 × 844 CSS pixels, normal density
- State: default, all three logo assets loaded

## Full-view comparison

The implementation preserves the reference composition: a pale neutral page background, a large inset white panel, centered purple eyebrow, high-contrast centered headline, generous vertical whitespace, and a single row of evenly sized bordered logo tiles. The three-column grid is an intentional content adaptation because the portfolio currently has three verified references rather than the eight placeholder brands shown in the source.

## Focused checks

- Typography: hierarchy and center alignment match the reference; the existing site typeface is retained for brand consistency.
- Spacing: panel padding, headline-to-grid rhythm, and tile gaps are balanced at desktop and mobile widths.
- Color: neutral surfaces, purple kicker, dark heading, and soft gray borders follow the supplied visual direction.
- Logos: all assets load at their natural resolution; Nova receives an orange backing so its white wordmark remains legible.
- Responsiveness: the logo marquee keeps fixed, legible card proportions at desktop and mobile widths; no horizontal overflow was observed.
- Interaction: the cards move continuously from left to right in a seamless loop, pause on hover or keyboard focus, and retain restrained lift/scale feedback plus visible focus states.
- Motion accessibility: reduced-motion preferences disable the automatic loop and expose a manually scrollable row instead.
- Accessibility: descriptive link names are available to assistive technology and decorative imagery is handled without duplicate announcements.

## Findings and resolution

- P2: Nova's original white wordmark lacked contrast on a white tile. Resolved with a compact brand-orange logo backing.
- P2: the Nova asset made its mobile tile taller than the other references. Resolved by constraining the rendered asset box.
- No outstanding P0, P1, or P2 issues.

## Comparison history

1. Initial implementation established the inset panel, centered heading, and three equal logo tiles.
2. Final pass improved Nova contrast, equalized responsive card heights, and verified loaded assets and overflow at desktop and mobile breakpoints.
3. Motion pass removed the supporting sentence and converted the static grid into a seamless, pauseable left-to-right client loop.

final result: passed
