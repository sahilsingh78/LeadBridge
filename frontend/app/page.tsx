"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { MappingShowcase } from "@/components/MappingShowcase";
import { DataTable, ColumnDef } from "@/components/DataTable";
import { ProcessingPipeline } from "@/components/ProcessingPipeline";
import { StepRail } from "@/components/StepRail";
import { StatusPill } from "@/components/StatusPill";
import { parseCsvClientSide } from "@/lib/csvClientParse";
import { submitImport } from "@/lib/api";
import type { AppStep, CrmRecord, CsvPreview, ImportResult, SkippedRecord } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState<AppStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileAccepted = useCallback(async (accepted: File) => {
    setError(null);
    try {
      const parsed = await parseCsvClientSide(accepted);
      setFile(accepted);
      setPreview(parsed);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this file.");
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!file || !preview) return;
    setError(null);
    setStep("processing");
    try {
      const res = await submitImport(file);
      setResult(res);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Please try again.");
      setStep("preview");
    }
  }, [file, preview]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStep("upload");
  }, []);

  const previewColumns: ColumnDef<Record<string, string>>[] = useMemo(
    () => (preview ? preview.headers.map((h) => ({ key: h, header: h })) : []),
    [preview]
  );

  const importedColumns: ColumnDef<CrmRecord>[] = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "email", header: "Email", mono: true },
      {
        key: "mobile_without_country_code",
        header: "Mobile",
        mono: true,
        render: (row) => (row.mobile_without_country_code ? `${row.country_code} ${row.mobile_without_country_code}` : "—"),
      },
      { key: "company", header: "Company" },
      { key: "city", header: "City" },
      { key: "crm_status", header: "Status", render: (row) => <StatusPill value={row.crm_status} /> },
      { key: "data_source", header: "Source" },
      { key: "crm_note", header: "Note" },
      { key: "created_at", header: "Created At", mono: true },
    ],
    []
  );

  const skippedColumns: ColumnDef<SkippedRecord>[] = useMemo(
    () => [
      { key: "source_row_index", header: "Row #", mono: true, render: (row) => `#${row.source_row_index + 1}` },
      { key: "reason", header: "Reason skipped" },
    ],
    []
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-signal">
                <span className="h-1.5 w-1.5 rounded-[1px] bg-white" />
              </span>
              <p className="font-data text-xs uppercase tracking-widest text-signal">LeadBridge</p>
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Import Leads from Any CSV
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              AI automatically maps your CSV columns into a standardized CRM format ·{" "}
              <span className="text-ink">Compatible with GrowEasy CRM</span>
            </p>
          </div>
          {step !== "upload" && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <RotateCcw size={13} /> Start over
            </button>
          )}
        </div>
        <StepRail current={step} />
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-danger-soft px-4 py-3 text-sm text-danger">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {step === "upload" && (
        <section className="flex flex-1 flex-col gap-6 py-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
              Upload any CSV.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              Facebook, Google Ads, Excel, or manually created spreadsheets — LeadBridge automatically
              understands your column names and maps them to the correct CRM fields.
            </p>
            <p className="mt-2 max-w-2xl text-xs text-ink-soft/80">
              Supports Facebook Leads, Google Ads, Excel, CRM exports, and custom CSVs.
            </p>
          </div>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <UploadDropzone onFileAccepted={handleFileAccepted} />
            <MappingShowcase />
          </div>
        </section>
      )}

      {step === "preview" && preview && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-base font-medium text-ink">{preview.fileName}</p>
              <p className="text-xs text-ink-soft">
                {preview.rows.length} rows · {preview.headers.length} columns · {(preview.fileSizeBytes / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Confirm import <ArrowRight size={15} />
            </button>
          </div>
          <p className="text-xs text-ink-soft">
            This is a raw preview — no AI processing has run yet. Confirm to send it for mapping.
          </p>
          <DataTable
            columns={previewColumns}
            rows={preview.rows}
            rowKey={(_, i) => `preview-${i}`}
          />
        </section>
      )}

      {step === "processing" && preview && (
        <section className="flex flex-1 flex-col items-center justify-center py-12">
          <div className="w-full max-w-xl">
            <ProcessingPipeline totalRows={preview.rows.length} />
          </div>
        </section>
      )}

      {step === "results" && result && (
        <section className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total rows" value={result.totalProcessed} />
            <StatCard label="Imported" value={result.totalImported} icon={<CheckCircle2 size={14} className="text-success" />} tone="success" />
            <StatCard label="Skipped" value={result.totalSkipped} icon={<XCircle size={14} className="text-danger" />} tone="danger" />
            <StatCard label="Batches processed" value={result.batchCount} />
          </div>

          <div>
            <h2 className="mb-2 font-display text-sm font-medium text-ink">
              Imported records ({result.totalImported})
            </h2>
            <DataTable
              columns={importedColumns}
              rows={result.imported}
              rowKey={(row, i) => `imported-${i}-${row.email || row.mobile_without_country_code}`}
            />
          </div>

          {result.totalSkipped > 0 && (
            <div>
              <h2 className="mb-2 font-display text-sm font-medium text-ink">
                Skipped records ({result.totalSkipped})
              </h2>
              <DataTable
                columns={skippedColumns}
                rows={result.skipped}
                maxHeight="30vh"
                rowKey={(row) => `skipped-${row.source_row_index}`}
              />
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  tone?: "success" | "danger";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-ink";
  return (
    <div className="rounded-lg border border-line bg-white px-4 py-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-soft">
        {icon} {label}
      </p>
      <p className={`mt-1 font-display text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}