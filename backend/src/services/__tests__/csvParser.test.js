const { parseCsv } = require('../csvParser');

describe('parseCsv', () => {
  test('parses a simple CSV with arbitrary headers', () => {
    const csv = 'Full Name,Email Address,Phone\nJohn Doe,john@x.com,9876543210';
    const { headers, rows } = parseCsv(csv);
    expect(headers).toEqual(['Full Name', 'Email Address', 'Phone']);
    expect(rows).toHaveLength(1);
    expect(rows[0]['Full Name']).toBe('John Doe');
  });

  test('drops fully empty rows', () => {
    const csv = 'name,email\nJohn,john@x.com\n,\n';
    const { rows } = parseCsv(csv);
    expect(rows).toHaveLength(1);
  });

  test('throws a 400 error on empty file', () => {
    expect(() => parseCsv('name,email\n')).toThrow('no data rows');
  });

  test('tolerates ragged rows without throwing', () => {
    const csv = 'a,b,c\n1,2\n1,2,3,4';
    expect(() => parseCsv(csv)).not.toThrow();
  });
});
