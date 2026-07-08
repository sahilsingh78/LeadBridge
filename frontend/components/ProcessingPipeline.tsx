"use client";

import { useEffect, useState } from "react";

export function ProcessingPipeline({ totalRows }: { totalRows: number }) {
  const BATCH_SIZE = 25;
  const batchCount = Math.max(1, Math.ceil(totalRows / BATCH_SIZE));
  const [activeSegment, setActiveSegment] = useState(0);

  useEffect(() => {
    const capped = Math.max(1, batchCount - 1);
    const interval = setInterval(() => {
      setActiveSegment((prev) => (prev < capped ? prev + 1 : prev));
    }, Math.max(600, 4000 / batchCount));
    return () => clearInterval(interval);
  }, [batchCount]);

  return (
    <div className="w-full rounded-lg border border-line bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-[15px] font-medium text-ink">
          Mapping fields into GrowEasy CRM schema…
        </p>
        <span className="font-data text-xs text-ink-soft">
          batch {Math.min(activeSegment + 1, batchCount)} of {batchCount}
        </span>
      </div>

      <div className="mt-4 flex gap-1">
        {Array.from({ length: batchCount }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
              i <= activeSegment ? "bg-signal" : "bg-line"
            } ${i === activeSegment ? "animate-pulse" : ""}`}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-ink-soft">
        {totalRows} row{totalRows === 1 ? "" : "s"} · resolving ambiguous columns, validating enums, merging duplicate contacts
      </p>
    </div>
  );
}