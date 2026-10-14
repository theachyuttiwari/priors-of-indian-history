import { ACTION_META, type ActionType } from "@/lib/schema";
import Glyph from "./Glyph";

export default function ActionChip({ type, count, dim }: { type: ActionType; count?: number; dim?: boolean }) {
  return (
    <span className={`chip ${dim ? "dim" : ""}`}>
      <Glyph group={ACTION_META[type].group} />
      {ACTION_META[type].label}
      {count !== undefined && count > 1 && <span className="num text-ink-3">×{count}</span>}
    </span>
  );
}
