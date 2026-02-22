# Task 28: Search / Filter

## Status: pending

## Priority: low

## Dependencies: 14, 17

## Description

`/` to activate search mode. Filters the tree to show only matching nodes.

## Acceptance Criteria

- [ ] `source/hooks/useSearch.ts` created
- [ ] `useSearch(tree)` returns `{ query, setQuery, filteredTree, isSearching, clearSearch }`
- [ ] Matches against: key name, value (stringified), description
- [ ] Case-insensitive
- [ ] Shows matching nodes + their parents (to preserve tree structure)
- [ ] Highlights matched text in results
- [ ] `source/components/SearchOverlay.tsx` — text input shown at top of tree when search active
- [ ] Esc clears search and returns to normal browse
- [ ] Enter on a result jumps to that node and exits search

## Notes

- Filter the flat visible list, not the tree structure
- Keep it simple: substring match, no fuzzy
