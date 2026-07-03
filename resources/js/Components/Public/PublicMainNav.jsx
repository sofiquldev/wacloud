import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const FALLBACK_NAV = [
    {
        key: 'fb-home',
        label: 'Home',
        href: '/',
        real: true,
        openNewTab: false,
        children: [],
    },
];

/** Max top-level items in the desktop bar; rest go under “আরও”. */
const DESKTOP_NAV_VISIBLE_CAP = 6;

function navBranchIsActive(node, activePath) {
    if (node.real && node.href === activePath) {
        return true;
    }
    for (const c of node.children ?? []) {
        if (navBranchIsActive(c, activePath)) {
            return true;
        }
    }
    return false;
}

function splitNavForDesktop(items) {
    if (!Array.isArray(items) || items.length <= DESKTOP_NAV_VISIBLE_CAP) {
        return items;
    }
    const primary = items.slice(0, DESKTOP_NAV_VISIBLE_CAP);
    const overflow = items.slice(DESKTOP_NAV_VISIBLE_CAP);
    return [
        ...primary,
        {
            key: 'nav-overflow',
            label: 'আরও',
            href: '#',
            real: false,
            openNewTab: false,
            children: overflow,
        },
    ];
}

function NavLink({ href, real, openNewTab, className, children, onClick, ...rest }) {
    if (real && href && href !== '#') {
        if (openNewTab) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                    onClick={onClick}
                    {...rest}
                >
                    {children}
                </a>
            );
        }
        return (
            <Link href={href} className={className} onClick={onClick} {...rest}>
                {children}
            </Link>
        );
    }
    return (
        <span className={className} title="Coming soon" onClick={onClick} {...rest}>
            {children}
        </span>
    );
}

/**
 * One row inside a desktop dropdown — link, or nested submenu (menu → submenu → …).
 *
 * @param {object} props
 * @param {import('react').RefObject<HTMLElement | null>} [props.menuRootRef] — top-level flyout panel (button + menu).
 *        Clicks inside here must not close sibling nested submenus so multiple can stay open on desktop.
 */
function DesktopDropdownBranch({ node, active, closeRoot, depth = 0, menuRootRef }) {
    const hasKids = node.children?.length > 0;
    const [subOpen, setSubOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        if (!subOpen) {
            return undefined;
        }
        function onPointerDown(e) {
            if (menuRootRef?.current?.contains(e.target)) {
                return;
            }
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setSubOpen(false);
            }
        }
        const id = window.requestAnimationFrame(() => {
            document.addEventListener('mousedown', onPointerDown);
        });
        return () => {
            window.cancelAnimationFrame(id);
            document.removeEventListener('mousedown', onPointerDown);
        };
    }, [subOpen, menuRootRef]);

    const linkClass = (isRowActive) =>
        `block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-surface ${
            isRowActive ? 'font-semibold text-civic' : 'text-foreground'
        }`;

    if (!hasKids) {
        return (
            <NavLink
                href={node.href}
                real={node.real}
                openNewTab={node.openNewTab}
                role="menuitem"
                onClick={closeRoot}
                className={linkClass(node.real && node.href === active)}
            >
                {node.label}
            </NavLink>
        );
    }

    return (
        <div ref={wrapRef} className="relative">
            <button
                type="button"
                role="menuitem"
                aria-expanded={subOpen}
                aria-haspopup="menu"
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface aria-expanded:bg-surface"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSubOpen((o) => !o);
                }}
            >
                <span className="min-w-0 truncate">{node.label}</span>
                <ChevronRight
                    className={`size-4 shrink-0 opacity-70 transition-transform ${subOpen ? 'rotate-90' : ''}`}
                    aria-hidden
                />
            </button>
            {subOpen ? (
                <ul
                    role="menu"
                    className="absolute left-full top-0 min-w-[13rem] pl-0.5"
                    style={{ zIndex: 70 + depth * 5 }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <li
                        className="rounded-lg border border-border bg-background py-1 ring-1 ring-border"
                        role="presentation"
                    >
                        {node.children.map((c) => (
                            <div key={c.key} role="none" className="relative">
                                <DesktopDropdownBranch
                                    node={c}
                                    active={active}
                                    closeRoot={closeRoot}
                                    depth={depth + 1}
                                    menuRootRef={menuRootRef}
                                />
                            </div>
                        ))}
                    </li>
                </ul>
            ) : null}
        </div>
    );
}

