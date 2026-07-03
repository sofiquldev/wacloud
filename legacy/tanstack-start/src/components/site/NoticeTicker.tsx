type NoticeTickerProps = {
  items?: string[];
};

const defaultItems = [
  "সর্বশেষ খবর: ২০২৪-২৫ অর্থবছরের জন্য নতুন ট্রেড লাইসেন্স নবায়ন কার্যক্রম শুরু হয়েছে।",
  "Property tax deadline extended to June 15th — pay online via the Holding Tax portal.",
  "Tender Notice: Construction of Drainage Network Phase II — submissions open until June 12.",
  "Vaccination drive at Ward 4 Community Center this Friday from 9 AM to 4 PM.",
];

export function NoticeTicker({ items = defaultItems }: NoticeTickerProps) {
  const doubled = [...items, ...items];
  return (
    <div className="bg-gold-muted border-y border-gold/20 overflow-hidden py-2.5">
      <div className="max-w-7xl mx-auto px-6 flex gap-4 items-center">
        <span className="shrink-0 px-2 py-0.5 bg-gold text-gold-foreground text-[10px] font-bold uppercase tracking-wider rounded">
          Notice
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap animate-marquee text-sm text-accent-foreground font-bangla">
            {doubled.map((t, i) => (
              <span key={i}>• {t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
