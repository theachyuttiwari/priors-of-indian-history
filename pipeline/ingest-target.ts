/**
 * Where an ingested entry may be written.
 *
 * content/current/<id>.yaml has a review lifecycle (schema.ts `Review`):
 *
 *   (none) ──ingest──► draft ──person──► checked ──person──► verified
 *
 * Ingest may create a draft and may refresh a draft. It must never move an
 * entry backwards: once a person has checked or verified it, a re-run that
 * finds the same protest writes a proposal to content/proposed/<id>.yaml
 * (not loaded by the site) and leaves the reviewed file, its `review` block
 * and its `corrections` untouched.
 *
 * STATE_MACHINES audit 2026-11-06, defect 4.1a.
 */
import path from "node:path";
import YAML from "yaml";

export type ReviewState = "draft" | "checked" | "verified" | "unreadable";

export type IngestTarget =
  | { kind: "new"; file: string }
  | { kind: "update"; file: string }
  | { kind: "proposal"; file: string; existing: ReviewState };

/**
 * An entry id becomes a file name, and the model chooses it, so it is checked here and not trusted:
 * lowercase letters and digits in hyphen-separated words, as content/SCHEMA.md asks ("kebab-case").
 * No "/", backslash, "." or "..", so the id cannot leave the directory it is written to.
 */
export const ENTRY_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ID_LENGTH = 120;

export function isSafeEntryId(id: unknown): id is string {
  return typeof id === "string" && id.length <= MAX_ID_LENGTH && ENTRY_ID.test(id);
}

/**
 * content/<dir>/<id>.yaml, or an error when the id is not a safe slug or the resolved path is not
 * directly inside content/<dir>. The second check is a backstop for the first.
 */
export function entryFile(contentRoot: string, dir: "current" | "proposed", id: string): string {
  if (!isSafeEntryId(id)) throw new Error(`unsafe entry id ${JSON.stringify(id)}: expected ${ENTRY_ID}`);
  const base = path.resolve(contentRoot, dir);
  const file = path.resolve(base, `${id}.yaml`);
  if (path.dirname(file) !== base) throw new Error(`entry id ${JSON.stringify(id)} leaves content/${dir}`);
  return file;
}

export function reviewStateOf(text: string): ReviewState {
  let doc: unknown;
  try {
    doc = YAML.parse(text);
  } catch {
    return "unreadable";
  }
  if (!doc || typeof doc !== "object") return "unreadable";
  const d = doc as { review?: { status?: unknown }; reviewed?: unknown };
  const status = d.review?.status;
  if (status === "checked" || status === "verified") return status;
  if (status === "draft") return d.reviewed === true ? "checked" : "draft";
  if (status !== undefined) return "unreadable";
  return d.reviewed === true ? "checked" : "draft";
}

/** `existingText` is the current file's contents, or null when there is none. */
export function ingestTarget(contentRoot: string, id: string, existingText: string | null): IngestTarget {
  const current = entryFile(contentRoot, "current", id);
  if (existingText === null) return { kind: "new", file: current };
  const state = reviewStateOf(existingText);
  if (state === "draft") return { kind: "update", file: current };
  return { kind: "proposal", file: entryFile(contentRoot, "proposed", id), existing: state };
}
