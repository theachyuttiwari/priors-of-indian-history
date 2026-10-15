import { ACTION_META, type ActionType } from "@/lib/schema";

export default function ActionChip({ type, count, dim }: { type: ActionType; count?: number; dim?: boolean }) {
  return (
    <span className={`chip ${dim ? "dim" : ""}`}>
      {ACTION_META[type].label}
      {count !== undefined && count > 1 && <span className="num text-ink-3">×{count}</span>}
    </span>
  );
}
