import { mergePublicSite, rowJustifyClass } from '@/utils/siteAppearance';
import { usePage } from '@inertiajs/react';

export function PublicHeader() {
    const { site: raw } = usePage().props;
    const site = mergePublicSite(raw ?? {});
    const official = site.logoBuiltinPreset === 'official';
    const line1 = site.logoSealLine1 || 'POURA';
    const line2 = site.logoSealLine2 || 'SEAL';
    const showTitles = site.logoShowTitles !== false;
    const rowAlign = rowJustifyClass(site.logoAlign ?? 'left');

    const logoBlock =
        site.logoMode === 'image' && site.logoImageUrl ? (
            <img
                src={site.logoImageUrl}
                alt=""
                className="h-20 w-auto shrink-0 object-contain"
            />
        ) : official ? (
            <div className="shrink-0 rounded-full bg-sky-300 p-1 shadow-sm ring-1 ring-sky-400/40" aria-hidden>
                <div className="flex size-14 items-center justify-center rounded-full bg-civic text-civic-foreground ring-2 ring-dashed ring-white/90 sm:size-[5.25rem]">
                    <div className="px-1 text-center text-[7px] font-medium uppercase leading-tight tracking-widest text-civic-foreground/95 sm:text-[8px]">
                        <span className="block">{line1}</span>
                        <span className="block">{line2}</span>
                    </div>
                </div>
            </div>
        ) : (
            <div
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-civic text-civic-foreground ring-4 ring-gold/25 sm:size-20"
                aria-hidden
            >
                <div className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-civic-foreground/25 text-center text-[8px] font-medium uppercase leading-tight tracking-widest text-civic-foreground/70 sm:size-14 sm:text-[9px]">
                    <span>
                        {line1}
                        <br />
                        {line2}
                    </span>
                </div>
            </div>
        );

    return (
        <header className="bg-surface">
            <div
                className={`mx-auto flex max-w-7xl items-center gap-4 px-4 sm:gap-5 sm:px-6 ${rowAlign}`}
            >
                <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                    {logoBlock}
                    {showTitles ? (
                        <div className="min-w-0">
                            {site.logoShowBanglaTitle ? (
                                <h1 className="font-bangla text-balance text-lg font-semibold leading-tight tracking-tight text-civic sm:text-2xl md:text-[26px]">
                                    {site.appTitleBn}
                                </h1>
                            ) : null}
                            {site.logoShowEnglishTitle ? (
                                <p className="mt-0.5 text-xs font-medium uppercase tracking-tight text-ink-soft sm:mt-1 sm:text-base md:text-lg">
                                    {site.appTitleEn}
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
