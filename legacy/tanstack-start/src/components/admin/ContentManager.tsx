import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Globe,
  EyeOff,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";
import {
  ensureSeed,
  removeItem,
  upsertItem,
  useContentList,
} from "@/data/contentStore";

export type ContentItem = {
  id: number;
  title: string;
  slug: string;
  status: "published" | "draft";
  category?: string;
  template?: string;
  excerpt: string;
  body: string;
  featuredImage?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  visibility?: "public" | "private";
  publishAt?: string;
  department?: string;
  updatedAt: string;
};

export type ContentKind = "Page" | "Service" | "Notice";

export const TEMPLATES: Record<ContentKind, { value: string; label: string; hint: string }[]> = {
  Page: [
    { value: "default", label: "Default", hint: "Standard content layout" },
    { value: "full-width", label: "Full width", hint: "No sidebar, edge-to-edge" },
    { value: "landing", label: "Landing", hint: "Hero + sections" },
    { value: "sidebar", label: "With sidebar", hint: "Sticky sidebar nav" },
  ],
  Service: [
    { value: "default", label: "Default", hint: "Overview + steps" },
    { value: "form", label: "Form-based", hint: "Step-by-step application" },
    { value: "downloads", label: "Downloads", hint: "Forms & PDFs to download" },
    { value: "fees", label: "Fees", hint: "Fee schedule layout" },
  ],
  Notice: [
    { value: "default", label: "Default", hint: "Single notice" },
    { value: "tender", label: "Tender", hint: "Procurement notice" },
    { value: "circular", label: "Circular", hint: "Department circular" },
  ],
};

const labelOf = (k: ContentKind) =>
  k === "Page" ? "Pages" : k === "Service" ? "Services" : "Notices";

export function ContentManager({
  kind,
  initial,
  categories,
  basePath,
}: {
  kind: ContentKind;
  initial: ContentItem[];
  categories: string[];
  basePath: string;
}) {
  ensureSeed(kind, initial);
  const items = useContentList(kind);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState<"all" | "published" | "draft">("all");
  const [fCategory, setFCategory] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<ContentItem | null>(null);

  const filtered = items.filter((p) => {
    const matchQ = `${p.title} ${p.slug} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase());
    const matchS = fStatus === "all" || p.status === fStatus;
    const matchC = fCategory === "all" || p.category === fCategory;
    return matchQ && matchS && matchC;
  });

  const togglePublish = (item: ContentItem) => {
    upsertItem(kind, {
      ...item,
      status: item.status === "published" ? "draft" : "published",
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    toast.success(item.status === "published" ? `${kind} unpublished` : `${kind} published`);
  };

  const desc =
    kind === "Page"
      ? "Static content pages — about, history, council, contact, etc."
      : kind === "Service"
      ? "Citizen services — applications, certificates, fees, procedures."
      : "Public notices, tenders and circulars.";

  const categoryLabel = kind === "Notice" ? "Department" : "Category";

  const editPath = (id: number | "new") =>
    ({ to: "/admin/content/$kind/$id", params: { kind: kind.toLowerCase(), id: String(id) } }) as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{labelOf(kind)}</h1>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
        <Button asChild>
          <Link {...editPath("new")}>
            <Plus className="size-4" /> New {kind.toLowerCase()}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, slug…" className="pl-8" />
          </div>
          <Select value={fCategory} onValueChange={setFCategory}>
            <SelectTrigger><SelectValue placeholder={categoryLabel} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {categoryLabel.toLowerCase()}s</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fStatus} onValueChange={(v) => setFStatus(v as typeof fStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Slug</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{categoryLabel}</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Template</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Updated</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right w-12">·</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link {...editPath(p.id)} className="text-left group block">
                    <span className="font-medium group-hover:text-civic transition-colors flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      {p.title}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                  {basePath}/{p.slug}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {p.category && <Badge variant="secondary">{p.category}</Badge>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {p.template && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Layout className="size-3" />
                      {p.template}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="secondary"
                    className={p.status === "published" ? "bg-civic text-civic-foreground" : ""}
                  >
                    {p.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{p.updatedAt}</td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(editPath(p.id))}>
                        <Eye className="size-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(editPath(p.id))}>
                        <Pencil className="size-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublish(p)}>
                        {p.status === "published" ? (
                          <><EyeOff className="size-4" /> Unpublish</>
                        ) : (
                          <><Globe className="size-4" /> Publish</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setConfirmDelete(p)} className="text-destructive focus:text-destructive">
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No {kind.toLowerCase()}s match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {kind.toLowerCase()}?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{confirmDelete?.title}</span> will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete) {
                  removeItem(kind, confirmDelete.id);
                  toast.success(`${kind} removed`);
                }
                setConfirmDelete(null);
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
