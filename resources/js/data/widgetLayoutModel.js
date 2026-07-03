/**
 * Admin templates model — JSON shape persisted to cms_settings.homepage_widget_layout.
 *
 * Multiple named templates can be created. Each template chooses a column layout
 * from {@link CMS_PAGE_LAYOUT_TEMPLATES} and stores widgets per visible zone.
 * Two roles are special:
 *   - `kind: 'homepage'`  → drives the public homepage (widgets + column layout from cms_settings).
 *   - `kind: 'inner-page'` → drives /p/{slug} and /services/{slug} sidebars/layout.
 */
import { homepageWidgets } from '@/data/homepageWidgets';
import { intUnique } from '@/utils/intUnique';
import {
    buildMembersGridRows,
    guessPersonIdFromCardData,
    memberCardDataFromPersonId,
} from '@/data/widgetPeopleDirectory';

export const WIDGET_LAYOUT_STORAGE_KEY = 'pabna_widget_layout_v1';

export const COLUMN_LAYOUTS = ['full', 'content-left', 'content-right', 'three-column'];

export const COLUMN_LAYOUT_LABELS = {
    full: 'Full width',
    'content-left': 'Left sidebar + content',
    'content-right': 'Content + right sidebar',
    'three-column': 'Left + content + right',
};

export const COLUMN_LAYOUT_SHORT_LABELS = {
    full: 'Full width',
    'content-left': 'Sidebar left',
    'content-right': 'Sidebar right',
    'three-column': 'Three columns',
};

export const COLUMN_LAYOUT_ICON_IDS = {
    full: 'layout-template',
    'content-left': 'panel-left',
    'content-right': 'panel-right',
    'three-column': 'columns-3',
};

export const TEMPLATE_KINDS = ['homepage', 'inner-page', 'custom'];

export const TEMPLATE_KIND_LABELS = {
    homepage: 'Homepage',
    'inner-page': 'Inner page',
    custom: 'Custom',
};

/**
 * @param {string | undefined | null} raw
 * @returns {'full'|'content-left'|'content-right'|'three-column'}
 */
export function normalizeTemplateColumnLayout(raw) {
    if (typeof raw === 'string' && COLUMN_LAYOUTS.includes(raw)) {
        return raw;
    }
    return 'content-right';
}

/**
 * @param {string | undefined | null} raw
 * @returns {'homepage'|'inner-page'|'custom'}
 */
export function normalizeTemplateKind(raw) {
    if (typeof raw === 'string' && TEMPLATE_KINDS.includes(raw)) {
        return raw;
    }
    return 'custom';
}

/**
 * @param {'full'|'content-left'|'content-right'|'three-column'} columnLayout
 * @returns {('left'|'main'|'right')[]}
 */
export function visibleZonesForColumnLayout(columnLayout) {
    switch (normalizeTemplateColumnLayout(columnLayout)) {
        case 'full':
            return ['main'];
        case 'content-left':
            return ['left', 'main'];
        case 'content-right':
            return ['main', 'right'];
        case 'three-column':
        default:
            return ['left', 'main', 'right'];
    }
}

let seq = 0;
function nextDefaultInstanceId(prefix = 'default') {
    seq += 1;
    return `wi-${prefix}-${seq}`;
}

function resetDefaultIdSeq() {
    seq = 0;
}

/** Deterministic clone of current homepage seed for SSR/client first paint. */
export function createHomepageTemplateDeterministic(name = 'Homepage') {
    resetDefaultIdSeq();
    const zones = { left: [], main: [], right: [] };
    const instances = {};
    for (const w of homepageWidgets) {
        const id = nextDefaultInstanceId('homepage');
        zones[w.position].push(id);
        instances[id] = { type: w.type, data: structuredClone(w.data) };
    }
    return {
        id: 'tpl-homepage',
        name,
        kind: 'homepage',
        columnLayout: 'three-column',
        zones,
        instances,
    };
}

export function createInnerPageTemplateDeterministic(name = 'Inner page') {
    return {
        id: 'tpl-inner-page',
        name,
        kind: 'inner-page',
        columnLayout: 'content-right',
        zones: { left: [], main: [], right: [] },
        instances: {},
    };
}

export function newWidgetInstanceId() {
    return `wi-${intUnique()}`;
}

export function newTemplateId() {
    return `tpl-${intUnique()}`;
}

let defaultDataByTypeCache = null;

