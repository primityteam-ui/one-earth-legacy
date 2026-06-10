import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  HeartPulse,
  Leaf,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCountries() {
      try {
        const response = await api.get("/public/leaderboard/countries");
        const backendCountries = response.data.countries || [];

        const mappedCountries = backendCountries.map((country, index) => {
          const code = String(country.countryCode || "").toUpperCase();
          const coordinates = countryCoordinates[code] || createFallbackCoordinates(index);

          return {
            ...country,
            countryCode: code || country.countryCode || "GLOBAL",
            lat: Number(country.lat ?? country.latitude ?? coordinates.lat),
            lng: Number(country.lng ?? country.longitude ?? coordinates.lng),
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

    loadCountries();
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
    </main>
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