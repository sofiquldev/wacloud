import { useState } from "react";
import { User } from "lucide-react";

export function TopBar() {
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const isBn = lang === "bn";

  return (
    <div className="bg-secondary border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between text-xs text-muted-foreground gap-3">
        <div className="flex items-center gap-3 min-w-0 truncate">
          <span className="font-bangla truncate">বৃহস্পতিবার, ২৩ মে ২০২৪</span>
          <span className="hidden sm:inline w-px h-3 bg-border" />
          <span className="hidden sm:inline">Thursday, May 23, 2024</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setLang(isBn ? "en" : "bn")}
            aria-label={isBn ? "Switch to English" : "বাংলায় দেখুন"}
            title={isBn ? "Switch to English" : "বাংলায় দেখুন"}
            className="group relative flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-1 py-0.5 hover:border-civic/40 transition-colors"
          >
            <span
              className={`relative inline-flex size-5 items-center justify-center overflow-hidden rounded-full ring-1 ring-border transition-all ${
                isBn ? "scale-100 opacity-100" : "scale-90 opacity-50"
              }`}
            >
              <FlagBD />
            </span>
            <span
              className={`relative inline-flex size-5 items-center justify-center overflow-hidden rounded-full ring-1 ring-border transition-all ${
                !isBn ? "scale-100 opacity-100" : "scale-90 opacity-50"
              }`}
            >
              <FlagUK />
            </span>
            <span
              aria-hidden
              className={`pointer-events-none absolute top-0.5 bottom-0.5 w-5 rounded-full ring-2 ring-civic/70 transition-all duration-300 ${
                isBn ? "left-0.5" : "left-[calc(100%-1.375rem)]"
              }`}
            />
          </button>
          <button
            type="button"
            aria-label="Login"
            title="Login"
            className="inline-flex items-center justify-center size-7 rounded-full bg-foreground text-background hover:bg-civic transition-colors"
          >
            <User className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FlagBD() {
  return (
    <svg viewBox="0 0 20 20" className="size-full" aria-hidden>
      <rect width="20" height="20" fill="#006a4e" />
      <circle cx="9" cy="10" r="5" fill="#f42a41" />
    </svg>
  );
}

function FlagUK() {
  return (
    <svg viewBox="0 0 60 30" className="size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <clipPath id="uk-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="uk-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#uk-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}
