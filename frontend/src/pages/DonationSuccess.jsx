import { Link } from "react-router-dom";
import { CheckCircle2, Crown, FileCheck2, Sparkles, Trophy } from "lucide-react";

export default function DonationSuccess() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-5 py-10">
      <section className="w-full rounded-[2rem] border border-green-500/30 bg-royalCard p-8 text-center shadow-gold">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/40 bg-green-500/10 text-green-400">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
          Stripe Test Payment
        </p>

        <h1 className="font-display text-4xl font-bold md:text-6xl">
          Payment Confirmed
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-textSecondary">
          Stripe Checkout completed successfully. Your webhook is now saving the paid donation,
          tile, rank update, and audit entries into MongoDB automatically.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<Crown />}
            title="Rank Updated"
            text="Your donor rank is updated after Stripe webhook confirmation."
          />

          <InfoCard
            icon={<FileCheck2 />}
            title="Audit Saved"
            text="Donation split entries are written into the public audit log."
          />

          <InfoCard
            icon={<Sparkles />}
            title="Tile Created"
            text="Your public legacy tile is created from the Stripe payment metadata."
          />
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-gold/25 bg-gold/10 p-5">
          <div className="mb-3 flex items-center justify-center gap-2 text-goldLight">
            <Trophy className="h-5 w-5" />
            <p className="font-display text-xl font-bold">Next check</p>
          </div>

          <p className="text-textSecondary">
            Open the Wall, Audit, and Leaderboard pages. If the webhook finished, your Stripe-paid
            donation will appear there. If not, wait a few seconds and refresh.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/wall"
            className="rounded-full bg-gold px-6 py-3 font-bold text-black shadow-gold hover:bg-goldLight"
          >
            View Wall
          </Link>

          <Link
            to="/audit"
            className="rounded-full border border-borderRoyal px-6 py-3 font-bold text-textPrimary hover:border-gold hover:text-gold"
          >
            View Audit
          </Link>

          <Link
            to="/leaderboard"
            className="rounded-full border border-borderRoyal px-6 py-3 font-bold text-textPrimary hover:border-gold hover:text-gold"
          >
            View Leaderboard
          </Link>

          <Link
            to="/donate"
            className="rounded-full border border-borderRoyal px-6 py-3 font-bold text-textPrimary hover:border-gold hover:text-gold"
          >
            Donate Again
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>

      <p className="font-display text-xl font-bold text-textPrimary">{title}</p>
      <p className="mt-2 text-sm text-textSecondary">{text}</p>
    </div>
  );
}