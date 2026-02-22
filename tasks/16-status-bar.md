# Task 16: Status Bar Component

## Status: pending

## Priority: medium

## Dependencies: 12

## Description

Bottom bar showing context-sensitive keybind hints and validation summary.

## Acceptance Criteria

- [ ] `source/components/StatusBar.tsx` created
- [ ] Shows keybind hints for current context:
  - Default: `↑↓ navigate  Enter edit  a add  d delete  / search  H toggle unset  Tab scope  s save  q quit  ? help`
  - While editing: `Enter confirm  Esc cancel`
  - While searching: `Enter jump  Esc clear`
- [ ] Right-aligned: validation status (e.g., `✓ valid` or `✗ 2 errors`)
- [ ] Fixed at bottom, 1-2 lines tall

## Notes

- Receives current mode (browse/edit/search) as prop or from context
- Keybind hints should be concise — truncate if terminal is narrow
