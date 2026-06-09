export default function PublicStateBox({
  title,
  message,
  variant = "default"
}) {
  const variantClass =
    variant === "error"
      ? "border-crimson/40 bg-crimson/10"
      : "border-borderRoyal bg-royalCard";

  return (
    <div className={`rounded-[1.5rem] border p-10 text-center ${variantClass}`}>
      {title && (
        <p className="font-display text-2xl text-goldLight">
          {title}
        </p>
      )}

      <p className={title ? "mt-2 text-textSecondary" : "text-textSecondary"}>
        {message}
      </p>
    </div>
  );
}