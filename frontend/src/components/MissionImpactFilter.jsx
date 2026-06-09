import { useEffect, useMemo } from "react";
import {
  getImpactsForMission,
  missionFilters
} from "../constants/legacyOptions.js";

export default function MissionImpactFilter({
  missionFilter,
  setMissionFilter,
  impactFilter,
  setImpactFilter,
  layout = "default"
}) {
  const availableImpacts = useMemo(() => {
    return getImpactsForMission(missionFilter);
  }, [missionFilter]);

  useEffect(() => {
    setImpactFilter("All Impacts");
  }, [missionFilter, setImpactFilter]);

  const wrapperClass =
    layout === "inline"
      ? "flex flex-col gap-3 md:flex-row"
      : "grid gap-4 md:grid-cols-[260px_300px]";

  return (
    <div className={wrapperClass}>
      <select
        value={missionFilter}
        onChange={(event) => setMissionFilter(event.target.value)}
        className="rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold"
      >
        {missionFilters.map((mission) => (
          <option key={mission} value={mission} className="bg-royalBlack">
            {mission}
          </option>
        ))}
      </select>

      <select
        value={impactFilter}
        onChange={(event) => setImpactFilter(event.target.value)}
        disabled={missionFilter === "All Missions"}
        className="rounded-2xl border border-borderRoyal bg-black/40 px-4 py-4 text-textPrimary outline-none focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="All Impacts" className="bg-royalBlack">
          All Impacts
        </option>

        {availableImpacts.map((impact) => (
          <option key={impact} value={impact} className="bg-royalBlack">
            {impact}
          </option>
        ))}
      </select>
    </div>
  );
}