function normName(s) {
    return String(s ?? '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

/** Loose match between widget card name and directory row (e.g. "Ahmed" vs seed without suffix). */
function namesLooselyMatch(displayName, directoryName) {
    const a = normName(displayName);
    const b = normName(directoryName);
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

function pickDirectory(directory) {
    if (Array.isArray(directory) && directory.length) {
        return directory;
    }
    return [];
}

/**
 * Public "Message from" body for homepage person card — from Members directory when names match.
 *
 * @param {string} displayName — e.g. from widget / WIDGET_PEOPLE
 * @param {string} [designation]
 * @param {object[]} [directory] — from Inertia `membersDirectory`; empty if not loaded.
 * @returns {string|undefined}
 */
export function findPublicMessageForMemberCard(
    displayName,
    designation,
    directory,
) {
    const dir = pickDirectory(directory);
    const des = String(designation ?? '').trim();
    const matches = dir.filter((m) => namesLooselyMatch(displayName, m.name));
    const withMsg = matches.filter((m) => String(m.publicMessage ?? '').trim());
    if (!withMsg.length) {
        return undefined;
    }
    const exact = withMsg.find((m) => !des || m.designation === des);
    const pick = exact ?? withMsg[0];
    return String(pick.publicMessage).trim();
}

/**
 * Merge directory `publicMessage` into member-card widget data for admin preview.
 *
 * @param {object} data
 * @param {object[]} [directory]
 */
export function enrichMemberCardWidgetData(data, directory) {
    const merged = findPublicMessageForMemberCard(
        data.name,
        data.designation,
        directory,
    );
    if (!merged) {
        return data;
    }
    return { ...data, message: merged };
}

export function enrichContentWidgetsForAdminPreview(widgets, cmsPagesCatalog) {
    const pages = Array.isArray(cmsPagesCatalog) ? cmsPagesCatalog : [];
    return widgets.map((w) => {
        if (w.type !== 'content' || !w.data) {
            return w;
        }
        const d = structuredClone(w.data);
        if (d.source !== 'page' || !d.pageSlug) {
            return { ...w, data: d };
        }
        const slug = String(d.pageSlug);
        const row = pages.find((p) => p && String(p.slug) === slug);
        if (!row) {
            return { ...w, data: d };
        }
        const title = (d.title && String(d.title).trim()) || row.title || slug;
        const body = typeof row.body === 'string' ? row.body : '';
        return {
            ...w,
            data: {
                ...d,
                title,
                body,
                bodyHtml: '',
            },
        };
    });
}

/**
 * @param {object[]} widgets
 * @param {object[]} [directory] — Inertia `membersDirectory` on admin; omit on public when server already merged.
 */
export function enrichWidgetListWithDirectoryMessages(widgets, directory) {
    return widgets.map((w) =>
        w.type === 'member-card'
            ? {
                  ...w,
                  data: enrichMemberCardWidgetData(
                      structuredClone(w.data),
                      directory,
                  ),
              }
            : w,
    );
}
