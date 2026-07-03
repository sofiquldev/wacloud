const defaultItems = [
    'সর্বশেষ খবর: ২০২৪-২৫ অর্থবছরের জন্য নতুন ট্রেড লাইসেন্স নবায়ন কার্যক্রম শুরু হয়েছে।',
    'Property tax deadline extended to June 15th — pay online via the Holding Tax portal.',
    'Tender Notice: Construction of Drainage Network Phase II — submissions open until June 12.',
    'Vaccination drive at Ward 4 Community Center this Friday from 9 AM to 4 PM.',
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
