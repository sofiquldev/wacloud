import Dropdown from '@/Components/Dropdown';
import { mergePublicSite } from '@/utils/siteAppearance';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Building2,
    ChevronRight,
    FileStack,
    FileText,
    Inbox,
    LayoutDashboard,
    LayoutGrid,
    ListTree,
    Menu,
    Search,
    Settings,
    User as UserIcon,
    Vote,
    Wifi,
    Wrench,
    X,
} from 'lucide-react';
import { useState } from 'react';

const navGroups = [
    {
        label: 'Governance',
        items: [
            {
                label: 'Dashboard',
                href: () => route('dashboard'),
                real: true,
                icon: LayoutDashboard,
                match: 'dashboard',
            },
            {
                label: 'Members',
                href: () => route('admin.members.index'),
                real: true,
                icon: UserIcon,
                match: 'admin.members.index',
            },
            {
                label: 'Elections',
                href: () => route('admin.elections.index'),
                real: true,
                icon: Vote,
                match: 'admin.elections.index',
            },
        ],
    },
    {
        label: 'Content',
        items: [
            {
                label: 'Pages',
                href: () => route('admin.pages.index'),
                real: true,
                icon: FileStack,
                match: 'admin.pages.index',
            },
            {
                label: 'Services',
                href: () => route('admin.services.index'),
                real: true,
                icon: Wrench,
                match: 'admin.services.index',
            },
            {
                label: 'Notices',
                href: () => route('admin.notices.index'),
                real: true,
                icon: FileText,
                match: 'admin.notices.index',
            },
        ],
    },
    {
        label: 'Citizens',
        items: [
            {
                label: 'Complaints',
                href: () => route('admin.complaints.index'),
                real: true,
                icon: Inbox,
                match: 'admin.complaints.index',
                badge: '12',
            },
        ],
    },
    {
        label: 'Site',
        items: [
            {
                label: 'Templates',
                href: () => route('admin.templates.index'),
                real: true,
                icon: LayoutGrid,
                match: 'admin.templates.index',
            },
            {
                label: 'Main navigation',
                href: () => route('admin.menus.index'),
                real: true,
                icon: ListTree,
                match: 'admin.menus.index',
            },
            {
                label: 'Settings',
                href: () => route('profile.edit'),
                real: true,
                icon: Settings,
                match: 'profile.edit',
            },
        ],
    },
];

