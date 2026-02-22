# Task 20: Details Panel

## Status: pending

## Priority: medium

## Dependencies: 14, 18

## Description

Right-side panel showing detailed info about the currently focused tree node.

## Acceptance Criteria

- [ ] `source/components/DetailsPanel.tsx` created
- [ ] Shows for focused node:
  - Property name (bold) and full JSON path (dim)
  - Type (string, boolean, number, enum, object, array)
  - Description from schema (word-wrapped)
  - Current value (full, not truncated)
  - Default value (if exists)
  - Allowed values (for enums — list all)
  - Validation errors/warnings for this path (red/yellow)
  - Deprecated notice with migration hint
- [ ] For model fields: show provider env var requirements
- [ ] Scrollable if content exceeds panel height
- [ ] Updates instantly when cursor moves

## Notes

- Purely presentational — reads from tree state + validation results
- Word-wrap descriptions to panel width
- Use dim colors for labels, bright for values
