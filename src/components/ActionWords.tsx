import { ACTION_META, type ActionType } from "@/lib/schema";

/**
 * The actions of a precedent as words, for list rows: "Section 144 / 163 · Tear gas · Detention".
 * With `highlight`, the matching actions stay dark and the rest fade.
 */
export default function ActionWords({ types, highlight }: { types: ActionType[]; highlight?: ActionType[] }) {
  return (
    <span className="action-words">
      {types.map((t, i) => (
        <span key={t} className={highlight && !highlight.includes(t) ? "dim" : ""}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {ACTION_META[t].label}
        </span>
      ))}
    </span>
  );
}
