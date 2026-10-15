/**
 * Draw a share card (1200 x 630 PNG) for every published action, into public/cards/<entry>/<slug>.png.
 * X shows the card under any post that links to the action's page. Runs before `next build`.
 *
 *   npm run cards
 */
import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { allActions, firstSentence, inPowerLine, type ActionPage } from "../src/lib/actions";
import { fmtDate, reviewStatus } from "../src/lib/content";
import { tierOf } from "../src/lib/evidence";
import { flagFor } from "../src/lib/party-flags";
import { ACTION_META } from "../src/lib/schema";

const OUT = path.join(process.cwd(), "public", "cards");
const INK = "#1d1d1f";
const INK2 = "#6e6e73";
const LINE = "#d2d2d7";

function Flag({ party }: { party: string }) {
  const f = flagFor(party);
  const box = { width: 42, height: 28, display: "flex", border: `1px solid ${LINE}`, marginRight: 14 } as const;
  if (!f) return <div style={box} />;
  const total = f.bands.reduce((n, b) => n + (b.share ?? 1), 0);
  return (
    <div style={{ ...box, flexDirection: f.direction === "vertical" ? "row" : "column" }}>
      {f.bands.map((b, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexGrow: b.share ?? 1,
            flexBasis: `${((b.share ?? 1) / total) * 100}%`,
            background: b.hex,
          }}
        />
      ))}
    </div>
  );
}

/** The best source for the card's foot: the highest-tier source the action cites. */
function leadSource(x: ActionPage): string {
  const order = ["record", "court", "recording", "report", "secondary", "lead"];
  const srcs = x.p.sources.filter((s) => x.a.sources.includes(s.id));
  srcs.sort((a, b) => order.indexOf(tierOf(a) ?? "lead") - order.indexOf(tierOf(b) ?? "lead"));
  const s = srcs[0];
  if (!s) return "";
  const more = srcs.length > 1 ? ` + ${srcs.length - 1} more` : "";
  let name = s.publisher ?? s.title;
  if (name.length > 40) name = `${name.slice(0, 40).replace(/\s+\S*$/, "")}…`;
  return `Source: ${name}${more}`;
}

function Card({ x }: { x: ActionPage }) {
  const label = ACTION_META[x.a.type].label;
  const parties = [...new Set(x.by.map((b) => b.party))];
  const draft = reviewStatus(x.p) === "draft";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        color: INK,
        padding: "56px 64px",
        fontSize: 28,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", color: INK2, fontSize: 26 }}>
        <div style={{ display: "flex", fontWeight: 700, color: INK }}>Priors</div>
        <div style={{ display: "flex" }}>{x.a.date ? fmtDate(x.a.date) : "Date not recorded"}</div>
      </div>
      <div style={{ display: "flex", fontSize: 72, fontWeight: 700, marginTop: 36, lineHeight: 1.05 }}>{label}</div>
      <div style={{ display: "flex", fontSize: 28, color: INK2, marginTop: 14, maxHeight: 76, overflow: "hidden" }}>
        {x.p.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 34, fontSize: 32 }}>
        {parties.slice(0, 3).map((party) => (
          <Flag key={party} party={party} />
        ))}
        <div style={{ display: "flex" }}>In power: {inPowerLine(x)}</div>
      </div>
      <div
        style={{ display: "flex", marginTop: 24, fontSize: 27, lineHeight: 1.35, maxHeight: 110, overflow: "hidden" }}
      >
        {firstSentence(x.a.description, 140)}
      </div>
      <div style={{ display: "flex", flexGrow: 1 }} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${LINE}`,
          paddingTop: 18,
          fontSize: 22,
          color: INK2,
        }}
      >
        <div style={{ display: "flex", maxWidth: 680, overflow: "hidden", whiteSpace: "nowrap" }}>{leadSource(x)}</div>
        <div style={{ display: "flex" }}>{draft ? "Draft: not yet checked by a person" : "Checked by a person"}</div>
      </div>
    </div>
  );
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  const all = allActions();
  for (const x of all) {
    const img = new ImageResponse(<Card x={x} />, { width: 1200, height: 630 });
    const file = path.join(OUT, x.p.id, `${x.slug}.png`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
  }
  console.log(`${all.length} cards in public/cards`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
