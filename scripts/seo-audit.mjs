import fs from 'node:fs';
import path from 'node:path';

const SITE_ORIGIN = 'https://elboubakry.com';
const root = path.resolve(process.argv[2] || '.');
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git') return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function report(file, message) {
  errors.push(`${file}: ${message}`);
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((match) => match[0]);
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] ?? null;
}

function routeCandidates(urlPath) {
  const clean = decodeURI(urlPath).replace(/^\/+/, '');
  if (!clean) return ['index.html'];
  if (clean.endsWith('/')) return [`${clean}index.html`];
  if (path.posix.extname(clean)) return [clean];
  return [clean, `${clean}.html`, `${clean}/index.html`];
}

function resolveReference(sourceFile, reference) {
  const clean = reference.split('#')[0].split('?')[0];
  if (!clean) return null;
  if (clean.startsWith('/')) return clean;
  const sourceRoute = `/${sourceFile}`;
  return path.posix.normalize(path.posix.join(path.posix.dirname(sourceRoute), clean));
}

function redirectMatcher(pattern) {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:[A-Za-z][A-Za-z0-9_-]*/g, '[^/]+')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const existingFiles = new Set(
  files.map((file) => path.relative(root, file).split(path.sep).join('/')),
);

const redirectFile = path.join(root, '_redirects');
const redirectRules = fs.readFileSync(redirectFile, 'utf8')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => {
    const [source, target, status] = line.split(/\s+/);
    return { source, target, status };
  });
const redirectSources = redirectRules.map(({ source }) => source);
const redirectMatchers = redirectSources.map((source) => ({
  source,
  matches: redirectMatcher(source),
}));

for (const { source, target } of redirectRules) {
  if (!target?.startsWith('/') || /[:*]/.test(target)) continue;
  const targetPath = target.split('#')[0].split('?')[0] || '/';
  const chainedRule = redirectMatchers.find(
    ({ source: candidate, matches }) => candidate !== source && matches.test(targetPath),
  );
  if (chainedRule) {
    report('_redirects', `${source} redirects through ${chainedRule.source} instead of resolving directly`);
  }
  if (!routeCandidates(targetPath).some((candidate) => existingFiles.has(candidate))) {
    report('_redirects', `${source} points to missing target ${target}`);
  }
}

const canonicalOwners = new Map();
const titleOwners = new Map();
const expectedNoindexFiles = new Set([
  'mentions-legales.html',
  'politique-confidentialite.html',
  'politique-cookies.html',
  'merci/index.html',
]);

for (const file of htmlFiles) {
  const relativeFile = path.relative(root, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');
  const metaTags = tags(html, 'meta');
  const linkTags = tags(html, 'link');
  const robots = metaTags
    .find((tag) => attribute(tag, 'name')?.toLowerCase() === 'robots');
  const robotsContent = robots ? attribute(robots, 'content') || '' : '';
  const indexable = !/\bnoindex\b/i.test(robotsContent);
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  const description = metaTags
    .filter((tag) => attribute(tag, 'name')?.toLowerCase() === 'description')
    .map((tag) => attribute(tag, 'content'))
    .filter(Boolean);
  const canonicals = linkTags
    .filter((tag) => (attribute(tag, 'rel') || '').toLowerCase().split(/\s+/).includes('canonical'))
    .map((tag) => attribute(tag, 'href'))
    .filter(Boolean);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (expectedNoindexFiles.has(relativeFile) && indexable) {
    report(relativeFile, 'private or utility page must remain noindex');
  }

  if (indexable) {
    if (!title) report(relativeFile, 'indexable page has no <title>');
    if (description.length !== 1) report(relativeFile, `expected 1 meta description, found ${description.length}`);
    if (canonicals.length !== 1) report(relativeFile, `expected 1 canonical, found ${canonicals.length}`);
    if (h1Count !== 1) report(relativeFile, `expected 1 <h1>, found ${h1Count}`);
  }

  for (const canonical of canonicals) {
    let canonicalUrl;
    try {
      canonicalUrl = new URL(canonical);
    } catch {
      report(relativeFile, `invalid canonical URL: ${canonical}`);
      continue;
    }
    if (canonicalUrl.origin !== SITE_ORIGIN) {
      report(relativeFile, `canonical must use ${SITE_ORIGIN}: ${canonical}`);
    }
    if (canonicalUrl.search || canonicalUrl.hash) {
      report(relativeFile, `canonical contains query parameters or a fragment: ${canonical}`);
    }
    const previousOwner = canonicalOwners.get(canonical);
    if (previousOwner && previousOwner !== relativeFile) {
      report(relativeFile, `canonical duplicates ${previousOwner}: ${canonical}`);
    }
    canonicalOwners.set(canonical, relativeFile);
  }

  if (indexable && title) {
    const previousOwner = titleOwners.get(title);
    if (previousOwner && previousOwner !== relativeFile) {
      report(relativeFile, `title duplicates ${previousOwner}: ${title}`);
    }
    titleOwners.set(title, relativeFile);
  }

  for (const script of html.matchAll(/<script\b([^>]*)type=["']application\/ld\+json["']([^>]*)>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(script[3].trim());
    } catch (error) {
      report(relativeFile, `invalid JSON-LD: ${error.message}`);
    }
  }

  const references = [
    ...tags(html, 'a').map((tag) => attribute(tag, 'href')),
    ...tags(html, 'script').map((tag) => attribute(tag, 'src')),
    ...tags(html, 'img').map((tag) => attribute(tag, 'src')),
    ...linkTags.map((tag) => attribute(tag, 'href')),
  ].filter(Boolean);

  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(reference)) continue;
    const route = resolveReference(relativeFile, reference);
    if (!route) continue;

    const redirect = redirectMatchers.find(({ matches }) => matches.test(route));
    if (redirect) {
      report(relativeFile, `internal reference uses redirected route ${route} (${redirect.source})`);
    }

    const candidates = routeCandidates(route);
    if (!candidates.some((candidate) => existingFiles.has(candidate))) {
      report(relativeFile, `missing internal reference ${reference}`);
    }
  }
}

