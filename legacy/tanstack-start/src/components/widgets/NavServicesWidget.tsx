import type { ServiceLink } from "./types";

export function NavServicesWidget({
  title,
  items,
}: {
  title: string;
  items: ServiceLink[];
}) {
  return (
    <div className="bg-surface ring-1 ring-border rounded-xl p-4">
      <h3 className="text-[11px] font-semibold text-ink-faint uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors"
          >
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            <span className="text-ink-faint group-hover:translate-x-0.5 group-hover:text-civic transition-all">
              →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
