import { createFileRoute, Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  LayoutGrid,
  Inbox,
  FileText,
  Bell,
  Menu,
  Search,
  ChevronRight,
  Wifi,
  Building2,
  Settings,
  Vote,
  FileStack,
  Wrench,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Pabna Pourashava" },
      { name: "description", content: "Municipal admin command center." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const navGroups = [
  {
    label: "Governance",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/members", label: "Members", icon: Users },
      { to: "/admin/elections", label: "Elections", icon: Vote },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/pages", label: "Pages", icon: FileStack },
      { to: "/admin/services", label: "Services", icon: Wrench },
      { to: "/admin/notices", label: "Notices", icon: FileText },
    ],
  },
  {
    label: "Citizens",
    items: [
      { to: "/admin/complaints", label: "Complaints", icon: Inbox, badge: 12 },
    ],
  },
  {
    label: "Site",
    items: [
      { to: "/admin/widgets", label: "Widget Layout", icon: LayoutGrid },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const crumbs = buildCrumbs(pathname);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-surface-elevated">
        <SidebarBody pathname={pathname} />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 shrink-0 border-b border-border bg-surface-elevated/95 backdrop-blur sticky top-0 z-30 flex items-center gap-2 px-3 sm:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin navigation</SheetTitle>
              </SheetHeader>
              <SidebarBody pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center text-sm text-muted-foreground min-w-0">
            {crumbs.map((c, i) => (
              <span key={c.to} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight className="size-3.5 shrink-0" />}
                {i === crumbs.length - 1 ? (
                  <span className="font-medium text-foreground truncate">{c.label}</span>
                ) : (
                  <Link to={c.to} className="hover:text-foreground truncate">
                    {c.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:flex relative w-64">
            <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-8 h-9" />
          </div>

          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          </Button>

          <ProfileMenu />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <footer className="h-9 px-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>© Pabna Pourashava • Admin Console</span>
          <span className="flex items-center gap-1.5">
            <Wifi className="size-3.5 text-civic" />
            Online
          </span>
        </footer>
      </div>
    </div>
  );
}

function SidebarBody({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="size-8 rounded-md bg-civic text-civic-foreground grid place-items-center">
          <Building2 className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Pabna Pourashava</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin Console</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const exact = "exact" in item && item.exact;
                const active = exact ? pathname === item.to : pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                        active
                          ? "bg-civic text-civic-foreground font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge && (
                        <Badge
                          variant="secondary"
                          className={`h-5 px-1.5 text-[10px] ${
                            active ? "bg-civic-foreground/15 text-civic-foreground" : ""
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <Link
          to="/"
          className="block text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to public site
        </Link>
      </div>
    </div>
  );
}

function buildCrumbs(pathname: string) {
  const map: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/members": "Members",
    "/admin/elections": "Elections",
    "/admin/widgets": "Widget Layout",
    "/admin/complaints": "Complaints",
    "/admin/notices": "Notices",
    "/admin/pages": "Pages",
    "/admin/services": "Services",
    "/admin/settings": "Settings",
  };
  const crumbs = [{ to: "/admin", label: "Admin" }];
  if (pathname !== "/admin" && map[pathname]) {
    crumbs.push({ to: pathname, label: map[pathname] });
  } else if (pathname === "/admin") {
    crumbs[0] = { to: "/admin", label: "Dashboard" };
  }
  return crumbs;
}

function ProfileMenu() {
  const router = useRouter();
  const handleLogout = () => {
    toast.success("Signed out");
    router.navigate({ to: "/" });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full ring-offset-2 ring-offset-background focus:outline-none focus:ring-2 focus:ring-civic"
          aria-label="Open profile menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-civic text-civic-foreground text-xs font-semibold">
              SA
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Shahidul Admin</span>
            <span className="text-xs text-muted-foreground font-normal">
              admin@pabna.gov.bd
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/admin/settings">
            <UserIcon className="size-4" /> My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/settings">
            <Settings className="size-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
