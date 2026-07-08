const { CRM_STATUS_VALUES, DATA_SOURCE_VALUES, CRM_FIELDS } = require('../config/crmSchema');

function buildBatchPrompt(rows) {
  const indexedRows = rows.map((row, i) => ({ source_row_index: i, ...row }));

  return `You are a data-extraction engine for GrowEasy, a real-estate CRM. You will receive a batch of raw CSV rows exported from arbitrary sources — Facebook Lead Ads, Google Ads, Excel sheets, other CRMs, marketing agency sheets, or manually typed spreadsheets. Each row's column names and layout can differ completely from the next file you see. Your job is to intelligently map whatever columns exist onto the fixed GrowEasy CRM schema below.

## Target CRM fields
${CRM_FIELDS.map((f) => `- ${f}`).join('\n')}

## Field mapping guidance
- "name" may appear as full_name, Lead Name, Contact Name, First+Last combined, etc. Combine first/last name fields if they are separate.
- "email" may appear as Email, email_address, Contact Email, E-mail, primary_email, etc.
- "mobile_without_country_code" may appear as Phone, Mobile, Contact Number, WhatsApp Number, phone_number, etc. Strip any country code, spaces, dashes, or parentheses — keep digits only.
- "country_code" should be the dialing code only (e.g. "+91"), inferred from the phone format or an explicit country/region column if present. Default to "+91" only if there is strong contextual evidence (e.g. all other rows in the batch are Indian numbers); otherwise leave blank rather than guessing.
- "created_at" may appear as Date, Submitted At, Lead Date, Timestamp, created, etc. Normalize to a format parseable by JavaScript's \`new Date(...)\`, e.g. "2026-05-13 14:20:48" or an ISO 8601 string. If only a date (no time) is available, that is fine.
- "possession_time" refers to real-estate property possession/handover timelines (e.g. "Ready to Move", "Dec 2026") — only populate if such information is genuinely present; do not confuse with created_at.
- "description" is free-text context about the lead's interest or query, distinct from crm_note (see below).

## Enum constraints (STRICT — do not invent values)
- "crm_status" must be exactly one of: ${CRM_STATUS_VALUES.join(', ')}. Infer from any status/stage/quality column using its meaning (e.g. "Interested"/"Hot Lead" → GOOD_LEAD_FOLLOW_UP, "Not reachable"/"No answer" → DID_NOT_CONNECT, "Not interested"/"Junk" → BAD_LEAD, "Closed Won"/"Converted" → SALE_DONE). If there is no confident match, use "UNKNOWN" — never fabricate a status.
- "data_source" must be exactly one of: ${DATA_SOURCE_VALUES.join(', ')}. Only set this if the row gives clear evidence of which source it belongs to (e.g. a campaign/project name column literally matching one of these, such as "Meridian Tower" or "Eden Park"). Otherwise use "UNKNOWN" — do not guess based on unrelated columns.

## crm_note rules
Append to crm_note (do not overwrite, concatenate with "; " if multiple items apply):
- Any remarks/notes/comments column content.
- Any additional email addresses beyond the first one found for that row.
- Any additional phone numbers beyond the first one found for that row.
- Any other column content that carries useful information but doesn't map to any other CRM field.

## Multiple contact values
If a row has more than one email address, use the first as "email" and append the rest to crm_note. If a row has more than one phone number, use the first as "mobile_without_country_code" and append the rest (with their own country code if visible) to crm_note.

## Skip rule (STRICT)
If a row has neither a usable email NOR a usable mobile number, it must be placed in the "skipped" array with a short reason (e.g. "no email or mobile number present"), NOT in "imported". Do not skip rows for any other reason — missing name, company, or other optional fields is not a reason to skip.

## Output format
Return JSON matching the provided schema exactly:
- "imported": array of extracted CRM records, each including its original "source_row_index".
- "skipped": array of { source_row_index, reason } for rows that failed the skip rule.
Every input row's source_row_index must appear in exactly one of the two arrays. Use "" (empty string) for any field you cannot confidently determine — never use placeholder text like "N/A" or "unknown" — except crm_status and data_source specifically, which use the literal string "UNKNOWN" when no confident match exists (per the enum constraints above).

## Input rows (batch of ${rows.length})
${JSON.stringify(indexedRows, null, 2)}`;
}

module.exports = { buildBatchPrompt };