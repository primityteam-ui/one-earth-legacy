import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client.js";

export default function Home() {
  const [stats, setStats] = useState({
    totalDonated: 0,
    donors: 0,
    countries: 0,
    livesImpacted: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get("/public/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Could not load public stats", error);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      label: "Legacy contributions",
      value: `$${Number(stats.totalDonated || 0).toLocaleString()}`
    },
    {
      label: "Founding supporters",
      value: Number(stats.donors || 0).toLocaleString()
    },
    {
      label: "Countries represented",
      value: Number(stats.countries || 0).toLocaleString()
    },
    {
      label: "Impact records",
      value: Number(stats.livesImpacted || 0).toLocaleString()
    }
  ];

  return (
    <main className="overflow-hidden">
      <section className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute left-20 top-20 h-2 w-2 rounded-full bg-gold" />
          <div className="absolute right-40 top-36 h-1 w-1 rounded-full bg-goldLight" />
          <div className="absolute bottom-32 left-1/2 h-1.5 w-1.5 rounded-full bg-crimsonLight" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-goldLight">
            <Sparkles className="h-4 w-4" />
            One Earth. One Wall. One Legacy.
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-tight md:text-7xl">
            Leave your mark on <span className="gold-text">Earth.</span>
          </h1>

          <p className="mt-6 max-w-2xl font-subheading text-2xl text-textSecondary md:text-3xl">
            Create a public legacy tile, choose an impact mission, and join a transparent digital wall built around recognition, privacy-safe location, and public audit records.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/donate"
              className="rounded-full bg-gold px-7 py-4 font-bold text-black shadow-gold hover:bg-goldLight"
            >
              Create Your Legacy
            </Link>

            <Link
              to="/wall"
              className="rounded-full border border-borderRoyal px-7 py-4 font-bold text-textPrimary hover:border-gold hover:text-gold"
            >
              View the Wall
            </Link>
          </div>

          <div className="mt-7 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5">
            <p className="font-bold text-amber-100">
              Important platform notice
            </p>
            <p className="mt-2 text-sm leading-relaxed text-textSecondary">
              One Earth Legacy is a commercial digital legacy platform, not a charity, lottery, raffle, sweepstakes, investment, or financial product. Legacy Contributions create digital recognition benefits with no cash value, no withdrawal, and no supporter payout.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-[2rem] border border-gold/30 bg-royalCard/80 p-7 shadow-gold"
        >
          <div className="rounded-[1.5rem] border border-borderRoyal bg-black/40 p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-gold/50 bg-gold/10">
              <Crown className="h-10 w-10 text-gold" />
            </div>

            <p className="font-display text-4xl font-bold text-goldLight">
              THE THRONE IS EMPTY
            </p>

            <p className="mt-4 text-textSecondary">
              The top supporter position may receive special visibility and voting influence after payment settlement, safety review, and admin verification.
            </p>

            <div className="mt-7 rounded-2xl border border-crimson/40 bg-crimson/10 p-4">
              <p className="text-sm uppercase tracking-[0.35em] text-crimsonLight">
                Legacy Ranking
              </p>
              <p className="mt-2 font-numbers text-3xl font-bold text-textPrimary">
                Not Started
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-borderRoyal bg-royalPanel/80">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-8 md:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-borderRoyal bg-royalCard p-5">
              <p className="font-numbers text-3xl font-bold text-goldLight">{stat.value}</p>
              <p className="mt-1 text-sm text-textSecondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<Globe2 className="h-6 w-6" />}
            title="Clear money split"
            text="The platform target split is 60% Impact Allocation, 25% Platform Operations, and 15% Legacy Impact Reserve, subject to Stripe confirmation, settlement, fraud review, and admin approval."
          />

          <FeatureCard
            icon={<Crown className="h-6 w-6" />}
            title="Digital recognition"
            text="Supporters receive public ranks, legacy tiles, profile visibility, leaderboard placement, and voting influence based on confirmed contribution records."
          />

          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="No payout model"
            text="Ranks, points, tiles, and voting influence have no cash value. The Legacy Impact Reserve is platform-controlled and is not paid to supporters as cash."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-royalCard p-7">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>

      <h3 className="font-display text-xl font-bold text-textPrimary">{title}</h3>
      <p className="mt-3 text-textSecondary">{text}</p>
    </div>
  );
}