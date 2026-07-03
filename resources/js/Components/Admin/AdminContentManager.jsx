import Modal from '@/Components/Modal';
import PortalMenu from '@/Components/Admin/PortalMenu';
import { TablePaginationBar } from '@/Components/Admin/TablePaginationBar';
import { Link } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    FileText,
    Globe,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    Upload,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { usePagedList } from '@/hooks/usePagedList';

const REF_MAX_BYTES = 5 * 1024 * 1024;

function readRefFile(file) {
    return new Promise((resolve, reject) => {
        if (file.size > REF_MAX_BYTES) {
            reject(
                new Error(
                    `"${file.name}" is over ${REF_MAX_BYTES / (1024 * 1024)} MB.`,
                ),
            );
            return;
        }
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const base = {
            id,
            name: file.name,
            size: file.size,
            mime: file.type || 'application/octet-stream',
            dataUrl: null,
        };
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    ...base,
                    dataUrl:
                        typeof reader.result === 'string'
                            ? reader.result
                            : null,
                });
            };
            reader.onerror = () =>
                reject(new Error(`Could not read "${file.name}".`));
            reader.readAsDataURL(file);
        } else {
            resolve(base);
        }
    });
}

const kindParam = (kind) =>
    kind === 'Page' ? 'page' : kind === 'Service' ? 'service' : 'notice';

const labelOf = (kind) =>
    kind === 'Page' ? 'Pages' : kind === 'Service' ? 'Services' : 'Notices';

const descOf = (kind) =>
    kind === 'Page'
        ? 'Static content pages — about, history, council, contact, etc.'
        : kind === 'Service'
          ? 'Citizen services — applications, certificates, fees, procedures.'
          : 'Public notices, tenders and circulars.';

const categoryLabel = (kind) => (kind === 'Notice' ? 'Department' : 'Category');

/**
 * @param {{ kind: 'Page'|'Service'|'Notice', initial: object[], categories: string[], hideToolbar?: boolean, referenceUploads?: boolean }} props
 */
