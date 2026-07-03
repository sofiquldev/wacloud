import { mergePublicSite, rowJustifyClass } from '@/utils/siteAppearance';
import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const site = mergePublicSite(usePage().props.site ?? {});
    const showTitles = site.logoShowTitles !== false;
    const rowAlign = rowJustifyClass(site.logoAlign ?? 'left');
    const official = site.logoBuiltinPreset === 'official';
    const line1 = site.logoSealLine1 || 'POURA';
    const line2 = site.logoSealLine2 || 'SEAL';

    const logoMark =
        site.logoMode === 'image' && site.logoImageUrl ? (
            <img
                src={site.logoImageUrl}
                alt=""
                className="h-12 w-auto max-w-[min(100%,180px)] shrink-0 object-contain"
            />
        ) : official ? (
            <div className="shrink-0 rounded-full bg-sky-300 p-0.5 shadow-sm ring-1 ring-sky-400/40" aria-hidden>
                <div className="flex size-11 items-center justify-center rounded-full bg-civic text-civic-foreground ring-2 ring-dashed ring-white/90">
                    <div className="px-0.5 text-center text-[6px] font-medium uppercase leading-tight tracking-widest text-civic-foreground/95">
                        <span className="block">{line1}</span>
                        <span className="block">{line2}</span>
                    </div>
                </div>
            </div>
        ) : (
            <div
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-civic text-civic-foreground ring-2 ring-gold/25"
                aria-hidden
            >
                <div className="flex size-8 items-center justify-center rounded-full border-2 border-dashed border-civic-foreground/25 text-center text-[7px] font-medium uppercase leading-tight tracking-widest text-civic-foreground/70">
                    <span>
                        {line1}
                        <br />
                        {line2}
                    </span>
                </div>
            </div>
        );

    return (
        <div className="flex min-h-screen flex-col bg-background lg:flex-row">
            <aside className="relative hidden w-full max-w-none flex-col justify-between overflow-hidden bg-civic px-10 py-12 text-civic-foreground lg:flex lg:w-[42%] lg:max-w-md xl:max-w-lg">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl"
                />
                <div className="relative z-[1]">
                    <Link
                        href="/"
                        className="flex w-full flex-col gap-3 font-bangla text-civic-foreground transition hover:opacity-95"
                    >
                        <span className={`flex w-full min-w-0 items-center gap-3 ${rowAlign}`}>
                            {logoMark}
                            {showTitles ? (
                                <span className="min-w-0 flex-1">
                                    {site.logoShowBanglaTitle ? (
                                        <span className="block text-balance text-xl font-semibold leading-tight tracking-tight">
                                            {site.appTitleBn}
                                        </span>
                                    ) : null}
                                    {site.logoShowEnglishTitle ? (
                                        <span className="mt-1 block text-xs font-medium uppercase tracking-tight text-civic-foreground/85">
                                            {site.appTitleEn}
                                        </span>
                                    ) : null}
                                </span>
                            ) : null}
                        </span>
                    </Link>
                    <p className="mt-6 max-w-sm text-sm leading-relaxed text-civic-foreground/85">
                        Secure access for staff and administrators. Sign in with your official credentials to manage
                        municipal services and content.
                    </p>
                </div>
                <div className="relative z-[1] mt-10 lg:mt-0">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gold transition hover:text-gold-foreground hover:underline"
                    >
                        <span aria-hidden>←</span>
                        Back to public website
                    </Link>
                </div>
            </aside>

            <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
                <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
                    <Link
                        href="/"
                        className={`flex min-w-0 flex-1 items-center gap-2 font-bangla text-lg font-semibold text-foreground ${rowAlign}`}
                    >
                        {logoMark}
                        {showTitles ? (
                            <span className="min-w-0 truncate">
                                {site.logoShowBanglaTitle ? site.appTitleBn : site.footerIntroTitle}
                            </span>
                        ) : null}
                    </Link>
                    <Link
                        href="/"
                        className="shrink-0 text-sm font-medium text-civic hover:underline"
                    >
                        Home
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-md rounded-2xl border border-border/90 bg-surface-elevated p-6 shadow-elevated sm:p-8">
                    {children}
                </div>

                <p className="mx-auto mt-6 max-w-md text-center text-xs text-muted-foreground">
                    Protected area. Only authorized personnel should continue.
                </p>
            </div>
        </div>
    );
}
