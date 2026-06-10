export default function SummaryRow({
  label,
  value,
  strong = false,
  className = ""
}) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-4 ${className}`}>
      <span className={strong ? "font-bold text-textPrimary" : "text-textSecondary"}>
        {label}
      </span>

      <span
        className={
          strong
            ? "font-numbers text-2xl font-bold text-goldLight"
            : "font-numbers text-textPrimary"
        }
      >
        {value}
      </span>
    </div>
  );
}