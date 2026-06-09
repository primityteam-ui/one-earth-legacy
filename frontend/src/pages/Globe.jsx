import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Globe2, MapPin, RadioTower, Sparkles, Trophy } from "lucide-react";
import api from "../api/client.js";

export default function Globe() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCountries() {
      try {
        const response = await api.get("/public/leaderboard/countries");
        const data = response.data.countries || [];

        setCountries(data);
        setSelectedCountry(data[0] || null);
      } catch (error) {
        console.error("Could not load globe country data", error);
      } finally {
        setLoading(false);
      }
    }

    loadCountries();
  }, []);

  const maxTotal = useMemo(() => {
    return Math.max(...countries.map((country) => Number(country.totalDonated || 0)), 1);
  }, [countries]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              Globe View
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Earth Impact Map
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              Countries glow based on total donations. This page is now loading country data from your backend API.
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

      {loading ? (
        <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-10 text-center text-textSecondary">
          Loading globe data from backend...
        </div>
      ) : (
        <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-textPrimary">
                  Interactive Globe Placeholder
                </h2>
                <p className="mt-1 text-textSecondary">
                  Three.js 3D globe will be connected later. This version uses backend country data.
                </p>
              </div>

              <Globe2 className="h-8 w-8 text-gold" />
            </div>

            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[2rem] border border-gold/20 bg-black/40">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="relative flex h-80 w-80 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br from-gold/10 via-black to-crimson/20 shadow-gold md:h-96 md:w-96"
              >
                <div className="absolute inset-8 rounded-full border border-gold/10" />
                <div className="absolute inset-16 rounded-full border border-gold/10" />
                <div className="absolute left-1/2 top-0 h-full w-px bg-gold/10" />
                <div className="absolute top-1/2 h-px w-full bg-gold/10" />

                {countries.slice(0, 8).map((country, index) => {
                  const angle = (index / Math.max(countries.length, 1)) * Math.PI * 2;
                  const radius = 145;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const glow = Math.max(0.25, Number(country.totalDonated || 0) / maxTotal);

                  return (
                    <button
                      key={country.countryCode}
                      onClick={() => setSelectedCountry(country)}
                      className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-black text-2xl transition hover:scale-125"
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                        boxShadow: `0 0 ${18 + glow * 35}px rgba(212, 175, 55, ${glow})`
                      }}
                    >
                      {country.flag}
                    </button>
                  );
                })}

                <div className="z-10 text-center">
                  <p className="font-display text-4xl font-bold text-goldLight">
                    One Earth
                  </p>
                  <p className="mt-2 text-sm text-textSecondary">
                    Backend impact globe
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <aside className="space-y-6">
            {selectedCountry && (
              <div className="rounded-[2rem] border border-gold/25 bg-royalCard p-6 shadow-gold">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-gold">
                      Selected Country
                    </p>
                    <h2 className="mt-2 font-display text-4xl font-bold text-textPrimary">
                      {selectedCountry.flag} {selectedCountry.country}
                    </h2>
                  </div>

                  <MapPin className="h-8 w-8 text-gold" />
                </div>

                <div className="grid gap-4">
                  <DetailRow
                    label="Total donated"
                    value={`$${Number(selectedCountry.totalDonated || 0).toLocaleString()}`}
                  />
                  <DetailRow label="Donors" value={selectedCountry.donors} />
                  <DetailRow label="Country pioneer" value={selectedCountry.topDonor} />
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5">
                  <p className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-textPrimary">
                    <Trophy className="h-5 w-5 text-gold" />
                    Top donor
                  </p>

                  <div className="flex items-center justify-between rounded-2xl border border-borderRoyal bg-black/30 p-4">
                    <span className="text-textPrimary">{selectedCountry.topDonor}</span>
                    <span className="font-numbers font-bold text-goldLight">#1</span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
              <p className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
                <RadioTower className="h-5 w-5 text-gold" />
                Country Signal Strength
              </p>

              <div className="space-y-4">
                {countries.map((country) => (
                  <button
                    key={country.countryCode}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full rounded-[1.25rem] border p-4 text-left transition ${
                      selectedCountry?.countryCode === country.countryCode
                        ? "border-gold bg-gold/10"
                        : "border-borderRoyal bg-black/30 hover:border-gold"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <span className="font-bold text-textPrimary">{country.country}</span>
                      </div>

                      <span className="font-numbers text-goldLight">
                        ${Number(country.totalDonated || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-royalBlack">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{
                          width: `${Math.max(
                            7,
                            (Number(country.totalDonated || 0) / maxTotal) * 100
                          )}%`
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>
      )}

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <StatCard icon={<Sparkles />} label="Country pioneer badge" value="Backend ready" />
        <StatCard icon={<Crown />} label="Emperor cause control" value="Future" />
        <StatCard icon={<Globe2 />} label="3D globe engine" value="Next step" />
      </section>
    </main>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-borderRoyal bg-black/30 p-4">
      <span className="text-textSecondary">{label}</span>
      <span className="font-bold text-textPrimary">{value}</span>
    </div>
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