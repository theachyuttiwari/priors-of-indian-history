import fs from "node:fs";
import path from "node:path";
import { entryFile, ingestTarget, type IngestTarget } from "./ingest-target";

/**
 * Write one ingested entry where the review lifecycle allows (see ingest-target.ts). Throws before
 * any read or write when `id` is not a safe slug (entryFile).
 */
export function writeIngested(contentRoot: string, id: string, text: string): IngestTarget {
  const current = entryFile(contentRoot, "current", id);
  const existing = fs.existsSync(current) ? fs.readFileSync(current, "utf8") : null;
  const target = ingestTarget(contentRoot, id, existing);
  fs.mkdirSync(path.dirname(target.file), { recursive: true });
  fs.writeFileSync(target.file, text);
  return target;
}
