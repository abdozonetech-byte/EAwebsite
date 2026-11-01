// Read-only public HTTP audit. Never calls CRM endpoints or changes Google data.
import { readFile, writeFile } from 'node:fs/promises';
const fixture = JSON.parse(await readFile(new URL('./fixtures/search-console-2026-11-01.json', import.meta.url), 'utf8'));
const groups = ['missing', 'redirect', 'noindex', 'crawled', 'discovered'];
const retired = new Set(fixture.missing.filter(path => path.startsWith('/assets/') && !/mockup-carousel|ajax-form/.test(path)).map(path => new URL(path, fixture.base).pathname).concat('/cdn-cgi/l/email-protection'));
const jobs = groups.flatMap(group => fixture[group].map(path => ({ group, url: new URL(path, fixture.base).href })));
const results = [];
function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
}
async function check(job) {
  const chain = [];
  let current = job.url;
  for (let hop = 0; hop < 8; hop++) {
    const response = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(25000) });
    const location = response.headers.get('location');
    chain.push({ url: current, status: response.status, ...(location ? { location } : {}) });
    if (response.status >= 300 && response.status < 400 && location) {
      await response.body?.cancel();
      const next = new URL(location, current);
      if (!['elboubakry.com', 'www.elboubakry.com'].includes(next.hostname)) throw new Error('Unexpected external redirect');
      current = next.href;
      continue;
    }
    const type = response.headers.get('content-type') || '';
    const body = await response.text();
    const canonical = type.includes('text/html') ? [...body.matchAll(/<link\b[^>]*>/ig)].map(x => x[0]).filter(x => attribute(x, 'rel') === 'canonical').map(x => attribute(x, 'href'))[0] : undefined;
    const robots = type.includes('text/html') ? [...body.matchAll(/<meta\b[^>]*>/ig)].map(x => x[0]).filter(x => attribute(x, 'name') === 'robots').map(x => attribute(x, 'content')).join(', ') : '';
    return { ...job, chain, final: current, status: response.status, type, canonical, robots, xRobots: response.headers.get('x-robots-tag'), title: type.includes('text/html') ? body.match(/<title>([^<]+)/i)?.[1] : undefined };
  }
  throw new Error('Too many redirects');
}
await Promise.all(Array.from({ length: 4 }, async () => {
  while (jobs.length) {
    const job = jobs.shift();
    try { results.push(await check(job)); }
    catch (error) { results.push({ ...job, error: error.message }); }
  }
}));
results.sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group) || a.url.localeCompare(b.url));
const output = process.argv[2];
for (const row of results) {
  const sourcePath = new URL(row.url).pathname;
  row.problems = [];
  if (row.error) row.problems.push(row.error);
  else if (row.status === 404 && retired.has(sourcePath)) row.classification = 'retired unreferenced resource; keep 404';
  else if (row.status !== 200) row.problems.push(`Unexpected HTTP ${row.status}`);
  else if (row.group === 'noindex') {
    row.classification = 'intentional legal/thank-you exclusion';
    if (!/\bnoindex\b/i.test(`${row.robots} ${row.xRobots}`)) row.problems.push('Expected noindex missing');
  } else if (row.type?.includes('text/html')) {
    row.classification = row.chain.length > 1 ? 'working canonical redirect' : 'working indexable page';
    if (row.canonical !== row.final) row.problems.push('Missing or inconsistent canonical');
    if (/\bnoindex\b/i.test(`${row.robots} ${row.xRobots}`)) row.problems.push('Public page blocked by noindex');
  } else {
    row.classification = 'working resource, intentionally not a search page';
    if (!/javascript|css/.test(row.type)) row.problems.push('Unexpected resource content type');
  }
}
if (output && !output.startsWith('--')) await writeFile(output, JSON.stringify({ checked_at: new Date().toISOString(), report_updated: fixture.report_updated, results }, null, 2) + '\n');
for (const group of groups) {
  const rows = results.filter(x => x.group === group);
  console.log(group, rows.length, JSON.stringify(rows.reduce((counts, row) => ({ ...counts, [row.error || row.status]: (counts[row.error || row.status] || 0) + 1 }), {})));
}
if (process.argv.includes('--verbose')) for (const row of results) console.log(JSON.stringify(row));
const failures = results.filter(x => x.problems.length);
for (const row of failures) console.error(JSON.stringify(row));
console.log(`Current URL errors: ${failures.length}. Historical Search Console categories are not live error counts.`);
if (failures.length) process.exitCode = 1;
