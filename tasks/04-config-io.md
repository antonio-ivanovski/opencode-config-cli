# Task 04: Config I/O (Read & Write with Backup)

## Status: pending

## Priority: high

## Dependencies: 02, 03

## Description

Read and write OpenCode config files (JSON/JSONC). Writing uses best-effort minimal-diff via `jsonc-parser`, with a `JSON.stringify` fallback. Always creates a backup before overwriting.

## Acceptance Criteria

- [ ] `source/lib/config-io.ts` created
- [ ] `readConfig(filePath: string)` → `{ data: object, rawText: string, format: 'json' | 'jsonc' }`
- [ ] Reads `.json` and `.jsonc` files
- [ ] Parses JSONC correctly (strips comments for data, keeps raw text for round-trip)
- [ ] `writeConfig(filePath, originalText, modifications)` — best-effort minimal diff:
  - Try: `jsonc-parser.modify()` + `applyEdits()` for each changed path
  - Fallback: if edits produce invalid JSON, use `JSON.stringify(data, null, indent)` with detected indent
- [ ] **Backup before write:** copy current file to `<name>.lazy-opencode-config.backup.<timestamp>`
  - Timestamp format: `YYYY-MM-DDThh-mm-ss` (filesystem-safe)
  - e.g., `opencode.json.lazy-opencode-config.backup.2026-02-22T15-30-00`
  - Only create backup if the file already exists on disk
- [ ] Atomic write: write to `<path>.tmp`, then `fs.renameSync`
- [ ] `createNewConfig(filePath: string)` — creates a new file with `$schema` and sensible defaults (no backup needed)
- [ ] Handle file not found gracefully (return empty config + raw text for new file)
- [ ] Detect indent style from existing file (tabs vs spaces, width)

## Key Interface

```ts
type Modification = {
	path: string[]; // JSON path segments, e.g. ["agent", "build", "model"]
	value: unknown; // new value, or undefined to delete
};
```

## Notes

- `jsonc-parser.modify(text, path, value, options)` returns edit operations
- `jsonc-parser.applyEdits(text, edits)` returns new text
- For MVP: best-effort is fine. If jsonc-parser mangles something, the backup is there.
- Verify the output parses correctly before writing (parse the result, compare data). If not → fall back to stringify.
- Detect indent: check first indented line for tabs vs spaces + count
