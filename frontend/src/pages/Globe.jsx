import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  HeartPulse,
  Leaf,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";
import api from "../api/client.js";
import EarthGlobe from "../components/EarthGlobe.jsx";

const missionStyles = {
  "Human Survival": {
    color: "#fb7185",
    icon: HeartPulse
  },
  "Planet Protection": {
    color: "#34d399",
    icon: Leaf
  },
  "Children & Education": {
    color: "#60a5fa",
    icon: GraduationCap
  }
};

const countryCoordinates = {
  US: { lat: 37.0902, lng: -95.7129 },
  USA: { lat: 37.0902, lng: -95.7129 },
  IN: { lat: 20.5937, lng: 78.9629 },
  IND: { lat: 20.5937, lng: 78.9629 },
  BR: { lat: -14.235, lng: -51.9253 },
  BRA: { lat: -14.235, lng: -51.9253 },
  GB: { lat: 55.3781, lng: -3.436 },
  UK: { lat: 55.3781, lng: -3.436 },
  AU: { lat: -25.2744, lng: 133.7751 },
  AUS: { lat: -25.2744, lng: 133.7751 },
  CA: { lat: 56.1304, lng: -106.3468 },
  CAN: { lat: 56.1304, lng: -106.3468 },
  MX: { lat: 23.6345, lng: -102.5528 },
  MEX: { lat: 23.6345, lng: -102.5528 },
  DE: { lat: 51.1657, lng: 10.4515 },
  GER: { lat: 51.1657, lng: 10.4515 },
  FR: { lat: 46.2276, lng: 2.2137 },
  FRA: { lat: 46.2276, lng: 2.2137 },
  JP: { lat: 36.2048, lng: 138.2529 },
  JPN: { lat: 36.2048, lng: 138.2529 },
  CN: { lat: 35.8617, lng: 104.1954 },
  CHN: { lat: 35.8617, lng: 104.1954 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  ZAF: { lat: -30.5595, lng: 22.9375 }
};

const fallbackCountries = [
  {
    country: "United States",
    countryCode: "US",
    flag: "🇺🇸",
    donors: 12,
    totalDonated: 2500,
    topDonor: "Vamshi",
    mission: "Human Survival",
    lat: 37.0902,
    lng: -95.7129
  },
  {
    country: "India",
    countryCode: "IN",
    flag: "🇮🇳",
    donors: 18,
    totalDonated: 4200,
    topDonor: "Legacy Founder",
    mission: "Children & Education",
    lat: 20.5937,
    lng: 78.9629
  },
  {
    country: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    donors: 8,
    totalDonated: 1350,
    topDonor: "Earth Guardian",
    mission: "Planet Protection",
    lat: -14.235,
    lng: -51.9253
  }
];

export default function Globe() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCountries() {
      try {
        const response = await api.get("/public/leaderboard/countries");
        const backendCountries = response.data.countries || response.data.data || [];

        const mappedCountries = backendCountries.map((country, index) => {
          const code = String(country.countryCode || "").toUpperCase();
          const coordinates = countryCoordinates[code] || createFallbackCoordinates(index);

          return {
            ...country,
            countryCode: code || country.countryCode || "GLOBAL",
            lat: Number(country.lat ?? country.latitude ?? coordinates.lat),
            lng: Number(country.lng ?? country.longitude ?? coordinates.lng),
            donors: Number(country.donors || country.donorCount || 0),
            totalDonated: Number(country.totalDonated || country.totalAmount || 0),
            locationLabel: country.locationLabel || country.country,
            mission: normalizeMission(
              country.mission ||
                country.topMission ||
                country.causeCategory ||
                country.primaryMission ||
                index
            )
          };
        });

        const finalCountries = mappedCountries.length ? mappedCountries : fallbackCountries;

        setCountries(finalCountries);
        setSelectedCountry(finalCountries[0]);
      } catch (error) {
        console.error("Could not load globe countries", error);
        setCountries(fallbackCountries);
        setSelectedCountry(fallbackCountries[0]);
      } finally {
        setLoading(false);
      }
    }

    async function loadRecentActivity() {
      try {
        const response = await api.get("/public/tiles");
        const backendTiles = response.data.tiles || [];

        const activities = backendTiles
          .filter((tile) => !tile.isEmperor)
          .slice(0, 8)
          .map((tile) => ({
            id: tile.id || tile._id,
            name: tile.name || "Anonymous Donor",
            username: tile.username,
            city: tile.city || "",
            region: tile.region || "",
            country: tile.country || "Earth",
            countryCode: tile.countryCode || "GLOBAL",
            locationLabel:
              tile.locationLabel ||
              [tile.city, tile.region, tile.country].filter(Boolean).join(", ") ||
              tile.country ||
              "Earth",
            amountUSD: Number(tile.amountUSD || tile.amount || 0),
            rank: tile.rank || "Spark",
            mission: normalizeMission(tile.causeCategory || tile.mission || tile.cause),
            cause: tile.cause || tile.causeCategory || "Legacy Mission",
            message: tile.message || "A new legacy tile was created.",
            createdAt: tile.createdAt
          }));

        setRecentActivities(activities);
      } catch (error) {
        console.error("Could not load donor activity", error);
        setRecentActivities([]);
      }
    }

    loadCountries();
    loadRecentActivity();
  }, []);

  const totalDonors = useMemo(() => {
    return countries.reduce((total, item) => total + Number(item.donors || 0), 0);
  }, [countries]);

  const totalDonated = useMemo(() => {
    return countries.reduce((total, item) => total + Number(item.totalDonated || 0), 0);
  }, [countries]);

  const topCountry = useMemo(() => {
    return [...countries].sort(
      (a, b) => Number(b.totalDonated || 0) - Number(a.totalDonated || 0)
    )[0];
  }, [countries]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              Global Legacy Map
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Google-Earth-Style Legacy Globe
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              A real interactive 3D Earth globe with exact latitude and longitude donor points,
              mission-based colors, and country-level backend leaderboard data.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
            <p className="text-sm text-goldLight">Countries active</p>
            <p className="font-numbers text-3xl font-bold text-textPrimary">
              {countries.length}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
          {loading ? (
            <div className="flex h-[620px] items-center justify-center text-textSecondary">
              Loading interactive Earth...
            </div>
          ) : (
            <EarthGlobe
              countries={countries}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-gold/25 bg-gold/10 p-6 shadow-gold">
            <h2 className="mb-4 font-display text-2xl font-bold text-textPrimary">
              Global Impact
            </h2>

            <div className="space-y-3">
              <StatLine
                icon={<Users className="h-5 w-5" />}
                label="Total donors"
                value={totalDonors.toLocaleString()}
              />

              <StatLine
                icon={<Sparkles className="h-5 w-5" />}
                label="Total donated"
                value={`$${Number(totalDonated || 0).toLocaleString()}`}
              />

              <StatLine
                icon={<Trophy className="h-5 w-5" />}
                label="Top country"
                value={topCountry?.country || "Pending"}
              />
            </div>
          </div>

          <CountryDetailCard selectedCountry={selectedCountry} />

          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gold">
              Mission Colors
            </p>

            <div className="space-y-3">
              {Object.entries(missionStyles).map(([mission, style]) => {
                const Icon = style.icon;

                return (
                  <div
                    key={mission}
                    className="flex items-center gap-3 rounded-2xl border border-borderRoyal bg-black/30 p-4"
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: style.color }}
                    />

                    <p className="font-bold text-textPrimary">
                      {mission}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>

      <DonorActivityFeed activities={recentActivities} />
    </main>
  );
}

function DonorActivityFeed({ activities }) {
  return (
    <section className="mt-8 rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-gold">
            Live Donor Activity
          </p>

          <h2 className="font-display text-3xl font-bold text-textPrimary">
            Recent Legacy Tiles
          </h2>

          <p className="mt-2 max-w-2xl text-textSecondary">
            New donations appear here with safe city-level location, selected mission,
            rank, and legacy message.
          </p>
        </div>

        <div className="rounded-2xl border border-gold/25 bg-gold/10 px-5 py-3">
          <p className="text-sm text-goldLight">Recent records</p>
          <p className="font-numbers text-2xl font-bold text-textPrimary">
            {activities.length}
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-borderRoyal bg-black/30 p-6 text-textSecondary">
          No live donor activity yet. Save a mock donation from the Donate page,
          then refresh this globe page.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {activities.map((activity) => {
            const style = missionStyles[activity.mission] || {
              color: "#facc15",
              icon: Sparkles
            };

            const Icon = style.icon;
            const profileUrl =
              activity.username && activity.username !== "unknown"
                ? `/profiles/${activity.username}`
                : null;

            return (
              <article
                key={activity.id}
                className="rounded-2xl border border-borderRoyal bg-black/30 p-5 transition hover:border-gold/40 hover:bg-black/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-textSecondary">
                      {profileUrl ? (
                        <a
                          href={profileUrl}
                          className="font-semibold text-gold transition hover:text-goldLight"
                        >
                          {activity.name}
                        </a>
                      ) : (
                        <span className="font-semibold text-gold">
                          {activity.name}
                        </span>
                      )}
                    </p>

                    <h3 className="mt-1 font-display text-2xl font-bold text-textPrimary">
                      ${Number(activity.amountUSD || 0).toLocaleString()}
                    </h3>
                  </div>

                  <div className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-sm font-semibold text-goldLight">
                    {activity.rank}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-borderRoyal bg-royalDeep/50 p-4">
                  <Icon
                    className="h-5 w-5"
                    style={{ color: style.color }}
                  />

                  <div>
                    <p className="text-xs text-textSecondary">Mission</p>
                    <p className="font-bold" style={{ color: style.color }}>
                      {activity.mission}
                    </p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 text-sm text-textSecondary">
                  “{activity.message}”
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-xl border border-borderRoyal bg-black/30 px-3 py-2 text-sm text-textSecondary">
                    <MapPin className="h-4 w-4 text-gold" />
                    <span>{activity.locationLabel}</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-borderRoyal bg-black/30 px-3 py-2 text-sm text-textSecondary">
                    <Clock className="h-4 w-4 text-gold" />
                    <span>{formatActivityDate(activity.createdAt)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CountryDetailCard({ selectedCountry }) {
  if (!selectedCountry) {
    return (
      <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
        <p className="text-textSecondary">
          Select a country point on the globe.
        </p>
      </div>
    );
  }

  const style = missionStyles[selectedCountry.mission] || {
    color: "#facc15",
    icon: Sparkles
  };

  const Icon = style.icon;

  return (
    <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
      <div className="mb-4 flex items-center gap-3">
        <MapPin className="h-6 w-6 text-gold" />

        <h2 className="font-display text-2xl font-bold text-textPrimary">
          Selected Country
        </h2>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <span className="text-5xl">
          {selectedCountry.flag || "🌍"}
        </span>

        <div>
          <p className="font-display text-3xl font-bold text-textPrimary">
            {selectedCountry.country}
          </p>

          <p className="text-sm text-textSecondary">
            {selectedCountry.countryCode || "GLOBAL"} · Lat{" "}
            {Number(selectedCountry.lat).toFixed(2)}, Lng{" "}
            {Number(selectedCountry.lng).toFixed(2)}
          </p>
        </div>
      </div>

      <div
        className="mb-4 flex items-center gap-3 rounded-2xl border bg-black/30 p-4"
        style={{ borderColor: style.color }}
      >
        <Icon
          className="h-5 w-5"
          style={{ color: style.color }}
        />

        <div>
          <p className="text-sm text-textSecondary">Primary mission</p>
          <p className="font-bold" style={{ color: style.color }}>
            {selectedCountry.mission || "Legacy Mission"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <StatLine
          icon={<Users className="h-5 w-5" />}
          label="Donors"
          value={Number(selectedCountry.donors || 0).toLocaleString()}
        />

        <StatLine
          icon={<Sparkles className="h-5 w-5" />}
          label="Donated"
          value={`$${Number(selectedCountry.totalDonated || 0).toLocaleString()}`}
        />

        <StatLine
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Top donor"
          value={selectedCountry.topDonor || "Pending"}
        />
      </div>
    </div>
  );
}

function StatLine({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <div className="flex items-center gap-3">
        <span className="text-gold">{icon}</span>
        <span className="text-textSecondary">{label}</span>
      </div>

      <span className="text-right font-bold text-textPrimary">
        {value}
      </span>
    </div>
  );
}

function formatActivityDate(value) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function normalizeMission(value) {
  if (typeof value === "number") {
    const missions = Object.keys(missionStyles);
    return missions[value % missions.length];
  }

  const mission = String(value || "").trim();

  if (mission.includes("Human")) return "Human Survival";
  if (mission.includes("Planet")) return "Planet Protection";
  if (mission.includes("Children") || mission.includes("Education")) {
    return "Children & Education";
  }

  return "Human Survival";
}

function createFallbackCoordinates(index) {
  const coordinates = [
    { lat: 37.0902, lng: -95.7129 },
    { lat: 20.5937, lng: 78.9629 },
    { lat: -14.235, lng: -51.9253 },
    { lat: 55.3781, lng: -3.436 },
    { lat: -25.2744, lng: 133.7751 },
    { lat: 56.1304, lng: -106.3468 }
  ];

  return coordinates[index % coordinates.length];
}