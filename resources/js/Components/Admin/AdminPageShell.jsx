/**
 * Standard backend page wrapper: large muted title + spaced sections.
 * @param {boolean} [wide] — use max-w-6xl for dense dashboards (default max-w-4xl).
 */
export default function AdminPageShell({
    title,
    description,
    children,
    wide = false,
}) {
    return (
        <div
            className={`mx-auto w-full space-y-8 ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}
        >
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-400">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        {description}
                    </p>
                )}
            </div>
            <div className="space-y-6">{children}</div>
        </div>
    );
}
