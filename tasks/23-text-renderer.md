# Task 23: Text Renderer

## Status: pending

## Priority: medium

## Dependencies: 08, 19

## Description

Inline text input for freeform string fields. Shows autocomplete suggestions when available.

## Acceptance Criteria

- [ ] `source/components/renderers/TextRenderer.tsx` created
- [ ] Inline text input using `ink-text-input`
- [ ] Pre-filled with current value (or empty if unset)
- [ ] Enter confirms, Esc cancels
- [ ] If `FIELD_SUGGESTIONS` has entries for this path: show suggestion list below input as user types (filtered by input text)
- [ ] ↑/↓ to navigate suggestions, Tab to accept suggestion, Enter to confirm value
- [ ] Suggestions are optional — if none, just a plain text input
- [ ] Registered in typeRenderers as the default for `string` type

## Notes

- `ink-text-input` handles cursor, backspace, etc.
- Suggestion filtering: case-insensitive prefix match
- Don't block Enter if no suggestion is selected — Enter always confirms the current input text
