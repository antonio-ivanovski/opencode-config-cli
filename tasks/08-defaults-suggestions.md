# Task 08: Default Values & Suggestions Registry

## Status: pending

## Priority: medium

## Dependencies: 02

## Description

Define common/suggested values for freeform string fields. This makes the TUI useful even for fields that aren't enums in the schema.

## Acceptance Criteria

- [ ] `source/lib/defaults.ts` created
- [ ] `FIELD_SUGGESTIONS` map: config path → array of suggested values
- [ ] Covers at minimum:
  - `theme`: opencode, catppuccin, dracula, gruvbox, nord, solarized, tokyonight, monokai, one-dark
  - `default_agent`: build, plan
  - `username`: (dynamic — current system username)
  - `logLevel`: (covered by enum, but fallback)
- [ ] `getSuggestions(path: string, configData?: object)` → returns suggestions for a path
- [ ] For `default_agent`: dynamically include agent names from current config
- [ ] Top-level key display order exported as `KEY_ORDER: string[]`

## Notes

- Simple static data + one dynamic function
- Will be extended over time as we learn what users commonly set
