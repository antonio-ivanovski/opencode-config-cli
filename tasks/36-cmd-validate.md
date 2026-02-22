# Task 36: CLI Command — `validate`

## Status: pending

## Priority: low

## Dependencies: 03, 04, 10

## Description

Non-interactive `validate` command that checks config against schema.

## Acceptance Criteria

- [ ] `source/commands/validate.ts` created
- [ ] Reads config, validates against schema + custom rules
- [ ] On valid: prints `✓ Config is valid (N keys set)`, exit 0
- [ ] On errors: prints each error with path and message, exit 1
- [ ] Warnings (deprecated fields, etc.) printed but don't affect exit code

## Notes

- Useful for CI/CD pipelines
- Reuses validation.ts from task 10
