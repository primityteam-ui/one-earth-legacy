import { Crown } from "lucide-react";
import RankBadge from "./RankBadge.jsx";

export default function DonationTilePreview({
  rank,
  anonymous = false,
  displayName = "",
  message = "",
  theme = "Gold",
  amount = 0
}) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-black/40 p-6">
      <div className="mb-4 flex items-center justify-between">
        <RankBadge rank={rank || "Spark"} size="md" />
        <Crown className="h-8 w-8 text-gold" />
      </div>

      <h2 className="font-display text-3xl font-bold text-textPrimary">
        {anonymous ? "Anonymous" : displayName || "Your Name"}
      </h2>

      <p className="mt-3 min-h-[72px] text-textSecondary">
        {message || "Your message will appear here."}
      </p>

      <div className="mt-5 flex items-end justify-between border-t border-borderRoyal pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">
            Theme
          </p>
          <p className="text-textPrimary">{theme}</p>
        </div>

        <div className="text-right">
          <p className="font-numbers text-3xl font-bold text-goldLight">
            ${Number(amount || 0).toLocaleString()}
          </p>
          <p className="text-xs text-textSecondary">Donation</p>
        </div>
      </div>
    </div>
  );
}