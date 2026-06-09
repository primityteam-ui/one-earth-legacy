import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarHeart,
  Copy,
  Crown,
  Gift,
  History,
  Link as LinkIcon,
  PenLine,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  UserRound
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const mockDonations = [
  {
    id: 1,
    date: "Today",
    amount: "$25.00",
    rank: "Citizen",
    status: "Settled",
    cause: "Clean drinking water"
  },
  {
    id: 2,
    date: "Last week",
    amount: "$10.00",
    rank: "Citizen",
    status: "Settled",
    cause: "Global education"
  },
  {
    id: 3,
    date: "Earlier",
    amount: "$5.00",
    rank: "Spark",
    status: "Settled",
    cause: "Climate action"
  }
];

const rankSteps = [
  { name: "Spark", min: 1 },
  { name: "Citizen", min: 10 },
  { name: "Merchant", min: 50 },
  { name: "Knight", min: 250 },
  { name: "Lord", min: 1000 },
  { name: "Baron", min: 5000 },
  { name: "Duke", min: 20000 },
  { name: "Sovereign", min: 50000 },
  { name: "King/Queen", min: 100000 },
  { name: "Emperor", min: 1000000 }
];

export default function Dashboard() {
  const { user } = useAuth();

  const [tileName, setTileName] = useState(user?.displayName || "Vamshi");
  const [tileMessage, setTileMessage] = useState("My mark on One Earth.");
  const [tileTheme, setTileTheme] = useState("Gold");
  const [birthdayMode, setBirthdayMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalDonated = 40;

  const currentRank = useMemo(() => {
    return rankSteps
      .slice()
      .reverse()
      .find((rank) => totalDonated >= rank.min);
  }, [totalDonated]);

  const nextRank = useMemo(() => {
    return rankSteps.find((rank) => rank.min > totalDonated);
  }, [totalDonated]);

  const progress = nextRank
    ? Math.min(100, Math.round((totalDonated / nextRank.min) * 100))
    : 100;

  function copyReferral() {
    const referral = `http://localhost:5173/donate?ref=${user?.username || "founder"}`;
    navigator.clipboard.writeText(referral);
    setCopied(true);

    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              My Legacy
            </p>

            <h1 className="font-display text-4xl font-bold text-textPrimary md:text-5xl">
              Welcome, {user?.displayName || user?.username}
            </h1>

            <p className="mt-3 max-w-3xl text-textSecondary">
              Your secure account foundation is ready. Manage your rank, tile, donation history,
              referral link, share card, streaks, and future squad features here.
            </p>
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <Crown className="h-10 w-10" />
          </div>
        </div>
      </motion.section>

      <section className="mb-8 grid gap-5 md:grid-cols-3">
        <InfoCard icon={<UserRound />} label="Username" value={user?.username || "Not set"} />
        <InfoCard icon={<Crown />} label="Current rank" value={currentRank?.name || "Spark"} />
        <InfoCard icon={<ShieldCheck />} label="2FA status" value={user?.twoFactorEnabled ? "Enabled" : "Not enabled"} />
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <Panel
            icon={<Target className="h-5 w-5" />}
            title="Rank progress"
            subtitle="Rank is based on cumulative confirmed donations."
          >
            <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary">Total donated</p>
                  <p className="font-numbers text-4xl font-bold text-goldLight">
                    ${totalDonated.toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-textSecondary">Current rank</p>
                  <p className="font-display text-2xl font-bold text-textPrimary">
                    {currentRank?.name}
                  </p>
                </div>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-royalBlack">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {nextRank ? (
                <p className="mt-4 text-textSecondary">
                  You are{" "}
                  <span className="font-bold text-goldLight">
                    ${(nextRank.min - totalDonated).toLocaleString()}
                  </span>{" "}
                  away from <span className="font-bold text-textPrimary">{nextRank.name}</span>.
                </p>
              ) : (
                <p className="mt-4 text-goldLight">You reached the highest rank.</p>
              )}
            </div>
          </Panel>

          <Panel
            icon={<PenLine className="h-5 w-5" />}
            title="Tile editor"
            subtitle="This updates the live preview. Database saving will be connected later."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-textSecondary">
                  Display name
                </label>
                <input
                  value={tileName}
                  onChange={(event) => setTileName(event.target.value)}
                  className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-textSecondary">
                  Tile theme
                </label>
                <select
                  value={tileTheme}
                  onChange={(event) => setTileTheme(event.target.value)}
                  className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
                >
                  <option className="bg-royalBlack">Gold</option>
                  <option className="bg-royalBlack">Crimson</option>
                  <option className="bg-royalBlack">Emerald</option>
                  <option className="bg-royalBlack">Royal Blue</option>
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-textSecondary">
                Message
              </label>
              <textarea
                value={tileMessage}
                onChange={(event) => setTileMessage(event.target.value.slice(0, 280))}
                rows={4}
                className="w-full resize-none rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
              />
              <p className="mt-2 text-right text-sm text-textSecondary">
                {tileMessage.length}/280
              </p>
            </div>

            <button className="mt-4 rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight">
              Save Tile Changes
            </button>
          </Panel>

          <Panel
            icon={<History className="h-5 w-5" />}
            title="Donation history"
            subtitle="Mock data for now. Real Stripe and Razorpay records will appear here."
          >
            <div className="space-y-3">
              {mockDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="grid gap-3 rounded-[1.25rem] border border-borderRoyal bg-black/30 p-4 md:grid-cols-[1fr_120px_120px]"
                >
                  <div>
                    <p className="font-bold text-textPrimary">{donation.cause}</p>
                    <p className="text-sm text-textSecondary">
                      {donation.date} · {donation.rank}
                    </p>
                  </div>

                  <p className="font-numbers text-xl font-bold text-goldLight">
                    {donation.amount}
                  </p>

                  <p className="text-sm text-green-400">{donation.status}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[2rem] border border-gold/25 bg-royalCard p-6 shadow-gold">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gold">
              Live tile preview
            </p>

            <div className="rounded-[1.5rem] border border-gold/30 bg-black/40 p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-bold text-goldLight">
                  {currentRank?.name}
                </span>
                <Crown className="h-8 w-8 text-gold" />
              </div>

              <h2 className="font-display text-3xl font-bold text-textPrimary">
                {tileName || "Your Name"}
              </h2>

              <p className="mt-3 min-h-[80px] text-textSecondary">
                {tileMessage || "Your message appears here."}
              </p>

              <div className="mt-5 flex items-end justify-between border-t border-borderRoyal pt-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">
                    Theme
                  </p>
                  <p>{tileTheme}</p>
                </div>

                <div className="text-right">
                  <p className="font-numbers text-3xl font-bold text-goldLight">
                    ${totalDonated}
                  </p>
                  <p className="text-xs text-textSecondary">Total donated</p>
                </div>
              </div>
            </div>
          </div>

          <SidePanel
            icon={<LinkIcon className="h-5 w-5" />}
            title="Referral link"
            text="Invite friends. Referral rewards and tile effects will be connected later."
          >
            <button
              onClick={copyReferral}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-borderRoyal px-5 py-3 font-bold text-textPrimary hover:border-gold hover:text-gold"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy Referral Link"}
            </button>
          </SidePanel>

          <SidePanel
            icon={<Share2 className="h-5 w-5" />}
            title="Share card"
            text="Canvas share-card generation for Instagram and WhatsApp will be added later."
          >
            <button className="mt-4 w-full rounded-full bg-gold px-5 py-3 font-bold text-black shadow-gold hover:bg-goldLight">
              Generate Share Card
            </button>
          </SidePanel>

          <SidePanel
            icon={<Sparkles className="h-5 w-5" />}
            title="Streak tracker"
            text="Your donation streak is currently 1 day. More rewards will unlock soon."
          />

          <SidePanel
            icon={<CalendarHeart className="h-5 w-5" />}
            title="Birthday mode"
            text="Turn on birthday mode to preview the future golden birthday frame."
          >
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-borderRoyal bg-black/30 p-4">
              <span className="text-textSecondary">Birthday golden frame</span>
              <input
                type="checkbox"
                checked={birthdayMode}
                onChange={(event) => setBirthdayMode(event.target.checked)}
                className="h-5 w-5"
              />
            </label>
          </SidePanel>

          <SidePanel
            icon={<Users className="h-5 w-5" />}
            title="Squad management"
            text="Squad tiles and clan leaderboard will be added after basic donation flow."
          />

          <SidePanel
            icon={<Gift className="h-5 w-5" />}
            title="Love tile mode"
            text="Soon you can gift a tile to someone you love."
          />
        </aside>
      </section>
    </main>
  );
}

function InfoCard({ icon, label, value }) {
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

function Panel({ icon, title, subtitle, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-borderRoyal bg-royalCard p-6"
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
          {icon}
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-textPrimary">{title}</h2>
          <p className="mt-1 text-textSecondary">{subtitle}</p>
        </div>
      </div>

      {children}
    </motion.section>
  );
}

function SidePanel({ icon, title, text, children }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-royalCard p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>

      <h3 className="font-display text-xl font-bold text-textPrimary">{title}</h3>
      <p className="mt-2 text-sm text-textSecondary">{text}</p>

      {children}
    </div>
  );
}