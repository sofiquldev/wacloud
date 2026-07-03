import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Globe,
  Image as ImageIcon,
  Settings2,
  Sparkles,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TEMPLATES,
  type ContentItem,
  type ContentKind,
} from "@/components/admin/ContentManager";
import { getItem, upsertItem } from "@/data/contentStore";

const KIND_MAP: Record<string, { kind: ContentKind; basePath: string; categories: string[] }> = {
  page: {
    kind: "Page",
    basePath: "",
    categories: ["About", "Council", "Legal", "Contact", "News"],
  },
  service: {
    kind: "Service",
    basePath: "/services",
    categories: ["Citizen Records", "Revenue", "Engineering", "Utilities", "Health"],
  },
  notice: {
    kind: "Notice",
    basePath: "/notices",
    categories: ["Administration", "Engineering", "Health", "Revenue", "Sanitation"],
  },
};

export const Route = createFileRoute("/admin/content/$kind/$id")({
  head: ({ params }) => ({
    meta: [{ title: `${params.id === "new" ? "New" : "Edit"} ${params.kind} — Admin` }],
  }),
  loader: ({ params }) => {
    const cfg = KIND_MAP[params.kind];
    if (!cfg) throw notFound();
    return cfg;
  },
  component: ContentEditor,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function ContentEditor() {
  const cfg = Route.useLoaderData() as { kind: ContentKind; basePath: string; categories: string[] };
  const { kind, basePath, categories } = cfg;
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const templates = TEMPLATES[kind];

  const blank = useMemo<ContentItem>(
    () => ({
      id: 0,
      title: "",
      slug: "",
      status: "draft",
      category: categories[0],
      template: templates[0]?.value,
      excerpt: "",
      body: "",
      featuredImage: "",
      tags: [],
      seoTitle: "",
      seoDescription: "",
      visibility: "public",
      publishAt: "",
      updatedAt: new Date().toISOString().slice(0, 10),
    }),
    [categories, templates],
  );

  const existing = !isNew ? getItem(kind, Number(id)) : null;
  const [form, setForm] = useState<ContentItem>(existing ?? blank);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!isNew && !existing) {
      toast.error(`${kind} not found`);
    }
  }, [isNew, existing, kind]);

  const categoryLabel = kind === "Notice" ? "Department" : "Category";

  const listPath =
    kind === "Page" ? "/admin/pages" : kind === "Service" ? "/admin/services" : "/admin/notices";

  const save = (status: "draft" | "published") => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.slug.trim()) return toast.error("Slug is required");
    upsertItem(kind, { ...form, status, updatedAt: new Date().toISOString().slice(0, 10) });
    toast.success(`${kind} ${isNew ? "created" : "updated"}`);
    navigate({ to: listPath });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!form.tags?.includes(t)) {
      setForm({ ...form, tags: [...(form.tags ?? []), t] });
    }
    setTagInput("");
  };
  const removeTag = (t: string) =>
    setForm({ ...form, tags: form.tags?.filter((x) => x !== t) });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={listPath}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? `New ${kind.toLowerCase()}` : `Edit ${kind.toLowerCase()}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {kind === "Page"
                ? "Static content for the public site."
                : kind === "Service"
                ? "Citizen-facing service page."
                : "Public notice, tender or circular."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={listPath}>Cancel</Link>
          </Button>
          <Button variant="outline" onClick={() => save("draft")}>
            Save draft
          </Button>
          <Button onClick={() => save("published")}>
            <Globe className="size-4" /> {isNew ? "Publish" : "Save & publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main */}
        <div className="space-y-4">
          <div className="space-y-3">
            <Input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((p) => ({
                  ...p,
                  title,
                  slug: slugTouched ? p.slug : slugify(title),
                }));
              }}
              placeholder={
                kind === "Page"
                  ? "About Pourashava"
                  : kind === "Service"
                  ? "Trade License"
                  : "Office closure notice"
              }
              className="text-xl font-semibold h-12"
            />
            <div className="flex items-center gap-1 rounded-md border border-input bg-background px-2 text-xs">
              <span className="text-muted-foreground shrink-0">{basePath || "/"}/</span>
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((p) => ({ ...p, slug: slugify(e.target.value) }));
                }}
                className="border-0 shadow-none px-0 h-9 focus-visible:ring-0"
                placeholder="my-slug"
              />
            </div>
          </div>

          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content"><FileText className="size-3.5" /> Content</TabsTrigger>
              <TabsTrigger value="seo"><Sparkles className="size-3.5" /> SEO</TabsTrigger>
              <TabsTrigger value="advanced"><Settings2 className="size-3.5" /> Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label>Excerpt</Label>
                <Textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short summary shown in lists and meta description."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Body</Label>
                <Textarea
                  rows={18}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Markdown / HTML body…"
                  className="font-mono text-xs"
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label>SEO title</Label>
                <Input
                  value={form.seoTitle ?? ""}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  placeholder="Defaults to page title"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">{(form.seoTitle ?? "").length}/60</p>
              </div>
              <div className="space-y-1.5">
                <Label>Meta description</Label>
                <Textarea
                  rows={3}
                  value={form.seoDescription ?? ""}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  placeholder="Shown in search results"
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {(form.seoDescription ?? "").length}/160
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Featured image URL</Label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-muted-foreground" />
                  <Input
                    value={form.featuredImage ?? ""}
                    onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
                {form.featuredImage && (
                  <div className="mt-2 rounded-md border overflow-hidden bg-muted/30">
                    <img
                      src={form.featuredImage}
                      alt="Featured"
                      className="w-full h-40 object-cover"
                      onError={(e) => ((e.currentTarget.style.display = "none"))}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Visibility</Label>
                  <Select
                    value={form.visibility ?? "public"}
                    onValueChange={(v) => setForm({ ...form, visibility: v as "public" | "private" })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Schedule publish</Label>
                  <Input
                    type="datetime-local"
                    value={form.publishAt ?? ""}
                    onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tags</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Type and press Enter"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <TagIcon className="size-4" /> Add
                  </Button>
                </div>
                {form.tags && form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {form.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="gap-1">
                        {t}
                        <button onClick={() => removeTag(t)} className="hover:text-destructive">
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Status</Label>
              <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                <span className="text-sm font-medium capitalize">{form.status}</span>
                <Switch
                  checked={form.status === "published"}
                  onCheckedChange={(v) => setForm({ ...form, status: v ? "published" : "draft" })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                {categoryLabel}
              </Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Template</Label>
              <Select value={form.template} onValueChange={(v) => setForm({ ...form, template: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex flex-col items-start">
                        <span>{t.label}</span>
                        <span className="text-xs text-muted-foreground">{t.hint}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {kind === "Notice" && (
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Notice date</Label>
                <div className="relative">
                  <Calendar className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-8"
                    value={form.publishAt?.slice(0, 10) ?? ""}
                    onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border p-3 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Updated</span>
              <span className="text-foreground">{form.updatedAt}</span>
            </div>
            <div className="flex justify-between">
              <span>URL</span>
              <span className="text-foreground font-mono truncate max-w-[160px]">
                {basePath || "/"}/{form.slug || "—"}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
