import { DEFAULT_MEMBER_PHOTO_URL } from '@/constants/defaultMemberPhoto';
import { useCmsCatalog } from '@/hooks/useCmsCatalog';
import {
    Award,
    Calendar,
    ChevronDown,
    Clock,
    Mail,
    MapPin,
    Phone,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * @param {object|null} props.member — directory row or elected-card view model
 *   (id, name, designation, ward, sessionId?, phone?, email?, status?, photoUrl?, party?,
 *   termStart?, termEnd?, sessionDisplay?)
 * @param {() => void} props.onClose
 */
export default function MemberViewModal({ member, onClose }) {
    const { sessions } = useCmsCatalog();
    const [showTimeline, setShowTimeline] = useState(true);

    useEffect(() => {
        if (!member) {
            return undefined;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [member]);

    const sessionYears = useMemo(() => {
        if (!member) {
            return { start: 2020, end: 2025 };
        }
        const ts = member.termStart;
        const te = member.termEnd;
        if (ts != null && te != null) {
            const start = Number(ts);
            const end = Number(te);
            if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
                return { start, end };
            }
        }
        const label =
            sessions.find((s) => s.id === member.sessionId)?.label ?? '';
        const m = label.match(/(\d{4})\s*[—-]\s*(\d{4})/);
        if (m) {
            return {
                start: parseInt(m[1], 10),
                end: parseInt(m[2], 10),
            };
        }
        return { start: 2020, end: 2025 };
    }, [member, sessions]);

    const timeline = useMemo(() => {
        if (!member) {
            return [];
        }
        const { start: termStart, end: termEnd } = sessionYears;
        const t1Start = termStart - 10;
        const t1End = termStart - 5;
        const t2Start = termStart - 5;
        const t2End = termStart;
        return [
            {
                period: `${termStart}–${termEnd}`,
                title: `${member.designation}${member.ward ? ` · ${member.ward}` : ''}`,
                description:
                    'Currently serving the citizens with focus on digital governance, drainage, and ward-level public hearings.',
                current: true,
            },
            {
                period: `${t2Start}–${t2End}`,
                title: `Councilor · ${member.ward ?? 'Ward'}`,
                description:
                    'Led road resurfacing, street-light expansion, and a community waste-management pilot.',
            },
            {
                period: `${t1Start}–${t1End}`,
                title: 'Ward Committee Member',
                description:
                    'Active in local welfare programs, education outreach, and youth sports development.',
            },
        ];
    }, [member, sessionYears]);

    if (!member) {
        return null;
    }

    const tenureYears = Math.max(1, sessionYears.end - sessionYears.start);
    const sessionLabelForBio =
        member.sessionDisplay?.trim() ||
        sessions.find((s) => s.id === member.sessionId)?.label ||
        member.sessionId ||
        `${sessionYears.start} — ${sessionYears.end}`;
    const first = member.name.split(/\s+/).filter(Boolean)[0] ?? member.name;
    const emailTrim = member.email?.trim() ?? '';
    const phoneTrim = member.phone?.trim() ?? '';
    const hasRealContact = Boolean(emailTrim || phoneTrim);

    /** Portal escapes sticky columns so overlay stacks above public nav (z-40). */
    const overlay = (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-detail-title"
            className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
        >
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm"
            />
            <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-background shadow-elevated ring-1 ring-border sm:max-h-[88vh] sm:rounded-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-background/90 ring-1 ring-border backdrop-blur transition-colors hover:bg-surface"
                >
                    <X className="size-4 text-foreground" />
                </button>

                <div className="grid flex-1 grid-cols-1 overflow-hidden sm:grid-cols-[200px_1fr]">
                    <div className="flex items-center gap-4 border-b border-border bg-civic/5 p-5 sm:flex-col sm:items-start sm:border-b-0 sm:border-r">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl ring-2 ring-gold/30 sm:size-auto sm:w-full sm:aspect-[4/5]">
                            <img
                                src={member.photoUrl || DEFAULT_MEMBER_PHOTO_URL}
                                alt=""
                                className="size-full object-cover sm:h-full sm:min-h-[140px]"
                            />
                        </div>
                        <div className="min-w-0 sm:mt-2">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-civic">
                                Elected Representative
                            </p>
                            <h2
                                id="member-detail-title"
                                className="text-lg font-semibold leading-tight text-foreground sm:text-xl"
                            >
                                {member.name}
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {member.designation}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5 overflow-y-auto p-5 sm:p-7">
                        <div className="grid grid-cols-2 gap-3">
                            <InfoTile
                                icon={<Award className="size-4" />}
                                label="Designation"
                                value={member.designation}
                            />
                            <InfoTile
                                icon={<MapPin className="size-4" />}
                                label="Ward"
                                value={member.ward ?? '—'}
                            />
                            <InfoTile
                                icon={<Calendar className="size-4" />}
                                label="Term"
                                value={`${sessionYears.start} – ${sessionYears.end}`}
                            />
                            <InfoTile
                                icon={<Clock className="size-4" />}
                                label="Tenure"
                                value={`${tenureYears} years`}
                            />
                        </div>

                        {member.party ? (
                            <div className="rounded-lg bg-surface p-4 ring-1 ring-border">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
                                    Affiliation
                                </p>
                                <p className="text-sm text-foreground">
                                    {member.party}
                                </p>
                            </div>
                        ) : null}

                        <div>
                            <h3 className="mb-2 text-sm font-semibold text-foreground">
                                Biography
                            </h3>
                            <p className="text-pretty text-sm leading-relaxed text-foreground/85">
                                {member.name} serves the citizens of{' '}
                                {member.ward ?? 'Pabna Pourashava'} as{' '}
                                {member.designation}. Associated with the session{' '}
                                <strong>{sessionLabelForBio}</strong> ({sessionYears.start}
                                –{sessionYears.end}), {first} is committed to transparent
                                governance, improved civic amenities, and active
                                engagement with residents through ward-level meetings
                                and grievance hearings.
                            </p>
                        </div>

                        {hasRealContact ? (
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-foreground">
                                    Contact
                                </h3>
                                <div className="grid gap-2 text-sm sm:grid-cols-2">
                                    {emailTrim ? (
                                        <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 ring-1 ring-border">
                                            <Mail className="size-4 shrink-0 text-civic" />
                                            <span className="truncate text-xs text-foreground">
                                                {emailTrim}
                                            </span>
                                        </div>
                                    ) : null}
                                    {phoneTrim ? (
                                        <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 ring-1 ring-border">
                                            <Phone className="size-4 shrink-0 text-civic" />
                                            <span className="text-xs text-foreground">
                                                {phoneTrim}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}

                        <div className="border-t border-border pt-4">
                            <button
                                type="button"
                                onClick={() => setShowTimeline((v) => !v)}
                                aria-expanded={showTimeline}
                                className="flex w-full items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2.5 text-left ring-1 ring-border transition-colors hover:ring-civic/40"
                            >
                                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Clock className="size-4 text-civic" />
                                    Career Timeline
                                    <span className="text-xs font-normal text-muted-foreground">
                                        ({timeline.length} terms)
                                    </span>
                                </span>
                                <ChevronDown
                                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                                        showTimeline ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {showTimeline ? (
                                <ol className="relative ml-2 mt-4 space-y-5 border-l-2 border-civic/20 pl-5">
                                    {timeline.map((e, i) => (
                                        <li key={i} className="relative">
                                            <span
                                                className={`absolute -left-[26px] top-1.5 size-3 rounded-full ring-4 ring-background ${
                                                    e.current
                                                        ? 'bg-gold'
                                                        : 'bg-civic/60'
                                                }`}
                                            />
                                            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-civic">
                                                {e.period}
                                                {e.current ? (
                                                    <span className="ml-2 inline-block rounded bg-gold px-1.5 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wider text-gold-foreground">
                                                        Current
                                                    </span>
                                                ) : null}
                                            </p>
                                            <p className="text-sm font-semibold leading-tight text-foreground">
                                                {e.title}
                                            </p>
                                            <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">
                                                {e.description}
                                            </p>
                                        </li>
                                    ))}
                                </ol>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined' || !document.body) {
        return overlay;
    }
    return createPortal(overlay, document.body);
}

function InfoTile({ icon, label, value }) {
    return (
        <div className="rounded-lg bg-surface p-3 ring-1 ring-border">
            <div className="mb-1 flex items-center gap-1.5 text-civic">
                {icon}
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {label}
                </span>
            </div>
            <p className="text-sm font-medium leading-tight text-foreground">
                {value}
            </p>
        </div>
    );
}
