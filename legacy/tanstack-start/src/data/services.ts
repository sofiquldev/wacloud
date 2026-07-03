import {
  FileText,
  Receipt,
  Building2,
  Droplets,
  Briefcase,
  HeartPulse,
  Baby,
  GraduationCap,
  TreePine,
  Truck,
  ShieldCheck,
  Landmark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ServiceCategory =
  | "Civil Registration"
  | "Revenue & Tax"
  | "Building & Land"
  | "Health"
  | "Utilities"
  | "Welfare"
  | "Trade";

export type Service = {
  slug: string;
  title: string;
  bnTitle?: string;
  category: ServiceCategory;
  icon: LucideIcon;
  shortDescription: string;
  fee: string;
  processingTime: string;
  applyHref?: string;
  requirements: string[];
  steps: { title: string; description: string }[];
  faqs?: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "birth-registration",
    title: "Birth Registration",
    bnTitle: "জন্ম নিবন্ধন",
    category: "Civil Registration",
    icon: Baby,
    shortDescription:
      "Apply for a digital birth registration certificate (BRC) for newborns and back-dated cases.",
    fee: "৳ 50 (within 45 days) · ৳ 100 (after 45 days)",
    processingTime: "3 – 7 working days",
    requirements: [
      "Hospital/clinic discharge certificate or EPI vaccination card",
      "Parents' National ID copy",
      "Holding tax receipt of the household",
      "Two passport-size photographs of the child",
    ],
    steps: [
      { title: "Submit application", description: "Fill the online form on bdris.gov.bd or visit the Pourashava office." },
      { title: "Document verification", description: "Ward Secretary verifies parents' NID and address." },
      { title: "Approval", description: "Mayor / Authorised officer approves the entry." },
      { title: "Collect certificate", description: "Download the BRC PDF or collect a printed copy from the office." },
    ],
    faqs: [
      { q: "Is birth registration mandatory?", a: "Yes, it is required for school admission, passport, NID, and most government services." },
      { q: "Can I correct a mistake later?", a: "Yes, file a correction request with supporting documents at the Pourashava office." },
    ],
  },
  {
    slug: "death-registration",
    title: "Death Registration",
    bnTitle: "মৃত্যু নিবন্ধন",
    category: "Civil Registration",
    icon: FileText,
    shortDescription: "Register a death and obtain an official death certificate from the Pourashava.",
    fee: "৳ 50",
    processingTime: "3 – 5 working days",
    requirements: [
      "Medical certificate of death",
      "Deceased's NID / birth registration",
      "Applicant's NID copy",
    ],
    steps: [
      { title: "Submit application", description: "File the application at the ward office or online portal." },
      { title: "Verification", description: "Ward Secretary verifies the medical certificate and NID." },
      { title: "Approval & issuance", description: "Authorised officer approves and the certificate is issued." },
    ],
  },
  {
    slug: "holding-tax",
    title: "Holding Tax Payment",
    bnTitle: "হোল্ডিং ট্যাক্স",
    category: "Revenue & Tax",
    icon: Receipt,
    shortDescription: "Pay your annual property holding tax online and download the receipt instantly.",
    fee: "Calculated on assessed annual value",
    processingTime: "Instant (online)",
    requirements: ["Holding number", "Owner's NID", "Mobile number for OTP"],
    steps: [
      { title: "Look up holding", description: "Enter holding number to view dues." },
      { title: "Pay via bKash / Nagad / Card", description: "Complete payment through the integrated gateway." },
      { title: "Download receipt", description: "Receipt is available immediately and emailed to you." },
    ],
  },
  {
    slug: "trade-license",
    title: "Trade License",
    bnTitle: "ট্রেড লাইসেন্স",
    category: "Trade",
    icon: Briefcase,
    shortDescription: "Apply for a new trade license or renew an existing one for your business.",
    fee: "৳ 500 – ৳ 25,000 (varies by category)",
    processingTime: "5 – 10 working days",
    requirements: [
      "Owner's NID copy",
      "Rental agreement or ownership proof of premises",
      "TIN certificate",
      "Bank solvency certificate (for higher categories)",
    ],
    steps: [
      { title: "Submit application", description: "Complete the online form and upload documents." },
      { title: "Inspection", description: "Inspector visits the premises within 3 working days." },
      { title: "Fee payment", description: "Pay assessed fee via online gateway." },
      { title: "License issued", description: "Download the digital license or collect from office." },
    ],
  },
  {
    slug: "water-bill",
    title: "Water Bill Payment",
    category: "Utilities",
    icon: Droplets,
    shortDescription: "View and pay your monthly water supply bill online.",
    fee: "As per consumption",
    processingTime: "Instant",
    requirements: ["Customer ID / connection number"],
    steps: [
      { title: "Enter connection ID", description: "Look up the latest bill amount." },
      { title: "Pay online", description: "Use bKash, Nagad, Rocket or card payment." },
      { title: "Get receipt", description: "Receipt sent via SMS and email." },
    ],
  },
  {
    slug: "building-approval",
    title: "Building Plan Approval",
    bnTitle: "ভবন নির্মাণ অনুমোদন",
    category: "Building & Land",
    icon: Building2,
    shortDescription: "Submit architectural plans for approval before any new construction.",
    fee: "৳ 5 / sq.ft of built area",
    processingTime: "30 – 45 working days",
    requirements: [
      "Approved architectural & structural drawings",
      "Land ownership documents (Khatian, Mutation)",
      "Soil test report",
      "Owner's NID and TIN",
    ],
    steps: [
      { title: "Submit drawings", description: "Upload the drawings via the online portal." },
      { title: "Technical review", description: "Engineer reviews compliance with building code." },
      { title: "Site inspection", description: "Site visit to verify boundaries and setbacks." },
      { title: "Approval certificate", description: "Receive the approved plan and start construction." },
    ],
  },
  {
    slug: "vaccination",
    title: "EPI Vaccination",
    category: "Health",
    icon: HeartPulse,
    shortDescription: "Free immunisation for children under 5, conducted at all ward EPI centres.",
    fee: "Free of charge",
    processingTime: "Same day",
    requirements: ["Child's birth certificate", "Previous EPI card if available"],
    steps: [
      { title: "Visit ward centre", description: "Go to your ward EPI centre on the scheduled day." },
      { title: "Get vaccinated", description: "Trained health workers administer vaccines." },
      { title: "Update card", description: "Receive an updated EPI card for the next dose." },
    ],
  },
  {
    slug: "scholarship",
    title: "Student Scholarship",
    category: "Welfare",
    icon: GraduationCap,
    shortDescription: "Need-based scholarship for meritorious students from low-income families.",
    fee: "Free to apply",
    processingTime: "1 – 2 months",
    requirements: [
      "Last exam mark sheet (min 80%)",
      "Family income certificate",
      "Recommendation from headmaster",
    ],
    steps: [
      { title: "Submit application", description: "Apply during the annual call (Jan–Feb)." },
      { title: "Verification", description: "Ward Councilor verifies the application." },
      { title: "Selection committee review", description: "Final shortlist by the standing committee." },
      { title: "Disbursement", description: "Funds disbursed via bKash to the student's family." },
    ],
  },
  {
    slug: "tree-plantation",
    title: "Free Sapling Distribution",
    category: "Welfare",
    icon: TreePine,
    shortDescription: "Collect free fruit and timber saplings from your ward office during plantation drives.",
    fee: "Free",
    processingTime: "Same day",
    requirements: ["Holding tax receipt or NID for verification"],
    steps: [
      { title: "Visit ward office", description: "Go to your ward office during the announced drive." },
      { title: "Choose saplings", description: "Select up to 5 saplings per household." },
      { title: "Plant & report", description: "Register the planting location for follow-up monitoring." },
    ],
  },
  {
    slug: "waste-collection",
    title: "Door-to-door Waste Collection",
    category: "Utilities",
    icon: Truck,
    shortDescription: "Subscribe to the daily door-to-door waste collection service in your ward.",
    fee: "৳ 100 / month per household",
    processingTime: "Activated within 3 days",
    requirements: ["Holding number", "Mobile number"],
    steps: [
      { title: "Subscribe", description: "Register via the online form or with your ward office." },
      { title: "Receive bins", description: "Two segregated bins (organic / recyclable) delivered." },
      { title: "Daily pickup", description: "Collection vehicle visits between 7–10 AM." },
    ],
  },
  {
    slug: "citizenship-certificate",
    title: "Citizenship Certificate",
    bnTitle: "নাগরিকত্ব সনদ",
    category: "Civil Registration",
    icon: ShieldCheck,
    shortDescription: "Official proof of citizenship issued by the Mayor for various legal purposes.",
    fee: "৳ 100",
    processingTime: "2 – 3 working days",
    requirements: ["Applicant's NID", "Holding tax receipt", "Two passport-size photos"],
    steps: [
      { title: "Apply at office", description: "Submit the form at the Pourashava reception." },
      { title: "Ward verification", description: "Ward Councilor signs off on residency." },
      { title: "Mayor's approval", description: "Mayor signs the certificate." },
      { title: "Collect", description: "Collect the certificate from the issuing desk." },
    ],
  },
  {
    slug: "land-use-certificate",
    title: "Land Use Certificate",
    category: "Building & Land",
    icon: Landmark,
    shortDescription: "Certificate confirming the permitted land use for a specific plot.",
    fee: "৳ 500",
    processingTime: "7 – 10 working days",
    requirements: ["Land ownership document", "Mauza map", "Owner's NID"],
    steps: [
      { title: "Application", description: "Submit application with required documents." },
      { title: "Survey check", description: "Town planner reviews the master plan zoning." },
      { title: "Issue certificate", description: "Certificate issued under Mayor's signature." },
    ],
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Civil Registration",
  "Revenue & Tax",
  "Building & Land",
  "Trade",
  "Utilities",
  "Health",
  "Welfare",
];
