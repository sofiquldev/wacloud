import {
    COMPLAINT_CATEGORIES,
    COMPLAINT_WARDS,
    DESIGNATIONS,
    NOTICE_CATEGORIES,
    PAGE_CATEGORIES,
    SERVICE_CATEGORIES,
    SESSIONS,
    WARDS,
} from '@/data/adminDummyData';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

function pick(arr, fallback) {
    return Array.isArray(arr) && arr.length ? arr : fallback;
}

/**
 * CMS taxonomies from Laravel config (shared Inertia prop), with JS fallbacks.
 */
export function useCmsCatalog() {
    const raw = usePage().props.cmsCatalog;

    return useMemo(
        () => ({
            designations: pick(raw?.designations, DESIGNATIONS),
            wards: pick(raw?.wards, WARDS),
            sessions: pick(raw?.sessions, SESSIONS),
            pageCategories: pick(raw?.pageCategories, PAGE_CATEGORIES),
            serviceCategories: pick(raw?.serviceCategories, SERVICE_CATEGORIES),
            noticeCategories: pick(raw?.noticeCategories, NOTICE_CATEGORIES),
            complaintCategories: pick(raw?.complaintCategories, COMPLAINT_CATEGORIES),
            complaintWards: pick(raw?.complaintWards, COMPLAINT_WARDS),
        }),
        [raw],
    );
}

/**
 * Council directory from the database (shared Inertia prop). Empty when signed out.
 */
export function useMembersDirectory() {
    const rows = usePage().props.membersDirectory;

    return useMemo(
        () => (Array.isArray(rows) ? rows : []),
        [rows],
    );
}

export function contentCategoriesForKind(kind, catalog) {
    if (kind === 'Page') {
        return catalog.pageCategories;
    }
    if (kind === 'Service') {
        return catalog.serviceCategories;
    }
    return catalog.noticeCategories;
}
