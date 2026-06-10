export default function SelectedImpactCard({
  cause,
  description
}) {
  return (
    <div className="rounded-[1.5rem] border border-gold/30 bg-gold/10 p-5">
      <p className="mb-2 text-sm uppercase tracking-[0.25em] text-gold">
        Your Selected Impact
      </p>

      <p className="font-display text-xl font-bold text-textPrimary">
        {cause}
      </p>

      {description && (
        <p className="mt-2 text-sm leading-6 text-textSecondary">
          {description}
        </p>
      )}
    </div>
  );
}