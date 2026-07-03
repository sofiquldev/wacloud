import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroData, HeroSlide } from "./types";

export function HeroWidget({ image, title, subtitle, slides, autoplayMs = 6000 }: HeroData) {
  const list: HeroSlide[] =
    slides && slides.length > 0
      ? slides
      : image && title && subtitle
        ? [{ image, title, subtitle }]
        : [];

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = list.length;

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), autoplayMs);
    return () => clearInterval(t);
  }, [count, paused, autoplayMs]);

  if (count === 0) return null;

  const go = (n: number) => setIdx(((n % count) + count) % count);

  return (
    <div
      className="relative rounded-xl overflow-hidden ring-1 ring-border shadow-card group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative aspect-[2/1] w-full">
        {list.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={i !== idx}
          >
            <img
              src={s.image}
              alt=""
              width={1600}
              height={800}
              loading={i === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-5 sm:p-7">
              <h2 className="text-civic-foreground text-xl sm:text-2xl md:text-3xl font-semibold mb-2 text-balance tracking-tight">
                {s.title}
              </h2>
              <p className="text-civic-foreground/85 text-xs sm:text-sm md:text-base max-w-[52ch] text-pretty">
                {s.subtitle}
              </p>
              {s.ctaLabel && s.ctaHref && (
                <a
                  href={s.ctaHref}
                  className="mt-3 inline-flex w-fit items-center px-4 py-2 rounded-lg bg-gold text-gold-foreground text-sm font-semibold hover:bg-gold/90 transition-colors"
                >
                  {s.ctaLabel}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(idx - 1)}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 inline-flex size-9 items-center justify-center rounded-full bg-background/70 backdrop-blur ring-1 ring-border text-foreground hover:bg-background transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(idx + 1)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 inline-flex size-9 items-center justify-center rounded-full bg-background/70 backdrop-blur ring-1 ring-border text-foreground hover:bg-background transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === idx}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-6 bg-gold" : "w-1.5 bg-background/70 hover:bg-background"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
