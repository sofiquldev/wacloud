import { DEFAULT_MEMBER_PHOTO_URL } from '@/constants/defaultMemberPhoto';

/** People directory for widget admin — DB-backed via {@see setWidgetPeopleForAdmin}; legacy presets only before that runs. */

export const WIDGET_PEOPLE = [
    {
        id: 'p1',
        name: 'Md. Sharif Uddin Ahmed',
        role: 'Mayor',
        designation: 'Mayor',
        ward: 'Pabna Pourashava',
        photo: DEFAULT_MEMBER_PHOTO_URL,
    },
    {
        id: 'p2',
        name: 'Rehana Parvin',
        role: 'Panel Mayor (1)',
        designation: 'Panel Mayor (1)',
        ward: 'Ward 03',
        photo: DEFAULT_MEMBER_PHOTO_URL,
    },
    {
        id: 'p3',
        name: 'Abdul Karim Mollah',
        role: 'Panel Mayor (2)',
        designation: 'Panel Mayor (2)',
        ward: 'Ward 07',
        photo: DEFAULT_MEMBER_PHOTO_URL,
    },
    {
        id: 'p4',
        name: 'Nasir Uddin Khan',
        role: 'Councilor — Ward 01',
        designation: 'Councilor',
        ward: 'Ward 01',
        photo: DEFAULT_MEMBER_PHOTO_URL,
    },
    {
        id: 'p5',
        name: 'Salma Begum',
        role: 'Reserved Councilor',
        designation: 'Reserved Councilor',
        ward: 'Ward 1-2-3',
        photo: DEFAULT_MEMBER_PHOTO_URL,
    },
    {
        id: 'p6',
        name: 'Mizanur Rahman',
        role: 'Councilor — Ward 02',
        designation: 'Councilor',
        ward: 'Ward 02',
        photo: DEFAULT_MEMBER_PHOTO_URL,
    },
    {
        id: 'p7',
        name: 'Md. Faruk Hossain',
        role: 'Chief Executive Officer',
        designation: 'Chief Executive Officer',
        ward: 'Pourashava',
        photo: DEFAULT_MEMBER_PHOTO_URL,
    },
];

/** @type {object[] | null} */
let adminWidgetPeopleOverride = null;

/**
 * @param {object[]|null} list — rows shaped like WIDGET_PEOPLE; `[]` = empty directory (no legacy merge). `null` clears override (legacy demo list again).
 */
export function setWidgetPeopleForAdmin(list) {
    adminWidgetPeopleOverride = Array.isArray(list) ? [...list] : null;
}

export function getWidgetPeople() {
    if (adminWidgetPeopleOverride !== null) {
        return adminWidgetPeopleOverride;
    }
    return [...WIDGET_PEOPLE];
}

function normNameLoose(s) {
    return String(s ?? '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

function namesLooselyMatchWidget(displayName, personName) {
    const a = normNameLoose(displayName);
    const b = normNameLoose(personName);
    if (!a || !b) {
        return false;
    }
    if (a === b) {
        return true;
    }
    const ta = a.split(' ').filter(Boolean).slice(0, 3).join(' ');
    const tb = b.split(' ').filter(Boolean).slice(0, 3).join(' ');
    return ta === tb || a.includes(tb) || b.includes(ta);
}

/**
 * @param {object[]} directoryRows — Inertia `membersDirectory` rows
 */
export function membersDirectoryRowsToWidgetPeople(directoryRows) {
    if (!Array.isArray(directoryRows)) {
        return [];
    }
    return directoryRows.map((m) => ({
        id: `m-${m.id}`,
        name: m.name,
        role: m.designation,
        designation: m.designation,
        ward: m.ward ?? '',
        photo: m.photoUrl || DEFAULT_MEMBER_PHOTO_URL,
    }));
}

const GROUP_PREDICATES = {
    all: () => true,
    mayor: (p) => p.role === 'Mayor',
    'panel-mayor': (p) => p.role.startsWith('Panel Mayor'),
    councilors: (p) =>
        p.role.includes('Councilor') && !p.role.includes('Reserved'),
    reserved: (p) => p.role.includes('Reserved'),
    officers: (p) =>
        p.role.includes('Chief Executive') || p.role.includes('Officer'),
};

export function personSelectLabel(p) {
    return `${p.name} — ${p.role}`;
}

export function guessPersonIdFromCardData(data, people = getWidgetPeople()) {
    if (!data?.name) {
        return null;
    }
    const exact = people.find((p) => p.name === data.name);
    if (exact) {
        return exact.id;
    }
    return (
        people.find((p) => namesLooselyMatchWidget(data.name, p.name))?.id ??
        null
    );
}

export function memberCardDataFromPersonId(personId, people = getWidgetPeople()) {
    const p = people.find((x) => x.id === personId);
    if (!p) {
        return null;
    }
    const cta =
        p.designation === 'Mayor' ? 'Message from Mayor' : 'View profile';
    return {
        name: p.name,
        designation: p.designation,
        ward: p.ward,
        photo: p.photo,
        quote:
            'Our commitment is transparent governance and modern amenities for every citizen.',
        ctaLabel: cta,
        showMessages: true,
    };
}

export function buildMembersGridRows(membersGrid, people = getWidgetPeople()) {
    const group = membersGrid?.group ?? 'all';
    const includeIds = membersGrid?.includeIds ?? [];
    const excludeIds = new Set(membersGrid?.excludeIds ?? []);
    const pred = GROUP_PREDICATES[group] ?? GROUP_PREDICATES.all;

    let list = people.filter((p) => pred(p));
    for (const id of includeIds) {
        const p = people.find((x) => x.id === id);
        if (p && !list.some((x) => x.id === p.id)) {
            list = [p, ...list];
        }
    }
    list = list.filter((p) => !excludeIds.has(p.id));

    return list.map((p, i) => ({
        id: i + 1,
        name: p.name,
        designation: p.designation,
        ward: p.ward,
        photo: p.photo,
        termStart: 2020,
        termEnd: 2025,
    }));
}

export const MEMBER_GROUP_OPTIONS = [
    { value: 'all', label: 'All members' },
    { value: 'mayor', label: 'Mayor only' },
    { value: 'panel-mayor', label: 'Panel mayors' },
    { value: 'councilors', label: 'Ward councilors' },
    { value: 'reserved', label: 'Reserved councilors' },
    { value: 'officers', label: 'Officers' },
];
