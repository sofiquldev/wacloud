import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    CONTENT_TEMPLATES,
    basePathForKind,
    contentKindFromParam,
} from '@/data/adminContentTemplates';
import { contentCategoriesForKind, useCmsCatalog } from '@/hooks/useCmsCatalog';
import {
    INITIAL_NOTICES,
    INITIAL_PAGES,
    INITIAL_SERVICES,
} from '@/data/adminDummyData';
import {
    COLUMN_LAYOUT_SHORT_LABELS,
    TEMPLATE_KIND_LABELS,
} from '@/data/widgetLayoutModel';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    FileText,
    FileUp,
    Globe,
    Image as ImageIcon,
    Settings2,
    Sparkles,
    Tag,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_FEATURED_IMAGE_BYTES = 2.5 * 1024 * 1024;

function readAttachment(file) {
    return new Promise((resolve, reject) => {
        if (file.size > MAX_ATTACHMENT_BYTES) {
            reject(
                new Error(
                    `"${file.name}" is over ${MAX_ATTACHMENT_BYTES / (1024 * 1024)} MB.`,
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
                    file,
                });
            };
            reader.onerror = () =>
                reject(new Error(`Could not read "${file.name}".`));
            reader.readAsDataURL(file);
        } else {
            resolve({ ...base, file });
        }
    });
}

const slugify = (s) =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

function listRouteName(kindParam) {
    if (kindParam === 'page') {
        return 'admin.pages.index';
    }
    if (kindParam === 'service') {
        return 'admin.services.index';
    }
    return 'admin.notices.index';
}

function blankForm(kind, categories, templates) {
    const template = preferredTemplateValue(templates);

    return {
        id: 0,
        title: '',
        slug: '',
        status: 'draft',
        category: categories[0],
        template,
        excerpt: '',
        body: '',
        featuredImage: '',
        tags: [],
        seoTitle: '',
        seoDescription: '',
        visibility: 'public',
        publishAt: '',
        updatedAt: new Date().toISOString().slice(0, 10),
        attachments: [],
    };
}

function mergeInitial(existing, kind, categories, templates) {
    const allowed = new Set(templates.map((t) => t.value));
    const fallback = preferredTemplateValue(templates);
    const incoming = existing.template ?? fallback;
    const template = allowed.has(incoming) ? incoming : fallback;
    return {
        ...blankForm(kind, categories, templates),
        ...existing,
        tags: existing.tags ?? [],
        seoTitle: existing.seoTitle ?? '',
        seoDescription: existing.seoDescription ?? '',
        featuredImage: existing.featuredImage ?? '',
        visibility: existing.visibility ?? 'public',
        publishAt: existing.publishAt ?? '',
        template,
        attachments: (existing.attachments ?? []).map((a) => ({
            ...a,
            dataUrl:
                a.dataUrl ??
                (a.mime?.startsWith('image/') && a.url ? a.url : null),
        })),
    };
}

function preferredTemplateValue(templates) {
    return (
        templates.find((t) => t.kind === 'inner-page')?.value ??
        templates.find((t) => t.value === 'tpl-inner-page')?.value ??
        templates[0]?.value ??
        'default'
    );
}

