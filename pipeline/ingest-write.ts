import fs from "node:fs";
import path from "node:path";
import { ingestTarget, type IngestTarget } from "./ingest-target";

/** Write one ingested entry where the review lifecycle allows (see ingest-target.ts). */
export function writeIngested(contentRoot: string, id: string, text: string): IngestTarget {
  const current = path.join(contentRoot, "current", `${id}.yaml`);
  const existing = fs.existsSync(current) ? fs.readFileSync(current, "utf8") : null;
  const target = ingestTarget(contentRoot, id, existing);
  fs.mkdirSync(path.dirname(target.file), { recursive: true });
  fs.writeFileSync(target.file, text);
  return target;
}
