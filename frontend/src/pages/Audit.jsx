import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  ExternalLink,
  FileCheck2,
  HeartHandshake,
  Landmark,
  ShieldCheck,
  Ticket,
  Trophy
} from "lucide-react";
import api from "../api/client.js";

export default function Audit() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      try {
        const response = await api.get("/public/audit");
        setEntries(response.data.entries || []);
      } catch (error) {
        console.error("Could not load audit entries", error);
      } finally {
        setLoading(false);
      }
    }

    loadAudit();
  }, []);

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        const amount = Number(entry.amount || 0);

        if (entry.type === "donation_received") {
          acc.totalDonations += amount;
        }

        if (entry.type === "cause_allocation") {
          acc.cause += amount;
        }

        if (entry.type === "platform_allocation") {
          acc.platform += amount;
        }

        if (entry.type === "lottery_allocation") {
          acc.lottery += amount;
        }

        return acc;
      },
      {
        totalDonations: 0,
        cause: 0,
        platform: 0,
        lottery: 0
      }
    );
  }, [entries]);

  const auditStats = [
    {
      label: "Total donations",
      value: `$${totals.totalDonations.toFixed(2)}`,
      icon: <BadgeDollarSign />
    },
    {
      label: "Cause allocation",
      value: `$${totals.cause.toFixed(2)}`,
      icon: <HeartHandshake />
    },
    {
      label: "Platform allocation",
      value: `$${totals.platform.toFixed(2)}`,
      icon: <Landmark />
    },
    {
      label: "Lottery pool",
      value: `$${totals.lottery.toFixed(2)}`,
      icon: <Trophy />
    }
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              Public Audit Log
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Every Dollar Visible
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              One Earth Legacy shows how money is split: 60% to the selected cause,
              25% to platform sustainability, and 15% to the monthly donor lottery.
              This page is now loading audit entries from your backend API.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
            <p className="text-sm text-goldLight">Transparency mode</p>
            <p className="font-display text-2xl font-bold text-textPrimary">
              Backend Connected
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-5 md:grid-cols-4">
        {auditStats.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="mb-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
          <div className="mb-6 flex items-center gap-3">
            <FileCheck2 className="h-6 w-6 text-gold" />
            <h2 className="font-display text-2xl font-bold">Audit Entries</h2>
          </div>

          {loading ? (
            <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-10 text-center text-textSecondary">
              Loading audit entries from backend...
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <AuditEntry key={entry.id} entry={entry} index={index} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-gold/25 bg-royalCard p-6 shadow-gold">
            <p className="mb-4 font-display text-2xl font-bold text-textPrimary">
              Money Split
            </p>

            <SplitBar label="60% Cause" value={`$${totals.cause.toFixed(2)}`} width="60%" />
            <SplitBar label="25% Platform" value={`$${totals.platform.toFixed(2)}`} width="25%" />
            <SplitBar label="15% Lottery" value={`$${totals.lottery.toFixed(2)}`} width="15%" />

            <p className="mt-5 rounded-2xl border border-borderRoyal bg-black/30 p-4 text-sm text-textSecondary">
              These values are now calculated from backend audit records.
            </p>
          </div>

          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <p className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <ShieldCheck className="h-5 w-5 text-gold" />
              Trust Rules
            </p>

            <TrustLine text="Ranks update only after verified payment settlement." />
            <TrustLine text="Stripe and Razorpay webhooks must be signature verified." />
            <TrustLine text="Large donations require manual review." />
            <TrustLine text="Chargeback causes rank revocation and account review." />
            <TrustLine text="Public proof links will be attached to cause payouts." />
          </div>

          <div className="rounded-[2rem] border border-crimson/40 bg-crimson/10 p-6">
            <p className="font-display text-xl font-bold text-textPrimary">
              Legal note
            </p>
            <p className="mt-3 text-textSecondary">
              This platform is a commercial digital legacy platform, not a charity.
              Cause contribution is a transparent product feature.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>

      <p className="text-sm text-textSecondary">{label}</p>
      <p className="mt-2 font-numbers text-2xl font-bold text-textPrimary">
        {value}
      </p>
    </div>
  );
}

function AuditEntry({ entry, index }) {
  const status = entry.status || "recorded";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-bold text-goldLight">
              {formatType(entry.type)}
            </span>

            <span className="rounded-full border border-borderRoyal bg-black/30 px-3 py-1 text-sm text-textSecondary">
              {formatDate(entry.createdAt)}
            </span>

            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-400">
              {status}
            </span>
          </div>

          <p className="font-bold text-textPrimary">{entry.recipient}</p>
          <p className="mt-2 text-textSecondary">{entry.description}</p>

          <button className="mt-4 flex items-center gap-2 text-sm text-goldLight hover:text-gold">
            <ExternalLink className="h-4 w-4" />
            Proof link pending
          </button>
        </div>

        <p className="font-numbers text-3xl font-bold text-goldLight">
          ${Number(entry.amount || 0).toFixed(2)}
        </p>
      </div>
    </motion.article>
  );
}

function SplitBar({ label, value, width }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-textSecondary">{label}</span>
        <span className="font-numbers font-bold text-goldLight">{value}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-royalBlack">
        <div className="h-full rounded-full bg-gold" style={{ width }} />
      </div>
    </div>
  );
}

function TrustLine({ text }) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <Ticket className="h-5 w-5 text-gold" />
      <span className="text-sm text-textSecondary">{text}</span>
    </div>
  );
}

function formatType(type) {
  return String(type || "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "Today";
  }

  return new Date(value).toLocaleDateString();
}