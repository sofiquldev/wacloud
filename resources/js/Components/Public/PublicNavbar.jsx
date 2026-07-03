import { mergePublicSite } from '@/utils/siteAppearance';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Cloud, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const FALLBACK_NAV = [
    { key: 'home', label: 'Home', href: '/', real: true },
    { key: 'api', label: 'API', href: '/#api', real: true },
    { key: 'pricing', label: 'Pricing', href: '/pricing', real: true },
];

function isActive(href, activePath) {
    if (!href || href === '#') {
        return false;
    }
    const path = href.split('#')[0] || '/';
    if (path === '/') {
        return activePath === '/';
    }
    return activePath === path || activePath.startsWith(path + '/');
}

function NavItem({ item, activePath, className, onClick }) {
    const active = isActive(item.href, activePath);

    if (!item.real || !item.href || item.href === '#') {
        return (
            <span className={className} title="Coming soon">
                {item.label}
            </span>
        );
    }

    if (item.openNewTab) {
        return (
            <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={className}
                onClick={onClick}
            >
                {item.label}
            </a>
        );
    }

    return (
        <Link href={item.href} className={className} onClick={onClick}>
            {item.label}
        </Link>
    );
}

export function PublicNavbar({ canLogin, canRegister }) {
    const { publicNav, activePath = '/', auth } = usePage().props;
    const site = mergePublicSite(usePage().props.site ?? {});
    const user = auth?.user;
    const navItems = publicNav?.items?.length ? publicNav.items : FALLBACK_NAV;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const linkClass = (active) =>
        `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            active
                ? 'text-civic'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`;

    const brandName = site.footerIntroTitle?.trim() || site.appTitleBn || 'WaCloud';

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-shadow duration-200 ${
                scrolled
                    ? 'border-border/80 bg-surface-elevated/90 shadow-sm backdrop-blur-md'
                    : 'border-transparent bg-surface-elevated/70 backdrop-blur-sm'
            }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[4.25rem]">
                {/* Brand */}
                <Link
                    href="/"
                    className="group flex min-w-0 shrink-0 items-center gap-2.5"
                    onClick={() => setMobileOpen(false)}
                >
                    <span className="grid size-9 place-items-center rounded-xl bg-civic text-civic-foreground shadow-sm ring-1 ring-civic/20 transition group-hover:bg-civic/90 sm:size-10">
                        <Cloud className="size-5" strokeWidth={2.25} />
                    </span>
                    <span className="min-w-0 leading-tight">
                        <span className="block truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
                            {brandName}
                        </span>
                        <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:block">
                            WhatsApp API
                        </span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav
                    className="hidden flex-1 items-center justify-center gap-1 md:flex"
                    aria-label="Main"
                >
                    {navItems.map((item) => (
                        <NavItem
                            key={item.key}
                            item={item}
                            activePath={activePath}
                            className={linkClass(isActive(item.href, activePath))}
                        />
                    ))}
                </nav>

                {/* Desktop actions */}
                <div className="hidden shrink-0 items-center gap-2 md:flex">
                    {user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-2 rounded-lg bg-civic px-4 py-2 text-sm font-semibold text-civic-foreground shadow-sm transition hover:bg-civic/90"
                        >
                            Console
                            <ArrowRight className="size-4" />
                        </Link>
                    ) : (
                        <>
                            {canLogin && (
                                <Link
                                    href={route('login')}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    Sign in
                                </Link>
                            )}
                            {canRegister && (
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-civic px-4 py-2 text-sm font-semibold text-civic-foreground shadow-sm transition hover:bg-civic/90"
                                >
                                    Get started
                                    <ArrowRight className="size-4" />
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <button
                    type="button"
                    className="ml-auto inline-flex rounded-lg p-2 text-foreground hover:bg-muted md:hidden"
                    aria-expanded={mobileOpen}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    onClick={() => setMobileOpen((o) => !o)}
                >
                    {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </div>

            {/* Mobile panel */}
            {mobileOpen && (
                <div className="border-t border-border bg-surface-elevated md:hidden">
                    <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4" aria-label="Mobile">
                        {navItems.map((item) => (
                            <NavItem
                                key={item.key}
                                item={item}
                                activePath={activePath}
                                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                                    isActive(item.href, activePath)
                                        ? 'bg-civic/10 text-civic'
                                        : 'text-foreground hover:bg-muted'
                                }`}
                                onClick={() => setMobileOpen(false)}
                            />
                        ))}
                    </nav>
                    <div className="border-t border-border px-4 py-4">
                        {user ? (
                            <Link
                                href={route('dashboard')}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-civic px-4 py-2.5 text-sm font-semibold text-civic-foreground"
                                onClick={() => setMobileOpen(false)}
                            >
                                Open console
                                <ArrowRight className="size-4" />
                            </Link>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Sign in
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-civic px-4 py-2.5 text-sm font-semibold text-civic-foreground"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Get started
                                        <ArrowRight className="size-4" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
