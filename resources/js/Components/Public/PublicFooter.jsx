import { mergePublicSite, formatCopyrightLine } from '@/utils/siteAppearance';
import { usePage } from '@inertiajs/react';

export function PublicFooter() {
    const { site: rawSite } = usePage().props;
    const site = mergePublicSite(rawSite ?? {});

    const copyright = formatCopyrightLine(site.footerCopyrightTemplate, site.footerOrganizationShort);

    return (
        <footer className="mt-20 border-t border-border bg-surface py-16">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    <div>
                        <div className="mb-5 flex items-center gap-3">
                            <div className="size-10 shrink-0 rounded-full bg-civic" aria-hidden />
                            <span className="font-semibold tracking-tight">{site.footerIntroTitle}</span>
                        </div>
                        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{site.footerIntroBody}</p>
                    </div>
                    <div>
                        <h4 className="mb-5 text-sm font-semibold">Contact Information</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <span className="font-medium text-foreground">Address:</span> {site.footerAddress}
                            </li>
                            <li>
                                <span className="font-medium text-foreground">Phone:</span> {site.footerPhone}
                            </li>
                            <li>
                                <span className="font-medium text-foreground">Email:</span>{' '}
                                <a href={`mailto:${site.footerEmail}`} className="text-civic hover:underline">
                                    {site.footerEmail}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-5 text-sm font-semibold">Office Map</h4>
                        <div className="grid aspect-video place-items-center rounded-lg bg-muted ring-1 ring-border">
                            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                Map placeholder
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                    <p className="text-xs text-muted-foreground">{copyright}</p>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{site.footerCreditLine}</p>
                </div>
            </div>
        </footer>
    );
}
