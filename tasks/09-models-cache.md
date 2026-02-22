# Task 09: Models.dev Fetch & Cache

## Status: pending

## Priority: medium

## Dependencies: 02

## Description

Fetch the models.dev API data, parse it into typed provider/model structures, cache locally with TTL.

## Acceptance Criteria

- [ ] `source/lib/models-cache.ts` created
- [ ] `fetchModels()` — fetches `https://models.dev/api.json`, returns parsed data
- [ ] Uses native `fetch` (no node-fetch)
- [ ] Cache to `~/.cache/lazy-opencode-config/models.json` with mtime-based TTL (24h)
- [ ] `loadModels()` — returns cached data if fresh, otherwise fetches
- [ ] `refreshModels()` — force re-fetch
- [ ] Falls back to cache if fetch fails (log warning)
- [ ] Falls back to `null` if no cache and fetch fails
- [ ] Parses into typed structures:
  - `Provider { id, name, env, models: Model[] }`
  - `Model { id, name, family, context, outputLimit, costInput, costOutput, capabilities }`
- [ ] Filters out providers with 0 models
- [ ] Returns flat `Model[]` with `providerId` attached for the model picker

## Notes

- The API response is ~1.2MB — parse only what we need, don't store raw
- Create cache dir if it doesn't exist (`~/.cache/lazy-opencode-config/`)
- Keep the parsed/cached version much smaller than the raw API response
