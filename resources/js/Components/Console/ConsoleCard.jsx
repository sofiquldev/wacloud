export default function ConsoleCard({ children, className = '', padding = true }) {
    return (
        <section
            className={`rounded-xl border border-border bg-surface-elevated shadow-sm ${
                padding ? 'p-4 sm:p-5' : ''
            } ${className}`}
        >
            {children}
        </section>
    );
}
