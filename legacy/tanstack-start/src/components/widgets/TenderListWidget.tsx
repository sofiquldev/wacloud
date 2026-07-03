import { ArrowRight } from "lucide-react";
import type { TenderItem } from "./types";

export type TenderHeaderVariant = "default" | "accent" | "architectural" | "banner";

export function TenderListWidget({
  title,
  items,
  variant = "default",
}: {
  title: string;
  items: TenderItem[];
  variant?: TenderHeaderVariant;
}) {
  const isBanner = variant === "banner";
  return (
    <div className="bg-surface ring-1 ring-border rounded-xl overflow-hidden">
      <TenderHeader title={title} variant={variant} />
      <div className={isBanner ? "p-5 space-y-4" : "px-5 pb-5 space-y-4"}>
        {items.map((t) => (
          <div key={t.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  t.status === "closed"
                    ? "bg-muted text-muted-foreground"
                    : "bg-civic-muted text-civic"
                }`}
              >
                {t.status ?? "open"}
              </span>
              <p className="text-[11px] text-ink-faint">{t.ref}</p>
            </div>
            <a href="#" className="text-sm font-medium text-foreground leading-tight hover:text-civic transition-colors block">
              {t.title}
            </a>
            <p className="text-[11px] text-muted-foreground mt-1">Deadline: {t.deadline}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TenderHeader({ title, variant }: { title: string; variant: TenderHeaderVariant }) {
  if (variant === "banner") {
    return (
      <div className="flex items-center justify-between bg-civic px-5 py-3 border-b-2 border-accent">
        <div className="flex items-center gap-2.5">
          <span className="w-1 h-4 bg-accent rounded-full" />
          <h3 className="text-sm font-semibold text-civic-foreground tracking-wide">{title}</h3>
        </div>
        <a
          href="/tenders"
          className="group flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-civic-foreground/80 hover:text-accent transition-colors"
        >
          All
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    );
  }

  if (variant === "accent") {
    return (
      <div className="flex items-center justify-between mt-5 mx-5 mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="w-0.5 h-4 bg-accent rounded-full" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-civic">{title}</h3>
        </div>
        <a
          href="/tenders"
          className="group flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-civic hover:text-accent transition-colors"
        >
          View All
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    );
  }

  if (variant === "architectural") {
    return (
      <div className="flex items-center justify-between mt-5 mx-5 mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 bg-accent rounded-full" />
          <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-civic flex items-center gap-2">
            {title}
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-civic opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-civic" />
            </span>
          </h3>
        </div>
        <a
          href="/tenders"
          className="group flex items-center gap-1.5 text-xs font-semibold text-civic hover:text-accent transition-colors"
        >
          View All
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    );
  }

  // default
  return (
    <div className="flex items-center justify-between mt-5 mx-5 mb-4">
      <h3 className="text-[11px] font-semibold text-ink-faint uppercase tracking-widest">{title}</h3>
      <a href="/tenders" className="text-xs text-civic font-medium hover:underline">All</a>
    </div>
  );
}
