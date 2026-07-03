import { createFileRoute } from "@tanstack/react-router";
import { ContentManager, type ContentItem } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin/notices")({
  head: () => ({ meta: [{ title: "Notices — Admin" }] }),
  component: NoticesPage,
});

const initial: ContentItem[] = [
  {
    id: 1,
    title: "Holiday notice — Eid-ul-Fitr",
    slug: "eid-holiday-2025",
    status: "published",
    category: "Administration",
    template: "circular",
    excerpt: "Office closed from 9–12 April for Eid-ul-Fitr holidays.",
    body: "",
    publishAt: "2025-04-09",
    updatedAt: "2025-04-01",
  },
  {
    id: 2,
    title: "Tender invitation: Solar street lights",
    slug: "tender-solar-2025",
    status: "published",
    category: "Engineering",
    template: "tender",
    excerpt: "Sealed tenders invited for installation of 200 solar street lights.",
    body: "",
    publishAt: "2025-04-05",
    updatedAt: "2025-04-04",
  },
  {
    id: 3,
    title: "Vaccination drive schedule",
    slug: "vaccination-drive",
    status: "draft",
    category: "Health",
    template: "default",
    excerpt: "Ward-wise immunization schedule for April.",
    body: "",
    publishAt: "2025-04-01",
    updatedAt: "2025-03-28",
  },
];

const departments = ["Administration", "Engineering", "Health", "Revenue", "Sanitation"];

function NoticesPage() {
  return <ContentManager kind="Notice" initial={initial} categories={departments} basePath="/notices" />;
}
