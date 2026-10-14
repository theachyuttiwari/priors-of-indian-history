import type { Position, Precedent } from "@/lib/schema";
import { EvidenceMark, credit, languageName } from "./Evidence";

/**
 * What a person said. Only words matched in the source go inside quote marks: a verbatim or
 * translated quote. Anything else is Priors' summary and is labelled as one.
 */
export default function StatementText({
  p,
  pos,
  size = "base",
}: {
  p: Precedent;
  pos: Position;
  size?: "base" | "sm";
}) {
  const sources = p.sources.filter((s) => pos.sources.includes(s.id));
  const body = size === "sm" ? "text-[15px] text-ink-2" : "leading-relaxed";
  const q = pos.quote;
  const quoted = q && (pos.kind === "verbatim" || pos.kind === "translated");
  const translator =
    q?.translated_by === "source" ? credit(p.sources.find((s) => s.id === q.source)!) || "the source" : "Priors";
  return (
    <div>
      {quoted ? (
        <p className={body}>
          <span className="text-ink">“{q.text}”</span>
        </p>
      ) : (
        <p className={body}>{pos.statement}</p>
      )}
      <p className="small mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {pos.kind === "paraphrase" && <span>Summary, not a quote</span>}
        {quoted && pos.kind === "translated" && (
          <span>
            Translated from {languageName(q.language ?? "")} by {translator}
          </span>
        )}
        {quoted && q.locator && <span>At {q.locator}</span>}
        <EvidenceMark claim="said" sources={sources} />
      </p>
      {quoted && pos.kind === "translated" && q.original && (
        <details className="mt-1 small">
          <summary className="cursor-pointer link inline">Original words</summary>
          <p lang={q.language} className="text-ink-2 mt-1 text-[15px]">
            “{q.original}”
          </p>
        </details>
      )}
    </div>
  );
}
