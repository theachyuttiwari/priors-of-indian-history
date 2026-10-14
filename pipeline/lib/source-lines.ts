/**
 * Line-level edits to the `sources:` list of a content file. A YAML round-trip would reflow
 * hand-wrapped text, so scripts that add source fields edit lines in place instead.
 */

export type SourceBlock = {
  /** The block's lines, starting with `  - id: ...`. Mutate to change the file. */
  lines: string[];
  get(key: string): string | undefined;
  has(key: string): boolean;
  /** Insert or replace `key: value` after the url line. */
  set(key: string, value: string): void;
};

export function unquote(v: string): string {
  const t = v.trim();
  return /^(['"]).*\1$/.test(t) ? t.slice(1, -1) : t;
}

function block(lines: string[]): SourceBlock {
  const find = (key: string) => lines.findIndex((l) => l.startsWith(`    ${key}:`) || l.startsWith(`  - ${key}:`));
  return {
    lines,
    get(key) {
      const i = find(key);
      return i < 0 ? undefined : unquote(lines[i].slice(lines[i].indexOf(":") + 1));
    },
    has: (key) => find(key) >= 0,
    set(key, value) {
      const line = `    ${key}: ${value}`;
      const i = find(key);
      if (i >= 0) lines[i] = line;
      else {
        const u = find("url");
        lines.splice(u >= 0 ? u + 1 : lines.length, 0, line);
      }
    },
  };
}

/** Call `fn` for every source block in `text`. Returns the edited text. */
export function editSources(text: string, fn: (b: SourceBlock) => void): string {
  const out: string[] = [];
  let inSources = false;
  let current: string[] = [];
  const flush = () => {
    if (!current.length) return;
    const b = block(current);
    fn(b);
    out.push(...b.lines);
    current = [];
  };
  for (const line of text.split("\n")) {
    if (/^\S/.test(line)) {
      flush();
      inSources = line.startsWith("sources:");
      out.push(line);
    } else if (inSources && line.startsWith("  - ")) {
      flush();
      current.push(line);
    } else if (inSources && current.length) {
      current.push(line);
    } else {
      out.push(line);
    }
  }
  flush();
  return out.join("\n");
}
