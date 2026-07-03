/**
 * Build citizen service links for the nav-services widget from the shared cmsServices catalog.
 *
 * @param {Array<{ id?: number, slug: string, title: string }>} cmsServices
 * @param {object} data — widget data: serviceSource, serviceQuery, items (manual fallback)
 * @returns {Array<{ id: string|number, slug: string, label: string, href: string }>}
 */
export function buildNavServiceItems(cmsServices, data) {
    const services = Array.isArray(cmsServices) ? cmsServices : [];
    const source = data?.serviceSource ?? 'catalog';

    if (source === 'manual') {
        const raw = Array.isArray(data?.items) ? data.items : [];
        return raw.map((row, i) => ({
            id: row.id ?? row.slug ?? i,
            slug: String(row.slug ?? row.id ?? i),
            label: String(row.label ?? ''),
            href: String(row.href ?? '#'),
        }));
    }

    const q = data?.serviceQuery && typeof data.serviceQuery === 'object' ? data.serviceQuery : {};
    const mode = ['all', 'include', 'exclude'].includes(q.mode) ? q.mode : 'all';
    const limit = Math.min(50, Math.max(1, Number(q.limit) || 8));
    const includeSlugs = Array.isArray(q.includeSlugs)
        ? q.includeSlugs.filter((s) => typeof s === 'string' && s.trim())
        : [];
    const excludeSlugs = Array.isArray(q.excludeSlugs)
        ? q.excludeSlugs.filter((s) => typeof s === 'string' && s.trim())
        : [];

    let rows = services
        .filter((s) => s && typeof s.slug === 'string' && s.slug.trim())
        .map((s) => ({
            id: s.id ?? s.slug,
            slug: String(s.slug).trim(),
            label: String(s.title ?? s.slug),
            href: `/services/${String(s.slug).trim()}`,
        }));

    if (mode === 'exclude' && excludeSlugs.length) {
        const deny = new Set(excludeSlugs);
        rows = rows.filter((r) => !deny.has(r.slug));
    }
    if (mode === 'include' && includeSlugs.length) {
        const bySlug = new Map(rows.map((r) => [r.slug, r]));
        rows = includeSlugs.map((s) => bySlug.get(s)).filter(Boolean);
    }

    return rows.slice(0, limit);
}
