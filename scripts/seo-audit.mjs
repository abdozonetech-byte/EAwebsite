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
const seenRedirectSources = new Set();

for (const { source, target, status } of redirectRules) {
  if (!source?.startsWith('/')) {
    report('_redirects', `redirect source must start with /: ${source || '(missing)'}`);
  }
  if (!target?.startsWith('/')) {
    report('_redirects', `${source} must redirect to a local absolute path`);
  }
  if (status !== '301') {
    report('_redirects', `${source} must use permanent status 301, found ${status || '(missing)'}`);
  }
  if (seenRedirectSources.has(source)) {
    report('_redirects', `duplicate redirect source: ${source}`);
  }
  seenRedirectSources.add(source);
  const directTargetPath = target?.split('#')[0].split('?')[0];
  if (directTargetPath === source) {
    report('_redirects', `self-redirect detected: ${source}`);
  }
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
const indexableCanonicalOwners = new Map();
const titleOwners = new Map();
let structuredDataUrlsChecked = 0;
const expectedNoindexFiles = new Set([
  '404.html',
  'crm/index.html',
  'crm/login/index.html',
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
  const openGraphUrls = metaTags
    .filter((tag) => attribute(tag, 'property')?.toLowerCase() === 'og:url')
    .map((tag) => attribute(tag, 'content'))
    .filter(Boolean);
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  if (expectedNoindexFiles.has(relativeFile) && indexable) {
    report(relativeFile, 'private or utility page must remain noindex');
  }

  if (indexable) {
    if (!title) report(relativeFile, 'indexable page has no <title>');
    if (description.length !== 1) report(relativeFile, `expected 1 meta description, found ${description.length}`);
    if (canonicals.length !== 1) report(relativeFile, `expected 1 canonical, found ${canonicals.length}`);
    if (openGraphUrls.length !== 1) report(relativeFile, `expected 1 og:url, found ${openGraphUrls.length}`);
    if (canonicals.length === 1 && openGraphUrls.length === 1 && openGraphUrls[0] !== canonicals[0]) {
      report(relativeFile, `og:url does not match canonical: ${openGraphUrls[0]} != ${canonicals[0]}`);
    }
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
    if (indexable && canonicalUrl.origin === SITE_ORIGIN && !canonicalUrl.search && !canonicalUrl.hash) {
      indexableCanonicalOwners.set(canonical, relativeFile);
    }
  }

  if (indexable && title) {
    const previousOwner = titleOwners.get(title);
    if (previousOwner && previousOwner !== relativeFile) {
      report(relativeFile, `title duplicates ${previousOwner}: ${title}`);
    }
    titleOwners.set(title, relativeFile);
  }

  for (const script of html.matchAll(/<script\b([^>]*)type=["']application\/ld\+json["']([^>]*)>([\s\S]*?)<\/script>/gi)) {
    let structuredData;
    try {
      structuredData = JSON.parse(script[3].trim());
    } catch (error) {
      report(relativeFile, `invalid JSON-LD: ${error.message}`);
      continue;
    }
    const values = [structuredData];
    while (values.length) {
      const value = values.pop();
      if (Array.isArray(value)) {
        values.push(...value);
      } else if (value && typeof value === 'object') {
        values.push(...Object.values(value));
      } else if (typeof value === 'string' && value.startsWith(`${SITE_ORIGIN}/`)) {
        structuredDataUrlsChecked += 1;
        const structuredUrl = new URL(value);
        if (redirectMatchers.some(({ matches }) => matches.test(structuredUrl.pathname))) {
          report(relativeFile, `JSON-LD URL redirects instead of resolving canonically: ${value}`);
        }
        if (!routeCandidates(structuredUrl.pathname).some((candidate) => existingFiles.has(candidate))) {
          report(relativeFile, `JSON-LD URL points to a missing local target: ${value}`);
        }
      }
    }
  }

  const references = [
    ...tags(html, 'a').map((tag) => attribute(tag, 'href')),
    ...tags(html, 'script').map((tag) => attribute(tag, 'src')),
    ...tags(html, 'img').map((tag) => attribute(tag, 'src')),
    ...linkTags.map((tag) => attribute(tag, 'href')),
  ].filter(Boolean);

  for (const reference of references) {
    if (/^(?:mailto:|tel:|data:|javascript:|#)/i.test(reference)) continue;
    if (relativeFile === '404.html' && !reference.startsWith('/')) {
      report(relativeFile, `404 page reference must be root-relative: ${reference}`);
    }
    let route;
    if (/^https?:/i.test(reference)) {
      let absoluteUrl;
      try {
        absoluteUrl = new URL(reference);
      } catch {
        report(relativeFile, `invalid absolute URL: ${reference}`);
        continue;
      }
      if (absoluteUrl.origin !== SITE_ORIGIN) continue;
      route = absoluteUrl.pathname;
    } else {
      route = resolveReference(relativeFile, reference);
    }
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
const sitemapLastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)]
  .map((match) => match[1].trim());
const uniqueSitemapUrls = new Set(sitemapUrls);

if (uniqueSitemapUrls.size !== sitemapUrls.length) {
  report('sitemap.xml', 'contains duplicate <loc> values');
}
if (sitemapLastmods.length !== sitemapUrls.length) {
  report('sitemap.xml', `expected one <lastmod> per URL, found ${sitemapLastmods.length} for ${sitemapUrls.length} URLs`);
}
const today = new Date().toISOString().slice(0, 10);
for (const lastmod of sitemapLastmods) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod) || Number.isNaN(Date.parse(`${lastmod}T00:00:00Z`))) {
    report('sitemap.xml', `invalid <lastmod> date: ${lastmod}`);
  } else if (lastmod > today) {
    report('sitemap.xml', `<lastmod> date is in the future: ${lastmod}`);
  }
}

for (const [canonical, owner] of indexableCanonicalOwners) {
  if (!uniqueSitemapUrls.has(canonical)) {
    report('sitemap.xml', `missing indexable canonical from ${owner}: ${canonical}`);
  }
}

const insightsCatalogFile = 'assets/data/insights-articles.js';
const insightsCatalog = fs.readFileSync(path.join(root, insightsCatalogFile), 'utf8');
const insightsSlugs = [...insightsCatalog.matchAll(/"slug"\s*:\s*"([^"]+)"/g)]
  .map((match) => match[1]);
if (new Set(insightsSlugs).size !== insightsSlugs.length) {
  report(insightsCatalogFile, 'contains duplicate article slugs');
}
for (const slug of insightsSlugs) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    report(insightsCatalogFile, `invalid article slug: ${slug}`);
    continue;
  }
  const route = `/insights/${slug}`;
  const canonical = `${SITE_ORIGIN}${route}`;
  if (!routeCandidates(route).some((candidate) => existingFiles.has(candidate))) {
    report(insightsCatalogFile, `article slug has no matching page: ${slug}`);
  }
  if (redirectMatchers.some(({ matches }) => matches.test(route))) {
    report(insightsCatalogFile, `article slug points to a redirect: ${route}`);
  }
  if (!uniqueSitemapUrls.has(canonical)) {
    report(insightsCatalogFile, `article slug is missing from sitemap.xml: ${canonical}`);
  }
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
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    const noSlashPath = url.pathname.slice(0, -1);
    const canonicalRedirect = redirectRules.find(({ source }) => source === noSlashPath);
    const redirectPath = canonicalRedirect?.target?.split('#')[0].split('?')[0];
    if (redirectPath !== url.pathname) {
      report('_redirects', `${noSlashPath} must redirect directly to ${url.pathname}`);
    }
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
  const targetRobotsTag = tags(html, 'meta')
    .find((tag) => attribute(tag, 'name')?.toLowerCase() === 'robots');
  const targetRobotsContent = targetRobotsTag ? attribute(targetRobotsTag, 'content') || '' : '';
  if (/\bnoindex\b/i.test(targetRobotsContent)) {
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
const noindexHeaderRoutes = [
  '/assets/css/*',
  '/assets/js/*',
  '/crm/*',
  '/merci/',
  '/mentions-legales',
  '/politique-confidentialite',
  '/politique-cookies',
];
for (const route of noindexHeaderRoutes) {
  const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = headersText.match(
    new RegExp(`^${escapedRoute}\\r?\\n((?:[ \\t]+[^\\r\\n]+(?:\\r?\\n|$))*)`, 'm'),
  )?.[1] || '';
  if (!/^\s*X-Robots-Tag:\s*[^\r\n]*\bnoindex\b/im.test(block)) {
    report('_headers', `${route} must send X-Robots-Tag: noindex`);
  }
}

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `SEO audit passed: ${htmlFiles.length} HTML files, ${sitemapUrls.length} sitemap URLs, ` +
  `${insightsSlugs.length} dynamic article links, ${structuredDataUrlsChecked} structured-data URLs, ` +
  `${redirectSources.length} redirect rules, ` +
  `and ${existingFiles.size} repository files checked.`,
);
