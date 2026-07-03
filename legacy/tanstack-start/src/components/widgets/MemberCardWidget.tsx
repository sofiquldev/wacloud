import { useState } from "react";
import { X } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import type { MemberCardData } from "./types";

const DEFAULT_MESSAGE = `Dear citizens of Pabna,

It is my honour to serve as the Mayor of our beloved Pourashava. Together, we are building a city that is cleaner, safer, and more inclusive — where every ward receives its fair share of attention, every voice is heard, and every taka of public money is accounted for.

Over the coming term, our administration is focused on three priorities:

1. Modernising civic services through digital governance, so birth registration, trade licences, and tax payments can be completed without standing in long queues.
2. Investing in resilient infrastructure — drainage, roads, street lighting, and waste management — so that monsoon season no longer disrupts daily life.
3. Strengthening community participation through ward-level public hearings, where residents can raise concerns directly with their elected representatives.

I invite every resident, business owner, student, and visitor to engage with us — share your ideas, file your grievances, and hold us accountable. A Pourashava is only as strong as the partnership between its citizens and its public servants.

With gratitude and resolve,
Md. Sharif Uddin Ahmed
Mayor, Pabna Pourashava`;

export function MemberCardWidget({
  name,
  designation,
  photo,
  ward,
  quote,
  ctaLabel = "View profile",
  message,
}: MemberCardData) {
  const [open, setOpen] = useState(false);
  const fullMessage = message ?? DEFAULT_MESSAGE;
  useLockBodyScroll(open);

  return (
    <>
      <div className="bg-surface ring-1 ring-border rounded-xl overflow-hidden">
        <img
          src={photo}
          alt={name}
          loading="lazy"
          width={800}
          height={1000}
          className="w-full aspect-[4/5] object-cover"
        />
        <div className="p-5">
          <h3 className="text-base font-semibold leading-tight mb-1">{name}</h3>
          <p className="text-xs text-civic font-medium mb-3 uppercase tracking-wider">
            {designation}
            {ward && ` · ${ward}`}
          </p>
          {quote && (
            <p className="text-xs text-muted-foreground italic leading-relaxed mb-4 text-pretty">
              "{quote}"
            </p>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full py-2 bg-civic text-civic-foreground text-sm font-medium rounded-lg hover:bg-civic/90 transition-colors"
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mayor-message-title"
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm animate-in fade-in"
          />
          <div className="relative w-full sm:w-[92%] sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-background rounded-t-2xl sm:rounded-2xl shadow-elevated overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur ring-1 ring-border hover:bg-surface transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] overflow-hidden flex-1">
              <div className="bg-civic/5 sm:p-6 flex sm:flex-col items-center sm:items-start gap-4 p-4 border-b sm:border-b-0 sm:border-r border-border">
                <img
                  src={photo}
                  alt={name}
                  className="size-20 sm:size-32 rounded-xl object-cover ring-2 ring-gold/30 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-civic font-semibold mb-1">
                    Message from
                  </p>
                  <h2 id="mayor-message-title" className="text-lg sm:text-xl font-semibold leading-tight">
                    {name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    {designation}
                    {ward && ` · ${ward}`}
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto p-5 sm:p-7">
                {quote && (
                  <blockquote className="border-l-4 border-gold pl-4 italic text-sm sm:text-base text-foreground/80 mb-5 text-pretty">
                    "{quote}"
                  </blockquote>
                )}
                <div className="text-sm sm:text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line text-pretty">
                  {fullMessage}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
