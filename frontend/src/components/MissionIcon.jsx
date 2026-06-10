import {
  Globe2,
  HeartPulse,
  School
} from "lucide-react";

export default function MissionIcon({
  iconName,
  className = "h-6 w-6"
}) {
  if (iconName === "heart") {
    return <HeartPulse className={className} />;
  }

  if (iconName === "school") {
    return <School className={className} />;
  }

  return <Globe2 className={className} />;
}