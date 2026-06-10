export default function PreviewItem({
  label,
  value,
  className = ""
}) {
  return (
    <div className={`rounded-2xl border border-borderRoyal bg-black/30 p-4 ${className}`}>
      <p className="text-sm text-textSecondary">
        {label}
      </p>

      <p className="mt-1 break-words font-bold text-textPrimary">
        {value}
      </p>
    </div>
  );
}