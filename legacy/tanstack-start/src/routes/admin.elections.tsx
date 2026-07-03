import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Vote,
  Users,
  Calendar,
  Star,
  Plus,
  Pencil,
  Trash2,
  Save,
  Tags,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { SESSIONS, DESIGNATIONS, WARDS } from "@/data/adminMeta";

export const Route = createFileRoute("/admin/elections")({
  head: () => ({ meta: [{ title: "Elections — Admin" }] }),
  component: ElectionsPage,
});

type Category = { designation: string; seats: number };
type ElectedMember = {
  id: number;
  name: string;
  designation: string;
  ward?: string;
  party?: string;
};
type Election = {
  sessionId: string;
  title: string;
  electionDate: string;
  oathDate?: string;
  notes?: string;
  categories: Category[];
  members: ElectedMember[];
};

const initialElections: Record<string, Election> = {
  "s-2024": {
    sessionId: "s-2024",
    title: "6th Pourashava Election",
    electionDate: "2024-03-15",
    oathDate: "2024-04-02",
    notes: "Conducted in 9 wards with 36 polling stations.",
    categories: [
      { designation: "Mayor", seats: 1 },
      { designation: "Councilor", seats: 9 },
      { designation: "Reserved Councilor", seats: 3 },
    ],
    members: [
      { id: 1, name: "Md. Sharif Uddin", designation: "Mayor", ward: "Pourashava (city-wide)" },
      { id: 2, name: "Rehana Akter", designation: "Reserved Councilor", ward: "Ward 4-5-6 (Reserved)" },
      { id: 3, name: "Md. Karim Mia", designation: "Councilor", ward: "Ward 02" },
      { id: 4, name: "Salma Begum", designation: "Reserved Councilor", ward: "Ward 1-2-3 (Reserved)" },
    ],
  },
  "s-2019": {
    sessionId: "s-2019",
    title: "5th Pourashava Election",
    electionDate: "2019-12-28",
    categories: [
      { designation: "Mayor", seats: 1 },
      { designation: "Councilor", seats: 9 },
      { designation: "Reserved Councilor", seats: 3 },
    ],
    members: [
      { id: 1, name: "Md. Sharif Uddin", designation: "Mayor", ward: "Pourashava (city-wide)" },
      { id: 2, name: "Rehana Akter", designation: "Reserved Councilor", ward: "Ward 4-5-6 (Reserved)" },
    ],
  },
  "s-2014": {
    sessionId: "s-2014",
    title: "4th Pourashava Election",
    electionDate: "2014-06-21",
    categories: [
      { designation: "Mayor", seats: 1 },
      { designation: "Councilor", seats: 9 },
    ],
    members: [
      { id: 5, name: "Abdul Hannan", designation: "Councilor", ward: "Ward 05" },
      { id: 1, name: "Md. Sharif Uddin", designation: "Councilor", ward: "Ward 03" },
    ],
  },
  "s-2009": {
    sessionId: "s-2009",
    title: "3rd Pourashava Election",
    electionDate: "2009-01-22",
    categories: [{ designation: "Councilor", seats: 9 }],
    members: [{ id: 5, name: "Abdul Hannan", designation: "Councilor", ward: "Ward 05" }],
  },
};

