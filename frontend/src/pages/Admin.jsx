import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeDollarSign,
  Ban,
  Crown,
  FileWarning,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Ticket,
  Users
} from "lucide-react";

const revenueStats = [
  { label: "Total revenue", value: "$40.00", icon: <BadgeDollarSign /> },
  { label: "Cause reserve", value: "$24.00", icon: <Landmark /> },
  { label: "Platform reserve", value: "$10.00", icon: <ShieldCheck /> },
  { label: "Lottery reserve", value: "$6.00", icon: <Ticket /> }
];

const donors = [
  {
    id: 1,
    name: "Vamshi Yalavarthi",
    email: "vamshiyalavarthi11@gmail.com",
    rank: "Citizen",
    amount: "$40.00",
    status: "Active"
  },
  {
    id: 2,
    name: "Maya Singh",
    email: "maya@example.com",
    rank: "Duke",
    amount: "$25,000.00",
    status: "Active"
  },
  {
    id: 3,
    name: "Lucas Silva",
    email: "lucas@example.com",
    rank: "Baron",
    amount: "$6,800.00",
    status: "Review"
  }
];

const flags = [
  {
    id: 1,
    type: "Suspicious payment",
    user: "Lucas Silva",
    detail: "Large donation requires manual review before rank confirmation.",
    severity: "Medium"
  },
  {
    id: 2,
    type: "Content report",
    user: "Anonymous",
    detail: "Tile message reported by 3 different IP addresses.",
    severity: "High"
  },
  {
    id: 3,
    type: "Rate limit hit",
    user: "Unknown IP",
    detail: "Multiple OTP attempts from same IP during testing.",
    severity: "Low"
  }
];

const sponsors = [
  {
    id: 1,
    brand: "No active sponsor",
    placement: "Homepage featured tile",
    amount: "$499/mo",
    status: "Open"
  },
  {
    id: 2,
    brand: "No active sponsor",
    placement: "Live ticker sponsor",
    amount: "$199/mo",
    status: "Open"
  },
  {
    id: 3,
    brand: "No active sponsor",
    placement: "Country leaderboard sponsor",
    amount: "$99/mo",
    status: "Open"
  }
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState("Revenue");

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-crimson/40 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-crimsonLight">
              Admin Preview
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Control Center
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              This is a frontend preview of the admin panel. Production admin access must be
              protected by admin role, IP whitelist, hardware 2FA, security logs, and a separate
              admin subdomain.
            </p>
          </div>

          <div className="rounded-2xl border border-crimson/40 bg-crimson/10 px-5 py-4">
            <p className="text-sm text-crimsonLight">Security status</p>
            <p className="font-display text-2xl font-bold text-textPrimary">
              Preview Only
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-5 md:grid-cols-4">
        {revenueStats.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="mb-8 rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-5">
        <div className="flex flex-wrap gap-3">
          {["Revenue", "Donors", "Flags", "Sponsors", "Lottery", "Security"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-3 text-sm font-bold ${
                activeTab === tab
                  ? "bg-gold text-black"
                  : "border border-borderRoyal bg-black/30 text-textSecondary hover:border-gold hover:text-gold"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "Revenue" && <RevenuePanel />}
      {activeTab === "Donors" && <DonorsPanel />}
      {activeTab === "Flags" && <FlagsPanel />}
      {activeTab === "Sponsors" && <SponsorsPanel />}
      {activeTab === "Lottery" && <LotteryPanel />}
      {activeTab === "Security" && <SecurityPanel />}
    </main>
  );
}

function RevenuePanel() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <PanelHeader icon={<BadgeDollarSign />} title="Revenue Breakdown" />

        <div className="space-y-5">
          <RevenueBar label="60% Cause allocation" amount="$24.00" width="60%" />
          <RevenueBar label="25% Platform sustainability" amount="$10.00" width="25%" />
          <RevenueBar label="15% Lottery pool" amount="$6.00" width="15%" />
          <RevenueBar label="Add-ons revenue" amount="$0.00" width="5%" />
          <RevenueBar label="Subscriptions revenue" amount="$0.00" width="5%" />
          <RevenueBar label="Sponsored placements" amount="$0.00" width="5%" />
        </div>
      </div>

      <AdminWarning />
    </section>
  );
}

