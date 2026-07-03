import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Inbox, Users, Megaphone, ArrowUpRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: AdminDashboard,
});

const stats = [
  { label: "Active Tenders", value: 12, delta: "+2 this week", icon: FileText, tone: "civic" as const },
  { label: "Pending Complaints", value: 38, delta: "+5 today", icon: Inbox, tone: "destructive" as const },
  { label: "Total Members", value: 24, delta: "Term 2024–29", icon: Users, tone: "accent" as const },
  { label: "New Notices", value: 7, delta: "+3 this week", icon: Megaphone, tone: "civic" as const },
];

const recentActivity = [
  { who: "Md. Rahim", what: "filed a new complaint", where: "Ward 02 • Drainage", when: "5m ago" },
  { who: "Admin", what: "published notice", where: "Holiday Notice — Eid", when: "1h ago" },
  { who: "System", what: "tender deadline approaching", where: "PAB/2024/051", when: "3h ago" },
  { who: "Mayor's Office", what: "approved member bio update", where: "Councilor Karim", when: "Yesterday" },
];

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, Admin</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening across the Pourashava today.</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <TrendingUp className="size-3.5" />
          Sept 2025
        </Badge>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="relative overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </CardTitle>
              <div
                className={`size-8 grid place-items-center rounded-md ${
                  s.tone === "civic"
                    ? "bg-civic-muted text-civic"
                    : s.tone === "destructive"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-accent/15 text-accent-foreground"
                }`}
              >
                <s.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recentActivity.map((a, i) => (
              <div key={i} className="py-3 flex items-start gap-3 text-sm">
                <div className="size-8 rounded-full bg-muted shrink-0 grid place-items-center text-xs font-semibold">
                  {a.who.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p>
                    <span className="font-medium">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.what}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{a.where}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{a.when}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { to: "/admin/notices", label: "Add notice" },
              { to: "/admin/complaints", label: "Review complaints" },
              { to: "/admin/members", label: "Add member" },
              { to: "/admin/widgets", label: "Reorder homepage widgets" },
            ].map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm hover:bg-muted transition-colors"
              >
                {q.label}
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
