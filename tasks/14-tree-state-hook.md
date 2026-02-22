# Task 14: Tree State Hook

## Status: pending

## Priority: high

## Dependencies: 06, 13

## Description

Hook that manages the tree's UI state: which nodes are expanded, cursor position, show/hide unset values, and produces the flat visible node list for rendering.

## Acceptance Criteria

- [ ] `source/hooks/useTreeState.ts` created
- [ ] `useTreeState(tree: TreeNode[])` hook
- [ ] `expandedPaths: Set<string>` — which branches are expanded
- [ ] `cursorIndex: number` — index in the flat visible list
- [ ] `showUnset: boolean` — toggle for unset value visibility (default: true)
- [ ] `toggleExpand(path)` — expand/collapse a branch
- [ ] `moveCursor(delta)` — move cursor up/down, clamped
- [ ] `setCursor(index)` — jump to index (for mouse click)
- [ ] `toggleShowUnset()` — flip the showUnset flag
- [ ] `visibleNodes` — memoized flat list via `flattenTree(tree, showUnset, expandedPaths)`
- [ ] `focusedNode` — the node at cursorIndex
- [ ] When tree changes (e.g., scope switch), preserve expanded state where possible, clamp cursor

## Notes

- This is pure UI state, not config state
- `visibleNodes` should be memoized with `useMemo` — it's called on every render
- Keep expand/collapse state per-scope if possible (so switching back restores your position)