function DonorsPanel() {
  return (
    <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <PanelHeader icon={<Users />} title="Donor Management" />

      <div className="space-y-4">
        {donors.map((donor) => (
          <div
            key={donor.id}
            className="grid gap-4 rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5 md:grid-cols-[1fr_140px_140px_120px]"
          >
            <div>
              <p className="font-bold text-textPrimary">{donor.name}</p>
              <p className="text-sm text-textSecondary">{donor.email}</p>
            </div>

            <p className="font-bold text-goldLight">{donor.rank}</p>
            <p className="font-numbers font-bold text-textPrimary">{donor.amount}</p>

            <button className="rounded-full border border-crimson/40 px-4 py-2 text-sm font-bold text-crimsonLight hover:bg-crimson hover:text-white">
              Review
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function FlagsPanel() {
  return (
    <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <PanelHeader icon={<FileWarning />} title="Flag Queue" />

      <div className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="rounded-[1.5rem] border border-crimson/30 bg-crimson/10 p-5"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-crimson/40 bg-crimson/20 px-3 py-1 text-sm font-bold text-crimsonLight">
                {flag.severity}
              </span>

              <span className="rounded-full border border-borderRoyal bg-black/30 px-3 py-1 text-sm text-textSecondary">
                {flag.type}
              </span>
            </div>

            <p className="font-bold text-textPrimary">{flag.user}</p>
            <p className="mt-2 text-textSecondary">{flag.detail}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button className="rounded-full bg-gold px-5 py-2 font-bold text-black">
                Approve
              </button>
              <button className="rounded-full border border-crimson/40 px-5 py-2 font-bold text-crimsonLight hover:bg-crimson hover:text-white">
                Hide / Ban
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SponsorsPanel() {
  return (
    <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <PanelHeader icon={<Crown />} title="Sponsor Placements" />

      <div className="space-y-4">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="grid gap-4 rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5 md:grid-cols-[1fr_180px_120px]"
          >
            <div>
              <p className="font-bold text-textPrimary">{sponsor.placement}</p>
              <p className="text-sm text-textSecondary">{sponsor.brand}</p>
            </div>

            <p className="font-numbers font-bold text-goldLight">{sponsor.amount}</p>

            <span className="w-fit rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-bold text-goldLight">
              {sponsor.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LotteryPanel() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <PanelHeader icon={<Ticket />} title="Lottery Draw Tool" />

        <div className="rounded-[1.5rem] border border-gold/30 bg-gold/10 p-6">
          <p className="font-display text-3xl font-bold text-textPrimary">
            Current Prize Pool
          </p>
          <p className="mt-3 font-numbers text-5xl font-bold text-goldLight">$6.00</p>
          <p className="mt-4 text-textSecondary">
            The real lottery draw must use verified donor records and be logged publicly in the audit log.
          </p>

          <button
            onClick={() => alert("Lottery draw backend will be connected later.")}
            className="mt-6 rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
          >
            Preview Draw Winner
          </button>
        </div>
      </div>

      <AdminWarning />
    </section>
  );
}

function SecurityPanel() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <PanelHeader icon={<LockKeyhole />} title="Admin Security Rules" />

        <SecurityLine text="Admin panel must run on admin.onearthlegacy.com." />
        <SecurityLine text="Admin access requires JWT authentication." />
        <SecurityLine text="Admin access requires IP whitelist." />
        <SecurityLine text="Admin access requires hardware 2FA or TOTP." />
        <SecurityLine text="Every admin action must be saved to SecurityLog." />
        <SecurityLine text="Bank withdrawals require extra 2FA re-verification." />
        <SecurityLine text="Admin routes must never be exposed publicly." />
      </div>

      <div className="rounded-[2rem] border border-crimson/40 bg-crimson/10 p-6">
        <AlertTriangle className="mb-4 h-10 w-10 text-crimsonLight" />
        <p className="font-display text-2xl font-bold text-textPrimary">
          Production Warning
        </p>
        <p className="mt-3 text-textSecondary">
          This preview route is visible only for development. Before launch, the real admin panel
          should be moved to a separate protected subdomain and locked down.
        </p>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>

      <p className="text-sm text-textSecondary">{label}</p>
      <p className="mt-2 font-numbers text-2xl font-bold text-textPrimary">{value}</p>
    </div>
  );
}

function PanelHeader({ icon, title }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="text-gold">{icon}</div>
      <h2 className="font-display text-2xl font-bold text-textPrimary">{title}</h2>
    </div>
  );
}

function RevenueBar({ label, amount, width }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-textSecondary">{label}</p>
        <p className="font-numbers font-bold text-goldLight">{amount}</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-royalBlack">
        <div className="h-full rounded-full bg-gold" style={{ width }} />
      </div>
    </div>
  );
}

function SecurityLine({ text }) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <ShieldCheck className="h-5 w-5 text-gold" />
      <span className="text-textSecondary">{text}</span>
    </div>
  );
}

function AdminWarning() {
  return (
    <div className="rounded-[2rem] border border-crimson/40 bg-crimson/10 p-6">
      <Ban className="mb-4 h-10 w-10 text-crimsonLight" />
      <p className="font-display text-2xl font-bold text-textPrimary">
        Not production admin
      </p>
      <p className="mt-3 text-textSecondary">
        This page is a frontend preview only. Real admin actions must use protected backend routes,
        IP whitelist checks, 2FA, and audit logging.
      </p>
    </div>
  );
}