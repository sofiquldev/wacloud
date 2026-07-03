import { useState } from "react";
import { X, Mail, Phone, MapPin, Calendar, Award, ChevronDown, History } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import type { ElectedMember } from "./MembersGridWidget";

type CareerEntry = { period: string; title: string; description: string; current?: boolean };

type Props = {
  member: ElectedMember | null;
  onClose: () => void;
};

function buildTimeline(member: ElectedMember): CareerEntry[] {
  const t1Start = member.termStart - 10;
  const t1End = member.termStart - 5;
  const t2Start = member.termStart - 5;
  const t2End = member.termStart;
  return [
    {
      period: `${member.termStart}–${member.termEnd}`,
      title: `${member.designation}${member.ward ? ` · ${member.ward}` : ""}`,
      description: "Currently serving the citizens with focus on digital governance, drainage, and ward-level public hearings.",
      current: true,
    },
    {
      period: `${t2Start}–${t2End}`,
      title: `Councilor · ${member.ward ?? "Ward"}`,
      description: "Led road resurfacing, street-light expansion, and a community waste-management pilot.",
    },
    {
      period: `${t1Start}–${t1End}`,
      title: "Ward Committee Member",
      description: "Active in local welfare programs, education outreach, and youth sports development.",
    },
  ];
}

export function MemberDetailModal({ member, onClose }: Props) {
  const [showTimeline, setShowTimeline] = useState(false);
  useLockBodyScroll(member !== null);

  if (!member) return null;

  const tenureYears = member.termEnd - member.termStart;
  const timeline = buildTimeline(member);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-detail-title"
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/55 backdrop-blur-sm animate-in fade-in"
      />
      <div className="relative w-full sm:w-[92%] sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-background rounded-t-2xl sm:rounded-2xl shadow-elevated overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-background/80 backdrop-blur ring-1 ring-border hover:bg-surface transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] overflow-hidden flex-1">
          <div className="bg-civic/5 p-5 sm:p-5 flex sm:flex-col items-center sm:items-start gap-4 border-b sm:border-b-0 sm:border-r border-border">
            <img
              src={member.photo}
              alt={member.name}
              className="size-20 sm:w-full sm:h-auto sm:aspect-[4/5] rounded-xl object-cover ring-2 ring-gold/30 shrink-0"
            />
            <div className="min-w-0 sm:mt-2">
              <p className="text-[10px] uppercase tracking-widest text-civic font-semibold mb-1">
                Elected Representative
              </p>
              <h2
                id="member-detail-title"
                className="text-lg sm:text-xl font-semibold leading-tight text-foreground"
              >
                {member.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{member.designation}</p>
            </div>
          </div>

          <div className="overflow-y-auto p-5 sm:p-7 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <InfoTile
                icon={<Award className="size-4" />}
                label="Designation"
                value={member.designation}
              />
              <InfoTile
                icon={<MapPin className="size-4" />}
                label="Ward"
                value={member.ward ?? "—"}
              />
              <InfoTile
                icon={<Calendar className="size-4" />}
                label="Term"
                value={`${member.termStart} – ${member.termEnd}`}
              />
              <InfoTile
                icon={<Award className="size-4" />}
                label="Tenure"
                value={`${tenureYears} years`}
              />
            </div>

            {member.partyOrAffiliation && (
              <div className="rounded-lg bg-surface ring-1 ring-border p-4">
                <p className="text-[10px] uppercase tracking-widest text-ink-soft font-semibold mb-1">
                  Affiliation
                </p>
                <p className="text-sm text-foreground">{member.partyOrAffiliation}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Biography</h3>
              <p className="text-sm leading-relaxed text-foreground/85 text-pretty">
                {member.name} serves the citizens of {member.ward ?? "Pabna Pourashava"} as{" "}
                {member.designation}. Elected for the {member.termStart}–{member.termEnd} term,{" "}
                {member.name.split(" ")[0]} is committed to transparent governance, improved civic
                amenities, and active engagement with residents through regular ward-level meetings
                and grievance hearings.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Contact</h3>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <a
                  href={`mailto:${member.name.split(" ").join(".").toLowerCase()}@pabnapourashava.gov.bd`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface ring-1 ring-border hover:ring-civic/40 transition-colors"
                >
                  <Mail className="size-4 text-civic" />
                  <span className="truncate text-xs">
                    {member.name.split(" ").join(".").toLowerCase()}@pabnapourashava.gov.bd
                  </span>
                </a>
                <a
                  href="tel:+8807312345678"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface ring-1 ring-border hover:ring-civic/40 transition-colors"
                >
                  <Phone className="size-4 text-civic" />
                  <span className="text-xs">+880 731 234 5678</span>
                </a>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowTimeline((v) => !v)}
                aria-expanded={showTimeline}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-surface ring-1 ring-border hover:ring-civic/40 transition-colors text-left"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <History className="size-4 text-civic" />
                  Career Timeline
                  <span className="text-xs text-muted-foreground font-normal">
                    ({timeline.length} terms)
                  </span>
                </span>
                <ChevronDown
                  className={`size-4 text-muted-foreground transition-transform ${
                    showTimeline ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showTimeline && (
                <ol className="relative mt-4 ml-2 border-l-2 border-civic/20 pl-5 space-y-5 animate-in fade-in slide-in-from-top-2">
                  {timeline.map((e, i) => (
                    <li key={i} className="relative">
                      <span
                        className={`absolute -left-[26px] top-1.5 size-3 rounded-full ring-4 ring-background ${
                          e.current ? "bg-gold" : "bg-civic/60"
                        }`}
                      />
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-civic mb-0.5">
                        {e.period}
                        {e.current && (
                          <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-gold text-gold-foreground text-[9px] tracking-wider align-middle">
                            CURRENT
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {e.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed text-pretty">
                        {e.description}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-surface ring-1 ring-border p-3">
      <div className="flex items-center gap-1.5 text-civic mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground leading-tight">{value}</p>
    </div>
  );
}
