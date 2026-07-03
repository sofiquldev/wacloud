import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Wallet,
  FileCheck,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { services } from "@/data/services";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = services.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.service;
    if (!s) return { meta: [{ title: "Service — Pabna Pourashava" }] };
    return {
      meta: [
        { title: `${s.title} — Pabna Pourashava` },
        { name: "description", content: s.shortDescription },
        { property: "og:title", content: `${s.title} — Pabna Pourashava` },
        { property: "og:description", content: s.shortDescription },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout active="/services">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Service not found</h1>
        <p className="text-muted-foreground mb-6">
          The service you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-civic text-civic-foreground text-sm font-semibold"
        >
          <ArrowLeft className="size-4" /> Back to all services
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout active="/services">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">{error.message}</p>
      </div>
    </SiteLayout>
  ),
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const { slug } = Route.useParams();
  const service = services.find((s) => s.slug === slug)!;
  const Icon = service.icon;

  const related = services
    .filter((s) => s.category === service.category && s.slug !== service.slug)
    .slice(0, 3);

  return (
    <SiteLayout active="/services">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-5 flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-civic">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/services" className="hover:text-civic">e-Services</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{service.category}</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground line-clamp-1">{service.title}</span>
        </nav>

        {/* Hero / Banner */}
        <header className="relative overflow-hidden rounded-2xl bg-civic text-civic-foreground p-6 sm:p-10 mb-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-12 -right-12 size-64 rounded-full bg-gold blur-3xl" />
            <div className="absolute -bottom-16 -left-16 size-72 rounded-full bg-gold blur-3xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="size-14 sm:size-16 rounded-xl bg-civic-foreground/10 ring-1 ring-civic-foreground/20 flex items-center justify-center shrink-0">
              <Icon className="size-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-gold mb-1">
                {service.category}
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
                {service.title}
              </h1>
              {service.bnTitle && (
                <p className="text-sm sm:text-base text-civic-foreground/80 mt-1">
                  {service.bnTitle}
                </p>
              )}
              <p className="text-sm sm:text-base text-civic-foreground/85 mt-3 max-w-2xl text-pretty">
                {service.shortDescription}
              </p>
            </div>
            <a
              href={service.applyHref ?? "#apply"}
              className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gold text-gold-foreground text-sm font-semibold hover:bg-gold/90 transition-colors"
            >
              Apply Online
            </a>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div className="min-w-0 space-y-8">
            {/* Editor-style content section */}
            <section className="prose-wrap bg-surface ring-1 ring-border rounded-xl p-6 sm:p-7">
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileCheck className="size-5 text-civic" /> Required Documents
              </h2>
              <ul className="space-y-2">
                {service.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                    <CheckCircle2 className="size-4 text-civic mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-surface ring-1 ring-border rounded-xl p-6 sm:p-7">
              <h2 className="text-lg font-semibold text-foreground mb-5">How to Apply</h2>
              <ol className="relative border-l-2 border-civic/20 pl-6 space-y-5 ml-2">
                {service.steps.map((s, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[34px] top-0 size-7 rounded-full bg-civic text-civic-foreground text-xs font-semibold flex items-center justify-center ring-4 ring-surface">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 text-pretty">
                      {s.description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {service.faqs && service.faqs.length > 0 && (
              <section className="bg-surface ring-1 ring-border rounded-xl p-6 sm:p-7">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <HelpCircle className="size-5 text-civic" /> Frequently Asked Questions
                </h2>
                <div className="divide-y divide-border">
                  {service.faqs.map((f, i) => (
                    <details key={i} className="group py-3">
                      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-sm font-medium text-foreground">
                        {f.q}
                        <ChevronRight className="size-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="text-sm text-muted-foreground mt-2 text-pretty">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start">
            <div className="bg-surface ring-1 ring-border rounded-xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-3">
                At a glance
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Wallet className="size-4 text-civic mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-[11px] uppercase text-ink-soft tracking-wider">Fee</dt>
                    <dd className="text-foreground font-medium leading-tight">{service.fee}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="size-4 text-civic mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-[11px] uppercase text-ink-soft tracking-wider">
                      Processing
                    </dt>
                    <dd className="text-foreground font-medium leading-tight">
                      {service.processingTime}
                    </dd>
                  </div>
                </div>
              </dl>
              <a
                href={service.applyHref ?? "#apply"}
                id="apply"
                className="mt-5 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-civic text-civic-foreground text-sm font-semibold hover:bg-civic/90 transition-colors"
              >
                Start Application
              </a>
            </div>

            {related.length > 0 && (
              <div className="bg-surface ring-1 ring-border rounded-xl p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-soft mb-3">
                  Related services
                </h3>
                <ul className="space-y-2">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        to="/services/$slug"
                        params={{ slug: r.slug }}
                        className="flex items-center justify-between gap-2 text-sm text-foreground hover:text-civic"
                      >
                        <span className="line-clamp-1">{r.title}</span>
                        <ChevronRight className="size-4 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