const sitemapFile = path.join(root, 'sitemap.xml');
const sitemap = fs.readFileSync(sitemapFile, 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
const uniqueSitemapUrls = new Set(sitemapUrls);

if (uniqueSitemapUrls.size !== sitemapUrls.length) {
  report('sitemap.xml', 'contains duplicate <loc> values');
}

for (const sitemapUrl of sitemapUrls) {
  let url;
  try {
    url = new URL(sitemapUrl);
  } catch {
    report('sitemap.xml', `invalid URL: ${sitemapUrl}`);
    continue;
  }
  if (url.origin !== SITE_ORIGIN) {
    report('sitemap.xml', `URL must use ${SITE_ORIGIN}: ${sitemapUrl}`);
    continue;
  }
  if (redirectMatchers.some(({ matches }) => matches.test(url.pathname))) {
    report('sitemap.xml', `URL redirects instead of resolving canonically: ${sitemapUrl}`);
  }
  const target = routeCandidates(url.pathname).find((candidate) => existingFiles.has(candidate));
  if (!target) {
    report('sitemap.xml', `URL has no matching HTML file: ${sitemapUrl}`);
    continue;
  }
  const html = fs.readFileSync(path.join(root, target), 'utf8');
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    report('sitemap.xml', `URL points to a noindex page: ${sitemapUrl}`);
  }
  const canonicalTags = tags(html, 'link')
    .filter((tag) => (attribute(tag, 'rel') || '').toLowerCase().split(/\s+/).includes('canonical'));
  const canonical = canonicalTags.length === 1 ? attribute(canonicalTags[0], 'href') : null;
  if (canonical !== sitemapUrl) {
    report('sitemap.xml', `canonical mismatch for ${target}: ${canonical || 'missing'} != ${sitemapUrl}`);
  }
}

const robotsFile = path.join(root, 'robots.txt');
const robotsText = fs.readFileSync(robotsFile, 'utf8');
if (!robotsText.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) {
  report('robots.txt', 'does not advertise the canonical sitemap URL');
}

const headersFile = path.join(root, '_headers');
const headersText = fs.readFileSync(headersFile, 'utf8');
for (const assetRoute of ['/assets/css/*', '/assets/js/*']) {
  const escapedRoute = assetRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = headersText.match(
    new RegExp(`^${escapedRoute}\\r?\\n((?:[ \\t]+[^\\r\\n]+(?:\\r?\\n|$))*)`, 'm'),
  )?.[1] || '';
  if (!/^\s*X-Robots-Tag:\s*[^\r\n]*\bnoindex\b/im.test(block)) {
    report('_headers', `${assetRoute} must send X-Robots-Tag: noindex`);
  }
}

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `SEO audit passed: ${htmlFiles.length} HTML files, ${sitemapUrls.length} sitemap URLs, ` +
  `${redirectSources.length} redirect rules, and ${existingFiles.size} repository files checked.`,
);
