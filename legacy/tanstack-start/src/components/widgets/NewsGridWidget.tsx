import type { NewsItem } from "./types";

export function NewsGridWidget({ items }: { items: NewsItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {items.map((n) => (
        <a key={n.id} href="#" className="group block">
          <div className="overflow-hidden rounded-xl ring-1 ring-border mb-3">
            <img
              src={n.image}
              alt={n.title}
              loading="lazy"
              width={800}
              height={600}
              className="w-full aspect-[3/2] object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <p className="text-xs text-ink-faint font-medium mb-1">{n.date}</p>
          <h4 className="text-sm font-semibold leading-snug group-hover:text-civic transition-colors">
            {n.title}
          </h4>
        </a>
      ))}
    </div>
  );
}
