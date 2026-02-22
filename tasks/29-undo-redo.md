# Task 29: Undo / Redo

## Status: pending

## Priority: low

## Dependencies: 13

## Description

Track edit history for undo/redo support.

## Acceptance Criteria

- [ ] `source/hooks/useUndo.ts` created
- [ ] `useUndo(initialState)` returns `{ state, setState, undo, redo, canUndo, canRedo }`
- [ ] Stack-based: each `setState` pushes to history
- [ ] `undo` pops from history, pushes to redo stack
- [ ] `redo` pops from redo stack, pushes to history
- [ ] `redo` stack cleared on new edit
- [ ] Integrated with ConfigContext — each `editValue`/`deleteValue` creates an undo point
- [ ] `u` / `Ctrl+z` triggers undo
- [ ] `Ctrl+y` triggers redo (optional, lower priority)
- [ ] Max history size: 100 entries

## Notes

- Store full config snapshots or just diffs? Snapshots are simpler, diffs are smaller. Start with snapshots — config objects are small.
- Wire into useConfig's reducer
