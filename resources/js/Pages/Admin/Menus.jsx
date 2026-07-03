import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Head, router, usePage } from '@inertiajs/react';
import { intUnique } from '@/utils/intUnique';
import {
    ChevronDown,
    ChevronUp,
    GripVertical,
    ListTree,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const MENU_DND_TYPE = 'menu-item';

function droppableParentCid(droppableId) {
    if (droppableId === 'root') {
        return null;
    }
    if (droppableId.startsWith('children:')) {
        return droppableId.slice('children:'.length);
    }
    return null;
}

/** Remove node with `cid` from tree; returns new tree root list and removed node, or removed=null. */
function extractNodeFromList(list, cid) {
    const i = list.findIndex((n) => n.cid === cid);
    if (i !== -1) {
        const copy = [...list];
        const [removed] = copy.splice(i, 1);
        return { list: copy, removed };
    }
    for (let j = 0; j < list.length; j += 1) {
        const n = list[j];
        if (!n.children?.length) {
            continue;
        }
        const sub = extractNodeFromList(n.children, cid);
        if (sub.removed) {
            const copy = [...list];
            copy[j] = { ...n, children: sub.list };
            return { list: copy, removed: sub.removed };
        }
    }
    return { list: [...list], removed: null };
}

/** True if `targetCid` appears anywhere under `subtree` (including root of subtree). */
function subtreeContainsCid(subtree, targetCid) {
    if (subtree.cid === targetCid) {
        return true;
    }
    for (const c of subtree.children || []) {
        if (subtreeContainsCid(c, targetCid)) {
            return true;
        }
    }
    return false;
}

/** Cannot drop under self or own descendant. */
function isInvalidNest(dragged, newParentCid) {
    if (newParentCid == null) {
        return false;
    }
    if (newParentCid === dragged.cid) {
        return true;
    }
    return subtreeContainsCid(dragged, newParentCid);
}

function insertNodeAtParent(tree, parentCid, index, node) {
    const insertCopy = { ...node, children: node.children ? [...node.children] : [] };
    if (parentCid == null) {
        const next = [...tree];
        next.splice(index, 0, insertCopy);
        return next;
    }
    return tree.map((n) => {
        if (n.cid === parentCid) {
            const ch = [...(n.children || [])];
            ch.splice(index, 0, insertCopy);
            return { ...n, children: ch };
        }
        if (n.children?.length) {
            return { ...n, children: insertNodeAtParent(n.children, parentCid, index, node) };
        }
        return n;
    });
}

function applyMenuTreeDrag(tree, result) {
    const { draggableId, source, destination } = result;
    if (!destination) {
        return tree;
    }
    if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
    ) {
        return tree;
    }

    const dragged = (function find(nodes, cid) {
        for (const n of nodes) {
            if (n.cid === cid) {
                return n;
            }
            if (n.children?.length) {
                const inner = find(n.children, cid);
                if (inner) {
                    return inner;
                }
            }
        }
        return null;
    })(tree, draggableId);

    if (!dragged) {
        return tree;
    }

    const destParentCid = droppableParentCid(destination.droppableId);
    if (isInvalidNest(dragged, destParentCid)) {
        return tree;
    }

    const { list: without, removed } = extractNodeFromList(tree, draggableId);
    if (!removed) {
        return tree;
    }

    let insertIndex = destination.index;
    if (source.droppableId === destination.droppableId && source.index < destination.index) {
        insertIndex -= 1;
    }

    return insertNodeAtParent(without, destParentCid, insertIndex, removed);
}

function attachCids(items) {
    return (items ?? []).map((n) => ({
        ...n,
        cid: intUnique(),
        children: n.children?.length ? attachCids(n.children) : [],
    }));
}

function toPayload(nodes) {
    return nodes.map(({ cid, ...row }) => ({
        label: row.label,
        linkType: row.linkType,
        pageSlug: row.pageSlug ?? null,
        serviceSlug: row.serviceSlug ?? null,
        systemKey: row.systemKey ?? null,
        customUrl: row.customUrl ?? null,
        openNewTab: Boolean(row.openNewTab),
        children: row.children?.length ? toPayload(row.children) : [],
    }));
}

function newRow(partial = {}) {
    return {
        cid: intUnique(),
        label: 'New item',
        linkType: 'page',
        pageSlug: 'about',
        serviceSlug: null,
        systemKey: null,
        customUrl: null,
        openNewTab: false,
        children: [],
        ...partial,
    };
}

function moveSibling(nodes, cid, delta) {
    const walk = (list) => {
        const i = list.findIndex((n) => n.cid === cid);
        if (i !== -1) {
            const j = i + delta;
            if (j < 0 || j >= list.length) {
                return list;
            }
            const copy = [...list];
            [copy[i], copy[j]] = [copy[j], copy[i]];
            return copy;
        }
        return list.map((n) =>
            n.children?.length ? { ...n, children: walk(n.children) } : n,
        );
    };
    return walk(nodes);
}

