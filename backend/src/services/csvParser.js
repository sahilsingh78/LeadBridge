const { parse } = require('csv-parse/sync');

/**
 * Parses a raw CSV buffer/string into structured rows.
 * We deliberately do NOT assume fixed column names — we return whatever
 * headers actually exist in the file, in their original casing, and let
 * the AI layer figure out the semantic mapping. This mirrors the real
 * problem: Facebook exports, Google Ads exports, and hand-made sheets all
 * use different column names for the same underlying concept.
 */
function parseCsv(csvContent) {
  let records;
  try {
    records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // tolerate ragged rows instead of throwing
      bom: true,
    });
  } catch (err) {
    const error = new Error(`Failed to parse CSV: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }

  if (!records.length) {
    const error = new Error('CSV file contains no data rows.');
    error.statusCode = 400;
    throw error;
  }

  const headers = Object.keys(records[0]);

  // Drop rows that are entirely empty (all values blank) — common in
  // manually-created spreadsheets with trailing blank lines.
  const rows = records.filter((row) =>
    Object.values(row).some((v) => v !== null && v !== undefined && String(v).trim() !== '')
  );

  return { headers, rows };
}

module.exports = { parseCsv };
