import PrimaryButton from '@/Components/PrimaryButton';
import { TablePaginationBar } from '@/Components/Admin/TablePaginationBar';
import { usePagedList } from '@/hooks/usePagedList';
import { usePage } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';

/**
 * @param {object} props
 * @param {'designations'|'wards'} props.field
 * @param {string[]} props.rows
 * @param {(next: string[]) => void} props.onRowsChange
 * @param {string} props.title
 * @param {string} props.description
 * @param {() => void} props.onSave
 * @param {boolean} [props.saving]
 */
export default function CatalogTaxonomyEditor({
    field,
    rows,
    onRowsChange,
    title,
    description,
    onSave,
    saving = false,
}) {
    const inertiaPage = usePage();
    const inertiaErrors = inertiaPage.props.errors ?? {};

    const filterResetKey = rows.join('\u0000');

    const {
        paged,
        page: tablePage,
        setPage: setTablePage,
        perPage,
        setPerPage,
        total,
        totalPages,
        from,
        to,
    } = usePagedList(rows, filterResetKey);

    const firstError = useMemo(() => {
        for (const v of Object.values(inertiaErrors)) {
            if (typeof v === 'string' && v.trim()) {
                return v;
            }
            if (Array.isArray(v) && v[0]) {
                return String(v[0]);
            }
        }
        return null;
    }, [inertiaErrors]);

    const updateRow = useCallback(
        (globalIndex, value) => {
            const next = [...rows];
            next[globalIndex] = value;
            onRowsChange(next);
        },
        [rows, onRowsChange],
    );

    const removeRow = useCallback(
        (globalIndex) => {
            onRowsChange(rows.filter((_, i) => i !== globalIndex));
        },
        [rows, onRowsChange],
    );

    const moveRow = useCallback(
        (fromIdx, dir) => {
            const toIdx = fromIdx + dir;
            if (toIdx < 0 || toIdx >= rows.length) {
                return;
            }
            const next = [...rows];
            [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
            onRowsChange(next);
        },
        [rows, onRowsChange],
    );

    const addRow = useCallback(() => {
        onRowsChange([...rows, '']);
    }, [rows, onRowsChange]);

    const globalIndexForPaged = useCallback(
        (pageRowIdx) => (tablePage - 1) * perPage + pageRowIdx,
        [tablePage, perPage],
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
                <p className="mt-2 text-xs text-slate-500">
                    Used across Members, Elections, and filters. Empty rows are removed when you save. At least one
                    designation and one ward must remain.
                </p>
            </div>

            {firstError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{firstError}</p>
            ) : null}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium text-slate-600">#</th>
                                <th className="px-4 py-3 font-medium text-slate-600">
                                    {field === 'designations' ? 'Designation' : 'Ward'}
                                </th>
                                <th className="w-36 px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paged.map((value, i) => {
                                const gi = globalIndexForPaged(i);
                                return (
                                    <tr key={`${gi}-${i}`} className="hover:bg-slate-50/80">
                                        <td className="px-4 py-2 tabular-nums text-slate-500">{gi + 1}</td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => updateRow(gi, e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="inline-flex items-center gap-0.5">
                                                <button
                                                    type="button"
                                                    title="Move up"
                                                    disabled={gi === 0}
                                                    onClick={() => moveRow(gi, -1)}
                                                    className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                                >
                                                    <ChevronUp className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Move down"
                                                    disabled={gi >= rows.length - 1}
                                                    onClick={() => moveRow(gi, 1)}
                                                    className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                                                >
                                                    <ChevronDown className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Remove"
                                                    disabled={rows.length <= 1}
                                                    onClick={() => removeRow(gi)}
                                                    className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-30"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <TablePaginationBar
                    page={tablePage}
                    totalPages={totalPages}
                    total={total}
                    from={from}
                    to={to}
                    perPage={perPage}
                    onPageChange={setTablePage}
                    onPerPageChange={setPerPage}
                />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                    <Plus className="size-4" aria-hidden />
                    Add {field === 'designations' ? 'designation' : 'ward'}
                </button>
                <PrimaryButton
                    type="button"
                    variant="civic"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm normal-case"
                    onClick={onSave}
                >
                    <Save className="size-4" aria-hidden />
                    {saving ? 'Saving…' : 'Save designations & wards'}
                </PrimaryButton>
            </div>
        </div>
    );
}
