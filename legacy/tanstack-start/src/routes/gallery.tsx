import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { SiteLayout } from "@/components/site/SiteLayout";
import heroMunicipal from "@/assets/hero-municipal.jpg";
import newsTree from "@/assets/news-tree.jpg";
import newsWaste from "@/assets/news-waste.jpg";
import mayorPortrait from "@/assets/mayor-portrait.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery — Pabna Pourashava" },
      {
        name: "description",
        content:
          "Photo gallery of Pabna Pourashava events, infrastructure projects, civic programs and cultural celebrations.",
      },
      { property: "og:title", content: "Photo Gallery — Pabna Pourashava" },
      {
        property: "og:description",
        content: "Visual archive of Pourashava events, projects and civic milestones.",
      },
      { property: "og:image", content: heroMunicipal },
    ],
  }),
  component: GalleryPage,
});

type Photo = {
  id: number;
  src: string;
  caption: string;
  category: string;
  date: string;
};

const photos: Photo[] = [
  { id: 1, src: heroMunicipal, caption: "Pourashava headquarters at dawn", category: "Infrastructure", date: "Apr 2026" },
  { id: 2, src: newsTree, caption: "World Environment Day plantation drive", category: "Environment", date: "Jun 2025" },
  { id: 3, src: newsWaste, caption: "Smart waste segregation pilot launch", category: "Civic", date: "Mar 2026" },
  { id: 4, src: mayorPortrait, caption: "Mayor's monthly public hearing", category: "Civic", date: "May 2026" },
  { id: 5, src: heroMunicipal, caption: "Independence Day flag hoisting", category: "Cultural", date: "Mar 2026" },
  { id: 6, src: newsTree, caption: "Sapling distribution at Ward 7", category: "Environment", date: "Jun 2025" },
  { id: 7, src: newsWaste, caption: "Door-to-door collection vehicle inauguration", category: "Civic", date: "Feb 2026" },
  { id: 8, src: mayorPortrait, caption: "Annual Tax Mela helpdesk", category: "Civic", date: "Feb 2026" },
  { id: 9, src: heroMunicipal, caption: "Drainage upgrade project — Ward 3", category: "Infrastructure", date: "Jan 2026" },
  { id: 10, src: newsTree, caption: "School children at the green campus initiative", category: "Environment", date: "Aug 2025" },
  { id: 11, src: newsWaste, caption: "Volunteers training session", category: "Civic", date: "Apr 2026" },
  { id: 12, src: mayorPortrait, caption: "Cultural evening at Pabna Stadium", category: "Cultural", date: "Mar 2026" },
];

const CATEGORIES = ["All", "Infrastructure", "Environment", "Civic", "Cultural"] as const;
type Category = (typeof CATEGORIES)[number];

function GalleryPage() {
  const [filter, setFilter] = useState<Category>("All");
  const [active, setActive] = useState<number | null>(null);
  useLockBodyScroll(active !== null);

  const filtered = useMemo(
    () => (filter === "All" ? photos : photos.filter((p) => p.category === filter)),
    [filter],
  );

  const open = (id: number) => setActive(id);
  const close = () => setActive(null);
  const step = (dir: 1 | -1) => {
    if (active == null) return;
    const i = filtered.findIndex((p) => p.id === active);
    const next = (i + dir + filtered.length) % filtered.length;
    setActive(filtered[next].id);
  };

  const activePhoto = active != null ? photos.find((p) => p.id === active) ?? null : null;

  return (
    <SiteLayout active="/gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-civic uppercase tracking-widest mb-2 inline-flex items-center gap-1.5">
              <Camera className="size-3.5" /> Visual Archive
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Photo Gallery
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Moments from civic programs, infrastructure projects and cultural celebrations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const isActive = c === filter;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? "bg-civic text-civic-foreground border-civic"
                      : "bg-background text-foreground border-border hover:border-civic/40"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </header>

        <div
          className="grid gap-3 sm:gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
        >
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => open(p.id)}
              className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-border bg-muted hover:ring-civic/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-civic"
            >
              <img
                src={p.src}
                alt={p.caption}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-gold">
                  {p.category}
                </p>
                <p className="text-xs text-white line-clamp-2 mt-0.5">{p.caption}</p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No photos in this category yet.</p>
        )}
      </div>

      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
          />
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute -top-2 right-0 sm:-top-12 sm:right-0 z-10 inline-flex size-10 items-center justify-center rounded-full bg-background/90 ring-1 ring-border hover:bg-background transition-colors"
            >
              <X className="size-5" />
            </button>
            <div className="relative w-full flex items-center justify-center">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous"
                className="absolute left-0 sm:-left-14 z-10 inline-flex size-10 items-center justify-center rounded-full bg-background/80 ring-1 ring-border hover:bg-background transition-colors"
              >
                <ChevronLeft className="size-5" />
              </button>
              <img
                src={activePhoto.src}
                alt={activePhoto.caption}
                className="max-h-[75vh] w-auto rounded-lg shadow-elevated"
              />
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next"
                className="absolute right-0 sm:-right-14 z-10 inline-flex size-10 items-center justify-center rounded-full bg-background/80 ring-1 ring-border hover:bg-background transition-colors"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
            <div className="mt-3 text-center">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gold">
                {activePhoto.category} · {activePhoto.date}
              </p>
              <p className="text-sm text-white mt-1">{activePhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
