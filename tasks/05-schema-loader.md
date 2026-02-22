# Task 05: Schema Loader & Parser

## Status: pending

## Priority: high

## Dependencies: 02

## Description

Fetch the OpenCode config JSON schema, cache it locally, and parse it into a navigable tree of `SchemaNode` objects that drive the TUI rendering.

## Acceptance Criteria

- [ ] `source/lib/schema.ts` created
- [ ] `fetchSchema()` — fetches `https://opencode.ai/config.json`, caches to `~/.cache/lazy-opencode-config/schema.json`
- [ ] Cache has TTL of 7 days; refresh with `--refresh-schema` or `r` keybind
- [ ] Falls back to cached version if fetch fails
- [ ] Ships a bundled fallback schema if no cache exists and fetch fails
- [ ] `parseSchema(rawSchema)` → flat map of `path → SchemaNode`
- [ ] Handles `$ref`, `anyOf`, `enum`, nested `properties`, `additionalProperties`, `items`
- [ ] Extracts: type, description, default, enum values, deprecated flag, min/max
- [ ] Top-level keys ordered per PRD section 6.2 (model, small_model, theme, ... , plugin)

## SchemaNode Shape

```ts
type SchemaNode = {
	type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'mixed';
	description?: string;
	default?: unknown;
	enumValues?: string[];
	deprecated?: boolean;
	deprecatedMessage?: string;
	minimum?: number;
	maximum?: number;
	properties?: Record<string, SchemaNode>; // for objects
	additionalProperties?: SchemaNode | boolean; // for dynamic-key objects
	items?: SchemaNode; // for arrays
};
```

## Notes

- The OpenCode schema uses `ref` (not `$ref` in some places) — handle both
- `anyOf` unions (e.g., autoupdate: boolean | "notify") → type `mixed`, store all options
- Keep the parser simple — don't try to handle full JSON Schema spec, just what OpenCode uses
