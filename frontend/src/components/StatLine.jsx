export default function StatLine({
  icon,
  label,
  value,
  className = ""
}) {
  return (
    <div
      className={`mb-3 flex items-center justify-between gap-4 rounded-2xl border border-borderRoyal bg-black/30 p-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-gold">{icon}</span>}
        <span className="text-textSecondary">{label}</span>
      </div>

      <span className="text-right font-bold text-textPrimary">
        {value}
      </span>
    </div>
  );
}