import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  MessageSquare,
  UserCog,
  Download,
  Calendar,
  Tag,
  Send,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin/complaints")({
  head: () => ({ meta: [{ title: "Complaints — Admin" }] }),
  component: ComplaintsPage,
});

type Status = "new" | "in-progress" | "resolved";
type Priority = "low" | "medium" | "high";

type Complaint = {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  detail: string;
  status: Status;
  priority: Priority;
  category: string;
  ward: string;
  when: string;
  assignee?: string;
  timeline: { at: string; by: string; note: string }[];
};

const COMPLAINTS: Complaint[] = [
  {
    id: "C-2024-118",
    name: "Md. Rahim Uddin",
    phone: "01711-234567",
    email: "rahim@example.com",
    subject: "Drainage blockage in Ward 02",
    detail:
      "Heavy waterlogging near the central market after yesterday's rain. Drainage line appears blocked for ~30 meters.",
    status: "new",
    priority: "high",
    category: "Drainage",
    ward: "Ward 02",
    when: "5 min ago",
    timeline: [{ at: "5 min ago", by: "Citizen", note: "Complaint submitted" }],
  },
  {
    id: "C-2024-117",
    name: "Sumaiya Akter",
    phone: "01812-987654",
    email: "sumaiya@example.com",
    subject: "Street light not working near school",
    detail: "Three street lights on the school road have been off for a week.",
    status: "in-progress",
    priority: "medium",
    category: "Electricity",
    ward: "Ward 05",
    when: "2 hr ago",
    assignee: "Eng. Karim",
    timeline: [
      { at: "2 hr ago", by: "Citizen", note: "Complaint submitted" },
      { at: "1 hr ago", by: "Eng. Karim", note: "Assigned to electrical team" },
    ],
  },
  {
    id: "C-2024-116",
    name: "Anonymous",
    phone: "01900-111222",
    email: "anon@example.com",
    subject: "Garbage collection delay",
    detail: "Bin overflowing for 3 days on the main lane.",
    status: "resolved",
    priority: "low",
    category: "Sanitation",
    ward: "Ward 07",
    when: "Yesterday",
    assignee: "Sanitation Team",
    timeline: [
      { at: "2d ago", by: "Citizen", note: "Complaint submitted" },
      { at: "1d ago", by: "Sanitation Team", note: "Pickup scheduled" },
      { at: "Yesterday", by: "Sanitation Team", note: "Resolved & verified" },
    ],
  },
];

const CATEGORIES = ["All", "Drainage", "Electricity", "Sanitation", "Roads", "Water"];
const WARDS = ["All", "Ward 01", "Ward 02", "Ward 03", "Ward 05", "Ward 07"];

function mask(s: string, keep = 2) {
  if (!s) return s;
  return s.slice(0, keep) + "•".repeat(Math.max(3, s.length - keep - 2)) + s.slice(-2);
}

const statusStyle: Record<Status, string> = {
  new: "bg-destructive/10 text-destructive border-destructive/20",
  "in-progress": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

const priorityStyle: Record<Priority, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};

