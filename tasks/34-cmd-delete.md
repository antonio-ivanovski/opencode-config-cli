# Task 34: CLI Command — `delete`

## Status: pending

## Priority: medium

## Dependencies: 03, 04

## Description

Non-interactive `delete` command that removes a key from the config.

## Acceptance Criteria

- [ ] `source/commands/delete.ts` created
- [ ] `del(dotPath: string, scope: ConfigScope)`
- [ ] Removes the key using config-io's minimal-diff writer
- [ ] Exit code 0 on success, 1 if path not found
- [ ] Prints confirmation: `Deleted agent.code-reviewer`
