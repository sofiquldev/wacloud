import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { services, SERVICE_CATEGORIES, type ServiceCategory } from "@/data/services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "e-Services — Pabna Pourashava" },
      {
        name: "description",
        content:
          "Browse all citizen services offered by Pabna Pourashava: civil registration, holding tax, trade licences, water, building approval and more.",
      },
      { property: "og:title", content: "e-Services — Pabna Pourashava" },
      {
        property: "og:description",
        content: "Apply online for Pourashava services. Filter by category, search by name.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<ServiceCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (cat !== "All" && s.category !== cat) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.bnTitle?.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    });
  }, [query, cat]);

  return (
    <SiteLayout active="/services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-8">
          <p className="text-[11px] font-semibold text-civic uppercase tracking-widest mb-2">
            Pabna Pourashava
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            e-Services Explorer
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            All citizen services in one place. Apply online, track status, and download receipts.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services (e.g. trade license, birth)…"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background ring-1 ring-border focus:ring-2 focus:ring-civic outline-none text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["All", ...SERVICE_CATEGORIES] as const).map((c) => {
              const active = c === cat;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? "bg-civic text-civic-foreground border-civic"
                      : "bg-background text-foreground border-border hover:border-civic/40"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Showing {filtered.length} of {services.length} services
        </p>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
        >
          {filtered.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="group bg-surface ring-1 ring-border rounded-xl p-5 hover:ring-civic/50 hover:shadow-card transition-all flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="size-11 rounded-lg bg-civic/10 text-civic flex items-center justify-center">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-ink-soft bg-secondary px-2 py-0.5 rounded">
                    {s.category}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-foreground leading-tight">
                  {s.title}
                </h2>
                {s.bnTitle && (
                  <p className="text-xs text-civic font-medium mt-0.5">{s.bnTitle}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                  {s.shortDescription}
                </p>
                <div className="flex items-center justify-between mt-4 text-[11px] text-ink-soft">
                  <span>{s.processingTime}</span>
                  <span className="inline-flex items-center gap-1 text-civic font-semibold group-hover:gap-2 transition-all">
                    Open <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-16 ring-1 ring-border rounded-xl">
            No services match your search.
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
