# Task 24: Number Renderer

## Status: pending

## Priority: medium

## Dependencies: 19

## Description

Inline number input with min/max validation from schema.

## Acceptance Criteria

- [ ] `source/components/renderers/NumberRenderer.tsx` created
- [ ] Text input that only accepts numeric characters (digits, `.`, `-`)
- [ ] Shows validation inline: red text if outside min/max bounds
- [ ] Pre-filled with current value
- [ ] Enter confirms (if valid), Esc cancels
- [ ] Shows min/max hint text (e.g., `(1-65535)` for port)
- [ ] Calls `onChange` with parsed number, not string
- [ ] Registered in typeRenderers as the default for `number` type

## Notes

- Reuse `ink-text-input` with input filtering
- Parse with `Number()` — handle NaN