function deleteByCid(nodes, cid) {
    return nodes
        .filter((n) => n.cid !== cid)
        .map((n) =>
            n.children?.length ? { ...n, children: deleteByCid(n.children, cid) } : n,
        );
}

function appendChild(nodes, parentCid, child) {
    return nodes.map((n) => {
        if (n.cid === parentCid) {
            return { ...n, children: [...(n.children || []), child] };
        }
        if (n.children?.length) {
            return { ...n, children: appendChild(n.children, parentCid, child) };
        }
        return n;
    });
}

function updateByCid(nodes, cid, patch) {
    return nodes.map((n) => {
        if (n.cid === cid) {
            return { ...n, ...patch };
        }
        if (n.children?.length) {
            return { ...n, children: updateByCid(n.children, cid, patch) };
        }
        return n;
    });
}

function linkTypeLabel(t) {
    switch (t) {
        case 'page':
            return 'Page';
        case 'system':
            return 'System';
        case 'service':
            return 'Service';
        case 'custom':
            return 'Custom URL';
        case 'section':
            return 'Nested group';
        default:
            return t;
    }
}

function RowSummary({ row }) {
    const bits = [linkTypeLabel(row.linkType)];
    if (row.linkType === 'page' && row.pageSlug) {
        bits.push(`/${row.pageSlug}`);
    }
    if (row.linkType === 'service' && row.serviceSlug) {
        bits.push(row.serviceSlug);
    }
    if (row.linkType === 'system' && row.systemKey) {
        bits.push(row.systemKey);
    }
    if (row.linkType === 'custom' && row.customUrl) {
        bits.push(row.customUrl);
    }
    if (row.children?.length) {
        bits.push(`${row.children.length} nested`);
    }
    return <span className="text-xs leading-snug text-muted-foreground">{bits.join(' · ')}</span>;
}

