# Task 15: Header Bar Component

## Status: pending

## Priority: medium

## Dependencies: 12, 13

## Description

Top bar showing the app name, scope tabs (Global / Project), active file path, and modified indicator.

## Acceptance Criteria

- [ ] `source/components/HeaderBar.tsx` created
- [ ] Shows app name: `lazy-opencode-config`
- [ ] Scope tabs: `[Global]` and `[Project]` — active tab highlighted (bold/color), inactive dim
- [ ] If project config doesn't exist, Project tab shows `[Project (new)]`
- [ ] File path displayed below or next to tabs
- [ ] `[modified]` indicator when dirty
- [ ] Click on tab switches scope (mouse support)
- [ ] Tab key switches scope (keyboard)
- [ ] Compact — should be max 2-3 lines tall

## Notes

- Consumes from ConfigContext: activeScope, switchScope, filePath, isDirty
- Purely presentational aside from tab click handler
