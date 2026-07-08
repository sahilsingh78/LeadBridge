const STATUS_STYLES: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "bg-signal-soft text-signal",
  DID_NOT_CONNECT: "bg-amber-soft text-amber",
  BAD_LEAD: "bg-danger-soft text-danger",
  SALE_DONE: "bg-success-soft text-success",
};

export function StatusPill({ value }: { value: string }) {
  if (!value) {
    return <span className="text-ink-soft/50 font-data text-xs">—</span>;
  }
  const style = STATUS_STYLES[value] || "bg-line/60 text-ink-soft";
  return (
    <span
      className={`inline-flex items-center rounded-[3px] px-2 py-0.5 text-[11px] font-medium tracking-wide ${style}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}