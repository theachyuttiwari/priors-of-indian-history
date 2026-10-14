import Link from "next/link";
import { allCorrections, entryHref, fmtDate } from "@/lib/content";
import { CORRECTION_FORM } from "@/lib/site";

export const metadata = { title: "Corrections" };

const KIND = { correction: "Correction", clarification: "Clarification", update: "Update" } as const;

export default function CorrectionsPage() {
  const items = allCorrections();
  return (
    <article className="measure space-y-10">
      <header>
        <h1 className="t-1">Corrections</h1>
        <p className="lede mt-4">Every change to a checked entry is listed here, newest first.</p>
        <p className="text-ink-2 mt-4">
          A <strong className="text-ink">correction</strong> fixes an error. A{" "}
          <strong className="text-ink">clarification</strong> makes something clearer without changing a fact. An{" "}
          <strong className="text-ink">update</strong> adds what happened later. An error is always called a correction.
        </p>
        <p className="mt-4">
          <a href={CORRECTION_FORM} className="link" rel="noreferrer">
            Report an error
          </a>
          <span className="small">. Bring a source. Corrections are handled in public.</span>
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-ink-2 border-t border-line pt-6">No corrections yet.</p>
      ) : (
        <ol className="rows border-t border-line">
          {items.map((c, i) => (
            <li key={i} className="py-4">
              <p className="small num">
                <time dateTime={c.date}>{fmtDate(c.date)}</time> · {KIND[c.kind]}
              </p>
              <p className="mt-1">
                <Link href={entryHref(c.p)} className="quiet font-semibold">
                  {c.p.title}
                </Link>
              </p>
              <p className="text-[15px] text-ink-2 mt-1">{c.note}</p>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
