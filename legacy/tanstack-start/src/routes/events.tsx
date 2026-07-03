import { createFileRoute } from "@tanstack/react-router";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import heroMunicipal from "@/assets/hero-municipal.jpg";
import newsTree from "@/assets/news-tree.jpg";
import newsWaste from "@/assets/news-waste.jpg";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Pabna Pourashava" },
      {
        name: "description",
        content:
          "Upcoming and past events organised by Pabna Pourashava: public hearings, vaccination drives, plantation programs and cultural festivals.",
      },
      { property: "og:title", content: "Events — Pabna Pourashava" },
      {
        property: "og:description",
        content: "Public events, drives and ceremonies hosted by Pabna Pourashava.",
      },
      { property: "og:image", content: heroMunicipal },
    ],
  }),
  component: EventsPage,
});

type EventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image: string;
  status: "upcoming" | "past";
  category: string;
};

const events: EventItem[] = [
  {
    id: 1,
    title: "City-wide Plantation Drive — 10,000 Trees",
    date: "June 5, 2026",
    time: "8:00 AM – 12:00 PM",
    venue: "All 9 Wards · Pabna Pourashava",
    description:
      "Join the World Environment Day plantation drive. Free saplings distributed at every ward office. Registration encouraged.",
    image: newsTree,
    status: "upcoming",
    category: "Environment",
  },
  {
    id: 2,
    title: "Smart Waste Management Town Hall",
    date: "May 28, 2026",
    time: "4:00 PM – 6:00 PM",
    venue: "Pourashava Community Hall, Ward 4",
    description:
      "Public consultation on the new door-to-door waste collection schedule and segregation guidelines.",
    image: newsWaste,
    status: "upcoming",
    category: "Civic",
  },
  {
    id: 3,
    title: "Vaccination Drive — Children Under 5",
    date: "May 22, 2026",
    time: "9:00 AM – 4:00 PM",
    venue: "Ward 4 Community Center",
    description:
      "Free MR vaccination organised in partnership with Civil Surgeon Office. Bring child's birth registration.",
    image: heroMunicipal,
    status: "upcoming",
    category: "Health",
  },
  {
    id: 4,
    title: "Independence Day Cultural Program",
    date: "March 26, 2026",
    time: "9:00 AM – 9:00 PM",
    venue: "Pabna Stadium",
    description:
      "Flag hoisting, parade, and evening cultural performances featuring local artists from across the wards.",
    image: heroMunicipal,
    status: "past",
    category: "Cultural",
  },
  {
    id: 5,
    title: "Annual Tax Mela 2026",
    date: "February 10–14, 2026",
    time: "10:00 AM – 6:00 PM",
    venue: "Pourashava Office, Main Building",
    description:
      "Pay holding tax, collect trade licences, and resolve property records on the spot. Helpdesk available.",
    image: heroMunicipal,
    status: "past",
    category: "Civic",
  },
];

function EventsPage() {
  const upcoming = events.filter((e) => e.status === "upcoming");
  const past = events.filter((e) => e.status === "past");

  return (
    <SiteLayout active="/events">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <p className="text-[11px] font-semibold text-civic uppercase tracking-widest mb-2">
            Pabna Pourashava
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Events & Programs
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Public hearings, drives, ceremonies and citizen programs organised by the Pourashava.
          </p>
        </header>

        <Section title="Upcoming Events" badge={`${upcoming.length} scheduled`} accent="gold">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </Section>

        <Section title="Past Events" badge={`${past.length} archived`} accent="civic">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => (
              <EventCard key={e.id} event={e} muted />
            ))}
          </div>
        </Section>
      </div>
    </SiteLayout>
  );
}

function Section({
  title,
  badge,
  accent,
  children,
}: {
  title: string;
  badge: string;
  accent: "gold" | "civic";
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 sm:mb-14">
      <div className="flex items-end justify-between gap-3 mb-5">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h2>
        <span
          className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded ${
            accent === "gold" ? "bg-gold text-gold-foreground" : "bg-civic text-civic-foreground"
          }`}
        >
          {badge}
        </span>
      </div>
      {children}
    </section>
  );
}

function EventCard({ event, muted }: { event: EventItem; muted?: boolean }) {
  return (
    <article
      className={`group bg-surface ring-1 ring-border rounded-xl overflow-hidden hover:ring-civic/40 hover:shadow-card transition-all ${
        muted ? "opacity-90" : ""
      }`}
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-civic bg-civic/10 px-2 py-0.5 rounded">
            {event.category}
          </span>
        </div>
        <h3 className="text-base font-semibold leading-tight text-foreground mb-3 line-clamp-2">
          {event.title}
        </h3>
        <ul className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <li className="flex items-center gap-2">
            <Calendar className="size-3.5 text-civic shrink-0" />
            <span>{event.date}</span>
          </li>
          <li className="flex items-center gap-2">
            <Clock className="size-3.5 text-civic shrink-0" />
            <span>{event.time}</span>
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-3.5 text-civic shrink-0" />
            <span className="line-clamp-1">{event.venue}</span>
          </li>
        </ul>
        <p className="text-sm text-foreground/80 line-clamp-3 text-pretty mb-4">
          {event.description}
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-civic hover:gap-2.5 transition-all"
        >
          View details <ArrowRight className="size-4" />
        </button>
      </div>
    </article>
  );
}
