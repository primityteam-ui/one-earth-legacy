import MissionIcon from "./MissionIcon.jsx";

export default function MissionSelector({
  legacyMissions = [],
  selectedMissionId,
  selectedImpactId,
  onSelectMission,
  onSelectImpact,
  cause,
  selectedMission
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {legacyMissions.map((mission) => (
          <button
            key={mission.id}
            type="button"
            onClick={() => onSelectMission(mission)}
            className={`rounded-[1.5rem] border p-5 text-left transition ${
              selectedMissionId === mission.id
                ? "border-gold bg-gold/10 shadow-gold"
                : "border-borderRoyal bg-black/30 hover:border-gold"
            }`}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold">
              <MissionIcon iconName={mission.iconName} />
            </div>

            <p className="font-display text-xl font-bold text-textPrimary">
              {mission.name}
            </p>

            <p className="mt-2 text-sm leading-6 text-textSecondary">
              {mission.tagline}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-gold">
          Exact Impact
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {(selectedMission?.impacts || []).map((impact) => (
            <button
              key={impact.id}
              type="button"
              onClick={() => onSelectImpact(impact.id)}
              className={`rounded-2xl border p-5 text-left transition ${
                selectedImpactId === impact.id
                  ? "border-gold bg-gold text-black"
                  : "border-borderRoyal bg-black/30 text-textPrimary hover:border-gold"
              }`}
            >
              <p className="font-bold">{impact.name}</p>

              <p
                className={`mt-2 text-sm leading-6 ${
                  selectedImpactId === impact.id
                    ? "text-black/70"
                    : "text-textSecondary"
                }`}
              >
                {impact.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-gold">
          Selected Impact Path
        </p>

        <p className="mt-2 font-display text-2xl font-bold text-textPrimary">
          {cause}
        </p>

        <p className="mt-2 text-sm leading-6 text-textSecondary">
          This exact impact path will be saved into Stripe metadata, MongoDB donation data,
          and the public audit record.
        </p>
      </div>
    </>
  );
}