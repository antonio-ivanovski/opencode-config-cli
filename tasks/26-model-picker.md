# Task 26: Model Picker Renderer

## Status: pending

## Priority: high

## Dependencies: 09, 19

## Description

Filterable overlay for selecting models. Groups by provider, shows context window and pricing. Used for `model`, `small_model`, and `agent.*.model` fields.

## Acceptance Criteria

- [ ] `source/components/renderers/ModelPickerRenderer.tsx` created
- [ ] Renders as an overlay/popup over the tree
- [ ] Filter input at top — filters models as user types (fuzzy match on id + name)
- [ ] Models grouped by provider, provider name as section header
- [ ] Each model row shows: `provider/model-id`, context window (e.g., `200K`), pricing (e.g., `$3/$15`)
- [ ] Current value highlighted with `●`
- [ ] ↑/↓ to navigate, Enter to select, Esc to cancel
- [ ] "Custom" section at bottom: allows typing a freeform `provider/model-id`
- [ ] Lazy-loads models data (via `useModels` hook) — shows loading spinner while fetching
- [ ] If models data unavailable: falls back to plain text input
- [ ] Registered as path override for `model`, `small_model`, `agent.*.model`

## Notes

- This is the most complex renderer — keep it focused on selection, not data fetching
- `useModels` hook (see task 27) handles the fetch/cache
- Pricing format: `$<input>/$<output>` per 1M tokens
- Context window format: `128K`, `200K`, `1M`
