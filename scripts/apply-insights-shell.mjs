import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const insightsDir = new URL('../insights/', import.meta.url);
const files = readdirSync(insightsDir)
  .filter((file) => file.endsWith('.html') && file !== 'index.html')
  .sort();

const header = `<a class="ea-shell-skip" href="#main-content">Aller au contenu principal</a>
<header class="ea-shell-header" data-shell-header><div class="ea-shell-inner"><a aria-label="Accueil Elboubakry" class="ea-shell-logo" href="/">Elboubakry<span>.</span></a><nav aria-label="Navigation principale" class="ea-shell-nav" data-shell-nav id="site-navigation"><ul><li><a class="ea-nav-icon-link" href="/"><svg aria-hidden="true" class="ea-nav-icon" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/></svg><span>Accueil</span></a></li><li><a class="ea-nav-icon-link" href="/services/"><svg aria-hidden="true" class="ea-nav-icon" viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></svg><span>Services</span></a></li><li><a class="ea-nav-icon-link" href="/projets/"><svg aria-hidden="true" class="ea-nav-icon" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18M10 12v2h4v-2"/></svg><span>Projets</span></a></li><li><a class="ea-nav-icon-link" href="/about-elboubakry-abdessamad"><svg aria-hidden="true" class="ea-nav-icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg><span>Profil</span></a></li><li><a aria-current="page" class="ea-nav-icon-link" href="/insights/"><svg aria-hidden="true" class="ea-nav-icon" viewBox="0 0 24 24"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23V5.5Zm16 0A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23V5.5Z"/></svg><span>Guides</span></a></li><li><a class="ea-nav-icon-link" href="/#contact"><svg aria-hidden="true" class="ea-nav-icon" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 1 1-4.2-7.3A8.5 8.5 0 0 1 21 11.5ZM7 19l-4 2 1.3-4.5"/></svg><span>Contact</span></a></li><li class="ea-shell-mobile-cta"><a href="/reserver-diagnostic/">Réserver un diagnostic ↗</a></li></ul></nav><a class="ea-shell-cta" href="/reserver-diagnostic/">Réserver un diagnostic <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg></a><button class="ea-shell-menu" data-shell-menu type="button" aria-label="Ouvrir le menu" aria-controls="site-navigation" aria-expanded="false"><span></span></button></div></header>`;

const footer = `<footer class="ea-shell-footer"><div class="ea-shell-footer-inner"><div class="ea-shell-footer-top"><div class="ea-shell-footer-brand"><a class="ea-shell-logo" href="/">Elboubakry<span>.</span></a><p>Consultant marketing digital au Maroc. Stratégie, acquisition, IA, automatisation et systèmes de leads.</p></div><nav aria-label="Navigation du pied de page"><h2>Navigation</h2><ul><li><a href="/services/">Services</a></li><li><a href="/projets/">Projets</a></li><li><a href="/about-elboubakry-abdessamad">Profil</a></li><li><a href="/insights/">Guides</a></li></ul></nav><nav aria-label="Liens de contact"><h2>Contact</h2><ul><li><a href="mailto:abdozonetech@gmail.com">Email</a></li><li><a href="https://wa.me/212687321925" rel="noopener noreferrer">WhatsApp</a></li><li><a href="https://www.linkedin.com/in/elboubakry-abdessamad-a77360192/" rel="noopener noreferrer">LinkedIn</a></li><li><a href="/reserver-diagnostic/">Diagnostic</a></li></ul></nav></div><div class="ea-shell-footer-bottom"><span>© 2026 Elboubakry Abdessamad. Tous droits réservés.</span><span><a href="/politique-confidentialite">Confidentialité</a> · <a href="/mentions-legales">Mentions légales</a></span></div></div></footer>`;

let updated = 0;
for (const file of files) {
  const path = join(insightsDir.pathname, file);
  let html = readFileSync(path, 'utf8');
  html = html.replace(
    /elboubakry-global-shell\.css\?v=[^"']+/g,
    'elboubakry-global-shell.css?v=20260930-shell4',
  );
  if (html.includes('data-shell-header')) {
    writeFileSync(path, html);
    updated += 1;
    continue;
  }

  html = html.replace(
    '</head>',
    '<link href="../assets/css/elboubakry-global-shell.css?v=20260930-shell4" rel="stylesheet"/><script defer src="../assets/js/elboubakry-global-shell.js?v=20260928-1"></script></head>',
  );
  html = html.replace(/<body([^>]*)>/, `<body$1>\n${header}`);
  html = html.replace(/<main(?![^>]*\bid=)([^>]*)>/, '<main id="main-content"$1>');
  html = html.replace('</body>', `${footer}</body>`);

  if (!html.includes('data-shell-header') || !html.includes('id="main-content"')) {
    throw new Error(`Shell injection failed for ${file}`);
  }
  writeFileSync(path, html);
  updated += 1;
}

console.log(`Updated ${updated} insight article pages.`);
