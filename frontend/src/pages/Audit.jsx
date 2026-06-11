import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Download,
  ExternalLink,
  FileCheck2,
  Filter,
  HeartHandshake,
  Landmark,
  Search,
  ShieldCheck,
  Ticket,
  Trophy,
  X
} from "lucide-react";
import api from "../api/client.js";
import MissionImpactFilter from "../components/MissionImpactFilter.jsx";
import MoneySplitCard from "../components/MoneySplitCard.jsx";
import PageHero from "../components/PageHero.jsx";
import PublicErrorBox from "../components/PublicErrorBox.jsx";
import PublicStateBox from "../components/PublicStateBox.jsx";
import StatCard from "../components/StatCard.jsx";
import { buildPublicFilterParams } from "../constants/legacyOptions.js";

const auditTypes = [
  "All",
  "donation_received",
  "cause_allocation",
  "platform_allocation",
  "lottery_allocation"
];

const quickAuditTypes = [
  {
    label: "All Records",
    value: "All"
  },
  {
    label: "Donations",
    value: "donation_received"
  },
  {
    label: "Cause",
    value: "cause_allocation"
  },
  {
    label: "Platform",
    value: "platform_allocation"
  },
  {
    label: "Lottery",
    value: "lottery_allocation"
  }
];

const quickMissions = [
  "All Missions",
  "Human Survival",
  "Planet Protection",
  "Children & Education"
];

function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function safeText(value, fallback = "Not available yet") {
  const text = String(value || "").trim();
  return text || fallback;
}

