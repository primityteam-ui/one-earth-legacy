import { Loader2 } from "lucide-react";

export default function ActionButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  icon,
  variant = "outline",
  loadingText = "Loading...",
  type = "button",
  className = ""
}) {
  const variantClass =
    variant === "gold"
      ? "bg-gradient-to-r from-goldLight via-gold to-goldLight text-black shadow-gold hover:brightness-110"
      : variant === "green"
        ? "border border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black"
        : "border border-gold text-goldLight hover:bg-gold hover:text-black";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 font-bold disabled:cursor-not-allowed disabled:opacity-70 ${variantClass} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        icon
      )}

      {loading ? loadingText : children}
    </button>
  );
}