# Task 22: Enum Renderer

## Status: pending

## Priority: medium

## Dependencies: 19

## Description

Inline select list for enum fields. Shows all valid values, highlights current, arrow keys to navigate, Enter to confirm.

## Acceptance Criteria

- [ ] `source/components/renderers/EnumRenderer.tsx` created
- [ ] Shows list of enum values from `schema.enumValues`
- [ ] Current value highlighted/marked with `●`
- [ ] ↑/↓ to navigate, Enter to select, Esc to cancel
- [ ] Calls `onChange` on Enter with selected value
- [ ] Works for: logLevel, share, tui.diff_style, agent._.mode, permission._, agent.\*.color (theme presets)
- [ ] For `autoupdate` (mixed: boolean | "notify"): show `true`, `false`, `notify`
- [ ] Registered in typeRenderers as the default for `enum` type

## Notes

- Can use `ink-select-input` or build a simple custom one
- Keep it inline (not a popup) — renders in place of the value text
