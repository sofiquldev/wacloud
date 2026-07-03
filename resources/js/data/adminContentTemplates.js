/** Template options for admin content editor (legacy ContentManager). */

export const CONTENT_TEMPLATES = {
    Page: [
        { value: 'default', label: 'Default', hint: 'Standard content layout' },
        {
            value: 'full-width',
            label: 'Full width',
            hint: 'No sidebar, edge-to-edge',
        },
        { value: 'landing', label: 'Landing', hint: 'Hero + sections' },
        {
            value: 'sidebar',
            label: 'With sidebar',
            hint: 'Sticky sidebar nav',
        },
    ],
    Service: [
        { value: 'default', label: 'Default', hint: 'Overview + steps' },
        { value: 'form', label: 'Form-based', hint: 'Step-by-step application' },
        {
            value: 'downloads',
            label: 'Downloads',
            hint: 'Forms & PDFs to download',
        },
        { value: 'fees', label: 'Fees', hint: 'Fee schedule layout' },
    ],
    Notice: [
        { value: 'default', label: 'Default', hint: 'Single notice' },
        { value: 'tender', label: 'Tender', hint: 'Procurement notice' },
        { value: 'circular', label: 'Circular', hint: 'Department circular' },
    ],
};

export function contentKindFromParam(param) {
    if (param === 'page') {
        return 'Page';
    }
    if (param === 'service') {
        return 'Service';
    }
    if (param === 'notice') {
        return 'Notice';
    }
    return null;
}

export function categoriesForKind(kind) {
    if (kind === 'Page') {
        return ['About', 'Council', 'Legal', 'Contact', 'News'];
    }
    if (kind === 'Service') {
        return [
            'Citizen Records',
            'Revenue',
            'Engineering',
            'Utilities',
            'Health',
        ];
    }
    return ['Administration', 'Engineering', 'Health', 'Revenue', 'Sanitation'];
}

export function basePathForKind(kind) {
    if (kind === 'Service') {
        return '/services';
    }
    if (kind === 'Notice') {
        return '/notices';
    }
    return '';
}
