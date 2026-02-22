# Task 10: Schema Validation

## Status: pending

## Priority: medium

## Dependencies: 05

## Description

Validate config data against the JSON schema using ajv. Provide per-path error messages for display in the TUI.

## Acceptance Criteria

- [ ] `source/lib/validation.ts` created
- [ ] `validateConfig(schema, data)` → `ValidationResult { valid, errors[] }`
- [ ] Each error has: `{ path: string, message: string, severity: 'error' | 'warning' }`
- [ ] Uses `ajv` with JSON Schema draft 2020-12 support
- [ ] Custom validation rules (beyond schema):
  - Deprecated fields → warning with migration hint
  - `disabled_providers` ∩ `enabled_providers` → warning
  - `server.port` < 1024 → warning "requires root"
  - Unknown model provider in `model`, `small_model`, `agent.*.model` → warning (if models data available)
- [ ] `getErrorsForPath(errors, path)` → errors relevant to a specific tree node
- [ ] Re-validates after each edit (debounced or immediate — keep it fast)

## Notes

- ajv can be heavy — consider `ajv/dist/2020` for smaller bundle
- Schema has custom `ref` fields (not standard `$ref`) — may need preprocessing
- Validation should never block the UI — run sync but fast
