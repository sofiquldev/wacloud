import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  GripVertical,
  Plus,
  Save,
  Settings2,
  Trash2,
  Copy,
  X,
  Image as ImageIcon,
  Link2,
  ArrowUp,
  ArrowDown,
  Check,
  Eye,
  LayoutTemplate,
  Pencil,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/widgets")({
  head: () => ({ meta: [{ title: "Widget Layout — Admin" }] }),
  component: WidgetManager,
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Zone = "left" | "main" | "right";

type WidgetType =
  | "hero"
  | "nav-services"
  | "hotline"
  | "notice-list"
  | "tender-list"
  | "member-card"
  | "members-grid"
  | "news-grid"
  | "quick-links"
  | "career-timeline"
  | "custom-html"
  | "gallery";

type MemberGroup = "all" | "mayor" | "panel-mayor" | "councilors" | "reserved" | "officers";

type LinkItem = { id: string; label: string; href: string };

type WidgetInstance = {
  id: string;
  type: WidgetType;
  title: string;
  config: {
    // member-card
    personId?: string;
    // members-grid
    group?: MemberGroup;
    includeIds?: string[];
    excludeIds?: string[];
    // generic
    limit?: number;
    variant?: string;
    // hero / gallery — media library refs
    mediaIds?: string[];
    // nav-services / quick-links — link list
    links?: LinkItem[];
    // custom-html
    html?: string;
  };
};

const WIDGET_CATALOG: { type: WidgetType; label: string; reusable: boolean }[] = [
  { type: "hero", label: "Hero Slider", reusable: false },
  { type: "nav-services", label: "Services Nav", reusable: true },
  { type: "hotline", label: "Hotline Card", reusable: true },
  { type: "notice-list", label: "Notice List", reusable: true },
  { type: "tender-list", label: "Tender List", reusable: true },
  { type: "member-card", label: "Person Card", reusable: true },
  { type: "members-grid", label: "Members Grid", reusable: true },
  { type: "news-grid", label: "News Grid", reusable: true },
  { type: "quick-links", label: "Quick Links", reusable: true },
  { type: "career-timeline", label: "Career Timeline", reusable: true },
  { type: "gallery", label: "Photo Gallery", reusable: true },
  { type: "custom-html", label: "Custom HTML", reusable: true },
];

// Mock people directory — would come from backend
const PEOPLE = [
  { id: "p1", name: "Md. Sharif Uddin Ahmed", role: "Mayor" },
  { id: "p2", name: "Rehana Parvin", role: "Panel Mayor (1)" },
  { id: "p3", name: "Abdul Karim Mollah", role: "Panel Mayor (2)" },
  { id: "p4", name: "Nasir Uddin Khan", role: "Councilor — Ward 01" },
  { id: "p5", name: "Salma Begum", role: "Reserved Councilor" },
  { id: "p6", name: "Mizanur Rahman", role: "Councilor — Ward 02" },
  { id: "p7", name: "Md. Faruk Hossain", role: "Chief Executive Officer" },
];

