import { createFileRoute } from "@tanstack/react-router";
import { ContentManager, type ContentItem } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/admin/services")({
  head: () => ({ meta: [{ title: "Services — Admin" }] }),
  component: ServicesAdmin,
});

const initial: ContentItem[] = [
  {
    id: 1,
    title: "Birth Registration",
    slug: "birth",
    status: "published",
    category: "Citizen Records",
    excerpt: "Apply for birth certificates online or at the ward office.",
    body: "",
    updatedAt: "2024-10-22",
  },
  {
    id: 2,
    title: "Holding Tax",
    slug: "tax",
    status: "published",
    category: "Revenue",
    excerpt: "Pay annual holding tax — online and counter options.",
    body: "",
    updatedAt: "2024-10-18",
  },
  {
    id: 3,
    title: "Trade License",
    slug: "trade-license",
    status: "published",
    category: "Revenue",
    excerpt: "New trade licenses and renewals.",
    body: "",
    updatedAt: "2024-10-10",
  },
  {
    id: 4,
    title: "Building Approval",
    slug: "building",
    status: "draft",
    category: "Engineering",
    excerpt: "Plan approval workflow and required documents.",
    body: "",
    updatedAt: "2024-09-04",
  },
  {
    id: 5,
    title: "Water Billing",
    slug: "water",
    status: "published",
    category: "Utilities",
    excerpt: "Connection requests, monthly bills and complaints.",
    body: "",
    updatedAt: "2024-10-01",
  },
];

const categories = ["Citizen Records", "Revenue", "Engineering", "Utilities", "Health"];

function ServicesAdmin() {
  return <ContentManager kind="Service" initial={initial} categories={categories} basePath="/services" />;
}