function SidebarBody({ onNavigate }) {
    const site = mergePublicSite(usePage().props.site ?? {});
    const orgLine = site.footerIntroTitle?.trim() || site.footerOrganizationShort;

    return (
        <div className="flex h-full flex-col bg-surface-elevated">
            <div className="flex h-14 items-center gap-2 border-b border-border px-4">
                <div className="grid size-8 place-items-center rounded-md bg-civic text-civic-foreground">
                    <Building2 className="size-4" />
                </div>
                <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold text-foreground">{orgLine}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Admin Console
                    </p>
                </div>
            </div>
            <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto p-3">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {group.label}
                        </p>
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const href = item.href();
                                const active = item.match
                                    ? route().current(item.match)
                                    : false;
                                const Icon = item.icon;
                                const className = `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                                    active
                                        ? 'bg-civic font-medium text-civic-foreground'
                                        : 'text-foreground hover:bg-muted'
                                }`;

                                const inner = (
                                    <>
                                        <Icon className="size-4 shrink-0" />
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge && (
                                            <span
                                                className={`h-5 rounded px-1.5 text-[10px] font-medium ${
                                                    active
                                                        ? 'bg-civic-foreground/15 text-civic-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                );

                                return (
                                    <li key={item.label}>
                                        {item.real ? (
                                            <Link
                                                href={href}
                                                className={className}
                                                onClick={() => onNavigate?.()}
                                            >
                                                {inner}
                                            </Link>
                                        ) : (
                                            <span className={className + ' cursor-not-allowed opacity-60'} title="Coming soon">
                                                {inner}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
            <div className="border-t border-border p-3">
                <Link
                    href={route('home')}
                    className="block text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => onNavigate?.()}
                >
                    ← Back to public site
                </Link>
            </div>
        </div>
    );
}

function Breadcrumbs() {
    const page = usePage();
    const path = page.url.split('?')[0].replace(/\/+$/, '') || '/';
    const crumbCurrent = 'truncate font-medium text-foreground';
    const crumbParent =
        'truncate text-muted-foreground hover:text-foreground hover:underline';

    const sectionTitles = {
        members: 'Members',
        elections: 'Elections',
        pages: 'Pages',
        services: 'Services',
        notices: 'Notices',
        complaints: 'Complaints',
        templates: 'Templates',
        menus: 'Main navigation',
    };

    const CrumbAdmin = () => (
        <Link href={route('dashboard')} className={crumbParent}>
            Admin
        </Link>
    );

    if (path.startsWith('/profile')) {
        return (
            <span className="flex min-w-0 items-center gap-1.5 text-sm">
                <CrumbAdmin />
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                <span className={crumbCurrent}>Settings</span>
            </span>
        );
    }

    const contentMatch = path.match(/^\/admin\/content\/([^/]+)\/([^/]+)/);
    if (contentMatch) {
        const [, kind, id] = contentMatch;
        const kindLabel =
            kind === 'page' ? 'Page' : kind === 'service' ? 'Service' : 'Notice';
        const tail = id === 'new' ? `New ${kindLabel}` : `Edit ${kindLabel}`;
        return (
            <span className="flex min-w-0 items-center gap-1.5 text-sm">
                <CrumbAdmin />
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                <span className={crumbCurrent}>{tail}</span>
            </span>
        );
    }

    const adminMatch = path.match(/^\/admin\/([^/?]+)/);
    if (adminMatch) {
        const seg = adminMatch[1];
        const title = sectionTitles[seg];
        if (title) {
            return (
                <span className="flex min-w-0 items-center gap-1.5 text-sm">
                    <CrumbAdmin />
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className={crumbCurrent}>{title}</span>
                </span>
            );
        }
    }

    if (path === '/admin' || path === '/dashboard') {
        return (
            <span className="flex min-w-0 items-center gap-1.5 text-sm">
                <span className="truncate text-muted-foreground">Admin</span>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                <span className={crumbCurrent}>Dashboard</span>
            </span>
        );
    }

    return (
        <span className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className={crumbCurrent}>Admin</span>
        </span>
    );
}

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const site = mergePublicSite(usePage().props.site ?? {});
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-muted lg:h-screen lg:max-h-screen lg:flex-row lg:overflow-hidden">
            <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface-elevated lg:flex">
                <SidebarBody />
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:overflow-hidden">
                <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface-elevated px-3 sm:px-5">
                    <button
                        type="button"
                        className="inline-flex rounded-md p-2 text-foreground hover:bg-muted lg:hidden"
                        aria-label="Open menu"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="size-5" />
                    </button>

                    <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:flex">
                        <Breadcrumbs />
                    </nav>

                    <div className="flex-1" />

                    <div className="relative hidden w-64 md:block">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search…"
                            className="h-9 w-full rounded-md border border-border bg-muted pl-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-civic focus:outline-none focus:ring-1 focus:ring-civic"
                            readOnly
                            aria-readonly
                        />
                    </div>

                    <button
                        type="button"
                        className="relative rounded-full p-2 text-muted-foreground hover:bg-muted"
                        aria-label="Notifications"
                    >
                        <Bell className="size-5" />
                        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                    </button>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-full">
                                <button
                                    type="button"
                                    className="flex size-8 items-center justify-center rounded-full bg-civic text-xs font-semibold text-civic-foreground ring-offset-2 ring-offset-background focus:outline-none focus:ring-2 focus:ring-civic"
                                    aria-label="Account menu"
                                >
                                    {user.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </button>
                            </span>
                        </Dropdown.Trigger>
                        <Dropdown.Content
                            align="right"
                            width="48"
                            contentClasses="py-1 border border-border bg-surface-elevated shadow-lg"
                        >
                            <div className="border-b border-border px-4 py-2">
                                <div className="text-sm font-medium text-foreground">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                            <Dropdown.Link
                                href={route('profile.edit')}
                                className="text-foreground hover:bg-muted"
                            >
                                Settings
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-foreground hover:bg-muted"
                            >
                                Log out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
                        <aside className="animate-civic-slide-in-left absolute left-0 top-0 h-full w-72 max-w-[85%] border-r border-border bg-surface-elevated shadow-elevated">
                            <div className="flex h-12 items-center justify-between border-b border-border bg-civic px-4 text-civic-foreground">
                                <span className="text-sm font-semibold">Menu</span>
                                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                                    <X className="size-5" />
                                </button>
                            </div>
                            <SidebarBody onNavigate={() => setMobileOpen(false)} />
                        </aside>
                    </div>
                )}

                <main className="min-h-0 flex-1 p-4 sm:p-6 lg:overflow-y-auto lg:p-8">
                    {children}
                </main>

                <footer className="flex h-9 shrink-0 items-center justify-between border-t border-border bg-surface-elevated px-4 text-xs text-muted-foreground">
                    <span>
                        © {site.footerOrganizationShort} · Admin Console
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Wifi className="size-3.5 text-civic" />
                        Online
                    </span>
                </footer>
            </div>
        </div>
    );
}
