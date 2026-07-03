import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

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

/**
 * Two-column “message from” dialog (mayor / profile card CTA), aligned with legacy MemberCardWidget modal.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.name
 * @param {string} props.designation
 * @param {string} props.photo
 * @param {string} [props.ward]
 * @param {string} [props.quote]
 * @param {string} [props.message] — full letter body; falls back to default mayor letter
 */
export default function MayorMessageModal({
    open,
    onClose,
    name,
    designation,
    photo,
    ward,
    quote,
    message,
}) {
    const fullMessage = message ?? DEFAULT_MESSAGE;

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open) {
        return null;
    }

    /** Portal avoids sticky sidebar / main stacking contexts (nav is z-40). */
    const overlay = (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mayor-message-title"
            className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
        >
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            />
            <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-background shadow-elevated sm:max-h-[88vh] sm:w-[92%] sm:max-w-3xl sm:rounded-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-background/80 ring-1 ring-border backdrop-blur transition-colors hover:bg-surface"
                >
                    <X className="size-4" />
                </button>

                <div className="grid flex-1 grid-cols-1 overflow-hidden sm:grid-cols-[220px_1fr]">
                    <div className="flex items-center gap-4 border-b border-border bg-civic/5 p-4 sm:flex-col sm:items-start sm:border-b-0 sm:border-r sm:p-6">
                        <img
                            src={photo}
                            alt={name}
                            className="size-20 shrink-0 rounded-xl object-cover ring-2 ring-gold/30 sm:size-32"
                        />
                        <div className="min-w-0">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-civic">
                                Message from
                            </p>
                            <h2 id="mayor-message-title" className="text-lg font-semibold leading-tight sm:text-xl">
                                {name}
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {designation}
                                {ward && ` · ${ward}`}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-y-auto p-5 sm:p-7">
                        {quote ? (
                            <blockquote className="mb-5 border-l-4 border-gold pl-4 text-pretty text-sm italic text-foreground/80 sm:text-base">
                                &ldquo;{quote}&rdquo;
                            </blockquote>
                        ) : null}
                        <div className="text-pretty text-sm leading-relaxed text-foreground/90 whitespace-pre-line sm:text-[15px]">
                            {fullMessage}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined' || !document.body) {
        return overlay;
    }
    return createPortal(overlay, document.body);
}
