# Priors — project notes for Claude

Read HANDOFF.md in the private repo theachyuttiwari/priors-owner-notes first. It has the current state and the backlog.

- Content lives in `content/precedents/*.yaml` and `content/current/*.yaml`. Schema: `content/SCHEMA.md`.
- Always run `npm run validate` after touching content, and `npm run build` after touching `src/`.
- Research subagents: use `model: "opus"`. Tell them to open every URL they cite and to leave out
  facts they cannot source. Sites that block fetch can often be read with `curl`.
- Neutral voice in all content. Describe, do not judge. Mark contested facts and cite both sides.
- Never remove the `reviewed: false` flag on a pipeline-drafted entry without checking its sources.
- Build uses webpack (`next build --webpack`); Tailwind runs through `@tailwindcss/postcss`.
