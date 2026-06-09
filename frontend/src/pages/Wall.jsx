import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Search, Sparkles } from "lucide-react";
import api from "../api/client.js";

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

const countries = ["All", "Global", "India", "Brazil", "United States"];

const missionFilters = [
  "All Missions",
  "Human Survival",
  "Planet Protection",
  "Children & Education"
];

const impactFilters = {
  "Human Survival": [
    "Clean Water for Life",
    "Meals for the Hungry",
    "Emergency Medical Aid",
    "Shelter & Warmth",
    "Disaster Rescue Fund",
    "Refugee & Crisis Relief"
  ],
  "Planet Protection": [
    "Forests of the Future",
    "Ocean Cleanup Mission",
    "Wildlife Guardians",
    "Climate Repair Fund",
    "Plastic-Free Earth",
    "Land Restoration"
  ],
  "Children & Education": [
    "School Starter Kits",
    "Child Health Shield",
    "Girls’ Education Fund",
    "Scholarship Pathways",
    "Digital Learning Access",
    "Orphan & Vulnerable Child Care"
  ]
};

function buildFilterParams(missionFilter, impactFilter) {
  const params = {};

  if (missionFilter !== "All Missions") {
    params.mission = missionFilter;
  }

  if (impactFilter !== "All Impacts") {
    params.impact = impactFilter;
  }

  return params;
}

export default function Wall() {
  const [tiles, setTiles] = useState([]);
  const [search, setSearch] = useState("");
  const [rank, setRank] = useState("All");
  const [country, setCountry] = useState("All");
  const [missionFilter, setMissionFilter] = useState("All Missions");
  const [impactFilter, setImpactFilter] = useState("All Impacts");
  const [loading, setLoading] = useState(true);

  const availableImpacts = useMemo(() => {
    if (missionFilter === "All Missions") {
      return [];
    }

    return impactFilters[missionFilter] || [];
  }, [missionFilter]);

  useEffect(() => {
    setImpactFilter("All Impacts");
  }, [missionFilter]);

  useEffect(() => {
    async function loadTiles() {
      try {
        setLoading(true);

        const response = await api.get("/public/tiles", {
          params: buildFilterParams(missionFilter, impactFilter)
        });

        setTiles(response.data.tiles || []);
      } catch (error) {
        console.error("Could not load tiles", error);
      } finally {
        setLoading(false);
      }
    }

    loadTiles();
  }, [missionFilter, impactFilter]);

  const filteredTiles = useMemo(() => {
    return tiles.filter((tile) => {
      const query = search.toLowerCase();

      const matchesSearch =
        tile.name?.toLowerCase().includes(query) ||
        tile.message?.toLowerCase().includes(query) ||
        tile.username?.toLowerCase().includes(query) ||
        tile.causeCategory?.toLowerCase().includes(query) ||
        tile.causeImpact?.toLowerCase().includes(query) ||
        tile.cause?.toLowerCase().includes(query);

      const matchesRank = rank === "All" || tile.rank === rank;
      const matchesCountry = country === "All" || tile.country === country;

      return matchesSearch && matchesRank && matchesCountry;
    });
  }, [tiles, search, rank, country]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              The Wall
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              The Legacy Wall
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              Every donor receives a permanent tile. Mission and exact impact
              filtering are now handled by the backend before tiles reach this page.
            </p>
          </div>

          <div className="rounded-2xl border border-borderRoyal bg-black/30 px-5 py-4">
            <p className="text-sm text-textSecondary">Visible tiles</p>
            <p className="font-numbers text-3xl font-bold text-goldLight">
              {filteredTiles.length}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 rounded-[1.5rem] border border-borderRoyal bg-royalPanel p-5 lg:grid-cols-[1fr_180px_180px_220px_260px]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textSecondary" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search donor, message, mission, or impact..."
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
              {item} Rank
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
              {item}
            </option>
          ))}
        </select>

        <select
          value={missionFilter}
          onChange={(event) => setMissionFilter(event.target.value)}
          className="rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
        >
          {missionFilters.map((mission) => (
            <option key={mission} value={mission} className="bg-royalBlack">
              {mission}
            </option>
          ))}
        </select>

        <select
          value={impactFilter}
          onChange={(event) => setImpactFilter(event.target.value)}
          disabled={missionFilter === "All Missions"}
          className="rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="All Impacts" className="bg-royalBlack">
            All Impacts
          </option>
          {availableImpacts.map((impact) => (
            <option key={impact} value={impact} className="bg-royalBlack">
              {impact}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="rounded-[1.5rem] border border-borderRoyal bg-royalCard p-10 text-center text-textSecondary">
          Loading wall tiles from backend...
        </div>
      ) : (
        <section className="grid auto-rows-[210px] grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {filteredTiles.map((tile, index) => (
            <DonorTile key={tile.id} tile={tile} index={index} />
          ))}
        </section>
      )}

      {!loading && filteredTiles.length === 0 && (
        <div className="mt-10 rounded-[1.5rem] border border-borderRoyal bg-royalCard p-10 text-center">
          <p className="font-display text-2xl text-goldLight">No tiles found</p>
          <p className="mt-2 text-textSecondary">
            Try another search, rank, country, mission, or exact impact filter.
          </p>
        </div>
      )}
    </main>
  );
}

function DonorTile({ tile, index }) {
  const isEmperor = tile.isEmperor || tile.rank === "Emperor";

  const sizeClass = isEmperor
    ? "md:col-span-3 lg:col-span-2 row-span-2 border-gold/60 shadow-gold"
    : tile.amountUSD >= 20000
      ? "md:col-span-2 row-span-2 border-gold/40"
      : tile.amountUSD >= 1000
        ? "md:col-span-2 border-gold/30"
        : "border-borderRoyal";

  return (
    <motion.article
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.04 }}
      whileHover={{ scale: 1.03 }}
      className={`group relative overflow-hidden rounded-[1.5rem] border bg-royalCard p-6 ${sizeClass}`}
    >
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-crimson/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <RankBadge rank={tile.rank} />
            <span className="text-2xl">{tile.flag}</span>
          </div>

          <h2 className={`font-display font-bold ${isEmperor ? "text-4xl text-goldLight" : "text-2xl"}`}>
            {isEmperor && <Crown className="mb-3 h-9 w-9 text-gold" />}
            {tile.name}
          </h2>

          <p className="mt-3 line-clamp-3 text-textSecondary">{tile.message}</p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">
              {tile.country}
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              {tile.causeCategory || "Mission Pending"}
            </p>

            <p className="mt-1 line-clamp-1 text-sm text-textSecondary">
              {tile.causeImpact || tile.cause || "Impact Pending"}
            </p>
          </div>

          <div className="text-right">
            <p className="font-numbers text-2xl font-bold text-goldLight">
              ${Number(tile.amountUSD || 0).toLocaleString()}
            </p>
            <p className="text-xs text-textSecondary">Donated</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function RankBadge({ rank }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-goldLight">
      {rank === "Emperor" ? <Crown className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      {rank}
    </div>
  );
}