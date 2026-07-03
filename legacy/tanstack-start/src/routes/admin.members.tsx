import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  History as HistoryIcon,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DESIGNATIONS, WARDS, SESSIONS } from "@/data/adminMeta";

export const Route = createFileRoute("/admin/members")({
  head: () => ({ meta: [{ title: "Members — Admin" }] }),
  component: MembersPage,
});

type HistoryEntry = { sessionId: string; designation: string; ward?: string; current?: boolean };
type Member = {
  id: number;
  name: string;
  designation: string;
  ward?: string;
  sessionId: string;
  phone?: string;
  email?: string;
  status: "active" | "past";
  history: HistoryEntry[];
};

const seed: Member[] = [
  {
    id: 1,
    name: "Md. Sharif Uddin",
    designation: "Mayor",
    ward: "Pourashava (city-wide)",
    sessionId: "s-2024",
    phone: "+8801711-000001",
    email: "mayor@pabna.gov.bd",
    status: "active",
    history: [
      { sessionId: "s-2024", designation: "Mayor", current: true },
      { sessionId: "s-2019", designation: "Mayor" },
      { sessionId: "s-2014", designation: "Councilor", ward: "Ward 03" },
    ],
  },
  {
    id: 2,
    name: "Rehana Akter",
    designation: "Reserved Councilor",
    ward: "Ward 4-5-6 (Reserved)",
    sessionId: "s-2024",
    status: "active",
    history: [{ sessionId: "s-2024", designation: "Reserved Councilor", ward: "Ward 4-5-6", current: true }],
  },
  {
    id: 3,
    name: "Md. Karim Mia",
    designation: "Councilor",
    ward: "Ward 02",
    sessionId: "s-2024",
    status: "active",
    history: [{ sessionId: "s-2024", designation: "Councilor", ward: "Ward 02", current: true }],
  },
  {
    id: 4,
    name: "Abdul Hannan",
    designation: "Councilor",
    ward: "Ward 05",
    sessionId: "s-2014",
    status: "past",
    history: [
      { sessionId: "s-2014", designation: "Councilor", ward: "Ward 05" },
      { sessionId: "s-2009", designation: "Councilor", ward: "Ward 05" },
    ],
  },
];

const empty = (): Omit<Member, "id" | "history"> => ({
  name: "",
  designation: DESIGNATIONS[0],
  ward: WARDS[0],
  sessionId: SESSIONS[0].id,
  phone: "",
  email: "",
  status: "active",
});

