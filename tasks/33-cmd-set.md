# Task 33: CLI Command — `set`

## Status: pending

## Priority: medium

## Dependencies: 03, 04, 10

## Description

Non-interactive `set` command that writes a value at a dot-path.

## Acceptance Criteria

- [ ] `source/commands/set.ts` created
- [ ] `set(dotPath: string, value: string, scope: ConfigScope)`
- [ ] Type coercion: "true"/"false" → boolean, numeric strings → number, rest stays string
- [ ] Validates against schema before writing
- [ ] Uses config-io's minimal-diff writer
- [ ] Exit code 0 on success, 1 on validation error
- [ ] Prints confirmation: `Set model = "anthropic/claude-sonnet-4-5"`

## Notes

- For setting objects/arrays, could accept JSON: `lazy-opencode-config set agent.build '{"model":"..."}'`
- But start simple: scalars only in v1
