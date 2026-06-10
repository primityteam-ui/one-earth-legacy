import { Crown, Sparkles } from "lucide-react";

export default function RankBadge({
  rank = "Spark",
  size = "sm",
  className = ""
}) {
  const isEmperor = rank === "Emperor";

  const sizeClass =
    size === "md"
      ? "px-4 py-2 text-sm"
      : size === "lg"
        ? "px-5 py-2.5 text-base"
        : "px-3 py-1 text-xs";

  const iconClass =
    size === "md"
      ? "h-4 w-4"
      : size === "lg"
        ? "h-5 w-5"
        : "h-3.5 w-3.5";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 font-bold text-goldLight ${sizeClass} ${className}`}
    >
      {isEmperor ? (
        <Crown className={iconClass} />
      ) : (
        <Sparkles className={iconClass} />
      )}

      {rank}
    </div>
  );
}