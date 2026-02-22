# Task 21: Boolean Renderer

## Status: pending

## Priority: medium

## Dependencies: 19

## Description

Inline toggle for boolean values. Enter or Space toggles between true/false.

## Acceptance Criteria

- [ ] `source/components/renderers/BooleanRenderer.tsx` created
- [ ] Shows current value: `true` (green) or `false` (red)
- [ ] Enter or Space toggles the value
- [ ] Calls `onChange` immediately on toggle
- [ ] Esc cancels (restores original value, calls onCancel)
- [ ] Registered in typeRenderers as the default for `boolean` type

## Notes

- Simplest renderer — good template for others
- ~30 lines of code
