import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Globe2, Medal, Search, Trophy } from "lucide-react";
import api from "../api/client.js";
import MissionImpactFilter from "../components/MissionImpactFilter.jsx";
import PublicErrorBox from "../components/PublicErrorBox.jsx";
import PublicStateBox from "../components/PublicStateBox.jsx";
import RankBadge from "../components/RankBadge.jsx";
import { buildPublicFilterParams } from "../constants/legacyOptions.js";

const tabs = ["Global", "By Country", "This Month", "All Time"];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Global");
  const [search, setSearch] = useState("");
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

    return list
      .sort((a, b) => Number(b.amountUSD || 0) - Number(a.amountUSD || 0))
      .filter((donor) => {
        const query = search.toLowerCase();

        return (
          donor.name?.toLowerCase().includes(query) ||
          donor.country?.toLowerCase().includes(query) ||
          donor.rank?.toLowerCase().includes(query) ||
          donor.causeCategory?.toLowerCase().includes(query) ||
          donor.causeImpact?.toLowerCase().includes(query) ||
          donor.cause?.toLowerCase().includes(query)
        );
      });
  }, [activeTab, search, leaderboard]);

  const podium = visibleDonors.slice(0, 3);
  const rest = visibleDonors.slice(3);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              Leaderboard
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              The Earth Rankings
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              Track the highest donors, strongest countries, monthly leaders, all-time legends,
              and mission-based support across One Earth Legacy.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
            <p className="text-sm text-goldLight">Current leader</p>
            <p className="font-display text-3xl font-bold text-textPrimary">
              {visibleDonors[0]?.name || leaderboard[0]?.name || "Loading..."}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
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

          <div className="flex flex-col gap-3 xl:flex-row">
            <MissionImpactFilter
              missionFilter={missionFilter}
              setMissionFilter={setMissionFilter}
              impactFilter={impactFilter}
              setImpactFilter={setImpactFilter}
              layout="inline"
            />

            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textSecondary" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rankings..."
                className="w-full rounded-2xl border border-borderRoyal bg-black/40 py-4 pl-12 pr-4 text-textPrimary outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>
      </section>

      {errorMessage && <PublicErrorBox message={errorMessage} />}

      {loading ? (
        <PublicStateBox message="Loading leaderboard from backend..." />
      ) : activeTab === "By Country" ? (
        <CountryLeaderboard countryStats={countryStats} errorMessage={errorMessage} />
      ) : visibleDonors.length > 0 ? (
        <>
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
            <div className="mb-4 flex items-center gap-3 px-2">
              <Trophy className="h-5 w-5 text-gold" />
              <h2 className="font-display text-2xl font-bold">Ranked List</h2>
            </div>

            <div className="space-y-3">
              {rest.map((donor, index) => (
                <RankRow
                  key={donor.id}
                  donor={donor}
                  position={index + 4}
                />
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

              <a
                href="/donate"
                className="rounded-full bg-gold px-6 py-3 text-center font-bold text-black shadow-gold hover:bg-goldLight"
              >
                Make First Donation
              </a>
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

function PodiumCard({ donor, position, activeTab }) {
  const label = position === 1 ? "Gold" : position === 2 ? "Silver" : "Bronze";
  const value = Number(donor.amountUSD || 0);

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

      <p className="text-3xl">{donor.flag}</p>

      <h2 className="mt-4 font-display text-3xl font-bold text-textPrimary">
        {donor.name}
      </h2>

      <p className="mt-2 text-textSecondary">
        {donor.country}
      </p>

      <div className="mt-4">
        <RankBadge rank={donor.rank} size="md" />
      </div>

      <p className="mt-5 font-numbers text-4xl font-bold text-goldLight">
        ${value.toLocaleString()}
      </p>

      <p className="mt-1 text-sm text-textSecondary">
        {activeTab === "This Month" ? "Backend monthly total" : "Total donated"}
      </p>

      <div className="mt-5 rounded-2xl border border-borderRoyal bg-black/30 p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">
          Mission
        </p>
        <p className="mt-2 font-bold text-textPrimary">
          {donor.causeCategory || "Mission Pending"}
        </p>
        <p className="mt-1 text-sm text-textSecondary">
          {donor.causeImpact || donor.cause || "Impact Pending"}
        </p>
      </div>
    </motion.article>
  );
}

function RankRow({ donor, position }) {
  const value = Number(donor.amountUSD || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 rounded-[1.25rem] border border-borderRoyal bg-black/30 p-4 md:grid-cols-[80px_1fr_180px_220px_180px]"
    >
      <div className="flex items-center">
        <span className="font-numbers text-2xl font-bold text-goldLight">
          #{position}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-3xl">{donor.flag}</span>
        <div>
          <p className="font-bold text-textPrimary">{donor.name}</p>
          <p className="text-sm text-textSecondary">{donor.country}</p>
        </div>
      </div>

      <div className="flex items-center">
        <RankBadge rank={donor.rank} />
      </div>

      <div className="flex items-center">
        <div>
          <p className="text-sm font-bold text-textPrimary">
            {donor.causeCategory || "Mission Pending"}
          </p>
          <p className="text-xs text-textSecondary">
            {donor.causeImpact || "Impact Pending"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-start md:justify-end">
        <p className="font-numbers text-2xl font-bold text-textPrimary">
          ${value.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

function CountryLeaderboard({ countryStats, errorMessage }) {
  const maxTotal = Math.max(...countryStats.map((item) => item.totalDonated || 0), 1);

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
        <div className="mb-6 flex items-center gap-3">
          <Globe2 className="h-6 w-6 text-gold" />
          <h2 className="font-display text-2xl font-bold">Country Rankings</h2>
        </div>

        <div className="space-y-4">
          {countryStats.map((item, index) => (
            <motion.div
              key={item.countryCode}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-[1.25rem] border border-borderRoyal bg-black/30 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-numbers text-xl font-bold text-goldLight">
                    #{index + 1}
                  </span>
                  <span className="text-3xl">{item.flag}</span>
                  <div>
                    <p className="font-bold text-textPrimary">{item.country}</p>
                    <p className="text-sm text-textSecondary">
                      {item.donors} donors · Top donor: {item.topDonor}
                    </p>
                  </div>
                </div>

                <p className="font-numbers text-2xl font-bold text-goldLight">
                  ${Number(item.totalDonated || 0).toLocaleString()}
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
          Backend Connected
        </p>

        <h2 className="font-display text-3xl font-bold text-textPrimary">
          Country Data API
        </h2>

        <p className="mt-4 text-textSecondary">
          This country leaderboard is loaded from the backend route:
          /api/public/leaderboard/countries and follows the selected mission and impact filters.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {countryStats.slice(0, 9).map((item) => (
            <div
              key={item.countryCode}
              className="rounded-2xl border border-borderRoyal bg-black/30 p-4 text-center"
            >
              <p className="text-3xl">{item.flag}</p>
              <p className="mt-2 text-xs text-textSecondary">{item.country}</p>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}