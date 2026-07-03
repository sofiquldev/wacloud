import { TABLE_PER_PAGE_OPTIONS } from '@/hooks/usePagedList';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * @param {object} props
 * @param {number} props.page — 1-based
 * @param {number} props.totalPages
 * @param {number} props.total
 * @param {number} props.from
 * @param {number} props.to
 * @param {number} props.perPage
 * @param {(p: number) => void} props.onPageChange
 * @param {(n: number) => void} props.onPerPageChange
 */
export function TablePaginationBar({
    page,
    totalPages,
    total,
    from,
    to,
    perPage,
    onPageChange,
    onPerPageChange,
}) {
    if (total === 0) {
        return null;
    }

    const canPrev = page > 1;
    const canNext = page < totalPages;

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Rows per page
                    </span>
                    <select
                        value={perPage}
                        onChange={(e) => onPerPageChange(Number(e.target.value))}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-800 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                    >
                        {TABLE_PER_PAGE_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <p className="tabular-nums text-slate-600">
                <span className="font-medium text-slate-800">
                    {from}–{to}
                </span>{' '}
                of {total}
                {totalPages > 1 ? (
                    <>
                        {' '}
                        <span className="text-slate-400">·</span> Page {page} of {totalPages}
                    </>
                ) : null}
            </p>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={!canPrev}
                    onClick={() => onPageChange(1)}
                    className="hidden rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-block"
                    aria-label="First page"
                >
                    First
                </button>
                <button
                    type="button"
                    disabled={!canPrev}
                    onClick={() => onPageChange(page - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => onPageChange(page + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="size-4" aria-hidden />
                </button>
                <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => onPageChange(totalPages)}
                    className="hidden rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-block"
                    aria-label="Last page"
                >
                    Last
                </button>
            </div>
        </div>
    );
}
