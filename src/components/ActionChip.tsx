import { ACTION_META, type ActionType } from "@/lib/schema";

const GROUP_COLOR: Record<string, string> = {
  restrict: "var(--restrict)",
  legal: "var(--legal)",
  force: "var(--force)",
  engage: "var(--engage)",
  other: "var(--other)",
};

export function groupColor(t: ActionType) {
  return GROUP_COLOR[ACTION_META[t].group];
}

export default function ActionChip({ type, count }: { type: ActionType; count?: number }) {
  return (
    <span className="chip">
      <span className="dot" style={{ background: groupColor(type) }} />
      {ACTION_META[type].label}
      {count !== undefined && count > 1 && <span className="mono text-ink-3">×{count}</span>}
    </span>
  );
}
