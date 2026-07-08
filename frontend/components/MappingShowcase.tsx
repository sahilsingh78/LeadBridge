"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type SourceExample = {
  label: string;
  pairs: { raw: string; mapped: string }[];
};

const SOURCES: SourceExample[] = [
  {
    label: "Facebook Lead Ads",
    pairs: [
      { raw: "full_name", mapped: "name" },
      { raw: "email_address", mapped: "email" },
      { raw: "phone_number", mapped: "mobile_without_country_code" },
      { raw: "lead_status", mapped: "crm_status" },
    ],
  },
  {
    label: "Google Ads Export",
    pairs: [
      { raw: "Contact Name", mapped: "name" },
      { raw: "Google Email", mapped: "email" },
      { raw: "Campaign", mapped: "data_source" },
      { raw: "Submitted At", mapped: "created_at" },
    ],
  },
  {
    label: "Hand-typed sheet",
    pairs: [
      { raw: "Client", mapped: "name" },
      { raw: "WhatsApp No.", mapped: "mobile_without_country_code" },
      { raw: "Remarks", mapped: "crm_note" },
      { raw: "Town", mapped: "city" },
    ],
  },
];

export function MappingShowcase() {
  const [active, setActive] = useState(0);
  const source = SOURCES[active];

  return (
    <div className="w-full rounded-xl border border-line bg-white overflow-hidden">
      <div className="flex border-b border-line">
        {SOURCES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px
              ${i === active ? "border-signal text-signal bg-signal-soft/40" : "border-transparent text-ink-soft hover:text-ink"}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-soft mb-3">
          <span>Whatever column exists</span>
          <span>GrowEasy CRM field</span>
        </div>
        <div className="flex flex-col gap-2">
          {source.pairs.map((pair) => (
            <div
              key={pair.raw + pair.mapped}
              className="flex items-center justify-between gap-3 rounded-md bg-paper px-3 py-2"
            >
              <span className="font-data text-[13px] text-ink-soft truncate">{pair.raw}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success-soft">
                  <Check size={10} strokeWidth={3} className="text-success" />
                </span>
                <span className="font-data text-[13px] font-medium text-ink truncate">
                  {pair.mapped}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}