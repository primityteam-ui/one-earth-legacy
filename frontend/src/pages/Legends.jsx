import { motion } from "framer-motion";
import { Crown, Flame, Gem, Medal, ShieldCheck, Trophy } from "lucide-react";

const legends = [
  {
    id: 1,
    name: "The Empty Throne",
    country: "Global",
    flag: "🌍",
    rank: "Emperor",
    amount: 1000000,
    title: "Awaiting the First Emperor",
    message: "The throne is still empty. The first Emperor will become the permanent center of One Earth Legacy."
  },
  {
    id: 2,
    name: "Maya Singh",
    country: "India",
    flag: "🇮🇳",
    rank: "Duke",
    amount: 25000,
    title: "Founding Legend",
    message: "Let this stand as a promise for future generations."
  },
  {
    id: 3,
    name: "Lucas Silva",
    country: "Brazil",
    flag: "🇧🇷",
    rank: "Baron",
    amount: 6800,
    title: "Climate Guardian",
    message: "A legacy bigger than one lifetime."
  },
  {
    id: 4,
    name: "Aarav Mehta",
    country: "India",
    flag: "🇮🇳",
    rank: "Lord",
    amount: 1250,
    title: "Water Patron",
    message: "For clean water and future generations."
  },
  {
    id: 5,
    name: "Isabella Rossi",
    country: "Italy",
    flag: "🇮🇹",
    rank: "Knight",
    amount: 550,
    title: "Legacy Builder",
    message: "Purpose should be visible."
  },
  {
    id: 6,
    name: "Sophia Carter",
    country: "USA",
    flag: "🇺🇸",
    rank: "Knight",
    amount: 420,
    title: "Education Supporter",
    message: "Small acts can become permanent impact."
  }
];

export default function Legends() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <section className="mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              Hall of Legends
            </p>

            <h1 className="font-display text-4xl font-bold md:text-6xl">
              Permanent Legends
            </h1>

            <p className="mt-4 max-w-3xl text-textSecondary">
              The Hall of Legends honors the highest all-time donors. These positions are earned through real cumulative impact and cannot be bought separately.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
            <p className="text-sm text-goldLight">Permanent list</p>
            <p className="font-numbers text-3xl font-bold text-textPrimary">
              Top 100
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-5 md:grid-cols-3">
        <StatCard icon={<Trophy />} label="Legend positions" value="100" />
        <StatCard icon={<Crown />} label="Emperor position" value="#1" />
        <StatCard icon={<ShieldCheck />} label="Bought separately" value="Never" />
      </section>

      <section className="grid gap-6">
        {legends.map((legend, index) => (
          <LegendRow key={legend.id} legend={legend} position={index + 1} />
        ))}
      </section>
    </main>
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

function LegendRow({ legend, position }) {
  const isEmperor = position === 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.05 }}
      className={`rounded-[2rem] border bg-royalCard p-6 ${
        isEmperor ? "border-gold/60 shadow-gold" : "border-borderRoyal"
      }`}
    >
      <div className="grid gap-6 lg:grid-cols-[100px_1fr_220px] lg:items-center">
        <div className="flex items-center gap-4 lg:block">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full border ${
              isEmperor
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-borderRoyal bg-black/30 text-gold"
            }`}
          >
            {isEmperor ? <Crown className="h-8 w-8" /> : <Medal className="h-8 w-8" />}
          </div>

          <p className="font-numbers text-3xl font-bold text-goldLight lg:mt-4">
            #{position}
          </p>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="text-3xl">{legend.flag}</span>

            <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-bold text-goldLight">
              {legend.rank}
            </span>

            <span className="rounded-full border border-borderRoyal bg-black/30 px-3 py-1 text-sm text-textSecondary">
              {legend.country}
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold text-textPrimary">
            {legend.name}
          </h2>

          <p className="mt-1 flex items-center gap-2 text-goldLight">
            {isEmperor ? <Flame className="h-4 w-4" /> : <Gem className="h-4 w-4" />}
            {legend.title}
          </p>

          <p className="mt-4 max-w-3xl text-textSecondary">{legend.message}</p>
        </div>

        <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5 text-left lg:text-right">
          <p className="text-sm text-textSecondary">All-time donated</p>
          <p className="mt-2 font-numbers text-4xl font-bold text-goldLight">
            ${legend.amount.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.article>
  );
}