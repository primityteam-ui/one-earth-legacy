import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeDollarSign,
  Crown,
  Database,
  FileText,
  Globe2,
  Landmark,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users
} from "lucide-react";
import api from "../api/client.js";

const tabs = ["Overview", "Donations", "Donors", "Missions", "Audit", "Security"];

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDate(value) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [mission, setMission] = useState("all");
  const [country, setCountry] = useState("all");

  async function loadAdminData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/admin/overview", {
        params: {
          search,
          paymentStatus,
          mission,
          country
        }
      });

      setData(response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not load admin dashboard. Make sure you are logged in as an admin."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadCsv() {
    try {
      const response = await api.get("/admin/donations.csv", {
        responseType: "blob"
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `one-earth-legacy-donations-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not download CSV. Make sure you are logged in as an admin."
      );
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const stats = data?.stats || {};
  const recentDonations = data?.recentDonations || [];
  const topDonors = data?.topDonors || [];
  const missionTotals = data?.missionTotals || {};
  const countryTotals = data?.countryTotals || [];
  const recentAuditEntries = data?.recentAuditEntries || [];
  const recentSecurityLogs = data?.recentSecurityLogs || [];

  const revenueStats = useMemo(() => {
    return [
      {
        label: "Total revenue",
        value: formatMoney(stats.totalRevenue),
        icon: <BadgeDollarSign className="h-5 w-5" />
      },
      {
        label: "Cause reserve",
        value: formatMoney(stats.causeReserve),
        icon: <Landmark className="h-5 w-5" />
      },
      {
        label: "Platform reserve",
        value: formatMoney(stats.platformReserve),
        icon: <ShieldCheck className="h-5 w-5" />
      },
      {
        label: "Lottery reserve",
        value: formatMoney(stats.lotteryReserve),
        icon: <Ticket className="h-5 w-5" />
      }
    ];
  }, [stats]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-crimson/40 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-crimsonLight">
              Admin Control Center
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Real Donation Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              View real MongoDB donations, donors, locations, missions, payment status,
              reserve split, and public legacy activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400 hover:text-black"
            >
              Download CSV
            </button>

            <button
              type="button"
              onClick={loadAdminData}
              className="rounded-full border border-gold/30 bg-gold/10 px-5 py-3 font-bold text-goldLight transition hover:bg-gold hover:text-black"
            >
              Refresh dashboard
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-10 text-center text-textSecondary">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-gold" />
          Loading admin dashboard...
        </div>
      ) : errorMessage ? (
        <div className="rounded-[2rem] border border-crimson/40 bg-crimson/10 p-8">
          <AlertTriangle className="mb-4 h-10 w-10 text-crimsonLight" />
          <p className="font-display text-2xl font-bold text-textPrimary">
            Admin data unavailable
          </p>
          <p className="mt-3 text-textSecondary">{errorMessage}</p>
        </div>
      ) : (
        <>
          <section className="mb-8 grid gap-5 md:grid-cols-4">
            {revenueStats.map((stat) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
              />
            ))}
          </section>

          <section className="mb-8 grid gap-5 md:grid-cols-4">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Paid donors"
              value={Number(stats.totalDonors || 0).toLocaleString()}
            />
            <StatCard
              icon={<Globe2 className="h-5 w-5" />}
              label="Active countries"
              value={Number(stats.activeCountries || 0).toLocaleString()}
            />
            <StatCard
              icon={<Database className="h-5 w-5" />}
              label="Paid donations"
              value={Number(stats.donationsCount || 0).toLocaleString()}
            />
            <StatCard
              icon={<FileText className="h-5 w-5" />}
              label="Audit entries"
              value={Number(stats.auditCount || 0).toLocaleString()}
            />
          </section>

          <section className="mb-8 rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-5">
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
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

          <section className="mb-8 rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <div className="mb-5 flex flex-col gap-2">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">
                Admin Filters
              </p>
              <h2 className="font-display text-2xl font-bold text-textPrimary">
                Search donations and donors
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, mission, location..."
                className="rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none transition focus:border-gold"
              />

              <select
                value={paymentStatus}
                onChange={(event) => setPaymentStatus(event.target.value)}
                className="rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none transition focus:border-gold"
              >
                <option value="all">All payment statuses</option>
                <option value="paid">Paid</option>
                <option value="created">Created</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                value={mission}
                onChange={(event) => setMission(event.target.value)}
                className="rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none transition focus:border-gold"
              >
                <option value="all">All missions</option>
                <option value="Human Survival">Human Survival</option>
                <option value="Planet Protection">Planet Protection</option>
                <option value="Children & Education">Children & Education</option>
              </select>

              <input
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="Country or city"
                className="rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none transition focus:border-gold"
              />

              <button
                type="button"
                onClick={loadAdminData}
                className="rounded-xl bg-gold px-5 py-3 font-bold text-black transition hover:bg-goldLight"
              >
                Apply
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPaymentStatus("all");
                setMission("all");
                setCountry("all");
              }}
              className="mt-4 rounded-full border border-borderRoyal px-4 py-2 text-sm font-bold text-textSecondary transition hover:border-gold hover:text-gold"
            >
              Clear filters
            </button>
          </section>

          {activeTab === "Overview" && (
            <OverviewPanel
              stats={stats}
              recentDonations={recentDonations}
              missionTotals={missionTotals}
              countryTotals={countryTotals}
            />
          )}

          {activeTab === "Donations" && (
            <DonationsPanel donations={recentDonations} />
          )}

          {activeTab === "Donors" && (
            <DonorsPanel donors={topDonors} />
          )}

          {activeTab === "Missions" && (
            <MissionsPanel
              missionTotals={missionTotals}
              countryTotals={countryTotals}
            />
          )}

          {activeTab === "Audit" && (
            <AuditPanel entries={recentAuditEntries} />
          )}

          {activeTab === "Security" && (
            <SecurityPanel logs={recentSecurityLogs} />
          )}
        </>
      )}
    </main>
  );
}

function OverviewPanel({ stats, recentDonations, missionTotals, countryTotals }) {
  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
          <PanelHeader icon={<BadgeDollarSign />} title="Revenue Split" />

          <div className="grid gap-5 md:grid-cols-3">
            <ChartCard
              label="Cause allocation"
              value={formatMoney(stats.causeReserve)}
              percent={60}
            />
            <ChartCard
              label="Platform reserve"
              value={formatMoney(stats.platformReserve)}
              percent={25}
            />
            <ChartCard
              label="Lottery reserve"
              value={formatMoney(stats.lotteryReserve)}
              percent={15}
            />
          </div>

          <div className="mt-8 space-y-5">
            <RevenueBar
              label="60% Cause allocation"
              amount={formatMoney(stats.causeReserve)}
              width="60%"
            />
            <RevenueBar
              label="25% Platform sustainability"
              amount={formatMoney(stats.platformReserve)}
              width="25%"
            />
            <RevenueBar
              label="15% Lottery pool"
              amount={formatMoney(stats.lotteryReserve)}
              width="15%"
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
          <PanelHeader icon={<Crown />} title="Latest Donations" />

          <div className="space-y-4">
            {recentDonations.slice(0, 5).map((donation) => (
              <DonationMiniCard key={donation.id} donation={donation} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
          <PanelHeader icon={<Sparkles />} title="Mission Chart" />
          <BarChartFromObject data={missionTotals} emptyText="No mission donations yet." />
        </div>

        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
          <PanelHeader icon={<Globe2 />} title="Country Chart" />
          <CountryChart countries={countryTotals} />
        </div>
      </div>
    </section>
  );
}

function DonationsPanel({ donations }) {
  return (
    <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <PanelHeader icon={<Database />} title="Donation Records" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-sm text-textSecondary">
              <th className="px-4">Donor</th>
              <th className="px-4">Amount</th>
              <th className="px-4">Mission</th>
              <th className="px-4">Location</th>
              <th className="px-4">Payment</th>
              <th className="px-4">Settlement</th>
              <th className="px-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {donations.map((donation) => (
              <tr key={donation.id} className="bg-black/30">
                <td className="rounded-l-2xl px-4 py-4">
                  <p className="font-bold text-textPrimary">
                    {donation.donorName}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {donation.email || "Hidden"}
                  </p>
                </td>

                <td className="px-4 py-4 font-numbers font-bold text-goldLight">
                  {formatMoney(donation.amountUSD)}
                </td>

                <td className="px-4 py-4">
                  <p className="font-bold text-textPrimary">
                    {donation.causeCategory}
                  </p>
                  <p className="text-sm text-textSecondary">
                    {donation.causeImpact}
                  </p>
                </td>

                <td className="px-4 py-4 text-textSecondary">
                  {donation.location?.label || "Unknown"}
                </td>

                <td className="px-4 py-4">
                  <StatusPill value={donation.paymentStatus} />
                </td>

                <td className="px-4 py-4">
                  <StatusPill value={donation.settlementStatus} />
                </td>

                <td className="rounded-r-2xl px-4 py-4 text-sm text-textSecondary">
                  {formatDate(donation.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DonorsPanel({ donors }) {
  return (
    <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <PanelHeader icon={<Users />} title="Top Donors" />

      <div className="space-y-4">
        {donors.map((donor) => (
          <div
            key={donor.id}
            className="grid gap-4 rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5 md:grid-cols-[1fr_160px_160px]"
          >
            <div>
              <p className="font-bold text-textPrimary">
                {donor.displayName}
              </p>
              <p className="text-sm text-textSecondary">
                {donor.email}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-textSecondary">
                <MapPin className="h-4 w-4 text-gold" />
                {donor.location?.label || "Unknown"}
              </p>
            </div>

            <p className="font-bold text-goldLight">{donor.rank}</p>
            <p className="font-numbers font-bold text-textPrimary">
              {formatMoney(donor.totalDonated)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MissionsPanel({ missionTotals, countryTotals }) {
  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <PanelHeader icon={<Sparkles />} title="Mission Performance" />
        <BarChartFromObject data={missionTotals} emptyText="No mission donations yet." />

        <div className="mt-8">
          <MissionTotals missionTotals={missionTotals} />
        </div>
      </div>

      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <PanelHeader icon={<Globe2 />} title="Country Performance" />
        <CountryChart countries={countryTotals} />
      </div>
    </section>
  );
}

function ChartCard({ label, value, percent }) {
  return (
    <div className="rounded-2xl border border-borderRoyal bg-black/30 p-5">
      <p className="text-sm text-textSecondary">{label}</p>
      <p className="mt-2 font-numbers text-2xl font-bold text-textPrimary">
        {value}
      </p>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-royalBlack">
        <div
          className="h-full rounded-full bg-gold"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-sm font-bold text-goldLight">{percent}%</p>
    </div>
  );
}

function BarChartFromObject({ data, emptyText }) {
  const entries = Object.entries(data || {});
  const maxValue = Math.max(...entries.map(([, value]) => Number(value || 0)), 1);

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-borderRoyal bg-black/30 p-5 text-textSecondary">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([label, value]) => {
        const percent = Math.max(4, (Number(value || 0) / maxValue) * 100);

        return (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <p className="font-bold text-textPrimary">{label}</p>
              <p className="font-numbers font-bold text-goldLight">
                {formatMoney(value)}
              </p>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-royalBlack">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CountryChart({ countries }) {
  const list = Array.isArray(countries) ? countries.slice(0, 8) : [];
  const maxValue = Math.max(
    ...list.map((country) => Number(country.totalDonated || 0)),
    1
  );

  if (list.length === 0) {
    return (
      <p className="rounded-2xl border border-borderRoyal bg-black/30 p-5 text-textSecondary">
        No country donation data yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((country) => {
        const percent = Math.max(
          4,
          (Number(country.totalDonated || 0) / maxValue) * 100
        );

        return (
          <div key={`${country.countryCode}-${country.country}`}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-textPrimary">
                  {country.country}
                </p>
                <p className="text-sm text-textSecondary">
                  {country.countryCode} · {country.donors} donor records
                </p>
              </div>

              <p className="font-numbers font-bold text-goldLight">
                {formatMoney(country.totalDonated)}
              </p>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-royalBlack">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MissionTotals({ missionTotals }) {
  const entries = Object.entries(missionTotals || {});

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-borderRoyal bg-black/30 p-5 text-textSecondary">
        No mission donations yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([mission, total]) => (
        <div
          key={mission}
          className="flex items-center justify-between gap-4 rounded-2xl border border-borderRoyal bg-black/30 p-5"
        >
          <p className="font-bold text-textPrimary">{mission}</p>
          <p className="font-numbers font-bold text-goldLight">
            {formatMoney(total)}
          </p>
        </div>
      ))}
    </div>
  );
}

function AuditPanel({ entries }) {
  return (
    <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <PanelHeader icon={<FileText />} title="Audit Log Viewer" />

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-borderRoyal bg-black/30 p-5 text-textSecondary">
          No audit entries yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-textSecondary">
                <th className="px-4">Type</th>
                <th className="px-4">Amount</th>
                <th className="px-4">Recipient</th>
                <th className="px-4">Mission</th>
                <th className="px-4">Description</th>
                <th className="px-4">Proof</th>
                <th className="px-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="bg-black/30">
                  <td className="rounded-l-2xl px-4 py-4">
                    <StatusPill value={entry.type} />
                  </td>

                  <td className="px-4 py-4 font-numbers font-bold text-goldLight">
                    {formatMoney(entry.amount)}
                  </td>

                  <td className="px-4 py-4 text-textPrimary">
                    {entry.recipient || "One Earth Legacy"}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-bold text-textPrimary">
                      {entry.causeCategory}
                    </p>
                    <p className="text-sm text-textSecondary">
                      {entry.causeImpact}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-sm text-textSecondary">
                    {entry.description || "No description"}
                  </td>

                  <td className="px-4 py-4">
                    {entry.proofUrl ? (
                      <a
                        href={entry.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-gold hover:text-goldLight"
                      >
                        View proof
                      </a>
                    ) : (
                      <span className="text-sm text-textSecondary">Pending</span>
                    )}
                  </td>

                  <td className="rounded-r-2xl px-4 py-4 text-sm text-textSecondary">
                    {formatDate(entry.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SecurityPanel({ logs }) {
  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
          <PanelHeader icon={<ShieldCheck />} title="Admin Security Rules" />

          <SecurityLine text="Frontend /admin is protected by admin role." />
          <SecurityLine text="Backend /api/admin routes require JWT authentication." />
          <SecurityLine text="Backend /api/admin routes require admin role." />
          <SecurityLine text="Production should add IP whitelist and hardware 2FA." />
          <SecurityLine text="Every future admin write action should create a SecurityLog record." />
        </div>

        <div className="rounded-[2rem] border border-crimson/40 bg-crimson/10 p-6">
          <AlertTriangle className="mb-4 h-10 w-10 text-crimsonLight" />
          <p className="font-display text-2xl font-bold text-textPrimary">
            Read-only admin dashboard
          </p>
          <p className="mt-3 text-textSecondary">
            This dashboard only reads data. Do not add destructive admin actions until
            2FA, IP whitelist, and security logging are fully implemented.
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <PanelHeader icon={<FileText />} title="Security Log Viewer" />

        {!logs || logs.length === 0 ? (
          <p className="rounded-2xl border border-borderRoyal bg-black/30 p-5 text-textSecondary">
            No security logs yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-textSecondary">
                  <th className="px-4">Event</th>
                  <th className="px-4">User</th>
                  <th className="px-4">IP Address</th>
                  <th className="px-4">User Agent</th>
                  <th className="px-4">Details</th>
                  <th className="px-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="bg-black/30">
                    <td className="rounded-l-2xl px-4 py-4">
                      <SecurityEventPill type={log.type} />
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-textPrimary">
                        {log.displayName || log.username || log.email || "Unknown"}
                      </p>
                      <p className="text-sm text-textSecondary">
                        {log.email || "No email"}
                      </p>
                      {log.role && (
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-gold">
                          {log.role}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 font-mono text-sm text-textSecondary">
                      {log.ipAddress || "Unknown"}
                    </td>

                    <td className="max-w-[260px] px-4 py-4 text-sm text-textSecondary">
                      <p className="line-clamp-2">
                        {log.userAgent || "Unknown"}
                      </p>
                    </td>

                    <td className="max-w-[300px] px-4 py-4 text-sm text-textSecondary">
                      <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded-xl border border-borderRoyal bg-black/40 p-3 text-xs">
                        {JSON.stringify(log.details || {}, null, 2)}
                      </pre>
                    </td>

                    <td className="rounded-r-2xl px-4 py-4 text-sm text-textSecondary">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function DonationMiniCard({ donation }) {
  return (
    <div className="rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-textPrimary">{donation.donorName}</p>
          <p className="text-sm text-textSecondary">
            {donation.location?.label || "Unknown"}
          </p>
        </div>

        <p className="font-numbers font-bold text-goldLight">
          {formatMoney(donation.amountUSD)}
        </p>
      </div>

      <p className="mt-3 text-sm text-textSecondary">
        {donation.causeCategory} — {donation.causeImpact}
      </p>
    </div>
  );
}

function SecurityEventPill({ type }) {
  const riskyEvents = [
    "failed_login",
    "otp_failed",
    "rate_limit_hit",
    "suspicious_payment",
    "ban",
    "chargeback",
    "admin_action",
    "emperor_action"
  ];

  const isRisky = riskyEvents.includes(type);

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        isRisky
          ? "border border-crimson/40 bg-crimson/10 text-crimsonLight"
          : "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      }`}
    >
      {type || "unknown"}
    </span>
  );
}

function StatusPill({ value }) {
  const text = value || "unknown";
  const good = ["paid", "settled"].includes(text);

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        good
          ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border border-gold/30 bg-gold/10 text-goldLight"
      }`}
    >
      {text}
    </span>
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

function PanelHeader({ icon, title }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="text-gold">{icon}</div>
      <h2 className="font-display text-2xl font-bold text-textPrimary">
        {title}
      </h2>
    </div>
  );
}

function RevenueBar({ label, amount, width }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
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
