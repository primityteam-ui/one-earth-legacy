import { CheckCircle2 } from "lucide-react";
import PreviewItem from "./PreviewItem.jsx";

export default function DonationSuccessBox({
  savedDonation
}) {
  if (!savedDonation) {
    return null;
  }

  return (
    <div className="mt-5 rounded-[1.5rem] border border-green-500/30 bg-green-500/10 p-5">
      <div className="mb-3 flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-green-400" />

        <p className="font-display text-2xl font-bold text-textPrimary">
          Mock Donation Saved
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <PreviewItem
          label="User"
          value={savedDonation.user?.displayName || "Unknown user"}
        />

        <PreviewItem
          label="Username"
          value={savedDonation.user?.username || "unknown"}
        />

        <PreviewItem
          label="Total donated"
          value={`$${Number(savedDonation.user?.totalDonated || 0).toFixed(2)}`}
        />

        <PreviewItem
          label="Current rank"
          value={savedDonation.user?.currentRank || "Spark"}
        />

        <PreviewItem
          label="Donation status"
          value={savedDonation.donation?.paymentStatus || "pending"}
        />

        <PreviewItem
          label="Settlement"
          value={savedDonation.donation?.settlementStatus || "pending"}
        />
      </div>

      <p className="mt-4 text-sm text-textSecondary">
        Now refresh Home, Wall, Leaderboard, Audit, and Profile pages to see this MongoDB data.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href="/wall"
          className="rounded-full border border-borderRoyal px-5 py-2 text-sm font-bold text-textPrimary hover:border-gold hover:text-gold"
        >
          View Wall
        </a>

        {savedDonation.user?.username && (
          <a
            href={`/u/${savedDonation.user.username}`}
            className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-black hover:bg-goldLight"
          >
            View Profile
          </a>
        )}

        <a
          href="/audit"
          className="rounded-full border border-borderRoyal px-5 py-2 text-sm font-bold text-textPrimary hover:border-gold hover:text-gold"
        >
          View Audit
        </a>
      </div>
    </div>
  );
}