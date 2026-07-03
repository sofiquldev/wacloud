import type { CareerTimelineData } from "./types";

export function CareerTimelineWidget({
  memberName,
  subtitle,
  entries,
}: CareerTimelineData) {
  return (
    <div className="bg-surface ring-1 ring-border rounded-xl p-7 md:p-8">
      <div className="mb-7">
        <p className="text-[11px] font-semibold text-civic uppercase tracking-widest mb-2">
          Member Career Timeline
        </p>
        <h3 className="text-lg font-semibold tracking-tight">{memberName}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <ol className="relative pl-8 border-l border-border ml-2 space-y-9">
        {entries.map((e, i) => (
          <li key={i} className="relative">
            <span
              className={`absolute -left-[41px] top-1 size-4 rounded-full ring-4 ring-background ${
                e.current ? "bg-civic shadow-[0_0_0_2px_var(--gold)]" : "bg-border"
              }`}
              aria-hidden
            />
            <span
              className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${
                e.current ? "text-civic" : "text-ink-faint"
              }`}
            >
              {e.period}
              {e.current && <span className="ml-2 text-gold">● Current</span>}
            </span>
            <h4 className="text-sm font-semibold text-foreground">{e.title}</h4>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              {e.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
