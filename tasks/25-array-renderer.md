# Task 25: Array Renderer

## Status: pending

## Priority: medium

## Dependencies: 19, 23

## Description

Editor for array values. Shows items as a list, supports add/remove.

## Acceptance Criteria

- [ ] `source/components/renderers/ArrayRenderer.tsx` created
- [ ] Shows array items as numbered child nodes in the tree
- [ ] `a` key: add new item at end — opens text input for the value
- [ ] `d` key on an item: remove it from the array
- [ ] For string arrays (instructions, plugin, disabled_providers, etc.): each item is a text input
- [ ] `Enter` on an existing item: edit it inline
- [ ] Shows `[empty]` when array is empty
- [ ] Registered in typeRenderers as the default for `array` type

## Notes

- Arrays of strings are the most common case in OpenCode config
- The tree model handles showing array items as children — this renderer handles the add/edit/remove interactions
