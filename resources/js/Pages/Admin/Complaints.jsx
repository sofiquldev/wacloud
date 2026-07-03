import Checkbox from '@/Components/Checkbox';
import Modal from '@/Components/Modal';
import { TablePaginationBar } from '@/Components/Admin/TablePaginationBar';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { COMPLAINTS_SEED } from '@/data/adminDummyData';
import { useCmsCatalog } from '@/hooks/useCmsCatalog';
import { usePagedList } from '@/hooks/usePagedList';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Clock,
    Droplets,
    Inbox,
    MapPin,
    MessageSquare,
    Paperclip,
    Search,
    Send,
    UserRound,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function StatCard({ icon: Icon, label, value, tone }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
                <Icon className={`size-4 ${tone}`} />
                <span className="text-xs font-medium uppercase tracking-wide">
                    {label}
                </span>
            </div>
            <p className={`mt-2 text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
        </div>
    );
}

export default function Complaints() {
    const { complaintCategories, complaintWards } = useCmsCatalog();
    const [tab, setTab] = useState('all');
    const [q, setQ] = useState('');
    const [category, setCategory] = useState('All');
    const [ward, setWard] = useState('All');
    const [anon, setAnon] = useState(true);
    const [revealed, setRevealed] = useState(() => new Set());
    const [active, setActive] = useState(null);

    const toggleReveal = (id) => {
        setRevealed((prev) => {
            const n = new Set(prev);
            if (n.has(id)) {
                n.delete(id);
            } else {
                n.add(id);
            }
            return n;
        });
    };

    const filtered = useMemo(() => {
        return COMPLAINTS_SEED.filter((c) => {
            if (tab !== 'all' && c.status !== tab) {
                return false;
            }
            if (category !== 'All' && c.category !== category) {
                return false;
            }
            if (ward !== 'All' && c.ward !== ward) {
                return false;
            }
            if (q) {
                const s = q.toLowerCase();
                if (
                    !c.subject.toLowerCase().includes(s) &&
                    !c.id.toLowerCase().includes(s) &&
                    !c.name.toLowerCase().includes(s)
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [tab, category, ward, q]);

    const filterResetKey = useMemo(
        () => [tab, category, ward, q].join('|'),
        [tab, category, ward, q],
    );

    const {
        paged: pagedComplaints,
        page,
        setPage,
        perPage,
        setPerPage,
        total: filteredTotal,
        totalPages,
        from,
        to,
    } = usePagedList(filtered, filterResetKey);

    const counts = useMemo(
        () => ({
            total: COMPLAINTS_SEED.length,
            new: COMPLAINTS_SEED.filter((c) => c.status === 'new').length,
            progress: COMPLAINTS_SEED.filter((c) => c.status === 'in-progress')
                .length,
            resolved: COMPLAINTS_SEED.filter((c) => c.status === 'resolved')
                .length,
        }),
        [],
    );

    const statusClass = {
        new: 'border-red-200 bg-red-50 text-red-800',
        'in-progress': 'border-amber-200 bg-amber-50 text-amber-900',
        resolved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    };

    const priorityClass = {
        high: 'text-red-700',
        medium: 'text-amber-700',
        low: 'text-emerald-700',
    };

    const [respondDraft, setRespondDraft] = useState('');
    const [markStatus, setMarkStatus] = useState('new');

    useEffect(() => {
        if (active) {
            setRespondDraft('');
            setMarkStatus(active.status);
        }
    }, [active?.id]);

    const modalReporterVisible = !anon || (active && revealed.has(active.id));

    const tabBtn = (id, label) => (
        <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                tab === id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
            }`}
        >
            {label}
        </button>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Complaints" />
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Complaint Inbox
                        </h1>
                        <p className="text-sm text-slate-500">
                            Citizen reports — privacy protected by default.
                        </p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                        <Checkbox
                            checked={anon}
                            onChange={(e) => setAnon(e.target.checked)}
                            className="rounded border-slate-300 text-civic focus:ring-civic/30"
                        />
                        Anonymous mode
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard
                        icon={Inbox}
                        label="Total"
                        value={counts.total}
                        tone="text-slate-700"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="New"
                        value={counts.new}
                        tone="text-red-600"
                    />
                    <StatCard
                        icon={Clock}
                        label="In progress"
                        value={counts.progress}
                        tone="text-amber-600"
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Resolved"
                        value={counts.resolved}
                        tone="text-emerald-600"
                    />
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="inline-flex rounded-lg bg-slate-200/90 p-1">
                        {tabBtn('all', 'All')}
                        {tabBtn('new', 'New')}
                        {tabBtn('in-progress', 'In progress')}
                        {tabBtn('resolved', 'Resolved')}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search…"
                                className="h-10 w-[220px] rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                            />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                        >
                            {complaintCategories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <select
                            value={ward}
                            onChange={(e) => setWard(e.target.value)}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                        >
                            {complaintWards.map((w) => (
                                <option key={w} value={w}>
                                    {w}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50 text-left shadow-sm">
                            <tr>
                                <th className="px-4 py-3 font-medium text-slate-500">
                                    Subject
                                </th>
                                <th className="hidden px-4 py-3 font-medium text-slate-500 md:table-cell">
                                    ID
                                </th>
                                <th className="hidden px-4 py-3 font-medium text-slate-500 lg:table-cell">
                                    Reporter
                                </th>
                                <th className="hidden px-4 py-3 font-medium text-slate-500 sm:table-cell">
                                    Category
                                </th>
                                <th className="hidden px-4 py-3 font-medium text-slate-500 lg:table-cell">
                                    Ward
                                </th>
                                <th className="px-4 py-3 font-medium text-slate-500">
                                    Priority
                                </th>
                                <th className="px-4 py-3 font-medium text-slate-500">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pagedComplaints.map((c, rowIdx) => {
                                const show = !anon || revealed.has(c.id);
                                return (
                                    <tr
                                        key={c.id}
                                        className={`cursor-pointer hover:bg-slate-50/80 ${rowIdx % 2 === 1 ? 'bg-slate-50/40' : ''}`}
                                        onClick={() => setActive(c)}
                                    >
                                        <td className="max-w-[320px] px-4 py-3">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                                <div className="min-w-0">
                                                    <div className="font-medium text-slate-900">
                                                        {c.subject}
                                                    </div>
                                                    <div className="line-clamp-1 text-xs text-slate-500">
                                                        {c.detail}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden px-4 py-3 font-mono text-xs text-slate-500 md:table-cell">
                                            {c.id}
                                        </td>
                                        <td className="hidden px-4 py-3 lg:table-cell">
                                            <div
                                                className={`max-w-[160px] truncate text-sm ${!show ? 'blur-sm select-none' : ''}`}
                                            >
                                                {c.name}
                                            </div>
                                            {anon && (
                                                <button
                                                    type="button"
                                                    className="mt-1 text-xs font-medium text-civic hover:underline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleReveal(c.id);
                                                    }}
                                                >
                                                    {show ? 'Mask' : 'Reveal'}
                                                </button>
                                            )}
                                        </td>
                                        <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                                            {c.category}
                                        </td>
                                        <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                                            {c.ward}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-xs font-semibold uppercase ${priorityClass[c.priority]}`}
                                            >
                                                {c.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusClass[c.status]}`}
                                            >
                                                {c.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                    <TablePaginationBar
                        page={page}
                        totalPages={totalPages}
                        total={filteredTotal}
                        from={from}
                        to={to}
                        perPage={perPage}
                        onPageChange={setPage}
                        onPerPageChange={setPerPage}
                    />
                    {filtered.length === 0 && (
                        <p className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-500">
                            No complaints match your filters.
                        </p>
                    )}
                </div>
            </div>

            <Modal
                show={!!active}
                onClose={() => setActive(null)}
                maxWidth="6xl"
                variant="default"
            >
                {active && (
                    <div className="flex max-h-[min(90vh,880px)] flex-col overflow-hidden rounded-xl bg-white text-slate-900 dark:bg-white dark:text-slate-900">
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-sm font-medium text-slate-600">
                                        {active.id}
                                    </span>
                                    <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-rose-800">
                                        {active.status.replace('-', ' ')}
                                    </span>
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                                            active.priority === 'high'
                                                ? 'bg-red-100 text-red-800'
                                                : active.priority === 'medium'
                                                  ? 'bg-amber-100 text-amber-900'
                                                  : 'bg-emerald-100 text-emerald-800'
                                        }`}
                                    >
                                        {active.priority}
                                    </span>
                                </div>
                                <h2 className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
                                    {active.subject}
                                </h2>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <span className="hidden items-center gap-1.5 text-sm text-slate-500 sm:inline-flex">
                                    <Clock className="size-4 shrink-0" />
                                    {active.when}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setActive(null)}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                    aria-label="Close"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-slate-100 overflow-y-auto lg:grid-cols-12 lg:divide-x lg:divide-y-0">
                            <div className="flex flex-col lg:col-span-8">
                                <section className="border-b border-slate-100 px-5 py-5 sm:px-6">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Description
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                                        {active.detail}
                                    </p>
                                </section>
                                <section className="border-b border-slate-100 px-5 py-5 sm:px-6">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Activity
                                    </h3>
                                    <div className="relative mt-4 pl-5">
                                        <span
                                            className="absolute left-0 top-1.5 size-2.5 rounded-full border-2 border-white bg-emerald-500 shadow ring-1 ring-emerald-600/20"
                                            aria-hidden
                                        />
                                        <p className="text-sm font-medium text-slate-900">
                                            Complaint submitted
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Citizen · {active.when}
                                        </p>
                                    </div>
                                </section>
                                <section className="flex flex-1 flex-col px-5 py-5 sm:px-6">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Respond
                                    </h3>
                                    <textarea
                                        value={respondDraft}
                                        onChange={(e) =>
                                            setRespondDraft(e.target.value)
                                        }
                                        rows={5}
                                        placeholder="Write a public response or internal note…"
                                        className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                                    />
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                                        >
                                            <Paperclip className="size-4 text-slate-500" />
                                            Attach
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="relative">
                                                <select
                                                    value={markStatus}
                                                    onChange={(e) =>
                                                        setMarkStatus(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-10 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-800 shadow-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                                                >
                                                    <option value="new">
                                                        Mark as new
                                                    </option>
                                                    <option value="in-progress">
                                                        Mark as in progress
                                                    </option>
                                                    <option value="resolved">
                                                        Mark as resolved
                                                    </option>
                                                </select>
                                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                            </div>
                                            <button
                                                type="button"
                                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1a4731] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#143728] focus:outline-none focus:ring-2 focus:ring-[#1a4731]/40 focus:ring-offset-2"
                                            >
                                                <Send className="size-4" />
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside className="flex flex-col bg-slate-50/90 lg:col-span-4">
                                <div className="flex-1 space-y-6 px-5 py-5 sm:px-6">
                                    <div>
                                        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                            Details
                                        </h3>
                                        <ul className="mt-4 space-y-4 text-sm">
                                            <li className="flex items-start justify-between gap-3">
                                                <span className="text-slate-500">
                                                    Status
                                                </span>
                                                <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold capitalize text-rose-800">
                                                    {active.status.replace(
                                                        '-',
                                                        ' ',
                                                    )}
                                                </span>
                                            </li>
                                            <li className="flex items-start justify-between gap-3">
                                                <span className="text-slate-500">
                                                    Priority
                                                </span>
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                                                        active.priority ===
                                                        'high'
                                                            ? 'bg-red-100 text-red-800'
                                                            : active.priority ===
                                                                'medium'
                                                              ? 'bg-amber-100 text-amber-900'
                                                              : 'bg-emerald-100 text-emerald-800'
                                                    }`}
                                                >
                                                    {active.priority}
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                {active.category ===
                                                'Drainage' ? (
                                                    <Droplets className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                                ) : active.category ===
                                                  'Electricity' ? (
                                                    <Zap className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                                ) : (
                                                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-slate-500">
                                                        Category
                                                    </p>
                                                    <p className="font-medium text-slate-900">
                                                        {active.category}
                                                    </p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-slate-500">
                                                        Ward
                                                    </p>
                                                    <p className="font-medium text-slate-900">
                                                        {active.ward}
                                                    </p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <UserRound className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-slate-500">
                                                        Assignee
                                                    </p>
                                                    <p className="font-medium text-slate-900">
                                                        {active.assignee ??
                                                            'Unassigned'}
                                                    </p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="border-t border-slate-200/80 pt-6">
                                        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                            Reporter
                                        </h3>
                                        <dl className="mt-4 space-y-3 text-sm">
                                            <div>
                                                <dt className="text-xs text-slate-500">
                                                    Name
                                                </dt>
                                                <dd
                                                    className={`mt-0.5 font-medium text-slate-900 ${!modalReporterVisible ? 'blur-sm select-none' : ''}`}
                                                >
                                                    {active.name}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-slate-500">
                                                    Phone
                                                </dt>
                                                <dd
                                                    className={`mt-0.5 font-medium text-slate-900 ${!modalReporterVisible ? 'blur-sm select-none' : ''}`}
                                                >
                                                    {active.phone}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-slate-500">
                                                    Email
                                                </dt>
                                                <dd
                                                    className={`mt-0.5 font-medium text-slate-900 ${!modalReporterVisible ? 'blur-sm select-none' : ''}`}
                                                >
                                                    {active.email ?? '—'}
                                                </dd>
                                            </div>
                                        </dl>
                                        {anon && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleReveal(active.id)
                                                }
                                                className="mt-3 text-xs font-medium text-civic hover:underline"
                                            >
                                                {modalReporterVisible
                                                    ? 'Mask reporter'
                                                    : 'Reveal reporter'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="border-t border-slate-200/80 p-4 sm:p-5">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
                                    >
                                        <Users className="size-4 text-slate-500" />
                                        Reassign
                                    </button>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
