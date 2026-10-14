import { requireCrmApi } from "../../../_lib/crm-api.js";
import { json, readJsonBody } from "../../../_lib/http.js";
import { MAX_IMPORT_ROWS, analyzeImportRows, toLeadInsert, toLeadUpdate } from "../../../_lib/lead-import.js";
import { supabaseErrorResponse, supabaseFetch, supabaseFetchAll } from "../../../_lib/supabase.js";

const DUPLICATE_ACTIONS = new Set(["skip", "update", "import_anyway"]);

function publicRow(row) {
  return {
    index: row.index,
    fullName: row.fullName,
    company: row.company,
    phone: row.phone,
    email: row.email,
    website: row.website,
    city: row.city,
    businessSector: row.businessSector,
    source: row.source,
    status: row.status,
    priority: row.priority,
    issues: row.issues,
    duplicate: row.duplicate,
    disposition: row.disposition,
  };
}

function summary(rows, duplicateAction = "skip") {
  const invalid = rows.filter((row) => row.disposition === "invalid").length;
  const duplicates = rows.filter((row) => row.disposition === "duplicate").length;
  const ready = rows.filter((row) => row.disposition === "ready").length;
  const importable = ready + (duplicateAction === "import_anyway" ? duplicates : 0);
  const updates = duplicateAction === "update" ? rows.filter((row) => row.disposition === "duplicate" && row.duplicate?.scope === "crm").length : 0;
  const fileDuplicates = rows.filter((row) => row.disposition === "duplicate" && row.duplicate?.scope === "file").length;
  return { total: rows.length, ready, duplicates, invalid, importable, updates, skipped: invalid + (duplicateAction === "skip" ? duplicates : 0) + (duplicateAction === "update" ? fileDuplicates : 0) };
}

async function insertBatches(env, rows) {
  let inserted = 0;
  for (let index = 0; index < rows.length; index += 100) {
    const batch = rows.slice(index, index + 100).map(toLeadInsert);
    if (!batch.length) continue;
    const result = await supabaseFetch(env, "leads", { method: "POST", body: batch });
    inserted += Array.isArray(result) ? result.length : batch.length;
  }
  return inserted;
}

async function updateDuplicates(env, rows) {
  let updated = 0;
  for (let index = 0; index < rows.length; index += 20) {
    const batch = rows.slice(index, index + 20);
    const results = await Promise.all(batch.map((row) => supabaseFetch(env, "leads", {
      method: "PATCH",
      search: { id: `eq.${row.duplicate.id}` },
      body: toLeadUpdate(row),
    })));
    updated += results.filter((result) => Array.isArray(result) && result.length).length;
  }
  return updated;
}

export async function onRequest(context) {
  const guard = await requireCrmApi(context, ["POST"]);
  if (guard) return guard;
  try {
    const parsed = await readJsonBody(context.request, 3_000_000);
    if (!parsed.ok) return json({ ok: false, message: parsed.message }, parsed.status);
    const mode = parsed.body?.mode === "commit" ? "commit" : "preview";
    const duplicateAction = DUPLICATE_ACTIONS.has(parsed.body?.duplicateAction) ? parsed.body.duplicateAction : "skip";
    const rows = Array.isArray(parsed.body?.rows) ? parsed.body.rows : [];
    if (!rows.length || rows.length > MAX_IMPORT_ROWS) return json({ ok: false, message: `Import must contain 1-${MAX_IMPORT_ROWS} rows.` }, 400);

    const existing = await supabaseFetchAll(context.env, "leads", {
      search: { select: "id,full_name,company_name,phone,email,city,landing_page_url,status,priority,source,business_sector,message", order: "created_at.desc" },
    }, 1000, 20000);
    const analyzed = analyzeImportRows(rows, existing);
    const importSummary = summary(analyzed, duplicateAction);
    const confirmation = `IMPORT_${importSummary.importable}_${importSummary.updates}_${duplicateAction.toUpperCase()}`;

    if (mode === "preview") {
      return json({ ok: true, rows: analyzed.slice(0, 250).map(publicRow), summary: importSummary, confirmation });
    }
    if (parsed.body?.confirmation !== confirmation) return json({ ok: false, message: "Import confirmation is stale. Preview the file again." }, 409);
    const ready = analyzed.filter((row) => row.disposition === "ready");
    const crmDuplicates = analyzed.filter((row) => row.disposition === "duplicate" && row.duplicate?.scope === "crm");
    const fileDuplicates = analyzed.filter((row) => row.disposition === "duplicate" && row.duplicate?.scope === "file");
    let insertRows = ready;
    let updated = 0;
    if (duplicateAction === "import_anyway") insertRows = analyzed.filter((row) => row.disposition !== "invalid");
    if (duplicateAction === "update") updated = await updateDuplicates(context.env, crmDuplicates);
    const inserted = await insertBatches(context.env, insertRows);
    const skipped = importSummary.invalid + (duplicateAction === "skip" ? importSummary.duplicates : 0) + (duplicateAction === "update" ? fileDuplicates.length : 0);
    return json({ ok: true, result: { inserted, updated, skipped, total: analyzed.length } }, 201);
  } catch (error) {
    return supabaseErrorResponse(error);
  }
}
