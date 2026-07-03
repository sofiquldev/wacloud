import MayorMessageModal from '@/Components/widgets/MayorMessageModal';
import PortalMenu from '@/Components/Admin/PortalMenu';
import MemberViewModal from '@/Components/Admin/MemberViewModal';
import { buildNavServiceItems } from '@/utils/navServicesItems';
import {
    ArrowDownUp,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    Check,
    ChevronLeft,
    ChevronRight,
    FileText,
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

function NavServicesWidget({ title, items, serviceSource, serviceQuery }) {
    const { cmsServices = [] } = usePage().props;
    const rows = useMemo(
        () =>
            buildNavServiceItems(cmsServices, {
                items,
                serviceSource,
                serviceQuery,
            }),
        [cmsServices, items, serviceSource, serviceQuery],
    );

    return (
        <div className="rounded-xl bg-surface p-4 ring-1 ring-border">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">{title}</h3>
            <div className="flex flex-col gap-0.5">
                {rows.map((item) => (
                    <Link
                        key={item.slug}
                        href={item.href}
                        className="group flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-muted"
                    >
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        <span className="text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-civic">
                            →
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export function HotlineWidget({ label, number, description }) {
    return (
        <div className="rounded-xl bg-civic p-6 text-civic-foreground shadow-elevated">
            <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-civic-foreground/60">{label}</h4>
            <p className="mb-3 text-3xl font-semibold leading-none tracking-tight">{number}</p>
            <p className="text-pretty text-xs leading-relaxed text-civic-foreground/75">{description}</p>
        </div>
    );
}

function QuickLinksWidget({ title, items }) {
    const list = Array.isArray(items) ? items : [];
    return (
        <div className="rounded-xl bg-muted/60 p-5 ring-1 ring-border">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">{title}</h3>
            <ul className="space-y-3">
                {list.map((l, i) => (
                    <li key={typeof l.id === 'string' ? l.id : `${i}-${l.href}-${l.label}`}>
                        <a
                            href={l.href || '#'}
                            className="text-sm text-muted-foreground transition-colors hover:text-civic"
                            {...(String(l.href ?? '').startsWith('http')
                                ? { target: '_blank', rel: 'noreferrer' }
                                : {})}
                        >
                            {l.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function heroSlideCaption(s) {
    if (s?.caption && String(s.caption).trim()) {
        return String(s.caption).trim();
    }
    if (s?.title && String(s.title).trim()) {
        return String(s.title).trim();
    }
    return '';
}

function HeroWidget({ slides, autoplayMs = 6000 }) {
    const list = (slides ?? []).filter((s) => s && typeof s.image === 'string' && s.image.trim());
    const [idx, setIdx] = useState(0);
    const [paused, setPaused] = useState(false);
    const count = list.length;

    useEffect(() => {
        setIdx((i) => (count ? Math.min(i, count - 1) : 0));
    }, [count]);

    useEffect(() => {
        if (count <= 1 || paused) return undefined;
        const t = setInterval(() => setIdx((i) => (i + 1) % count), autoplayMs);
        return () => clearInterval(t);
    }, [count, paused, autoplayMs]);

    if (count === 0) return null;
    const go = (n) => setIdx(((n % count) + count) % count);

    return (
        <div
            className="group relative overflow-hidden rounded-xl shadow-card ring-1 ring-border"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="relative aspect-[2/1] w-full">
                {list.map((s, i) => {
                    const cap = heroSlideCaption(s);
                    return (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                            i === idx ? 'opacity-100' : 'pointer-events-none opacity-0'
                        }`}
                        aria-hidden={i !== idx}
                    >
                        <img
                            src={s.image}
                            alt=""
                            width={1600}
                            height={800}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            className="h-full w-full object-cover"
                        />
                        {cap ? (
                            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/15 to-transparent p-4 sm:p-6">
                                <p className="max-w-[60ch] text-pretty text-sm font-medium leading-snug text-white/95 sm:text-base">
                                    {cap}
                                </p>
                            </div>
                        ) : null}
                    </div>
                    );
                })}
            </div>
            {count > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Previous slide"
                        onClick={() => go(idx - 1)}
                        className="absolute left-2 top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 opacity-0 ring-1 ring-border transition-opacity hover:bg-background group-hover:opacity-100 focus:opacity-100 sm:left-3"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next slide"
                        onClick={() => go(idx + 1)}
                        className="absolute right-2 top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 opacity-0 ring-1 ring-border transition-opacity hover:bg-background group-hover:opacity-100 focus:opacity-100 sm:right-3"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                        {list.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Go to slide ${i + 1}`}
                                aria-current={i === idx}
                                onClick={() => go(i)}
                                className={`h-1.5 rounded-full transition-all ${
                                    i === idx ? 'w-6 bg-gold' : 'w-1.5 bg-background/70 hover:bg-background'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function noticeListItemHref(item) {
    if (!item || typeof item !== 'object') {
        return null;
    }
    const href = typeof item.href === 'string' ? item.href.trim() : '';
    if (href !== '') {
        return href;
    }
    const slug = typeof item.slug === 'string' ? item.slug.trim() : '';
    if (slug !== '') {
        return `/notices/${slug}`;
    }
    return null;
}

export function NoticeListWidget({ title, items, variant = 'default' }) {
    const list = Array.isArray(items) ? items : [];
    const compact = variant === 'compact';

    if (compact) {
        return (
            <div className="rounded-xl border border-border/80 bg-surface p-4 ring-1 ring-border">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-civic">{title}</h3>
                <ul className="mt-3 space-y-2.5">
                    {list.map((n) => {
                        let label = '';
                        try {
                            const d = new Date(n.date);
                            if (!Number.isNaN(d.getTime())) {
                                label = d.toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                });
                            }
                        } catch {
                            label = '';
                        }
                        const itemHref = noticeListItemHref(n);
                        return (
                            <li
                                key={n.id}
                                className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50"
                            >
                                {label ? (
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                        {label}
                                    </p>
                                ) : null}
                                {itemHref ? (
                                    <Link
                                        href={itemHref}
                                        className="mt-0.5 block text-sm font-medium leading-snug text-foreground underline-offset-2 hover:text-civic hover:underline"
                                    >
                                        {n.title}
                                    </Link>
                                ) : (
                                    <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{n.title}</p>
                                )}
                                {n.department ? (
                                    <p className="mt-1 text-[10px] text-muted-foreground">{n.department}</p>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl bg-surface-elevated ring-1 ring-border">
            <div className="flex items-center justify-between bg-civic px-5 py-3 text-civic-foreground">
                <h3 className="font-bangla text-lg font-semibold">{title}</h3>
                <span className="text-[11px] uppercase tracking-widest text-civic-foreground/70">View all</span>
            </div>
            <ul className="divide-y divide-border">
                {list.map((n) => {
                    const d = new Date(n.date);
                    const month = d.toLocaleString('en', { month: 'short' }).toUpperCase();
                    const day = d.getDate();
                    const itemHref = noticeListItemHref(n);
                    return (
                        <li key={n.id} className="flex gap-4 p-4 transition-colors hover:bg-muted/40">
                            <div className="w-14 shrink-0 rounded border border-border bg-muted py-2 text-center">
                                <span className="block text-[10px] font-semibold text-ink-faint">{month}</span>
                                <span className="block text-lg font-bold leading-none text-destructive">{day}</span>
                            </div>
                            <div className="min-w-0">
                                {itemHref ? (
                                    <Link
                                        href={itemHref}
                                        className="block font-medium text-foreground underline-offset-2 hover:text-civic hover:underline"
                                    >
                                        {n.title}
                                    </Link>
                                ) : (
                                    <span className="block font-medium text-foreground">{n.title}</span>
                                )}
                                <p className="mt-1 text-[11px] uppercase tracking-tight text-muted-foreground">
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

function CareerTimelineWidget({ memberName, subtitle, entries }) {
    return (
        <div className="rounded-xl bg-surface p-7 ring-1 ring-border md:p-8">
            <div className="mb-7">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-civic">Member Career Timeline</p>
                <h3 className="text-lg font-semibold tracking-tight">{memberName}</h3>
                {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <ol className="relative ml-2 space-y-9 border-l border-border pl-8">
                {entries.map((e, i) => (
                    <li key={i} className="relative">
                        <span
                            className={`absolute -left-[41px] top-1 size-4 rounded-full ring-4 ring-background ${
                                e.current ? 'bg-civic shadow-[0_0_0_2px_var(--gold)]' : 'bg-border'
                            }`}
                            aria-hidden
                        />
                        <span
                            className={`mb-1 block text-[10px] font-bold uppercase tracking-widest ${
                                e.current ? 'text-civic' : 'text-ink-faint'
                            }`}
                        >
                            {e.period}
                            {e.current && <span className="ml-2 text-gold">● Current</span>}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground">{e.title}</h4>
                        <p className="mt-1 text-pretty text-sm text-muted-foreground">{e.description}</p>
                    </li>
                ))}
            </ol>
        </div>
    );
}

function compareMembers(a, b, key, dir) {
    const av = a[key] ?? '';
    const bv = b[key] ?? '';
    let cmp = 0;
    if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
    } else {
        cmp = String(av).localeCompare(String(bv));
    }
    return dir === 'asc' ? cmp : -cmp;
}

const MEMBERS_GRID_SORT_OPTIONS = [
    { key: 'name', label: 'Name' },
    { key: 'designation', label: 'Designation' },
    { key: 'ward', label: 'Ward' },
    { key: 'termStart', label: 'Term Start' },
];

function electedGridMemberToViewModel(m, sessionLabel) {
    return {
        id: m.id,
        name: m.name,
        designation: m.designation,
        ward: m.ward,
        photoUrl: m.photo,
        status: 'active',
        termStart: m.termStart,
        termEnd: m.termEnd,
        sessionId: m.sessionId,
        sessionDisplay: sessionLabel ? `Session: ${sessionLabel}` : undefined,
    };
}

function MembersGridWidget({ title, sessionLabel, members }) {
    const [sortKey, setSortKey] = useState('designation');
    const [sortDir, setSortDir] = useState('asc');
    const [active, setActive] = useState(null);
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const sortMenuAnchorRef = useRef(null);

    const list = Array.isArray(members) ? members : [];

    const sorted = useMemo(
        () => [...list].sort((a, b) => compareMembers(a, b, sortKey, sortDir)),
        [list, sortKey, sortDir],
    );

    const pickSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setSortMenuOpen(false);
    };

    const activeLabel =
        MEMBERS_GRID_SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'Sort';

    if (list.length === 0) {
        return (
            <section className="rounded-xl bg-surface p-6 ring-1 ring-border md:p-7">
                <header className="mb-2">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-civic">
                        Elected Representatives
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
                </header>
                <p className="text-sm text-muted-foreground">
                    No active council members are published yet. Add members in the admin dashboard to show them
                    here.
                </p>
            </section>
        );
    }

    return (
        <section className="rounded-xl bg-surface p-6 ring-1 ring-border md:p-7">
            <header className="mb-6 flex flex-row items-start justify-between gap-3">
                <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-civic">
                        Elected Representatives
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">Session: {sessionLabel}</p>
                </div>

                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            if (sortMenuOpen) {
                                setSortMenuOpen(false);
                            } else {
                                sortMenuAnchorRef.current = e.currentTarget;
                                setSortMenuOpen(true);
                            }
                        }}
                        aria-haspopup="menu"
                        aria-expanded={sortMenuOpen}
                        aria-label={`Sort by ${activeLabel}, ${sortDir === 'asc' ? 'ascending' : 'descending'}`}
                        title={`Sort: ${activeLabel} (${sortDir})`}
                        className="inline-flex size-9 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border transition-colors hover:text-civic hover:ring-civic/50"
                    >
                        <ArrowDownUp className="size-4" />
                    </button>
                </div>
            </header>

            <ul
                className="grid gap-3 sm:gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
            >
                {sorted.map((m) => (
                    <li
                        key={m.id}
                        className="group overflow-hidden rounded-lg bg-background shadow-card ring-1 ring-border transition-all hover:shadow-card hover:ring-civic/40"
                    >
                        <div className="aspect-[4/5] overflow-hidden bg-muted">
                            <img
                                src={m.photo}
                                alt={m.name}
                                loading="lazy"
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                        </div>
                        <div className="p-3">
                            <button
                                type="button"
                                onClick={() => setActive(electedGridMemberToViewModel(m, sessionLabel))}
                                className="line-clamp-1 w-full rounded text-left text-sm font-semibold leading-tight text-foreground transition-colors hover:text-civic focus:outline-none focus-visible:ring-2 focus-visible:ring-civic"
                            >
                                {m.name}
                            </button>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-civic">
                                {m.designation}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>{m.ward ?? '—'}</span>
                                <span className="tabular-nums">
                                    {m.termStart}—{m.termEnd}
                                </span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <PortalMenu
                open={sortMenuOpen}
                anchorRef={sortMenuAnchorRef}
                onClose={() => setSortMenuOpen(false)}
                panelClassName="w-52"
            >
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
                    Sort by
                </p>
                {MEMBERS_GRID_SORT_OPTIONS.map((opt) => {
                    const isActive = sortKey === opt.key;
                    return (
                        <button
                            key={opt.key}
                            type="button"
                            role="menuitemradio"
                            aria-checked={isActive}
                            onClick={() => pickSort(opt.key)}
                            className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${
                                isActive ? 'font-medium text-civic' : 'text-foreground'
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
                            {isActive ? (
                                sortDir === 'asc' ? (
                                    <ArrowUp className="size-3.5" />
                                ) : (
                                    <ArrowDown className="size-3.5" />
                                )
                            ) : null}
                        </button>
                    );
                })}
            </PortalMenu>

            <MemberViewModal member={active} onClose={() => setActive(null)} />
        </section>
    );
}

function NewsGridWidget({ items }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {items.map((n) => (
                <span key={n.id} className="group block cursor-not-allowed">
                    <div className="mb-3 overflow-hidden rounded-xl ring-1 ring-border">
                        <img
                            src={n.image}
                            alt=""
                            loading="lazy"
                            width={800}
                            height={600}
                            className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    </div>
                    <p className="mb-1 text-xs font-medium text-ink-faint">{n.date}</p>
                    <h4 className="text-sm font-semibold leading-snug text-foreground">{n.title}</h4>
                </span>
            ))}
        </div>
    );
}

export function MemberCardWidget({
    name,
    designation,
    photo,
    ward,
    quote,
    ctaLabel = 'View profile',
    message,
    showMessages = true,
    variant = 'default',
}) {
    const [open, setOpen] = useState(false);
    const allowMessage = showMessages !== false;
    const isSidebar = variant === 'sidebar';

    return (
        <>
            <div
                className={`overflow-hidden rounded-xl bg-surface ring-1 ring-border ${
                    isSidebar ? 'shadow-card' : ''
                }`}
            >
                <img
                    src={photo}
                    alt={name}
                    loading="lazy"
                    width={800}
                    height={1000}
                    className={
                        isSidebar
                            ? 'aspect-[3/4] max-h-52 w-full object-cover object-top'
                            : 'aspect-[4/5] w-full object-cover'
                    }
                />
                <div className={isSidebar ? 'p-4' : 'p-5'}>
                    <h3
                        className={`mb-1 font-semibold leading-tight text-foreground ${
                            isSidebar ? 'text-sm' : 'text-base'
                        }`}
                    >
                        {name}
                    </h3>
                    <p
                        className={`mb-3 font-medium uppercase tracking-wider text-civic ${
                            isSidebar ? 'text-[10px]' : 'text-xs'
                        }`}
                    >
                        {designation}
                        {ward && ` · ${ward}`}
                    </p>
                    {quote && allowMessage ? (
                        <p
                            className={`mb-4 text-pretty italic leading-relaxed text-muted-foreground ${
                                isSidebar ? 'text-[11px]' : 'text-xs'
                            }`}
                        >
                            &ldquo;{quote}&rdquo;
                        </p>
                    ) : null}
                    {allowMessage ? (
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className={`w-full rounded-lg bg-civic font-medium text-civic-foreground transition-colors hover:bg-civic/90 ${
                                isSidebar ? 'py-2 text-xs' : 'py-2 text-sm'
                            }`}
                        >
                            {ctaLabel}
                        </button>
                    ) : null}
                </div>
            </div>
            {allowMessage ? (
                <MayorMessageModal
                    open={open}
                    onClose={() => setOpen(false)}
                    name={name}
                    designation={designation}
                    photo={photo}
                    ward={ward}
                    quote={quote}
                    message={message}
                />
            ) : null}
        </>
    );
}

function ImageBlockWidget({ src = '', caption = '' }) {
    const url = String(src ?? '').trim();
    const cap = String(caption ?? '').trim();
    if (url === '') {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground ring-1 ring-border">
                <p>Add an image in the template editor to show this block on the public site.</p>
            </div>
        );
    }
    return (
        <figure className="overflow-hidden rounded-xl bg-surface ring-1 ring-border">
            <img
                src={url}
                alt={cap || ''}
                className="max-h-[min(28rem,70vh)] w-full object-cover object-center"
                loading="lazy"
            />
            {cap ? (
                <figcaption className="border-t border-border px-4 py-3 text-center font-bangla text-sm font-medium text-foreground">
                    {cap}
                </figcaption>
            ) : null}
        </figure>
    );
}

function PhotoGalleryWidget({ title = 'Photo gallery', items = [] }) {
    const list = (Array.isArray(items) ? items : []).filter(
        (it) => it && String(it.src ?? '').trim() !== '',
    );
    if (list.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground ring-1 ring-border">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">{title}</h3>
                <p>No photos in this gallery yet.</p>
            </div>
        );
    }
    return (
        <div className="rounded-xl bg-surface p-5 ring-1 ring-border">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                {title}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {list.map((it, i) => (
                    <figure
                        key={typeof it.id === 'string' ? it.id : `${i}-${String(it.src).slice(0, 48)}`}
                        className="overflow-hidden rounded-lg ring-1 ring-border"
                    >
                        {it.src ? (
                            <img
                                src={it.src}
                                alt={it.caption ?? ''}
                                className="aspect-[4/3] w-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex aspect-[4/3] items-center justify-center bg-muted text-xs text-muted-foreground">
                                Image
                            </div>
                        )}
                        {it.caption ? (
                            <figcaption className="px-2 py-1.5 text-[11px] text-muted-foreground">
                                {it.caption}
                            </figcaption>
                        ) : null}
                    </figure>
                ))}
            </div>
        </div>
    );
}

function CustomHtmlWidget({ html = '' }) {
    if (!html?.trim()) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                Empty custom HTML block
            </div>
        );
    }
    return (
        <div
            className="rounded-xl bg-surface p-5 text-sm leading-relaxed text-foreground ring-1 ring-border [&_a]:text-civic [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function ContentWidget({ title, bodyHtml, body, attachments = [] }) {
    const files = Array.isArray(attachments) ? attachments : [];
    const hasMain =
        (bodyHtml && String(bodyHtml).trim() !== '') ||
        (body && String(body).trim() !== '');
    return (
        <div className="rounded-xl bg-surface p-5 ring-1 ring-border">
            {title ? (
                <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                    {title}
                </h3>
            ) : null}
            {bodyHtml?.trim() ? (
                <div
                    className="prose prose-sm max-w-none text-foreground dark:prose-invert [&_a]:text-civic [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
            ) : body?.trim() ? (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {String(body)
                        .trim()
                        .split(/\n\n+/)
                        .map((para, i) => (
                            <p key={i} className="whitespace-pre-wrap">
                                {para}
                            </p>
                        ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No content yet.</p>
            )}
            {files.length > 0 ? (
                <div className={hasMain ? 'mt-6 border-t border-border pt-5' : ''}>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                        Files
                    </p>
                    <ul className="space-y-2.5">
                        {files.map((f, i) => (
                            <li key={i}>
                                {f.url ? (
                                    <a
                                        href={f.url}
                                        className="group flex items-start gap-2.5 text-sm text-civic hover:underline"
                                        {...(String(f.url).startsWith('http')
                                            ? { target: '_blank', rel: 'noopener noreferrer' }
                                            : {})}
                                    >
                                        <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-civic" />
                                        <span>
                                            <span className="font-medium text-foreground">
                                                {f.label || 'Download'}
                                            </span>
                                            {f.size ? (
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    ({f.size})
                                                </span>
                                            ) : null}
                                        </span>
                                    </a>
                                ) : (
                                    <span className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <FileText className="mt-0.5 size-4 shrink-0" />
                                        {f.label || 'Attachment'}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}

function TenderListWidget({ title, items, variant = 'default' }) {
    const isBanner = variant === 'banner';
    return (
        <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-border">
            {isBanner ? (
                <div className="flex items-center justify-between border-b-2 border-accent bg-civic px-5 py-3">
                    <div className="flex items-center gap-2.5">
                        <span className="h-4 w-1 rounded-full bg-accent" />
                        <h3 className="text-sm font-semibold tracking-wide text-civic-foreground">{title}</h3>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-civic-foreground/80">
                        All
                        <ArrowRight className="size-3" />
                    </span>
                </div>
            ) : (
                <div className="px-5 py-3">
                    <h3 className="text-sm font-semibold">{title}</h3>
                </div>
            )}
            <div className={isBanner ? 'space-y-4 p-5' : 'space-y-4 px-5 pb-5'}>
                {items.map((t) => (
                    <div key={t.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="mb-1 flex items-center gap-2">
                            <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                    t.status === 'closed' ? 'bg-muted text-muted-foreground' : 'bg-civic-muted text-civic'
                                }`}
                            >
                                {t.status ?? 'open'}
                            </span>
                            <p className="text-[11px] text-ink-faint">{t.ref}</p>
                        </div>
                        <span className="block text-sm font-medium leading-tight text-foreground">{t.title}</span>
                        <p className="mt-1 text-[11px] text-muted-foreground">Deadline: {t.deadline}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HomepageWidgetRenderer({ widget }) {
    const w = widget.styling?.className ?? '';
    let content = null;
    switch (widget.type) {
        case 'nav-services':
            content = <NavServicesWidget {...widget.data} />;
            break;
        case 'hotline':
            content = <HotlineWidget {...widget.data} />;
            break;
        case 'hero':
            content = <HeroWidget {...widget.data} />;
            break;
        case 'notice-list':
            content = <NoticeListWidget {...widget.data} />;
            break;
        case 'tender-list':
            content = <TenderListWidget {...widget.data} />;
            break;
        case 'member-card':
            content = <MemberCardWidget {...widget.data} />;
            break;
        case 'career-timeline':
            content = <CareerTimelineWidget {...widget.data} />;
            break;
        case 'members-grid':
            content = <MembersGridWidget {...widget.data} />;
            break;
        case 'news-grid':
            content = <NewsGridWidget {...widget.data} />;
            break;
        case 'quick-links':
            content = <QuickLinksWidget {...widget.data} />;
            break;
        case 'photo-gallery':
            content = <PhotoGalleryWidget {...widget.data} />;
            break;
        case 'image':
            content = <ImageBlockWidget {...widget.data} />;
            break;
        case 'custom-html':
            content = <CustomHtmlWidget {...widget.data} />;
            break;
        case 'content':
            content = <ContentWidget {...widget.data} />;
            break;
        default:
            content = null;
    }
    if (!w) return content;
    return <div className={w}>{content}</div>;
}

export function HomepageWidgetZone({ widgets, className = '' }) {
    return (
        <div className={`flex flex-col gap-7 ${className}`}>
            {widgets.map((widget, i) => (
                <HomepageWidgetRenderer key={i} widget={widget} />
            ))}
        </div>
    );
}

const asideSticky =
    'lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto lg:pr-1 no-scrollbar';

/**
 * @param {object} props
 * @param {Array<{ position?: string }>} props.widgets
 * @param {'full'|'content-right'|'content-left'|'three-column'} [props.columnLayout]
 */
export function PublicHomepageColumns({ widgets, columnLayout = 'three-column' }) {
    const left = useMemo(() => widgets.filter((w) => w.position === 'left'), [widgets]);
    const main = useMemo(() => widgets.filter((w) => w.position === 'main'), [widgets]);
    const right = useMemo(() => widgets.filter((w) => w.position === 'right'), [widgets]);

    const wrap = (inner) => (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">{inner}</div>
    );

    if (columnLayout === 'full') {
        return wrap(
            <div className="mx-auto max-w-3xl">
                <HomepageWidgetZone widgets={main} />
            </div>,
        );
    }

    if (columnLayout === 'content-right') {
        return wrap(
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                <section className="order-1 min-w-0 lg:col-span-8">
                    <HomepageWidgetZone widgets={main} />
                </section>
                <aside
                    className={`order-2 lg:col-span-4 ${asideSticky}`}
                >
                    <HomepageWidgetZone widgets={right} />
                </aside>
            </div>,
        );
    }

    if (columnLayout === 'content-left') {
        return wrap(
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                <aside
                    className={`order-2 lg:order-1 lg:col-span-4 ${asideSticky}`}
                >
                    <HomepageWidgetZone widgets={left} />
                </aside>
                <section className="order-1 min-w-0 lg:order-2 lg:col-span-8">
                    <HomepageWidgetZone widgets={main} />
                </section>
            </div>,
        );
    }

    return wrap(
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            <aside
                className={`order-2 lg:order-1 lg:col-span-3 ${asideSticky}`}
            >
                <HomepageWidgetZone widgets={left} />
            </aside>
            <section className="order-1 min-w-0 lg:order-2 lg:col-span-6">
                <HomepageWidgetZone widgets={main} />
            </section>
            <aside className={`order-3 lg:col-span-3 ${asideSticky}`}>
                <HomepageWidgetZone widgets={right} />
            </aside>
        </div>,
    );
}
