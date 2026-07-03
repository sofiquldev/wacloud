import { CmsPageLayoutTemplateIcon } from '@/Components/Admin/CmsPageLayoutTemplateIcons';
import PortalMenu from '@/Components/Admin/PortalMenu';
import WidgetConfigModal from '@/Components/Admin/WidgetConfigModal';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { PublicHomepageColumns } from '@/Components/widgets/HomepageWidgetRenderer';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { WIDGET_CATALOG } from '@/data/adminDummyData';
import {
    CMS_PAGE_LAYOUT_TEMPLATES,
    CMS_PAGE_LAYOUT_DEFAULT_ID,
} from '@/data/cmsPageLayoutTemplates';
import {
    COLUMN_LAYOUT_ICON_IDS,
    COLUMN_LAYOUT_SHORT_LABELS,
    TEMPLATE_KINDS,
    TEMPLATE_KIND_LABELS,
    blankTemplate,
    countHeroInstances,
    defaultDataForWidgetType,
    enrichNewWidgetInstance,
    initialLayoutState,
    newWidgetInstanceId,
    normalizeLayoutPayload,
    normalizeTemplateColumnLayout,
    normalizeTemplateKind,
    templateToHomepageWidgets,
    visibleZonesForColumnLayout,
} from '@/data/widgetLayoutModel';
import { enrichContentWidgetsForAdminPreview, enrichWidgetListWithDirectoryMessages } from '@/data/membersDirectoryStorage';
import {
    membersDirectoryRowsToWidgetPeople,
    setWidgetPeopleForAdmin,
} from '@/data/widgetPeopleDirectory';
import { useMembersDirectory } from '@/hooks/useCmsCatalog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
    Check,
    Eye,
    GripVertical,
    Pencil,
    Plus,
    Save,
    Settings2,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ALL_ZONES = [
    { id: 'left', title: 'Left sidebar' },
    { id: 'main', title: 'Main column' },
    { id: 'right', title: 'Right sidebar' },
];

function catalogEntry(type) {
    return WIDGET_CATALOG.find((w) => w.type === type);
}

function moveWidgetInTemplate(template, result) {
    const { source, destination, draggableId } = result;
    if (!destination) {
        return template;
    }
    if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
    ) {
        return template;
    }
    const sid = source.droppableId;
    const did = destination.droppableId;
    const zones = {
        left: [...template.zones.left],
        main: [...template.zones.main],
        right: [...template.zones.right],
    };
    const startList = zones[sid];
    if (startList[source.index] !== draggableId) {
        return template;
    }
    const [removed] = startList.splice(source.index, 1);
    if (removed !== draggableId) {
        return template;
    }
    const destList = zones[did];
    destList.splice(destination.index, 0, removed);
    return { ...template, zones };
}

function activeTemplateFromState(state) {
    return state.templates.find((t) => t.id === state.activeTemplateId) ?? null;
}

function updateActiveTemplate(state, updater) {
    const id = state.activeTemplateId;
    return {
        ...state,
        templates: state.templates.map((t) => (t.id === id ? updater(t) : t)),
    };
}

function kindBadgeClass(kind) {
    if (kind === 'homepage') {
        return 'bg-civic/10 text-civic';
    }
    if (kind === 'inner-page') {
        return 'bg-amber-100 text-amber-800';
    }
    return 'bg-slate-100 text-slate-600';
}

