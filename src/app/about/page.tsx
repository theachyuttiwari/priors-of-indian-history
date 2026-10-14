export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <article className="prose-custom max-w-2xl space-y-10">
      <header>
        <p className="eyebrow">Method</p>
        <h1 className="display text-4xl mt-2">About Priors</h1>
        <p className="text-ink-2 mt-4 leading-relaxed">
          Priors is a public record of how Indian governments answer protests. It exists because memory is short
          and the record is long. A new generation sees today&apos;s crackdown or today&apos;s permission without the
          thirty cases before it. Priors puts them side by side.
        </p>
      </header>

      <section>
        <h2 className="display text-2xl">Three rules</h2>
        <ol className="list-decimal pl-5 mt-3 space-y-2 text-ink-2">
          <li>Every claim links to a dated source. No source, no claim.</li>
          <li>Every party gets the same columns. The data model, not the editor, enforces symmetry.</li>
          <li>Describe actions. Do not judge them. The reader judges.</li>
        </ol>
      </section>

      <section>
        <h2 className="display text-2xl">What an entry is</h2>
        <p className="text-ink-2 mt-3">
          One precedent is one protest and one government&apos;s answer to it. It records who was in power at the
          Centre and in the state, each action the government took with a date and a source, the outcome, and what
          parties said at the time, marked as in power or in opposition.
        </p>
        <p className="text-ink-2 mt-3">
          Entries live as YAML files in the repository under <code className="mono text-xs">content/precedents</code>. The schema is in{" "}
          <code className="mono text-xs">content/SCHEMA.md</code>. Add or fix an entry by pull request.
        </p>
      </section>

      <section id="pipeline">
        <h2 className="display text-2xl">How current events get in</h2>
        <p className="text-ink-2 mt-3">
          A pipeline runs on a schedule. It searches recent news for protests in India and government responses,
          opens the sources, extracts actions and statements into the same schema, and matches the event to the
          closest precedents. It then opens a pull request. Entries it wrote carry a &quot;not yet reviewed&quot; mark
          until a person checks the sources and removes it.
        </p>
        <p className="text-ink-2 mt-3">
          The pipeline uses Claude with web search and web fetch. It can be wrong. The source links are there so you
          can check.
        </p>
      </section>

      <section>
        <h2 className="display text-2xl">How counts work</h2>
        <p className="text-ink-2 mt-3">
          An action by the Centre counts for the party ruling the Centre. An action by a state government or its
          police counts for the party ruling that state. Court orders count for nobody. A count is a count of entries
          in this archive, not a measure of severity, and parties with longer time in power will have more.
        </p>
      </section>

      <section>
        <h2 className="display text-2xl">Licence</h2>
        <p className="text-ink-2 mt-3">Code is MIT. Content is CC BY 4.0. Sources belong to their publishers.</p>
      </section>
    </article>
  );
}
