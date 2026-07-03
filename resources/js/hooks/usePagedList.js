import { useCallback, useEffect, useMemo, useState } from 'react';

/** @type {readonly number[]} */
export const TABLE_PER_PAGE_OPTIONS = Object.freeze([10, 25, 50, 100]);

/**
 * Client-side pagination. Resets to page 1 when `resetKey` changes (e.g. filters).
 *
 * @template T
 * @param {T[]} list
 * @param {string} [resetKey]
 */
export function usePagedList(list, resetKey = '') {
    const [page, setPage] = useState(1);
    const [perPage, setPerPageState] = useState(10);

    useEffect(() => {
        setPage(1);
    }, [resetKey]);

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage) || 1);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const paged = useMemo(() => {
        const start = (page - 1) * perPage;
        return list.slice(start, start + perPage);
    }, [list, page, perPage]);

    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    const setPerPage = useCallback((next) => {
        const n = Number(next);
        if (!Number.isFinite(n) || n < 1) {
            return;
        }
        setPerPageState(n);
        setPage(1);
    }, []);

    return {
        paged,
        page,
        setPage,
        perPage,
        setPerPage,
        total,
        totalPages,
        from,
        to,
    };
}