function DesktopItem({ item, active }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    const closeRoot = useCallback(() => {
        setOpen(false);
    }, []);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        function onPointerDown(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        const id = window.requestAnimationFrame(() => {
            document.addEventListener('mousedown', onPointerDown);
        });
        return () => {
            window.cancelAnimationFrame(id);
            document.removeEventListener('mousedown', onPointerDown);
        };
    }, [open]);

    const hasKids = item.children?.length > 0;
    const isActive = item.real && item.href === active;
    const groupActive = hasKids && navBranchIsActive(item, active);

    const bar = isActive ? (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gold" />
    ) : null;

    if (!hasKids) {
        return (
            <li className="relative">
                <NavLink
                    href={item.href}
                    real={item.real}
                    openNewTab={item.openNewTab}
                    className={`relative inline-flex items-center gap-1 whitespace-nowrap py-3 transition-colors hover:text-civic-foreground ${
                        isActive ? 'text-civic-foreground' : 'text-civic-foreground/80'
                    }`}
                >
                    {item.label}
                    {!item.real && item.href === '#' ? (
                        <ChevronDown className="size-3.5 opacity-50" />
                    ) : null}
                    {bar}
                </NavLink>
            </li>
        );
    }

    return (
        <li className="relative">
            <div ref={wrapRef} className="relative">
                <button
                    type="button"
                    className={`relative inline-flex items-center gap-1 whitespace-nowrap py-3 transition-colors hover:text-civic-foreground aria-expanded:bg-civic/10 ${
                        groupActive ? 'text-civic-foreground' : 'text-civic-foreground/90'
                    }`}
                    aria-expanded={open}
                    aria-haspopup="menu"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen((o) => !o);
                    }}
                >
                    {item.label}
                    <ChevronDown
                        className={`size-3.5 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                    {groupActive ? (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gold" aria-hidden />
                    ) : null}
                </button>
                {open ? (
                    <ul
                        role="menu"
                        className="absolute left-0 top-full z-[60] min-w-[13rem] pt-1"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <li
                            className="rounded-lg border border-border bg-background py-1 ring-1 ring-border"
                            role="presentation"
                        >
                            {item.children.map((c) => (
                                <div key={c.key} role="none" className="relative">
                                <DesktopDropdownBranch
                                    node={c}
                                    active={active}
                                    closeRoot={closeRoot}
                                    depth={0}
                                    menuRootRef={wrapRef}
                                />
                                </div>
                            ))}
                        </li>
                    </ul>
                ) : null}
            </div>
        </li>
    );
}

function MobileBranch({ item, active, depth, onNavigate }) {
    const [expanded, setExpanded] = useState(depth === 0);
    const hasKids = item.children?.length > 0;

    return (
        <li className={`border-b border-border/60 last:border-b-0 ${depth > 0 ? 'bg-background/80' : ''}`}>
            <div className="flex items-stretch">
                {hasKids ? (
                    <button
                        type="button"
                        className="flex w-10 shrink-0 items-center justify-center border-r border-border/60 text-muted-foreground hover:bg-surface"
                        aria-expanded={expanded}
                        onClick={() => setExpanded((e) => !e)}
                    >
                        <ChevronRight
                            className={`size-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
                        />
                    </button>
                ) : null}
                <div className="min-w-0 flex-1">
                    <NavLink
                        href={item.href}
                        real={item.real}
                        openNewTab={item.openNewTab}
                        onClick={() => {
                            if (item.real && item.href !== '#') {
                                onNavigate?.();
                            }
                        }}
                        className={`block px-4 py-3 text-sm ${
                            item.real && item.href === active ? 'font-semibold text-civic' : 'text-foreground'
                        }`}
                    >
                        {item.label}
                    </NavLink>
                </div>
            </div>
            {hasKids && expanded ? (
                <ul className="border-t border-border/40">
                    {item.children.map((c) => (
                        <MobileBranch
                            key={c.key}
                            item={c}
                            active={active}
                            depth={depth + 1}
                            onNavigate={onNavigate}
                        />
                    ))}
                </ul>
            ) : null}
        </li>
    );
}

export function PublicMainNav() {
    const { publicNav, activePath = '/' } = usePage().props;
    const rawItems = publicNav?.items?.length ? publicNav.items : FALLBACK_NAV;
    const desktopItems = splitNavForDesktop(rawItems);
    const [open, setOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-40 bg-civic text-civic-foreground shadow-sm">
            <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
                <ul className="hidden items-center gap-6 text-sm font-medium lg:flex">
                    {desktopItems.map((item) => (
                        <DesktopItem key={item.key} item={item} active={activePath} />
                    ))}
                </ul>

                <div className="flex w-full items-center justify-between lg:hidden">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-civic/10"
                        onClick={() => setOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" />
                        <span className="hidden sm:inline">Menu</span>
                    </button>
                    <NavLink
                        href="/"
                        real
                        openNewTab={false}
                        className="inline-flex items-center rounded-md bg-gold px-3 py-1.5 text-xs font-semibold text-gold-foreground"
                    >
                        Home
                    </NavLink>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                        aria-hidden
                    />
                    <aside className="animate-civic-slide-in-left absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto border-r border-border bg-background text-foreground shadow-md">
                        <div className="flex h-12 items-center justify-between border-b border-border bg-civic px-4 text-civic-foreground">
                            <span className="text-sm font-semibold">Menu</span>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                                <X className="size-5" />
                            </button>
                        </div>
                        <ul className="py-0">
                            {rawItems.map((item) => (
                                <MobileBranch
                                    key={item.key}
                                    item={item}
                                    active={activePath}
                                    depth={0}
                                    onNavigate={() => setOpen(false)}
                                />
                            ))}
                        </ul>
                    </aside>
                </div>
            )}
        </nav>
    );
}
