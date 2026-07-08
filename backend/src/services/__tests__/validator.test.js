const { sanitizeRecord } = require('../validator');

describe('sanitizeRecord', () => {
  test('accepts a valid record with email', () => {
    const { record, skipReason } = sanitizeRecord({
      name: 'John Doe',
      email: 'john@example.com',
      crm_status: 'GOOD_LEAD_FOLLOW_UP',
    });
    expect(skipReason).toBeNull();
    expect(record.email).toBe('john@example.com');
  });

  test('skips record with no email or mobile', () => {
    const { record, skipReason } = sanitizeRecord({ name: 'John Doe' });
    expect(record).toBeNull();
    expect(skipReason).toMatch(/no email or mobile/);
  });

  test('blanks out invalid crm_status enum values', () => {
    const { record } = sanitizeRecord({
      email: 'a@b.com',
      crm_status: 'SUPER_HOT_LEAD', // not in allowed enum
    });
    expect(record.crm_status).toBe('');
  });

  test('blanks out invalid data_source enum values', () => {
    const { record } = sanitizeRecord({
      email: 'a@b.com',
      data_source: 'random_campaign',
    });
    expect(record.data_source).toBe('');
  });

  test('rejects malformed email and falls back to mobile check', () => {
    const { skipReason } = sanitizeRecord({
      email: 'not-an-email',
      mobile_without_country_code: '9876543210',
    });
    expect(skipReason).toBeNull();
  });

  test('strips non-digit characters from mobile number', () => {
    const { record } = sanitizeRecord({
      email: 'a@b.com',
      mobile_without_country_code: '+91 98765-43210',
    });
    expect(record.mobile_without_country_code).toBe('919876543210');
    expect(/^\d+$/.test(record.mobile_without_country_code)).toBe(true);
  });

  test('blanks out unparseable created_at date', () => {
    const { record } = sanitizeRecord({
      email: 'a@b.com',
      created_at: 'not a real date',
    });
    expect(record.created_at).toBe('');
  });
});
