import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  CalendarDays,
  Copy,
  Crown,
  ExternalLink,
  Globe2,
  HeartHandshake,
  Landmark,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";
import api from "../api/client.js";
import PageHero from "../components/PageHero.jsx";
import PublicStateBox from "../components/PublicStateBox.jsx";
import RankBadge from "../components/RankBadge.jsx";
import StatCard from "../components/StatCard.jsx";
import TimelineList from "../components/TimelineList.jsx";

function money(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function shortMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function safeText(value, fallback = "Not available yet") {
  const text = String(value || "").trim();
  return text || fallback;
}

function getProfileUrl(username) {
  if (typeof window === "undefined") {
    return `/u/${username}`;
  }

  return `${window.location.origin}/u/${username}`;
}

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setNotFound(false);
        setCopied(false);

        const response = await api.get(`/public/profiles/${username}`);
        setProfile(response.data.profile);
        setSource(response.data.source || "");
      } catch (error) {
        console.error("Could not load public profile", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [username]);

  const profileUrl = useMemo(() => {
    return getProfileUrl(profile?.username || username);
  }, [profile?.username, username]);

  const impact = profile?.impact || {};
  const causeAmount = Number(impact.causeAmount || 0);
  const platformAmount = Number(impact.platformAmount || 0);
  const lotteryAmount = Number(impact.lotteryAmount || 0);
  const totalDonated = Number(profile?.totalDonated || 0);
  const rankPosition = Number(profile?.rankPosition || 0);
  const donationCount = Number(profile?.donationCount || 0);

  const locationLabel = useMemo(() => {
    if (!profile) {
      return "";
    }

    const city = safeText(profile.city, "");
    const region = safeText(profile.region, "");
    const country = safeText(profile.country, "");

    const parts = [city, region, country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Location hidden";
  }, [profile]);

  const missionsSupported = useMemo(() => {
    const fromBackend = Array.isArray(profile?.missionsSupported)
      ? profile.missionsSupported
      : [];

    if (fromBackend.length > 0) {
      return fromBackend;
    }

    if (!profile?.causeCategory && !profile?.causeImpact && !profile?.cause) {
      return [];
    }

    return [
      {
        causeCategory: profile.causeCategory,
        causeImpact: profile.causeImpact,
        cause: profile.cause,
        totalDonated: totalDonated,
        donations: 1
      }
    ];
  }, [profile, totalDonated]);

  const recentTiles = useMemo(() => {
    const fromBackend = Array.isArray(profile?.recentTiles)
      ? profile.recentTiles
      : [];

    if (fromBackend.length > 0) {
      return fromBackend;
    }

    if (!profile) {
      return [];
    }

    return [
      {
        id: "latest-public-tile",
        rank: profile.rank,
        message: profile.message,
        causeCategory: profile.causeCategory,
        causeImpact: profile.causeImpact,
        cause: profile.cause,
        amountUSD: totalDonated,
        themeColor: profile.tileTheme,
        createdAt: profile.joined
      }
    ];
  }, [profile, totalDonated]);

  async function shareProfile() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Could not copy profile link", error);
      alert(profileUrl);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10">
        <PublicStateBox message="Loading public donor profile from backend..." />
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
            This username does not exist in the public profile API yet.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/wall"
              className="rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
            >
              Back to Wall
            </Link>

            <Link
              to="/leaderboard"
              className="rounded-full border border-gold/40 px-6 py-3 font-bold text-gold hover:bg-gold/10"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <PageHero
        eyebrow="Public Donor Profile"
        title={profile.displayName}
        description={`@${profile.username} · ${profile.flag || "🌍"} ${locationLabel} · Joined ${safeText(
          profile.joined,
          "recently"
        )}`}
        rightContent={
          <button
            onClick={shareProfile}
            className="flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
          >
            {copied ? <Copy className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Copied" : "Share Profile"}
          </button>
        }
      />

      <section className="grid gap-8 lg:grid-cols-[430px_1fr]">
        <aside className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-hidden rounded-[2rem] border border-gold/30 bg-royalCard shadow-gold"
          >
            <div className="border-b border-gold/20 bg-gradient-to-br from-gold/20 via-black/20 to-transparent p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-gold">
                    Legacy Identity
                  </p>
                  <p className="mt-2 text-sm text-textSecondary">
                    Public, privacy-safe donor page
                  </p>
                </div>

                <div className="rounded-full border border-gold/30 bg-black/40 p-3">
                  <Crown className="h-8 w-8 text-gold" />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-gold/30 bg-black/45 p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <RankBadge rank={profile.rank} size="md" />

                  <div className="rounded-full bg-gold/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold">
                    {source || "public"}
                  </div>
                </div>

                <h2 className="font-display text-4xl font-bold text-textPrimary">
                  {profile.displayName}
                </h2>

                <p className="mt-2 text-textSecondary">@{profile.username}</p>

                <p className="mt-5 min-h-[90px] rounded-2xl border border-borderRoyal bg-black/30 p-4 text-textSecondary">
                  “{safeText(profile.message, "This donor is building a public legacy.")}”
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-borderRoyal bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">
                      Rank
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold text-goldLight">
                      {safeText(profile.rank, "Spark")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-borderRoyal bg-black/30 p-4 text-right">
                    <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">
                      Donated
                    </p>
                    <p className="mt-2 font-numbers text-2xl font-bold text-goldLight">
                      {shortMoney(totalDonated)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-start gap-3 rounded-2xl border border-borderRoyal bg-black/25 p-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-bold text-textPrimary">Public location</p>
                  <p className="text-sm text-textSecondary">
                    {profile.flag || "🌍"} {locationLabel}
                  </p>
                  <p className="mt-1 text-xs text-textSecondary">
                    City or country only. No street address is shown.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-borderRoyal bg-black/25 p-4">
                <HeartHandshake className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-bold text-textPrimary">Main mission</p>
                  <p className="text-sm text-textSecondary">
                    {safeText(profile.cause)}
                  </p>
                </div>
              </div>

                <div className="flex items-start gap-3 rounded-2xl border border-borderRoyal bg-black/25 p-4">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-bold text-textPrimary">Privacy status</p>
                  <p className="text-sm text-textSecondary">
                    Public profile uses donor-safe display fields only.
                  </p>
                  <p className="mt-1 text-xs text-textSecondary">
                    Location precision: {safeText(profile.precision, "city/country")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <p className="mb-4 font-display text-2xl font-bold">
              Shareable Profile
            </p>

            <div className="rounded-2xl border border-borderRoyal bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">
                Public link
              </p>

              <p className="mt-2 break-all text-sm text-textPrimary">
                {profileUrl}
              </p>
            </div>

            <button
              onClick={shareProfile}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied to Clipboard" : "Copy Profile Link"}
            </button>
          </section>
        </aside>

        <div className="space-y-8">
          <section className="grid gap-5 md:grid-cols-3">
            <StatCard
              icon={<HeartHandshake />}
              label="Cause contribution"
              value={money(causeAmount)}
              subtext="60% reserved for mission impact"
            />

            <StatCard
              icon={<Landmark />}
              label="Platform sustainability"
              value={money(platformAmount)}
              subtext="25% reserved for operations"
            />

            <StatCard
              icon={<Trophy />}
              label="Donor reward pool"
              value={money(lotteryAmount)}
              subtext="15% monthly donor pool"
            />
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
              <Award className="mb-4 h-7 w-7 text-gold" />
              <p className="text-sm uppercase tracking-[0.25em] text-textSecondary">
                Donor Rank
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-textPrimary">
                {safeText(profile.rank, "Spark")}
              </p>
              <p className="mt-2 text-sm text-textSecondary">
                {rankPosition > 0 ? `#${rankPosition} on the public donor wall` : "Public donor wall rank"}
              </p>
            </div>

            <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
              <Globe2 className="mb-4 h-7 w-7 text-gold" />
              <p className="text-sm uppercase tracking-[0.25em] text-textSecondary">
                Location
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-textPrimary">
                {profile.flag || "🌍"} {safeText(profile.country, "Global")}
              </p>
            </div>

            <div className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
              <Users className="mb-4 h-7 w-7 text-gold" />
              <p className="text-sm uppercase tracking-[0.25em] text-textSecondary">
                Donations
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-textPrimary">
                {donationCount || missionsSupported.length}
              </p>
              <p className="mt-2 text-sm text-textSecondary">
                Across {missionsSupported.length} mission{missionsSupported.length === 1 ? "" : "s"}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gold">
                  Missions Supported
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-textPrimary">
                  Total public impact
                </h2>
              </div>

              <Link
                to="/audit"
                className="flex w-fit items-center gap-2 rounded-full border border-gold/40 px-5 py-2 text-sm font-bold text-gold hover:bg-gold/10"
              >
                View Audit
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4">
              {missionsSupported.map((mission, index) => (
                <div
                  key={`${mission.cause || mission.causeImpact || index}`}
                  className="rounded-2xl border border-borderRoyal bg-black/25 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-goldLight">
                        {safeText(mission.causeCategory, "Legacy Mission")}
                      </p>

                      <h3 className="mt-2 font-display text-2xl font-bold text-textPrimary">
                        {safeText(mission.causeImpact || mission.cause)}
                      </h3>

                      <p className="mt-2 text-sm text-textSecondary">
                        {safeText(mission.cause)}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="font-numbers text-2xl font-bold text-goldLight">
                        {money(mission.totalDonated || totalDonated)}
                      </p>

                      <p className="text-sm text-textSecondary">
                        {Number(mission.donations || 1)} donation
                        {Number(mission.donations || 1) === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-gold" />
              <h2 className="font-display text-3xl font-bold text-textPrimary">
                Recent Legacy Tiles
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {recentTiles.map((tile, index) => (
                <div
                  key={tile.id || index}
                  className="rounded-[1.5rem] border border-gold/20 bg-black/25 p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <RankBadge rank={tile.rank || profile.rank} size="sm" />

                    <p className="font-numbers text-lg font-bold text-goldLight">
                      {money(tile.amountUSD || totalDonated)}
                    </p>
                  </div>

                  <p className="min-h-[72px] text-textSecondary">
                    “{safeText(tile.message, "A public legacy tile was created.")}”
                  </p>

                  <div className="mt-4 border-t border-borderRoyal pt-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">
                      Mission
                    </p>
                    <p className="mt-1 text-sm text-textPrimary">
                      {safeText(tile.cause || tile.causeImpact || profile.cause)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6">
            <div className="mb-6 flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-gold" />
              <h2 className="font-display text-3xl font-bold text-textPrimary">
                Legacy Timeline
              </h2>
            </div>

            <TimelineList
              items={profile.timeline || []}
              emptyMessage="This donor does not have timeline events yet."
            />
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
                  Create your own public donor profile, legacy tile, and rank on One Earth Legacy.
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
