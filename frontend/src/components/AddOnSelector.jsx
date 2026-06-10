export default function AddOnSelector({
  addOns = [],
  selectedAddOns = [],
  onToggleAddOn
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {addOns.map((addOn) => (
        <button
          key={addOn.id}
          type="button"
          onClick={() => onToggleAddOn(addOn.id)}
          className={`rounded-2xl border p-5 text-left ${
            selectedAddOns.includes(addOn.id)
              ? "border-gold bg-gold/10"
              : "border-borderRoyal bg-black/30 hover:border-gold"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="font-bold text-textPrimary">
              {addOn.name}
            </p>

            <p className="font-numbers font-bold text-goldLight">
              ${Number(addOn.price || 0).toFixed(2)}
            </p>
          </div>

          {addOn.description && (
            <p className="mt-2 text-sm leading-6 text-textSecondary">
              {addOn.description}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}