# Task 35: CLI Command — `list`

## Status: pending

## Priority: low

## Dependencies: 03, 04, 09

## Description

Non-interactive `list` command for browsing providers, models, agents, and config keys.

## Acceptance Criteria

- [ ] `source/commands/list.ts` created
- [ ] `list providers` — prints all known providers from models.dev
- [ ] `list models` — prints all known models (id, name, provider)
- [ ] `list models --provider anthropic` — filtered by provider
- [ ] `list agents` — prints agent names from current config
- [ ] `list keys` — prints all top-level config keys with their types
- [ ] Tabular output with chalk coloring
- [ ] Exit code 0

## Notes

- Requires models-cache for providers/models subcommands
- Falls back gracefully if models data unavailable
