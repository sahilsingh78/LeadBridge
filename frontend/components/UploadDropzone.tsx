"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileWarning, Download, Check } from "lucide-react";
import { downloadSampleTemplate } from "@/lib/sampleTemplate";

export function UploadDropzone({
  onFileAccepted,
}: {
  onFileAccepted: (file: File) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: import("react-dropzone").FileRejection[]) => {
      setError(null);
      if (rejectedFiles.length > 0) {
        setError("Only a single .csv file (max 5MB) is accepted.");
        return;
      }
      if (acceptedFiles[0]) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: { "text/csv": [".csv"] },
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`group relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-8 py-16 text-center transition-colors cursor-pointer
          ${isDragActive ? "border-signal bg-signal-soft" : "border-line bg-white hover:border-signal/60 hover:bg-signal-soft/40"}`}
      >
        <input {...getInputProps()} />
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${isDragActive ? "bg-signal text-white" : "bg-signal-soft text-signal"}`}
        >
          <UploadCloud size={22} strokeWidth={1.75} />
        </div>
        <div>
          <p className="font-display text-[15px] font-medium text-ink">
            {isDragActive ? "Drop it here" : "Drag & drop your CSV here"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">or click to browse — max 5MB, .csv only</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {["Facebook Lead Ads", "Google Ads", "Excel Sheets", "CRM Exports"].map((src) => (
              <span key={src} className="flex items-center gap-1 text-xs text-ink-soft">
                <Check size={12} className="text-success" />
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          <FileWarning size={16} />
          {error}
        </div>
      )}
      <button
        onClick={downloadSampleTemplate}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-signal"
      >
        <Download size={13} /> Download sample CSV template
      </button>
    </div>
  );
}