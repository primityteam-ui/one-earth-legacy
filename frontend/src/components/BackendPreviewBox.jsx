import PreviewItem from "./PreviewItem.jsx";

export default function BackendPreviewBox({
  backendPreview
}) {
  if (!backendPreview) {
    return null;
  }

  return (
    <div className="mt-5 rounded-[1.5rem] border border-gold/30 bg-gold/10 p-5">
      <p className="font-display text-2xl font-bold text-textPrimary">
        Backend Preview Created
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <PreviewItem label="Rank" value={backendPreview.rank} />
        <PreviewItem
          label="Total today"
          value={`$${Number(backendPreview.totalToday || 0).toFixed(2)}`}
        />
        <PreviewItem
          label="Cause amount"
          value={`$${Number(backendPreview.split?.causeAmount || 0).toFixed(2)}`}
        />
        <PreviewItem
          label="Platform amount"
          value={`$${Number(backendPreview.split?.platformAmount || 0).toFixed(2)}`}
        />
        <PreviewItem
          label="Legacy Impact Reserve amount"
          value={`$${Number(backendPreview.split?.lotteryAmount || 0).toFixed(2)}`}
        />
        <PreviewItem label="Status" value={backendPreview.paymentStatus} />
      </div>

      {backendPreview.nextRank && (
        <p className="mt-4 text-textSecondary">
          Backend says you are{" "}
          <span className="font-bold text-goldLight">
            ${backendPreview.nextRank.amountNeeded}
          </span>{" "}
          away from {backendPreview.nextRank.name}.
        </p>
      )}

      {backendPreview.note && (
        <p className="mt-4 text-sm text-textSecondary">
          {backendPreview.note}
        </p>
      )}
    </div>
  );
}