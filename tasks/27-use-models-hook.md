# Task 27: useModels Hook

## Status: pending

## Priority: medium

## Dependencies: 09

## Description

React hook that provides models data to components. Handles loading state, fetch on demand, and refresh.

## Acceptance Criteria

- [ ] `source/hooks/useModels.ts` created
- [ ] `useModels()` returns `{ models, providers, loading, error, refresh }`
- [ ] Lazy-loads: doesn't fetch until first call
- [ ] Returns cached data instantly if available
- [ ] `loading: true` while fetching
- [ ] `refresh()` triggers a re-fetch (for `r` keybind)
- [ ] `providers`: list of provider objects with metadata
- [ ] `models`: flat list of all models with provider info attached
- [ ] `getModelsByProvider(providerId)` — filtered list

## Notes

- Uses `models-cache.ts` (task 09) for the actual fetch/cache logic
- State managed with useState — simple
- Only fetched once per app session (unless refreshed)