function NewTemplateModal({ open, onClose, onCreate, takenKinds }) {
    const [name, setName] = useState('');
    const [layout, setLayout] = useState(CMS_PAGE_LAYOUT_DEFAULT_ID);
    const [kind, setKind] = useState('custom');

    useEffect(() => {
        if (open) {
            setName('');
            setLayout(CMS_PAGE_LAYOUT_DEFAULT_ID);
            setKind('custom');
        }
    }, [open]);

    const submit = (e) => {
        e?.preventDefault?.();
        const trimmed = name.trim();
        if (!trimmed) {
            return;
        }
        onCreate({ name: trimmed, columnLayout: layout, kind });
    };

    const kindDisabled = (k) => k !== 'custom' && takenKinds.has(k);

    return (
        <Modal show={open} onClose={onClose} maxWidth="lg">
            <form onSubmit={submit} className="space-y-4 p-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        New template
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Pick a name and a layout. The homepage and inner-page
                        roles can each be assigned to one template.
                    </p>
                </div>

                <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                        Template name
                    </span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        placeholder="e.g. Landing page"
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                    />
                </label>

                <div>
                    <span className="text-sm font-medium text-slate-700">
                        Layout
                    </span>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {CMS_PAGE_LAYOUT_TEMPLATES.map((opt) => {
                            const checked = layout === opt.id;
                            return (
                                <label
                                    key={opt.id}
                                    className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-sm ${
                                        checked
                                            ? 'border-civic bg-civic/5'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="new-template-layout"
                                        className="mt-0.5 accent-civic"
                                        checked={checked}
                                        onChange={() => setLayout(opt.id)}
                                    />
                                    <span className="min-w-0">
                                        <span className="block font-medium text-slate-900">
                                            {opt.label}
                                        </span>
                                        <span className="block text-xs text-slate-500">
                                            {opt.description}
                                        </span>
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <span className="text-sm font-medium text-slate-700">
                        Role
                    </span>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {TEMPLATE_KINDS.map((k) => {
                            const disabled = kindDisabled(k);
                            const checked = kind === k;
                            return (
                                <label
                                    key={k}
                                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm ${
                                        checked
                                            ? 'border-civic bg-civic/5'
                                            : 'border-slate-200 bg-white'
                                    } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-slate-300'}`}
                                >
                                    <input
                                        type="radio"
                                        name="new-template-kind"
                                        className="accent-civic"
                                        checked={checked}
                                        disabled={disabled}
                                        onChange={() => setKind(k)}
                                    />
                                    <span>
                                        <span className="block font-medium text-slate-900">
                                            {TEMPLATE_KIND_LABELS[k]}
                                        </span>
                                        {disabled ? (
                                            <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                                                already used
                                            </span>
                                        ) : null}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <PrimaryButton
                        type="submit"
                        variant="civic"
                        disabled={!name.trim()}
                        className="px-4 py-2 text-sm font-semibold normal-case tracking-normal"
                    >
                        Create template
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

export default function Templates() {
    const page = usePage();
    const membersDirectory = useMembersDirectory();
    const widgetPeople = useMemo(
        () => membersDirectoryRowsToWidgetPeople(membersDirectory),
        [membersDirectory],
    );

    useEffect(() => {
        setWidgetPeopleForAdmin(widgetPeople);
    }, [widgetPeople]);

    const [state, setState] = useState(() =>
        page.props.widgetLayout != null
            ? normalizeLayoutPayload(page.props.widgetLayout)
            : initialLayoutState(),
    );

    const [addMenuZone, setAddMenuZone] = useState(null);
    const [savedFlash, setSavedFlash] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [configureWid, setConfigureWid] = useState(null);
    const [newOpen, setNewOpen] = useState(false);
    const [renamingId, setRenamingId] = useState(null);
    const [renameDraft, setRenameDraft] = useState('');
    const addMenuAnchorRef = useRef(null);

    const active = activeTemplateFromState(state);
    const configureInstance =
        configureWid && active ? active.instances[configureWid] ?? null : null;

    const commit = useCallback((next) => {
        setState(next);
    }, []);

    const onDragEnd = (result) => {
        if (!active) {
            return;
        }
        const nextTpl = moveWidgetInTemplate(active, result);
        if (nextTpl === active) {
            return;
        }
        commit(updateActiveTemplate(state, () => nextTpl));
    };

    const addWidget = (zone, type) => {
        if (!active) {
            return;
        }
        const entry = WIDGET_CATALOG.find((w) => w.type === type);
        if (!entry) {
            return;
        }
        if (entry.once && countHeroInstances(active) >= 1 && type === 'hero') {
            return;
        }
        const id = newWidgetInstanceId();
        const baseData = defaultDataForWidgetType(type);
        const enriched = enrichNewWidgetInstance(type, baseData);
        commit(
            updateActiveTemplate(state, (t) => ({
                ...t,
                zones: { ...t.zones, [zone]: [...t.zones[zone], id] },
                instances: {
                    ...t.instances,
                    [id]: {
                        type,
                        data: enriched.data,
                        ...(enriched.personId
                            ? { personId: enriched.personId }
                            : {}),
                        ...(enriched.displayTitle != null
                            ? { displayTitle: enriched.displayTitle }
                            : {}),
                        ...(enriched.membersGrid
                            ? { membersGrid: enriched.membersGrid }
                            : {}),
                    },
                },
            })),
        );
        setAddMenuZone(null);
    };

    const removeWidget = (zone, widgetId) => {
        commit(
            updateActiveTemplate(state, (t) => {
                const zones = {
                    ...t.zones,
                    [zone]: t.zones[zone].filter((x) => x !== widgetId),
                };
                const { [widgetId]: _removed, ...instances } = t.instances;
                return { ...t, zones, instances };
            }),
        );
        if (configureWid === widgetId) {
            setConfigureWid(null);
        }
    };

    const applyWidgetConfig = (widgetId, patch) => {
        commit(
            updateActiveTemplate(state, (t) => ({
                ...t,
                instances: {
                    ...t.instances,
                    [widgetId]: { ...t.instances[widgetId], ...patch },
                },
            })),
        );
    };

    const setActiveTemplate = (id) => {
        if (!state.templates.some((t) => t.id === id)) {
            return;
        }
        commit({ ...state, activeTemplateId: id });
    };

    const setActiveLayout = (layoutId) => {
        commit(
            updateActiveTemplate(state, (t) => ({
                ...t,
                columnLayout: normalizeTemplateColumnLayout(layoutId),
            })),
        );
    };

    const takenKinds = useMemo(
        () => new Set(state.templates.map((t) => t.kind).filter((k) => k !== 'custom')),
        [state.templates],
    );

    const createTemplate = ({ name, columnLayout, kind }) => {
        const tpl = blankTemplate(name, columnLayout, normalizeTemplateKind(kind));
        commit({
            ...state,
            templates: [...state.templates, tpl],
            activeTemplateId: tpl.id,
        });
        setNewOpen(false);
    };

    const deleteTemplate = (id) => {
        if (state.templates.length <= 1) {
            return;
        }
        const next = state.templates.filter((t) => t.id !== id);
        const activeId = state.activeTemplateId === id ? next[0].id : state.activeTemplateId;
        commit({ ...state, templates: next, activeTemplateId: activeId });
    };

    const startRename = (tpl) => {
        setRenamingId(tpl.id);
        setRenameDraft(tpl.name);
    };

    const commitRename = () => {
        const id = renamingId;
        const next = renameDraft.trim();
        setRenamingId(null);
        setRenameDraft('');
        if (!id || !next) {
            return;
        }
        commit({
            ...state,
            templates: state.templates.map((t) =>
                t.id === id ? { ...t, name: next } : t,
            ),
        });
    };

    const saveClicked = () => {
        const templates = state.templates.map((t) => ({
            ...t,
            columnLayout: normalizeTemplateColumnLayout(t.columnLayout),
            kind: normalizeTemplateKind(t.kind),
            instances: { ...t.instances },
        }));
        router.put(
            route('admin.templates.update'),
            {
                templates,
                activeTemplateId: state.activeTemplateId,
                applyToPublicHome: true,
            },
            {
                preserveScroll: true,
                onSuccess: (visitPage) => {
                    const saved = visitPage.props.widgetLayout;
                    if (saved != null) {
                        setState(normalizeLayoutPayload(saved));
                    }
                    setSavedFlash(true);
                    window.setTimeout(() => setSavedFlash(false), 2000);
                },
                onError: (errors) => {
                    console.error('Template save failed', errors);
                },
            },
        );
    };

    const previewWidgets = active
        ? enrichContentWidgetsForAdminPreview(
              enrichWidgetListWithDirectoryMessages(
                  templateToHomepageWidgets(active),
                  membersDirectory,
              ),
              page.props.cmsPagesCatalog,
          )
        : [];

    const activeColumnLayout = active
        ? normalizeTemplateColumnLayout(active.columnLayout)
        : 'content-right';
    const visibleZoneIds = visibleZonesForColumnLayout(activeColumnLayout);
    const visibleZones = ALL_ZONES.filter((z) => visibleZoneIds.includes(z.id));

    return (
        <AuthenticatedLayout>
            <Head title="Templates" />
            <div className="mx-auto w-full max-w-7xl space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Templates
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Create reusable page templates with a chosen column
                            layout and widgets per zone. The template tagged
                            <span className="mx-1 whitespace-nowrap rounded bg-civic/10 px-1 py-0.5 text-[10px] font-bold uppercase text-civic">
                                Homepage
                            </span>
                            drives the public homepage; the one tagged
                            <span className="mx-1 whitespace-nowrap rounded bg-amber-100 px-1 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                                Inner page
                            </span>
                            drives /p/ and /services/ pages.
                        </p>
                    </div>
                    <p className="max-w-xl rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        The public homepage uses the template whose role is{' '}
                        <span className="font-semibold text-civic">Homepage</span> (widgets and column layout). Click{' '}
                        <strong>Save</strong> after changes, then refresh the site.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
                    <aside className="space-y-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                        <div className="flex items-center justify-between px-1.5 pt-0.5">
                            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                All templates
                            </h2>
                            <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-600">
                                {state.templates.length}
                            </span>
                        </div>
                        <ul className="space-y-1">
                            {state.templates.map((tpl) => {
                                const isActive = tpl.id === state.activeTemplateId;
                                const isRenaming = renamingId === tpl.id;
                                const layoutId = normalizeTemplateColumnLayout(tpl.columnLayout);
                                const iconId = COLUMN_LAYOUT_ICON_IDS[layoutId];
                                const kindLabel = TEMPLATE_KIND_LABELS[tpl.kind] ?? 'Custom';
                                const canDelete = state.templates.length > 1;
                                return (
                                    <li key={tpl.id}>
                                        <div
                                            className={`group relative rounded-lg border px-2 py-2 transition-colors ${
                                                isActive
                                                    ? 'border-civic/40 bg-civic/5 shadow-sm'
                                                    : 'border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTemplate(tpl.id)}
                                                    className="min-w-0 flex-1 text-left"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        {isRenaming ? (
                                                            <input
                                                                type="text"
                                                                autoFocus
                                                                value={renameDraft}
                                                                onChange={(e) =>
                                                                    setRenameDraft(e.target.value)
                                                                }
                                                                onBlur={commitRename}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        commitRename();
                                                                    } else if (e.key === 'Escape') {
                                                                        setRenamingId(null);
                                                                        setRenameDraft('');
                                                                    }
                                                                }}
                                                                className="w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                                                            />
                                                        ) : (
                                                            <span className="min-w-0 truncate text-[13px] font-semibold leading-tight text-slate-900">
                                                                {tpl.name}
                                                            </span>
                                                        )}
                                                        {!isRenaming && tpl.kind !== 'custom' ? (
                                                            <span
                                                                className={`shrink-0 whitespace-nowrap rounded px-1 py-px text-[9px] font-bold uppercase tracking-wider ${kindBadgeClass(
                                                                    tpl.kind,
                                                                )}`}
                                                            >
                                                                {kindLabel}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                                                        <CmsPageLayoutTemplateIcon
                                                            icon={iconId}
                                                            className="size-3.5 shrink-0 text-slate-400"
                                                        />
                                                        <span className="truncate">
                                                            {COLUMN_LAYOUT_SHORT_LABELS[layoutId]}
                                                        </span>
                                                    </div>
                                                </button>
                                                {!isRenaming ? (
                                                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => startRename(tpl)}
                                                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                            title="Rename"
                                                            aria-label="Rename template"
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteTemplate(tpl.id)}
                                                            disabled={!canDelete}
                                                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                            title={
                                                                canDelete
                                                                    ? 'Delete'
                                                                    : 'Cannot delete the last template'
                                                            }
                                                            aria-label="Delete template"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={commitRename}
                                                        className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100"
                                                        title="Save"
                                                        aria-label="Save name"
                                                    >
                                                        <Check className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <button
                            type="button"
                            onClick={() => setNewOpen(true)}
                            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-civic hover:bg-civic/5 hover:text-civic"
                        >
                            <Plus className="size-3.5" />
                            New template
                        </button>
                    </aside>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-600">
                                <CmsPageLayoutTemplateIcon
                                    icon={COLUMN_LAYOUT_ICON_IDS[activeColumnLayout]}
                                    className="size-5 shrink-0 text-slate-400"
                                />
                                <span className="truncate font-medium text-slate-900">
                                    {active?.name ?? 'Template'}
                                </span>
                                {active && active.kind !== 'custom' ? (
                                    <span
                                        className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${kindBadgeClass(
                                            active.kind,
                                        )}`}
                                    >
                                        {TEMPLATE_KIND_LABELS[active.kind]}
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <label className="flex items-center gap-2 text-xs text-slate-600">
                                    <span>Layout</span>
                                    <select
                                        value={activeColumnLayout}
                                        onChange={(e) => setActiveLayout(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                                    >
                                        {CMS_PAGE_LAYOUT_TEMPLATES.map((opt) => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setPreviewOpen(true)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                                >
                                    <Eye className="size-4" />
                                    Preview
                                </button>
                                <PrimaryButton
                                    type="button"
                                    variant="civic"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold normal-case tracking-normal"
                                    onClick={saveClicked}
                                >
                                    <Save className="size-4" />
                                    Save
                                </PrimaryButton>
                            </div>
                        </div>

                        {savedFlash && (
                            <p className="text-sm font-medium text-emerald-700">
                                Templates saved to the database.
                            </p>
                        )}

                        {active && (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div
                                    className={`grid grid-cols-1 gap-4 ${
                                        visibleZones.length === 1
                                            ? 'lg:max-w-4xl'
                                            : visibleZones.length === 2
                                              ? 'lg:grid-cols-2'
                                              : 'lg:grid-cols-3'
                                    }`}
                                >
                                    {visibleZones.map(({ id: zoneId, title }) => {
                                        const ids = active.zones[zoneId];
                                        return (
                                            <div
                                                key={zoneId}
                                                className="flex min-h-[320px] flex-col rounded-xl border border-slate-200 bg-slate-50/90 p-3 shadow-inner"
                                            >
                                                <div className="mb-2 flex items-center justify-between px-1">
                                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                                        {title}{' '}
                                                        <span className="font-normal text-slate-400">
                                                            ({ids.length})
                                                        </span>
                                                    </span>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                if (addMenuZone === zoneId) {
                                                                    setAddMenuZone(null);
                                                                } else {
                                                                    addMenuAnchorRef.current =
                                                                        e.currentTarget;
                                                                    setAddMenuZone(zoneId);
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                                                        >
                                                            <Plus className="size-3.5" />
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>

                                                <Droppable droppableId={zoneId}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={`flex flex-1 flex-col gap-2 rounded-lg p-1 transition-colors ${
                                                                snapshot.isDraggingOver
                                                                    ? 'bg-civic/5 ring-1 ring-civic/20'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {ids.map((wid, index) => {
                                                                const inst =
                                                                    active.instances[wid];
                                                                if (!inst) {
                                                                    return null;
                                                                }
                                                                const cat = catalogEntry(inst.type);
                                                                return (
                                                                    <Draggable
                                                                        key={wid}
                                                                        draggableId={wid}
                                                                        index={index}
                                                                    >
                                                                        {(p, snap) => (
                                                                            <div
                                                                                ref={p.innerRef}
                                                                                {...p.draggableProps}
                                                                                className={`flex items-stretch gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${
                                                                                    snap.isDragging
                                                                                        ? 'ring-2 ring-civic/40'
                                                                                        : ''
                                                                                }`}
                                                                            >
                                                                                <div
                                                                                    {...p.dragHandleProps}
                                                                                    className="flex shrink-0 cursor-grab items-center border-r border-slate-100 bg-slate-50 px-1.5 text-slate-400 hover:text-slate-600 active:cursor-grabbing"
                                                                                    title="Drag to reorder or move column"
                                                                                >
                                                                                    <GripVertical className="size-4" />
                                                                                </div>
                                                                                <div className="min-w-0 flex-1 px-2 py-2">
                                                                                    <p className="text-sm font-semibold text-slate-900">
                                                                                        {inst.displayTitle ||
                                                                                            inst.data?.title ||
                                                                                            (inst.type === 'member-card'
                                                                                                ? inst.data?.designation
                                                                                                : null) ||
                                                                                            cat?.label ||
                                                                                            inst.type}
                                                                                    </p>
                                                                                    {cat?.hint ? (
                                                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                                                            {cat.hint}
                                                                                        </p>
                                                                                    ) : null}
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setConfigureWid(wid);
                                                                                    }}
                                                                                    className="shrink-0 px-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                                                    title="Configure widget"
                                                                                >
                                                                                    <Settings2 className="size-4" />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        removeWidget(zoneId, wid)
                                                                                    }
                                                                                    className="shrink-0 px-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                                                    title="Remove"
                                                                                >
                                                                                    <Trash2 className="size-4" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            })}
                                                            {provided.placeholder}
                                                            {ids.length === 0 && (
                                                                <p className="py-8 text-center text-xs text-slate-400">
                                                                    Drop widgets here or use Add.
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        );
                                    })}
                                </div>
                            </DragDropContext>
                        )}

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                Widget catalog
                            </h2>
                            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {WIDGET_CATALOG.map((w) => (
                                    <li
                                        key={w.type}
                                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                    >
                                        <span>{w.label}</span>
                                        {w.once ? (
                                            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                                once
                                            </span>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-4 text-xs text-slate-500">
                                Public site:{' '}
                                <Link
                                    href={route('home')}
                                    className="font-medium text-civic hover:underline"
                                >
                                    Homepage
                                </Link>
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <Modal show={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="6xl">
                <div className="max-h-[85vh] overflow-y-auto bg-[var(--background)] p-4">
                    <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
                        <h2 className="text-lg font-semibold text-foreground">
                            {active?.name ?? 'Template'} preview
                        </h2>
                        <button
                            type="button"
                            onClick={() => setPreviewOpen(false)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Close
                        </button>
                    </div>
                    <PublicHomepageColumns
                        widgets={previewWidgets}
                        columnLayout={activeColumnLayout}
                    />
                </div>
            </Modal>

            <NewTemplateModal
                open={newOpen}
                onClose={() => setNewOpen(false)}
                onCreate={createTemplate}
                takenKinds={takenKinds}
            />

            <PortalMenu
                open={Boolean(active && addMenuZone)}
                anchorRef={addMenuAnchorRef}
                onClose={() => setAddMenuZone(null)}
                panelClassName="w-56 max-h-72"
            >
                {active && addMenuZone
                    ? WIDGET_CATALOG.map((w) => {
                          const blocked =
                              w.once &&
                              countHeroInstances(active) >= 1 &&
                              w.type === 'hero';
                          return (
                              <button
                                  key={w.type}
                                  type="button"
                                  disabled={blocked}
                                  onClick={() => addWidget(addMenuZone, w.type)}
                                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                  <span>{w.label}</span>
                                  {w.once ? (
                                      <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                                          once
                                      </span>
                                  ) : null}
                              </button>
                          );
                      })
                    : null}
            </PortalMenu>

            <WidgetConfigModal
                show={Boolean(configureWid && configureInstance)}
                instance={configureInstance}
                onClose={() => setConfigureWid(null)}
                onApply={(patch) => {
                    if (configureWid) {
                        applyWidgetConfig(configureWid, patch);
                    }
                }}
            />
        </AuthenticatedLayout>
    );
}
