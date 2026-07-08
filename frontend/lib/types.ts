export type CsvPreview = {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
  fileSizeBytes: number;
};

export type CrmRecord = {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
};

export type SkippedRecord = {
  source_row_index: number;
  reason: string;
};

export type ImportResult = {
  headers: string[];
  totalRowsInFile: number;
  imported: CrmRecord[];
  skipped: SkippedRecord[];
  totalImported: number;
  totalSkipped: number;
  totalProcessed: number;
  batchCount: number;
};

export type AppStep = "upload" | "preview" | "processing" | "results";
