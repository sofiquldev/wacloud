import heroMunicipal from "@/assets/hero-municipal.jpg";
import mayorPortrait from "@/assets/mayor-portrait.jpg";
import newsTree from "@/assets/news-tree.jpg";
import newsWaste from "@/assets/news-waste.jpg";
import type { WidgetConfig } from "@/components/widgets/types";

/**
 * Sample widget configuration — represents what the Laravel backend
 * would return for the homepage. Each entry is a JSON-serializable
 * widget config with a `position` (left | main | right).
 */
export const homepageWidgets: WidgetConfig[] = [
  // ── LEFT ─────────────────────────────────────────────────────────────
  {
    type: "nav-services",
    position: "left",
    data: {
      title: "Citizen Services",
      items: [
        { id: 1, label: "Birth Registration", href: "/services/birth" },
        { id: 2, label: "Death Registration", href: "/services/death" },
        { id: 3, label: "Holding Tax", href: "/services/tax" },
        { id: 4, label: "Trade License", href: "/services/trade-license" },
        { id: 5, label: "Water Billing", href: "/services/water" },
        { id: 6, label: "Building Approval", href: "/services/building" },
      ],
    },
  },
  {
    type: "hotline",
    position: "left",
    data: {
      label: "Emergency Hotline",
      number: "16122",
      description:
        "Available 24/7 for citizen grievances and emergency municipal support.",
    },
  },
  {
    type: "quick-links",
    position: "left",
    data: {
      title: "Important Links",
      items: [
        { label: "National Portal", href: "https://bangladesh.gov.bd" },
        { label: "LGRD Ministry", href: "#" },
        { label: "e-GP Portal", href: "#" },
        { label: "Election Commission", href: "#" },
      ],
    },
  },

  // ── MAIN ─────────────────────────────────────────────────────────────
  {
    type: "hero",
    position: "main",
    data: {
      autoplayMs: 6000,
      slides: [
        {
          image: heroMunicipal,
          title: "Welcome to our Digital Pourashava",
          subtitle:
            "Ensuring transparent and efficient civic services through modern technology and citizen-centric governance.",
          ctaLabel: "Explore Services",
          ctaHref: "#services",
        },
        {
          image: newsTree,
          title: "Greener Pabna — 10,000 Trees Initiative",
          subtitle:
            "Join the city-wide plantation drive across all wards. Pick up free saplings from your ward office.",
          ctaLabel: "Join the Drive",
          ctaHref: "#tree",
        },
        {
          image: newsWaste,
          title: "Smart Waste Management Rolling Out",
          subtitle:
            "New door-to-door collection schedule and segregation guidelines now active in Wards 1–6.",
          ctaLabel: "View Schedule",
          ctaHref: "#waste",
        },
      ],
    },
  },
  {
    type: "notice-list",
    position: "main",
    data: {
      title: "নোটিশ বোর্ড · Notice Board",
      items: [
        {
          id: 1,
          title: "Regarding Ward No. 5 road maintenance and temporary closure",
          date: "2024-10-24",
          department: "Engineering",
          fileSize: "2.4 MB",
        },
        {
          id: 2,
          title: "Invitation for E-Tender 04/2023-24: Solar street lights",
          date: "2024-10-21",
          department: "Procurement",
          fileSize: "1.1 MB",
        },
        {
          id: 3,
          title: "Trade license renewal deadline extended to 30 November",
          date: "2024-10-18",
          department: "Revenue",
          fileSize: "640 KB",
        },
      ],
    },
  },
  {
    type: "career-timeline",
    position: "main",
    data: {
      memberName: "Md. Sharif Uddin Ahmed",
      subtitle: "Mayor · Pabna Pourashava — multi-term elected representative",
      entries: [
        {
          period: "2020 — 2025",
          title: "Elected Mayor (3rd term)",
          description:
            "Won by a margin of 15,000+ votes. Leading digital infrastructure modernization and Smart City integration.",
          current: true,
        },
        {
          period: "2015 — 2020",
          title: "Panel Mayor (1st), Councilor Ward 04",
          description:
            "Headed the standing committee on sanitation and water supply. Initiated 'Green Pabna' revitalization.",
        },
        {
          period: "2010 — 2015",
          title: "Elected Councilor, Ward 04 (1st term)",
          description:
            "Initiated the community-based waste management program and ward-level grievance desk.",
        },
      ],
    },
  },
  {
    type: "members-grid",
    position: "main",
    data: {
      title: "Council Members — Current Session",
      sessionLabel: "2020 — 2025 (5th Pourashava Election)",
      members: [
        { id: 1, name: "Md. Sharif Uddin Ahmed", designation: "Mayor", ward: "Pourashava", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 2, name: "Rehana Parvin", designation: "Panel Mayor (1)", ward: "Ward 03", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 3, name: "Abdul Karim Mollah", designation: "Panel Mayor (2)", ward: "Ward 07", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 4, name: "Nasir Uddin Khan", designation: "Councilor", ward: "Ward 01", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 5, name: "Salma Begum", designation: "Reserved Councilor", ward: "Ward 1-2-3", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 6, name: "Mizanur Rahman", designation: "Councilor", ward: "Ward 02", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 7, name: "Anwar Hossain", designation: "Councilor", ward: "Ward 04", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 8, name: "Farida Yasmin", designation: "Reserved Councilor", ward: "Ward 4-5-6", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 9, name: "Jahangir Alam", designation: "Councilor", ward: "Ward 05", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 10, name: "Shahidul Islam", designation: "Councilor", ward: "Ward 06", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 11, name: "Ruksana Akter", designation: "Reserved Councilor", ward: "Ward 7-8-9", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
        { id: 12, name: "Kamrul Hasan", designation: "Councilor", ward: "Ward 08", photo: mayorPortrait, termStart: 2020, termEnd: 2025 },
      ],
    },
  },
  {
    type: "news-grid",
    position: "main",
    data: {
      items: [
        {
          id: 1,
          date: "May 20, 2024",
          title: "Tree plantation programme inaugurated across all wards",
          image: newsTree,
        },
        {
          id: 2,
          date: "May 18, 2024",
          title: "Modern waste management fleet expanded with 12 new vehicles",
          image: newsWaste,
        },
      ],
    },
  },

  // ── RIGHT ────────────────────────────────────────────────────────────
  {
    type: "member-card",
    position: "right",
    data: {
      name: "Md. Sharif Uddin Ahmed",
      designation: "Mayor",
      ward: "Pabna Pourashava",
      photo: mayorPortrait,
      quote:
        "Our commitment is transparent governance and modern amenities for every citizen.",
      ctaLabel: "Message from Mayor",
    },
  },
  {
    type: "tender-list",
    position: "right",
    data: {
      title: "Active Tenders",
      variant: "banner",
      items: [
        {
          id: 1,
          ref: "Ref: PAB/2024/042",
          title: "Road carpeting in Ward No. 02 area",
          deadline: "Nov 15, 2024",
          status: "open",
        },
        {
          id: 2,
          ref: "Ref: PAB/2024/051",
          title: "Supply of LED street lights",
          deadline: "Nov 02, 2024",
          status: "open",
        },
        {
          id: 3,
          ref: "Ref: PAB/2024/055",
          title: "Installation of solar panels at HQ",
          deadline: "Dec 01, 2024",
          status: "open",
        },
      ],
    },
  },
];
