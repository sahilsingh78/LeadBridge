const CRM_STATUS_VALUES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
];

const DATA_SOURCE_VALUES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
];

const CRM_FIELDS = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];

// The JSON schema handed to Gemini's structured-output mode. Constraining
// enums directly in the schema (not just in the prompt text) is the biggest
// lever for making the model reliably respect them.
const GEMINI_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    imported: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          created_at: { type: 'string', nullable: true },
          name: { type: 'string', nullable: true },
          email: { type: 'string', nullable: true },
          country_code: { type: 'string', nullable: true },
          mobile_without_country_code: { type: 'string', nullable: true },
          company: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          state: { type: 'string', nullable: true },
          country: { type: 'string', nullable: true },
          lead_owner: { type: 'string', nullable: true },
          crm_status: { type: 'string', enum: [...CRM_STATUS_VALUES, 'UNKNOWN'] },
          crm_note: { type: 'string', nullable: true },
          data_source: { type: 'string', enum: [...DATA_SOURCE_VALUES, 'UNKNOWN'] },
          possession_time: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          source_row_index: {
            type: 'integer',
            description: 'The 0-based index of this row within the batch it was sent in.',
          },
        },
        required: ['source_row_index'],
      },
    },
    skipped: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source_row_index: { type: 'integer' },
          reason: { type: 'string' },
        },
        required: ['source_row_index', 'reason'],
      },
    },
  },
  required: ['imported', 'skipped'],
};

module.exports = {
  CRM_STATUS_VALUES,
  DATA_SOURCE_VALUES,
  CRM_FIELDS,
  GEMINI_RESPONSE_SCHEMA,
};
