import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownUp, ArrowUp, ArrowDown, Check } from "lucide-react";
import { MemberDetailModal } from "./MemberDetailModal";

export type ElectedMember = {
  id: string | number;
  name: string;
  designation: string;
  ward?: string;
  photo: string;
  termStart: number;
  termEnd: number;
  partyOrAffiliation?: string;
};

export type MembersGridData = {
  title: string;
  sessionLabel: string;
  members: ElectedMember[];
};

type SortKey = "name" | "designation" | "ward" | "termStart";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "designation", label: "Designation" },
  { key: "ward", label: "Ward" },
  { key: "termStart", label: "Term Start" },
];

function compare(a: ElectedMember, b: ElectedMember, key: SortKey, dir: SortDir) {
  const av = a[key] ?? "";
  const bv = b[key] ?? "";
  let cmp = 0;
  if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
  else cmp = String(av).localeCompare(String(bv));
  return dir === "asc" ? cmp : -cmp;
}

export function MembersGridWidget({ title, sessionLabel, members }: MembersGridData) {
  const [sortKey, setSortKey] = useState<SortKey>("designation");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [active, setActive] = useState<ElectedMember | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const sorted = useMemo(
    () => [...members].sort((a, b) => compare(a, b, sortKey, sortDir)),
    [members, sortKey, sortDir],
  );

  const pickSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const activeLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "Sort";

  return (
    <section className="bg-surface ring-1 ring-border rounded-xl p-6 md:p-7">
      <header className="flex flex-row items-start justify-between gap-3 mb-6">
        <div>
          <p className="text-[11px] font-semibold text-civic uppercase tracking-widest mb-1">
            Elected Representatives
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Session: {sessionLabel}</p>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Sort by ${activeLabel}, ${sortDir === "asc" ? "ascending" : "descending"}`}
            title={`Sort: ${activeLabel} (${sortDir})`}
            className="inline-flex items-center justify-center size-9 rounded-full bg-background ring-1 ring-border text-foreground hover:ring-civic/50 hover:text-civic transition-colors"
          >
            <ArrowDownUp className="size-4" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 z-30 bg-background ring-1 ring-border rounded-lg shadow-elevated overflow-hidden animate-in fade-in zoom-in-95"
            >
              <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-ink-soft font-semibold">
                Sort by
              </p>
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => pickSort(opt.key)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-surface transition-colors ${
                      isActive ? "text-civic font-medium" : "text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isActive ? (
                        <Check className="size-3.5" />
                      ) : (
                        <span className="inline-block size-3.5" />
                      )}
                      {opt.label}
                    </span>
                    {isActive &&
                      (sortDir === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      ))}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <ul
        className="grid gap-3 sm:gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
      >
        {sorted.map((m) => (
          <li
            key={m.id}
            className="group bg-background ring-1 ring-border rounded-lg overflow-hidden hover:ring-civic/40 hover:shadow-card transition-all"
          >
            <div className="aspect-[4/5] overflow-hidden bg-muted">
              <img
                src={m.photo}
                alt={m.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            <div className="p-3">
              <button
                type="button"
                onClick={() => setActive(m)}
                className="text-left text-sm font-semibold leading-tight text-foreground line-clamp-1 hover:text-civic transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-civic rounded"
              >
                {m.name}
              </button>
              <p className="text-[11px] text-civic font-semibold uppercase tracking-wider mt-1">
                {m.designation}
              </p>
              <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                <span>{m.ward ?? "—"}</span>
                <span className="tabular-nums">
                  {m.termStart}–{m.termEnd}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <MemberDetailModal member={active} onClose={() => setActive(null)} />
    </section>
  );
}
