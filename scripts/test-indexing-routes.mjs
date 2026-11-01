import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/search-console-2026-11-01.json', import.meta.url), 'utf8'));
const rules = fs.readFileSync(new URL('_redirects', root), 'utf8').split('\n').map(x => x.trim()).filter(x => x && !x.startsWith('#')).map(x => x.split(/\s+/));
function resolveRoute(url) {
  let route = new URL(url, fixture.base).pathname;
  const seen = new Set();
  for (let hop = 0; hop < 5; hop++) {
    assert(!seen.has(route), `Redirect loop: ${url}`);
    seen.add(route);
    const rule = rules.find(([source]) => {
      const regex = source.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:[\w-]+/g, '([^/]+)').replace(/\*/g, '(.*)');
      return new RegExp(`^${regex}$`).test(route);
    });
    if (!rule) return route;
    const [source, target, status] = rule;
    assert.equal(status, '301');
    const names = [...source.matchAll(/:([\w-]+)/g)].map(x => x[1]);
    const regex = source.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:[\w-]+/g, '([^/]+)').replace(/\*/g, '(.*)');
    const match = route.match(new RegExp(`^${regex}$`));
    route = names.reduce((value, name, i) => value.replace(`:${name}`, match[i + 1]), target);
  }
  throw new Error(`Too many redirects: ${url}`);
}
function htmlFor(route) {
  const candidates = route.endsWith('/') ? [route + 'index.html'] : [route, route + '.html', route + '/index.html'];
  const file = candidates.find(x => fs.existsSync(new URL('.' + x, root)) && fs.statSync(new URL('.' + x, root)).isFile());
  assert(file, `Missing target: ${route}`);
  return fs.readFileSync(new URL('.' + file, root), 'utf8');
}
function attr(tag, name) { return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1]; }
for (const group of ['missing', 'redirect', 'crawled', 'discovered', 'noindex']) {
  for (const url of fixture[group]) {
    const original = new URL(url, fixture.base).pathname;
    if (original.startsWith('/assets/') || original.startsWith('/cdn-cgi/')) continue;
    const route = resolveRoute(url);
    const html = htmlFor(route);
    const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].map(x => x[0]).find(x => attr(x, 'rel') === 'canonical');
    assert.equal(attr(canonical || '', 'href'), fixture.base + route, url);
    const robots = [...html.matchAll(/<meta\b[^>]*>/gi)].map(x => x[0]).find(x => attr(x, 'name') === 'robots');
    assert.equal(/\bnoindex\b/i.test(attr(robots || '', 'content') || ''), group === 'noindex', url);
  }
}
const sitemap = fs.readFileSync(new URL('sitemap.xml', root), 'utf8');
for (const url of fixture.noindex) assert(!sitemap.includes(`<loc>${new URL(url, fixture.base).href}</loc>`), url);
for (const section of ['/crm/*', '/api/crm/*', '/docs/*', '/evidence/*']) {
  const headers = fs.readFileSync(new URL('_headers', root), 'utf8');
  const block = headers.split('\n\n').find(x => x.startsWith(section + '\n') || x.includes('\n' + section + '\n'));
  assert(block?.includes('X-Robots-Tag: noindex'), `Private exclusion missing: ${section}`);
}
const retired = fixture.missing.filter(x => x.startsWith('/assets/') && !/mockup-carousel|ajax-form/.test(x)).map(x => x.split('?')[0]);
retired.push('/cdn-cgi/l/email-protection');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (['.git', 'scripts', 'docs', 'evidence', '.codex', 'node_modules'].includes(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
for (const file of walk(root.pathname).filter(x => /\.(html|css|js)$/.test(x))) {
  const text = fs.readFileSync(file, 'utf8');
  for (const url of retired) assert(!text.includes(url) && !text.includes(url.replace(/^\/assets\//, '../assets/')), `Retired resource referenced: ${file}: ${url}`);
}
console.log('PASS indexing regressions: historical content routes resolve, public canonicals remain indexable, intentional exclusions preserved, retired resources unreferenced.');
