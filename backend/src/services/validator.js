const { CRM_STATUS_VALUES, DATA_SOURCE_VALUES, CRM_FIELDS } = require('../config/crmSchema');

function sanitizeRecord(raw) {
  const record = {};

  for (const field of CRM_FIELDS) {
    const value = raw[field];
    record[field] = typeof value === 'string' ? value.trim() : '';
  }

  // Enum safety net — silently blank out anything the model invented
  // outside the allowed set rather than letting bad data reach the CRM.
  if (record.crm_status && !CRM_STATUS_VALUES.includes(record.crm_status)) {
    record.crm_status = '';
  }
  if (record.data_source && !DATA_SOURCE_VALUES.includes(record.data_source)) {
    record.data_source = '';
  }

  // Date safety net
  if (record.created_at) {
    const parsed = new Date(record.created_at);
    if (Number.isNaN(parsed.getTime())) {
      record.created_at = '';
    }
  }

  // Basic email sanity check — if it doesn't look like an email at all,
  // treat it as absent rather than trusting the model's label.
  const emailLooksValid = /\S+@\S+\.\S+/.test(record.email);
  if (record.email && !emailLooksValid) {
    record.email = '';
  }

  // Mobile: keep digits only, defensively, even though the prompt already
  // asks the model to strip formatting.
  if (record.mobile_without_country_code) {
    record.mobile_without_country_code = record.mobile_without_country_code.replace(/\D/g, '');
  }

  const hasEmail = Boolean(record.email);
  const hasMobile = Boolean(record.mobile_without_country_code);

  if (!hasEmail && !hasMobile) {
    return { record: null, skipReason: 'no email or mobile number present (validated server-side)' };
  }

  return { record, skipReason: null };
}

module.exports = { sanitizeRecord };
