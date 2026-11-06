/**
 * Give every source a Wayback Machine snapshot (decision G: Wayback only, never archive.today).
 *
 *   npx tsx pipeline/archive.ts                 use existing snapshots only (read-only lookups)
 *   npx tsx pipeline/archive.ts --save          also ask Save Page Now to capture sources with none
 *   npx tsx pipeline/archive.ts --save farm     only files whose path contains "farm"
 *
 * --save needs IA_ACCESS_KEY and IA_SECRET_KEY (archive.org S3 keys): Save Page Now requires a login.
 * Writes archive_url and archive_date under each source's url. It never sets `accessed`:
 * that means a person or the pipeline opened and read the source.
 *
 * A source whose CDX lookup fails is reported and never captured (pipeline/lib/archive-run.ts).
 */
import path from "node:path";
import { runArchive } from "./lib/archive-run";

const args = process.argv.slice(2);
const save = args.includes("--save");
const filter = args.find((a) => !a.startsWith("--"));

async function main() {
  if (save && !(process.env.IA_ACCESS_KEY && process.env.IA_SECRET_KEY)) {
    // Save Page Now answers 401 "You need to be logged in" without keys (checked 2026-10-15).
    console.error("--save needs IA_ACCESS_KEY and IA_SECRET_KEY: see https://archive.org/account/s3.php");
    process.exit(1);
  }
  const { found, saved, missing, unknown } = await runArchive({
    root: path.join(process.cwd(), "content"),
    save,
    filter,
  });
  console.log(`\n${found} existing snapshots used, ${saved} new captures, ${missing.length} without a snapshot.`);
  if (missing.length) console.log(missing.map((m) => `  ${m}`).join("\n"));
  if (unknown.length) {
    // Not captured: the index could not be read, so a snapshot may well exist.
    console.log(`\n${unknown.length} not looked up (Wayback CDX error; nothing captured). Run again later:`);
    console.log(unknown.map((m) => `  ${m}`).join("\n"));
    process.exitCode = 1;
  }
}

main();