// Mock media library — would come from backend uploads
const MEDIA = [
  { id: "m1", name: "Hero — Municipal HQ", url: "/src/assets/hero-municipal.jpg" },
  { id: "m2", name: "News — Tree Drive", url: "/src/assets/news-tree.jpg" },
  { id: "m3", name: "News — Waste Mgmt", url: "/src/assets/news-waste.jpg" },
  { id: "m4", name: "Mayor Portrait", url: "/src/assets/mayor-portrait.jpg" },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const initial: Record<Zone, WidgetInstance[]> = {
  left: [
    { id: uid(), type: "nav-services", title: "Citizen Services", config: {} },
    { id: uid(), type: "hotline", title: "Emergency Hotline", config: {} },
  ],
  main: [
    { id: uid(), type: "hero", title: "Hero Slider", config: {} },
    { id: uid(), type: "members-grid", title: "Council Members", config: { group: "all" } },
    { id: uid(), type: "news-grid", title: "Latest News", config: { limit: 4 } },
  ],
  right: [
    { id: uid(), type: "member-card", title: "Mayor", config: { personId: "p1" } },
    { id: uid(), type: "member-card", title: "Chief Executive Officer", config: { personId: "p7" } },
    { id: uid(), type: "tender-list", title: "Active Tenders", config: { variant: "banner" } },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Layout = Record<Zone, WidgetInstance[]>;

const cloneLayout = (l: Layout): Layout => ({
  left: l.left.map((w) => ({ ...w, id: uid(), config: { ...w.config } })),
  main: l.main.map((w) => ({ ...w, id: uid(), config: { ...w.config } })),
  right: l.right.map((w) => ({ ...w, id: uid(), config: { ...w.config } })),
});

function WidgetManager() {
  const [templates, setTemplates] = useState<Record<string, Layout>>({
    "Homepage (default)": initial,
  });
  const [activeTpl, setActiveTpl] = useState<string>("Homepage (default)");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tplDialog, setTplDialog] = useState<null | { mode: "create" | "rename"; name: string }>(null);

  const layout = templates[activeTpl];
  const setLayout = (updater: Layout | ((prev: Layout) => Layout)) =>
    setTemplates((prev) => ({
      ...prev,
      [activeTpl]:
        typeof updater === "function" ? (updater as (p: Layout) => Layout)(prev[activeTpl]) : updater,
    }));

  const [editing, setEditing] = useState<{ zone: Zone; id: string } | null>(null);
  const [dragging, setDragging] = useState<{ zone: Zone; id: string } | null>(null);
  const [dragOver, setDragOver] = useState<{ zone: Zone; index: number } | null>(null);

  const editingWidget = editing
    ? layout[editing.zone].find((w) => w.id === editing.id) ?? null
    : null;

  const labelOf = (t: WidgetType) =>
    WIDGET_CATALOG.find((c) => c.type === t)?.label ?? t;

  const addWidget = (zone: Zone, type: WidgetType) => {
    const def = WIDGET_CATALOG.find((c) => c.type === type)!;
    const exists = Object.values(layout).flat().some((w) => w.type === type);
    if (!def.reusable && exists) {
      toast.error(`${def.label} can only be used once`);
      return;
    }
    const w: WidgetInstance = { id: uid(), type, title: def.label, config: {} };
    setLayout((p) => ({ ...p, [zone]: [...p[zone], w] }));
    setEditing({ zone, id: w.id });
  };

  const removeWidget = (zone: Zone, id: string) => {
    setLayout((p) => ({ ...p, [zone]: p[zone].filter((w) => w.id !== id) }));
    if (editing?.id === id) setEditing(null);
  };

  const duplicateWidget = (zone: Zone, id: string) => {
    const w = layout[zone].find((x) => x.id === id);
    if (!w) return;
    const def = WIDGET_CATALOG.find((c) => c.type === w.type);
    if (!def?.reusable) {
      toast.error(`${labelOf(w.type)} can only be used once`);
      return;
    }
    const copy: WidgetInstance = { ...w, id: uid(), title: `${w.title} (copy)` };
    setLayout((p) => {
      const arr = [...p[zone]];
      arr.splice(arr.indexOf(w) + 1, 0, copy);
      return { ...p, [zone]: arr };
    });
  };

  const updateWidget = (zone: Zone, id: string, patch: Partial<WidgetInstance>) => {
    setLayout((p) => ({
      ...p,
      [zone]: p[zone].map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }));
  };

  // Drag & Drop — cross-column reorder
  const handleDragStart = (zone: Zone, id: string) => setDragging({ zone, id });
  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  const handleDrop = (toZone: Zone, toIndex: number) => {
    if (!dragging) return;
    const { zone: fromZone, id } = dragging;
    setLayout((prev) => {
      const fromArr = [...prev[fromZone]];
      const fromIdx = fromArr.findIndex((w) => w.id === id);
      if (fromIdx === -1) return prev;
      const [moved] = fromArr.splice(fromIdx, 1);

      if (fromZone === toZone) {
        // Adjust target index after removal
        const adjusted = toIndex > fromIdx ? toIndex - 1 : toIndex;
        fromArr.splice(adjusted, 0, moved);
        return { ...prev, [fromZone]: fromArr };
      }
      const toArr = [...prev[toZone]];
      toArr.splice(toIndex, 0, moved);
      return { ...prev, [fromZone]: fromArr, [toZone]: toArr };
    });
    setDragging(null);
    setDragOver(null);
  };

  const save = () => {
    console.log("Saving templates", templates);
    toast.success(`"${activeTpl}" saved`);
  };

  const tplNames = Object.keys(templates);

  const createTemplate = (name: string, from?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return toast.error("Name is required");
    if (templates[trimmed]) return toast.error("Name already exists");
    const base: Layout = from
      ? cloneLayout(templates[from])
      : { left: [], main: [], right: [] };
    setTemplates((p) => ({ ...p, [trimmed]: base }));
    setActiveTpl(trimmed);
    toast.success(`Template "${trimmed}" created`);
  };

  const renameTemplate = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    if (templates[trimmed]) return toast.error("Name already exists");
    setTemplates((p) => {
      const { [oldName]: l, ...rest } = p;
      return { ...rest, [trimmed]: l };
    });
    setActiveTpl(trimmed);
  };

  const deleteTemplate = (name: string) => {
    if (tplNames.length <= 1) return toast.error("Keep at least one template");
    setTemplates((p) => {
      const { [name]: _, ...rest } = p;
      return rest;
    });
    setActiveTpl((cur) => (cur === name ? Object.keys(templates).filter((n) => n !== name)[0] : cur));
    toast.success(`Deleted "${name}"`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Homepage Widget Layout</h1>
          <p className="text-sm text-muted-foreground">
            Drag widgets between columns. Click a widget to configure its data source.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
            <LayoutTemplate className="size-4 text-muted-foreground ml-1.5" />
            <Select value={activeTpl} onValueChange={setActiveTpl}>
              <SelectTrigger className="h-8 border-0 shadow-none w-[180px] focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tplNames.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" variant="ghost" className="size-7" onClick={() => setTplDialog({ mode: "rename", name: activeTpl })} aria-label="Rename">
              <Pencil className="size-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="size-7" onClick={() => createTemplate(`${activeTpl} (copy)`, activeTpl)} aria-label="Duplicate template">
              <Copy className="size-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => deleteTemplate(activeTpl)} aria-label="Delete template" disabled={tplNames.length <= 1}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setTplDialog({ mode: "create", name: "" })}>
            <Plus className="size-4" /> New template
          </Button>
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" /> Preview
          </Button>
          <Button onClick={save}>
            <Save className="size-4" /> Save
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(["left", "main", "right"] as Zone[]).map((zone) => (
          <Card key={zone} className="flex flex-col">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                {zone === "main" ? "Main column" : `${zone} sidebar`}
                <span className="ml-2 normal-case tracking-normal text-foreground/60 font-normal">
                  ({layout[zone].length})
                </span>
              </CardTitle>
              <AddWidgetMenu onAdd={(t) => addWidget(zone, t)} />
            </CardHeader>
            <CardContent
              className="space-y-1.5 min-h-32"
              onDragOver={(e) => {
                if (!dragging) return;
                e.preventDefault();
                if (layout[zone].length === 0)
                  setDragOver({ zone, index: 0 });
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (layout[zone].length === 0) handleDrop(zone, 0);
              }}
            >
              {layout[zone].map((w, i) => (
                <div key={w.id}>
                  <DropZone
                    active={
                      !!dragging &&
                      dragOver?.zone === zone &&
                      dragOver.index === i
                    }
                    onDragOver={(e) => {
                      if (!dragging) return;
                      e.preventDefault();
                      setDragOver({ zone, index: i });
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(zone, i);
                    }}
                  />
                  <WidgetRow
                    widget={w}
                    typeLabel={labelOf(w.type)}
                    isDragging={dragging?.id === w.id}
                    onDragStart={() => handleDragStart(zone, w.id)}
                    onDragEnd={handleDragEnd}
                    onEdit={() => setEditing({ zone, id: w.id })}
                    onDuplicate={() => duplicateWidget(zone, w.id)}
                    onRemove={() => removeWidget(zone, w.id)}
                  />
                </div>
              ))}
              <DropZone
                active={
                  !!dragging &&
                  dragOver?.zone === zone &&
                  dragOver.index === layout[zone].length
                }
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  setDragOver({ zone, index: layout[zone].length });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(zone, layout[zone].length);
                }}
                tall={layout[zone].length === 0}
              />
              {layout[zone].length === 0 && (
                <p className="text-xs text-muted-foreground text-center pb-2">
                  Drop widgets here, or use +
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfigSheet
        open={!!editingWidget}
        widget={editingWidget}
        onClose={() => setEditing(null)}
        onChange={(patch) =>
          editing && updateWidget(editing.zone, editing.id, patch)
        }
      />

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        layout={layout}
        templateName={activeTpl}
      />

      <TemplateNameDialog
        state={tplDialog}
        existing={tplNames}
        onClose={() => setTplDialog(null)}
        onSubmit={(name) => {
          if (!tplDialog) return;
          if (tplDialog.mode === "create") createTemplate(name);
          else renameTemplate(tplDialog.name, name);
          setTplDialog(null);
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function AddWidgetMenu({ onAdd }: { onAdd: (t: WidgetType) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 gap-1">
          <Plus className="size-3.5" /> Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Add a widget</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {WIDGET_CATALOG.map((c) => (
          <DropdownMenuItem key={c.type} onClick={() => onAdd(c.type)}>
            {c.label}
            {!c.reusable && (
              <Badge variant="secondary" className="ml-auto text-[10px]">
                once
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function WidgetRow({
  widget,
  typeLabel,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onDuplicate,
  onRemove,
}: {
  widget: WidgetInstance;
  typeLabel: string;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group flex items-center gap-2 rounded-lg border border-border bg-surface p-2.5 transition-opacity ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <GripVertical className="size-4 text-muted-foreground cursor-grab shrink-0" />
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 min-w-0 text-left"
      >
        <div className="text-sm font-medium truncate">{widget.title}</div>
        <div className="text-[11px] text-muted-foreground truncate">
          {typeLabel}
          {widget.config.personId && ` · ${PEOPLE.find((p) => p.id === widget.config.personId)?.name ?? ""}`}
          {widget.config.group && widget.config.group !== "all" && ` · ${widget.config.group}`}
        </div>
      </button>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="size-7" onClick={onEdit} aria-label="Configure">
          <Settings2 className="size-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="size-7" onClick={onDuplicate} aria-label="Duplicate">
          <Copy className="size-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={onRemove} aria-label="Remove">
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function DropZone({
  active,
  tall,
  ...props
}: {
  active: boolean;
  tall?: boolean;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;
}) {
  return (
    <div
      {...props}
      className={`rounded-md transition-all ${
        active
          ? "h-12 my-1 bg-civic/10 border-2 border-dashed border-civic"
          : tall
          ? "h-16"
          : "h-1.5"
      }`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Config Sheet — per-widget data source editor
// ─────────────────────────────────────────────────────────────────────────────

function ConfigSheet({
  open,
  widget,
  onClose,
  onChange,
}: {
  open: boolean;
  widget: WidgetInstance | null;
  onClose: () => void;
  onChange: (patch: Partial<WidgetInstance>) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        {widget && (
          <>
            <SheetHeader>
              <SheetTitle>Configure widget</SheetTitle>
              <SheetDescription>
                {WIDGET_CATALOG.find((c) => c.type === widget.type)?.label}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="w-title">Display title</Label>
                <Input
                  id="w-title"
                  value={widget.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  placeholder="e.g. Mayor, CEO, Officer..."
                />
                <p className="text-xs text-muted-foreground">
                  Same widget can appear multiple times — give each a unique title.
                </p>
              </div>

              {/* member-card: select a person */}
              {widget.type === "member-card" && (
                <div className="space-y-2">
                  <Label>Person</Label>
                  <Select
                    value={widget.config.personId}
                    onValueChange={(v) =>
                      onChange({ config: { ...widget.config, personId: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a person" />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — <span className="text-muted-foreground">{p.role}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* members-grid: group + include/exclude */}
              {widget.type === "members-grid" && (
                <>
                  <div className="space-y-2">
                    <Label>Member group</Label>
                    <Select
                      value={widget.config.group ?? "all"}
                      onValueChange={(v) =>
                        onChange({ config: { ...widget.config, group: v as MemberGroup } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All members</SelectItem>
                        <SelectItem value="mayor">Mayor only</SelectItem>
                        <SelectItem value="panel-mayor">Panel mayors</SelectItem>
                        <SelectItem value="councilors">Ward councilors</SelectItem>
                        <SelectItem value="reserved">Reserved councilors</SelectItem>
                        <SelectItem value="officers">Officers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <PeoplePicker
                    label="Force include"
                    helper="Always show these people regardless of group filter."
                    value={widget.config.includeIds ?? []}
                    onChange={(ids) =>
                      onChange({ config: { ...widget.config, includeIds: ids } })
                    }
                  />

                  <PeoplePicker
                    label="Exclude"
                    helper="Hide these people from this widget instance."
                    value={widget.config.excludeIds ?? []}
                    onChange={(ids) =>
                      onChange({ config: { ...widget.config, excludeIds: ids } })
                    }
                  />
                </>
              )}

              {/* generic limit */}
              {(widget.type === "news-grid" ||
                widget.type === "notice-list" ||
                widget.type === "tender-list") && (
                <div className="space-y-2">
                  <Label htmlFor="w-limit">Item limit</Label>
                  <Input
                    id="w-limit"
                    type="number"
                    min={1}
                    max={50}
                    value={widget.config.limit ?? 5}
                    onChange={(e) =>
                      onChange({
                        config: { ...widget.config, limit: Number(e.target.value) || 5 },
                      })
                    }
                  />
                </div>
              )}

              {/* tender-list variant */}
              {widget.type === "tender-list" && (
                <div className="space-y-2">
                  <Label>Header style</Label>
                  <Select
                    value={widget.config.variant ?? "default"}
                    onValueChange={(v) =>
                      onChange({ config: { ...widget.config, variant: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="accent">Accent</SelectItem>
                      <SelectItem value="architectural">Architectural</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* hero / gallery — media library picker */}
              {(widget.type === "hero" || widget.type === "gallery") && (
                <MediaPicker
                  label={widget.type === "hero" ? "Slides" : "Gallery photos"}
                  helper={
                    widget.type === "hero"
                      ? "Pick images from the media library. Order = slide order."
                      : "Pick photos to display in the gallery grid."
                  }
                  value={widget.config.mediaIds ?? []}
                  onChange={(ids) =>
                    onChange({ config: { ...widget.config, mediaIds: ids } })
                  }
                />
              )}

              {/* nav-services / quick-links — link list editor */}
              {(widget.type === "nav-services" || widget.type === "quick-links") && (
                <LinkListEditor
                  value={widget.config.links ?? []}
                  onChange={(links) =>
                    onChange({ config: { ...widget.config, links } })
                  }
                />
              )}

              {/* custom-html — raw HTML editor */}
              {widget.type === "custom-html" && (
                <div className="space-y-2">
                  <Label htmlFor="w-html">Custom HTML</Label>
                  <Textarea
                    id="w-html"
                    rows={10}
                    className="font-mono text-xs"
                    placeholder="<div>Your HTML here…</div>"
                    value={widget.config.html ?? ""}
                    onChange={(e) =>
                      onChange({ config: { ...widget.config, html: e.target.value } })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Sanitized server-side before render. Avoid inline scripts.
                  </p>
                </div>
              )}
            </div>

            <SheetFooter>
              <Button variant="outline" onClick={onClose} className="w-full">
                <X className="size-4" /> Close
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PeoplePicker({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <div className="space-y-2">
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </div>
      <div className="rounded-lg border border-border max-h-44 overflow-y-auto divide-y divide-border">
        {PEOPLE.map((p) => (
          <label
            key={p.id}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50"
          >
            <Checkbox
              checked={value.includes(p.id)}
              onCheckedChange={() => toggle(p.id)}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{p.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{p.role}</div>
            </div>
          </label>
        ))}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((id) => {
            const p = PEOPLE.find((x) => x.id === id);
            return (
              <Badge key={id} variant="secondary" className="gap-1">
                {p?.name}
                <button onClick={() => toggle(id)} aria-label="Remove">
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Media library picker (multi-select with order)
// ─────────────────────────────────────────────────────────────────────────────

function MediaPicker({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...value];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label>{label}</Label>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          <ImageIcon className="size-3.5" /> {open ? "Done" : "Browse"}
        </Button>
      </div>

      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((id, i) => {
            const m = MEDIA.find((x) => x.id === id);
            return (
              <div
                key={id}
                className="flex items-center gap-2 rounded-md border border-border bg-surface p-1.5"
              >
                <div className="size-10 rounded bg-muted overflow-hidden shrink-0 grid place-items-center text-[10px] text-muted-foreground">
                  {m?.url ? (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    "?"
                  )}
                </div>
                <span className="flex-1 text-xs truncate">{m?.name ?? id}</span>
                <Button size="icon" variant="ghost" className="size-6" onClick={() => move(i, -1)} aria-label="Up">
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="size-6" onClick={() => move(i, 1)} aria-label="Down">
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="size-6 text-destructive" onClick={() => toggle(id)} aria-label="Remove">
                  <X className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="rounded-lg border border-border p-2 grid grid-cols-3 gap-2">
          {MEDIA.map((m) => {
            const sel = value.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className={`relative aspect-square rounded-md overflow-hidden ring-2 transition-all ${
                  sel ? "ring-civic" : "ring-transparent hover:ring-border"
                }`}
              >
                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                {sel && (
                  <span className="absolute top-1 right-1 size-5 rounded-full bg-civic text-civic-foreground grid place-items-center">
                    <Check className="size-3" />
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-[10px] text-white p-1 truncate text-left">
                  {m.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Link list editor (label + href, reorder, remove)
// ─────────────────────────────────────────────────────────────────────────────

function LinkListEditor({
  value,
  onChange,
}: {
  value: LinkItem[];
  onChange: (links: LinkItem[]) => void;
}) {
  const update = (id: string, patch: Partial<LinkItem>) =>
    onChange(value.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const remove = (id: string) => onChange(value.filter((l) => l.id !== id));
  const add = () =>
    onChange([...value, { id: uid(), label: "", href: "" }]);
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...value];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label>Links</Label>
          <p className="text-xs text-muted-foreground">
            Add menu items. Use full URL or relative path (e.g. /services/tax).
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="size-3.5" /> Add link
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground rounded-md border border-dashed border-border p-4 text-center">
          No links yet. Click <span className="font-medium">Add link</span> to start.
        </p>
      )}

      <div className="space-y-2">
        {value.map((l, i) => (
          <div
            key={l.id}
            className="rounded-md border border-border bg-surface p-2 space-y-1.5"
          >
            <div className="flex items-center gap-1">
              <Link2 className="size-3.5 text-muted-foreground shrink-0" />
              <Input
                value={l.label}
                onChange={(e) => update(l.id, { label: e.target.value })}
                placeholder="Label (e.g. Holding Tax)"
                className="h-8 text-sm"
              />
              <Button size="icon" variant="ghost" className="size-7" onClick={() => move(i, -1)} aria-label="Up">
                <ArrowUp className="size-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="size-7" onClick={() => move(i, 1)} aria-label="Down">
                <ArrowDown className="size-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => remove(l.id)} aria-label="Remove">
                <X className="size-3.5" />
              </Button>
            </div>
            <Input
              value={l.href}
              onChange={(e) => update(l.id, { href: e.target.value })}
              placeholder="/services/tax  or  https://…"
              className="h-8 text-xs ml-5"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template name dialog (create / rename)
// ─────────────────────────────────────────────────────────────────────────────

function TemplateNameDialog({
  state,
  existing,
  onClose,
  onSubmit,
}: {
  state: null | { mode: "create" | "rename"; name: string };
  existing: string[];
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const open = !!state;

  useEffect(() => {
    if (state?.mode === "rename") setName(state.name);
    else if (state?.mode === "create") setName("");
  }, [state]);

  const reset = () => {
    setName("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && reset()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state?.mode === "rename" ? "Rename template" : "New template"}
          </DialogTitle>
          <DialogDescription>
            {state?.mode === "rename"
              ? "Give this layout a new name."
              : "Create an empty layout you can build from scratch."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="tpl-name">Template name</Label>
          <Input
            id="tpl-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Election week, Festival, Crisis mode…"
            autoFocus
          />
          {existing.includes(name.trim()) && state?.mode === "create" && (
            <p className="text-xs text-destructive">A template with this name already exists.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={reset}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(name)} disabled={!name.trim()}>
            <Check className="size-4" />
            {state?.mode === "rename" ? "Rename" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview dialog — mini three-column mock of how the homepage would render
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_TONE: Record<string, string> = {
  hero: "from-civic/20 to-civic/5 border-civic/30",
  "nav-services": "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30",
  hotline: "from-rose-500/15 to-rose-500/5 border-rose-500/30",
  "notice-list": "from-amber-500/15 to-amber-500/5 border-amber-500/30",
  "tender-list": "from-orange-500/15 to-orange-500/5 border-orange-500/30",
  "member-card": "from-violet-500/15 to-violet-500/5 border-violet-500/30",
  "members-grid": "from-violet-500/15 to-violet-500/5 border-violet-500/30",
  "news-grid": "from-sky-500/15 to-sky-500/5 border-sky-500/30",
  "quick-links": "from-teal-500/15 to-teal-500/5 border-teal-500/30",
  "career-timeline": "from-indigo-500/15 to-indigo-500/5 border-indigo-500/30",
  gallery: "from-pink-500/15 to-pink-500/5 border-pink-500/30",
  "custom-html": "from-slate-500/15 to-slate-500/5 border-slate-500/30",
};

function PreviewBlock({ widget }: { widget: WidgetInstance }) {
  const tone = TYPE_TONE[widget.type] ?? "from-muted to-muted/50 border-border";
  const tall =
    widget.type === "hero"
      ? "h-24"
      : widget.type === "members-grid" || widget.type === "news-grid" || widget.type === "gallery"
      ? "h-20"
      : widget.type === "member-card"
      ? "h-16"
      : "h-12";

  return (
    <div className={`rounded-md border bg-gradient-to-br ${tone} ${tall} p-2 flex flex-col justify-between`}>
      <div className="text-[10px] font-semibold text-foreground truncate">{widget.title}</div>
      <div className="text-[9px] text-muted-foreground uppercase tracking-wide truncate">
        {WIDGET_CATALOG.find((c) => c.type === widget.type)?.label}
      </div>
    </div>
  );
}

function PreviewDialog({
  open,
  onClose,
  layout,
  templateName,
}: {
  open: boolean;
  onClose: () => void;
  layout: Layout;
  templateName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-4" /> Layout preview
          </DialogTitle>
          <DialogDescription>
            Mock of <span className="font-medium text-foreground">{templateName}</span> — relative widget order and column placement.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          {/* fake browser chrome */}
          <div className="flex items-center gap-1.5 pb-2">
            <span className="size-2 rounded-full bg-rose-400" />
            <span className="size-2 rounded-full bg-amber-400" />
            <span className="size-2 rounded-full bg-emerald-400" />
            <div className="ml-2 h-4 flex-1 rounded bg-background/80 ring-1 ring-border" />
          </div>

          {/* fake header */}
          <div className="h-8 rounded-md bg-civic/90 mb-2 flex items-center px-3">
            <div className="h-2 w-20 bg-civic-foreground/70 rounded" />
            <div className="ml-auto flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-1.5 w-8 bg-civic-foreground/40 rounded" />
              ))}
            </div>
          </div>

          {/* three columns */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-3 space-y-1.5">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Left</div>
              {layout.left.length === 0 ? (
                <EmptyHint />
              ) : (
                layout.left.map((w) => <PreviewBlock key={w.id} widget={w} />)
              )}
            </div>
            <div className="col-span-6 space-y-1.5">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Main</div>
              {layout.main.length === 0 ? (
                <EmptyHint />
              ) : (
                layout.main.map((w) => <PreviewBlock key={w.id} widget={w} />)
              )}
            </div>
            <div className="col-span-3 space-y-1.5">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground px-1">Right</div>
              {layout.right.length === 0 ? (
                <EmptyHint />
              ) : (
                layout.right.map((w) => <PreviewBlock key={w.id} widget={w} />)
              )}
            </div>
          </div>

          {/* fake footer */}
          <div className="h-6 rounded bg-foreground/80 mt-2" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button asChild>
            <a href="/" target="_blank" rel="noreferrer">
              <Eye className="size-4" /> Open live homepage
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmptyHint() {
  return (
    <div className="rounded-md border border-dashed border-border h-12 grid place-items-center">
      <span className="text-[9px] text-muted-foreground">Empty</span>
    </div>
  );
}