function ElectionsPage() {
  const [elections, setElections] = useState(initialElections);
  const [sessionId, setSessionId] = useState(SESSIONS.find((s) => s.current)?.id ?? SESSIONS[0].id);
  const [editHeader, setEditHeader] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [addCatOpen, setAddCatOpen] = useState(false);

  const session = SESSIONS.find((s) => s.id === sessionId)!;
  const election = elections[sessionId];

  const updateElection = (patch: Partial<Election>) =>
    setElections((p) => ({ ...p, [sessionId]: { ...p[sessionId], ...patch } }));

  const grouped = useMemo(() => {
    const m: Record<string, ElectedMember[]> = {};
    for (const x of election?.members ?? []) (m[x.designation] ??= []).push(x);
    return m;
  }, [election]);

  const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("");

  if (!election) {
    return (
      <Card>
        <CardContent className="py-16 text-center space-y-3">
          <p className="text-sm text-muted-foreground">No election record for this session yet.</p>
          <Button
            onClick={() =>
              setElections((p) => ({
                ...p,
                [sessionId]: {
                  sessionId,
                  title: `Election — ${session.label}`,
                  electionDate: new Date().toISOString().slice(0, 10),
                  categories: [],
                  members: [],
                },
              }))
            }
          >
            <Plus className="size-4" /> Create election
          </Button>
        </CardContent>
      </Card>
    );
  }

  const filledFor = (d: string) => election.members.filter((m) => m.designation === d).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Vote className="size-6 text-civic" /> Elections
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage election records, categories and elected representatives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SESSIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}{s.current && " ★"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Election header card */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl">{election.title}</CardTitle>
              {session.current && (
                <Badge className="bg-civic text-civic-foreground">
                  <Star className="size-3" /> Current
                </Badge>
              )}
            </div>
            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{session.label}</span>
              <span>· Polling: <strong className="text-foreground">{election.electionDate}</strong></span>
              {election.oathDate && (
                <span>· Oath: <strong className="text-foreground">{election.oathDate}</strong></span>
              )}
            </CardDescription>
            {election.notes && (
              <p className="text-xs text-muted-foreground pt-1">{election.notes}</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditHeader(true)}>
            <Pencil className="size-3.5" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0">
          <Stat label="Total seats" value={election.categories.reduce((a, c) => a + c.seats, 0)} />
          <Stat label="Filled" value={election.members.length} />
          <Stat label="Categories" value={election.categories.length} />
          <Stat label="Wards covered" value={new Set(election.members.map((m) => m.ward)).size} />
        </CardContent>
      </Card>

      {/* Categories editor */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Tags className="size-4" /> Designation categories
            </CardTitle>
            <CardDescription>
              How many seats are contested in this election, per designation.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAddCatOpen(true)}>
            <Plus className="size-4" /> Add category
          </Button>
        </CardHeader>
        <CardContent>
          {election.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-6 text-center">
              No categories defined. Add at least one (e.g. Mayor, Councilor).
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {election.categories.map((c) => {
                const filled = filledFor(c.designation);
                const pct = c.seats > 0 ? Math.min(100, (filled / c.seats) * 100) : 0;
                const complete = filled >= c.seats;
                return (
                  <li
                    key={c.designation}
                    className="rounded-lg border border-border bg-surface p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{c.designation}</p>
                        <p className="text-xs text-muted-foreground">
                          {filled} / {c.seats} seats filled
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 -mr-1">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditCat(c)}>
                            <Pencil className="size-4" /> Edit seats
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              updateElection({
                                categories: election.categories.filter((x) => x.designation !== c.designation),
                              })
                            }
                          >
                            <Trash2 className="size-4" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    {complete ? (
                      <Badge variant="secondary" className="bg-civic/10 text-civic">Complete</Badge>
                    ) : (
                      <Badge variant="secondary">{c.seats - filled} open</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Elected members */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4" /> Elected representatives
            </CardTitle>
            <CardDescription>People who won seats in this election.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setAddMemberOpen(true)}>
            <UserPlus className="size-4" /> Add member
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {election.categories.length === 0 && (
            <p className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-6 text-center">
              Define categories first, then add winners to each.
            </p>
          )}
          {election.categories.map((c) => {
            const list = grouped[c.designation] ?? [];
            return (
              <div key={c.designation}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    {c.designation}
                  </h3>
                  <Badge variant="secondary">{list.length} / {c.seats}</Badge>
                </div>
                {list.length === 0 ? (
                  <p className="text-xs text-muted-foreground rounded-md border border-dashed border-border py-4 px-3">
                    No members added yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {list.map((m) => (
                      <div
                        key={`${m.id}-${m.designation}-${m.ward}`}
                        className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2.5"
                      >
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-civic-muted text-civic text-xs">
                            {initials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.ward ?? "—"}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive"
                          onClick={() =>
                            updateElection({
                              members: election.members.filter((x) => x !== m),
                            })
                          }
                          aria-label="Remove"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <EditHeaderDialog
        open={editHeader}
        election={election}
        onClose={() => setEditHeader(false)}
        onSubmit={(patch) => {
          updateElection(patch);
          setEditHeader(false);
          toast.success("Election updated");
        }}
      />

      <AddCategoryDialog
        open={addCatOpen}
        existing={election.categories.map((c) => c.designation)}
        onClose={() => setAddCatOpen(false)}
        onSubmit={(c) => {
          updateElection({ categories: [...election.categories, c] });
          setAddCatOpen(false);
          toast.success(`${c.designation} added`);
        }}
      />

      <EditCategoryDialog
        category={editCat}
        onClose={() => setEditCat(null)}
        onSubmit={(updated) => {
          updateElection({
            categories: election.categories.map((c) =>
              c.designation === editCat?.designation ? updated : c,
            ),
          });
          setEditCat(null);
        }}
      />

      <AddMemberDialog
        open={addMemberOpen}
        categories={election.categories}
        onClose={() => setAddMemberOpen(false)}
        onSubmit={(m) => {
          updateElection({
            members: [...election.members, { ...m, id: Date.now() }],
          });
          setAddMemberOpen(false);
          toast.success(`${m.name} added`);
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function EditHeaderDialog({
  open,
  election,
  onClose,
  onSubmit,
}: {
  open: boolean;
  election: Election;
  onClose: () => void;
  onSubmit: (patch: Partial<Election>) => void;
}) {
  const [form, setForm] = useState({
    title: election.title,
    electionDate: election.electionDate,
    oathDate: election.oathDate ?? "",
    notes: election.notes ?? "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: election.title,
        electionDate: election.electionDate,
        oathDate: election.oathDate ?? "",
        notes: election.notes ?? "",
      });
    }
  }, [open, election]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit election</DialogTitle>
          <DialogDescription>
            Sessions are managed in <span className="font-medium text-foreground">Settings → Sessions</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Election title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. 6th Pourashava Election"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Polling date</Label>
              <Input type="date" value={form.electionDate} onChange={(e) => setForm({ ...form, electionDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Oath date</Label>
              <Input type="date" value={form.oathDate} onChange={(e) => setForm({ ...form, oathDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!form.title.trim()) return toast.error("Title is required");
              onSubmit({
                title: form.title,
                electionDate: form.electionDate,
                oathDate: form.oathDate || undefined,
                notes: form.notes || undefined,
              });
            }}
          >
            <Save className="size-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCategoryDialog({
  open,
  existing,
  onClose,
  onSubmit,
}: {
  open: boolean;
  existing: string[];
  onClose: () => void;
  onSubmit: (c: Category) => void;
}) {
  const available = DESIGNATIONS.filter((d) => !existing.includes(d));
  const [designation, setDesignation] = useState(available[0] ?? "");
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    if (open) {
      setDesignation(available[0] ?? "");
      setSeats(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add category</DialogTitle>
          <DialogDescription>
            Pick a designation and how many seats it has in this election.
          </DialogDescription>
        </DialogHeader>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            All designations are already added. Manage the master list in Settings.
          </p>
        ) : (
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <Select value={designation} onValueChange={setDesignation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {available.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Number of seats</Label>
              <Input
                type="number"
                min={1}
                value={seats}
                onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!designation} onClick={() => onSubmit({ designation, seats })}>
            <Plus className="size-4" /> Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditCategoryDialog({
  category,
  onClose,
  onSubmit,
}: {
  category: Category | null;
  onClose: () => void;
  onSubmit: (c: Category) => void;
}) {
  const [seats, setSeats] = useState(1);
  useEffect(() => {
    if (category) setSeats(category.seats);
  }, [category]);

  return (
    <Dialog open={!!category} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{category?.designation}</DialogTitle>
          <DialogDescription>Update the number of seats.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label>Seats</Label>
          <Input
            type="number"
            min={1}
            value={seats}
            onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => category && onSubmit({ ...category, seats })}>
            <Save className="size-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddMemberDialog({
  open,
  categories,
  onClose,
  onSubmit,
}: {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onSubmit: (m: Omit<ElectedMember, "id">) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    designation: categories[0]?.designation ?? "",
    ward: WARDS[0],
    party: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        designation: categories[0]?.designation ?? "",
        ward: WARDS[0],
        party: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add elected member</DialogTitle>
          <DialogDescription>
            Record a winner for this election. Full member profiles live in{" "}
            <span className="font-medium text-foreground">Members</span>.
          </DialogDescription>
        </DialogHeader>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add at least one category before adding members.
          </p>
        ) : (
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Full name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Md. Karim Mia" />
            </div>
            <div className="space-y-1.5">
              <Label>Designation *</Label>
              <Select value={form.designation} onValueChange={(v) => setForm({ ...form, designation: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.designation} value={c.designation}>
                      {c.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Ward / Position</Label>
              <Select value={form.ward} onValueChange={(v) => setForm({ ...form, ward: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WARDS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Party / Affiliation</Label>
              <Input value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder="Optional" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={categories.length === 0}
            onClick={() => {
              if (!form.name.trim()) return toast.error("Name is required");
              onSubmit({
                name: form.name,
                designation: form.designation,
                ward: form.ward,
                party: form.party || undefined,
              });
            }}
          >
            <UserPlus className="size-4" /> Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
