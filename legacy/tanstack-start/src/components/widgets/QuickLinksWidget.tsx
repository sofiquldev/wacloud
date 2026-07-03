export function QuickLinksWidget({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="bg-muted/60 ring-1 ring-border rounded-xl p-5">
      <h3 className="text-[11px] font-semibold text-ink-faint uppercase tracking-widest mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="text-sm text-muted-foreground hover:text-civic transition-colors">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
