# Design plan: Apple-style redesign (`design/apple-light`)

Status: BUILT on this branch (2026-10-15) with the three defaults: no hue, light first, monochrome icon. Not merged.

- Visual plan: `docs/design-plan-apple-light.html` (open in a browser; light and dark).
- Same plan, published: https://claude.ai/artifact/WacCuCkAHLaNFo4uxtQCbz (private to the owner).
- Skill to use: `frontend-design@claude-plugins-official` (installed at user scope).

## Why

The current look is dark, with a saffron-gold accent, red for force and green for engagement.
Saffron and red read as party colours in India. Red and green also judge the action.
Both break README rule 3: "Describe actions. Do not judge them."

## Direction

```
 1974 ─┬──┬─────┬┬───────┬┬┬┬─────┬┬┬┬─┬┬┬──────────────┬──┬─● Now
       one tick per precedent; ticks that share an action type with
       the current event stay dark, the rest fade
```

1. One bold element: a full-width year strip on the home page, built as static SVG from `getPrecedents()`.
2. Monochrome tokens, light first, dark mode by `prefers-color-scheme`:
   page `#ffffff`/`#000000`, surface `#f5f5f7`/`#1c1c1e`, line `#d2d2d7`/`#38383a`,
   ink-3 `#86868b`/`#8e8e93`, ink-2 `#515154`/`#c7c7cc`, ink `#1d1d1f`/`#f5f5f7`.
3. System font stack only. Remove Fraunces, Inter and JetBrains Mono from `layout.tsx`.
4. Shape, not colour, for the action groups in `src/lib/schema.ts`. All glyphs are hollow, the same ink and the same size. The label is always beside the glyph:
   restrict □, legal ◇, force △, engage ○, other (a short dash).
5. "In power" and "In opposition" become text labels. Both quote edges are grey.
6. Compare grid: one grey ramp (surface to ink). No rotated headers; glyph plus a short label.
7. Precedent cards become rows with one hairline.
8. Remove: the radial glow, the ALL-CAPS mono eyebrows, the red "PO" icon.

## Build steps

1. Replace the tokens in `src/app/globals.css`. Remove the Google fonts from `src/app/layout.tsx`.
2. Add a `Glyph` component. Use it in `ActionChip` and `Timeline`.
3. Build the year strip as static SVG, with no client JS.
4. Turn `PrecedentCard` into a row. Update the home page and `/precedents/`.
5. Update `Positions`, `compare/page.tsx` and the precedent page header.
6. Run `npm run validate` and `npm run build`.
7. Take screenshots at 1280px and 390px, in light and dark. Fix what they show.
8. Commit on `design/apple-light`. Do not merge or deploy without the owner's word.

## Open decisions

| ID | Default | Alternative |
|---|---|---|
| D1 | No hue: links and the "now" mark are ink | Apple link blue `#0066cc` (close to some party colours) |
| D2 | Light first, dark follows the system | Keep dark as the main design |
| D3 | Monochrome icon (one tick on a line) | Keep the red "PO" square |

## Note for the next session

The main checkout (`~/.t3/projects/priors-of-indian-history`, on `main`) had four untracked precedent YAML files when this plan was written. They belong to another session. This branch does not include them.

## Build notes (2026-10-15)

- The year strip is static HTML positioned by percentage, not SVG. It needs no client JS and stays legible at 390px.
- Tick height shows how many kinds of action a precedent shares with the lead current event. Every precedent shares at least one, so a binary dark/faded rule faded nothing. Ticks in the lower third fade.
- Compare grid: only parties with at least one attributed action get a row. Long `other (...)` names are truncated with a tooltip.
- Source links in the timeline and quotes are numbered `[n]` and match the numbered Sources list.