export default function Audit() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [missionFilter, setMissionFilter] = useState("All Missions");
  const [impactFilter, setImpactFilter] = useState("All Impacts");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAudit() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await api.get("/public/audit", {
          params: buildPublicFilterParams(missionFilter, impactFilter)
        });

        setEntries(response.data.entries || []);
      } catch (error) {
        console.error("Could not load audit entries", error);

        setEntries([]);
        setErrorMessage(
          error.response?.data?.message ||
            "Could not load audit entries. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAudit();
  }, [missionFilter, impactFilter]);

  const visibleEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
          !query ||
          entry.type?.toLowerCase().includes(query) ||
          entry.recipient?.toLowerCase().includes(query) ||
          entry.description?.toLowerCase().includes(query) ||
          entry.status?.toLowerCase().includes(query) ||
          entry.causeCategory?.toLowerCase().includes(query) ||
          entry.causeImpact?.toLowerCase().includes(query) ||
          entry.cause?.toLowerCase().includes(query);

        const matchesType = typeFilter === "All" || entry.type === typeFilter;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [entries, search, typeFilter]);

  const totals = useMemo(() => {
    return visibleEntries.reduce(
      (acc, entry) => {
        const amount = Number(entry.amount || 0);

        acc.totalVisible += amount;

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
        totalVisible: 0,
        totalDonations: 0,
        cause: 0,
        platform: 0,
        lottery: 0
      }
    );
  }, [visibleEntries]);

  const allocationHealth = useMemo(() => {
    const expectedCause = Number((totals.totalDonations * 0.6).toFixed(2));
    const expectedPlatform = Number((totals.totalDonations * 0.25).toFixed(2));
    const expectedLottery = Number((totals.totalDonations * 0.15).toFixed(2));

    const causeDifference = Number((totals.cause - expectedCause).toFixed(2));
    const platformDifference = Number((totals.platform - expectedPlatform).toFixed(2));
    const lotteryDifference = Number((totals.lottery - expectedLottery).toFixed(2));

    const isBalanced =
      Math.abs(causeDifference) <= 0.02 &&
      Math.abs(platformDifference) <= 0.02 &&
      Math.abs(lotteryDifference) <= 0.02;

    return {
      expectedCause,
      expectedPlatform,
      expectedLottery,
      causeDifference,
      platformDifference,
      lotteryDifference,
      isBalanced
    };
  }, [totals]);

  const topAuditMissions = useMemo(() => {
    const missionMap = new Map();

    for (const entry of visibleEntries) {
      const missionName = entry.causeCategory || "Mission Pending";
      const impactName = entry.causeImpact || entry.cause || "Impact Pending";

      const existing = missionMap.get(missionName) || {
        missionName,
        topImpact: impactName,
        totalAmount: 0,
        records: 0
      };

      existing.totalAmount += Number(entry.amount || 0);
      existing.records += 1;

      if (Number(entry.amount || 0) > Number(existing.topAmount || 0)) {
        existing.topAmount = Number(entry.amount || 0);
        existing.topImpact = impactName;
      }

      missionMap.set(missionName, existing);
    }

    return Array.from(missionMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 4);
  }, [visibleEntries]);

  const auditStats = [
    {
      label: "Visible entries",
      value: visibleEntries.length.toLocaleString(),
      icon: <FileCheck2 />
    },
    {
      label: "Donations received",
      value: money(totals.totalDonations),
      icon: <BadgeDollarSign />
    },
    {
      label: "Cause allocation",
      value: money(totals.cause),
      icon: <HeartHandshake />
    },
    {
      label: "Platform + lottery",
      value: money(totals.platform + totals.lottery),
      icon: <Trophy />
    }
  ];

  const activeFilters = [
    search ? `Search: ${search}` : "",
    typeFilter !== "All" ? `Type: ${formatType(typeFilter)}` : "",
    missionFilter !== "All Missions" ? `Mission: ${missionFilter}` : "",
    impactFilter !== "All Impacts" ? `Impact: ${impactFilter}` : ""
  ].filter(Boolean);

  const hasFilters = activeFilters.length > 0;

  function clearFilters() {
    setSearch("");
    setTypeFilter("All");
    setMissionFilter("All Missions");
    setImpactFilter("All Impacts");
  }

  function downloadVisibleCsv() {
    const headers = [
      "Date",
      "Type",
      "Status",
      "Recipient",
      "Mission",
      "Impact",
      "Cause",
      "Description",
      "Amount",
      "Currency",
      "Proof URL"
    ];

    const rows = visibleEntries.map((entry) => [
      formatDate(entry.createdAt),
      formatType(entry.type),
      entry.status || "recorded",
      entry.recipient || "",
      entry.causeCategory || "",
      entry.causeImpact || "",
      entry.cause || "",
      entry.description || "",
      Number(entry.amount || 0).toFixed(2),
      entry.currency || "USD",
      entry.proofUrl || ""
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `one-earth-public-audit-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <PageHero
        eyebrow="Public Audit Log"
        title="Every Dollar Visible"
        description="A public transparency page showing donation receipts, cause allocation, platform sustainability, and lottery pool records by mission and impact."
        rightLabel="Transparency mode"
        rightValue="Backend Filtered"
      />

      <section className="mb-8 rounded-[2rem] border border-borderRoyal bg-royalPanel p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-gold/30 bg-gold/10 p-3">
              <Filter className="h-5 w-5 text-gold" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-textPrimary">
                Filter public audit
              </h2>
              <p className="text-sm text-textSecondary">
                Search records, filter by entry type, mission, and exact impact.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadVisibleCsv}
              disabled={visibleEntries.length === 0}
              className="flex w-fit items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm font-bold text-gold hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download Visible CSV
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex w-fit items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm font-bold text-gold hover:bg-gold/10"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textSecondary" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search recipient, description, mission, impact, or status..."
              className="w-full rounded-2xl border border-borderRoyal bg-black/40 py-4 pl-12 pr-4 text-textPrimary outline-none focus:border-gold"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
          >
            {auditTypes.map((type) => (
              <option key={type} value={type} className="bg-royalBlack">
                {type === "All" ? "All Entry Types" : formatType(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <MissionImpactFilter
            missionFilter={missionFilter}
            setMissionFilter={setMissionFilter}
            impactFilter={impactFilter}
            setImpactFilter={setImpactFilter}
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-borderRoyal bg-black/25 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-textSecondary">
              Quick Audit Shortcuts
            </p>

            <div className="flex flex-wrap gap-2">
              {quickAuditTypes.map((item) => {
                const active = typeFilter === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setTypeFilter(item.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "border-gold bg-gold text-black"
                        : "border-gold/30 bg-gold/10 text-gold hover:bg-gold/20"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-borderRoyal bg-black/25 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-textSecondary">
              Quick Mission Shortcuts
            </p>

            <div className="flex flex-wrap gap-2">
              {quickMissions.map((mission) => {
                const active = missionFilter === mission;

                return (
                  <button
                    key={mission}
                    type="button"
                    onClick={() => {
                      setMissionFilter(mission);
                      setImpactFilter("All Impacts");
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                      active
                        ? "border-gold bg-gold text-black"
                        : "border-gold/30 bg-gold/10 text-gold hover:bg-gold/20"
                    }`}
                  >
                    {mission}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-5 rounded-2xl border border-gold/20 bg-black/25 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-textSecondary">
              Active Filters
            </p>

            <div className="flex flex-wrap gap-2">
              {activeFilters.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {errorMessage && <PublicErrorBox message={errorMessage} />}

      <section className="mb-8 grid gap-5 md:grid-cols-4">
        {auditStats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>

      {!loading && topAuditMissions.length > 0 && (
        <section className="mb-8 rounded-[2rem] border border-borderRoyal bg-royalPanel p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold">
                Top Audit Missions
              </p>

              <h2 className="mt-2 font-display text-3xl font-bold text-textPrimary">
                Where visible audit activity is recorded
              </h2>
            </div>

            <p className="text-sm text-textSecondary">
              Based on current public audit filters.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topAuditMissions.map((mission) => (
              <div
                key={mission.missionName}
                className="rounded-2xl border border-gold/20 bg-gold/10 p-5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-black/25">
                  <HeartHandshake className="h-6 w-6 text-gold" />
                </div>

                <p className="font-display text-xl font-bold text-textPrimary">
                  {mission.missionName}
                </p>

                <p className="mt-2 line-clamp-2 text-sm text-textSecondary">
                  Top impact: {mission.topImpact}
                </p>

                <div className="mt-4 flex items-end justify-between gap-3 border-t border-gold/20 pt-4">
                  <p className="text-sm text-textSecondary">
                    {mission.records} record{mission.records === 1 ? "" : "s"}
                  </p>

                  <p className="font-numbers text-2xl font-bold text-goldLight">
                    {money(mission.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && (
        <section className="mb-5 rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-textPrimary">
                Showing {visibleEntries.length.toLocaleString()} of{" "}
                {entries.length.toLocaleString()} public audit records
              </p>

              <p className="mt-1 text-sm text-textSecondary">
                Total visible record amount:{" "}
                <span className="font-bold text-gold">
                  {money(totals.totalVisible)}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em]">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
                {money(totals.cause)} cause
              </span>

              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
                {money(totals.platform)} platform
              </span>

              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
                {money(totals.lottery)} lottery
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="mb-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <FileCheck2 className="h-6 w-6 text-gold" />
              <h2 className="font-display text-2xl font-bold">Audit Entries</h2>
            </div>

            <p className="text-sm text-textSecondary">
              Newest records first
            </p>
          </div>

          {loading ? (
            <PublicStateBox message="Loading audit entries from backend..." />
          ) : visibleEntries.length > 0 ? (
            <div className="space-y-4">
              {visibleEntries.map((entry, index) => (
                <AuditEntry key={entry.id || index} entry={entry} index={index} />
              ))}
            </div>
          ) : (
            <PublicStateBox
              message={
                errorMessage
                  ? "Fix the filter issue above and try again."
                  : "No audit entries found for this search, type, mission, or exact impact."
              }
            />
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-gold/25 bg-royalCard p-6 shadow-gold">
            <MoneySplitCard
              title="Visible Money Split"
              causeLabel="60% Cause"
              causeAmount={totals.cause}
              platformLabel="25% Platform"
              platformAmount={totals.platform}
              lotteryLabel="15% Lottery"
              lotteryAmount={totals.lottery}
              showBars
              note="These values are calculated from the currently visible public audit records."
            />
          </div>

          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <p className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <ShieldCheck className="h-5 w-5 text-gold" />
              Allocation Health
            </p>

            <div
              className={`mb-4 rounded-2xl border p-4 ${
                allocationHealth.isBalanced
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-crimson/40 bg-crimson/10"
              }`}
            >
              <p
                className={`font-bold ${
                  allocationHealth.isBalanced ? "text-green-400" : "text-crimson"
                }`}
              >
                {allocationHealth.isBalanced
                  ? "Visible records look balanced"
                  : "Visible records need review"}
              </p>

              <p className="mt-2 text-sm text-textSecondary">
                This checks whether visible allocation records match 60% cause,
                25% platform, and 15% lottery based on visible donation received records.
              </p>
            </div>

            <AllocationLine
              label="Cause expected"
              expected={allocationHealth.expectedCause}
              actual={totals.cause}
              difference={allocationHealth.causeDifference}
            />

            <AllocationLine
              label="Platform expected"
              expected={allocationHealth.expectedPlatform}
              actual={totals.platform}
              difference={allocationHealth.platformDifference}
            />

            <AllocationLine
              label="Lottery expected"
              expected={allocationHealth.expectedLottery}
              actual={totals.lottery}
              difference={allocationHealth.lotteryDifference}
            />
          </div>

          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <p className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <ShieldCheck className="h-5 w-5 text-gold" />
              Trust Rules
            </p>

            <TrustLine text="Mission and exact impact are saved separately in MongoDB." />
            <TrustLine text="Audit records can be filtered by mission and exact impact." />
            <TrustLine text="Ranks update only after verified payment settlement." />
            <TrustLine text="Large donations require manual review." />
            <TrustLine text="Public proof links can be attached to verified cause payouts." />
          </div>

          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <p className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <FileCheck2 className="h-5 w-5 text-gold" />
              Audit QA Checklist
            </p>

            {[
              "Donation received records are visible",
              "Cause allocation records are visible",
              "Platform allocation records are visible",
              "Lottery allocation records are visible",
              "Mission and impact filters update backend results",
              "Search and type filters work without exposing private data"
            ].map((item) => (
              <TrustLine key={item} text={item} />
            ))}
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

function AuditEntry({ entry, index }) {
  const status = entry.status || "recorded";
  const amount = Number(entry.amount || 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.35) }}
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

          <p className="font-bold text-textPrimary">
            {safeText(entry.recipient, "One Earth Legacy")}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-goldLight">
              {safeText(entry.causeCategory, "Mission Pending")}
            </span>

            <span className="rounded-full border border-borderRoyal bg-black/40 px-3 py-1 text-xs text-textSecondary">
              {safeText(entry.causeImpact || entry.cause, "Impact Pending")}
            </span>
          </div>

          <p className="mt-3 text-textSecondary">
            {safeText(entry.description, "Public audit record saved.")}
          </p>

          {entry.proofUrl ? (
            <a
              href={entry.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex w-fit items-center gap-2 text-sm text-goldLight hover:text-gold"
            >
              <ExternalLink className="h-4 w-4" />
              View proof
            </a>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-sm text-textSecondary">
              <ExternalLink className="h-4 w-4" />
              Proof link pending
            </p>
          )}
        </div>

        <p className="font-numbers text-3xl font-bold text-goldLight">
          {money(amount)}
        </p>
      </div>
    </motion.article>
  );
}

function AllocationLine({ label, expected, actual, difference }) {
  const isOk = Math.abs(Number(difference || 0)) <= 0.02;

  return (
    <div className="mb-3 rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-bold text-textPrimary">{label}</p>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            isOk
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-crimson/40 bg-crimson/10 text-crimson"
          }`}
        >
          {isOk ? "OK" : "Review"}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-textSecondary">
        <p>Expected: {money(expected)}</p>
        <p>Actual: {money(actual)}</p>
        <p>Difference: {money(difference)}</p>
      </div>
    </div>
  );
}

function TrustLine({ text }) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <Ticket className="h-5 w-5 shrink-0 text-gold" />
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

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