function ContentNotFound({ kindParam }) {
    return (
        <AuthenticatedLayout>
            <Head title="Not found" />
            <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-lg font-semibold text-slate-900">
                    Item not found
                </h1>
                <p className="text-sm text-slate-600">
                    This ID is not in the demo dataset. Choose a row from the
                    list or create new content.
                </p>
                <Link
                    href={route(listRouteName(kindParam))}
                    className="inline-flex text-sm font-medium text-civic hover:underline"
                >
                    ← Back to list
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}

/**
 * Map admin-created templates (from /admin/templates) into the {value, label, hint}
 * shape this editor expects. All templates are listed (homepage / inner-page /
 * custom) so the editor can pick any saved layout for an individual page.
 */
function templatesFromAvailable(availableTemplates) {
    if (!Array.isArray(availableTemplates) || availableTemplates.length === 0) {
        return [];
    }
    return availableTemplates
        .filter((t) => t && typeof t === 'object' && t.id)
        .map((t) => ({
            value: String(t.id),
            label: String(t.name ?? 'Template'),
            kind: String(t.kind ?? 'custom'),
            columnLayout: String(t.columnLayout ?? ''),
            hint:
                COLUMN_LAYOUT_SHORT_LABELS[t.columnLayout] ??
                TEMPLATE_KIND_LABELS[t.kind] ??
                'Template',
        }));
}

function ContentEditorForm({ kind, kindParam, id, existing, availableTemplates }) {
    const isNew = id === 'new';
    const cmsCatalog = useCmsCatalog();
    const categories = useMemo(
        () => contentCategoriesForKind(kind, cmsCatalog),
        [kind, cmsCatalog],
    );
    const templates = useMemo(() => {
        if (kind === 'Page' || kind === 'Service') {
            const fromAdmin = templatesFromAvailable(availableTemplates);
            if (fromAdmin.length > 0) {
                return fromAdmin;
            }
        }
        return CONTENT_TEMPLATES[kind];
    }, [kind, availableTemplates]);
    const basePath = basePathForKind(kind);

    const [form, setForm] = useState(() =>
        existing
            ? mergeInitial(existing, kind, categories, templates)
            : blankForm(kind, categories, templates),
    );

    const [slugTouched, setSlugTouched] = useState(!isNew);
    const [tagInput, setTagInput] = useState('');
    const [tab, setTab] = useState('content');
    const [RichEditorCmp, setRichEditorCmp] = useState(null);
    const attachmentsInputRef = useRef(null);
    const featuredImageInputRef = useRef(null);
    const [featuredImageFile, setFeaturedImageFile] = useState(null);
    const [featuredRemoved, setFeaturedRemoved] = useState(false);
    const persistsToServer = kind === 'Notice' || kind === 'Service';

    useEffect(() => {
        import('@/Components/Admin/RichTextEditor').then((mod) => {
            setRichEditorCmp(() => mod.default);
        });
    }, []);

    const categoryLabel = kind === 'Notice' ? 'Department' : 'Category';
    const pageTitle = `${isNew ? 'New' : 'Edit'} ${kind.toLowerCase()}`;

    const save = () => {
        if (!form.title.trim() || !form.slug.trim()) {
            return;
        }

        if (!persistsToServer) {
            router.visit(route(listRouteName(kindParam)));
            return;
        }

        const formData = new FormData();
        formData.append('title', form.title.trim());
        formData.append('slug', form.slug.trim());
        formData.append('status', form.status);
        formData.append('category', form.category);
        formData.append('template', form.template);
        formData.append('excerpt', form.excerpt ?? '');
        formData.append('body', form.body ?? '');
        formData.append('tags', JSON.stringify(form.tags ?? []));
        formData.append('seoTitle', form.seoTitle ?? '');
        formData.append('seoDescription', form.seoDescription ?? '');
        formData.append('visibility', form.visibility ?? 'public');
        formData.append('publishAt', form.publishAt ?? '');

        const existingAttachments = (form.attachments ?? [])
            .filter((a) => !a.file && (a.path || a.url))
            .map((a) => ({
                id: a.id,
                name: a.name,
                path: a.path ?? '',
            }));
        formData.append(
            'existingAttachments',
            JSON.stringify(existingAttachments),
        );

        (form.attachments ?? []).forEach((a) => {
            if (a.file instanceof File) {
                formData.append('newAttachments[]', a.file);
            }
        });

        if (featuredImageFile instanceof File) {
            formData.append('featuredImage', featuredImageFile);
        } else if (featuredRemoved) {
            formData.append('removeFeaturedImage', '1');
        } else if (
            form.featuredImage &&
            !String(form.featuredImage).startsWith('data:')
        ) {
            formData.append('featuredImageUrl', form.featuredImage);
        }

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route(listRouteName(kindParam)));
            },
            onError: (errors) => {
                const msg =
                    Object.values(errors ?? {})[0]?.[0] ??
                    'Could not save. Check file sizes (attachments max 5 MB, images max 2.5 MB).';
                window.alert(msg);
            },
        };

        if (isNew) {
            router.post(
                route('admin.content.store', { kind: kindParam }),
                formData,
                options,
            );
            return;
        }

        router.post(
            route('admin.content.update', { kind: kindParam, id }),
            formData,
            options,
        );
    };

    const addTag = () => {
        const t = tagInput.trim();
        if (!t) {
            return;
        }
        if (!form.tags?.includes(t)) {
            setForm({ ...form, tags: [...(form.tags ?? []), t] });
        }
        setTagInput('');
    };

    const removeTag = (t) =>
        setForm({ ...form, tags: form.tags?.filter((x) => x !== t) ?? [] });

    const showAttachments = kind === 'Notice' || kind === 'Service';

    const onAttachmentFiles = async (e) => {
        const files = [...(e.target.files ?? [])];
        e.target.value = '';
        const added = [];
        for (const f of files) {
            try {
                added.push(await readAttachment(f));
            } catch (err) {
                window.alert(
                    err instanceof Error ? err.message : 'Could not add file.',
                );
            }
        }
        if (added.length) {
            setForm((p) => ({
                ...p,
                attachments: [...(p.attachments ?? []), ...added],
            }));
        }
    };

    const removeAttachment = (aid) =>
        setForm((p) => ({
            ...p,
            attachments: (p.attachments ?? []).filter((a) => a.id !== aid),
        }));

    const onFeaturedImageFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) {
            return;
        }
        if (!file.type.startsWith('image/')) {
            window.alert('Please choose an image file (JPEG, PNG, WebP, GIF).');
            return;
        }
        if (file.size > MAX_FEATURED_IMAGE_BYTES) {
            window.alert(
                `Image must be under ${MAX_FEATURED_IMAGE_BYTES / (1024 * 1024)} MB.`,
            );
            return;
        }
        setFeaturedImageFile(file);
        setFeaturedRemoved(false);
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setForm((p) => ({ ...p, featuredImage: reader.result }));
            }
        };
        reader.readAsDataURL(file);
    };

    const clearFeaturedImage = () => {
        setForm((p) => ({ ...p, featuredImage: '' }));
        setFeaturedImageFile(null);
        setFeaturedRemoved(true);
        if (featuredImageInputRef.current) {
            featuredImageInputRef.current.value = '';
        }
    };

    const tabBtn = (key, label, Icon) => (
        <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
                tab === key
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
            }`}
        >
            {Icon && <Icon className="size-3.5" aria-hidden />}
            {label}
        </button>
    );

    const field =
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic';

    const labelCls = 'text-xs font-medium uppercase tracking-wide text-slate-500';

    return (
        <AuthenticatedLayout>
            <Head title={pageTitle} />
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route(listRouteName(kindParam))}
                            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                            aria-label="Back to list"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {pageTitle}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {kind === 'Page'
                                    ? 'Static content for the public site.'
                                    : kind === 'Service'
                                      ? 'Citizen-facing service page.'
                                      : 'Public notice, tender or circular.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={route(listRouteName(kindParam))}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="button"
                            onClick={save}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            Save draft
                        </button>
                        <PrimaryButton
                            type="button"
                            variant="civic"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold normal-case tracking-normal"
                            onClick={save}
                        >
                            <Globe className="size-4" aria-hidden />
                            {isNew ? 'Publish' : 'Save & publish'}
                        </PrimaryButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <input
                                value={form.title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    setForm((p) => ({
                                        ...p,
                                        title,
                                        slug: slugTouched
                                            ? p.slug
                                            : slugify(title),
                                    }));
                                }}
                                placeholder={
                                    kind === 'Page'
                                        ? 'About Pourashava'
                                        : kind === 'Service'
                                          ? 'Trade License'
                                          : 'Office closure notice'
                                }
                                className={`${field} text-xl font-semibold`}
                            />
                            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">
                                <span className="shrink-0">
                                    {basePath || '/'}/
                                </span>
                                <input
                                    value={form.slug}
                                    onChange={(e) => {
                                        setSlugTouched(true);
                                        setForm((p) => ({
                                            ...p,
                                            slug: slugify(e.target.value),
                                        }));
                                    }}
                                    className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-slate-900 outline-none ring-0"
                                    placeholder="my-slug"
                                />
                            </div>
                        </div>

                        <div className="inline-flex rounded-lg bg-slate-200/90 p-1">
                            {tabBtn('content', 'Content', FileText)}
                            {tabBtn('seo', 'SEO', Sparkles)}
                            {tabBtn('advanced', 'Advanced', Settings2)}
                        </div>

                        {tab === 'content' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>Excerpt</label>
                                    <textarea
                                        rows={2}
                                        value={form.excerpt}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                excerpt: e.target.value,
                                            })
                                        }
                                        placeholder="Short summary shown in lists and meta description."
                                        className={`${field} mt-1.5`}
                                    />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-end justify-between gap-2">
                                        <label className={labelCls}>Body</label>
                                        <span className="text-xs text-slate-500">
                                            Rich text (saved as HTML for this demo)
                                        </span>
                                    </div>
                                    {RichEditorCmp ? (
                                        <RichEditorCmp
                                            key={`${kindParam}-${id}-body`}
                                            value={form.body}
                                            onChange={(html) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    body: html,
                                                }))
                                            }
                                            placeholder="Write headings, lists, quotes, links…"
                                            className="mt-1.5"
                                        />
                                    ) : (
                                        <div
                                            className={`${field} mt-1.5 flex min-h-[280px] items-center justify-center text-sm text-slate-400`}
                                        >
                                            Loading editor…
                                        </div>
                                    )}
                                </div>
                                {showAttachments && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <label className={labelCls}>
                                                    Attached files
                                                </label>
                                                <p className="mt-1 max-w-xl text-xs text-slate-500">
                                                    PDFs, Office documents or
                                                    images (max{' '}
                                                    {MAX_ATTACHMENT_BYTES /
                                                        (1024 * 1024)}{' '}
                                                    MB each). Saved to the server
                                                    when you publish.
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                                                <input
                                                    ref={attachmentsInputRef}
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/jpeg,image/png,image/webp,image/gif"
                                                    onChange={onAttachmentFiles}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        attachmentsInputRef.current?.click()
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                                                >
                                                    <Upload
                                                        className="size-4"
                                                        aria-hidden
                                                    />
                                                    Upload files
                                                </button>
                                            </div>
                                        </div>
                                        {(form.attachments ?? []).length >
                                        0 ? (
                                            <ul className="mt-3 space-y-2">
                                                {(form.attachments ?? []).map(
                                                    (a) => (
                                                        <li
                                                            key={a.id}
                                                            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                                                        >
                                                            {a.dataUrl ||
                                                            a.url ? (
                                                                <img
                                                                    src={
                                                                        a.dataUrl ||
                                                                        a.url
                                                                    }
                                                                    alt=""
                                                                    className="size-10 shrink-0 rounded object-cover ring-1 ring-slate-200"
                                                                />
                                                            ) : (
                                                                <div className="grid size-10 shrink-0 place-items-center rounded bg-slate-100 text-slate-500">
                                                                    <FileText className="size-5" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate font-medium text-slate-900">
                                                                    {a.name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {(
                                                                        a.size /
                                                                        1024
                                                                    ).toFixed(
                                                                        1,
                                                                    )}{' '}
                                                                    KB
                                                                    {a.mime
                                                                        ? ` · ${a.mime}`
                                                                        : ''}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeAttachment(
                                                                        a.id,
                                                                    )
                                                                }
                                                                className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                                aria-label={`Remove ${a.name}`}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="mt-3 text-xs text-slate-500">
                                                No files attached yet.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'seo' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>SEO title</label>
                                    <input
                                        value={form.seoTitle ?? ''}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                seoTitle: e.target.value,
                                            })
                                        }
                                        maxLength={60}
                                        placeholder="Defaults to page title"
                                        className={`${field} mt-1.5`}
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        {(form.seoTitle ?? '').length}/60
                                    </p>
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Meta description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.seoDescription ?? ''}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                seoDescription: e.target.value,
                                            })
                                        }
                                        maxLength={160}
                                        placeholder="Shown in search results"
                                        className={`${field} mt-1.5`}
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        {(form.seoDescription ?? '').length}/160
                                    </p>
                                </div>
                                <div>
                                    <label className={labelCls}>
                                        Featured image
                                    </label>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Paste a URL or upload an image (saved on
                                        the server for notices and services).
                                    </p>
                                    <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            <ImageIcon
                                                className="size-4 shrink-0 text-slate-400"
                                                aria-hidden
                                            />
                                            <input
                                                value={
                                                    form.featuredImage ?? ''
                                                }
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        featuredImage:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="https://…"
                                                className={field}
                                            />
                                        </div>
                                        <input
                                            ref={featuredImageInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            className="hidden"
                                            onChange={onFeaturedImageFile}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                featuredImageInputRef.current?.click()
                                            }
                                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                                        >
                                            <FileUp
                                                className="size-4"
                                                aria-hidden
                                            />
                                            Upload image
                                        </button>
                                        {form.featuredImage ? (
                                            <button
                                                type="button"
                                                onClick={clearFeaturedImage}
                                                className="text-left text-xs font-medium text-red-600 hover:underline"
                                            >
                                                Remove image
                                            </button>
                                        ) : null}
                                    </div>
                                    {form.featuredImage ? (
                                        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                            <img
                                                src={form.featuredImage}
                                                alt=""
                                                className="h-40 w-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display =
                                                        'none';
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {tab === 'advanced' && (
                            <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelCls}>
                                            Visibility
                                        </label>
                                        <select
                                            value={form.visibility ?? 'public'}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    visibility: e.target.value,
                                                })
                                            }
                                            className={`${field} mt-1.5`}
                                        >
                                            <option value="public">
                                                Public
                                            </option>
                                            <option value="private">
                                                Private
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>
                                            Schedule publish
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={form.publishAt ?? ''}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    publishAt: e.target.value,
                                                })
                                            }
                                            className={`${field} mt-1.5`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Tags</label>
                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                        <input
                                            value={tagInput}
                                            onChange={(e) =>
                                                setTagInput(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                            placeholder="Type and press Enter"
                                            className={`${field} min-w-[12rem] flex-1`}
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                                        >
                                            <Tag
                                                className="mr-1 inline size-4"
                                                aria-hidden
                                            />
                                            Add
                                        </button>
                                    </div>
                                    {form.tags && form.tags.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {form.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                                                >
                                                    {t}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeTag(t)
                                                        }
                                                        className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-red-600"
                                                        aria-label={`Remove ${t}`}
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div>
                                <p className={labelCls}>Status</p>
                                <label className="mt-2 flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                    <span className="text-sm font-medium capitalize text-slate-800">
                                        {form.status}
                                    </span>
                                    <Checkbox
                                        checked={form.status === 'published'}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                status: e.target.checked
                                                    ? 'published'
                                                    : 'draft',
                                            })
                                        }
                                        className="rounded border-slate-300 text-civic focus:ring-civic/30"
                                    />
                                </label>
                            </div>
                            <div className="border-t border-slate-100 pt-4">
                                <p className={labelCls}>{categoryLabel}</p>
                                <select
                                    value={form.category}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            category: e.target.value,
                                        })
                                    }
                                    className={`${field} mt-1.5`}
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <p className={labelCls}>Template</p>
                                <select
                                    value={form.template}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            template: e.target.value,
                                        })
                                    }
                                    className={`${field} mt-1.5`}
                                >
                                    {templates.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label} — {t.hint}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {kind === 'Notice' && (
                                <div>
                                    <p className={labelCls}>Notice date</p>
                                    <div className="relative mt-1.5">
                                        <Calendar className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            className={`${field} pl-9`}
                                            value={
                                                form.publishAt?.slice(0, 10) ??
                                                ''
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    publishAt: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                            <div className="flex justify-between gap-2">
                                <span>Updated</span>
                                <span className="font-medium text-slate-800">
                                    {form.updatedAt}
                                </span>
                            </div>
                            <div className="flex justify-between gap-2">
                                <span>URL</span>
                                <span className="max-w-[10rem] truncate font-mono text-slate-800">
                                    {basePath || '/'}/{form.slug || '—'}
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default function ContentEdit({ kind: kindParam, id }) {
    const kind = contentKindFromParam(kindParam);
    const { cmsPagesCatalog, availableTemplates, cmsContentItem } =
        usePage().props;
    if (!kind) {
        return (
            <AuthenticatedLayout>
                <Head title="Not found" />
                <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
                    Invalid content type.
                </div>
            </AuthenticatedLayout>
        );
    }

    const isNew = id === 'new';
    const list =
        kind === 'Page'
            ? Array.isArray(cmsPagesCatalog) && cmsPagesCatalog.length > 0
                ? cmsPagesCatalog
                : INITIAL_PAGES
            : kind === 'Service'
              ? INITIAL_SERVICES
              : INITIAL_NOTICES;
    const existing = !isNew
        ? cmsContentItem ??
          list.find((x) => String(x.id) === String(id)) ??
          null
        : null;

    if (!isNew && !existing) {
        return <ContentNotFound kindParam={kindParam} />;
    }

    return (
        <ContentEditorForm
            kind={kind}
            kindParam={kindParam}
            id={id}
            existing={existing}
            availableTemplates={availableTemplates}
        />
    );
}
