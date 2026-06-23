/**
 * Namaa Pack CRM — Email + Pack Link only
 * Google Sheet name: Namaa_Pack_Leads_CRM
 * Tabs created by script: Dashboard, Pack Leads
 * Cloudflare secret: NAMAA_PACK_CRM_WEBHOOK_URL
 */
const PACK_TAB = 'Pack Leads';
const DASHBOARD_TAB = 'Dashboard';

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseBody_(e) {
  if (!e) return {};
  const raw = e.postData && e.postData.contents ? e.postData.contents : '';
  if (raw) {
    try { return JSON.parse(raw); } catch (err) {}
  }
  return e.parameter || {};
}

function isEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value || '').trim());
}

function safeUrl_(value) {
  const url = String(value || '').trim();
  if (!/^https?:\/\//i.test(url)) return '';
  return url;
}

function ensureSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let leads = ss.getSheetByName(PACK_TAB);
  if (!leads) leads = ss.insertSheet(PACK_TAB);

  leads.clearFormats();
  if (leads.getLastRow() === 0 || leads.getRange(1, 1).getValue() !== 'Email') {
    leads.clear();
    leads.getRange(1, 1, 1, 2).setValues([['Email', 'Pack Link']]);
  }
  leads.setFrozenRows(1);
  leads.getRange('A1:B1')
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground('#071226')
    .setHorizontalAlignment('center');
  leads.setColumnWidth(1, 280);
  leads.setColumnWidth(2, 170);
  leads.getRange('A:B').setVerticalAlignment('middle');

  let dash = ss.getSheetByName(DASHBOARD_TAB);
  if (!dash) dash = ss.insertSheet(DASHBOARD_TAB, 0);
  dash.clear();
  dash.setHiddenGridlines(true);
  dash.setColumnWidths(1, 4, 190);
  dash.getRange('A1:D1').merge().setValue('Namaa Pack CRM')
    .setFontSize(24).setFontWeight('bold').setFontColor('#ffffff')
    .setBackground('#071226').setHorizontalAlignment('center');
  dash.getRange('A2:D2').merge().setValue('Email + Pack Link only — clean CRM for interested Namaa users')
    .setFontColor('#64748b').setFontWeight('bold').setHorizontalAlignment('center');

  dash.getRange('A4').setValue('Total Leads').setFontWeight('bold');
  dash.getRange('B4').setFormula(`=COUNTA('${PACK_TAB}'!A2:A)`).setFontWeight('bold').setFontSize(18).setFontColor('#155EEF');
  dash.getRange('A5').setValue('Latest Email').setFontWeight('bold');
  dash.getRange('B5:D5').merge().setFormula(`=IFERROR(LOOKUP(2,1/('${PACK_TAB}'!A:A<>""),'${PACK_TAB}'!A:A),"")`);
  dash.getRange('A6').setValue('Latest Pack').setFontWeight('bold');
  dash.getRange('B6:D6').merge().setFormula(`=IFERROR(LOOKUP(2,1/('${PACK_TAB}'!B:B<>""),'${PACK_TAB}'!B:B),"")`);
  dash.getRange('A4:D6')
    .setBackground('#ffffff')
    .setBorder(true, true, true, true, true, true, '#E6EBF2', SpreadsheetApp.BorderStyle.SOLID);

  dash.getRange('A9:D9').merge().setValue('Recent Pack Leads')
    .setFontWeight('bold').setFontSize(15).setFontColor('#071226');
  dash.getRange('A10:D20').merge().setValue('Open the "Pack Leads" tab to see only the clean list: Email + Pack Link.')
    .setFontColor('#64748b').setVerticalAlignment('top');
  dash.getRange('A1:D20').setFontFamily('Arial');

  return { ss, leads, dash };
}

function doGet() {
  ensureSheets_();
  return json_({ ok: true, service: 'Namaa Pack CRM', fields: ['Email', 'Pack Link'] });
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    const email = String(body.email || '').trim().toLowerCase();
    const packLink = safeUrl_(body.pack_link || body.packLink || body.pack_url || body.packUrl);

    if (!isEmail_(email)) return json_({ ok: false, error: 'Invalid email' });
    if (!packLink) return json_({ ok: false, error: 'Missing pack link' });

    const { leads } = ensureSheets_();
    const row = leads.getLastRow() + 1;
    leads.getRange(row, 1).setValue(email);
    leads.getRange(row, 2).setFormula(`=HYPERLINK("${packLink.replace(/"/g, '""')}", "Open Pack")`);
    leads.getRange(row, 1, 1, 2).setBorder(true, true, true, true, true, true, '#E6EBF2', SpreadsheetApp.BorderStyle.SOLID);
    leads.getRange(row, 1, 1, 2).setVerticalAlignment('middle');

    return json_({ ok: true, message: 'Email and pack link saved' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}
