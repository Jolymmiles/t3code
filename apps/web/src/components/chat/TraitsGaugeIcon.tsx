import type { TraitsGauge } from "@t3tools/client-runtime/model-traits";
import { cn } from "~/lib/utils";
import type { ComposerControlSize } from "./ComposerControl";

const CENTER_X = 12;
const CENTER_Y = 14;
const RADIUS = 10;
const START_DEGREES = 210;
const SWEEP_DEGREES = 240;
const GAP_DEGREES = 12;
const NEEDLE_LENGTH = 6;

function pointAt(degrees: number, radius: number) {
  const radians = (degrees * Math.PI) / 180;
  return `${(CENTER_X + radius * Math.cos(radians)).toFixed(2)} ${(CENTER_Y - radius * Math.sin(radians)).toFixed(2)}`;
}

function arcPath(fromDegrees: number, toDegrees: number) {
  const largeArc = fromDegrees - toDegrees > 180 ? 1 : 0;
  return `M${pointAt(fromDegrees, RADIUS)}A${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${pointAt(toDegrees, RADIUS)}`;
}

export function TraitsGaugeIcon({
  gauge,
  size = "sm",
}: {
  gauge: TraitsGauge;
  size?: ComposerControlSize;
}) {
  const levels = gauge.reasoning?.levels ?? 1;
  const level = gauge.reasoning?.level ?? 0;
  const step = SWEEP_DEGREES / levels;
  const gap = levels > 1 ? GAP_DEGREES : 0;
  const needleDegrees = START_DEGREES - step * (level + 0.5);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      data-composer-control-icon
      className={cn("shrink-0", size === "xs" ? "size-3" : "size-4")}
    >
      <g
        strokeLinecap="butt"
        className={cn(
          gauge.speed === "fast" && "text-warning",
          gauge.speed === "ultrafast" && "text-destructive",
        )}
      >
        {Array.from({ length: levels }, (_, index) => (
          <path
            key={index}
            d={arcPath(
              START_DEGREES - step * index - (index > 0 ? gap / 2 : 0),
              START_DEGREES - step * (index + 1) + (index < levels - 1 ? gap / 2 : 0),
            )}
            opacity={index <= level ? 1 : 0.3}
          />
        ))}
      </g>
      <path d={`M${CENTER_X} ${CENTER_Y}L${pointAt(needleDegrees, NEEDLE_LENGTH)}`} />
    </svg>
  );
}