function ItemEditorForm({ draft, pages, services, systemOptions, onChange }) {
    const set = (patch) => onChange({ ...draft, ...patch });

    return (
        <div className="space-y-4 p-6">
            <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Label
                </label>
                <input
                    type="text"
                    value={draft.label}
                    onChange={(e) => set({ label: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                />
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Link type
                </label>
                <select
                    value={draft.linkType}
                    onChange={(e) => {
                        const linkType = e.target.value;
                        const next = { linkType };
                        if (linkType === 'page') {
                            next.pageSlug = draft.pageSlug || pages[0]?.slug || null;
                            next.serviceSlug = null;
                            next.systemKey = null;
                            next.customUrl = null;
                        }
                        if (linkType === 'service') {
                            next.serviceSlug = draft.serviceSlug || services[0]?.slug || null;
                            next.pageSlug = null;
                            next.systemKey = null;
                            next.customUrl = null;
                        }
                        if (linkType === 'system') {
                            next.systemKey = draft.systemKey || systemOptions[0]?.key || null;
                            next.pageSlug = null;
                            next.serviceSlug = null;
                            next.customUrl = null;
                        }
                        if (linkType === 'custom') {
                            next.customUrl = draft.customUrl || '/';
                            next.pageSlug = null;
                            next.serviceSlug = null;
                            next.systemKey = null;
                        }
                        if (linkType === 'section') {
                            next.pageSlug = null;
                            next.serviceSlug = null;
                            next.systemKey = null;
                            next.customUrl = null;
                        }
                        set(next);
                    }}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                >
                    <option value="page">Existing page</option>
                    <option value="system">System destination</option>
                    <option value="service">Service</option>
                    <option value="custom">Custom link</option>
                    <option value="section">Nested group (no link)</option>
                </select>
            </div>

            {draft.linkType === 'page' ? (
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Page
                    </label>
                    <select
                        value={draft.pageSlug ?? ''}
                        onChange={(e) => set({ pageSlug: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        {pages.map((p) => (
                            <option key={p.slug} value={p.slug}>
                                {p.title}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}

            {draft.linkType === 'service' ? (
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Service
                    </label>
                    <select
                        value={draft.serviceSlug ?? ''}
                        onChange={(e) => set({ serviceSlug: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        {services.map((s) => (
                            <option key={s.slug} value={s.slug}>
                                {s.title}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}

            {draft.linkType === 'system' ? (
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        System page
                    </label>
                    <select
                        value={draft.systemKey ?? ''}
                        onChange={(e) => set({ systemKey: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                        {systemOptions.map((s) => (
                            <option key={s.key} value={s.key}>
                                {s.label}
                                {!s.implemented ? ' (placeholder)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}

            {draft.linkType === 'custom' ? (
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        URL
                    </label>
                    <input
                        type="text"
                        value={draft.customUrl ?? ''}
                        onChange={(e) => set({ customUrl: e.target.value })}
                        placeholder="https://… or /path"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                </div>
            ) : null}

            <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    checked={Boolean(draft.openNewTab)}
                    onChange={(e) => set({ openNewTab: e.target.checked })}
                    className="rounded border-slate-300 text-civic focus:ring-civic"
                />
                Open in new tab
            </label>
        </div>
    );
}

function MenuRow({
    row,
    depth,
    index,
    pages,
    services,
    systemOptions,
    onEdit,
    onDelete,
    onAddChild,
    onMove,
}) {
    const pad = 8 + depth * 12;
    const droppableId = `children:${row.cid}`;
    const childList = row.children ?? [];

    return (
        <Draggable draggableId={row.cid} index={index}>
            {(dragProvided, snapshot) => (
                <li
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className={`${
                        snapshot.isDragging
                            ? 'rounded-md bg-surface-elevated shadow-lg ring-2 ring-civic/35'
                            : 'bg-surface-elevated'
                    }`}
                    style={{
                        paddingLeft: `${pad}px`,
                        ...dragProvided.draggableProps.style,
                    }}
                >
                    <div className="flex flex-wrap items-center gap-1.5 py-2 pr-2 sm:gap-2 sm:pr-3">
                        <button
                            type="button"
                            title="Drag to reorder or nest under another item"
                            aria-label="Drag to reorder or nest"
                            {...dragProvided.dragHandleProps}
                            className="-ml-0.5 shrink-0 cursor-grab rounded p-1 text-muted-foreground touch-none hover:bg-muted hover:text-foreground active:cursor-grabbing"
                        >
                            <GripVertical className="size-4" />
                        </button>
                        <ListTree className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <div className="min-w-0 flex-1 py-0.5">
                            <p className="text-sm font-medium leading-tight text-foreground">{row.label}</p>
                            <RowSummary row={row} />
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-0.5">
                            <button
                                type="button"
                                title="Move up"
                                onClick={() => onMove(row.cid, -1)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <ChevronUp className="size-4" />
                            </button>
                            <button
                                type="button"
                                title="Move down"
                                onClick={() => onMove(row.cid, 1)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <ChevronDown className="size-4" />
                            </button>
                            <button
                                type="button"
                                title="Add nested item"
                                onClick={() => onAddChild(row.cid)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <Plus className="size-4" />
                            </button>
                            <button
                                type="button"
                                title="Edit"
                                onClick={() => onEdit(row.cid)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <Pencil className="size-4" />
                            </button>
                            <button
                                type="button"
                                title="Remove"
                                onClick={() => onDelete(row.cid)}
                                className="rounded p-1 text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    </div>
                    <Droppable droppableId={droppableId} type={MENU_DND_TYPE}>
                        {(dropProvided, dropSnapshot) => (
                            <ul
                                ref={dropProvided.innerRef}
                                {...dropProvided.droppableProps}
                                className={`divide-y divide-border border-t border-border bg-muted/30 ${
                                    childList.length === 0 ? 'min-h-10' : ''
                                } ${dropSnapshot.isDraggingOver ? 'bg-civic/5 ring-1 ring-inset ring-civic/20' : ''}`}
                            >
                                {childList.map((child, ci) => (
                                    <MenuRow
                                        key={child.cid}
                                        row={child}
                                        depth={depth + 1}
                                        index={ci}
                                        pages={pages}
                                        services={services}
                                        systemOptions={systemOptions}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onAddChild={onAddChild}
                                        onMove={onMove}
                                    />
                                ))}
                                {dropProvided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </li>
            )}
        </Draggable>
    );
}

export default function Menus({ items: initialItems, pages, services, systemOptions, storageWritable }) {
    const { errors, status } = usePage().props;
    const [tree, setTree] = useState(() => attachCids(initialItems));
    const [saving, setSaving] = useState(false);
    const [editor, setEditor] = useState(null);

    useEffect(() => {
        setTree(attachCids(initialItems));
    }, [initialItems]);

    const findRow = useCallback((nodes, cid) => {
        for (const n of nodes) {
            if (n.cid === cid) {
                return n;
            }
            if (n.children?.length) {
                const inner = findRow(n.children, cid);
                if (inner) {
                    return inner;
                }
            }
        }
        return null;
    }, []);

    const openEdit = (cid) => {
        const row = findRow(tree, cid);
        if (!row) {
            return;
        }
        setEditor({ mode: 'edit', cid, draft: structuredClone(row) });
    };

    const openAddChild = (parentCid) => {
        setEditor({
            mode: 'add-child',
            parentCid,
            draft: newRow({ linkType: 'page', label: 'New nested item' }),
        });
    };

    const openAddRoot = () => {
        setEditor({
            mode: 'add-root',
            draft: newRow({ linkType: 'page', label: 'New top-level item' }),
        });
    };

    const saveEditor = () => {
        if (!editor) {
            return;
        }
        const { draft } = editor;
        if (editor.mode === 'edit' && editor.cid) {
            setTree((t) => updateByCid(t, editor.cid, draft));
        } else if (editor.mode === 'add-child' && editor.parentCid) {
            const child = { ...draft, cid: intUnique(), children: draft.children || [] };
            setTree((t) => appendChild(t, editor.parentCid, child));
        } else if (editor.mode === 'add-root') {
            const row = { ...draft, cid: intUnique(), children: draft.children || [] };
            setTree((t) => [...t, row]);
        }
        setEditor(null);
    };

    const saveMenu = () => {
        setSaving(true);
        router.post(
            route('admin.menus.update'),
            { items: toPayload(tree) },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    const onMenuDragEnd = useCallback((result) => {
        setTree((t) => applyMenuTreeDrag(t, result));
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Main navigation" />
            <div className="mx-auto w-full max-w-4xl space-y-4">
                <header className="sticky top-0 z-20 -mx-px rounded-lg border border-border bg-surface-elevated/95 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                        <div className="min-w-0 flex-1 space-y-1">
                            <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                Main navigation
                            </h1>
                            <p className="text-sm leading-snug text-muted-foreground">
                                Drag the grip to reorder or drop onto a row&apos;s nested area to indent. Use arrows for
                                small moves at the same level.
                            </p>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                When the <code className="rounded border border-border bg-muted px-1 py-px font-mono text-[11px] text-foreground">cms_settings</code> table exists, the menu is stored under key{' '}
                                <code className="rounded border border-border bg-muted px-1 py-px font-mono text-[11px] text-foreground">nav_menu_document</code>
                                . Otherwise it is written to{' '}
                                <code className="rounded border border-border bg-muted px-1 py-px font-mono text-[11px] text-foreground">storage/app/nav_menu_header.json</code>
                                , with default fallback{' '}
                                <code className="rounded border border-border bg-muted px-1 py-px font-mono text-[11px] text-foreground">resources/data/nav_menu_header.json</code>
                                .
                            </p>
                        </div>
                        <div className="flex shrink-0 flex-row flex-wrap items-center gap-2 lg:justify-end">
                            <button
                                type="button"
                                onClick={openAddRoot}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                            >
                                <Plus className="size-4" />
                                Add top-level
                            </button>
                            <PrimaryButton type="button" disabled={saving} onClick={saveMenu}>
                                {saving ? 'Saving…' : 'Save menu'}
                            </PrimaryButton>
                        </div>
                    </div>
                </header>

                {!storageWritable ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <strong>storage/app</strong> is not writable by PHP — saves will fail until permissions are
                        fixed (e.g. chown/chmod for your web user).
                    </div>
                ) : null}

                {status ? (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                        {status}
                    </p>
                ) : null}

                {errors?.menu ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                        {errors.menu}
                    </p>
                ) : null}

                {Object.keys(errors || {}).filter((k) => k.startsWith('items')).length ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                        Please fix the highlighted fields and try again.
                    </p>
                ) : null}

                <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm">
                    <DragDropContext onDragEnd={onMenuDragEnd}>
                        <Droppable droppableId="root" type={MENU_DND_TYPE}>
                            {(provided) => (
                                <ul
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="divide-y divide-border"
                                >
                                    {tree.map((row, ri) => (
                                        <MenuRow
                                            key={row.cid}
                                            row={row}
                                            depth={0}
                                            index={ri}
                                            pages={pages}
                                            services={services}
                                            systemOptions={systemOptions}
                                            onEdit={openEdit}
                                            onDelete={(cid) => setTree((t) => deleteByCid(t, cid))}
                                            onAddChild={openAddChild}
                                            onMove={(cid, d) => setTree((t) => moveSibling(t, cid, d))}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                    {tree.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                            No items yet. Add a top-level link.
                        </p>
                    ) : null}
                </div>
            </div>

            <Modal show={Boolean(editor)} onClose={() => setEditor(null)} maxWidth="lg">
                {editor ? (
                    <div>
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {editor.mode === 'edit' ? 'Edit menu item' : 'Add menu item'}
                            </h2>
                        </div>
                        <ItemEditorForm
                            draft={editor.draft}
                            pages={pages}
                            services={services}
                            systemOptions={systemOptions}
                            onChange={(d) => setEditor({ ...editor, draft: d })}
                        />
                        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setEditor(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <PrimaryButton type="button" onClick={saveEditor}>
                                Apply
                            </PrimaryButton>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </AuthenticatedLayout>
    );
}
