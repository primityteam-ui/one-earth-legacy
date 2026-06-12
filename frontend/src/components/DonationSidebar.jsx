import DonationTilePreview from "./DonationTilePreview.jsx";
import MoneySplitCard from "./MoneySplitCard.jsx";
import PaymentSummaryCard from "./PaymentSummaryCard.jsx";
import SelectedImpactCard from "./SelectedImpactCard.jsx";

export default function DonationSidebar({
  rank,
  anonymous = false,
  displayName = "",
  message = "",
  theme = "Gold",
  amount = 0,
  cause,
  impactDescription,
  causeAmount = 0,
  platformAmount = 0,
  lotteryAmount = 0,
  addOnTotal = 0,
  totalToday = 0
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="space-y-5 rounded-[2rem] border border-gold/25 bg-royalCard p-6 shadow-gold">
        <DonationTilePreview
          rank={rank}
          anonymous={anonymous}
          displayName={displayName}
          message={message}
          theme={theme}
          amount={amount}
        />

        <SelectedImpactCard
          cause={cause}
          description={impactDescription}
        />

        <MoneySplitCard
          title="Transparent money split"
          causeLabel={`60% → ${cause}`}
          causeAmount={causeAmount}
          platformLabel="25% → Platform sustainability"
          platformAmount={platformAmount}
          lotteryLabel="15% → Legacy Impact Reserve"
          lotteryAmount={lotteryAmount}
        />

        <PaymentSummaryCard
          contributionAmount={amount}
          addOnTotal={addOnTotal}
          totalToday={totalToday}
        />
      </div>
    </aside>
  );
}