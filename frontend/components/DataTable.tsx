"use client";

import { ReactNode } from "react";

export type ColumnDef<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  mono?: boolean;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  maxHeight = "60vh",
  rowKey,
}: {
  columns: ColumnDef<T>[];
  rows: T[];
  maxHeight?: string;
  rowKey: (row: T, index: number) => string;
}) {
  return (
    <div
      className="w-full overflow-auto rounded-lg border border-line bg-white"
      style={{ maxHeight }}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-ink text-white">
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider font-display"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              className="border-t border-line odd:bg-white even:bg-paper/60 hover:bg-signal-soft/40"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`whitespace-nowrap px-3 py-2 text-ink ${col.mono ? "font-data text-[13px]" : ""}`}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}