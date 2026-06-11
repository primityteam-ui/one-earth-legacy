import { useEffect, useMemo, useState } from "react";

import api from "../api/client.js";

const AlertTriangle = ({ className = "" }) => <span className={className}>⚠️</span>;
const BadgeDollarSign = ({ className = "" }) => <span className={className}>💰</span>;
const Crown = ({ className = "" }) => <span className={className}>👑</span>;
const Globe2 = ({ className = "" }) => <span className={className}>🌍</span>;
const Loader2 = ({ className = "" }) => <span className={className}>⏳</span>;
const ShieldCheck = ({ className = "" }) => <span className={className}>🛡️</span>;
const Sparkles = ({ className = "" }) => <span className={className}>✨</span>;
const Users = ({ className = "" }) => <span className={className}>👥</span>;
const Landmark = ({ className = "" }) => <span className={className}>🏛️</span>;
const Ticket = ({ className = "" }) => <span className={className}>🎟️</span>;
const Database = ({ className = "" }) => <span className={className}>🗄️</span>;
const FileText = ({ className = "" }) => <span className={className}>📄</span>;
const MapPin = ({ className = "" }) => <span className={className}>📍</span>;

const tabs = ["Overview", "Donations", "Donors", "Missions", "Audit", "Security", "Health"];

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
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [mission, setMission] = useState("all");
  const [country, setCountry] = useState("all");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [auditSaving, setAuditSaving] = useState(false);
  const [newestAuditId, setNewestAuditId] = useState("");
  const [auditTypeFilter, setAuditTypeFilter] = useState("all");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");
  const [auditForm, setAuditForm] = useState({
    type: "cause_allocation",
    amount: "1",
    currency: "USD",
    recipient: "One Earth Legacy",
    causeCategory: "Human Survival",
    causeImpact: "Clean Water for Life",
    description: "Manual admin audit note.",
    proofUrl: ""
  });

  async function loadAdminData() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.get("/admin/overview", {
        params: {
          search,
          paymentStatus,
          mission,
          country,
          auditType: auditTypeFilter,
          auditStartDate,
          auditEndDate
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
        responseType: "blob",
        params: {
          search,
          paymentStatus,
          mission,
          country
        }
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

  async function handleDownloadAuditCsv() {
    try {
      const response = await api.get("/admin/audit.csv", {
        responseType: "blob",
        params: {
          auditType: auditTypeFilter,
          auditStartDate,
          auditEndDate
        }
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `one-earth-legacy-audit-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not download audit CSV."
      );
    }
  }

  async function handleViewDonationDetail(donationId) {
    if (!donationId) return;

    setDetailLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.get(`/admin/donations/${donationId}`);
      setSelectedDonation(response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not load donation details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function updateAuditForm(field, value) {
    setAuditForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function resetAuditForm() {
    setAuditForm({
      type: "cause_allocation",
      amount: "1",
      currency: "USD",
      recipient: "One Earth Legacy",
      causeCategory: "Human Survival",
      causeImpact: "Clean Water for Life",
      description: "Manual admin audit note.",
      proofUrl: ""
    });

    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleCreateAuditEntry(event) {
    event.preventDefault();

    setAuditSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const cause = `${auditForm.causeCategory} — ${auditForm.causeImpact}`;

      const response = await api.post("/admin/audit", {
        ...auditForm,
        cause,
        amount: Number(auditForm.amount || 0)
      });

      const createdId = response.data?.entry?.id || "";
      setNewestAuditId(createdId);

      await loadAdminData();

      setAuditForm((current) => ({
        ...current,
        amount: "1",
        description: "Manual admin audit note.",
        proofUrl: ""
      }));

      setSuccessMessage("Audit entry created successfully.");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Could not create audit entry."
      );
    } finally {
      setAuditSaving(false);
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
  const auditTotalsByType = data?.auditTotalsByType || {};
  const recentSecurityLogs = data?.recentSecurityLogs || [];
  const health = data?.health || null;

  const hasDonationFilters =
    Boolean(search.trim()) ||
    paymentStatus !== "all" ||
    mission !== "all" ||
    country !== "all";

  const hasAuditFilters =
    auditTypeFilter !== "all" ||
    Boolean(auditStartDate) ||
    Boolean(auditEndDate);

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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10">
      <section className="mb-8 rounded-[1.5rem] border border-crimson/40 bg-royalCard p-5 shadow-gold sm:rounded-[2rem] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-crimsonLight">
              Admin Control Center
            </p>

            <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-6xl">
              Real Donation Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              View real MongoDB donations, donors, locations, missions, payment status,
              reserve split, and public legacy activity. Donation CSV downloads use the selected
              search, payment, mission, and country filters.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400 hover:text-black"
            >
              {hasDonationFilters ? "Download Filtered CSV" : "Download CSV"}
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

      <AdminSecurityBanner />

      {successMessage && (
        <div className="mb-8 rounded-[1.5rem] border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
          <p className="font-bold">{successMessage}</p>
        </div>
      )}

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

          <section className="mb-8 rounded-[1.5rem] border border-borderRoyal bg-royalCard p-5 sm:rounded-[2rem] sm:p-6">
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

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPaymentStatus("all");
                  setMission("all");
                  setCountry("all");
                }}
                className="rounded-full border border-borderRoyal px-4 py-2 text-sm font-bold text-textSecondary transition hover:border-gold hover:text-gold"
              >
                Clear filters
              </button>

              {hasDonationFilters && (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-200">
                  Donation CSV will be filtered
                </span>
              )}
            </div>
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
            <DonationsPanel
              donations={recentDonations}
              onViewDonation={handleViewDonationDetail}
            />
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
            <AuditPanel
              entries={recentAuditEntries}
              auditTotalsByType={auditTotalsByType}
              newestAuditId={newestAuditId}
              auditTypeFilter={auditTypeFilter}
              onAuditTypeFilterChange={setAuditTypeFilter}
              auditStartDate={auditStartDate}
              auditEndDate={auditEndDate}
              hasAuditFilters={hasAuditFilters}
              onAuditStartDateChange={setAuditStartDate}
              onAuditEndDateChange={setAuditEndDate}
              form={auditForm}
              saving={auditSaving}
              onChange={updateAuditForm}
              onSubmit={handleCreateAuditEntry}
              onReset={resetAuditForm}
              onDownloadAuditCsv={handleDownloadAuditCsv}
            />
          )}

          {activeTab === "Security" && (
            <SecurityPanel logs={recentSecurityLogs} />
          )}

          {activeTab === "Health" && (
            <HealthPanel
              health={health}
              onRefresh={loadAdminData}
            />
          )}
        </>
      )}

      {selectedDonation && (
        <DonationDetailDrawer
          donation={selectedDonation}
          loading={detailLoading}
          onClose={() => setSelectedDonation(null)}
        />
      )}
    </main>
  );
}

function AdminSecurityBanner() {
  return (
    <section className="mb-8 rounded-[1.5rem] border border-amber-400/30 bg-amber-400/10 p-5 sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-200">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200">
              Production Safety Notice
            </p>

            <h2 className="mt-2 font-display text-2xl font-bold text-textPrimary">
              Admin dashboard is read-only right now
            </h2>

            <p className="mt-2 max-w-3xl text-textSecondary">
              This page can view donations, donors, audit logs, security logs, and CSV exports.
              Do not add delete, refund, ban, payout, or withdrawal actions until IP whitelist,
              2FA, and SecurityLog write-audit rules are fully ready.
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-2 lg:w-[420px]">
          <SecurityBadge text="Admin role required" />
          <SecurityBadge text="JWT protected" />
          <SecurityBadge text="Read-only actions" />
          <SecurityBadge text="2FA pending" warning />
        </div>
      </div>
    </section>
  );
}

function SecurityBadge({ text, warning = false }) {
  return (
    <div
      className={`rounded-full border px-4 py-2 text-center font-bold ${
        warning
          ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      }`}
    >
      {text}
    </div>
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

          {recentDonations.length === 0 ? (
            <EmptyState
              icon={<Crown />}
              title="No recent donations"
              message="Recent donation activity will appear here after successful paid donations or mock test donations."
            />
          ) : (
            <div className="space-y-4">
              {recentDonations.slice(0, 5).map((donation) => (
                <DonationMiniCard key={donation.id} donation={donation} />
              ))}
            </div>
          )}
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

function DonationsPanel({ donations = [], onViewDonation }) {
  return (
    <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <PanelHeader icon={<Database />} title="Donation Records" />

      {donations.length === 0 ? (
        <EmptyState
          icon={<BadgeDollarSign />}
          title="No donation records found"
          message="No donations match the selected filters yet. Try clearing filters or create a mock/test donation."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-textSecondary">
                <th className="px-4">Donor</th>
                <th className="px-4">Amount</th>
                <th className="px-4">Mission</th>
                <th className="px-4">Location</th>
                <th className="px-4">Payment</th>
                <th className="px-4">Settlement</th>
                <th className="px-4">Date</th>
                <th className="px-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((donation) => (
                <tr key={donation.id} className="bg-black/30">
                  <td className="rounded-l-2xl px-4 py-4">
                    <p className="font-bold text-textPrimary">
                      {donation.donorName || "Unknown donor"}
                    </p>
                    <p className="text-sm text-textSecondary">
                      {donation.email || "Hidden"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <CopyButton value={donation.email} label="Copy email" />
                      <PublicProfileLink
                        username={donation.username || donation.donorUsername}
                        label="Profile"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-4 font-numbers font-bold text-goldLight">
                    {formatMoney(donation.amountUSD)}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-bold text-textPrimary">
                      {donation.causeCategory || "Unassigned"}
                    </p>
                    <p className="text-sm text-textSecondary">
                      {donation.causeImpact || "No impact selected"}
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

                  <td className="px-4 py-4 text-sm text-textSecondary">
                    {formatDate(donation.createdAt)}
                  </td>

                  <td className="rounded-r-2xl px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDonation?.(donation.id)}
                        className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-bold text-goldLight transition hover:bg-gold hover:text-black"
                      >
                        View details
                      </button>

                      <PublicProfileLink
                        username={donation.username || donation.donorUsername}
                        label="Profile"
                      />
                    </div>
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

function DonorsPanel({ donors = [] }) {
  return (
    <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <PanelHeader icon={<Users />} title="Top Donors" />

      {donors.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No donors found"
          message="No donor records are available yet. Donors will appear here after successful paid donations."
        />
      ) : (
        <div className="space-y-4">
          {donors.map((donor) => (
            <div
              key={donor.id}
              className="grid gap-4 rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5 md:grid-cols-[1fr_160px_160px]"
            >
              <div>
                <p className="font-bold text-textPrimary">
                  {donor.displayName || donor.username || "Unknown donor"}
                </p>
                <p className="text-sm text-textSecondary">
                  {donor.email || "Hidden"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton value={donor.email} label="Copy email" />
                  <PublicProfileLink username={donor.username} label="Profile" />
                </div>

                <p className="mt-3 flex items-center gap-2 text-sm text-textSecondary">
                  <MapPin className="h-4 w-4 text-gold" />
                  {donor.location?.label || "Unknown"}
                </p>
              </div>

              <p className="font-bold text-goldLight">{donor.rank || "Spark"}</p>
              <p className="font-numbers font-bold text-textPrimary">
                {formatMoney(donor.totalDonated)}
              </p>
            </div>
          ))}
        </div>
      )}
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
      <EmptyState
        icon={<Sparkles />}
        title="No mission totals yet"
        message={emptyText || "Mission totals will appear after successful paid donations."}
      />
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
      <EmptyState
        icon={<Globe2 />}
        title="No country totals yet"
        message="Country totals will appear after donors choose a country or city location."
      />
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
      <EmptyState
        icon={<Sparkles />}
        title="No mission breakdown yet"
        message="Mission breakdown totals will appear once paid donations are recorded."
      />
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

async function copyToClipboard(value) {
  const text = String(value || "").trim();

  if (!text || text === "Not available" || text === "Hidden") {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function DonationDetailDrawer({ donation, loading, onClose }) {
  const [copiedField, setCopiedField] = useState("");

  async function handleCopy(label, value) {
    await copyToClipboard(value);
    setCopiedField(label);

    window.setTimeout(() => {
      setCopiedField("");
    }, 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
      <div className="ml-auto h-full w-full max-w-2xl overflow-y-auto border-l border-borderRoyal bg-royalBlack p-4 shadow-2xl sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold">
              Donation Detail
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-textPrimary sm:text-3xl">
              {formatMoney(donation.amountUSD)}
            </h2>
            <p className="mt-1 text-textSecondary">
              {donation.causeCategory || "Unassigned"} · {formatDate(donation.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-borderRoyal px-4 py-2 font-bold text-textSecondary transition hover:border-gold hover:text-gold"
          >
            Close
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-borderRoyal bg-royalCard p-6 text-center text-textSecondary">
            Loading donation details...
          </div>
        ) : (
          <div className="space-y-6">
            <DetailSection title="Donor">
              <DetailLine label="Name" value={donation.isAnonymous ? "Anonymous" : donation.donor?.displayName || donation.donor?.username || "Unknown"} />
              <DetailLine
                label="Email"
                value={donation.donor?.email || "Hidden"}
                copyable
                copiedField={copiedField}
                onCopy={handleCopy}
              />
              <DetailLine
                label="Username"
                value={donation.donor?.username || "None"}
                copyable={Boolean(donation.donor?.username)}
                copiedField={copiedField}
                onCopy={handleCopy}
              />
              <DetailLine
                label="Public Profile"
                value={
                  donation.donor?.username
                    ? `${window.location.origin}/u/${donation.donor.username}`
                    : "Not available"
                }
                copyable={Boolean(donation.donor?.username)}
                copiedField={copiedField}
                onCopy={handleCopy}
              />
              <DetailLine label="Role" value={donation.donor?.role || "donor"} />
              <DetailLine label="Current Rank" value={donation.donor?.currentRank || "Spark"} />
              <DetailLine label="Total Donated" value={formatMoney(donation.donor?.totalDonated)} />
            </DetailSection>

            <DetailSection title="Payment">
              <DetailLine label="Amount" value={formatMoney(donation.amountUSD)} />
              <DetailLine label="Currency" value={donation.currency || "USD"} />
              <DetailLine label="Payment Method" value={donation.paymentMethod || "Unknown"} />
              <DetailLine label="Payment Status" value={donation.paymentStatus || "Unknown"} />
              <DetailLine label="Settlement Status" value={donation.settlementStatus || "Unknown"} />
              <DetailLine
                label="Stripe Session"
                value={donation.stripeSessionId || "Not available"}
                copyable
                copiedField={copiedField}
                onCopy={handleCopy}
              />
              <DetailLine
                label="Stripe Payment Intent"
                value={donation.stripePaymentIntentId || "Not available"}
                copyable
                copiedField={copiedField}
                onCopy={handleCopy}
              />
            </DetailSection>

            <DetailSection title="Mission">
              <DetailLine label="Mission" value={donation.causeCategory || "Unassigned"} />
              <DetailLine label="Impact" value={donation.causeImpact || "None"} />
              <DetailLine label="Cause" value={donation.cause || "None"} />
              <DetailLine label="Rank at Time" value={donation.rankAtTime || "Spark"} />
              <DetailLine label="Message" value={donation.message || "No donor message"} />
            </DetailSection>

            <DetailSection title="Location">
              <DetailLine label="Location" value={donation.location?.label || "Unknown"} />
              <DetailLine label="City" value={donation.location?.city || "Unknown"} />
              <DetailLine label="Region" value={donation.location?.region || "Unknown"} />
              <DetailLine label="Country" value={donation.location?.country || "Unknown"} />
              <DetailLine label="Country Code" value={donation.location?.countryCode || "UN"} />
              <DetailLine label="Precision" value={donation.location?.precision || "country"} />
            </DetailSection>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-[1.5rem] border border-borderRoyal bg-royalCard p-5">
      <h3 className="mb-4 font-display text-xl font-bold text-textPrimary">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DetailLine({
  label,
  value,
  copyable = false,
  copiedField = "",
  onCopy = () => {}
}) {
  const displayValue = value || "Unknown";
  const canCopy =
    copyable &&
    displayValue &&
    displayValue !== "Hidden" &&
    displayValue !== "Not available";

  const isCopied = copiedField === label;

  return (
    <div className="grid gap-2 rounded-xl border border-borderRoyal bg-black/30 p-4 md:grid-cols-[170px_1fr]">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-textSecondary">
        {label}
      </p>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="break-words text-textPrimary">{displayValue}</p>

        {canCopy && (
          <button
            type="button"
            onClick={() => onCopy(label, displayValue)}
            className={`w-fit rounded-full border px-4 py-2 text-xs font-bold transition ${
              isCopied
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-gold/30 bg-gold/10 text-goldLight hover:bg-gold hover:text-black"
            }`}
          >
            {isCopied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

function AuditPanel({
  entries = [],
  auditTotalsByType = {},
  newestAuditId = "",
  auditTypeFilter = "all",
  onAuditTypeFilterChange = () => {},
  auditStartDate = "",
  auditEndDate = "",
  hasAuditFilters = false,
  onAuditStartDateChange = () => {},
  onAuditEndDateChange = () => {},
  form = {},
  saving = false,
  onChange = () => {},
  onSubmit = (event) => event.preventDefault(),
  onReset = () => {},
  onDownloadAuditCsv = () => {}
}) {
  const auditSummaryCards = [
    {
      label: "Donations received",
      value: formatMoney(auditTotalsByType.donation_received),
      icon: <BadgeDollarSign />
    },
    {
      label: "Cause allocation",
      value: formatMoney(auditTotalsByType.cause_allocation),
      icon: <Sparkles />
    },
    {
      label: "Platform allocation",
      value: formatMoney(auditTotalsByType.platform_allocation),
      icon: <ShieldCheck />
    },
    {
      label: "Lottery allocation",
      value: formatMoney(auditTotalsByType.lottery_allocation),
      icon: <Ticket />
    }
  ];

  const filteredEntries = entries.filter((entry) => {
    const matchesType =
      auditTypeFilter === "all" || entry.type === auditTypeFilter;

    const entryDate = entry.createdAt ? new Date(entry.createdAt) : null;

    const matchesStart =
      !auditStartDate ||
      (entryDate && entryDate >= new Date(`${auditStartDate}T00:00:00`));

    const matchesEnd =
      !auditEndDate ||
      (entryDate && entryDate <= new Date(`${auditEndDate}T23:59:59`));

    return matchesType && matchesStart && matchesEnd;
  });

  const proofUrl = String(form.proofUrl || "").trim();
  const proofUrlLooksInvalid =
    proofUrl.length > 0 && !proofUrl.startsWith("https://");

  return (
    <section className="space-y-8">
      <div className="grid gap-5 md:grid-cols-4">
        {auditSummaryCards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
          />
        ))}
      </div>
      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <PanelHeader icon={<ShieldCheck />} title="Create Audit Entry" />

        <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-textSecondary">
              Type
            </span>
            <select
              value={form.type || "cause_allocation"}
              onChange={(event) => onChange("type", event.target.value)}
              className="w-full rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none focus:border-gold"
            >
              <option value="cause_allocation">Cause allocation</option>
              <option value="donation_received">Donation received</option>
              <option value="cause_allocation">Cause allocation</option>
              <option value="platform_allocation">Platform allocation</option>
              <option value="lottery_allocation">Lottery allocation</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-textSecondary">
              Amount
            </span>
            <input
              type="number"
              min="1"
              max="1000000"
              step="0.01"
              value={form.amount || "1"}
              onChange={(event) => onChange("amount", event.target.value)}
              className="w-full rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none focus:border-gold"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-textSecondary">
              Recipient
            </span>
            <input
              value={form.recipient || ""}
              maxLength={120}
              onChange={(event) => onChange("recipient", event.target.value)}
              className="w-full rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none focus:border-gold"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-textSecondary">
              Currency
            </span>
            <input
              value={form.currency || "USD"}
              maxLength={3}
              onChange={(event) => onChange("currency", event.target.value.toUpperCase())}
              className="w-full rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none focus:border-gold"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-textSecondary">
              Mission
            </span>
            <select
              value={form.causeCategory || "Human Survival"}
              onChange={(event) => onChange("causeCategory", event.target.value)}
              className="w-full rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none focus:border-gold"
            >
              <option value="Human Survival">Human Survival</option>
              <option value="Planet Protection">Planet Protection</option>
              <option value="Children & Education">Children & Education</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-textSecondary">
              Impact
            </span>
            <input
              value={form.causeImpact || ""}
              maxLength={120}
              onChange={(event) => onChange("causeImpact", event.target.value)}
              className="w-full rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none focus:border-gold"
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="mb-2 block text-sm font-bold text-textSecondary">
              Description
            </span>
            <textarea
              rows="3"
              value={form.description || ""}
              maxLength={800}
              onChange={(event) => onChange("description", event.target.value)}
              className="w-full rounded-xl border border-borderRoyal bg-black/30 px-4 py-3 text-textPrimary outline-none focus:border-gold"
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="mb-2 block text-sm font-bold text-textSecondary">
              Proof URL optional
            </span>
            <input
              value={form.proofUrl || ""}
              maxLength={500}
              onChange={(event) => onChange("proofUrl", event.target.value)}
              placeholder="https://..."
              className={`w-full rounded-xl border bg-black/30 px-4 py-3 text-textPrimary outline-none ${
                proofUrlLooksInvalid
                  ? "border-crimson focus:border-crimsonLight"
                  : "border-borderRoyal focus:border-gold"
              }`}
            />

            {proofUrlLooksInvalid ? (
              <p className="mt-2 rounded-xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm font-bold text-crimsonLight">
                Proof URL must start with https://
              </p>
            ) : proofUrl ? (
              <p className="mt-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-300">
                Proof URL looks valid.
              </p>
            ) : (
              <p className="mt-2 text-sm text-textSecondary">
                Leave empty if proof is not ready yet.
              </p>
            )}
          </label>

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button
              type="submit"
              disabled={saving || proofUrlLooksInvalid}
              className="rounded-xl bg-gold px-6 py-3 font-bold text-black transition hover:bg-goldLight disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving audit entry..." : "Create audit entry"}
            </button>

            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="rounded-xl border border-borderRoyal bg-black/30 px-6 py-3 font-bold text-textSecondary transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear form
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <PanelHeader icon={<ShieldCheck />} title="Audit Log Viewer" />

          <div className="flex flex-wrap gap-3">
            <select
              value={auditTypeFilter}
              onChange={(event) => onAuditTypeFilterChange(event.target.value)}
              className="rounded-full border border-borderRoyal bg-black/30 px-5 py-3 text-sm font-bold text-textPrimary outline-none transition focus:border-gold"
            >
              <option value="all">All audit types</option>
              <option value="donation_received">Donation received</option>
              <option value="cause_allocation">Cause allocation</option>
              <option value="platform_allocation">Platform allocation</option>
              <option value="lottery_allocation">Lottery allocation</option>
            </select>

            <input
              type="date"
              value={auditStartDate}
              onChange={(event) => onAuditStartDateChange(event.target.value)}
              className="rounded-full border border-borderRoyal bg-black/30 px-5 py-3 text-sm font-bold text-textPrimary outline-none transition focus:border-gold"
              title="Start date"
            />

            <input
              type="date"
              value={auditEndDate}
              onChange={(event) => onAuditEndDateChange(event.target.value)}
              className="rounded-full border border-borderRoyal bg-black/30 px-5 py-3 text-sm font-bold text-textPrimary outline-none transition focus:border-gold"
              title="End date"
            />

            <button
              type="button"
              onClick={() => {
                onAuditTypeFilterChange("all");
                onAuditStartDateChange("");
                onAuditEndDateChange("");
              }}
              className="rounded-full border border-borderRoyal bg-black/30 px-5 py-3 text-sm font-bold text-textSecondary transition hover:border-gold hover:text-gold"
            >
              Clear filters
            </button>

            <button
              type="button"
              onClick={onDownloadAuditCsv}
              className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400 hover:text-black"
            >
              {hasAuditFilters ? "Download Filtered Audit CSV" : "Download Audit CSV"}
            </button>
          </div>
        </div>

        <p className="mb-4 text-sm text-textSecondary">
          Showing {filteredEntries.length} of {entries.length} audit records.
          CSV download uses the selected audit filters.
        </p>

        {filteredEntries.length === 0 ? (
          <p className="rounded-2xl border border-borderRoyal bg-black/30 p-5 text-textSecondary">
            No audit entries found for this filter.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[940px] border-separate border-spacing-y-3">
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
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={
                      entry.id === newestAuditId
                        ? "bg-emerald-400/10 ring-1 ring-emerald-400/40"
                        : "bg-black/30"
                    }
                  >
                    <td className="rounded-l-2xl px-4 py-4">
                      <div className="flex items-center gap-2">
                        <StatusPill value={entry.type} />
                        {entry.id === newestAuditId && (
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                            New
                          </span>
                        )}
                      </div>
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
      </div>
    </section>
  );
}

function HealthPanel({ health, onRefresh = () => {} }) {
  if (!health) {
    return (
      <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <PanelHeader icon={<ShieldCheck />} title="System Health" />

          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-gold/30 bg-gold/10 px-5 py-3 text-sm font-bold text-goldLight transition hover:bg-gold hover:text-black"
          >
            Refresh Health
          </button>
        </div>

        <EmptyState
          icon={<ShieldCheck />}
          title="Health data not available"
          message="Refresh the admin dashboard. If this continues, check the backend /api/admin/overview response."
        />
      </section>
    );
  }

  const warnings = Array.isArray(health.warnings) ? health.warnings : [];
  const adminRoutes = Array.isArray(health.adminRoutes) ? health.adminRoutes : [];

  const checks = [
    {
      title: "Backend",
      status: health.backend?.status === "online",
      goodText: "Online",
      badText: "Offline",
      details: [
        `Environment: ${health.backend?.nodeEnv || "unknown"}`,
        `Uptime: ${health.backend?.uptimeSeconds || 0} seconds`
      ]
    },
    {
      title: "MongoDB Database",
      status: Boolean(health.database?.connected),
      goodText: "Connected",
      badText: health.database?.status || "Not connected",
      details: [
        `Ready state: ${health.database?.readyState ?? "unknown"}`,
        `Status: ${health.database?.status || "unknown"}`
      ]
    },
    {
      title: "Stripe Checkout",
      status: Boolean(health.stripe?.readyForCheckout),
      goodText: "Secret key configured",
      badText: "Missing STRIPE_SECRET_KEY",
      details: [
        `Checkout ready: ${health.stripe?.readyForCheckout ? "yes" : "no"}`,
        `Webhook ready: ${health.stripe?.readyForWebhooks ? "yes" : "no"}`
      ]
    },
    {
      title: "Stripe Webhook",
      status: Boolean(health.stripe?.readyForWebhooks),
      goodText: "Webhook configured",
      badText: "Missing webhook secret",
      details: [
        `Secret key: ${health.stripe?.secretKeyConfigured ? "configured" : "missing"}`,
        `Webhook secret: ${health.stripe?.webhookSecretConfigured ? "configured" : "missing"}`
      ]
    },
    {
      title: "Admin IP Allowlist",
      status: Boolean(health.security?.adminIpAllowlistEnabled),
      goodText: "Enabled",
      badText: "Disabled",
      safetyLabel: health.security?.adminIpAllowlistEnabled
        ? "Production Ready"
        : "Pending Security",
      warningWhenFalse: true,
      details: [
        `Enabled: ${health.security?.adminIpAllowlistEnabled ? "yes" : "no"}`,
        `Allowed IPs configured: ${health.security?.adminAllowedIpsConfigured ? "yes" : "no"}`,
        "Enable only after adding your real trusted IPs in production."
      ]
    },
    {
      title: "Admin 2FA",
      status: Boolean(health.security?.adminTwoFactorRequired),
      goodText: "Required",
      badText: "Not required",
      safetyLabel: health.security?.adminTwoFactorRequired
        ? "Production Ready"
        : "Pending Security",
      warningWhenFalse: true,
      details: [
        `Required: ${health.security?.adminTwoFactorRequired ? "yes" : "no"}`,
        "Keep disabled until 2FA setup and verification routes are completed."
      ]
    },
    {
      title: "Admin Rate Limiter",
      status: Boolean(health.security?.adminRateLimiterEnabled),
      goodText: "Enabled",
      badText: "Bypassed in development",
      safetyLabel: health.security?.adminRateLimiterEnabled
        ? "Production Ready"
        : "Development Only",
      warningWhenFalse: false,
      details: [
        `Enabled: ${health.security?.adminRateLimiterEnabled ? "yes" : "no"}`,
        "Development mode intentionally bypasses rate limits."
      ]
    }
  ];

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <PanelHeader icon={<ShieldCheck />} title="System Health Checks" />

          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-gold/30 bg-gold/10 px-5 py-3 text-sm font-bold text-goldLight transition hover:bg-gold hover:text-black"
          >
            Refresh Health
          </button>
        </div>

        {warnings.length > 0 && (
          <div className="mb-6 rounded-[1.5rem] border border-amber-400/30 bg-amber-400/10 p-5">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-200" />
              <p className="font-display text-2xl font-bold text-textPrimary">
                Environment Warnings
              </p>
            </div>

            <div className="space-y-3">
              {warnings.map((warning) => (
                <div
                  key={`${warning.level}-${warning.title}`}
                  className={`rounded-2xl border p-4 ${
                    warning.level === "critical"
                      ? "border-crimson/40 bg-crimson/10"
                      : "border-amber-400/30 bg-amber-400/10"
                  }`}
                >
                  <p
                    className={`font-bold ${
                      warning.level === "critical"
                        ? "text-crimsonLight"
                        : "text-amber-200"
                    }`}
                  >
                    {warning.title}
                  </p>
                  <p className="mt-1 text-sm text-textSecondary">
                    {warning.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {warnings.length === 0 && (
          <div className="mb-6 rounded-[1.5rem] border border-emerald-400/30 bg-emerald-400/10 p-5">
            <p className="font-bold text-emerald-300">
              No health warnings detected.
            </p>
            <p className="mt-1 text-sm text-textSecondary">
              Current environment checks did not return critical or warning items.
            </p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {checks.map((check) => (
            <HealthCard key={check.title} check={check} />
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-gold" />
            <p className="font-display text-2xl font-bold text-textPrimary">
              Protected Admin Routes
            </p>
          </div>

          {adminRoutes.length === 0 ? (
            <p className="text-sm text-textSecondary">
              No admin route metadata was returned by the backend.
            </p>
          ) : (
            <div className="space-y-3">
              {adminRoutes.map((route) => (
                <div
                  key={`${route.method}-${route.path}`}
                  className="rounded-2xl border border-borderRoyal bg-royalBlack/70 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="font-mono text-sm font-bold text-goldLight">
                      {route.method} {route.path}
                    </p>

                    <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      Admin protected
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-textSecondary">
                    {route.purpose}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(route.protectedBy || []).map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-borderRoyal bg-black/30 px-3 py-1 text-xs font-bold text-textSecondary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-borderRoyal bg-black/30 p-4">
          <p className="text-sm font-bold text-textPrimary">
            Last health refresh
          </p>
          <p className="mt-1 text-sm text-textSecondary">
            {formatDate(health.generatedAt)}
          </p>
        </div>
      </div>
    </section>
  );
}

function HealthCard({ check }) {
  const isGood = Boolean(check.status);
  const isWarning = !isGood && check.warningWhenFalse;

  return (
    <div className="rounded-2xl border border-borderRoyal bg-black/30 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl font-bold text-textPrimary">
            {check.title}
          </p>
          <p
            className={`mt-2 text-sm font-bold ${
              isGood
                ? "text-emerald-300"
                : isWarning
                  ? "text-amber-200"
                  : "text-crimsonLight"
            }`}
          >
            {isGood ? check.goodText : check.badText}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isGood
                ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : isWarning
                  ? "border border-amber-400/30 bg-amber-400/10 text-amber-200"
                  : "border border-crimson/40 bg-crimson/10 text-crimsonLight"
            }`}
          >
            {isGood ? "OK" : isWarning ? "WARN" : "FIX"}
          </span>

          {check.safetyLabel && (
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                check.safetyLabel === "Production Ready"
                  ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : check.safetyLabel === "Development Only"
                    ? "border border-blue-400/30 bg-blue-400/10 text-blue-200"
                    : "border border-amber-400/30 bg-amber-400/10 text-amber-200"
              }`}
            >
              {check.safetyLabel}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {(check.details || []).map((detail) => (
          <p key={detail} className="text-sm text-textSecondary">
            {detail}
          </p>
        ))}
      </div>
    </div>
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
        <PanelHeader icon={<ShieldCheck />} title="Security Log Viewer" />

        {!logs || logs.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck />}
            title="No security logs yet"
            message="Security events such as login attempts, rate-limit hits, admin actions, and OTP events will appear here."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[980px] border-separate border-spacing-y-3">
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

function getPublicProfilePath(username) {
  const safeUsername = String(username || "").trim();

  if (!safeUsername) {
    return "";
  }

  return `/u/${encodeURIComponent(safeUsername)}`;
}

function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const text = String(value || "").trim();

  if (!text || text === "Hidden" || text === "Not available") {
    return null;
  }

  async function handleClick() {
    await copyToClipboard(text);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold transition ${
        copied
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-borderRoyal bg-black/30 text-textSecondary hover:border-gold hover:text-gold"
      }`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function PublicProfileLink({ username, label = "Open public profile" }) {
  const profilePath = getPublicProfilePath(username);

  if (!profilePath) {
    return null;
  }

  return (
    <a
      href={profilePath}
      target="_blank"
      rel="noreferrer"
      className="inline-flex w-fit rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-goldLight transition hover:bg-gold hover:text-black"
    >
      {label}
    </a>
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
  const text = String(value || "unknown").toLowerCase();

  const goodStatuses = ["paid", "settled", "succeeded", "complete", "completed"];
  const badStatuses = ["failed", "refunded", "canceled", "cancelled", "disputed", "chargeback"];
  const warningStatuses = ["pending", "created", "processing", "requires_action", "review"];

  let className = "border border-gold/30 bg-gold/10 text-goldLight";

  if (goodStatuses.includes(text)) {
    className = "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  } else if (badStatuses.includes(text)) {
    className = "border border-crimson/40 bg-crimson/10 text-crimsonLight";
  } else if (warningStatuses.includes(text)) {
    className = "border border-amber-400/30 bg-amber-400/10 text-amber-200";
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {text}
    </span>
  );
}

function EmptyState({ icon, title, message }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5 text-center sm:p-8">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-2xl text-gold">
        {icon}
      </div>

      <p className="font-display text-2xl font-bold text-textPrimary">
        {title}
      </p>

      <p className="mx-auto mt-3 max-w-xl text-textSecondary">
        {message}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-5 sm:p-6">
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
    <div className="mb-5 flex items-center gap-3 sm:mb-6">
      <div className="shrink-0 text-gold">{icon}</div>
      <h2 className="font-display text-xl font-bold text-textPrimary sm:text-2xl">
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
