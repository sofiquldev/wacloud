export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-20 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="size-10 bg-civic rounded-full" />
              <span className="font-semibold tracking-tight">Pabna Pourashava</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              Committed to building a sustainable and citizen-friendly urban
              environment through digital innovation and accountable governance.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-5">Contact Information</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><span className="text-foreground font-medium">Address:</span> Municipal Office, Pourashava Road, Pabna 6600</li>
              <li><span className="text-foreground font-medium">Phone:</span> +880 731 66122</li>
              <li><span className="text-foreground font-medium">Email:</span> info@pabnapourashava.gov.bd</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-5">Office Map</h4>
            <div className="aspect-video bg-muted rounded-lg ring-1 ring-border grid place-items-center">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                Map placeholder
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2024 Pabna Pourashava. All rights reserved.</p>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
            Developed by Municipal ICT Cell
          </p>
        </div>
      </div>
    </footer>
  );
}
