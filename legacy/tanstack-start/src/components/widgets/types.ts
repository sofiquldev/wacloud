// Widget type definitions — drives the dynamic renderer.
// Designed to be JSON-serializable so Laravel/Inertia can hydrate from DB.

export type WidgetPosition = "left" | "main" | "right";

export type WidgetStyling = {
  className?: string;
  style?: React.CSSProperties;
};

export type NoticeItem = {
  id: string | number;
  title: string;
  date: string; // ISO or display
  department?: string;
  fileSize?: string;
};

export type TenderItem = {
  id: string | number;
  ref: string;
  title: string;
  deadline: string;
  status?: "open" | "closed" | "awarded";
};

export type ServiceLink = {
  id: string | number;
  label: string;
  href: string;
  icon?: string;
};

export type MemberCardData = {
  name: string;
  designation: string;
  photo: string;
  ward?: string;
  quote?: string;
  ctaLabel?: string;
  message?: string;
};

export type CareerEntry = {
  period: string;
  title: string;
  description: string;
  current?: boolean;
};

export type CareerTimelineData = {
  memberName: string;
  subtitle?: string;
  entries: CareerEntry[];
};

export type HeroSlide = {
  image: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type HeroData = {
  image?: string;
  title?: string;
  subtitle?: string;
  slides?: HeroSlide[];
  autoplayMs?: number;
};

export type NewsItem = {
  id: string | number;
  date: string;
  title: string;
  image: string;
};

export type ElectedMember = {
  id: string | number;
  name: string;
  designation: string;
  ward?: string;
  photo: string;
  termStart: number;
  termEnd: number;
  partyOrAffiliation?: string;
};

export type MembersGridData = {
  title: string;
  sessionLabel: string;
  members: ElectedMember[];
};

export type WidgetConfig =
  | { type: "nav-services"; position: WidgetPosition; styling?: WidgetStyling; data: { title: string; items: ServiceLink[] } }
  | { type: "hotline"; position: WidgetPosition; styling?: WidgetStyling; data: { label: string; number: string; description: string } }
  | { type: "hero"; position: WidgetPosition; styling?: WidgetStyling; data: HeroData }
  | { type: "notice-list"; position: WidgetPosition; styling?: WidgetStyling; data: { title: string; items: NoticeItem[] } }
  | { type: "tender-list"; position: WidgetPosition; styling?: WidgetStyling; data: { title: string; items: TenderItem[]; variant?: "default" | "accent" | "architectural" | "banner" } }
  | { type: "member-card"; position: WidgetPosition; styling?: WidgetStyling; data: MemberCardData }
  | { type: "career-timeline"; position: WidgetPosition; styling?: WidgetStyling; data: CareerTimelineData }
  | { type: "members-grid"; position: WidgetPosition; styling?: WidgetStyling; data: MembersGridData }
  | { type: "news-grid"; position: WidgetPosition; styling?: WidgetStyling; data: { items: NewsItem[] } }
  | { type: "quick-links"; position: WidgetPosition; styling?: WidgetStyling; data: { title: string; items: { label: string; href: string }[] } };
