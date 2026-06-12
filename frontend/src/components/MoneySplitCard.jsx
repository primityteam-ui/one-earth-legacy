export default function MoneySplitCard({
  title = "Transparent money split",
  causeLabel = "60% Cause",
  causeAmount = 0,
  platformLabel = "25% Platform sustainability",
  platformAmount = 0,
  lotteryLabel = "15% Legacy Impact Reserve",
  lotteryAmount = 0,
  showBars = false,
  note = ""
}) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5">
      <p className="mb-4 font-display text-xl font-bold text-textPrimary">
        {title}
      </p>

      {showBars ? (
        <>
          <SplitBar label={causeLabel} value={causeAmount} width="60%" />
          <SplitBar label={platformLabel} value={platformAmount} width="25%" />
          <SplitBar label={lotteryLabel} value={lotteryAmount} width="15%" />
        </>
      ) : (
        <>
          <SplitRow label={causeLabel} value={causeAmount} />
          <SplitRow label={platformLabel} value={platformAmount} />
          <SplitRow label={lotteryLabel} value={lotteryAmount} />
        </>
      )}

      {note && (
        <p className="mt-5 rounded-2xl border border-borderRoyal bg-black/30 p-4 text-sm text-textSecondary">
          {note}
        </p>
      )}
    </div>
  );
}

function SplitRow({ label, value }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4 text-sm">
      <span className="text-textSecondary">{label}</span>
      <span className="font-numbers font-bold text-goldLight">
        ${Number(value || 0).toFixed(2)}
      </span>
    </div>
  );
}

function SplitBar({ label, value, width }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-textSecondary">{label}</span>
        <span className="font-numbers font-bold text-goldLight">
          ${Number(value || 0).toFixed(2)}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-royalBlack">
        <div className="h-full rounded-full bg-gold" style={{ width }} />
      </div>
    </div>
  );
}