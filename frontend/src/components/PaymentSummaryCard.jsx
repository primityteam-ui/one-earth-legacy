import SummaryRow from "./SummaryRow.jsx";

export default function PaymentSummaryCard({
  donationAmount = 0,
  addOnTotal = 0,
  totalToday = 0
}) {
  return (
    <div className="rounded-[1.5rem] border border-borderRoyal bg-black/30 p-5">
      <SummaryRow
        label="Donation"
        value={`$${Number(donationAmount || 0).toFixed(2)}`}
      />

      <SummaryRow
        label="Add-ons"
        value={`$${Number(addOnTotal || 0).toFixed(2)}`}
      />

      <div className="mt-4 border-t border-borderRoyal pt-4">
        <SummaryRow
          label="Total today"
          value={`$${Number(totalToday || 0).toFixed(2)}`}
          strong
        />
      </div>
    </div>
  );
}