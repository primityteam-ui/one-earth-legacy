export default function AmountSelector({
  amount,
  setAmount,
  presetAmounts = [],
  nextRank
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {presetAmounts.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(value)}
            className={`rounded-2xl border px-5 py-4 font-numbers text-xl font-bold ${
              amount === value
                ? "border-gold bg-gold text-black"
                : "border-borderRoyal bg-black/30 text-textPrimary hover:border-gold"
            }`}
          >
            ${value}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-textSecondary">
          Custom amount
        </label>

        <input
          type="number"
          min="1"
          value={amount}
          onChange={(event) => setAmount(Math.max(1, Number(event.target.value)))}
          className="w-full rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 font-numbers text-2xl text-textPrimary outline-none focus:border-gold"
        />
      </div>

      {nextRank ? (
        <p className="mt-4 rounded-2xl border border-borderRoyal bg-black/30 p-4 text-textSecondary">
          You are{" "}
          <span className="font-bold text-goldLight">
            ${(nextRank.min - amount).toLocaleString()}
          </span>{" "}
          away from{" "}
          <span className="font-bold text-textPrimary">
            {nextRank.name}
          </span>
          .
        </p>
      ) : (
        <p className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-goldLight">
          You are entering Emperor territory.
        </p>
      )}
    </>
  );
}