function ComplaintsPage() {
  const [anon, setAnon] = useState(true);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [ward, setWard] = useState("All");
  const [active, setActive] = useState<Complaint | null>(null);

  const toggle = (id: string) =>
    setRevealed((r) => {
      const n = new Set(r);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const filtered = useMemo(() => {
    return COMPLAINTS.filter((c) => {
      if (tab !== "all" && c.status !== tab) return false;
      if (category !== "All" && c.category !== category) return false;
      if (ward !== "All" && c.ward !== ward) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !c.subject.toLowerCase().includes(s) &&
          !c.id.toLowerCase().includes(s) &&
          !c.name.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [tab, category, ward, q]);

  const counts = useMemo(
    () => ({
      total: COMPLAINTS.length,
      new: COMPLAINTS.filter((c) => c.status === "new").length,
      progress: COMPLAINTS.filter((c) => c.status === "in-progress").length,
      resolved: COMPLAINTS.filter((c) => c.status === "resolved").length,
    }),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaint Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Citizen reports — privacy protected by default.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4" /> Export
          </Button>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <ShieldCheck className="size-4 text-civic" />
            <Switch id="anon" checked={anon} onCheckedChange={setAnon} />
            <Label htmlFor="anon" className="text-sm cursor-pointer">
              Anonymous mode
            </Label>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Inbox className="size-4" />}
          label="Total"
          value={counts.total}
          tone="text-foreground"
        />
        <StatCard
          icon={<AlertTriangle className="size-4" />}
          label="New"
          value={counts.new}
          tone="text-destructive"
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="In progress"
          value={counts.progress}
          tone="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={<CheckCircle2 className="size-4" />}
          label="Resolved"
          value={counts.resolved}
          tone="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="in-progress">In progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="size-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ID, subject, name…"
              className="pl-8 w-[220px]"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px]">
              <Filter className="size-4 mr-1" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={ward} onValueChange={setWard}>
            <SelectTrigger className="w-[130px]">
              <MapPin className="size-4 mr-1" />
              <SelectValue placeholder="Ward" />
            </SelectTrigger>
            <SelectContent>
              {WARDS.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Subject</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">ID</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Reporter</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Ward</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Priority</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">When</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right w-12">·</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => {
              const show = !anon || revealed.has(c.id);
              return (
                <tr
                  key={c.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setActive(c)}
                >
                  <td className="px-4 py-3 max-w-[320px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(c);
                      }}
                      className="flex items-start gap-2 text-left w-full group"
                    >
                      <MessageSquare className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium truncate group-hover:text-primary group-hover:underline underline-offset-2">
                          {c.subject}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{c.detail}</div>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden md:table-cell">
                    {c.id}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className={`text-sm truncate max-w-[160px] ${!show ? "blur-sm select-none" : ""}`}>
                      {show ? c.name : mask(c.name, 1)}
                    </div>
                    <div className={`text-xs text-muted-foreground truncate max-w-[160px] ${!show ? "blur-sm select-none" : ""}`}>
                      {show ? c.phone : mask(c.phone, 4)}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="secondary" className="gap-1">
                      <Tag className="size-3" /> {c.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" /> {c.ward}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={priorityStyle[c.priority]}>
                      {c.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={statusStyle[c.status]}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                    {c.when}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {anon && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => toggle(c.id)}
                          aria-label={show ? "Hide" : "Reveal"}
                        >
                          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setActive(c)}>
                            <MessageSquare className="size-4" /> View & respond
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserCog className="size-4" /> Assign
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <CheckCircle2 className="size-4" /> Mark resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No complaints match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ComplaintDialog
        complaint={active}
        onClose={() => setActive(null)}
        anon={anon}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className={`flex items-center gap-2 text-xs ${tone}`}>
          {icon}
          <span className="font-medium uppercase tracking-wide">{label}</span>
        </div>
        <div className="mt-1 text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  show,
  children,
}: {
  icon?: React.ReactNode;
  label?: string;
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {label ? (
        <span className="text-xs text-muted-foreground w-12">{label}</span>
      ) : (
        <span className="text-muted-foreground shrink-0">{icon}</span>
      )}
      <span className={`truncate ${!show ? "blur-sm select-none" : ""}`}>
        {children}
      </span>
    </div>
  );
}

function ComplaintDialog({
  complaint,
  onClose,
  anon,
}: {
  complaint: Complaint | null;
  onClose: () => void;
  anon: boolean;
}) {
  if (!complaint) return null;
  const c = complaint;
  return (
    <Dialog open={!!complaint} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        {/* Compact header */}
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <span className="font-mono">{c.id}</span>
            <Badge variant="outline" className={statusStyle[c.status]}>{c.status}</Badge>
            <Badge variant="secondary" className={priorityStyle[c.priority]}>{c.priority}</Badge>
            <span className="ml-auto inline-flex items-center gap-1">
              <Calendar className="size-3" /> {c.when}
            </span>
          </div>
          <DialogTitle className="text-lg leading-tight">{c.subject}</DialogTitle>
          <DialogDescription className="sr-only">Complaint detail</DialogDescription>
        </div>

        {/* Two-pane body */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-0">
          {/* Main */}
          <div className="p-5 space-y-4 lg:border-r">
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                Description
              </h4>
              <p className="text-sm leading-relaxed">{c.detail}</p>
            </section>

            <Separator />

            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Activity
              </h4>
              <ol className="relative border-l border-border pl-4 space-y-3">
                {c.timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
                    <div className="text-sm font-medium">{t.note}</div>
                    <div className="text-xs text-muted-foreground">{t.by} • {t.at}</div>
                  </li>
                ))}
              </ol>
            </section>

            <Separator />

            <section className="space-y-2">
              <Label htmlFor="reply" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Respond
              </Label>
              <Textarea id="reply" placeholder="Write a public response or internal note…" rows={3} />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm">
                  <Paperclip className="size-4" /> Attach
                </Button>
                <div className="flex items-center gap-2">
                  <Select defaultValue={c.status}>
                    <SelectTrigger className="w-[150px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Mark as new</SelectItem>
                      <SelectItem value="in-progress">In progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">
                    <Send className="size-4" /> Send
                  </Button>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="p-5 space-y-4 bg-muted/20">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Details
              </h4>
              <div className="rounded-md border bg-background divide-y text-sm">
                <SideRow label="Status">
                  <Badge variant="outline" className={statusStyle[c.status]}>{c.status}</Badge>
                </SideRow>
                <SideRow label="Priority">
                  <Badge variant="secondary" className={priorityStyle[c.priority]}>{c.priority}</Badge>
                </SideRow>
                <SideRow label="Category">
                  <span className="inline-flex items-center gap-1"><Tag className="size-3" />{c.category}</span>
                </SideRow>
                <SideRow label="Ward">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{c.ward}</span>
                </SideRow>
                <SideRow label="Assignee">
                  <span className="inline-flex items-center gap-1">
                    <UserCog className="size-3" />{c.assignee ?? "Unassigned"}
                  </span>
                </SideRow>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reporter
              </h4>
              <div className="rounded-md border bg-background divide-y text-sm">
                <SideRow label="Name">
                  <span className={anon ? "blur-sm select-none" : ""}>
                    {anon ? mask(c.name, 1) : c.name}
                  </span>
                </SideRow>
                <SideRow label="Phone">
                  <span className={`inline-flex items-center gap-1 ${anon ? "blur-sm select-none" : ""}`}>
                    <Phone className="size-3" />{anon ? mask(c.phone, 4) : c.phone}
                  </span>
                </SideRow>
                <SideRow label="Email">
                  <span className={`inline-flex items-center gap-1 ${anon ? "blur-sm select-none" : ""}`}>
                    <Mail className="size-3" />{anon ? mask(c.email, 2) : c.email}
                  </span>
                </SideRow>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <UserCog className="size-4" /> Reassign
            </Button>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SideRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-right truncate">{children}</span>
    </div>
  );
}
