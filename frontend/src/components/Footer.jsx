import { Link } from "react-router-dom";
import { Crown, Github, ShieldCheck, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-borderRoyal bg-royalPanel">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-gold/10 shadow-gold">
              <Crown className="h-5 w-5 text-gold" />
            </div>

            <div>
              <p className="font-display text-xl font-bold text-textPrimary">
                One Earth Legacy
              </p>
              <p className="text-sm text-textSecondary">Emperor of Earth</p>
            </div>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-6 text-textSecondary">
            One Earth. One Wall. One Emperor. A digital legacy platform built
            around transparency, purpose, gamification, and secure foundations.
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/10 p-4 text-sm text-goldLight">
            <ShieldCheck className="h-5 w-5" />
            Security-first foundation in progress
          </div>
        </div>

        <FooterColumn
          title="Platform"
          links={[
            ["Home", "/"],
            ["Wall", "/wall"],
            ["Donate", "/donate"],
            ["Leaderboard", "/leaderboard"],
            ["Hall of Legends", "/legends"],
            ["Globe", "/globe"]
          ]}
        />

        <FooterColumn
          title="Trust"
          links={[
            ["Audit Log", "/audit"],
            ["Security", "/security"],
            ["FAQ", "/faq"],
            ["Terms", "/terms"],
            ["Privacy", "/privacy"]
          ]}
        />

        <div>
          <p className="mb-4 font-display text-lg font-bold text-textPrimary">
            Status
          </p>

          <div className="space-y-3">
            <StatusItem text="Frontend mock pages built" />
            <StatusItem text="OTP auth working" />
            <StatusItem text="MongoDB connected" />
            <StatusItem text="Payments coming next" />
          </div>

          <div className="mt-6 flex items-center gap-3 text-textSecondary">
            <Github className="h-5 w-5" />
            <span className="text-sm">Private repo recommended</span>
          </div>
        </div>
      </div>

      <div className="border-t border-borderRoyal">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-textSecondary md:flex-row md:items-center md:justify-between">
          <p>© 2026 One Earth Legacy. All rights reserved.</p>

          <p className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            Commercial digital legacy platform, not a charity.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="mb-4 font-display text-lg font-bold text-textPrimary">
        {title}
      </p>

      <div className="space-y-3">
        {links.map(([label, href]) => (
          <Link
            key={href}
            to={href}
            className="block text-sm text-textSecondary hover:text-gold"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusItem({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-textSecondary">
      <span className="h-2 w-2 rounded-full bg-gold" />
      {text}
    </div>
  );
}