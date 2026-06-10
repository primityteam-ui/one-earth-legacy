export default function PageHero({
  eyebrow,
  title,
  description,
  rightLabel,
  rightValue,
  rightContent,
  className = ""
}) {
  return (
    <section
      className={`mb-8 rounded-[2rem] border border-gold/25 bg-royalCard p-8 shadow-gold ${className}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow && (
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-gold">
              {eyebrow}
            </p>
          )}

          <h1 className="font-display text-4xl font-bold md:text-6xl">
            {title}
          </h1>

          {description && (
            <p className="mt-4 max-w-3xl text-textSecondary">
              {description}
            </p>
          )}
        </div>

        {rightContent ? (
          rightContent
        ) : rightLabel || rightValue ? (
          <div className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
            {rightLabel && (
              <p className="text-sm text-goldLight">
                {rightLabel}
              </p>
            )}

            {rightValue && (
              <p className="font-display text-2xl font-bold text-textPrimary">
                {rightValue}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}