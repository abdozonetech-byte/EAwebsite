// Optional isolated PostgreSQL check. Pass a PGlite module path as argv[2].
// Install PGlite in a temporary directory; no production credentials are used.
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
if (!process.argv[2]) throw new Error('Pass the absolute path to @electric-sql/pglite/dist/index.js');
const {PGlite}=await import(pathToFileURL(process.argv[2]));
const db=new PGlite();
try {
  await db.exec('create role anon; create role authenticated; create role service_role;');
  for(const name of ['001_crm_schema.sql','002_lead_intelligence.sql','003_chatgpt_mcp_lead_intelligence.sql']) {
    const sql=(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8')).replace('create extension if not exists pgcrypto;','');
    await db.exec(sql);
  }
  await db.exec("insert into public.leads (full_name,city) values ('Existing lead','Casablanca');");
  const columns=await db.query("select column_name from information_schema.columns where table_schema='public' and table_name='lead_intelligence_overview' order by ordinal_position");
  const migration=await readFile(new URL('../supabase/migrations/008_discovery_location.sql',import.meta.url),'utf8');
  await db.exec(migration); await db.exec(migration);
  const after=await db.query("select column_name from information_schema.columns where table_schema='public' and table_name='lead_intelligence_overview' order by ordinal_position");
  assert.deepEqual(after.rows.slice(0,-1),columns.rows);
  assert.equal(after.rows.at(-1).column_name,'country');
  const rows=await db.query('select full_name,city,country from public.lead_intelligence_overview');
  assert.equal(rows.rows.length,1); assert.equal(rows.rows[0].country,null);
  await db.exec("update public.leads set country='MA';");
  assert.equal((await db.query('select country from public.lead_intelligence_overview')).rows[0].country,'MA');
  await assert.rejects(db.exec("update public.leads set country='invalid';"));
  assert.equal((await db.query("select grantee from information_schema.role_table_grants where table_name='lead_intelligence_overview' and grantee in ('anon','authenticated')")).rows.length,0);
  assert((await db.query("select reloptions from pg_class where oid='public.lead_intelligence_overview'::regclass")).rows[0].reloptions.includes('security_invoker=true'));
  console.log('Location migration passed on isolated PostgreSQL: repeatable; view column order, existing lead, private grants and invoker security preserved.');
} finally {await db.close();}
