import { useState } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

const items: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Pourashava",
    href: "/about",
    children: [
      { label: "History", href: "/about/history" },
      {
        label: "Administration",
        href: "/about/administration",
        children: [
          { label: "Mayor's Office", href: "/about/administration/mayor" },
          { label: "Council Members", href: "/about/administration/council" },
          { label: "Standing Committees", href: "/about/administration/committees" },
        ],
      },
      { label: "Wards & Map", href: "/about/wards" },
    ],
  },
  { label: "Citizen Charter", href: "/charter" },
  {
    label: "e-Services",
    href: "/services",
    children: [
      {
        label: "Civil Registration",
        href: "/services/civil",
        children: [
          { label: "Birth Registration", href: "/services/civil/birth" },
          { label: "Death Registration", href: "/services/civil/death" },
          { label: "Citizenship Certificate", href: "/services/civil/citizenship" },
        ],
      },
      {
        label: "Revenue & Tax",
        href: "/services/revenue",
        children: [
          { label: "Holding Tax", href: "/services/revenue/holding" },
          { label: "Trade License", href: "/services/revenue/trade" },
          { label: "Water Bill", href: "/services/revenue/water" },
        ],
      },
      { label: "Building Approval", href: "/services/building" },
    ],
  },
  { label: "Notices", href: "/notices" },
  { label: "Tenders", href: "/tenders" },
  {
    label: "Members",
    href: "/members",
    children: [
      { label: "Current Council", href: "/members/current" },
      { label: "Career Timeline", href: "/members/timeline" },
      { label: "Past Sessions", href: "/members/past" },
    ],
  },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export function MainNav({ active = "/" }: { active?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-civic text-civic-foreground sticky top-0 z-40 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {items.map((item) => (
            <DesktopNavItem key={item.href} item={item} active={active} />
          ))}
        </ul>

        {/* Mobile actions */}
        <div className="lg:hidden flex items-center w-full justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-2 py-1.5 rounded-md hover:bg-civic/10"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
            <span className="hidden sm:inline">Menu</span>
          </button>
          <a
            href="/services"
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-gold text-gold-foreground text-xs font-semibold"
          >
            e-Services
          </a>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <MobileDrawer items={items} active={active} onClose={() => setOpen(false)} />
      )}
    </nav>
  );
}

/* ───────── Desktop ───────── */

function DesktopNavItem({ item, active }: { item: NavItem; active: string }) {
  const isActive = item.href === active;
  const hasChildren = !!item.children?.length;

  return (
    <li className="relative group">
      <a
        href={item.href}
        className={`inline-flex items-center gap-1 whitespace-nowrap py-3 transition-colors hover:text-civic-foreground ${
          isActive ? "text-civic-foreground" : "text-civic-foreground/80"
        }`}
      >
        {item.label}
        {hasChildren && <ChevronDown className="size-3.5 opacity-80" />}
        {isActive && (
          <span className="absolute left-0 right-0 -bottom-0 h-0.5 bg-gold rounded-full" />
        )}
      </a>

      {hasChildren && (
        <ul
          className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-150 absolute left-0 top-full pt-1 min-w-56 z-50"
        >
          <div className="bg-surface-elevated text-foreground ring-1 ring-border rounded-lg shadow-elevated py-2">
            {item.children!.map((child) => (
              <DesktopSubItem key={child.href} item={child} />
            ))}
          </div>
        </ul>
      )}
    </li>
  );
}

function DesktopSubItem({ item }: { item: NavItem }) {
  const hasChildren = !!item.children?.length;

  return (
    <li className="relative group/sub">
      <a
        href={item.href}
        className="flex items-center justify-between gap-4 px-4 py-2 text-sm hover:bg-civic-muted hover:text-civic transition-colors"
      >
        <span>{item.label}</span>
        {hasChildren && <ChevronRight className="size-3.5 opacity-60" />}
      </a>

      {hasChildren && (
        <ul className="invisible opacity-0 translate-x-1 group-hover/sub:visible group-hover/sub:opacity-100 group-hover/sub:translate-x-0 group-focus-within/sub:visible group-focus-within/sub:opacity-100 transition-all duration-150 absolute left-full top-0 pl-1 min-w-56 z-50">
          <div className="bg-surface-elevated text-foreground ring-1 ring-border rounded-lg shadow-elevated py-2">
            {item.children!.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  className="block px-4 py-2 text-sm hover:bg-civic-muted hover:text-civic transition-colors"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </div>
        </ul>
      )}
    </li>
  );
}

/* ───────── Mobile drawer ───────── */

function MobileDrawer({
  items,
  active,
  onClose,
}: {
  items: NavItem[];
  active: string;
  onClose: () => void;
}) {
  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background text-foreground shadow-elevated overflow-y-auto animate-slide-in-left">
        <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-civic text-civic-foreground">
          <span className="font-semibold text-sm">Menu</span>
          <button onClick={onClose} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <ul className="py-2">
          {items.map((item) => (
            <MobileNavItem
              key={item.href}
              item={item}
              level={0}
              active={active}
              onNavigate={onClose}
            />
          ))}
        </ul>
      </aside>
    </div>
  );
}

function MobileNavItem({
  item,
  level,
  active,
  onNavigate,
}: {
  item: NavItem;
  level: number;
  active: string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;
  const isActive = item.href === active;
  const padLeft = { paddingLeft: `${1 + level * 1}rem` };

  // Whole row toggles submenu when item has children; only leaf items navigate.
  const handleRowClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setOpen((o) => !o);
    } else {
      onNavigate();
    }
  };

  return (
    <li className="border-b border-border/60 last:border-b-0">
      <div className="flex items-stretch">
        <a
          href={item.href}
          onClick={handleRowClick}
          className={`flex-1 py-3 pr-3 text-sm ${
            isActive ? "text-civic font-semibold" : "text-foreground"
          }`}
          style={padLeft}
        >
          {item.label}
        </a>
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={open}
            className="px-4 text-ink-soft hover:text-civic"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="bg-surface overflow-hidden animate-accordion-down">
          {item.children!.map((c) => (
            <MobileNavItem
              key={c.href}
              item={c}
              level={level + 1}
              active={active}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
