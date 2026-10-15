import Link from "next/link";
import type { Metadata } from "next";
import { entryHref, fmtDate, reviewStatus } from "@/lib/content";
import { claimOf } from "@/lib/evidence";
import { ACTION_META } from "@/lib/schema";
import { absolute, firstSentence, inPowerLine, sameActionElsewhere, xIntent, type ActionPage } from "@/lib/actions";
import { EvidenceMark } from "./Evidence";
import ReviewNote from "./ReviewNote";
import Sources from "./Sources";
import SourceRefs from "./SourceRefs";

const ACTOR: Record<string, string> = {
  centre: "Centre",
  state: "State government",
  police: "Police",
  court: "Court",
  other: "Other",
};

export function actionMetadata(x: ActionPage | undefined): Metadata {
  if (!x) return { title: "Action" };
  const label = ACTION_META[x.a.type].label;
  const title = `${label}, ${x.a.date ? fmtDate(x.a.date) : "date not recorded"}: ${x.p.title}`;
  const description = `In power: ${inPowerLine(x)}. ${firstSentence(x.a.description, 240)}`;
  const images = [
    { url: absolute(x.card), width: 1200, height: 630, alt: `${label}. ${x.p.title}. In power: ${inPowerLine(x)}` },
  ];
  return {
    title,
    description,
    openGraph: { title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] sm:grid-cols-[7.5rem_1fr] gap-x-[14px] py-3 border-t border-line">
      <dt className="small pt-0.5">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** One action on its own page: what happened, who was in power, the sources, and the same action elsewhere. */
export default function ActionView({ x }: { x: ActionPage }) {
  const { p, a } = x;
  // Only the sources this action cites, numbered for this page.
  const ids = new Set([...a.sources, ...a.figures.map((f) => f.source), ...a.court_outcomes.map((c) => c.source)]);
  const own = { ...p, sources: p.sources.filter((s) => ids.has(s.id)) };
  const others = sameActionElsewhere(x);
  return (
    <article className="space-y-16">
      <header>
        <Link href={entryHref(p)} className="link small">
          {p.title}
        </Link>
        <h1 className="t-1 mt-4">{ACTION_META[a.type].label}</h1>
        <p className="small num mt-3">{a.date ? fmtDate(a.date) : "Date not recorded"}</p>
        <dl className="mt-8 max-w-3xl border-b border-line">
          <Fact term="In power">{inPowerLine(x)}</Fact>
          <Fact term="Acted">
            <span className="text-ink-2">
              {ACTOR[a.actor] ?? a.actor}
              {a.state.length > 0 && `, ${a.state.join(", ")}`}
            </span>
          </Fact>
          {a.legal_basis && (
            <Fact term="Under">
              <span className="text-ink-2">{a.legal_basis}</span>
            </Fact>
          )}
        </dl>
        <p className="mt-8 measure">
          {a.description} <SourceRefs p={own} ids={a.sources} className="small" />{" "}
          <EvidenceMark claim={claimOf(a)} sources={own.sources} />
        </p>
        {a.figures.length > 0 && (
          <ul className="figures mt-4">
            {a.figures.map((f, j) => (
              <li key={j}>
                <span className="num font-semibold text-ink">{f.value}</span> {f.what}
                <span className="small">
                  , said {f.claimed_by} <SourceRefs p={own} ids={[f.source]} />
                </span>
              </li>
            ))}
          </ul>
        )}
        {a.court_outcomes.map((c, j) => (
          <p key={j} className="text-[15px] text-ink-2 mt-3 measure">
            <span className="font-semibold text-ink">Court:</span> {c.summary}{" "}
            <SourceRefs p={own} ids={[c.source]} className="small" />
          </p>
        ))}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={xIntent(x)} target="_blank" rel="noreferrer" className="share-x">
            Post on X
          </a>
          {reviewStatus(p) === "draft" && <span className="small">The card says this entry is a draft.</span>}
        </div>
        <ReviewNote p={p} className="mt-6" />
      </header>

      {others.length > 0 && (
        <section>
          <h2 className="t-2">The same action under other governments</h2>
          <p className="small mt-2 measure">
            For each party in power, its most recent {ACTION_META[a.type].label.toLowerCase()} in another entry. Chosen
            by this rule, not by hand.
          </p>
          <ol className="rows mt-4 border-t border-line">
            {others.map((y) => (
              <li key={y.href}>
                <Link href={y.href} className="row quiet">
                  <span className="num text-ink-3 text-[15px]">{y.a.date ? y.a.date.slice(0, 4) : "–"}</span>
                  <span>
                    <span className="row-title">{y.p.title}</span>
                    <span className="block small mt-0.5">In power: {inPowerLine(y)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section>
        <h2 className="t-2">Sources</h2>
        <div className="mt-6">
          <Sources p={own} />
        </div>
      </section>
    </article>
  );
}
