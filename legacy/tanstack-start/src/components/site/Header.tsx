type HeaderProps = {
  bnName?: string;
  enName?: string;
};

export function Header({
  bnName = "পাবনা পৌরসভা ডিজিটাল ম্যানেজমেন্ট সিস্টেম",
  enName = "Pabna Pourashava Digital Management System",
}: HeaderProps) {
  return (
    <header className="bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 sm:gap-5">
        <div
          className="size-14 sm:size-20 shrink-0 bg-civic text-civic-foreground rounded-full flex items-center justify-center ring-4 ring-gold/25"
          aria-hidden
        >
          <div className="size-10 sm:size-14 border-2 border-dashed border-civic-foreground/25 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] tracking-widest leading-tight text-center text-civic-foreground/70 font-medium">
            POURA<br />SEAL
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="font-bangla text-lg sm:text-2xl md:text-[26px] font-semibold tracking-tight text-balance text-civic leading-tight">
            {bnName}
          </h1>
          <p className="text-xs sm:text-base md:text-lg font-medium text-ink-soft tracking-tight uppercase">
            {enName}
          </p>
        </div>
      </div>
    </header>
  );
}
