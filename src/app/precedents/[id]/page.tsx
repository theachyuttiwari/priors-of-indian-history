import { notFound } from "next/navigation";
import Link from "next/link";
import { getPrecedent, getPrecedents, fmtPeriod, similar } from "@/lib/content";
import Timeline from "@/components/Timeline";
import Positions from "@/components/Positions";
import Sources from "@/components/Sources";
import PartyMark from "@/components/PartyMark";
import PrecedentCard from "@/components/PrecedentCard";

export function generateStaticParams() {
  return getPrecedents().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = getPrecedent((await params).id);
  return { title: p?.title ?? "Precedent" };
}

export default async function PrecedentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPrecedent(id);
  if (!p) notFound();
  const related = similar(p, 4).filter((x) => x.p.id !== p.id).slice(0, 3);
  return (
    <article className="space-y-14">
      <header>
        <p className="eyebrow">
          <Link href="/precedents/" className="quiet">
            Precedents
          </Link>{" "}
          / {fmtPeriod(p.period)}
        </p>
        <h1 className="display text-4xl sm:text-5xl mt-3 max-w-3xl">{p.title}</h1>
        <p className="text-lg text-ink-2 mt-5 max-w-3xl leading-relaxed">{p.summary}</p>
        <dl className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <dt className="eyebrow">Centre</dt>
            <dd className="mt-1">
              <PartyMark party={p.government.centre.party} role={p.government.centre.alliance} />
              <div className="text-ink-3 text-xs">
                {p.government.centre.head}
                {p.government.centre.role ? `, ${p.government.centre.role}` : ""}
              </div>
            </dd>
          </div>
          {p.government.state && (
            <div>
              <dt className="eyebrow">State · {p.government.state.name}</dt>
              <dd className="mt-1">
                <PartyMark party={p.government.state.party} />
                <div className="text-ink-3 text-xs">
                  {p.government.state.head}
                  {p.government.state.role ? `, ${p.government.state.role}` : ""}
                </div>
              </dd>
            </div>
          )}
          {p.protest.cause && (
            <div>
              <dt className="eyebrow">Cause</dt>
              <dd className="mt-1 text-ink-2">{p.protest.cause}</dd>
            </div>
          )}
          {p.protest.scale && (
            <div>
              <dt className="eyebrow">Scale</dt>
              <dd className="mt-1 text-ink-2">{p.protest.scale}</dd>
            </div>
          )}
          {p.protest.organisers.length > 0 && (
            <div>
              <dt className="eyebrow">Organisers</dt>
              <dd className="mt-1 text-ink-2">{p.protest.organisers.join(", ")}</dd>
            </div>
          )}
          {p.location.states.length > 0 && (
            <div>
              <dt className="eyebrow">Where</dt>
              <dd className="mt-1 text-ink-2">{[...p.location.places, ...p.location.states].join(", ")}</dd>
            </div>
          )}
        </dl>
      </header>

      <section>
        <h2 className="display text-2xl mb-6">What the government did</h2>
        <Timeline p={p} />
      </section>

      {p.outcome && (
        <section>
          <h2 className="display text-2xl mb-3">Outcome</h2>
          <p className="text-ink-2 max-w-3xl">{p.outcome}</p>
        </section>
      )}

      {p.positions.length > 0 && (
        <section>
          <h2 className="display text-2xl mb-2">What they said</h2>
          <p className="text-xs text-ink-3 mb-6">
            <span className="text-accent">Gold</span> edge: speaker&apos;s party was in power. <span className="text-cool">Blue</span>{" "}
            edge: in opposition.
          </p>
          <Positions p={p} />
        </section>
      )}

      <section>
        <h2 className="display text-2xl mb-4">Sources</h2>
        <Sources p={p} />
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="display text-2xl mb-4">Similar priors</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map(({ p: r, shared }) => (
              <PrecedentCard key={r.id} p={r} highlight={shared} />
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-ink-3">
        Something wrong or missing?{" "}
        <a className="link" href={`https://github.com/`} rel="noreferrer">
          Edit content/precedents/{p.id}.yaml
        </a>
      </p>
    </article>
  );
}
