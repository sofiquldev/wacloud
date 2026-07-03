/**
 * Dark navy admin panel card (matches console settings blocks).
 */
export default function AdminSectionCard({ children, className = '' }) {
    return (
        <section
            className={`rounded-xl border border-slate-700/50 bg-slate-800 p-6 shadow-lg ring-1 ring-white/5 sm:p-8 ${className}`}
        >
            {children}
        </section>
    );
}
