import type { NoticeItem } from "./types";

export function NoticeListWidget({
  title,
  items,
}: {
  title: string;
  items: NoticeItem[];
}) {
  return (
    <div className="bg-surface-elevated ring-1 ring-border rounded-xl overflow-hidden">
      <div className="bg-civic text-civic-foreground px-5 py-3 flex justify-between items-center">
        <h3 className="font-bangla text-lg font-semibold">{title}</h3>
        <a href="/notices" className="text-[11px] uppercase tracking-widest text-civic-foreground/70 hover:text-gold">
          View all
        </a>
      </div>
      <ul className="divide-y divide-border">
        {items.map((n) => {
          const d = new Date(n.date);
          const month = d.toLocaleString("en", { month: "short" }).toUpperCase();
          const day = d.getDate();
          return (
            <li key={n.id} className="p-4 hover:bg-muted/40 transition-colors flex gap-4">
              <div className="shrink-0 w-14 py-2 text-center rounded border border-border bg-muted">
                <span className="block text-[10px] font-semibold text-ink-faint">{month}</span>
                <span className="block text-lg font-bold text-destructive leading-none">{day}</span>
              </div>
              <div className="min-w-0">
                <a href="#" className="font-medium text-foreground hover:text-civic transition-colors block">
                  {n.title}
                </a>
                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-tight">
                  {n.department && <>Dept: {n.department}</>}
                  {n.fileSize && <> · PDF ({n.fileSize})</>}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
