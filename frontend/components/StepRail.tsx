import type { AppStep } from "@/lib/types";

const STEPS: { key: AppStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "processing", label: "AI Mapping" },
  { key: "results", label: "Result" },
];

export function StepRail({ current }: { current: AppStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors
                ${isActive ? "bg-ink text-white" : isDone ? "bg-signal-soft text-signal" : "bg-line/60 text-ink-soft"}`}
            >
              <span className="font-data">{String(i + 1).padStart(2, "0")}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-4 sm:w-8 ${isDone ? "bg-signal" : "bg-line"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}