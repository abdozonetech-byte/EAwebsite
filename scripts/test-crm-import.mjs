import assert from "node:assert/strict";
import { File } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import vm from "node:vm";
import {
  analyzeImportRows,
  normalizeImportEmail,
  normalizeImportPhone,
  normalizeImportUrl,
  toLeadUpdate,
} from "../functions/_lib/lead-import.js";

const context = { Blob, File, URL, TextDecoder, TextEncoder, Uint8Array, ArrayBuffer, Date, console, setTimeout, clearTimeout };
context.window = context;
context.self = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(readFileSync(new URL("../crm/assets/vendor/xlsx.full.min.js", import.meta.url), "utf8"), context);
vm.runInContext(readFileSync(new URL("../crm/assets/crm-data-transfer.js", import.meta.url), "utf8"), context);

assert.equal(normalizeImportPhone("06 61 64 50 04"), "212661645004");
assert.equal(normalizeImportPhone("+212661645004"), "212661645004");
assert.equal(normalizeImportPhone("0522981018"), "212522981018");
assert.equal(normalizeImportEmail(" TEST@Example.COM "), "test@example.com");
assert.equal(normalizeImportUrl("casaaesthetic.com"), "https://casaaesthetic.com/");

const duplicatePhone = analyzeImportRows(
  [{ fullName: "New Clinic", phone: "+212661645004", city: "Casablanca" }],
  [{ id: "existing-1", full_name: "Existing Clinic", phone: "06 61 64 50 04", city: "Casablanca" }],
);
assert.equal(duplicatePhone[0].disposition, "duplicate");
assert.equal(duplicatePhone[0].duplicate.matchedBy, "phone");

const duplicateEmail = analyzeImportRows(
  [{ fullName: "New Clinic", email: "INFO@CLINIC.MA", city: "Casablanca" }],
  [{ id: "existing-2", full_name: "Other Clinic", email: "info@clinic.ma", city: "Rabat" }],
);
assert.equal(duplicateEmail[0].duplicate.matchedBy, "email");

const missingOptional = analyzeImportRows([{ fullName: "عيادة الدار البيضاء", website: "example.ma", city: "Casablanca" }]);
assert.equal(missingOptional[0].disposition, "ready");
assert.equal(missingOptional[0].fullName, "عيادة الدار البيضاء");

const invalid = analyzeImportRows([{ fullName: "Clinic", phone: "123", email: "not-an-email" }]);
assert.deepEqual(invalid[0].issues.sort(), ["invalid_email", "invalid_phone"]);
const safeUpdate = toLeadUpdate(analyzeImportRows([{ fullName: "Clinic", phone: "0661645004", status: "new", priority: "high", source: "spreadsheet_import" }])[0]);
assert.equal("status" in safeUpdate, false);
assert.equal("priority" in safeUpdate, false);
assert.equal("source" in safeUpdate, false);

const workbookPath = process.env.CRM_IMPORT_WORKBOOK || "/mnt/chromeos/MyFiles/Downloads/Casablanca_Aesthetic_Prospects_2026-10-13.xlsx";
let workbookVerified = false;
if (existsSync(workbookPath)) {
  const xlsxBuffer = readFileSync(workbookPath);
  const xlsxFile = new File([xlsxBuffer], "Casablanca_Aesthetic_Prospects_2026-10-13.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const parsed = await context.CrmDataTransfer.readFile(xlsxFile);
  assert.equal(parsed.selectedSheet, "Leads");
  const sheet = parsed.sheets.find((item) => item.name === "Leads");
  const mapped = context.CrmDataTransfer.mapRows(parsed, "Leads", sheet.mapping, {
    city: "Casablanca",
    businessSector: "Santé / Cabinet médical",
    source: "casablanca_aesthetic_research",
    status: "new",
  });
  assert.equal(mapped.length, 20);
  assert.equal(mapped.filter((row) => row.priority === "high").length, 10);
  assert.equal(mapped.filter((row) => row.priority === "medium").length, 7);
  assert.equal(mapped.filter((row) => row.priority === "low").length, 3);
  const casablancaAnalysis = analyzeImportRows(mapped);
  assert.equal(casablancaAnalysis.filter((row) => row.disposition === "ready").length, 20);
  workbookVerified = true;
}

const csvFile = new File(["Name,Phone,Email\nClinic A,06 61 64 50 04,TEST@example.ma\n"], "leads.csv", { type: "text/csv" });
const parsedCsv = await context.CrmDataTransfer.readFile(csvFile);
const csvSheet = parsedCsv.sheets[0];
const csvRows = context.CrmDataTransfer.mapRows(parsedCsv, csvSheet.name, csvSheet.mapping, { source: "spreadsheet_import", status: "new" });
assert.equal(csvRows.length, 1);
assert.equal(analyzeImportRows(csvRows)[0].disposition, "ready");

const formulaSheet = context.XLSX.utils.aoa_to_sheet([["Name", "Phone"], ["Formula Clinic", ""]]);
formulaSheet.B2 = { t: "n", f: "1+1", v: 2 };
const formulaBook = context.XLSX.utils.book_new();
context.XLSX.utils.book_append_sheet(formulaBook, formulaSheet, "Leads");
const formulaBytes = context.XLSX.write(formulaBook, { type: "array", bookType: "xlsx" });
const formulaParsed = await context.CrmDataTransfer.readFile(new File([formulaBytes], "formula.xlsx"));
assert.throws(() => context.CrmDataTransfer.mapRows(formulaParsed, "Leads", formulaParsed.sheets[0].mapping), /contains formulas/);

const exported = context.CrmDataTransfer.buildExportWorkbook([{
  fullName: "Clinique Élite",
  phone: "+212661645004",
  email: "contact@example.ma",
  message: "=HYPERLINK(\"https://malicious.example\")",
}], ["fullName", "phone", "email", "message"]);
const exportedBytes = context.XLSX.write(exported, { type: "array", bookType: "xlsx", cellStyles: true });
const reopened = context.XLSX.read(exportedBytes, { type: "array", cellStyles: true });
const exportedRows = context.XLSX.utils.sheet_to_json(reopened.Sheets.Leads, { defval: "" });
assert.equal(exportedRows[0].Phone, "+212661645004");
assert.equal(exportedRows[0].Message.startsWith("="), true);
const csvSafeExport = context.CrmDataTransfer.buildExportWorkbook([{ fullName: "=CMD", phone: "+212661645004" }], ["fullName", "phone"], true);
const csvSafeRows = context.XLSX.utils.sheet_to_json(csvSafeExport.Sheets.Leads);
assert.equal(csvSafeRows[0]["Full name"].startsWith("'="), true);
assert.equal(csvSafeRows[0].Phone.startsWith("'+"), true);

const largeRows = Array.from({ length: 5000 }, (_, index) => ({ fullName: `Clinic ${index}`, email: `clinic${index}@example.ma`, city: "Casablanca" }));
const started = performance.now();
assert.equal(analyzeImportRows(largeRows).length, 5000);
assert.ok(performance.now() - started < 5000);

console.log(`CRM import tests passed: normalization, duplicates, Unicode, CSV, export and 5,000-row analysis.${workbookVerified ? " Casablanca workbook verified (20 rows)." : " Casablanca workbook unavailable; workbook-specific check skipped."}`);
