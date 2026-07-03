import AddElectionMemberModal from '@/Components/Admin/AddElectionMemberModal';
import MemberViewModal from '@/Components/Admin/MemberViewModal';
import PortalMenu from '@/Components/Admin/PortalMenu';
import { TablePaginationBar } from '@/Components/Admin/TablePaginationBar';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ELECTIONS_BY_SESSION } from '@/data/adminDummyData';
import { useCmsCatalog, useMembersDirectory } from '@/hooks/useCmsCatalog';
import { usePagedList } from '@/hooks/usePagedList';
import { intUnique } from '@/utils/intUnique';
import { Head } from '@inertiajs/react';
import {
    Calendar,
    Globe,
    MoreHorizontal,
    Pencil,
    Plus,
    Save,
    Star,
    Trash2,
    UserPlus,
    Users,
    Vote,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'pabna_admin_elections_v1';

function cloneElections() {
    return structuredClone(ELECTIONS_BY_SESSION);
}

function loadElectionsState() {
    if (typeof sessionStorage === 'undefined') {
        return null;
    }
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            return parsed;
        }
    } catch {
        /* ignore */
    }
    return null;
}

function saveElectionsState(data) {
    if (typeof sessionStorage === 'undefined') {
        return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function rosterRowToMemberViewModel(m, sessionId, sessionLabel) {
    const status =
        typeof m.status === 'string' ? m.status.toLowerCase() : 'active';
    return {
        id: m.directoryId ?? m.id,
        name: m.name,
        designation: m.designation,
        ward: m.ward,
        photoUrl: m.photoUrl,
        phone: m.phone,
        email: m.email,
        status,
        sessionId,
        sessionDisplay: sessionLabel ? `Session: ${sessionLabel}` : undefined,
    };
}

export default function Elections() {
    const { sessions, designations } = useCmsCatalog();
    const membersDirectory = useMembersDirectory();
    const defaultSession =
        sessions.find((s) => s.current)?.id ?? sessions[0]?.id;

    const [elections, setElections] = useState(cloneElections);
    const [sessionId, setSessionId] = useState(defaultSession);
    const [memberModal, setMemberModal] = useState({
        open: false,
        mode: 'assign',
        editing: null,
    });
    const [editCat, setEditCat] = useState(null);
    const [addCatOpen, setAddCatOpen] = useState(false);
    const [catMenu, setCatMenu] = useState(null);
    const catMenuAnchorRef = useRef(null);
    const [rosterDetailMember, setRosterDetailMember] = useState(null);

    useEffect(() => {
        const loaded = loadElectionsState();
        if (loaded) {
            setElections(loaded);
        }
    }, []);

    const [electionForm, setElectionForm] = useState({
        open: false,
        mode: 'edit',
        createSessionId: null,
    });

    useEffect(() => {
        saveElectionsState(elections);
    }, [elections]);

    const election = elections[sessionId];

    const sessionsMissingElection = useMemo(
        () => sessions.filter((s) => !elections[s.id]),
        [elections, sessions],
    );

    const sessionIdsOrdered = useMemo(() => {
        const known = new Set(sessions.map((s) => s.id));
        const extras = Object.keys(elections).filter((id) => !known.has(id));
        extras.sort();
        return [...sessions.map((s) => s.id), ...extras];
    }, [elections, sessions]);

    const resolveSession = useCallback(
        (id) => {
            const fromList = sessions.find((s) => s.id === id);
            if (fromList) {
                return fromList;
            }
            const rec = elections[id];
            return {
                id,
                label: rec?.sessionLabel ?? id,
                current: false,
            };
        },
        [elections, sessions],
    );

    const electionRows = useMemo(
        () =>
            sessionIdsOrdered
                .filter((id) => elections[id])
                .map((id) => {
                    const e = elections[id];
                    const sess = resolveSession(id);
                    const seats =
                        e.categories?.reduce((sum, c) => sum + c.seats, 0) ?? 0;
                    const filled = e.members?.length ?? 0;
                    return {
                        id,
                        sessionLabel: sess.label,
                        title: e.title,
                        electionDate: e.electionDate,
                        seats,
                        filled,
                        current: Boolean(sess.current),
                    };
                }),
        [elections, resolveSession, sessionIdsOrdered],
    );

    const electionRowsResetKey = useMemo(
        () => electionRows.map((r) => r.id).join(','),
        [electionRows],
    );

    const {
        paged: pagedElectionRows,
        page: electionTablePage,
        setPage: setElectionTablePage,
        perPage: electionTablePerPage,
        setPerPage: setElectionTablePerPage,
        total: electionRowsTotal,
        totalPages: electionRowsTotalPages,
        from: electionRowsFrom,
        to: electionRowsTo,
    } = usePagedList(electionRows, electionRowsResetKey);

    useEffect(() => {
        if (!sessionIdsOrdered.length) {
            return;
        }
        if (!sessionIdsOrdered.includes(sessionId)) {
            const next =
                sessionIdsOrdered.find((id) => elections[id]) ?? sessionIdsOrdered[0];
            setSessionId(next);
        }
    }, [sessionIdsOrdered, sessionId, elections]);

    const session = resolveSession(sessionId);

    const catMenuCategory = useMemo(
        () =>
            election?.categories?.find((c) => c.designation === catMenu) ??
            null,
        [election, catMenu],
    );

    const updateElection = useCallback((patch) => {
        setElections((prev) => ({
            ...prev,
            [sessionId]: { ...prev[sessionId], ...patch },
        }));
    }, [sessionId]);

    const grouped = useMemo(() => {
        const m = {};
        for (const x of election?.members ?? []) {
            if (!m[x.designation]) {
                m[x.designation] = [];
            }
            m[x.designation].push(x);
        }
        return m;
    }, [election]);

    const openElectionFormEdit = () =>
        setElectionForm({ open: true, mode: 'edit', createSessionId: null });

    const openElectionFormCreate = (sid) => {
        setElectionForm({
            open: true,
            mode: 'create',
            createSessionId:
                typeof sid === 'string'
                    ? sid
                    : sessionsMissingElection[0]?.id ?? null,
        });
    };

    const initials = (n) =>
        n
            .split(/\s+/)
            .filter(Boolean)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

    const filledFor = (d) =>
        election?.members.filter((m) => m.designation === d).length ?? 0;

    const assignableDirectoryMembers = useMemo(() => {
        const directory = membersDirectory;
        const used = new Set(
            (election?.members ?? [])
                .map((m) => m.directoryId)
                .filter((id) => id != null),
        );
        return directory.filter(
            (m) => m.sessionId === sessionId && !used.has(m.id),
        );
    }, [election?.members, sessionId, membersDirectory]);

    const totalSeats =
        election?.categories.reduce((sum, c) => sum + c.seats, 0) ?? 0;
    const wardsCovered = election
        ? new Set(election.members.map((m) => m.ward).filter(Boolean)).size
        : 0;

    const closeElectionForm = () =>
        setElectionForm({
            open: false,
            mode: 'edit',
            createSessionId: null,
        });

    return (
        <AuthenticatedLayout>
            <Head title="Elections" />
            <div className="relative z-20 mx-auto w-full max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                            <Vote className="size-7 shrink-0 text-civic" />
                            Elections
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage election records, categories and elected
                            representatives.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => openElectionFormCreate()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                        >
                            <Plus className="size-4" aria-hidden />
                            New election
                        </button>
                        <Calendar
                            className="size-4 shrink-0 text-slate-400"
                            aria-hidden
                        />
                        <select
                            value={sessionIdsOrdered.includes(sessionId) ? sessionId : sessionIdsOrdered[0]}
                            onChange={(e) => {
                                setSessionId(e.target.value);
                                setCatMenu(null);
                            }}
                            className="h-10 min-w-[16rem] rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                        >
                            {sessionIdsOrdered.map((id) => {
                                const s = resolveSession(id);
                                return (
                                    <option key={id} value={id}>
                                        {s.label}
                                        {s.current ? ' ★' : ''}
                                        {!elections[id] ? ' (no record)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {electionRows.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3">Session / term</th>
                                    <th className="px-4 py-3">Election</th>
                                    <th className="px-4 py-3">Polling</th>
                                    <th className="hidden px-4 py-3 sm:table-cell">Seats</th>
                                    <th className="hidden px-4 py-3 md:table-cell">Filled</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white text-slate-800">
                                {pagedElectionRows.map((row, rowIdx) => (
                                    <tr
                                        key={row.id}
                                        className={
                                            row.id === sessionId
                                                ? 'bg-civic/5'
                                                : rowIdx % 2 === 1
                                                  ? 'bg-slate-50/40'
                                                  : ''
                                        }
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium">{row.sessionLabel}</span>
                                                {row.current ? (
                                                    <span className="rounded-full bg-civic px-2 py-0.5 text-[10px] font-semibold uppercase text-civic-foreground">
                                                        Current
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{row.title}</td>
                                        <td className="px-4 py-3 tabular-nums text-slate-600">{row.electionDate}</td>
                                        <td className="hidden px-4 py-3 tabular-nums sm:table-cell">{row.seats}</td>
                                        <td className="hidden px-4 py-3 tabular-nums md:table-cell">{row.filled}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-wrap justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSessionId(row.id);
                                                        setCatMenu(null);
                                                        document
                                                            .getElementById('election-editor')
                                                            ?.scrollIntoView({
                                                                behavior: 'smooth',
                                                                block: 'start',
                                                            });
                                                    }}
                                                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    Open editor
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSessionId(row.id);
                                                        setCatMenu(null);
                                                        setElectionForm({
                                                            open: true,
                                                            mode: 'edit',
                                                            createSessionId: null,
                                                        });
                                                    }}
                                                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    Edit details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        <TablePaginationBar
                            page={electionTablePage}
                            totalPages={electionRowsTotalPages}
                            total={electionRowsTotal}
                            from={electionRowsFrom}
                            to={electionRowsTo}
                            perPage={electionTablePerPage}
                            onPageChange={setElectionTablePage}
                            onPerPageChange={setElectionTablePerPage}
                        />
                    </div>
                ) : null}

                {!election ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                        <p className="text-sm font-medium text-slate-800">
                            No election record for this session yet.
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            Create an election to track seats, designation
                            categories and elected representatives.
                        </p>
                        <PrimaryButton
                            type="button"
                            variant="civic"
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold normal-case tracking-normal"
                            onClick={() => openElectionFormCreate(sessionId)}
                        >
                            <Plus className="size-4" />
                            New election
                        </PrimaryButton>
                    </div>
                ) : (
                    <>
                <div id="election-editor">
                {/* Overview card */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    {election.title}
                                </h2>
                                {session.current && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-civic px-2.5 py-0.5 text-xs font-semibold text-civic-foreground">
                                        <Star className="size-3" />
                                        Current
                                    </span>
                                )}
                            </div>
                            <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
                                <span>{session.label}</span>
                                <span>
                                    · Polling:{' '}
                                    <strong className="text-slate-900">
                                        {election.electionDate}
                                    </strong>
                                </span>
                                {election.oathDate ? (
                                    <span>
                                        · Oath:{' '}
                                        <strong className="text-slate-900">
                                            {election.oathDate}
                                        </strong>
                                    </span>
                                ) : null}
                            </p>
                            {election.notes ? (
                                <p className="text-xs text-slate-500">
                                    {election.notes}
                                </p>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            onClick={openElectionFormEdit}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            <Pencil className="size-3.5" />
                            Edit
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
                        {[
                            ['Total seats', totalSeats],
                            ['Filled', election.members.length],
                            ['Categories', election.categories.length],
                            ['Wards covered', wardsCovered],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="rounded-lg border border-slate-100 bg-slate-50/80 p-3"
                            >
                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                    {label}
                                </p>
                                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                                <Globe className="size-4 text-slate-500" />
                                Designation categories
                            </h2>
                            <p className="mt-0.5 text-sm text-slate-500">
                                How many seats are contested in this election,
                                per designation.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAddCatOpen(true)}
                            title="Add category"
                            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:self-auto"
                        >
                            <Plus className="size-4" aria-hidden />
                            Add
                        </button>
                    </div>
                    <div className="p-6">
                        {election.categories.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center">
                                <p className="text-sm text-slate-600">
                                    No categories defined. Add at least one (e.g.
                                    Mayor, Councilor).
                                </p>
                                <PrimaryButton
                                    type="button"
                                    variant="civic"
                                    className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold normal-case tracking-normal"
                                    onClick={() => setAddCatOpen(true)}
                                >
                                    <Plus className="size-4" aria-hidden />
                                    Add category
                                </PrimaryButton>
                            </div>
                        ) : (
                            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {election.categories.map((c) => {
                                    const filled = filledFor(c.designation);
                                    const pct =
                                        c.seats > 0
                                            ? Math.min(
                                                  100,
                                                  (filled / c.seats) * 100,
                                              )
                                            : 0;
                                    const complete = filled >= c.seats;
                                    return (
                                        <li
                                            key={c.designation}
                                            className="relative space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-slate-900">
                                                        {c.designation}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {filled} / {c.seats}{' '}
                                                        seats filled
                                                    </p>
                                                </div>
                                                <div className="shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (
                                                                catMenu ===
                                                                c.designation
                                                            ) {
                                                                setCatMenu(null);
                                                            } else {
                                                                catMenuAnchorRef.current =
                                                                    e.currentTarget;
                                                                setCatMenu(
                                                                    c.designation,
                                                                );
                                                            }
                                                        }}
                                                        className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-slate-800"
                                                        aria-label="More"
                                                        aria-expanded={
                                                            catMenu ===
                                                            c.designation
                                                        }
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                                                <div
                                                    className="h-full rounded-full bg-civic transition-all"
                                                    style={{
                                                        width: `${pct}%`,
                                                    }}
                                                />
                                            </div>
                                            {complete ? (
                                                <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                                    Complete
                                                </span>
                                            ) : (
                                                <span className="inline-flex w-fit rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                                    {c.seats - filled} open
                                                </span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Elected representatives */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                                <Users className="size-4 text-slate-500" />
                                Elected representatives
                            </h2>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Link directory members to seats for this session.
                                Profiles are not created on this screen.
                            </p>
                        </div>
                        <PrimaryButton
                            type="button"
                            variant="civic"
                            className="inline-flex items-center gap-2 self-start px-4 py-2.5 text-sm font-semibold normal-case tracking-normal sm:self-auto"
                            onClick={() =>
                                setMemberModal({
                                    open: true,
                                    mode: 'assign',
                                    editing: null,
                                })
                            }
                        >
                            <UserPlus className="size-4" />
                            Add to roster
                        </PrimaryButton>
                    </div>
                    <div className="space-y-6 p-6">
                        {election.categories.length === 0 && (
                            <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                                Define categories first, then add winners to
                                each.
                            </p>
                        )}
                        {election.categories.map((c) => {
                            const list = grouped[c.designation] ?? [];
                            return (
                                <div key={c.designation}>
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            {c.designation}
                                        </h3>
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                            {list.length} / {c.seats}
                                        </span>
                                    </div>
                                    {list.length === 0 ? (
                                        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-xs text-slate-500">
                                            No members added yet.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {list.map((m) => (
                                                <div
                                                    key={`${m.id}-${m.designation}-${m.ward}`}
                                                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm"
                                                >
                                                    {m.photoUrl ? (
                                                        <img
                                                            src={m.photoUrl}
                                                            alt=""
                                                            className="size-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                                                        />
                                                    ) : (
                                                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-civic/10 text-xs font-semibold text-civic">
                                                            {initials(m.name)}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setRosterDetailMember(
                                                                    rosterRowToMemberViewModel(
                                                                        m,
                                                                        election.sessionId,
                                                                        session.label,
                                                                    ),
                                                                )
                                                            }
                                                            className="truncate text-left text-sm font-medium text-slate-900 hover:text-civic hover:underline"
                                                        >
                                                            {m.name}
                                                        </button>
                                                        <p className="truncate text-xs text-slate-500">
                                                            {m.ward ?? '—'}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setMemberModal(
                                                                    {
                                                                        open: true,
                                                                        mode: 'edit',
                                                                        editing:
                                                                            m,
                                                                    },
                                                                )
                                                            }
                                                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                            aria-label="Edit"
                                                        >
                                                            <Pencil className="size-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateElection({
                                                                    members:
                                                                        election.members.filter(
                                                                            (
                                                                                x,
                                                                            ) =>
                                                                                x.id !==
                                                                                m.id,
                                                                        ),
                                                                })
                                                            }
                                                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                            aria-label="Remove"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                    <PortalMenu
                        open={catMenu != null && catMenuCategory != null}
                        anchorRef={catMenuAnchorRef}
                        onClose={() => setCatMenu(null)}
                        panelClassName="w-44"
                    >
                        {catMenuCategory ? (
                            <>
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                                    onClick={() => {
                                        setEditCat(catMenuCategory);
                                        setCatMenu(null);
                                    }}
                                >
                                    <Pencil className="size-3.5" aria-hidden />
                                    Edit seats
                                </button>
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        updateElection({
                                            categories:
                                                election.categories.filter(
                                                    (x) =>
                                                        x.designation !==
                                                        catMenuCategory.designation,
                                                ),
                                        });
                                        setCatMenu(null);
                                    }}
                                >
                                    <Trash2 className="size-3.5" aria-hidden />
                                    Remove
                                </button>
                            </>
                        ) : null}
                    </PortalMenu>
                    </div>
                    </>
                )}
            </div>

            <ElectionFormModal
                show={electionForm.open}
                mode={electionForm.mode}
                election={electionForm.mode === 'edit' ? election : null}
                missingSessions={sessionsMissingElection}
                createSessionId={electionForm.createSessionId}
                onClose={closeElectionForm}
                onSaveEdit={(patch) => {
                    updateElection(patch);
                    closeElectionForm();
                }}
                onSaveCreate={(record) => {
                    setElections((prev) => ({
                        ...prev,
                        [record.sessionId]: {
                            sessionId: record.sessionId,
                            ...(record.sessionLabel
                                ? { sessionLabel: record.sessionLabel }
                                : {}),
                            title: record.title,
                            electionDate: record.electionDate,
                            oathDate: record.oathDate,
                            notes: record.notes,
                            categories: [],
                            members: [],
                        },
                    }));
                    setSessionId(record.sessionId);
                    closeElectionForm();
                }}
            />

            {election ? (
                <>
                    <AddCategoryModal
                        show={addCatOpen}
                        existing={election.categories.map(
                            (x) => x.designation,
                        )}
                        onClose={() => setAddCatOpen(false)}
                        onSave={(cat) => {
                            updateElection({
                                categories: [
                                    ...election.categories,
                                    cat,
                                ],
                            });
                            setAddCatOpen(false);
                        }}
                    />

                    <EditCategoryModal
                        category={editCat}
                        onClose={() => setEditCat(null)}
                        onSave={(updated) => {
                            updateElection({
                                categories: election.categories.map(
                                    (c) =>
                                        c.designation ===
                                        editCat?.designation
                                            ? updated
                                            : c,
                                ),
                            });
                            setEditCat(null);
                        }}
                    />

                    <AddElectionMemberModal
                        show={memberModal.open}
                        mode={memberModal.mode}
                        editingMember={memberModal.editing}
                        categories={election.categories}
                        currentSessionId={sessionId}
                        sessionLabel={session.label}
                        directoryMembers={membersDirectory}
                        assignableDirectoryMembers={
                            assignableDirectoryMembers
                        }
                        onClose={() =>
                            setMemberModal({
                                open: false,
                                mode: 'assign',
                                editing: null,
                            })
                        }
                        onAssign={(row) => {
                            setElections((prev) => {
                                const cur = prev[sessionId];
                                if (!cur) {
                                    return prev;
                                }
                                const allIds = Object.values(prev).flatMap(
                                    (e) =>
                                        (e.members ?? []).map((x) => x.id),
                                );
                                const nid =
                                    (allIds.length
                                        ? Math.max(...allIds)
                                        : 0) + 1;
                                return {
                                    ...prev,
                                    [sessionId]: {
                                        ...cur,
                                        members: [
                                            ...cur.members,
                                            { ...row, id: nid },
                                        ],
                                    },
                                };
                            });
                            setMemberModal({
                                open: false,
                                mode: 'assign',
                                editing: null,
                            });
                        }}
                        onUpdate={(rosterId, patch) => {
                            updateElection({
                                members: election.members.map((x) =>
                                    x.id === rosterId ? { ...x, ...patch } : x,
                                ),
                            });
                            setMemberModal({
                                open: false,
                                mode: 'assign',
                                editing: null,
                            });
                        }}
                    />

                    <MemberViewModal
                        member={rosterDetailMember}
                        onClose={() => setRosterDetailMember(null)}
                    />
                </>
            ) : null}
        </AuthenticatedLayout>
    );
}

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function ElectionFormModal({
    show,
    mode,
    election,
    missingSessions,
    createSessionId,
    onClose,
    onSaveEdit,
    onSaveCreate,
}) {
    const [form, setForm] = useState({
        title: '',
        electionDate: '',
        oathDate: '',
        notes: '',
    });
    const [targetSessionId, setTargetSessionId] = useState(null);
    const [customSessionLabel, setCustomSessionLabel] = useState('');

    useEffect(() => {
        if (!show) {
            return;
        }
        if (mode === 'edit' && election) {
            setTargetSessionId(null);
            setCustomSessionLabel('');
            setForm({
                title: election.title,
                electionDate: election.electionDate,
                oathDate: election.oathDate ?? '',
                notes: election.notes ?? '',
            });
            return;
        }
        if (mode === 'create' && missingSessions?.length > 0) {
            const sid =
                createSessionId &&
                missingSessions.some((s) => s.id === createSessionId)
                    ? createSessionId
                    : missingSessions[0].id;
            const sess =
                missingSessions.find((s) => s.id === sid) ??
                missingSessions[0];
            setTargetSessionId(sid);
            setCustomSessionLabel('');
            setForm({
                title: `Election — ${sess.label}`,
                electionDate: todayIso(),
                oathDate: '',
                notes: '',
            });
            return;
        }
        if (mode === 'create') {
            setTargetSessionId(null);
            setCustomSessionLabel('New council term');
            setForm({
                title: 'New election',
                electionDate: todayIso(),
                oathDate: '',
                notes: '',
            });
        }
    }, [show, mode, election, missingSessions, createSessionId]);

    const handleSave = () => {
        if (!form.title.trim()) {
            return;
        }
        if (mode === 'edit') {
            if (!election) {
                return;
            }
            onSaveEdit({
                title: form.title.trim(),
                electionDate: form.electionDate,
                oathDate: form.oathDate || undefined,
                notes: form.notes || undefined,
            });
            return;
        }
        if (mode !== 'create') {
            return;
        }
        if (missingSessions?.length > 0) {
            const sid = targetSessionId ?? missingSessions[0]?.id;
            if (!sid) {
                return;
            }
            onSaveCreate({
                sessionId: sid,
                title: form.title.trim(),
                electionDate: form.electionDate,
                oathDate: form.oathDate || undefined,
                notes: form.notes || undefined,
            });
            return;
        }
        const label = customSessionLabel.trim();
        if (!label) {
            return;
        }
        const sessionId = `x-${intUnique()}`;
        onSaveCreate({
            sessionId,
            sessionLabel: label,
            title: form.title.trim(),
            electionDate: form.electionDate,
            oathDate: form.oathDate || undefined,
            notes: form.notes || undefined,
        });
    };

    const heading = mode === 'edit' ? 'Edit election' : 'Add election';

    const fieldClass =
        'mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/25';

    const dateInputClass =
        'w-full rounded-lg border border-border bg-background py-2 pl-3 pr-10 text-sm text-foreground shadow-sm focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/25';

    return (
        <Modal show={show} onClose={onClose} maxWidth="md" variant="default">
            <div className="p-6 text-foreground">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            {heading}
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {missingSessions?.length > 0
                                ? 'Pick a council session that does not have an election record yet.'
                                : 'All predefined sessions already have records. Enter a label for this new election period (e.g. 2030 — 2035).'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mt-5 space-y-4">
                    {mode === 'create' && missingSessions?.length > 0 ? (
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                Session *
                            </label>
                            <select
                                value={targetSessionId ?? ''}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    setTargetSessionId(id);
                                    const sess = missingSessions.find(
                                        (s) => s.id === id,
                                    );
                                    if (sess) {
                                        setForm((f) => ({
                                            ...f,
                                            title: `Election — ${sess.label}`,
                                        }));
                                    }
                                }}
                                className={fieldClass}
                            >
                                {missingSessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : null}

                    {mode === 'create' && (!missingSessions || missingSessions.length === 0) ? (
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                Council term label *
                            </label>
                            <input
                                type="text"
                                value={customSessionLabel}
                                onChange={(e) => setCustomSessionLabel(e.target.value)}
                                placeholder="e.g. 2030 — 2035 (7th Election)"
                                className={fieldClass}
                            />
                        </div>
                    ) : null}

                    <div>
                        <label className="text-sm font-medium text-foreground">
                            Election title *
                        </label>
                        <input
                            value={form.title}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, title: e.target.value }))
                            }
                            className={fieldClass}
                            placeholder="e.g. 6th Pourashava Election"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                Polling date
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type="date"
                                    value={form.electionDate}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            electionDate: e.target.value,
                                        }))
                                    }
                                    className={dateInputClass}
                                />
                                <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                Oath date
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type="date"
                                    value={form.oathDate}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            oathDate: e.target.value,
                                        }))
                                    }
                                    className={dateInputClass}
                                />
                                <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground">
                            Notes
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, notes: e.target.value }))
                            }
                            rows={3}
                            placeholder="Optional"
                            className={`${fieldClass} resize-y`}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/80"
                    >
                        Cancel
                    </button>
                    <PrimaryButton
                        type="button"
                        variant="civic"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm normal-case"
                        onClick={handleSave}
                    >
                        <Save className="size-4" />
                        Save
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}

function AddCategoryModal({ show, existing, onClose, onSave }) {
    const { designations } = useCmsCatalog();
    const available = designations.filter((d) => !existing.includes(d));
    const [designation, setDesignation] = useState(available[0] ?? '');
    const [seats, setSeats] = useState(1);

    useEffect(() => {
        if (!show) {
            return;
        }
        const av = designations.filter((d) => !existing.includes(d));
        setDesignation(av[0] ?? '');
        setSeats(1);
    }, [show, existing.join('|'), designations]);

    const handleSubmit = () => {
        if (!designation) {
            return;
        }
        onSave({ designation, seats: Math.max(1, seats) });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md" variant="default">
            <div className="p-0 text-foreground">
                <div className="flex items-start justify-between gap-3 border-b border-border px-6 pb-4 pt-6">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-foreground">
                            Add category
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pick a designation and how many seats it has in this
                            election.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="px-6 py-5">
                    {available.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            All designations are already added. Manage the master
                            list in Settings.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="add-cat-designation"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Designation
                                </label>
                                <select
                                    id="add-cat-designation"
                                    value={designation}
                                    onChange={(e) =>
                                        setDesignation(e.target.value)
                                    }
                                    className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/25"
                                >
                                    {available.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="add-cat-seats"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Number of seats
                                </label>
                                <input
                                    id="add-cat-seats"
                                    type="number"
                                    min={1}
                                    value={seats}
                                    onChange={(e) =>
                                        setSeats(
                                            Math.max(
                                                1,
                                                Number(e.target.value) || 1,
                                            ),
                                        )
                                    }
                                    className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/25"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/80"
                    >
                        Cancel
                    </button>
                    <PrimaryButton
                        type="button"
                        variant="civic"
                        disabled={!designation || available.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold normal-case tracking-normal"
                        onClick={handleSubmit}
                    >
                        <Plus className="size-4" aria-hidden />
                        Add
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}

function EditCategoryModal({ category, onClose, onSave }) {
    const [seats, setSeats] = useState(1);
    useEffect(() => {
        if (category) {
            setSeats(category.seats);
        }
    }, [category]);

    return (
        <Modal
            show={!!category}
            onClose={onClose}
            maxWidth="sm"
            variant="default"
        >
            <div className="p-0 text-foreground">
                <div className="flex items-start justify-between gap-3 border-b border-border px-6 pb-4 pt-6">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-foreground">
                            {category?.designation}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update the number of seats.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                <div className="px-6 py-5">
                    <label
                        htmlFor="edit-cat-seats"
                        className="text-sm font-medium text-foreground"
                    >
                        Seats
                    </label>
                    <input
                        id="edit-cat-seats"
                        type="number"
                        min={1}
                        value={seats}
                        onChange={(e) =>
                            setSeats(
                                Math.max(1, Number(e.target.value) || 1),
                            )
                        }
                        className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm focus:border-civic focus:outline-none focus:ring-2 focus:ring-civic/25"
                    />
                </div>
                <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/80"
                    >
                        Cancel
                    </button>
                    <PrimaryButton
                        type="button"
                        variant="civic"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold normal-case tracking-normal"
                        onClick={() => {
                            if (category) {
                                onSave({ ...category, seats });
                            }
                        }}
                    >
                        <Save className="size-4" />
                        Save
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
