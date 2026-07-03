import { createFileRoute } from "@tanstack/react-router";
import { ContentManager, type ContentItem } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin/pages")({
  head: () => ({ meta: [{ title: "Pages — Admin" }] }),
  component: PagesAdmin,
});

const initial: ContentItem[] = [
  {
    id: 1,
    title: "About Pourashava",
    slug: "about",
    status: "published",
    category: "About",
    excerpt: "History, mission and structure of Pabna Pourashava.",
    body: "Pabna Pourashava was established in 1876…",
    updatedAt: "2024-10-12",
  },
  {
    id: 2,
    title: "Council & Committees",
    slug: "council",
    status: "published",
    category: "About",
    excerpt: "Standing committees, panel mayors and councilors.",
    body: "",
    updatedAt: "2024-09-30",
  },
  {
    id: 3,
    title: "Privacy Policy",
    slug: "privacy",
    status: "draft",
    category: "Legal",
    excerpt: "How we handle citizen data on this portal.",
    body: "",
    updatedAt: "2024-08-04",
  },
  {
    id: 4,
    title: "Contact Us",
    slug: "contact",
    status: "published",
    category: "Contact",
    excerpt: "Office address, hotlines, ward offices and emails.",
    body: "",
    updatedAt: "2024-10-21",
  },
];

const categories = ["About", "Council", "Legal", "Contact", "News"];

function PagesAdmin() {
  return <ContentManager kind="Page" initial={initial} categories={categories} basePath="" />;
}
