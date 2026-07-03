import Checkbox from '@/Components/Checkbox';
import Modal from '@/Components/Modal';
import { WIDGET_CATALOG } from '@/data/adminDummyData';
import {
    MEMBER_GROUP_OPTIONS,
    buildMembersGridRows,
    getWidgetPeople,
    guessPersonIdFromCardData,
    memberCardDataFromPersonId,
    personSelectLabel,
} from '@/data/widgetPeopleDirectory';
import { intUnique } from '@/utils/intUnique';
import { ChevronDown, ChevronUp, Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

function PeoplePicker({ label, helper, value, onChange, people }) {
    const toggle = (id) => {
        onChange(
            value.includes(id) ? value.filter((x) => x !== id) : [...value, id],
        );
    };

    return (
        <div className="space-y-2">
            <div>
                <label className="text-sm font-semibold text-slate-900">
                    {label}
                </label>
                <p className="text-xs text-slate-500">{helper}</p>
            </div>
            <div className="max-h-44 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                {people.map((p) => (
                    <label
                        key={p.id}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-slate-50"
                    >
                        <Checkbox
                            checked={value.includes(p.id)}
                            onChange={() => toggle(p.id)}
                            className="size-4 rounded-full border-slate-300 text-civic focus:ring-civic/30"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-slate-900">
                                {p.name}
                            </div>
                            <div className="truncate text-[11px] text-slate-500">
                                {p.role}
                            </div>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}

const fieldClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic';

function newContentAttachmentRow() {
    return { id: `att-${intUnique()}`, label: '', url: '', size: '' };
}

function newSvcManualLinkRow() {
    return { id: `nsl-${intUnique()}`, label: '', href: '' };
}

/** @param {unknown} raw */
function normalizeSvcManualLinkRows(raw) {
    const arr = Array.isArray(raw) ? raw : [];
    const rows = arr.map((r, i) => {
        if (typeof r !== 'object' || r === null) {
            return newSvcManualLinkRow();
        }
        return {
            id: typeof r.id === 'string' ? r.id : `nsl-${intUnique()}`,
            label: String(r.label ?? ''),
            href: String(r.href ?? ''),
        };
    });
    return rows.length ? rows : [newSvcManualLinkRow()];
}

function newQuickLinkRow() {
    return { id: `ql-${intUnique()}`, label: '', href: '' };
}

/** @param {unknown} raw */
function normalizeQuickLinkRows(raw) {
    const arr = Array.isArray(raw) ? raw : [];
    const rows = arr.map((r) => {
        if (typeof r !== 'object' || r === null) {
            return newQuickLinkRow();
        }
        return {
            id: typeof r.id === 'string' ? r.id : `ql-${intUnique()}`,
            label: String(r.label ?? ''),
            href: String(r.href ?? ''),
        };
    });
    return rows.length ? rows : [newQuickLinkRow()];
}

/** @param {unknown} raw */
function normalizeContentAttachmentRows(raw) {
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((r) =>
        typeof r === 'object' && r !== null
            ? {
                  id: typeof r.id === 'string' ? r.id : `att-${intUnique()}`,
                  label: String(r.label ?? ''),
                  url: String(r.url ?? ''),
                  size: String(r.size ?? ''),
              }
            : newContentAttachmentRow(),
    );
}

const HERO_IMAGE_MAX_BYTES = 2_500_000;
const HERO_MAX_SLIDES = 8;

function newHeroSlideRow() {
    return {
        id: `hs-${intUnique()}`,
        image: '',
        caption: '',
    };
}

function heroSlidesToEditorRows(slides) {
    const raw = Array.isArray(slides) ? slides : [];
    const rows = raw.map((s) => {
        const row = newHeroSlideRow();
        row.image = typeof s?.image === 'string' ? s.image : '';
        row.caption = String(s?.caption ?? s?.title ?? '').trim();
        return row;
    });
    return rows.length ? rows : [newHeroSlideRow()];
}

function readHeroImageFile(file) {
    return new Promise((resolve, reject) => {
        if (!file?.type?.startsWith('image/')) {
            reject(new Error('Please choose an image file.'));
            return;
        }
        if (file.size > HERO_IMAGE_MAX_BYTES) {
            reject(new Error('Image must be under 2.5 MB.'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Could not read image.'));
            }
        };
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.readAsDataURL(file);
    });
}

const GALLERY_MAX_IMAGES = 24;

function newGalleryImageRow() {
    return { id: `pg-${intUnique()}`, src: '', caption: '' };
}

/** @param {unknown} items */
function galleryItemsToEditorRows(items) {
    const raw = Array.isArray(items) ? items : [];
    const rows = raw.map((it) => {
        const row = newGalleryImageRow();
        if (typeof it === 'object' && it !== null) {
            if (typeof it.id === 'string') {
                row.id = it.id;
            }
            row.src = typeof it.src === 'string' ? it.src : '';
            row.caption = String(it.caption ?? '');
        }
        return row;
    });
    return rows.length ? rows : [newGalleryImageRow()];
}

/**
 * @param {object} props
 * @param {boolean} props.show
 * @param {object | null} props.instance — template instance { type, data, displayTitle?, personId?, membersGrid? }
 * @param {() => void} props.onClose
 * @param {(patch: object) => void} props.onApply — merge into instances[id]
 */
export default function WidgetConfigModal({ show, instance, onClose, onApply }) {
    const page = usePage();
    const cmsServices = Array.isArray(page.props.cmsServices)
        ? page.props.cmsServices
        : [];

    const [displayTitle, setDisplayTitle] = useState('');
    const [personId, setPersonId] = useState('p1');
    const [membersGrid, setMembersGrid] = useState({
        group: 'all',
        includeIds: [],
        excludeIds: [],
    });
    const [limit, setLimit] = useState(5);
    const [tenderVariant, setTenderVariant] = useState('default');
    const [html, setHtml] = useState('');
    const [hotlineLabel, setHotlineLabel] = useState('');
    const [hotlineNumber, setHotlineNumber] = useState('');
    const [hotlineDescription, setHotlineDescription] = useState('');
    const [heroSlides, setHeroSlides] = useState(() => [newHeroSlideRow()]);
    const [heroAutoplayMs, setHeroAutoplayMs] = useState(6000);
    const [showMessages, setShowMessages] = useState(true);
    const [svcSource, setSvcSource] = useState('catalog');
    const [svcMode, setSvcMode] = useState('all');
    const [svcLimit, setSvcLimit] = useState(8);
    const [svcInclude, setSvcInclude] = useState([]);
    const [svcExclude, setSvcExclude] = useState([]);
    const [svcManualItems, setSvcManualItems] = useState(() => [newSvcManualLinkRow()]);
    const [quickLinkItems, setQuickLinkItems] = useState(() => [newQuickLinkRow()]);
    const [galleryItems, setGalleryItems] = useState(() => [newGalleryImageRow()]);
    const [imageSrc, setImageSrc] = useState('');
    const [imageCaption, setImageCaption] = useState('');
    const [contentSource, setContentSource] = useState('manual');
    const [contentPageSlug, setContentPageSlug] = useState('');
    const [contentBody, setContentBody] = useState('');
    const [contentAttachments, setContentAttachments] = useState(
        () => [newContentAttachmentRow()],
    );

    useEffect(() => {
        if (!show || !instance) {
            return;
        }
        const people = getWidgetPeople();
        setDisplayTitle(
            instance.type === 'image'
                ? (instance.displayTitle ?? 'Image')
                : (instance.displayTitle ??
                      instance.data?.title ??
                      (instance.type === 'member-card'
                          ? instance.data?.designation
                          : '') ??
                      (instance.type === 'hotline' ? instance.data?.label : '') ??
                      ''),
        );
        setPersonId(
            instance.personId ??
                guessPersonIdFromCardData(instance.data, people) ??
                people[0]?.id ??
                'p1',
        );
        setMembersGrid(
            instance.membersGrid ?? {
                group: 'all',
                includeIds: [],
                excludeIds: [],
            },
        );
        setLimit(
            Number.isFinite(instance.data?.limit)
                ? instance.data.limit
                : Math.min(
                      instance.data?.items?.length ?? 5,
                      50,
                  ) || 5,
        );
        setTenderVariant(instance.data?.variant ?? 'default');
        setHtml(instance.data?.html ?? '');
        if (instance.type === 'hero') {
            setHeroSlides(heroSlidesToEditorRows(instance.data?.slides));
            setHeroAutoplayMs(
                Number.isFinite(instance.data?.autoplayMs)
                    ? Number(instance.data.autoplayMs)
                    : 6000,
            );
        }
        if (instance.type === 'member-card') {
            setShowMessages(instance.data?.showMessages !== false);
        }
        if (instance.type === 'hotline') {
            setHotlineLabel(String(instance.data?.label ?? ''));
            setHotlineNumber(String(instance.data?.number ?? ''));
            setHotlineDescription(String(instance.data?.description ?? ''));
        }
        if (instance.type === 'nav-services') {
            const q = instance.data?.serviceQuery;
            setSvcSource(instance.data?.serviceSource ?? 'catalog');
            setSvcMode(
                ['all', 'include', 'exclude'].includes(q?.mode) ? q.mode : 'all',
            );
            setSvcLimit(
                Number.isFinite(q?.limit) ? Math.min(50, Math.max(1, Number(q.limit))) : 8,
            );
            setSvcInclude(Array.isArray(q?.includeSlugs) ? [...q.includeSlugs] : []);
            setSvcExclude(Array.isArray(q?.excludeSlugs) ? [...q.excludeSlugs] : []);
            setSvcManualItems(normalizeSvcManualLinkRows(instance.data?.items));
        }
        if (instance.type === 'quick-links') {
            setQuickLinkItems(normalizeQuickLinkRows(instance.data?.items));
        }
        if (instance.type === 'photo-gallery') {
            setGalleryItems(galleryItemsToEditorRows(instance.data?.items));
        }
        if (instance.type === 'image') {
            setImageSrc(String(instance.data?.src ?? ''));
            setImageCaption(String(instance.data?.caption ?? ''));
        }
        if (instance.type === 'content') {
            setContentSource(instance.data?.source === 'page' ? 'page' : 'manual');
            setContentPageSlug(
                typeof instance.data?.pageSlug === 'string'
                    ? instance.data.pageSlug
                    : '',
            );
            setContentBody(
                typeof instance.data?.body === 'string' ? instance.data.body : '',
            );
            const rows = normalizeContentAttachmentRows(instance.data?.attachments);
            setContentAttachments(rows.length ? rows : [newContentAttachmentRow()]);
        }
    }, [show, instance]);

    if (!instance) {
        return null;
    }

    const catalogLabel =
        WIDGET_CATALOG.find((w) => w.type === instance.type)?.label ??
        instance.type;

    const cmsPagesCatalog = Array.isArray(page.props.cmsPagesCatalog)
        ? page.props.cmsPagesCatalog
        : [];

    const handleApply = () => {
        const type = instance.type;
        if (type === 'member-card') {
            const people = getWidgetPeople();
            const card = memberCardDataFromPersonId(personId, people);
            if (!card) {
                onClose();
                return;
            }
            onApply({
                displayTitle: displayTitle.trim() || card.designation,
                personId,
                data: {
                    ...instance.data,
                    ...card,
                    showMessages,
                    quote: showMessages ? (card.quote ?? instance.data?.quote ?? '') : '',
                },
            });
            onClose();
            return;
        }
        if (type === 'members-grid') {
            const people = getWidgetPeople();
            const members = buildMembersGridRows(membersGrid, people);
            onApply({
                displayTitle: displayTitle.trim() || 'Council Members',
                membersGrid: { ...membersGrid },
                data: {
                    ...instance.data,
                    title: displayTitle.trim() || instance.data.title,
                    members,
                },
            });
            onClose();
            return;
        }
        if (
            type === 'news-grid' ||
            type === 'notice-list' ||
            type === 'tender-list'
        ) {
            const lim = Math.min(50, Math.max(1, Number(limit) || 5));
            const items = (instance.data.items ?? []).slice(0, lim);
            const patch = {
                data: {
                    ...instance.data,
                    limit: lim,
                    items,
                },
            };
            if (type === 'tender-list') {
                patch.data.variant = tenderVariant;
            }
            if (type === 'notice-list' || type === 'tender-list') {
                patch.data.title =
                    displayTitle.trim() || instance.data.title;
            }
            if (type === 'news-grid') {
                patch.displayTitle = displayTitle.trim() || undefined;
            }
            onApply(patch);
            onClose();
            return;
        }
        if (type === 'custom-html') {
            onApply({
                data: { ...instance.data, html },
            });
            onClose();
            return;
        }
        if (type === 'content') {
            const slug = contentSource === 'page' ? contentPageSlug.trim() : '';
            if (contentSource === 'page' && slug === '') {
                window.alert(
                    'Choose a CMS page, or switch to “Own text (markdown)” to author content here.',
                );
                return;
            }
            const atts = contentAttachments
                .map(({ label, url, size }) => ({
                    label: String(label ?? '').trim(),
                    url: String(url ?? '').trim(),
                    size: String(size ?? '').trim(),
                }))
                .filter((a) => a.url !== '' || a.label !== '');
            const titleOut =
                displayTitle.trim() ||
                (typeof instance.data?.title === 'string'
                    ? instance.data.title
                    : '') ||
                '';
            onApply({
                displayTitle: titleOut || undefined,
                data: {
                    ...instance.data,
                    source: contentSource,
                    pageSlug: slug,
                    title: titleOut,
                    body: contentSource === 'manual' ? contentBody : '',
                    attachments: atts,
                },
            });
            onClose();
            return;
        }
        if (type === 'hero') {
            const slidesOut = heroSlides
                .map(({ image, caption }) => ({
                    image: String(image ?? '').trim(),
                    caption: String(caption ?? '').trim(),
                }))
                .filter((s) => s.image);
            if (slidesOut.length === 0) {
                window.alert('Add at least one slide with an image (URL or upload).');
                return;
            }
            const ms = Math.min(20000, Math.max(3000, Number(heroAutoplayMs) || 6000));
            onApply({
                data: {
                    ...instance.data,
                    slides: slidesOut,
                    autoplayMs: ms,
                },
            });
            onClose();
            return;
        }
        if (
            type === 'nav-services'
        ) {
            const lim = Math.min(50, Math.max(1, Number(svcLimit) || 8));
            const manualItemsOut =
                svcSource === 'manual'
                    ? svcManualItems
                          .map((row, i) => {
                              const label = String(row.label ?? '').trim();
                              const href = String(row.href ?? '').trim();
                              if (!label && !href) {
                                  return null;
                              }
                              const slug = String(row.id ?? `m${i}`).replace(/\s+/g, '-');
                              return {
                                  id: row.id,
                                  slug,
                                  label: label || 'Link',
                                  href: href || '#',
                              };
                          })
                          .filter(Boolean)
                    : null;
            onApply({
                data: {
                    ...instance.data,
                    title: displayTitle.trim() || instance.data.title,
                    serviceSource: svcSource,
                    serviceQuery: {
                        mode: svcMode,
                        limit: lim,
                        includeSlugs: [...svcInclude],
                        excludeSlugs: [...svcExclude],
                    },
                    ...(svcSource === 'manual' && manualItemsOut
                        ? { items: manualItemsOut }
                        : {}),
                },
            });
            onClose();
            return;
        }
        if (type === 'hotline') {
            const label =
                hotlineLabel.trim() ||
                String(instance.data?.label ?? '').trim() ||
                'Hotline';
            const number =
                hotlineNumber.trim() || String(instance.data?.number ?? '').trim();
            const description =
                hotlineDescription.trim() ||
                String(instance.data?.description ?? '').trim();
            onApply({
                displayTitle: displayTitle.trim() || undefined,
                data: {
                    ...instance.data,
                    label,
                    number,
                    description,
                },
            });
            onClose();
            return;
        }
        if (type === 'quick-links') {
            const itemsOut = quickLinkItems
                .map((row) => ({
                    id: row.id,
                    label: String(row.label ?? '').trim(),
                    href: String(row.href ?? '').trim(),
                }))
                .filter((r) => r.label !== '' || r.href !== '');
            onApply({
                displayTitle: displayTitle.trim() || undefined,
                data: {
                    ...instance.data,
                    title: displayTitle.trim() || instance.data?.title || 'Links',
                    items: itemsOut,
                },
            });
            onClose();
            return;
        }
        if (type === 'photo-gallery') {
            const itemsOut = galleryItems
                .map(({ src, caption }) => ({
                    src: String(src ?? '').trim(),
                    caption: String(caption ?? '').trim(),
                }))
                .filter((it) => it.src !== '');
            onApply({
                displayTitle: displayTitle.trim() || undefined,
                data: {
                    ...instance.data,
                    title: displayTitle.trim() || instance.data?.title || 'Photo gallery',
                    items: itemsOut,
                },
            });
            onClose();
            return;
        }
        if (type === 'image') {
            const srcOut = String(imageSrc ?? '').trim();
            const capOut = String(imageCaption ?? '').trim();
            onApply({
                displayTitle: displayTitle.trim() || 'Image',
                data: {
                    ...instance.data,
                    src: srcOut,
                    caption: capOut,
                },
            });
            onClose();
            return;
        }
        onApply({
            displayTitle: displayTitle.trim() || undefined,
        });
        onClose();
    };

    const patchHeroSlide = (index, patch) => {
        setHeroSlides((rows) =>
            rows.map((r, i) => (i === index ? { ...r, ...patch } : r)),
        );
    };

    const onHeroPickFile = async (index, e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) {
            return;
        }
        try {
            const url = await readHeroImageFile(file);
            patchHeroSlide(index, { image: url });
        } catch (err) {
            window.alert(err.message);
        }
    };

    const moveHeroSlide = (index, delta) => {
        setHeroSlides((rows) => {
            const j = index + delta;
            if (j < 0 || j >= rows.length) {
                return rows;
            }
            const next = [...rows];
            [next[index], next[j]] = [next[j], next[index]];
            return next;
        });
    };

    const removeHeroSlide = (index) => {
        setHeroSlides((rows) => {
            if (rows.length <= 1) {
                return [newHeroSlideRow()];
            }
            return rows.filter((_, i) => i !== index);
        });
    };

    const addHeroSlide = () => {
        setHeroSlides((rows) => {
            if (rows.length >= HERO_MAX_SLIDES) {
                return rows;
            }
            return [...rows, newHeroSlideRow()];
        });
    };

    const patchGalleryItem = (index, patch) => {
        setGalleryItems((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    };

    const onGalleryPickFile = async (index, e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) {
            return;
        }
        try {
            const url = await readHeroImageFile(file);
            patchGalleryItem(index, { src: url });
        } catch (err) {
            window.alert(err.message);
        }
    };

    const moveGalleryItem = (index, delta) => {
        setGalleryItems((rows) => {
            const j = index + delta;
            if (j < 0 || j >= rows.length) {
                return rows;
            }
            const next = [...rows];
            [next[index], next[j]] = [next[j], next[index]];
            return next;
        });
    };

    const removeGalleryItem = (index) => {
        setGalleryItems((rows) => {
            if (rows.length <= 1) {
                return [newGalleryImageRow()];
            }
            return rows.filter((_, i) => i !== index);
        });
    };

    const addGalleryItem = () => {
        setGalleryItems((rows) => {
            if (rows.length >= GALLERY_MAX_IMAGES) {
                return rows;
            }
            return [...rows, newGalleryImageRow()];
        });
    };

    const onImageBlockPickFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) {
            return;
        }
        try {
            const url = await readHeroImageFile(file);
            setImageSrc(url);
        } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Could not read image.');
        }
    };

    const showDisplayTitle = [
        'member-card',
        'members-grid',
        'news-grid',
        'notice-list',
        'tender-list',
        'nav-services',
        'hotline',
        'quick-links',
        'photo-gallery',
        'image',
        'content',
    ].includes(instance.type);

    return (
        <Modal show={show} onClose={onClose} maxWidth="md" variant="default">
            <div className="flex max-h-[90vh] flex-col rounded-xl bg-white p-6 text-slate-900 dark:bg-white dark:text-slate-900">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Configure widget
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            {catalogLabel}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-5">
                    {showDisplayTitle && (
                        <div className="space-y-2">
                            <label
                                htmlFor="wc-display-title"
                                className="text-sm font-semibold text-slate-900"
                            >
                                Display title
                            </label>
                            <input
                                id="wc-display-title"
                                value={displayTitle}
                                onChange={(e) => setDisplayTitle(e.target.value)}
                                placeholder="e.g. Mayor, CEO, Officer…"
                                className={fieldClass}
                            />
                            <p className="text-xs text-slate-500">
                                Same widget can appear multiple times — give each
                                a unique title.
                            </p>
                        </div>
                    )}

                    {instance.type === 'hotline' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500">
                                These fields control the public hotline card (heading, phone number, and supporting
                                text).
                            </p>
                            <div className="space-y-2">
                                <label
                                    htmlFor="wc-hotline-label"
                                    className="text-sm font-semibold text-slate-900"
                                >
                                    Card heading
                                </label>
                                <input
                                    id="wc-hotline-label"
                                    type="text"
                                    value={hotlineLabel}
                                    onChange={(e) => setHotlineLabel(e.target.value)}
                                    placeholder="e.g. Emergency Hotline"
                                    className={fieldClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="wc-hotline-number"
                                    className="text-sm font-semibold text-slate-900"
                                >
                                    Number
                                </label>
                                <input
                                    id="wc-hotline-number"
                                    type="text"
                                    value={hotlineNumber}
                                    onChange={(e) => setHotlineNumber(e.target.value)}
                                    placeholder="e.g. 16122"
                                    className={fieldClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="wc-hotline-desc"
                                    className="text-sm font-semibold text-slate-900"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="wc-hotline-desc"
                                    rows={4}
                                    value={hotlineDescription}
                                    onChange={(e) => setHotlineDescription(e.target.value)}
                                    placeholder="Short line shown under the number."
                                    className={fieldClass}
                                />
                            </div>
                        </div>
                    )}

                    {instance.type === 'quick-links' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500">
                                Display title above is the section heading on the site. Add links below (internal paths
                                or full URLs).
                            </p>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-slate-900">Links</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuickLinkItems((rows) => [...rows, newQuickLinkRow()])
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                                >
                                    <Plus className="size-3.5" aria-hidden />
                                    Add link
                                </button>
                            </div>
                            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
                                {quickLinkItems.map((row, ri) => (
                                    <li
                                        key={row.id}
                                        className="rounded-lg border border-slate-200 bg-slate-50/80 p-3"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-500">Link {ri + 1}</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    title="Move up"
                                                    disabled={ri === 0}
                                                    onClick={() =>
                                                        setQuickLinkItems((rows) => {
                                                            if (ri === 0) return rows;
                                                            const next = [...rows];
                                                            [next[ri - 1], next[ri]] = [next[ri], next[ri - 1]];
                                                            return next;
                                                        })
                                                    }
                                                    className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                                                >
                                                    <ChevronUp className="size-4" aria-hidden />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Move down"
                                                    disabled={ri === quickLinkItems.length - 1}
                                                    onClick={() =>
                                                        setQuickLinkItems((rows) => {
                                                            if (ri >= rows.length - 1) return rows;
                                                            const next = [...rows];
                                                            [next[ri], next[ri + 1]] = [next[ri + 1], next[ri]];
                                                            return next;
                                                        })
                                                    }
                                                    className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                                                >
                                                    <ChevronDown className="size-4" aria-hidden />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Remove"
                                                    onClick={() =>
                                                        setQuickLinkItems((rows) =>
                                                            rows.length <= 1
                                                                ? [newQuickLinkRow()]
                                                                : rows.filter((_, i) => i !== ri),
                                                        )
                                                    }
                                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <input
                                                placeholder="Label"
                                                value={row.label}
                                                onChange={(e) =>
                                                    setQuickLinkItems((rows) =>
                                                        rows.map((r, i) =>
                                                            i === ri ? { ...r, label: e.target.value } : r,
                                                        ),
                                                    )
                                                }
                                                className={fieldClass}
                                            />
                                            <input
                                                placeholder="URL (/p/about or https://…)"
                                                value={row.href}
                                                onChange={(e) =>
                                                    setQuickLinkItems((rows) =>
                                                        rows.map((r, i) =>
                                                            i === ri ? { ...r, href: e.target.value } : r,
                                                        ),
                                                    )
                                                }
                                                className={fieldClass}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-slate-500">
                                Rows with both fields empty are omitted. External https links open in a new tab on the
                                public site.
                            </p>
                        </div>
                    )}

                    {instance.type === 'photo-gallery' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500">
                                Add images by URL or upload (stored as data in the layout, same as hero — prefer URLs
                                for smaller saves). Optional caption under each image.
                            </p>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-slate-900">Images</span>
                                <button
                                    type="button"
                                    onClick={addGalleryItem}
                                    disabled={galleryItems.length >= GALLERY_MAX_IMAGES}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus className="size-3.5" aria-hidden />
                                    Add image
                                </button>
                            </div>
                            <ul className="max-h-[min(70vh,28rem)] space-y-4 overflow-y-auto pr-1">
                                {galleryItems.map((row, gi) => (
                                    <li
                                        key={row.id}
                                        className="rounded-lg border border-slate-200 bg-slate-50/80 p-3"
                                    >
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <span className="text-xs font-medium text-slate-500">Image {gi + 1}</span>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    title="Move up"
                                                    disabled={gi === 0}
                                                    onClick={() => moveGalleryItem(gi, -1)}
                                                    className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                                                >
                                                    <ChevronUp className="size-4" aria-hidden />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Move down"
                                                    disabled={gi === galleryItems.length - 1}
                                                    onClick={() => moveGalleryItem(gi, 1)}
                                                    className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                                                >
                                                    <ChevronDown className="size-4" aria-hidden />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Remove"
                                                    onClick={() => removeGalleryItem(gi)}
                                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                            <div className="shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white sm:w-28">
                                                {row.src ? (
                                                    <img
                                                        src={row.src}
                                                        alt=""
                                                        className="aspect-[4/3] w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex aspect-[4/3] w-full items-center justify-center text-[10px] text-slate-400">
                                                        Preview
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div>
                                                    <label
                                                        className="text-xs font-medium text-slate-600"
                                                        htmlFor={`wc-pg-src-${row.id}`}
                                                    >
                                                        Image URL
                                                    </label>
                                                    <input
                                                        id={`wc-pg-src-${row.id}`}
                                                        type="url"
                                                        value={row.src.startsWith('data:') ? '' : row.src}
                                                        onChange={(e) =>
                                                            patchGalleryItem(gi, { src: e.target.value })
                                                        }
                                                        placeholder="https://…"
                                                        className={`${fieldClass} mt-0.5`}
                                                    />
                                                    {row.src.startsWith('data:') ? (
                                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                                            Uploaded image is set. Paste a URL above to replace.
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div>
                                                    <label
                                                        className="sr-only"
                                                        htmlFor={`wc-pg-file-${row.id}`}
                                                    >
                                                        Upload image {gi + 1}
                                                    </label>
                                                    <input
                                                        id={`wc-pg-file-${row.id}`}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => onGalleryPickFile(gi, e)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            document.getElementById(`wc-pg-file-${row.id}`)?.click()
                                                        }
                                                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 sm:w-auto"
                                                    >
                                                        <Upload className="size-3.5" aria-hidden />
                                                        Upload image
                                                    </button>
                                                </div>
                                                <div>
                                                    <label
                                                        className="text-xs font-medium text-slate-600"
                                                        htmlFor={`wc-pg-cap-${row.id}`}
                                                    >
                                                        Caption (optional)
                                                    </label>
                                                    <input
                                                        id={`wc-pg-cap-${row.id}`}
                                                        type="text"
                                                        value={row.caption}
                                                        onChange={(e) =>
                                                            patchGalleryItem(gi, { caption: e.target.value })
                                                        }
                                                        placeholder="Short caption"
                                                        className={`${fieldClass} mt-0.5`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-slate-500">
                                Up to {GALLERY_MAX_IMAGES} images · rows without an image URL are not saved.
                            </p>
                        </div>
                    )}

                    {instance.type === 'image' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500">
                                Upload one image or paste a URL (stored in the layout JSON like the hero — prefer URLs
                                for smaller saves).
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                <div className="shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white sm:w-36">
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt=""
                                            className="aspect-[4/3] w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex aspect-[4/3] w-full items-center justify-center text-[10px] text-slate-400">
                                            Preview
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div>
                                        <label
                                            className="text-xs font-medium text-slate-600"
                                            htmlFor="wc-image-src"
                                        >
                                            Image URL
                                        </label>
                                        <input
                                            id="wc-image-src"
                                            type="url"
                                            value={imageSrc.startsWith('data:') ? '' : imageSrc}
                                            onChange={(e) => setImageSrc(e.target.value)}
                                            placeholder="https://…"
                                            className={`${fieldClass} mt-0.5`}
                                        />
                                        {imageSrc.startsWith('data:') ? (
                                            <p className="mt-0.5 text-[10px] text-slate-500">
                                                Uploaded image is set. Paste a URL above to replace.
                                            </p>
                                        ) : null}
                                    </div>
                                    <div>
                                        <label className="sr-only" htmlFor="wc-image-file">
                                            Upload image
                                        </label>
                                        <input
                                            id="wc-image-file"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={onImageBlockPickFile}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('wc-image-file')?.click()}
                                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 sm:w-auto"
                                        >
                                            <Upload className="size-3.5" aria-hidden />
                                            Upload image
                                        </button>
                                    </div>
                                    <div>
                                        <label
                                            className="text-xs font-medium text-slate-600"
                                            htmlFor="wc-image-caption"
                                        >
                                            Title (optional)
                                        </label>
                                        <input
                                            id="wc-image-caption"
                                            type="text"
                                            value={imageCaption}
                                            onChange={(e) => setImageCaption(e.target.value)}
                                            placeholder="Shown under the image on the public site"
                                            className={`${fieldClass} mt-0.5`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {instance.type === 'member-card' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900">
                                    Person
                                </label>
                                <div className="relative">
                                    <select
                                        value={personId}
                                        onChange={(e) =>
                                            setPersonId(e.target.value)
                                        }
                                        className={`${fieldClass} appearance-none pr-9`}
                                    >
                                        {getWidgetPeople().map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {personSelectLabel(p)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3">
                                <Checkbox
                                    checked={showMessages}
                                    onChange={(e) => setShowMessages(e.target.checked)}
                                    className="mt-0.5 size-4 rounded border-slate-300 text-civic focus:ring-civic/30"
                                />
                                <span>
                                    <span className="block text-sm font-semibold text-slate-900">
                                        Show messages?
                                    </span>
                                    <span className="mt-0.5 block text-xs text-slate-500">
                                        When on, the card shows the button that opens the full &ldquo;Message from&rdquo;
                                        dialog. Edit the letter under Admin → Members → edit member → Public message.
                                    </span>
                                </span>
                            </label>
                        </div>
                    )}

                    {instance.type === 'members-grid' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900">
                                    Member group
                                </label>
                                <div className="relative">
                                    <select
                                        value={membersGrid.group}
                                        onChange={(e) =>
                                            setMembersGrid((m) => ({
                                                ...m,
                                                group: e.target.value,
                                            }))
                                        }
                                        className={`${fieldClass} appearance-none pr-9`}
                                    >
                                        {MEMBER_GROUP_OPTIONS.map((o) => (
                                            <option
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>
                            <PeoplePicker
                                label="Force include"
                                helper="Always show these people regardless of group filter."
                                people={getWidgetPeople()}
                                value={membersGrid.includeIds}
                                onChange={(ids) =>
                                    setMembersGrid((m) => ({
                                        ...m,
                                        includeIds: ids,
                                    }))
                                }
                            />
                            <PeoplePicker
                                label="Exclude"
                                helper="Hide these people from this widget instance."
                                people={getWidgetPeople()}
                                value={membersGrid.excludeIds}
                                onChange={(ids) =>
                                    setMembersGrid((m) => ({
                                        ...m,
                                        excludeIds: ids,
                                    }))
                                }
                            />
                        </>
                    )}

                    {(instance.type === 'news-grid' ||
                        instance.type === 'notice-list' ||
                        instance.type === 'tender-list') && (
                        <div className="space-y-2">
                            <label
                                htmlFor="wc-limit"
                                className="text-sm font-semibold text-slate-900"
                            >
                                Item limit
                            </label>
                            <input
                                id="wc-limit"
                                type="number"
                                min={1}
                                max={50}
                                value={limit}
                                onChange={(e) =>
                                    setLimit(Number(e.target.value))
                                }
                                className={fieldClass}
                            />
                        </div>
                    )}

                    {instance.type === 'tender-list' && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-900">
                                Header style
                            </label>
                            <div className="relative">
                                <select
                                    value={tenderVariant}
                                    onChange={(e) =>
                                        setTenderVariant(e.target.value)
                                    }
                                    className={`${fieldClass} appearance-none pr-9`}
                                >
                                    <option value="default">Default</option>
                                    <option value="accent">Accent</option>
                                    <option value="architectural">
                                        Architectural
                                    </option>
                                    <option value="banner">Banner</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>
                    )}

                    {instance.type === 'hero' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="wc-hero-autoplay"
                                    className="text-sm font-semibold text-slate-900"
                                >
                                    Autoplay interval (ms)
                                </label>
                                <input
                                    id="wc-hero-autoplay"
                                    type="number"
                                    min={3000}
                                    max={20000}
                                    step={500}
                                    value={heroAutoplayMs}
                                    onChange={(e) =>
                                        setHeroAutoplayMs(Number(e.target.value) || 6000)
                                    }
                                    className={fieldClass}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-900">Slides</p>
                                <button
                                    type="button"
                                    onClick={addHeroSlide}
                                    disabled={heroSlides.length >= HERO_MAX_SLIDES}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Plus className="size-3.5" aria-hidden />
                                    Add slide
                                </button>
                            </div>
                            <ul className="max-h-[min(52vh,420px)] space-y-3 overflow-y-auto pr-1">
                                {heroSlides.map((slide, si) => (
                                    <li
                                        key={slide.id}
                                        className="rounded-lg border border-slate-200 bg-slate-50/80 p-3"
                                    >
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <span className="text-xs font-medium text-slate-500">
                                                Slide {si + 1}
                                            </span>
                                            <div className="flex shrink-0 items-center gap-0.5">
                                                <button
                                                    type="button"
                                                    title="Move up"
                                                    onClick={() => moveHeroSlide(si, -1)}
                                                    disabled={si === 0}
                                                    className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30"
                                                >
                                                    <ChevronUp className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Move down"
                                                    onClick={() => moveHeroSlide(si, 1)}
                                                    disabled={si === heroSlides.length - 1}
                                                    className="rounded p-1 text-slate-500 hover:bg-white disabled:opacity-30"
                                                >
                                                    <ChevronDown className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Remove slide"
                                                    onClick={() => removeHeroSlide(si)}
                                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-[minmax(0,7rem)_1fr]">
                                            <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-200">
                                                {slide.image ? (
                                                    <img
                                                        src={slide.image}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center p-1 text-center text-[10px] text-slate-500">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 space-y-2">
                                                <div>
                                                    <label
                                                        className="text-xs font-medium text-slate-600"
                                                        htmlFor={`wc-hero-url-${slide.id}`}
                                                    >
                                                        Image URL
                                                    </label>
                                                    <input
                                                        id={`wc-hero-url-${slide.id}`}
                                                        type="url"
                                                        value={slide.image.startsWith('data:') ? '' : slide.image}
                                                        onChange={(e) =>
                                                            patchHeroSlide(si, {
                                                                image: e.target.value,
                                                            })
                                                        }
                                                        placeholder="https://…"
                                                        className={`${fieldClass} mt-0.5`}
                                                    />
                                                    {slide.image.startsWith('data:') ? (
                                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                                            Uploaded image (saved in layout). Use URL field to replace.
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div>
                                                    <label className="sr-only" htmlFor={`wc-hero-file-${slide.id}`}>
                                                        Upload image for slide {si + 1}
                                                    </label>
                                                    <input
                                                        id={`wc-hero-file-${slide.id}`}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => onHeroPickFile(si, e)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            document.getElementById(`wc-hero-file-${slide.id}`)?.click()
                                                        }
                                                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                                                    >
                                                        <Upload className="size-3.5" aria-hidden />
                                                        Upload image
                                                    </button>
                                                </div>
                                                <div>
                                                    <label
                                                        className="text-xs font-medium text-slate-600"
                                                        htmlFor={`wc-hero-cap-${slide.id}`}
                                                    >
                                                        Caption (optional)
                                                    </label>
                                                    <input
                                                        id={`wc-hero-cap-${slide.id}`}
                                                        type="text"
                                                        value={slide.caption}
                                                        onChange={(e) =>
                                                            patchHeroSlide(si, {
                                                                caption: e.target.value,
                                                            })
                                                        }
                                                        placeholder="Short line on the slide"
                                                        className={`${fieldClass} mt-0.5`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-slate-500">
                                Up to {HERO_MAX_SLIDES} slides · images stored as URL or embedded (session layout; use
                                URLs for smaller saves).
                            </p>
                        </div>
                    )}

                    {instance.type === 'nav-services' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900">
                                    List source
                                </label>
                                <div className="relative">
                                    <select
                                        value={svcSource}
                                        onChange={(e) => setSvcSource(e.target.value)}
                                        className={`${fieldClass} appearance-none pr-9`}
                                    >
                                        <option value="catalog">
                                            Citizen services catalog (dynamic)
                                        </option>
                                        <option value="manual">Manual links (legacy)</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                </div>
                                <p className="text-xs text-slate-500">
                                    Dynamic list uses services from CMS config (and seeded catalog when present).
                                </p>
                            </div>
                            {svcSource === 'catalog' && (
                                <>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="wc-svc-limit"
                                            className="text-sm font-semibold text-slate-900"
                                        >
                                            Max items to show
                                        </label>
                                        <input
                                            id="wc-svc-limit"
                                            type="number"
                                            min={1}
                                            max={50}
                                            value={svcLimit}
                                            onChange={(e) => setSvcLimit(e.target.value)}
                                            className={fieldClass}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-semibold text-slate-900">
                                            Selection mode
                                        </span>
                                        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                                            <label className="flex cursor-pointer items-start gap-2">
                                                <input
                                                    type="radio"
                                                    name="svc-mode"
                                                    checked={svcMode === 'all'}
                                                    onChange={() => {
                                                        setSvcMode('all');
                                                    }}
                                                    className="mt-1"
                                                />
                                                <span>
                                                    <span className="block text-sm font-medium text-slate-900">
                                                        All services
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        Show every catalog entry up to the limit (catalog order).
                                                    </span>
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-start gap-2">
                                                <input
                                                    type="radio"
                                                    name="svc-mode"
                                                    checked={svcMode === 'include'}
                                                    onChange={() => setSvcMode('include')}
                                                    className="mt-1"
                                                />
                                                <span>
                                                    <span className="block text-sm font-medium text-slate-900">
                                                        Include only selected
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        Pick which services appear (order follows your selection
                                                        order).
                                                    </span>
                                                </span>
                                            </label>
                                            <label className="flex cursor-pointer items-start gap-2">
                                                <input
                                                    type="radio"
                                                    name="svc-mode"
                                                    checked={svcMode === 'exclude'}
                                                    onChange={() => setSvcMode('exclude')}
                                                    className="mt-1"
                                                />
                                                <span>
                                                    <span className="block text-sm font-medium text-slate-900">
                                                        Exclude selected
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        Hide specific services from the full catalog.
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    {(svcMode === 'include' || svcMode === 'exclude') && (
                                        <div className="space-y-2">
                                            <span className="text-sm font-semibold text-slate-900">
                                                {svcMode === 'include' ? 'Include' : 'Exclude'} services
                                            </span>
                                            <div className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                                                {cmsServices.length === 0 ? (
                                                    <p className="p-3 text-xs text-slate-500">
                                                        No services in catalog. Add services in config or re-seed.
                                                    </p>
                                                ) : (
                                                    cmsServices.map((s) => {
                                                        const slug = String(s.slug ?? '').trim();
                                                        if (!slug) return null;
                                                        const activeList =
                                                            svcMode === 'include' ? svcInclude : svcExclude;
                                                        const checked = activeList.includes(slug);
                                                        return (
                                                            <label
                                                                key={slug}
                                                                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-slate-50"
                                                            >
                                                                <Checkbox
                                                                    checked={checked}
                                                                    onChange={() => {
                                                                        if (svcMode === 'include') {
                                                                            setSvcInclude((prev) =>
                                                                                prev.includes(slug)
                                                                                    ? prev.filter((x) => x !== slug)
                                                                                    : [...prev, slug],
                                                                            );
                                                                        } else {
                                                                            setSvcExclude((prev) =>
                                                                                prev.includes(slug)
                                                                                    ? prev.filter((x) => x !== slug)
                                                                                    : [...prev, slug],
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="size-4 rounded border-slate-300 text-civic focus:ring-civic/30"
                                                                />
                                                                <span className="text-sm text-slate-900">
                                                                    {s.title ?? slug}
                                                                </span>
                                                            </label>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {svcSource === 'manual' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-slate-900">Manual links</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSvcManualItems((rows) => [...rows, newSvcManualLinkRow()])
                                            }
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                                        >
                                            <Plus className="size-3.5" aria-hidden />
                                            Add link
                                        </button>
                                    </div>
                                    <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
                                        {svcManualItems.map((row, ri) => (
                                            <li
                                                key={row.id}
                                                className="rounded-lg border border-slate-200 bg-slate-50/80 p-3"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-500">
                                                        Link {ri + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        title="Remove"
                                                        onClick={() =>
                                                            setSvcManualItems((rows) =>
                                                                rows.length <= 1
                                                                    ? [newSvcManualLinkRow()]
                                                                    : rows.filter((_, i) => i !== ri),
                                                            )
                                                        }
                                                        className="rounded p-1 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                                <div className="grid gap-2">
                                                    <input
                                                        placeholder="Label (e.g. Trade licence)"
                                                        value={row.label}
                                                        onChange={(e) =>
                                                            setSvcManualItems((rows) =>
                                                                rows.map((r, i) =>
                                                                    i === ri
                                                                        ? { ...r, label: e.target.value }
                                                                        : r,
                                                                ),
                                                            )
                                                        }
                                                        className={fieldClass}
                                                    />
                                                    <input
                                                        placeholder="URL (/services/slug or https://…)"
                                                        value={row.href}
                                                        onChange={(e) =>
                                                            setSvcManualItems((rows) =>
                                                                rows.map((r, i) =>
                                                                    i === ri
                                                                        ? { ...r, href: e.target.value }
                                                                        : r,
                                                                ),
                                                            )
                                                        }
                                                        className={fieldClass}
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-xs text-slate-500">
                                        Rows with both label and URL empty are skipped. Order here is the order on the
                                        site.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {instance.type === 'content' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="wc-content-source"
                                    className="text-sm font-semibold text-slate-900"
                                >
                                    Body source
                                </label>
                                <div className="relative">
                                    <select
                                        id="wc-content-source"
                                        value={contentSource}
                                        onChange={(e) =>
                                            setContentSource(e.target.value)
                                        }
                                        className={`${fieldClass} appearance-none pr-9`}
                                    >
                                        <option value="manual">
                                            Own text (markdown)
                                        </option>
                                        <option value="page">CMS page</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                </div>
                                <p className="text-xs text-slate-500">
                                    CMS page uses the title and markdown body saved under Admin → Content for that
                                    slug. Attachments are always configured below.
                                </p>
                            </div>
                            {contentSource === 'page' ? (
                                <div className="space-y-2">
                                    <label
                                        htmlFor="wc-content-page"
                                        className="text-sm font-semibold text-slate-900"
                                    >
                                        Page
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="wc-content-page"
                                            value={contentPageSlug}
                                            onChange={(e) =>
                                                setContentPageSlug(e.target.value)
                                            }
                                            className={`${fieldClass} appearance-none pr-9`}
                                        >
                                            <option value="">Select page…</option>
                                            {cmsPagesCatalog.map((p) => (
                                                <option
                                                    key={p.slug}
                                                    value={String(p.slug ?? '')}
                                                >
                                                    {p.title || p.slug}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label
                                        htmlFor="wc-content-body"
                                        className="text-sm font-semibold text-slate-900"
                                    >
                                        Markdown body
                                    </label>
                                    <textarea
                                        id="wc-content-body"
                                        rows={10}
                                        value={contentBody}
                                        onChange={(e) =>
                                            setContentBody(e.target.value)
                                        }
                                        placeholder={'## Heading\n\nParagraph with **bold**.'}
                                        className={`${fieldClass} font-mono text-xs`}
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-slate-900">
                                        Attached files
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setContentAttachments((rows) => [
                                                ...rows,
                                                newContentAttachmentRow(),
                                            ])
                                        }
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                                    >
                                        <Plus className="size-3.5" aria-hidden />
                                        Add file
                                    </button>
                                </div>
                                <ul className="max-h-60 space-y-3 overflow-y-auto pr-1">
                                    {contentAttachments.map((row, ri) => (
                                        <li
                                            key={row.id}
                                            className="rounded-lg border border-slate-200 bg-slate-50/80 p-3"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-500">
                                                    File {ri + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    title="Remove"
                                                    onClick={() =>
                                                        setContentAttachments(
                                                            (rows) =>
                                                                rows.length <= 1
                                                                    ? [
                                                                          newContentAttachmentRow(),
                                                                      ]
                                                                    : rows.filter(
                                                                          (_, i) =>
                                                                              i !==
                                                                              ri,
                                                                      ),
                                                        )
                                                    }
                                                    className="rounded p-1 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                            <div className="grid gap-2">
                                                <input
                                                    placeholder="Label (e.g. Notice PDF)"
                                                    value={row.label}
                                                    onChange={(e) =>
                                                        setContentAttachments(
                                                            (rows) =>
                                                                rows.map((r, i) =>
                                                                    i === ri
                                                                        ? {
                                                                              ...r,
                                                                              label: e.target
                                                                                  .value,
                                                                          }
                                                                        : r,
                                                                ),
                                                        )
                                                    }
                                                    className={fieldClass}
                                                />
                                                <input
                                                    placeholder="URL (/storage/… or https://…)"
                                                    value={row.url}
                                                    onChange={(e) =>
                                                        setContentAttachments(
                                                            (rows) =>
                                                                rows.map((r, i) =>
                                                                    i === ri
                                                                        ? {
                                                                              ...r,
                                                                              url: e.target
                                                                                  .value,
                                                                          }
                                                                        : r,
                                                                ),
                                                        )
                                                    }
                                                    className={fieldClass}
                                                />
                                                <input
                                                    placeholder="Size (optional, e.g. 1.2 MB)"
                                                    value={row.size}
                                                    onChange={(e) =>
                                                        setContentAttachments(
                                                            (rows) =>
                                                                rows.map((r, i) =>
                                                                    i === ri
                                                                        ? {
                                                                              ...r,
                                                                              size: e.target
                                                                                  .value,
                                                                          }
                                                                        : r,
                                                                ),
                                                        )
                                                    }
                                                    className={fieldClass}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {instance.type === 'custom-html' && (
                        <div className="space-y-2">
                            <label
                                htmlFor="wc-html"
                                className="text-sm font-semibold text-slate-900"
                            >
                                Custom HTML
                            </label>
                            <textarea
                                id="wc-html"
                                rows={10}
                                value={html}
                                onChange={(e) => setHtml(e.target.value)}
                                placeholder="<div>Your HTML here…</div>"
                                className={`${fieldClass} font-mono text-xs`}
                            />
                            <p className="text-xs text-slate-500">
                                Sanitize server-side before render in production.
                                Avoid inline scripts.
                            </p>
                        </div>
                    )}

                    {![
                        'member-card',
                        'members-grid',
                        'news-grid',
                        'notice-list',
                        'tender-list',
                        'custom-html',
                        'content',
                        'hero',
                        'nav-services',
                        'hotline',
                        'quick-links',
                        'photo-gallery',
                        'image',
                    ].includes(instance.type) && (
                        <p className="text-sm text-slate-500">
                            Adjust display title above. Further options for this widget type can be added when the API
                            is ready.
                        </p>
                    )}
                </div>

                <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={handleApply}
                        className="w-full rounded-lg bg-civic py-2.5 text-sm font-semibold text-civic-foreground shadow-sm hover:bg-civic/90"
                    >
                        Save changes
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                        <X className="size-4" />
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