export default function AdminContentManager({
    kind,
    initial,
    categories,
    hideToolbar = false,
    referenceUploads = false,
}) {
    const [items, setItems] = useState(() =>
        initial.map((row) => ({ ...row, template: row.template ?? 'default' })),
    );
    const [q, setQ] = useState('');
    const [fStatus, setFStatus] = useState('all');
    const [fCategory, setFCategory] = useState('all');
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [rowMenuId, setRowMenuId] = useState(null);
    const rowMenuAnchorRef = useRef(null);
    const [referenceFiles, setReferenceFiles] = useState([]);
    const refInputRef = useRef(null);

    const filtered = useMemo(
        () =>
            items.filter((p) => {
                const matchQ = `${p.title} ${p.slug} ${p.excerpt}`
                    .toLowerCase()
                    .includes(q.toLowerCase());
                const matchS = fStatus === 'all' || p.status === fStatus;
                const matchC = fCategory === 'all' || p.category === fCategory;
                return matchQ && matchS && matchC;
            }),
        [items, q, fStatus, fCategory],
    );

    const filterResetKey = useMemo(
        () => [q, fStatus, fCategory].join('|'),
        [q, fStatus, fCategory],
    );

    const {
        paged: pagedItems,
        page,
        setPage,
        perPage,
        setPerPage,
        total: filteredTotal,
        totalPages,
        from,
        to,
    } = usePagedList(filtered, filterResetKey);

    const rowMenuRow = useMemo(
        () => filtered.find((p) => p.id === rowMenuId) ?? null,
        [filtered, rowMenuId],
    );

    const togglePublish = (item) => {
        setItems((prev) =>
            prev.map((p) =>
                p.id === item.id
                    ? {
                          ...p,
                          status:
                              p.status === 'published'
                                  ? 'draft'
                                  : 'published',
                          updatedAt: new Date()
                              .toISOString()
                              .slice(0, 10),
                      }
                    : p,
            ),
        );
    };

    const remove = () => {
        if (!confirmDelete) {
            return;
        }
        setItems((prev) => prev.filter((p) => p.id !== confirmDelete.id));
        setConfirmDelete(null);
    };

    const onReferenceFiles = async (e) => {
        const files = [...(e.target.files ?? [])];
        e.target.value = '';
        const added = [];
        for (const f of files) {
            try {
                added.push(await readRefFile(f));
            } catch (err) {
                window.alert(
                    err instanceof Error ? err.message : 'Could not add file.',
                );
            }
        }
        if (added.length) {
            setReferenceFiles((prev) => [...prev, ...added]);
        }
    };

    const removeReferenceFile = (id) =>
        setReferenceFiles((prev) => prev.filter((f) => f.id !== id));

    const catLabel = categoryLabel(kind);

    return (
        <div className="space-y-6">
            {!hideToolbar && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {labelOf(kind)}
                        </h1>
                        <p className="text-sm text-slate-500">{descOf(kind)}</p>
                    </div>
                    <Link
                        href={route('admin.content.edit', {
                            kind: kindParam(kind),
                            id: 'new',
                        })}
                        className="inline-flex items-center gap-2 rounded-lg bg-civic px-4 py-2 text-sm font-semibold text-civic-foreground shadow-sm transition hover:bg-civic/90"
                    >
                        <Plus className="size-4" aria-hidden />
                        New {kind.toLowerCase()}
                    </Link>
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search title, slug…"
                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                        />
                    </div>
                    <select
                        value={fCategory}
                        onChange={(e) => setFCategory(e.target.value)}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                    >
                        <option value="all">
                            {kind === 'Notice' ? 'All departments' : 'All categories'}
                        </option>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <select
                        value={fStatus}
                        onChange={(e) => setFStatus(e.target.value)}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                    >
                        <option value="all">All statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {referenceUploads && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Upload files
                            </h2>
                            <p className="mt-1 max-w-2xl text-xs text-slate-500">
                                Attach PDFs, images or forms for your records
                                (e.g. sample applications). Files stay in this
                                browser until a server upload is connected.
                            </p>
                        </div>
                        <div>
                            <input
                                ref={refInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/jpeg,image/png,image/webp,image/gif"
                                onChange={onReferenceFiles}
                            />
                            <button
                                type="button"
                                onClick={() => refInputRef.current?.click()}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                            >
                                <Upload className="size-4" aria-hidden />
                                Choose files
                            </button>
                        </div>
                    </div>
                    {referenceFiles.length > 0 ? (
                        <ul className="mt-4 space-y-2">
                            {referenceFiles.map((f) => (
                                <li
                                    key={f.id}
                                    className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
                                >
                                    {f.dataUrl ? (
                                        <img
                                            src={f.dataUrl}
                                            alt=""
                                            className="size-9 shrink-0 rounded object-cover ring-1 ring-slate-200"
                                        />
                                    ) : (
                                        <div className="grid size-9 shrink-0 place-items-center rounded bg-white text-slate-500 ring-1 ring-slate-200">
                                            <FileText className="size-4" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-slate-900">
                                            {f.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {(f.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeReferenceFile(f.id)
                                        }
                                        className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                        aria-label={`Remove ${f.name}`}
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-xs text-slate-500">
                            No files selected.
                        </p>
                    )}
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                    <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-left">
                        <tr>
                            <th className="px-4 py-3 font-medium text-slate-500">
                                Title
                            </th>
                            <th className="hidden px-4 py-3 font-medium text-slate-500 md:table-cell">
                                Slug
                            </th>
                            <th className="hidden px-4 py-3 font-medium text-slate-500 sm:table-cell">
                                {catLabel}
                            </th>
                            <th className="hidden px-4 py-3 font-medium text-slate-500 md:table-cell">
                                Template
                            </th>
                            <th className="px-4 py-3 font-medium text-slate-500">
                                Status
                            </th>
                            <th className="hidden px-4 py-3 font-medium text-slate-500 lg:table-cell">
                                Updated
                            </th>
                            <th className="w-12 px-4 py-3 text-right font-medium text-slate-500">
                                ·
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pagedItems.map((p, rowIdx) => (
                            <tr
                                key={p.id}
                                className={`hover:bg-slate-50/80 ${rowIdx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                            >
                                <td className="px-4 py-3">
                                    <Link
                                        href={route('admin.content.edit', {
                                            kind: kindParam(kind),
                                            id: p.id,
                                        })}
                                        className="group block text-left"
                                    >
                                        <span className="flex items-center gap-2 font-medium text-slate-900 transition group-hover:text-civic">
                                            <FileText
                                                className="size-4 shrink-0 text-slate-400"
                                                aria-hidden
                                            />
                                            {p.title}
                                        </span>
                                        <span className="line-clamp-1 text-xs text-slate-500">
                                            {p.excerpt}
                                        </span>
                                    </Link>
                                </td>
                                <td className="hidden px-4 py-3 font-mono text-xs text-slate-500 md:table-cell">
                                    {p.slug}
                                </td>
                                <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                                    {p.category}
                                </td>
                                <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                                    {p.template}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => togglePublish(p)}
                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                            p.status === 'published'
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                : 'border-slate-200 bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {p.status === 'published' ? (
                                            <Globe className="size-3" />
                                        ) : (
                                            <EyeOff className="size-3" />
                                        )}
                                        {p.status}
                                    </button>
                                </td>
                                <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">
                                    {p.updatedAt}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            if (rowMenuId === p.id) {
                                                setRowMenuId(null);
                                            } else {
                                                rowMenuAnchorRef.current =
                                                    e.currentTarget;
                                                setRowMenuId(p.id);
                                            }
                                        }}
                                        className="rounded p-1 text-slate-500 hover:bg-slate-100"
                                        aria-label="Row actions"
                                        aria-expanded={rowMenuId === p.id}
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
                    <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
                        No items match your filters.
                    </p>
                )}
            </div>

            <PortalMenu
                open={rowMenuId != null && rowMenuRow != null}
                anchorRef={rowMenuAnchorRef}
                onClose={() => setRowMenuId(null)}
                panelClassName="min-w-[10rem] w-44"
            >
                {rowMenuRow ? (
                    <>
                        <Link
                            href={route('admin.content.edit', {
                                kind: kindParam(kind),
                                id: rowMenuRow.id,
                            })}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setRowMenuId(null)}
                        >
                            <Pencil className="size-3.5" aria-hidden />
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                togglePublish(rowMenuRow);
                                setRowMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                            {rowMenuRow.status === 'published' ? (
                                <EyeOff className="size-3.5" aria-hidden />
                            ) : (
                                <Eye className="size-3.5" aria-hidden />
                            )}
                            {rowMenuRow.status === 'published'
                                ? 'Unpublish'
                                : 'Publish'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setConfirmDelete(rowMenuRow);
                                setRowMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="size-3.5" aria-hidden />
                            Delete
                        </button>
                    </>
                ) : null}
            </PortalMenu>

            <Modal
                show={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                maxWidth="md"
                variant="admin"
            >
                <div className="p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-slate-100">
                        Delete {kind}?
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        This removes “{confirmDelete?.title}” from the local
                        preview list only (no server delete yet).
                    </p>
                    <div className="mt-8 flex justify-end gap-2 border-t border-slate-600/50 pt-6">
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-xl border border-slate-500/80 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-sm transition hover:bg-slate-700/80"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={remove}
                            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-red-500/30 transition hover:bg-red-500"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