function buildDefaultDataByType() {
    if (defaultDataByTypeCache) {
        return defaultDataByTypeCache;
    }
    const map = {};
    for (const w of homepageWidgets) {
        if (!map[w.type]) {
            map[w.type] = structuredClone(w.data);
        }
    }
    map['photo-gallery'] = {
        title: 'Photo gallery',
        items: [
            {
                src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
                caption: 'Greenbelt programme',
            },
            {
                src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
                caption: 'City development',
            },
        ],
    };
    if (!map.image) {
        map.image = {
            src: '',
            caption: '',
        };
    }
    map['custom-html'] = {
        html: '<p class="text-sm leading-relaxed text-muted-foreground">Add your <strong>custom HTML</strong> here. This block is rendered on the public homepage.</p>',
    };
    map.content = {
        source: 'manual',
        pageSlug: '',
        title: 'Announcement',
        body: 'Use **markdown** for the main text. Switch to “CMS page” to pull body text from an existing page.',
        attachments: [{ label: 'Sample PDF', url: '#', size: '120 KB' }],
    };
    defaultDataByTypeCache = map;
    return map;
}

export function defaultDataForWidgetType(type) {
    const d = buildDefaultDataByType()[type];
    return d ? structuredClone(d) : {};
}

/** New instance metadata + data (personId, displayTitle, membersGrid) for admin. */
export function enrichNewWidgetInstance(type, data) {
    const dataCopy = structuredClone(data);
    if (type === 'member-card') {
        const pid = guessPersonIdFromCardData(dataCopy) ?? 'p1';
        const card = memberCardDataFromPersonId(pid);
        return {
            data: { ...dataCopy, ...card },
            personId: pid,
            displayTitle: card?.designation ?? 'Person card',
        };
    }
    if (type === 'members-grid') {
        const membersGrid = {
            group: 'all',
            includeIds: [],
            excludeIds: [],
        };
        return {
            data: {
                ...dataCopy,
                members: buildMembersGridRows(membersGrid),
            },
            displayTitle: dataCopy.title,
            membersGrid,
        };
    }
    if (type === 'nav-services') {
        const sq = dataCopy.serviceQuery && typeof dataCopy.serviceQuery === 'object' ? dataCopy.serviceQuery : {};
        return {
            data: {
                ...dataCopy,
                serviceSource: dataCopy.serviceSource ?? 'catalog',
                serviceQuery: {
                    mode: ['all', 'include', 'exclude'].includes(sq.mode) ? sq.mode : 'all',
                    limit: Number.isFinite(sq.limit) ? Math.min(50, Math.max(1, Number(sq.limit))) : 8,
                    includeSlugs: Array.isArray(sq.includeSlugs) ? [...sq.includeSlugs] : [],
                    excludeSlugs: Array.isArray(sq.excludeSlugs) ? [...sq.excludeSlugs] : [],
                },
            },
            displayTitle: dataCopy.title ?? 'Citizen Services',
        };
    }
    if (type === 'content') {
        return {
            data: dataCopy,
            displayTitle: dataCopy.title ?? 'Content',
        };
    }
    if (type === 'hotline') {
        return {
            data: dataCopy,
            displayTitle: dataCopy.label ?? 'Hotline',
        };
    }
    if (type === 'quick-links') {
        return {
            data: dataCopy,
            displayTitle: dataCopy.title ?? 'Quick links',
        };
    }
    if (type === 'photo-gallery') {
        return {
            data: dataCopy,
            displayTitle: dataCopy.title ?? 'Photo gallery',
        };
    }
    if (type === 'image') {
        return {
            data: dataCopy,
            displayTitle: 'Image',
        };
    }
    return { data: dataCopy };
}

export function templateToHomepageWidgets(template) {
    const out = [];
    for (const zone of ['left', 'main', 'right']) {
        for (const id of template.zones[zone]) {
            const inst = template.instances[id];
            if (!inst) {
                continue;
            }
            out.push({
                type: inst.type,
                position: zone,
                data: structuredClone(inst.data),
            });
        }
    }
    return out;
}

export function initialLayoutState() {
    const home = createHomepageTemplateDeterministic('Homepage');
    const inner = createInnerPageTemplateDeterministic('Inner page');
    return {
        templates: [home, inner],
        activeTemplateId: home.id,
        applyToPublicHome: true,
    };
}

