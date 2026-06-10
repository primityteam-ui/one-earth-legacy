import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Crown,
  Globe2,
  HeartHandshake,
  Share2,
  ShieldCheck,
  Trophy
} from "lucide-react";
import api from "../api/client.js";
import PublicStateBox from "../components/PublicStateBox.jsx";
import RankBadge from "../components/RankBadge.jsx";
import StatCard from "../components/StatCard.jsx";
import StatLine from "../components/StatLine.jsx";

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setNotFound(false);

        const response = await api.get(`/public/profiles/${username}`);
        setProfile(response.data.profile);
      } catch (error) {
        console.error("Could not load public profile", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  function shareProfile() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Profile link copied.");
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10">
        <PublicStateBox message="Loading public profile from backend..." />
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="rounded-[2rem] border border-crimson/40 bg-crimson/10 p-10 text-center">
          <p className="font-display text-3xl font-bold text-textPrimary">
            Profile not found
          </p>

          <p className="mt-3 text-textSecondary">
            This username does not exist in the backend public profile API yet.
          </p>

          <Link
            to="/wall"
            className="mt-6 inline-block rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
          >
            Back to Wall
          </Link>
        </div>
      </main>
    );
  }

  const causeAmount = Number(profile.impact?.causeAmount || 0);
  const platformAmount = Number(profile.impact?.platformAmount || 0);
  const lotteryAmount = Number(profile.impact?.lotteryAmount || 0);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              Public Profile
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              {profile.displayName}
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              @{profile.username} · {profile.flag} {profile.country} · Joined{" "}
              {profile.joined}
            </p>
          </div>

          <button
            onClick={shareProfile}
            className="flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
          >
            <Share2 className="h-4 w-4" />
            Share Profile
          </button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <aside className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2rem] border border-gold/30 bg-royalCard p-6 shadow-gold"
          >
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gold">
              Legacy Tile
            </p>

            <div className="rounded-[1.5rem] border border-gold/30 bg-black/40 p-6">
              <div className="mb-5 flex items-center justify-between">
                <RankBadge rank={profile.rank} size="md" />
                <Crown className="h-8 w-8 text-gold" />
              </div>

              <h2 className="font-display text-3xl font-bold text-textPrimary">
                {profile.displayName}
              </h2>

              <p className="mt-3 min-h-[90px] text-textSecondary">
                {profile.message}
              </p>

              <div className="mt-5 flex items-end justify-between border-t border-borderRoyal pt-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">
                    Theme
                  </p>
                  <p>{profile.tileTheme}</p>
                </div>

                <div className="text-right">
                  <p className="font-numbers text-3xl font-bold text-goldLight">
                    ${Number(profile.totalDonated || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-textSecondary">Total donated</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <p className="mb-4 font-display text-2xl font-bold">
              Profile Stats
            </p>

            <StatLine icon={<Crown />} label="Rank" value={profile.rank} />
            <StatLine
              icon={<Globe2 />}
              label="Country"
              value={`${profile.flag} ${profile.country}`}
            />
            <StatLine
              icon={<HeartHandshake />}
              label="Chosen cause"
              value={profile.cause}
            />
            <StatLine
              icon={<ShieldCheck />}
              label="Profile status"
              value="Backend connected"
            />
          </div>
        </aside>

        <div className="space-y-8">
          <section className="grid gap-5 md:grid-cols-3">
            <StatCard
              icon={<HeartHandshake />}
              label="Cause contribution"
              value={`$${causeAmount.toFixed(2)}`}
              subtext="60% of donation amount"
            />

            <StatCard
              icon={<ShieldCheck />}
              label="Platform sustainability"
              value={`$${platformAmount.toFixed(2)}`}
              subtext="25% platform allocation"
            />

            <StatCard
              icon={<Trophy />}
              label="Lottery pool"
              value={`$${lotteryAmount.toFixed(2)}`}
              subtext="15% monthly donor pool"
            />
          </section>

          <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <div className="mb-6 flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-gold" />
              <h2 className="font-display text-2xl font-bold">
                Legacy Timeline
              </h2>
            </div>

            <div className="space-y-4">
              {(profile.timeline || []).map((event, index) => (
                <motion.div
                  key={`${event.title}-${index}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-[1.25rem] border border-borderRoyal bg-black/30 p-5"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-textPrimary">
                        {event.title}
                      </p>
                      <p className="mt-1 text-textSecondary">{event.text}</p>
                    </div>

                    <span className="w-fit rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-bold text-goldLight">
                      {event.date}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-gold/25 bg-gold/10 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.3em] text-goldLight">
                  Build your own mark
                </p>

                <h2 className="font-display text-3xl font-bold text-textPrimary">
                  Join the same wall
                </h2>

                <p className="mt-2 text-textSecondary">
                  Create your own profile, tile, and rank on One Earth Legacy.
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
        </div>
      </section>
    </main>
  );
}