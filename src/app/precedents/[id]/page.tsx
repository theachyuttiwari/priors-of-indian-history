import { notFound } from "next/navigation";
import Link from "next/link";
import { getPrecedent, getPrecedents, fmtPeriod, similar, entryUpdated, fmtDate } from "@/lib/content";
import { REPO } from "@/lib/site";
import Timeline from "@/components/Timeline";
import Positions from "@/components/Positions";
import Sources from "@/components/Sources";
import PartyMark from "@/components/PartyMark";
import PrecedentRow from "@/components/PrecedentRow";
import ReviewNote from "@/components/ReviewNote";
import CorrectionsList from "@/components/CorrectionsList";

export function generateStaticParams() {
  return getPrecedents().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = getPrecedent((await params).id);
  return { title: p?.title ?? "Precedent" };
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] sm:grid-cols-[7.5rem_1fr] gap-x-[14px] py-3 border-t border-line">
      <dt className="small pt-0.5">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default async function PrecedentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPrecedent(id);
  if (!p) notFound();
  const related = similar(p, 4)
    .filter((x) => x.p.id !== p.id)
    .slice(0, 3);
  const { centre, state } = p.government;
  return (
    <article className="space-y-20">
      <header>
        <Link href="/precedents/" className="link small">
          Precedents
        </Link>
        <h1 className="t-1 mt-4 max-w-3xl">{p.title}</h1>
        <p className="small num mt-3">
          {fmtPeriod(p.period)}
          {p.location.states.length > 0 && <>, {[...p.location.places, ...p.location.states].join(", ")}</>}
        </p>
        <p className="lede mt-6 measure">{p.summary}</p>
        <ReviewNote p={p} className="mt-6" />
        <dl className="mt-10 max-w-3xl border-b border-line">
          <Fact term="Centre">
            <PartyMark party={centre.party} role={centre.alliance} />
            {centre.head && (
              <span className="text-ink-2">
                , {centre.head}
                {centre.role ? `, ${centre.role}` : ""}
              </span>
            )}
          </Fact>
          {state && (
            <Fact term={`State`}>
              <PartyMark party={state.party} />
              <span className="text-ink-2">
                {state.name ? ` in ${state.name}` : ""}
                {state.head ? `, ${state.head}` : ""}
                {state.role ? `, ${state.role}` : ""}
              </span>
            </Fact>
          )}
          {p.protest.cause && (
            <Fact term="Cause">
              <span className="text-ink-2">{p.protest.cause}</span>
            </Fact>
          )}
          {p.protest.organisers.length > 0 && (
            <Fact term="Organisers">
              <span className="text-ink-2">{p.protest.organisers.join(", ")}</span>
            </Fact>
          )}
          {p.protest.scale && (
            <Fact term="Scale">
              <span className="text-ink-2">{p.protest.scale}</span>
            </Fact>
          )}
        </dl>
      </header>

      <section>
        <h2 className="t-2 mb-6">What the government did</h2>
        <Timeline p={p} />
      </section>

      {p.outcome && (
        <section>
          <h2 className="t-2 mb-3">Outcome</h2>
          <p className="text-ink-2 measure">{p.outcome}</p>
        </section>
      )}

      {p.positions.length > 0 && (
        <section>
          <h2 className="t-2 mb-2">What they said</h2>
          <p className="small mb-8 measure">
            Words in quote marks were matched in the source. Everything else is a summary; open the source for the exact
            words. Each statement says whether the speaker&apos;s party was in power or in opposition at the time.
          </p>
          <Positions p={p} />
        </section>
      )}

      <section>
        <h2 className="t-2 mb-6">Sources</h2>
        <Sources p={p} />
      </section>

      {p.corrections.length > 0 && (
        <section>
          <h2 className="t-2 mb-6">Corrections and updates</h2>
          <CorrectionsList items={p.corrections} />
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="t-2 mb-2">Similar precedents</h2>
          <p className="small mb-4">Faded actions are ones this precedent does not share.</p>
          <div className="rows border-t border-line">
            {related.map(({ p: r, shared }) => (
              <PrecedentRow key={r.id} p={r} highlight={shared} detail />
            ))}
          </div>
        </section>
      )}

      <p className="small">
        {entryUpdated(p) && <>Entry last updated {fmtDate(entryUpdated(p))}. </>}
        Something wrong or missing?{" "}
        <a className="link" href={`${REPO}/blob/main/content/precedents/${p.id}.yaml`} rel="noreferrer">
          Edit content/precedents/{p.id}.yaml
        </a>
      </p>
    </article>
  );
}
