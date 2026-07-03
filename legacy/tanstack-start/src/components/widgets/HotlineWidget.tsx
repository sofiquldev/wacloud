export function HotlineWidget({
  label,
  number,
  description,
}: {
  label: string;
  number: string;
  description: string;
}) {
  return (
    <div className="bg-civic text-civic-foreground rounded-xl p-6 shadow-elevated">
      <h4 className="text-[11px] font-semibold text-civic-foreground/60 uppercase tracking-widest mb-1">
        {label}
      </h4>
      <p className="text-3xl font-semibold leading-none mb-3 tracking-tight">{number}</p>
      <p className="text-xs text-civic-foreground/75 text-pretty leading-relaxed">{description}</p>
    </div>
  );
}
