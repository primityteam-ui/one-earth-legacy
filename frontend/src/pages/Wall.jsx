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
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  X
} from "lucide-react";
import api from "../api/client.js";
import MissionImpactFilter from "../components/MissionImpactFilter.jsx";
import PageHero from "../components/PageHero.jsx";
import PublicErrorBox from "../components/PublicErrorBox.jsx";
import PublicStateBox from "../components/PublicStateBox.jsx";
import RankBadge from "../components/RankBadge.jsx";
import { buildPublicFilterParams } from "../constants/legacyOptions.js";

const ranks = [
  "All",
  "Spark",
  "Citizen",
  "Merchant",
  "Knight",
  "Lord",
  "Baron",
  "Duke",
  "Sovereign",
  "King/Queen",
  "Emperor"
];

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

function money(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function safeText(value, fallback = "Not available yet") {
  const text = String(value || "").trim();
  return text || fallback;
}

function getTileLocation(tile) {
  if (tile.locationLabel) {
    return tile.locationLabel;
  }

  const city = safeText(tile.city, "");
  const region = safeText(tile.region, "");
  const country = safeText(tile.country, "");

  const parts = [city, region, country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Global";
}

function getUniqueCountries(tiles) {
  const countries = new Set();

  for (const tile of tiles) {
    if (tile.country) {
      countries.add(tile.country);
    }
  }

  return ["All", ...Array.from(countries).sort()];
}

export default function Wall() {
  const [tiles, setTiles] = useState([]);
  const [search, setSearch] = useState("");
  const [rank, setRank] = useState("All");
  const [country, setCountry] = useState("All");
  const [sortBy, setSortBy] = useState("highest");
  const [missionFilter, setMissionFilter] = useState("All Missions");
  const [impactFilter, setImpactFilter] = useState("All Impacts");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTiles() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await api.get("/public/tiles", {
          params: buildPublicFilterParams(missionFilter, impactFilter)
        });

        setTiles(response.data.tiles || []);
      } catch (error) {
        console.error("Could not load tiles", error);

        setTiles([]);
        setErrorMessage(
          error.response?.data?.message ||
            "Could not load wall tiles. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTiles();
  }, [missionFilter, impactFilter]);

  const countries = useMemo(() => getUniqueCountries(tiles), [tiles]);

  const filteredTiles = useMemo(() => {
    const visibleTiles = tiles.filter((tile) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        tile.name?.toLowerCase().includes(query) ||
        tile.message?.toLowerCase().includes(query) ||
        tile.username?.toLowerCase().includes(query) ||
        tile.country?.toLowerCase().includes(query) ||
        tile.city?.toLowerCase().includes(query) ||
        tile.region?.toLowerCase().includes(query) ||
        tile.locationLabel?.toLowerCase().includes(query) ||
        tile.causeCategory?.toLowerCase().includes(query) ||
        tile.causeImpact?.toLowerCase().includes(query) ||
        tile.cause?.toLowerCase().includes(query);

      const matchesRank = rank === "All" || tile.rank === rank;
      const matchesCountry = country === "All" || tile.country === country;

      return matchesSearch && matchesRank && matchesCountry;
    });

    return [...visibleTiles].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      if (sortBy === "name") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "rank") {
        return Number(rankPower[b.rank] || 0) - Number(rankPower[a.rank] || 0);
      }

      return Number(b.amountUSD || 0) - Number(a.amountUSD || 0);
    });
  }, [tiles, search, rank, country, sortBy]);

  const featuredTile = useMemo(() => {
    return [...filteredTiles].sort(
      (a, b) => Number(b.amountUSD || 0) - Number(a.amountUSD || 0)
    )[0];
  }, [filteredTiles]);

  const wallStats = useMemo(() => {
    const totalDonated = filteredTiles.reduce(
      (sum, tile) => sum + Number(tile.amountUSD || 0),
      0
    );

    const visibleCountries = new Set(
      filteredTiles.map((tile) => tile.country).filter(Boolean)
    );

    const visibleMissions = new Set(
      filteredTiles.map((tile) => tile.causeCategory).filter(Boolean)
    );

    return {
      totalDonated,
      countries: visibleCountries.size,
      missions: visibleMissions.size
    };
  }, [filteredTiles]);

  const activeFilters = [
    search ? `Search: ${search}` : "",
    rank !== "All" ? `Rank: ${rank}` : "",
    country !== "All" ? `Country: ${country}` : "",
    sortBy !== "highest" ? `Sort: ${sortBy}` : "",
    missionFilter !== "All Missions" ? `Mission: ${missionFilter}` : "",
    impactFilter !== "All Impacts" ? `Impact: ${impactFilter}` : ""
  ].filter(Boolean);

  const hasFilters = activeFilters.length > 0;

  function clearFilters() {
    setSearch("");
    setRank("All");
    setCountry("All");
    setSortBy("highest");
    setMissionFilter("All Missions");
    setImpactFilter("All Impacts");
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <PageHero
        eyebrow="The Wall"
        title="The Legacy Wall"
        description="A public, privacy-safe wall of donor legacy tiles. Every tile shows city/country level impact only, never private address data."
        rightLabel="Visible tiles"
        rightValue={filteredTiles.length}
      />

      <section className="mb-8 grid gap-5 md:grid-cols-3">
        <WallStat
          icon={<Sparkles />}
          label="Visible legacy tiles"
          value={filteredTiles.length.toLocaleString()}
          subtext={`${tiles.length.toLocaleString()} loaded from backend`}
        />

        <WallStat
          icon={<HeartHandshake />}
          label="Visible donations"
          value={money(wallStats.totalDonated)}
          subtext="Based on current filters"
        />

        <WallStat
          icon={<Globe2 />}
          label="Countries / Missions"
          value={`${wallStats.countries} / ${wallStats.missions}`}
          subtext="Public location and mission spread"
        />
      </section>

      <section className="mb-8 rounded-[2rem] border border-borderRoyal bg-royalPanel p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-gold/30 bg-gold/10 p-3">
              <Filter className="h-5 w-5 text-gold" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-textPrimary">
                Find a legacy tile
              </h2>
              <p className="text-sm text-textSecondary">
                Search by donor, message, city, country, mission, impact, or rank.
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

        <div className="grid gap-4 lg:grid-cols-[1fr_180px_220px_220px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textSecondary" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search donor, message, city, mission, or impact..."
              className="w-full rounded-2xl border border-borderRoyal bg-black/40 py-4 pl-12 pr-4 text-textPrimary outline-none focus:border-gold"
            />
          </div>

          <select
            value={rank}
            onChange={(event) => setRank(event.target.value)}
            className="rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
          >
            {ranks.map((item) => (
              <option key={item} value={item} className="bg-royalBlack">
                {item === "All" ? "All Ranks" : `${item} Rank`}
              </option>
            ))}
          </select>

          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
          >
            {countries.map((item) => (
              <option key={item} value={item} className="bg-royalBlack">
                {item === "All" ? "All Countries" : item}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
          >
            <option value="highest" className="bg-royalBlack">
              Highest Donation
            </option>
            <option value="newest" className="bg-royalBlack">
              Newest Tiles
            </option>
            <option value="rank" className="bg-royalBlack">
              Highest Rank
            </option>
            <option value="name" className="bg-royalBlack">
              Donor Name A-Z
            </option>
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

      {!loading && featuredTile && (
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-gold/30 bg-royalCard shadow-gold">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-gradient-to-br from-gold/20 via-black/20 to-transparent p-7">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-gold">
                  Featured Legacy
                </span>

                <RankBadge rank={featuredTile.rank || "Spark"} />
              </div>

              <h2 className="font-display text-4xl font-bold text-textPrimary md:text-5xl">
                {safeText(featuredTile.name, "Anonymous Donor")}
              </h2>

              {featuredTile.username && featuredTile.username !== "unknown" && (
                <Link
                  to={`/u/${featuredTile.username}`}
                  className="mt-3 inline-flex items-center gap-2 font-bold text-gold hover:text-goldLight"
                >
                  View @{featuredTile.username}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <p className="mt-6 max-w-3xl rounded-2xl border border-borderRoyal bg-black/25 p-5 text-lg text-textSecondary">
                “{safeText(featuredTile.message, "A public legacy tile was created.")}”
              </p>
            </div>

            <div className="border-t border-borderRoyal bg-black/25 p-7 lg:border-l lg:border-t-0">
              <p className="text-sm uppercase tracking-[0.3em] text-textSecondary">
                Public Impact
              </p>

              <p className="mt-3 font-numbers text-5xl font-bold text-goldLight">
                {money(featuredTile.amountUSD)}
              </p>

              <p className="mt-2 text-sm text-textSecondary">Total donated</p>

              <div className="mt-6 rounded-2xl border border-gold/20 bg-gold/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-goldLight">
                  {safeText(featuredTile.causeCategory, "Mission Pending")}
                </p>

                <p className="mt-2 text-textSecondary">
                  {safeText(featuredTile.causeImpact || featuredTile.cause, "Impact Pending")}
                </p>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-borderRoyal bg-black/25 p-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-bold text-textPrimary">
                    {featuredTile.flag || "🌍"} {getTileLocation(featuredTile)}
                  </p>
                  <p className="mt-1 text-xs text-textSecondary">
                    City/country display only. No private address is shown.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && (
        <section className="mb-5 rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-textPrimary">
                Showing {filteredTiles.length.toLocaleString()} of {tiles.length.toLocaleString()} legacy tiles
              </p>

              <p className="mt-1 text-sm text-textSecondary">
                Sorted by{" "}
                <span className="font-bold text-gold">
                  {sortBy === "highest"
                    ? "Highest Donation"
                    : sortBy === "newest"
                      ? "Newest Tiles"
                      : sortBy === "rank"
                        ? "Highest Rank"
                        : "Donor Name A-Z"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em]">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
                {wallStats.countries} countries
              </span>

              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
                {wallStats.missions} missions
              </span>

              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">
                {money(wallStats.totalDonated)}
              </span>
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <PublicStateBox message="Loading wall tiles from backend..." />
      ) : (
        <section className="grid auto-rows-[minmax(250px,auto)] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredTiles.map((tile, index) => (
            <DonorTile key={tile.id || `${tile.username}-${index}`} tile={tile} index={index} />
          ))}
        </section>
      )}

      {!loading && filteredTiles.length === 0 && (
        <div className="mt-10">
          <PublicStateBox
            title="No tiles found"
            message={
              errorMessage
                ? "Fix the filter issue above and try again."
                : "Try another search, rank, country, mission, or exact impact filter."
            }
          />
        </div>
      )}

      <section className="mt-10 rounded-[2rem] border border-gold/25 bg-gold/10 p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-goldLight">
              Add your name to the wall
            </p>

            <h2 className="font-display text-3xl font-bold text-textPrimary">
              Create your own legacy tile
            </h2>

            <p className="mt-2 text-textSecondary">
              Choose a mission, write your message, and claim a public donor profile.
            </p>
          </div>

          <Link
            to="/donate"
            className="rounded-full bg-gold px-6 py-3 text-center font-bold text-black shadow-gold hover:bg-goldLight"
          >
            Claim Your Tile
          </Link>
        </div>
      </section>
    </main>
  );
}

function WallStat({ icon, label, value, subtext }) {
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

function DonorTile({ tile, index }) {
  const [copied, setCopied] = useState(false);
  const isEmperor = tile.isEmperor || tile.rank === "Emperor";
  const isLarge = isEmperor || Number(tile.amountUSD || 0) >= 20000;
  const isMedium = !isLarge && Number(tile.amountUSD || 0) >= 1000;

  const sizeClass = isLarge
    ? "md:col-span-2 xl:col-span-2 border-gold/60 shadow-gold"
    : isMedium
      ? "md:col-span-2 xl:col-span-2 border-gold/35"
      : "border-borderRoyal";

  const profilePath = tile.username ? `/u/${tile.username}` : "/wall";
  const locationLabel = getTileLocation(tile);

  async function copyProfileLink() {
    if (!tile.username || tile.username === "unknown") {
      return;
    }

    const url = `${window.location.origin}/u/${tile.username}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Could not copy wall profile link", error);
      alert(url);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.035, 0.35) }}
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-[1.75rem] border bg-royalCard p-6 ${sizeClass}`}
    >
      <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-crimson/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-between">
        <div>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <RankBadge rank={tile.rank || "Spark"} />

              <p className="mt-3 flex items-center gap-2 text-sm text-textSecondary">
                <MapPin className="h-4 w-4 text-gold" />
                <span className="line-clamp-1">
                  {tile.flag || "🌍"} {locationLabel}
                </span>
              </p>
            </div>

            <span className="text-3xl">{tile.flag || "🌍"}</span>
          </div>

          {isEmperor && <Crown className="mb-3 h-9 w-9 text-gold" />}

          <h2
            className={`font-display font-bold ${
              isEmperor ? "text-4xl text-goldLight" : "text-2xl text-textPrimary"
            }`}
          >
            {safeText(tile.name, "Anonymous Donor")}
          </h2>

          {tile.username && tile.username !== "unknown" && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                to={profilePath}
                className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-goldLight"
              >
                @{tile.username}
                <ArrowRight className="h-3.5 w-3.5" />
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

          <p className="mt-4 line-clamp-4 rounded-2xl border border-borderRoyal bg-black/25 p-4 text-textSecondary">
            “{safeText(tile.message, "A public legacy tile was created.")}”
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-gold/20 bg-gold/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-goldLight">
              {safeText(tile.causeCategory, "Mission Pending")}
            </p>

            <p className="mt-2 line-clamp-2 text-sm text-textSecondary">
              {safeText(tile.causeImpact || tile.cause, "Impact Pending")}
            </p>
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-borderRoyal pt-4">
            <div className="flex items-center gap-2 text-xs text-textSecondary">
              <ShieldCheck className="h-4 w-4 text-gold" />
              Public safe tile
            </div>

            <div className="text-right">
              <p className="font-numbers text-2xl font-bold text-goldLight">
                {money(tile.amountUSD)}
              </p>
              <p className="text-xs text-textSecondary">Donated</p>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
