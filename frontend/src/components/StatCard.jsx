export default function StatCard({
  icon,
  label,
  value,
  subtext = "",
  variant = "default"
}) {
  const variantClass =
    variant === "gold"
      ? "border-gold/30 bg-gold/10"
      : "border-borderRoyal bg-royalPanel";

  return (
    <div className={`rounded-[1.5rem] border p-6 ${variantClass}`}>
      {icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
          {icon}
        </div>
      )}

      <p className="text-sm text-textSecondary">{label}</p>

      <p className="mt-2 font-numbers text-2xl font-bold text-textPrimary">
        {value}
      </p>

      {subtext && (
        <p className="mt-2 text-sm text-textSecondary">
          {subtext}
        </p>
      )}
    </div>
  );
}