(() => {
  "use strict";

  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const MAX_ROWS = 5000;
  const SUPPORTED_EXTENSIONS = new Set(["xlsx", "csv", "xls", "xlsb", "ods"]);
  const ALLOWED_MIME_TYPES = {
    xlsx: new Set(["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"]),
    csv: new Set(["text/csv", "application/csv", "text/plain", "application/vnd.ms-excel", "application/octet-stream"]),
    xls: new Set(["application/vnd.ms-excel", "application/octet-stream"]),
    xlsb: new Set(["application/vnd.ms-excel.sheet.binary.macroenabled.12", "application/octet-stream"]),
    ods: new Set(["application/vnd.oasis.opendocument.spreadsheet", "application/octet-stream"]),
  };
  const FIELD_ALIASES = {
    fullName: ["full name", "name", "lead", "clinic / practice", "clinic", "practice", "business name", "nom", "entreprise"],
    company: ["company", "company name", "clinic / practice", "business", "organisation", "organization"],
    phone: ["phone", "main phone", "telephone", "mobile", "whatsapp", "whatsapp (explicit)"],
    email: ["email", "public business email", "e-mail", "mail"],
    website: ["website", "site", "url", "landing page"],
    city: ["city", "ville"],
    businessSector: ["business sector", "sector", "category", "secteur", "categorie"],
    source: ["source", "lead source"],
    status: ["status", "stage", "statut"],
    priority: ["priority", "priorite"],
    message: ["message", "notes", "context", "contact caveats"],
  };
  let spreadsheetLibraryPromise = null;

  function ensureSpreadsheetLibrary() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (spreadsheetLibraryPromise) return spreadsheetLibraryPromise;
    spreadsheetLibraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/crm/assets/vendor/xlsx.full.min.js";
      script.async = true;
      script.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error("Spreadsheet support did not initialize."));
      script.onerror = () => reject(new Error("Spreadsheet support could not be loaded."));
      document.head.appendChild(script);
    });
    return spreadsheetLibraryPromise;
  }

  function cleanHeader(value) {
    return String(value ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
  }

  function fileExtension(name) {
    return String(name || "").split(".").pop().toLowerCase();
  }

  function validateFile(file) {
    const extension = fileExtension(file?.name);
    if (!file || !SUPPORTED_EXTENSIONS.has(extension)) throw new Error("Use an XLSX, CSV, XLS, XLSB or ODS file.");
    if (file.size > MAX_FILE_BYTES) throw new Error("The file is larger than 5 MB.");
    if (file.type && !ALLOWED_MIME_TYPES[extension]?.has(file.type.toLowerCase())) throw new Error("The file type does not match its extension.");
    return extension;
  }

  function headerScore(row) {
    const values = row.map(cleanHeader);
    return Object.values(FIELD_ALIASES).reduce((score, aliases) => score + (values.some((value) => aliases.includes(value)) ? 1 : 0), 0);
  }

  function detectHeaderRow(rows) {
    let best = { index: 0, score: -1 };
    rows.slice(0, 25).forEach((row, index) => {
      const score = headerScore(row);
      if (score > best.score) best = { index, score };
    });
    return best.index;
  }

  function detectMapping(headers) {
    const normalized = headers.map(cleanHeader);
    const mapping = {};
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      let index = normalized.findIndex((header) => aliases.includes(header));
      if (field === "phone") {
        const explicitWhatsApp = normalized.indexOf("whatsapp (explicit)");
        const mainPhone = normalized.indexOf("main phone");
        index = explicitWhatsApp >= 0 ? explicitWhatsApp : mainPhone >= 0 ? mainPhone : index;
      }
      mapping[field] = index;
    }
    return mapping;
  }

  function sheetHasFormulas(sheet) {
    return Object.keys(sheet).some((key) => key[0] !== "!" && sheet[key]?.f);
  }

  async function readFile(file) {
    const extension = validateFile(file);
    await ensureSpreadsheetLibrary();
    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, { type: "array", cellDates: true, cellFormula: true, dense: false });
    const sheets = workbook.SheetNames.map((name) => {
      const worksheet = workbook.Sheets[name];
      const rows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "", blankrows: true });
      const headerRow = detectHeaderRow(rows);
      const headers = (rows[headerRow] || []).map((value, index) => String(value || `Column ${index + 1}`).trim());
      return { name, rows, headerRow, headers, mapping: detectMapping(headers), hasFormulas: sheetHasFormulas(worksheet) };
    });
    const preferred = sheets.reduce((best, sheet) => headerScore(sheet.headers) > headerScore(best.headers) ? sheet : best, sheets[0]);
    if (!preferred) throw new Error("No readable worksheet was found.");
    return { fileName: file.name, extension, sheets, selectedSheet: preferred.name };
  }

  function cell(row, index) {
    return index >= 0 ? String(row[index] ?? "").trim() : "";
  }

  function priorityValue(value) {
    const normalized = cleanHeader(value);
    if (normalized.startsWith("a") || normalized === "high" || normalized === "haute") return "high";
    if (normalized.startsWith("c") || normalized === "low" || normalized === "faible") return "low";
    return "medium";
  }

  function statusValue(value) {
    const normalized = cleanHeader(value).replace(/\s+/g, "_");
    const map = { new: "new", nouveau: "new", contacted: "contacted", contacte: "contacted", follow_up: "follow_up", appointment: "appointment", rendez_vous: "appointment", no_show: "no_show", won: "won", gagne: "won", not_interested: "not_interested" };
    return map[normalized] || "new";
  }

  function sourceValue(value, fallback) {
    return cleanHeader(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || fallback;
  }

  function lookupRows(sheet, keyHeader) {
    if (!sheet) return new Map();
    const keyIndex = sheet.headers.findIndex((header) => cleanHeader(header) === cleanHeader(keyHeader));
    if (keyIndex < 0) return new Map();
    const map = new Map();
    sheet.rows.slice(sheet.headerRow + 1).forEach((row) => {
      const key = cell(row, keyIndex);
      if (!key) return;
      const item = {};
      sheet.headers.forEach((header, index) => { item[cleanHeader(header)] = cell(row, index); });
      map.set(key, item);
    });
    return map;
  }

  function labelLine(label, value) {
    return value ? `${label}: ${value}` : "";
  }

  function mapRows(parsed, sheetName, mapping, defaults = {}) {
    const sheet = parsed.sheets.find((item) => item.name === sheetName);
    if (!sheet) throw new Error("Choose a worksheet.");
    if (sheet.hasFormulas) throw new Error("The selected worksheet contains formulas. Replace formulas with values before importing.");
    const header = sheet.headers.map(cleanHeader);
    const byHeader = (row, name) => cell(row, header.indexOf(cleanHeader(name)));
    const opportunities = lookupRows(parsed.sheets.find((item) => cleanHeader(item.name) === "opportunities"), "Lead ID");
    const outreach = lookupRows(parsed.sheets.find((item) => cleanHeader(item.name) === "outreach tracker"), "Lead ID");
    const rows = [];
    for (const row of sheet.rows.slice(sheet.headerRow + 1)) {
      if (!row.some((value) => String(value ?? "").trim())) continue;
      const leadId = byHeader(row, "Lead ID");
      const opportunity = opportunities.get(leadId) || {};
      const tracker = outreach.get(leadId) || {};
      const explicitWhatsApp = byHeader(row, "WhatsApp (explicit)");
      const mainPhone = byHeader(row, "Main phone");
      const otherPhone = byHeader(row, "Other public phone");
      const mappedMessage = cell(row, mapping.message);
      const richMessage = [
        labelLine("Research lead ID", leadId),
        labelLine("Category", byHeader(row, "Category")),
        labelLine("Address", byHeader(row, "Casablanca address")),
        labelLine("Main phone", mainPhone),
        labelLine("Other public phone", otherPhone),
        labelLine("Explicit WhatsApp", explicitWhatsApp),
        labelLine("Verification", byHeader(row, "Source verification")),
        labelLine("Contact caveats", byHeader(row, "Contact caveats") || mappedMessage),
        labelLine("Observed public fact", opportunity["observed public fact"]),
        labelLine("Suggested service angle", opportunity["suggested service angle - hypothesis"]),
        labelLine("Discovery question", opportunity["discovery question"]),
        labelLine("Outreach stage", tracker.stage),
        labelLine("Pitch permission", tracker["permission for electronic pitch"]),
        labelLine("Source URL", byHeader(row, "Source URL")),
        labelLine("Additional source URL", byHeader(row, "Additional source URL")),
      ].filter(Boolean).join("\n");
      const priorityRaw = cell(row, mapping.priority);
      rows.push({
        fullName: cell(row, mapping.fullName),
        company: mapping.company >= 0 && mapping.company !== mapping.fullName ? cell(row, mapping.company) : "",
        phone: explicitWhatsApp || cell(row, mapping.phone) || mainPhone,
        email: cell(row, mapping.email),
        website: cell(row, mapping.website),
        city: cell(row, mapping.city) || defaults.city || "Casablanca",
        businessSector: defaults.businessSector || cell(row, mapping.businessSector) || "Santé / Cabinet médical",
        source: sourceValue(cell(row, mapping.source), defaults.source || "casablanca_aesthetic_research"),
        status: statusValue(cell(row, mapping.status) || defaults.status || "new"),
        priority: priorityValue(priorityRaw || defaults.priority || "medium"),
        message: (richMessage || mappedMessage).slice(0, 4000),
      });
      if (rows.length > MAX_ROWS) throw new Error(`The file contains more than ${MAX_ROWS} data rows.`);
    }
    return rows;
  }

  function safeSpreadsheetValue(value) {
    const text = String(value ?? "");
    return /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  }

  const EXPORT_COLUMNS = {
    fullName: "Full name",
    company: "Company",
    phone: "Phone",
    email: "Email",
    businessSector: "Business sector",
    city: "City",
    source: "Source",
    status: "Status",
    priority: "Priority",
    message: "Message",
    nextFollowUpAt: "Next follow-up",
    landingPageUrl: "Website / landing page",
    createdAt: "Created at",
    updatedAt: "Updated at",
  };

  function buildExportWorkbook(leads, columns, csvSafe = false) {
    const selected = columns.filter((column) => EXPORT_COLUMNS[column]);
    const rows = leads.map((lead) => Object.fromEntries(selected.map((column) => [EXPORT_COLUMNS[column], csvSafe ? safeSpreadsheetValue(lead[column]) : String(lead[column] ?? "")] )));
    const worksheet = window.XLSX.utils.json_to_sheet(rows, { header: selected.map((column) => EXPORT_COLUMNS[column]) });
    selected.forEach((_, index) => {
      const cell = worksheet[window.XLSX.utils.encode_cell({ r: 0, c: index })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFFFF" } }, fill: { patternType: "solid", fgColor: { rgb: "FF1D5EFF" } }, alignment: { vertical: "center" } };
    });
    worksheet["!cols"] = selected.map((column) => ({ wch: Math.min(60, Math.max(12, EXPORT_COLUMNS[column].length + 2, ...rows.slice(0, 200).map((row) => String(row[EXPORT_COLUMNS[column]] || "").length + 2))) }));
    if (rows.length) worksheet["!autofilter"] = { ref: window.XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: selected.length - 1 } }) };
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft", state: "frozen" };
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    return workbook;
  }

  function exportLeads(leads, format, columns) {
    const workbook = buildExportWorkbook(leads, columns, format === "csv");
    const date = new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      window.XLSX.writeFile(workbook, `elboubakry-crm-leads-${date}.csv`, { bookType: "csv", FS: ",", RS: "\r\n" });
      return null;
    }
    window.XLSX.writeFile(workbook, `elboubakry-crm-leads-${date}.xlsx`, { compression: true, cellStyles: true });
    return null;
  }

  function downloadErrorReport(rows) {
    const report = rows.filter((row) => row.issues?.length).map((row) => ({
      "Row number": row.index + 1,
      "Lead name": safeSpreadsheetValue(row.fullName),
      Phone: safeSpreadsheetValue(row.phone),
      Email: safeSpreadsheetValue(row.email),
      Website: safeSpreadsheetValue(row.website),
      Error: row.issues.join(", "),
      "Suggested correction": row.issues.includes("invalid_email") ? "Correct or remove the email" : row.issues.includes("invalid_phone") ? "Use a valid Moroccan phone number" : row.issues.includes("missing_name") ? "Add a lead or company name" : "Add a phone, email or website",
    }));
    const sheet = window.XLSX.utils.json_to_sheet(report);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, sheet, "Import errors");
    window.XLSX.writeFile(workbook, `elboubakry-import-errors-${new Date().toISOString().slice(0, 10)}.csv`, { bookType: "csv" });
  }

  window.CrmDataTransfer = { EXPORT_COLUMNS, MAX_ROWS, buildExportWorkbook, detectMapping, downloadErrorReport, ensureSpreadsheetLibrary, mapRows, readFile, exportLeads };
})();
