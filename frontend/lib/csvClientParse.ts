import Papa from "papaparse";
import type { CsvPreview } from "./types";

const MAX_FILE_SIZE_MB = 5;

export function parseCsvClientSide(file: File): Promise<CsvPreview> {
  return new Promise((resolve, reject) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      reject(new Error("Only .csv files are supported."));
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      reject(new Error(`File exceeds the ${MAX_FILE_SIZE_MB}MB limit.`));
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data.length) {
          reject(new Error("This CSV has no data rows."));
          return;
        }
        const headers = result.meta.fields ?? Object.keys(result.data[0]);
        resolve({
          headers,
          rows: result.data,
          fileName: file.name,
          fileSizeBytes: file.size,
        });
      },
      error: (err) => reject(new Error(`Could not read CSV: ${err.message}`)),
    });
  });
}
