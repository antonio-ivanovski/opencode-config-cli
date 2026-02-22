# Task 30: Unsaved Changes & Save Flow

## Status: pending

## Priority: medium

## Dependencies: 13, 04

## Description

Dirty tracking, save prompt on quit, modified indicator.

## Acceptance Criteria

- [ ] Dirty flag in ConfigContext (per scope)
- [ ] `[modified]` shown in HeaderBar when dirty
- [ ] `s` / `Ctrl+s` saves to disk
- [ ] On save: backup original → apply modifications via config-io → reset dirty flag → re-read file
- [ ] On quit (`q` / `Ctrl+c`) when dirty: show confirm dialog
- [ ] `source/components/ConfirmDialog.tsx` — "Save changes? [Y]es / [N]o / [C]ancel"
- [ ] Y: save then quit, N: quit without saving, C: cancel quit
- [ ] On scope switch when dirty: warn (or auto-save — TBD)
- [ ] Check file mtime before writing — warn if changed externally since last read

## Notes

- ConfirmDialog is a simple overlay with 3 keybinds
- mtime check: `fs.statSync(path).mtimeMs` — compare with stored mtime from read
