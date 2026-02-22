# Task 32: CLI Command — `get`

## Status: pending

## Priority: medium

## Dependencies: 03, 04

## Description

Non-interactive `get` command that reads a value at a dot-path and prints it.

## Acceptance Criteria

- [ ] `source/commands/get.ts` created
- [ ] `get(dotPath: string, scope: ConfigScope)` → prints value to stdout
- [ ] Scalar values printed as-is
- [ ] Object/array values printed as formatted JSON
- [ ] Exit code 0 if found, 1 if path not found
- [ ] Error message to stderr if path not found

## Examples

```
$ lazy-opencode-config get model
anthropic/claude-sonnet-4-5

$ lazy-opencode-config get agent.build
{
  "model": "anthropic/claude-sonnet-4-5",
  "steps": 50
}
```
