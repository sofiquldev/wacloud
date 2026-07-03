/**
 * Light settings section card (profile & data management).
 */
export default function SettingsSectionCard({ children, className = '' }) {
    return (
        <section
            className={`rounded-xl border border-border bg-surface-elevated p-6 shadow-sm sm:p-8 ${className}`}
        >
            {children}
        </section>
    );
}
