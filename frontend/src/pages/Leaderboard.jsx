import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Copy,
  Crown,
  Filter,
  Globe2,
  HeartHandshake,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X
} from "lucide-react";
import api from "../api/client.js";
import MissionImpactFilter from "../components/MissionImpactFilter.jsx";
import PageHero from "../components/PageHero.jsx";
import PublicErrorBox from "../components/PublicErrorBox.jsx";
import PublicStateBox from "../components/PublicStateBox.jsx";
import RankBadge from "../components/RankBadge.jsx";
import { buildPublicFilterParams } from "../constants/legacyOptions.js";

const tabs = ["Global", "By Country", "This Month", "All Time"];

const rankPower = {
  Spark: 1,
  Citizen: 2,
  Merchant: 3,
  Knight: 4,
  Lord: 5,
  Baron: 6,
  Duke: 7,
  Sovereign: 8,
  "King/Queen": 9,
  Emperor: 10
};

const quickMissions = [
  "All Missions",
  "Human Survival",
  "Planet Protection",
  "Children & Education"
];

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function safeText(value, fallback = "Not available yet") {
  const text = String(value || "").trim();
  return text || fallback;
}

function getProfilePath(username) {
  const cleanUsername = String(username || "").trim();
  return cleanUsername && cleanUsername !== "unknown" ? `/u/${cleanUsername}` : "";
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Global");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("highest");
  const [missionFilter, setMissionFilter] = useState("All Missions");
  const [impactFilter, setImpactFilter] = useState("All Impacts");
  const [leaderboard, setLeaderboard] = useState([]);
  const [countryStats, setCountryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const params = buildPublicFilterParams(missionFilter, impactFilter);

        const [leaderboardResponse, countriesResponse] = await Promise.all([
          api.get("/public/leaderboard", { params }),
          api.get("/public/leaderboard/countries", { params })
        ]);

        setLeaderboard(leaderboardResponse.data.leaderboard || []);
        setCountryStats(countriesResponse.data.countries || []);
      } catch (error) {
        console.error("Could not load leaderboard", error);

        setLeaderboard([]);
        setCountryStats([]);
        setErrorMessage(
          error.response?.data?.message ||
            "Could not load leaderboard. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [missionFilter, impactFilter]);

  const visibleDonors = useMemo(() => {
    let list = [...leaderboard];

    if (activeTab === "This Month") {
      list = list.filter((donor) => !donor.isEmperor);
    }

    const searchedList = list.filter((donor) => {
        const query = search.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return (
          donor.name?.toLowerCase().includes(query) ||
          donor.username?.toLowerCase().includes(query) ||
          donor.country?.toLowerCase().includes(query) ||
          donor.rank?.toLowerCase().includes(query) ||
          donor.causeCategory?.toLowerCase().includes(query) ||
          donor.causeImpact?.toLowerCase().includes(query) ||
          donor.cause?.toLowerCase().includes(query)
        );
      });

    return searchedList.sort((a, b) => {
      if (sortBy === "rank") {
        const rankDifference =
          Number(rankPower[b.rank] || 0) - Number(rankPower[a.rank] || 0);

        if (rankDifference !== 0) {
          return rankDifference;
        }

        return Number(b.amountUSD || 0) - Number(a.amountUSD || 0);
      }

      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      if (sortBy === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      return Number(b.amountUSD || 0) - Number(a.amountUSD || 0);
    });
  }, [activeTab, search, sortBy, leaderboard]);

  const leaderboardStats = useMemo(() => {
    const totalDonated = visibleDonors.reduce(
      (sum, donor) => sum + Number(donor.amountUSD || 0),
      0
    );

    const countries = new Set(
      visibleDonors.map((donor) => donor.country).filter(Boolean)
    );

    const missions = new Set(
      visibleDonors.map((donor) => donor.causeCategory).filter(Boolean)
    );

    return {
      totalDonated,
      donors: visibleDonors.length,
      countries: countries.size,
      missions: missions.size
    };
  }, [visibleDonors]);

  const activeFilters = [
    search ? `Search: ${search}` : "",
    sortBy !== "highest" ? `Sort: ${sortBy}` : "",
    missionFilter !== "All Missions" ? `Mission: ${missionFilter}` : "",
    impactFilter !== "All Impacts" ? `Impact: ${impactFilter}` : ""
  ].filter(Boolean);

  const hasFilters = activeFilters.length > 0;
  const currentLeader = visibleDonors[0] || leaderboard[0] || null;
  const currentLeaderName = currentLeader?.name || "Loading...";
  const podium = visibleDonors.slice(0, 3);
  const rest = visibleDonors.slice(3);

  function clearFilters() {
    setSearch("");
    setSortBy("highest");
    setMissionFilter("All Missions");
    setImpactFilter("All Impacts");
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <PageHero
        eyebrow="Leaderboard"
        title="The Earth Rankings"
        description="Track top donors, countries, missions, and all-time legacy rankings across One Earth Legacy."
        rightLabel="Current leader"
        rightValue={currentLeaderName}
      />

      <section className="mb-8 grid gap-5 md:grid-cols-4">
        <LeaderboardStat
          icon={<Trophy />}
          label="Visible donors"
          value={leaderboardStats.donors.toLocaleString()}
          subtext={`${leaderboard.length.toLocaleString()} loaded`}
        />

        <LeaderboardStat
          icon={<HeartHandshake />}
          label="Visible donated"
          value={money(leaderboardStats.totalDonated)}
          subtext="Current tab and filters"
        />

        <LeaderboardStat
          icon={<Globe2 />}
          label="Countries"
          value={leaderboardStats.countries.toLocaleString()}
          subtext="Public country-level data"
        />

        <LeaderboardStat
          icon={<Sparkles />}
          label="Missions"
          value={leaderboardStats.missions.toLocaleString()}
          subtext="Visible mission spread"
        />
      </section>

      <section className="mb-8 rounded-[2rem] border border-borderRoyal bg-royalPanel p-5">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-gold/30 bg-gold/10 p-3">
              <Filter className="h-5 w-5 text-gold" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-textPrimary">
                Explore rankings
              </h2>
              <p className="text-sm text-textSecondary">
                Filter by mission, impact, search, or country rankings.
              </p>
            </div>
          </div>

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

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                  activeTab === tab
                    ? "bg-gold text-black"
                    : "border border-borderRoyal bg-black/30 text-textSecondary hover:border-gold hover:text-gold"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 xl:flex-row">
            <MissionImpactFilter
              missionFilter={missionFilter}
              setMissionFilter={setMissionFilter}
              impactFilter={impactFilter}
              setImpactFilter={setImpactFilter}
              layout="inline"
            />

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold md:w-56"
            >
              <option value="highest" className="bg-royalBlack">
                Highest Donation
              </option>
              <option value="rank" className="bg-royalBlack">
                Highest Rank
              </option>
              <option value="newest" className="bg-royalBlack">
                Newest Donors
              </option>
              <option value="name" className="bg-royalBlack">
                Donor Name A-Z
              </option>
            </select>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textSecondary" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search donor, country, rank, mission..."
                className="w-full rounded-2xl border border-borderRoyal bg-black/40 py-4 pl-12 pr-4 text-textPrimary outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-borderRoyal bg-black/25 p-4">
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

      {!loading && (
        <section className="mb-5 rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-textPrimary">
                Showing {leaderboardStats.donors.toLocaleString()} ranked donor
                {leaderboardStats.donors === 1 ? "" : "s"} in {activeTab}
              </p>

              <p className="mt-1 text-sm text-textSecondary">
                Current leader:{" "}
                <span className="font-bold text-gold">
                  {safeText(currentLeaderName, "Loading...")}
                </span>
                {" "}· Sorted by{" "}
                <span className="font-bold text-gold">
                  {sortBy === "highest"
                    ? "Highest Donation"
                    : sortBy === "rank"
                      ? "Highest Rank"
                      : sortBy === "newest"
                        ? "Newest Donors"
                        : "Donor Name A-Z"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em]">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
                {money(leaderboardStats.totalDonated)}
              </span>

              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
                {leaderboardStats.countries} countries
              </span>

              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
                {leaderboardStats.missions} missions
              </span>
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <PublicStateBox message="Loading leaderboard from backend..." />
      ) : activeTab === "By Country" ? (
        <CountryLeaderboard countryStats={countryStats} errorMessage={errorMessage} />
      ) : visibleDonors.length > 0 ? (
        <>
          {currentLeader && (
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-gold/30 bg-royalCard shadow-gold">
              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="bg-gradient-to-br from-gold/20 via-black/20 to-transparent p-7">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-gold">
                      Current Leader
                    </span>

                    <RankBadge rank={currentLeader.rank || "Spark"} />
                  </div>

                  <h2 className="font-display text-4xl font-bold text-textPrimary md:text-5xl">
                    {safeText(currentLeader.name, "Anonymous Donor")}
                  </h2>

                  <p className="mt-3 text-textSecondary">
                    {currentLeader.flag || "🌍"} {safeText(currentLeader.country, "Global")}
                  </p>

                  {getProfilePath(currentLeader.username) && (
                    <Link
                      to={getProfilePath(currentLeader.username)}
                      className="mt-4 inline-flex items-center gap-2 font-bold text-gold hover:text-goldLight"
                    >
                      View @{currentLeader.username}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}

                  <p className="mt-6 max-w-3xl rounded-2xl border border-borderRoyal bg-black/25 p-5 text-lg text-textSecondary">
                    “{safeText(currentLeader.message, "A public legacy ranking has been earned.")}”
                  </p>
                </div>

                <div className="border-t border-borderRoyal bg-black/25 p-7 lg:border-l lg:border-t-0">
                  <p className="text-sm uppercase tracking-[0.3em] text-textSecondary">
                    Public Contribution
                  </p>

                  <p className="mt-3 font-numbers text-5xl font-bold text-goldLight">
                    {money(currentLeader.amountUSD)}
                  </p>

                  <p className="mt-2 text-sm text-textSecondary">
                    {activeTab === "This Month" ? "Monthly view" : "Total donated"}
                  </p>

                  <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/10 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-goldLight">
                      {safeText(currentLeader.causeCategory, "Mission Pending")}
                    </p>

                    <p className="mt-2 text-textSecondary">
                      {safeText(currentLeader.causeImpact || currentLeader.cause, "Impact Pending")}
                    </p>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-borderRoyal bg-black/25 p-4">
                    <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-gold" />
                    <div>
                      <p className="font-bold text-textPrimary">
                        Privacy-safe public ranking
                      </p>
                      <p className="mt-1 text-xs text-textSecondary">
                        Leaderboard shows donor name, rank, mission, and country only.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="mb-8 grid gap-5 lg:grid-cols-3">
            {podium.map((donor, index) => (
              <PodiumCard
                key={donor.id}
                donor={donor}
                position={index + 1}
                activeTab={activeTab}
              />
            ))}
          </section>

          <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-5">
            <div className="mb-4 flex flex-col gap-2 px-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-gold" />
                <h2 className="font-display text-2xl font-bold">Ranked List</h2>
              </div>

              <p className="text-sm text-textSecondary">
                Showing {visibleDonors.length.toLocaleString()} ranked donor
                {visibleDonors.length === 1 ? "" : "s"}
              </p>
            </div>

            {rest.length > 0 ? (
              <div className="space-y-3">
                {rest.map((donor, index) => (
                  <RankRow
                    key={donor.id}
                    donor={donor}
                    position={index + 4}
                  />
                ))}
              </div>
            ) : (
              <PublicStateBox message="Only podium donors are visible for this search or filter." />
            )}
          </section>

          <section className="mt-8 rounded-[2rem] border border-borderRoyal bg-royalPanel p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-full border border-gold/30 bg-gold/10 p-3">
                <ShieldCheck className="h-5 w-5 text-gold" />
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gold">
                  Leaderboard QA Checklist
                </p>

                <h2 className="mt-1 font-display text-3xl font-bold text-textPrimary">
                  Before production launch
                </h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                "Global, This Month, and All Time donor views load correctly",
                "By Country tab loads country leaderboard data",
                "Search works for donor, username, country, rank, and mission",
                "Mission and impact filters update backend results",
                "Quick mission shortcuts reset impact to All Impacts",
                "Profile links open /u/:username",
                "Copy Link creates a shareable /u/:username URL",
                "No private address or exact private coordinates are shown"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-borderRoyal bg-black/25 p-4 text-sm text-textSecondary"
                >
                  <span className="mr-2 text-gold">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-gold/25 bg-gold/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-goldLight">
                  Your current rank
                </p>

                <div className="mt-3">
                  <RankBadge rank="Spark" size="lg" />
                </div>

                <p className="mt-3 text-textSecondary">
                  After your first confirmed donation, your real rank will appear here permanently.
                </p>
              </div>

              <Link
                to="/donate"
                className="rounded-full bg-gold px-6 py-3 text-center font-bold text-black shadow-gold hover:bg-goldLight"
              >
                Make First Donation
              </Link>
            </div>
          </section>
        </>
      ) : (
        <PublicStateBox
          message={
            errorMessage
              ? "Fix the filter issue above and try again."
              : "No donors found for this mission, impact, or search."
          }
        />
      )}
    </main>
  );
}

function LeaderboardStat({ icon, label, value, subtext }) {
  return (
    <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
        {icon}
      </div>

      <p className="text-sm uppercase tracking-[0.25em] text-textSecondary">
        {label}
      </p>

      <p className="mt-2 font-display text-3xl font-bold text-textPrimary">
        {value}
      </p>

      <p className="mt-2 text-sm text-textSecondary">{subtext}</p>
    </div>
  );
}

function PodiumCard({ donor, position, activeTab }) {
  const [copied, setCopied] = useState(false);
  const label = position === 1 ? "Gold" : position === 2 ? "Silver" : "Bronze";
  const value = Number(donor.amountUSD || 0);
  const profilePath = getProfilePath(donor.username);

  async function copyProfileLink() {
    if (!profilePath) {
      return;
    }

    const url = `${window.location.origin}${profilePath}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Could not copy leaderboard profile link", error);
      alert(url);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: position * 0.08 }}
      className={`rounded-[2rem] border bg-royalCard p-6 ${
        position === 1 ? "border-gold/60 shadow-gold lg:-mt-4" : "border-borderRoyal"
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
          {position === 1 ? <Crown className="h-7 w-7" /> : <Medal className="h-7 w-7" />}
        </div>

        <div className="rounded-full border border-borderRoyal bg-black/30 px-4 py-2 text-sm text-textSecondary">
          #{position} {label}
        </div>
      </div>

      <p className="text-3xl">{donor.flag || "🌍"}</p>

      <h2 className="mt-4 font-display text-3xl font-bold text-textPrimary">
        {safeText(donor.name, "Anonymous Donor")}
      </h2>

      <p className="mt-2 text-textSecondary">
        {safeText(donor.country, "Global")}
      </p>

      {profilePath && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Link
            to={profilePath}
            className="inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-goldLight"
          >
            View @{donor.username}
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={copyProfileLink}
            className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-3 py-1 text-xs font-bold text-gold hover:bg-gold/10"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      )}

      <div className="mt-4">
        <RankBadge rank={donor.rank || "Spark"} size="md" />
      </div>

      <p className="mt-5 font-numbers text-4xl font-bold text-goldLight">
        {money(value)}
      </p>

      <p className="mt-1 text-sm text-textSecondary">
        {activeTab === "This Month" ? "Backend monthly view" : "Total donated"}
      </p>

      <div className="mt-5 rounded-2xl border border-borderRoyal bg-black/30 p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">
          Mission
        </p>

        <p className="mt-2 font-bold text-textPrimary">
          {safeText(donor.causeCategory, "Mission Pending")}
        </p>

        <p className="mt-1 text-sm text-textSecondary">
          {safeText(donor.causeImpact || donor.cause, "Impact Pending")}
        </p>
      </div>
    </motion.article>
  );
}

function RankRow({ donor, position }) {
  const [copied, setCopied] = useState(false);
  const value = Number(donor.amountUSD || 0);
  const profilePath = getProfilePath(donor.username);

  async function copyProfileLink() {
    if (!profilePath) {
      return;
    }

    const url = `${window.location.origin}${profilePath}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Could not copy leaderboard row profile link", error);
      alert(url);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 rounded-[1.25rem] border border-borderRoyal bg-black/30 p-4 md:grid-cols-[80px_1fr_160px_220px_160px]"
    >
      <div className="flex items-center">
        <span className="font-numbers text-2xl font-bold text-goldLight">
          #{position}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-3xl">{donor.flag || "🌍"}</span>

        <div>
          <p className="font-bold text-textPrimary">
            {safeText(donor.name, "Anonymous Donor")}
          </p>

          <p className="text-sm text-textSecondary">
            {safeText(donor.country, "Global")}
          </p>

          {profilePath && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Link
                to={profilePath}
                className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-goldLight"
              >
                @{donor.username}
                <ArrowRight className="h-3 w-3" />
              </Link>

              <button
                type="button"
                onClick={copyProfileLink}
                className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2 py-1 text-[11px] font-bold text-gold hover:bg-gold/10"
              >
                <Copy className="h-3 w-3" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <RankBadge rank={donor.rank || "Spark"} />
      </div>

      <div className="flex items-center">
        <div>
          <p className="text-sm font-bold text-textPrimary">
            {safeText(donor.causeCategory, "Mission Pending")}
          </p>
          <p className="text-xs text-textSecondary">
            {safeText(donor.causeImpact || donor.cause, "Impact Pending")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-start md:justify-end">
        <p className="font-numbers text-2xl font-bold text-textPrimary">
          {money(value)}
        </p>
      </div>
    </motion.div>
  );
}

function CountryLeaderboard({ countryStats, errorMessage }) {
  const maxTotal = Math.max(...countryStats.map((item) => item.totalDonated || 0), 1);
  const totalDonated = countryStats.reduce(
    (sum, item) => sum + Number(item.totalDonated || 0),
    0
  );
  const totalDonors = countryStats.reduce(
    (sum, item) => sum + Number(item.donors || item.donorCount || 0),
    0
  );

  if (countryStats.length === 0) {
    return (
      <PublicStateBox
        message={
          errorMessage
            ? "Fix the filter issue above and try again."
            : "No country data found for this mission or impact."
        }
      />
    );
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Globe2 className="h-6 w-6 text-gold" />
            <h2 className="font-display text-2xl font-bold">Country Rankings</h2>
          </div>

          <p className="text-sm text-textSecondary">
            {countryStats.length} public location group
            {countryStats.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-4">
          {countryStats.map((item, index) => (
            <motion.div
              key={`${item.countryCode}-${item.locationLabel || item.country}-${index}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-[1.25rem] border border-borderRoyal bg-black/30 p-5"
            >
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-numbers text-xl font-bold text-goldLight">
                    #{index + 1}
                  </span>

                  <span className="text-3xl">{item.flag || "🌍"}</span>

                  <div>
                    <p className="font-bold text-textPrimary">
                      {item.locationLabel || item.country}
                    </p>
                    <p className="text-sm text-textSecondary">
                      {item.donors || item.donorCount || 0} donors · Top donor: {safeText(item.topDonor, "Pending")}
                    </p>
                    <p className="mt-1 text-xs text-textSecondary">
                      {safeText(item.causeCategory || item.mission || item.topMission, "Mission Pending")}
                    </p>
                  </div>
                </div>

                <p className="font-numbers text-2xl font-bold text-goldLight">
                  {money(item.totalDonated || item.totalAmount)}
                </p>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-royalBlack">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{
                    width: `${Math.max(7, (Number(item.totalDonated || 0) / maxTotal) * 100)}%`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <aside className="rounded-[2rem] border border-gold/25 bg-gold/10 p-6 shadow-gold">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-goldLight">
          Country Impact
        </p>

        <h2 className="font-display text-3xl font-bold text-textPrimary">
          Public location leaderboard
        </h2>

        <p className="mt-4 text-textSecondary">
          This view uses the backend country leaderboard API and only displays city/country-level public donor data.
        </p>

        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl border border-borderRoyal bg-black/30 p-4">
            <p className="text-sm text-textSecondary">Total country impact</p>
            <p className="mt-2 font-numbers text-3xl font-bold text-goldLight">
              {money(totalDonated)}
            </p>
          </div>

          <div className="rounded-2xl border border-borderRoyal bg-black/30 p-4">
            <p className="text-sm text-textSecondary">Public donors counted</p>
            <p className="mt-2 font-numbers text-3xl font-bold text-goldLight">
              {totalDonors.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {countryStats.slice(0, 9).map((item, index) => (
            <div
              key={`${item.countryCode}-${index}`}
              className="rounded-2xl border border-borderRoyal bg-black/30 p-4 text-center"
            >
              <p className="text-3xl">{item.flag || "🌍"}</p>
              <p className="mt-2 line-clamp-1 text-xs text-textSecondary">
                {item.city || item.country}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-borderRoyal bg-black/25 p-4">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-gold" />
          <p className="text-sm text-textSecondary">
            No street address is shown. Coordinates are city/country-level only.
          </p>
        </div>
      </aside>
    </section>
  );
}
