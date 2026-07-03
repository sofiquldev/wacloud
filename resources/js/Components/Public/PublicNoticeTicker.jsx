const defaultItems = [
    'Welcome to WaCloud — your Laravel + Inertia starter with a civic-inspired UI.',
    'Sign in to access the admin dashboard and profile settings.',
    'Customize this notice ticker in PublicNoticeTicker.jsx for your project.',
];

export function PublicNoticeTicker({ items = defaultItems }) {
    const doubled = [...items, ...items];
    return (
        <div className="overflow-hidden border-y border-gold/20 bg-gold-muted py-2.5">
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-6">
                <span className="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-foreground bg-gold">
                    Notice
                </span>
                <div className="flex-1 overflow-hidden">
                    <div className="animate-civic-marquee flex gap-12 whitespace-nowrap text-sm font-bangla text-accent-foreground">
                        {doubled.map((t, i) => (
                            <span key={i}>• {t}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
