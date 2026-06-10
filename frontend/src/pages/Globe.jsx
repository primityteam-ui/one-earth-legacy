import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe2,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";
import api from "../api/client.js";

const fallbackCountries = [
  {
    country: "United States",
    countryCode: "US",
    flag: "🇺🇸",
    donors: 12,
    totalDonated: 2500,
    topDonor: "Vamshi",
    x: 27,
    y: 43
  },
  {
    country: "India",
    countryCode: "IN",
    flag: "🇮🇳",
    donors: 18,
    totalDonated: 4200,
    topDonor: "Legacy Founder",
    x: 67,
    y: 51
  },
  {
    country: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    donors: 8,
    totalDonated: 1350,
    topDonor: "Earth Guardian",
    x: 38,
    y: 68
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    flag: "🇬🇧",
    donors: 5,
    totalDonated: 950,
    topDonor: "Global Citizen",
    x: 49,
    y: 34
  },
  {
    country: "Australia",
    countryCode: "AU",
    flag: "🇦🇺",
    donors: 4,
    totalDonated: 700,
    topDonor: "Ocean Protector",
    x: 78,
    y: 72
  }
];

const globePoints = {
  US: { x: 27, y: 43 },
  USA: { x: 27, y: 43 },
  IN: { x: 67, y: 51 },
  IND: { x: 67, y: 51 },
  BR: { x: 38, y: 68 },
  BRA: { x: 38, y: 68 },
  GB: { x: 49, y: 34 },
  UK: { x: 49, y: 34 },
  AU: { x: 78, y: 72 },
  AUS: { x: 78, y: 72 },
  CA: { x: 25, y: 32 },
  CAN: { x: 25, y: 32 },
  DE: { x: 52, y: 36 },
  GER: { x: 52, y: 36 },
  FR: { x: 49, y: 39 },
  FRA: { x: 49, y: 39 },
  JP: { x: 82, y: 45 },
  JPN: { x: 82, y: 45 },
  CN: { x: 73, y: 43 },
  CHN: { x: 73, y: 43 },
  ZA: { x: 55, y: 77 },
  ZAF: { x: 55, y: 77 }
};

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
          const position = globePoints[code] || createFallbackPosition(index);

          return {
            ...country,
            x: position.x,
            y: position.y
          };
        });

        setCountries(mappedCountries.length ? mappedCountries : fallbackCountries);
        setSelectedCountry(mappedCountries[0] || fallbackCountries[0]);
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
              The Living Earth Globe
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              A rotating 3D-style donor globe showing country-level support across One Earth Legacy.
              The data is connected to your backend country leaderboard API.
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

      <section className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
          {loading ? (
            <div className="flex min-h-[560px] items-center justify-center text-textSecondary">
              Loading globe data from backend...
            </div>
          ) : (
            <div className="relative flex min-h-[560px] items-center justify-center overflow-hidden rounded-[1.75rem] border border-borderRoyal bg-black/40">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 48,
                  ease: "linear"
                }}
                className="relative h-[340px] w-[340px] rounded-full border border-gold/40 bg-[radial-gradient(circle_at_30%_30%,rgba(250,204,21,0.35),rgba(30,64,175,0.35),rgba(2,6,23,0.95)_70%)] shadow-[0_0_80px_rgba(212,175,55,0.28)] md:h-[460px] md:w-[460px]"
              >
                <div className="absolute inset-4 rounded-full border border-white/10" />
                <div className="absolute inset-10 rounded-full border border-white/10" />
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
                <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/10" />

                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute left-[12%] top-[28%] h-[18%] w-[24%] rounded-full bg-emerald-500/30 blur-sm" />
                  <div className="absolute left-[50%] top-[26%] h-[18%] w-[30%] rounded-full bg-emerald-500/25 blur-sm" />
                  <div className="absolute left-[58%] top-[45%] h-[20%] w-[18%] rounded-full bg-emerald-500/25 blur-sm" />
                  <div className="absolute left-[30%] top-[60%] h-[22%] w-[16%] rounded-full bg-emerald-500/25 blur-sm" />
                  <div className="absolute left-[69%] top-[67%] h-[13%] w-[18%] rounded-full bg-emerald-500/25 blur-sm" />
                </div>

                {countries.map((country, index) => (
                  <button
                    key={`${country.countryCode || country.country}-${index}`}
                    type="button"
                    onClick={() => setSelectedCountry(country)}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${country.x}%`,
                      top: `${country.y}%`
                    }}
                  >
                    <motion.span
                      animate={{
                        scale:
                          selectedCountry?.country === country.country
                            ? [1, 1.35, 1]
                            : [1, 1.18, 1]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: selectedCountry?.country === country.country ? 1.2 : 2
                      }}
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selectedCountry?.country === country.country
                          ? "border-gold bg-gold"
                          : "border-gold/70 bg-gold/60"
                      } shadow-[0_0_24px_rgba(212,175,55,0.85)]`}
                    >
                      <span className="h-2 w-2 rounded-full bg-black" />
                    </motion.span>
                  </button>
                ))}

                <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.18),transparent_35%,rgba(0,0,0,0.35)_75%)]" />
              </motion.div>

              <div className="absolute bottom-6 left-6 right-6 rounded-[1.25rem] border border-borderRoyal bg-black/50 p-4 backdrop-blur">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <Radio className="h-5 w-5 text-gold" />
                    <p className="font-bold text-textPrimary">
                      Live country donor signal
                    </p>
                  </div>

                  <p className="text-sm text-textSecondary">
                    Click any gold point on the globe.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-gold/25 bg-gold/10 p-6 shadow-gold">
            <div className="mb-4 flex items-center gap-3">
              <Globe2 className="h-6 w-6 text-gold" />
              <h2 className="font-display text-2xl font-bold text-textPrimary">
                Global Impact
              </h2>
            </div>

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

          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="h-6 w-6 text-gold" />
              <h2 className="font-display text-2xl font-bold text-textPrimary">
                Selected Country
              </h2>
            </div>

            {selectedCountry ? (
              <div>
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-5xl">{selectedCountry.flag || "🌍"}</span>

                  <div>
                    <p className="font-display text-3xl font-bold text-textPrimary">
                      {selectedCountry.country}
                    </p>
                    <p className="text-sm text-textSecondary">
                      {selectedCountry.countryCode || "GLOBAL"}
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
            ) : (
              <p className="text-textSecondary">
                Select a country point on the globe.
              </p>
            )}
          </div>

          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gold">
              Country Rankings
            </p>

            <div className="space-y-3">
              {[...countries]
                .sort((a, b) => Number(b.totalDonated || 0) - Number(a.totalDonated || 0))
                .slice(0, 6)
                .map((country, index) => (
                  <button
                    key={`${country.countryCode || country.country}-rank-${index}`}
                    type="button"
                    onClick={() => setSelectedCountry(country)}
                    className="flex w-full items-center justify-between rounded-2xl border border-borderRoyal bg-black/30 p-4 text-left hover:border-gold"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-numbers text-lg font-bold text-goldLight">
                        #{index + 1}
                      </span>
                      <span className="text-2xl">{country.flag || "🌍"}</span>
                      <div>
                        <p className="font-bold text-textPrimary">
                          {country.country}
                        </p>
                        <p className="text-xs text-textSecondary">
                          {Number(country.donors || 0).toLocaleString()} donors
                        </p>
                      </div>
                    </div>

                    <p className="font-numbers font-bold text-goldLight">
                      ${Number(country.totalDonated || 0).toLocaleString()}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
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

function createFallbackPosition(index) {
  const positions = [
    { x: 30, y: 38 },
    { x: 62, y: 45 },
    { x: 48, y: 62 },
    { x: 70, y: 58 },
    { x: 38, y: 72 },
    { x: 55, y: 34 }
  ];

  return positions[index % positions.length];
}