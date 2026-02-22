# Task 17: TreeView Component

## Status: pending

## Priority: high

## Dependencies: 14, 15, 16

## Description

The main tree panel that renders the flat list of visible nodes with cursor highlight, handles keyboard/mouse navigation, and delegates to the appropriate renderer for editing.

## Acceptance Criteria

- [ ] `source/components/TreeView.tsx` created
- [ ] Renders the `visibleNodes` list from useTreeState
- [ ] Each node rendered by `<TreeNode>` component
- [ ] Cursor row highlighted with background color
- [ ] Keyboard navigation: ↑/k, ↓/j, →/l/Enter (expand), ←/h (collapse), Enter on leaf (edit)
- [ ] Mouse: click to select, click arrow to expand/collapse, scroll to navigate
- [ ] `a` key: add entry (for dynamic objects/arrays) — delegates to the add flow
- [ ] `d` key: delete/unset value, `D` key: delete from file
- [ ] `H` key: toggle show/hide unset values
- [ ] `/` key: activate search mode
- [ ] `s` / `Ctrl+s`: save
- [ ] `q` / `Ctrl+c`: quit (with confirm if dirty)
- [ ] `?`: show help overlay
- [ ] Scrolls the view to keep cursor visible (viewport windowing)
- [ ] Indent nodes by depth level

## Notes

- TreeView doesn't render editors — it tells the focused TreeNode to enter edit mode
- Keep the rendering loop tight — Ink re-renders the whole screen on every keypress
- Consider rendering only visible rows (viewport windowing) for large configs