function normalizeOneTemplate(raw, fallbackId) {
    const zones =
        raw?.zones && typeof raw.zones === 'object'
            ? {
                  left: Array.isArray(raw.zones.left) ? [...raw.zones.left] : [],
                  main: Array.isArray(raw.zones.main) ? [...raw.zones.main] : [],
                  right: Array.isArray(raw.zones.right) ? [...raw.zones.right] : [],
              }
            : { left: [], main: [], right: [] };
    const instances =
        raw?.instances && typeof raw.instances === 'object'
            ? { ...raw.instances }
            : {};
    return {
        id: typeof raw?.id === 'string' && raw.id !== '' ? raw.id : fallbackId,
        name: typeof raw?.name === 'string' && raw.name !== '' ? raw.name : 'Template',
        kind: normalizeTemplateKind(raw?.kind),
        columnLayout: normalizeTemplateColumnLayout(raw?.columnLayout),
        zones,
        instances,
    };
}

/**
 * Normalize a saved layout payload. Older payloads may have a single template
 * pinned to `tpl-default` — we keep it but ensure at least Homepage + Inner page templates exist.
 *
 * @param {object | null | undefined} raw
 */
export function normalizeLayoutPayload(raw) {
    if (!raw || !Array.isArray(raw.templates) || raw.templates.length === 0) {
        return initialLayoutState();
    }
    const templates = raw.templates.map((t, i) => normalizeOneTemplate(t, `tpl-${i + 1}`));

    let hasHomepage = templates.some((t) => t.kind === 'homepage');
    if (!hasHomepage) {
        const legacy = templates[0];
        legacy.kind = 'homepage';
        if (legacy.id === 'tpl-default') {
            legacy.id = 'tpl-homepage';
        }
        if (!legacy.name || legacy.name === 'Template') {
            legacy.name = 'Homepage';
        }
        hasHomepage = true;
    }
    if (!templates.some((t) => t.kind === 'inner-page')) {
        templates.push(createInnerPageTemplateDeterministic('Inner page'));
    }

    const activeId = typeof raw.activeTemplateId === 'string' ? raw.activeTemplateId : '';
    const active = templates.find((t) => t.id === activeId) ?? templates[0];

    return {
        templates,
        activeTemplateId: active.id,
        // Default on when missing so saved templates drive / after Save (legacy payloads had undefined → false).
        applyToPublicHome: raw.applyToPublicHome !== false,
    };
}

/** Backwards-compat alias for older imports. */
export const normalizeWidgetLayoutToSingleHomepage = normalizeLayoutPayload;

export function loadLayoutStateFromStorage() {
    if (typeof sessionStorage === 'undefined') {
        return null;
    }
    try {
        const raw = sessionStorage.getItem(WIDGET_LAYOUT_STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (parsed?.templates?.length) {
            return parsed;
        }
    } catch {
        /* ignore */
    }
    return null;
}

export function loadOrCreateLayoutState() {
    return loadLayoutStateFromStorage() ?? initialLayoutState();
}

export function saveLayoutStateToStorage(state) {
    if (typeof sessionStorage === 'undefined') {
        return;
    }
    sessionStorage.setItem(WIDGET_LAYOUT_STORAGE_KEY, JSON.stringify(state));
}

export function duplicateTemplate(template, name) {
    const idMap = {};
    for (const id of Object.keys(template.instances)) {
        idMap[id] = newWidgetInstanceId();
    }
    const zones = {
        left: template.zones.left.map((i) => idMap[i]),
        main: template.zones.main.map((i) => idMap[i]),
        right: template.zones.right.map((i) => idMap[i]),
    };
    const instances = {};
    for (const [oldId, inst] of Object.entries(template.instances)) {
        instances[idMap[oldId]] = {
            type: inst.type,
            data: structuredClone(inst.data),
        };
    }
    return {
        id: newTemplateId(),
        name: name ?? `${template.name} (copy)`,
        kind: 'custom',
        columnLayout: normalizeTemplateColumnLayout(template.columnLayout),
        zones,
        instances,
    };
}

/**
 * @param {string} name
 * @param {string} [columnLayout]
 * @param {'homepage'|'inner-page'|'custom'} [kind]
 */
export function blankTemplate(name, columnLayout = 'content-right', kind = 'custom') {
    return {
        id: newTemplateId(),
        name,
        kind: normalizeTemplateKind(kind),
        columnLayout: normalizeTemplateColumnLayout(columnLayout),
        zones: { left: [], main: [], right: [] },
        instances: {},
    };
}

export function countHeroInstances(template) {
    return Object.values(template.instances).filter((i) => i.type === 'hero')
        .length;
}
