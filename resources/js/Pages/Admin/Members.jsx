import CreateMemberModal from '@/Components/Admin/CreateMemberModal';
import MemberViewModal from '@/Components/Admin/MemberViewModal';
import PortalMenu from '@/Components/Admin/PortalMenu';
import { TablePaginationBar } from '@/Components/Admin/TablePaginationBar';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useCmsCatalog, useMembersDirectory } from '@/hooks/useCmsCatalog';
import { usePagedList } from '@/hooks/usePagedList';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function Members() {
    const page = usePage();
    const members = useMembersDirectory();
    const { designations, sessions, wards } = useCmsCatalog();
    const [addOpen, setAddOpen] = useState(false);
    const [editMember, setEditMember] = useState(null);
    const [detailMember, setDetailMember] = useState(null);
    const [memberRowMenu, setMemberRowMenu] = useState(null);
    const memberMenuAnchorRef = useRef(null);
    const [q, setQ] = useState('');
    const [fDesignation, setFDesignation] = useState('all');
    const [fWard, setFWard] = useState('all');
    const [fSession, setFSession] = useState('all');
    const [fStatus, setFStatus] = useState('all');

    useEffect(() => {
        const qs = page.url.includes('?')
            ? page.url.slice(page.url.indexOf('?') + 1)
            : '';
        const params = new URLSearchParams(qs);
        if (params.get('openAddMember') === '1') {
            setEditMember(null);
            setAddOpen(true);
            const clean = route('admin.members.index');
            if (typeof window !== 'undefined') {
                window.history.replaceState({}, '', clean);
            }
        }
    }, [page.url]);

    const filtered = useMemo(
        () =>
            members.filter((m) => {
                const mq = `${m.name} ${m.designation} ${m.ward ?? ''} ${m.email ?? ''}`
                    .toLowerCase()
                    .includes(q.toLowerCase());
                const md =
                    fDesignation === 'all' || m.designation === fDesignation;
                const mw = fWard === 'all' || m.ward === fWard;
                const ms = fSession === 'all' || m.sessionId === fSession;
                const mst = fStatus === 'all' || m.status === fStatus;
                return mq && md && mw && ms && mst;
            }),
        [members, q, fDesignation, fWard, fSession, fStatus],
    );

    const filterResetKey = useMemo(
        () => [q, fDesignation, fWard, fSession, fStatus].join('|'),
        [q, fDesignation, fWard, fSession, fStatus],
    );

    const {
        paged: pagedMembers,
        page: tablePage,
        setPage: setTablePage,
        perPage: tablePerPage,
        setPerPage: setTablePerPage,
        total: filteredTotal,
        totalPages,
        from,
        to,
    } = usePagedList(filtered, filterResetKey);

    const sessionLabel = useCallback(
        (id) => sessions?.find((s) => s.id === id)?.label ?? id,
        [sessions],
    );

    const initials = (n) =>
        n
            .split(/\s+/)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

    const handleUpsert = (row) => {
        const {
            id,
            photoFile,
            photoRemoved,
            photoUrl,
            party,
            ...fields
        } = row;

        const payload = { ...fields };
        if (party !== undefined) {
            payload.party = party;
        }

        let forceFormData = false;
        if (photoFile instanceof File) {
            payload.photo = photoFile;
            forceFormData = true;
        } else if (photoRemoved) {
            payload.photoUrl = '';
        } else if (photoUrl) {
            payload.photoUrl = photoUrl;
        }

        const options = {
            preserveScroll: true,
            forceFormData,
            onSuccess: () => {
                setAddOpen(false);
                setEditMember(null);
            },
            onError: (errors) => {
                const msg =
                    errors?.photo?.[0] ??
                    errors?.photoUrl?.[0] ??
                    'Could not save member. Try a smaller image (max 2.5 MB).';
                window.alert(msg);
            },
        };

        if (id != null) {
            router.post(
                route('admin.members.update', id),
                { _method: 'put', ...payload },
                options,
            );
            return;
        }

        router.post(route('admin.members.store'), payload, options);
    };

    const memberRowMenuTarget = useMemo(
        () => filtered.find((x) => x.id === memberRowMenu) ?? null,
        [filtered, memberRowMenu],
    );

    const desList = designations;
    const wardList = wards;
    const sessList = sessions;

    return (
        <AuthenticatedLayout>
            <Head title="Members" />
            <div className="relative z-20 mx-auto w-full max-w-6xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Members
                        </h1>
                        <p className="text-sm text-slate-500">
                            Mayor, councilors and election history. Configure
                            designations, wards and sessions in{' '}
                            <Link
                                href={route('profile.edit')}
                                className="font-medium text-civic hover:underline"
                            >
                                Settings
                            </Link>
                            .
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setEditMember(null);
                            setAddOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-civic px-4 py-2 text-sm font-semibold text-civic-foreground shadow-sm transition hover:bg-civic/90"
                    >
                        <Plus className="size-4" aria-hidden />
                        Add member
                    </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
                        <div className="relative lg:col-span-2">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search name, ward, email…"
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                            />
                        </div>
                        <select
                            value={fDesignation}
                            onChange={(e) => setFDesignation(e.target.value)}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                        >
                            <option value="all">All designations</option>
                            {desList.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                        <select
                            value={fWard}
                            onChange={(e) => setFWard(e.target.value)}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                        >
                            <option value="all">All wards</option>
                            {wardList.map((w) => (
                                <option key={w} value={w}>
                                    {w}
                                </option>
                            ))}
                        </select>
                        <select
                            value={fSession}
                            onChange={(e) => setFSession(e.target.value)}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                        >
                            <option value="all">All sessions</option>
                            {sessList.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={fStatus}
                            onChange={(e) => setFStatus(e.target.value)}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                        >
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="past">Past</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50 text-left shadow-sm">
                            <tr>
                                <th className="px-4 py-3 font-medium text-slate-500">
                                    Member
                                </th>
                                <th className="hidden px-4 py-3 font-medium text-slate-500 md:table-cell">
                                    Designation
                                </th>
                                <th className="hidden px-4 py-3 font-medium text-slate-500 lg:table-cell">
                                    Ward
                                </th>
                                <th className="hidden px-4 py-3 font-medium text-slate-500 sm:table-cell">
                                    Session
                                </th>
                                <th className="px-4 py-3 font-medium text-slate-500">
                                    Status
                                </th>
                                <th className="w-12 px-4 py-3 text-right font-medium text-slate-500">
                                    <span className="sr-only">Actions</span>
                                    ·
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pagedMembers.map((m, rowIdx) => (
                                <tr
                                    key={m.id}
                                    className={`hover:bg-slate-50/80 ${rowIdx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {m.photoUrl ? (
                                                <img
                                                    src={m.photoUrl}
                                                    alt=""
                                                    className="size-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                                                />
                                            ) : (
                                                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-civic/10 text-xs font-semibold text-civic">
                                                    {initials(m.name)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMemberRowMenu(null);
                                                        setDetailMember(m);
                                                    }}
                                                    className="text-left font-medium text-slate-900 hover:text-civic hover:underline"
                                                >
                                                    {m.name}
                                                </button>
                                                <div className="truncate text-xs text-slate-500">
                                                    {m.email ?? '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden px-4 py-3 text-slate-700 md:table-cell">
                                        {m.designation}
                                    </td>
                                    <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                                        {m.ward ?? '—'}
                                    </td>
                                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                                        {sessionLabel(m.sessionId)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                                                m.status === 'active'
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                    : 'border-slate-200 bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (memberRowMenu === m.id) {
                                                    setMemberRowMenu(null);
                                                } else {
                                                    memberMenuAnchorRef.current =
                                                        e.currentTarget;
                                                    setMemberRowMenu(m.id);
                                                }
                                            }}
                                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                            aria-label="Actions"
                                            aria-expanded={memberRowMenu === m.id}
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                    <TablePaginationBar
                        page={tablePage}
                        totalPages={totalPages}
                        total={filteredTotal}
                        from={from}
                        to={to}
                        perPage={tablePerPage}
                        onPageChange={setTablePage}
                        onPerPageChange={setTablePerPage}
                    />
                    {filtered.length === 0 && (
                        <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
                            No members match your filters.
                        </p>
                    )}
                </div>
            </div>

            <PortalMenu
                open={memberRowMenu != null && memberRowMenuTarget != null}
                anchorRef={memberMenuAnchorRef}
                onClose={() => setMemberRowMenu(null)}
                panelClassName="w-44"
            >
                {memberRowMenuTarget ? (
                    <>
                        <button
                            type="button"
                            className="flex w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                                setDetailMember(memberRowMenuTarget);
                                setMemberRowMenu(null);
                            }}
                        >
                            View details
                        </button>
                        <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                                setAddOpen(false);
                                setEditMember(memberRowMenuTarget);
                                setMemberRowMenu(null);
                            }}
                        >
                            <Pencil className="size-3.5 text-slate-500" aria-hidden />
                            Edit member
                        </button>
                    </>
                ) : null}
            </PortalMenu>

            <MemberViewModal
                member={detailMember}
                onClose={() => setDetailMember(null)}
            />

            <CreateMemberModal
                show={addOpen || editMember != null}
                member={editMember}
                onClose={() => {
                    setAddOpen(false);
                    setEditMember(null);
                }}
                onSave={(row) => handleUpsert(row)}
            />
        </AuthenticatedLayout>
    );
}