function MembersPage() {
  const [members, setMembers] = useState<Member[]>(seed);
  const [q, setQ] = useState("");
  const [fDesignation, setFDesignation] = useState("all");
  const [fWard, setFWard] = useState("all");
  const [fSession, setFSession] = useState("all");
  const [fStatus, setFStatus] = useState("all");

  const [editing, setEditing] = useState<Member | null>(null);
  const [historyOf, setHistoryOf] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Member | null>(null);

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const matchesQ = `${m.name} ${m.designation} ${m.ward ?? ""} ${m.email ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase());
        const matchesD = fDesignation === "all" || m.designation === fDesignation;
        const matchesW = fWard === "all" || m.ward === fWard;
        const matchesS = fSession === "all" || m.sessionId === fSession;
        const matchesSt = fStatus === "all" || m.status === fStatus;
        return matchesQ && matchesD && matchesW && matchesS && matchesSt;
      }),
    [members, q, fDesignation, fWard, fSession, fStatus],
  );

  const sessionLabel = (id: string) => SESSIONS.find((s) => s.id === id)?.label ?? id;

  const upsert = (m: Member) => {
    setMembers((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      if (idx === -1) return [...prev, m];
      const next = [...prev];
      next[idx] = m;
      return next;
    });
  };

  const remove = (id: number) => {
    setMembers((p) => p.filter((m) => m.id !== id));
    toast.success("Member removed");
  };

  const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">
            Mayor, councilors and election history. Manage designations, wards and sessions in{" "}
            <span className="font-medium text-foreground">Settings</span>.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" /> Add member
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="size-3.5" /> Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <div className="relative lg:col-span-2">
              <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ward, email…" className="pl-8" />
            </div>
            <Select value={fDesignation} onValueChange={setFDesignation}>
              <SelectTrigger><SelectValue placeholder="Designation" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All designations</SelectItem>
                {DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fWard} onValueChange={setFWard}>
              <SelectTrigger><SelectValue placeholder="Ward" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All wards</SelectItem>
                {WARDS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fSession} onValueChange={setFSession}>
              <SelectTrigger><SelectValue placeholder="Session" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sessions</SelectItem>
                {SESSIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-muted-foreground">Status:</span>
            {(["all", "active", "past"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFStatus(s)}
                className={`px-2.5 py-1 rounded-full border transition-colors ${
                  fStatus === s
                    ? "bg-civic text-civic-foreground border-civic"
                    : "border-border hover:bg-muted"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
            <span className="ml-auto text-muted-foreground">{filtered.length} of {members.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Member</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Designation</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Ward</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Session</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right w-12">·</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <button
                    onClick={() => setEditing(m)}
                    className="flex items-center gap-3 group text-left"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-civic-muted text-civic text-xs">{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="font-medium group-hover:text-civic transition-colors">{m.name}</span>
                      {m.email && <p className="text-xs text-muted-foreground truncate">{m.email}</p>}
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3">{m.designation}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.ward ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{sessionLabel(m.sessionId)}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={m.status === "active" ? "bg-civic text-civic-foreground" : ""}>
                    {m.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <RowActions
                    onView={() => setEditing(m)}
                    onEdit={() => setEditing(m)}
                    onHistory={() => setHistoryOf(m)}
                    onDelete={() => setConfirmDelete(m)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No members match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((m) => (
          <Card key={m.id}>
            <CardContent className="pt-5 flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarFallback className="bg-civic-muted text-civic">{initials(m.name)}</AvatarFallback>
              </Avatar>
              <button onClick={() => setEditing(m)} className="flex-1 min-w-0 text-left">
                <p className="font-medium truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {m.designation}{m.ward ? ` • ${m.ward}` : ""}
                </p>
                <p className="text-[10px] text-muted-foreground/80 truncate">{sessionLabel(m.sessionId)}</p>
              </button>
              <RowActions
                onView={() => setEditing(m)}
                onEdit={() => setEditing(m)}
                onHistory={() => setHistoryOf(m)}
                onDelete={() => setConfirmDelete(m)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit / Add */}
      <MemberDialog
        open={!!editing || creating}
        member={editing}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSubmit={(m) => {
          if (editing) {
            upsert(m);
            toast.success("Member updated");
          } else {
            upsert({ ...m, id: Math.max(0, ...members.map((x) => x.id)) + 1 });
            toast.success("Member added");
          }
          setEditing(null);
          setCreating(false);
        }}
      />

      {/* History */}
      <Dialog open={!!historyOf} onOpenChange={(o) => !o && setHistoryOf(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{historyOf?.name}</DialogTitle>
            <DialogDescription>Election & service history</DialogDescription>
          </DialogHeader>
          <ol className="mt-2 relative border-l border-border pl-5 space-y-5">
            {historyOf?.history.map((h, i) => (
              <li key={i} className="relative">
                <span
                  className={`absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-background ${
                    h.current ? "bg-civic" : "bg-muted-foreground/40"
                  }`}
                />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {sessionLabel(h.sessionId)}
                </p>
                <p className="font-medium">
                  {h.designation}{h.ward ? ` — ${h.ward}` : ""}
                </p>
                {h.current && <Badge className="mt-1 bg-civic text-civic-foreground">Current</Badge>}
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove member?</DialogTitle>
            <DialogDescription>
              This will remove <span className="font-medium text-foreground">{confirmDelete?.name}</span>.
              Their election history will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete) remove(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              <Trash2 className="size-4" /> Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowActions({
  onView,
  onEdit,
  onHistory,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onHistory: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}><Eye className="size-4" /> View</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}><Pencil className="size-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={onHistory}><HistoryIcon className="size-4" /> History</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="size-4" /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MemberDialog({
  open,
  member,
  onClose,
  onSubmit,
}: {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onSubmit: (m: Member) => void;
}) {
  const [form, setForm] = useState<Omit<Member, "id" | "history">>(empty());
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Sync when opening
  useEffect(() => {
    if (open) {
      if (member) {
        const { id: _id, history: h, ...rest } = member;
        setForm(rest);
        setHistory(h);
      } else {
        setForm(empty());
        setHistory([]);
      }
    }
  }, [open, member]);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return toast.error("Name is required");
    const built: Member = {
      id: member?.id ?? 0,
      ...form,
      history:
        history.length > 0
          ? history
          : [{ sessionId: form.sessionId, designation: form.designation, ward: form.ward, current: form.status === "active" }],
    };
    onSubmit(built);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{member ? "Edit member" : "Add member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update member details and election history." : "Create a new council member or officer."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              History {history.length > 0 && <span className="ml-1 text-xs opacity-70">({history.length})</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Full name *</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Md. Sharif Uddin" />
              </div>
              <div className="space-y-1.5">
                <Label>Designation *</Label>
                <Select value={form.designation} onValueChange={(v) => update("designation", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ward / Position</Label>
                <Select value={form.ward} onValueChange={(v) => update("ward", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WARDS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Session *</Label>
                <Select value={form.sessionId} onValueChange={(v) => update("sessionId", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SESSIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v as "active" | "past")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} placeholder="+8801…" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} placeholder="name@pabna.gov.bd" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Need a new designation, ward or session? Add it in <span className="font-medium text-foreground">Settings</span>.
            </p>
          </TabsContent>

          <TabsContent value="history" className="space-y-3 pt-4">
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-6 text-center">
                No previous terms. The current session entry will be created automatically when you save.
              </p>
            )}
            {history.map((h, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-md border border-border p-2">
                <Select value={h.sessionId} onValueChange={(v) => {
                  const next = [...history]; next[i] = { ...h, sessionId: v }; setHistory(next);
                }}>
                  <SelectTrigger className="sm:col-span-4"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SESSIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={h.designation} onValueChange={(v) => {
                  const next = [...history]; next[i] = { ...h, designation: v }; setHistory(next);
                }}>
                  <SelectTrigger className="sm:col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={h.ward ?? ""} onValueChange={(v) => {
                  const next = [...history]; next[i] = { ...h, ward: v }; setHistory(next);
                }}>
                  <SelectTrigger className="sm:col-span-4"><SelectValue placeholder="Ward" /></SelectTrigger>
                  <SelectContent>
                    {WARDS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 sm:col-span-1 ml-auto text-destructive"
                  onClick={() => setHistory(history.filter((_, x) => x !== i))}
                  aria-label="Remove entry"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setHistory([
                  ...history,
                  { sessionId: SESSIONS[0].id, designation: DESIGNATIONS[0], ward: WARDS[0] },
                ])
              }
            >
              <Plus className="size-3.5" /> Add term
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{member ? "Save changes" : "Add member"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
