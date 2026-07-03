import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Save, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DESIGNATIONS, WARDS, SESSIONS } from "@/data/adminMeta";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage taxonomies that power members, elections and the public site.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="designations">Designations</TabsTrigger>
          <TabsTrigger value="wards">Wards</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="designations">
          <ListEditor
            title="Designations"
            description="Roles members can hold (Mayor, Councilor, CEO, etc.)."
            initial={DESIGNATIONS.map((d) => ({ id: d, label: d }))}
            placeholder="e.g. Panel Mayor (3)"
          />
        </TabsContent>

        <TabsContent value="wards">
          <ListEditor
            title="Wards & Positions"
            description="Geographic wards or city-wide positions used in member assignments."
            initial={WARDS.map((w) => ({ id: w, label: w }))}
            placeholder="e.g. Ward 10"
          />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionsEditor />
        </TabsContent>

        <TabsContent value="general">
          <GeneralSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSection() {
  const [form, setForm] = useState({
    name: "Shahidul Admin",
    email: "admin@pabna.gov.bd",
    phone: "+8801711-000000",
    password: "",
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>My profile</CardTitle>
        <CardDescription>Information shown across the admin console.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Change password</Label>
            <Input type="password" placeholder="Leave blank to keep" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => toast.success("Profile updated")}>
            <Save className="size-4" /> Save profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GeneralSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>Site-wide settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-xl">
        <div className="space-y-1.5">
          <Label>Pourashava name</Label>
          <Input defaultValue="Pabna Pourashava" />
        </div>
        <div className="space-y-1.5">
          <Label>Contact email</Label>
          <Input defaultValue="info@pabna.gov.bd" />
        </div>
        <div className="space-y-1.5">
          <Label>Hotline</Label>
          <Input defaultValue="16122" />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => toast.success("Settings saved")}>
            <Save className="size-4" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ListEditor({
  title,
  description,
  initial,
  placeholder,
}: {
  title: string;
  description: string;
  initial: { id: string; label: string }[];
  placeholder: string;
}) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (items.some((i) => i.label.toLowerCase() === v.toLowerCase())) {
      return toast.error("Already exists");
    }
    setItems([...items, { id: v, label: v }]);
    setDraft("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button onClick={add}><Plus className="size-4" /> Add</Button>
        </div>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((item, i) => (
            <li key={item.id + i} className="flex items-center gap-2 px-3 py-2">
              <Input
                value={item.label}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...item, label: e.target.value };
                  setItems(next);
                }}
                className="h-8 flex-1 border-0 shadow-none focus-visible:ring-1 px-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive"
                onClick={() => setItems(items.filter((_, x) => x !== i))}
                aria-label="Remove"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No items yet.</li>
          )}
        </ul>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => toast.success(`${title} saved`)}>
            <Save className="size-4" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionsEditor() {
  const [items, setItems] = useState(SESSIONS);
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setItems([...items, { id: `s-${Date.now()}`, label: v }]);
    setDraft("");
  };

  const setCurrent = (id: string) =>
    setItems(items.map((s) => ({ ...s, current: s.id === id })));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Election Sessions</CardTitle>
        <CardDescription>
          Term cycles members are elected for. Mark one as the current session — it powers the public site dropdowns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. 2029 — 2034 (7th Election)"
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button onClick={add}><Plus className="size-4" /> Add session</Button>
        </div>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2 px-3 py-2">
              <Input
                value={s.label}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...s, label: e.target.value };
                  setItems(next);
                }}
                className="h-8 flex-1 border-0 shadow-none focus-visible:ring-1 px-1"
              />
              {s.current ? (
                <Badge className="bg-civic text-civic-foreground"><Star className="size-3" /> Current</Badge>
              ) : (
                <Button variant="ghost" size="sm" className="h-7" onClick={() => setCurrent(s.id)}>
                  Set current
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive"
                onClick={() => setItems(items.filter((_, x) => x !== i))}
                aria-label="Remove"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => toast.success("Sessions saved")}>
            <Save className="size-4" /> Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
