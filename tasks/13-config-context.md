# Task 13: Config Context (State Management)

## Status: pending

## Priority: high

## Dependencies: 02, 04, 06

## Description

Create a React context that holds the entire app state: config data for both scopes, current scope, dirty tracking, modification list, and edit operations. Pure React — no external state libraries.

## Acceptance Criteria

- [ ] `source/hooks/useConfig.ts` created
- [ ] `ConfigProvider` wraps the app, provides context
- [ ] Holds state for both global and project configs simultaneously (so switching is instant)
- [ ] `activeScope` state: 'global' | 'project'
- [ ] `switchScope(scope)` — switch active scope, no data loss
- [ ] `editValue(path: string[], value: unknown)` — modify a value, mark dirty
- [ ] `deleteValue(path: string[])` — remove a key
- [ ] `save()` — writes modifications to disk using config-io's minimal-diff writer
- [ ] `isDirty` — per-scope dirty flag
- [ ] `modifications` — list of `{ path, value }` changes since last save (per scope)
- [ ] Triggers tree rebuild when config data changes
- [ ] `useConfig()` hook for consuming components

## State Shape

```ts
type ConfigContextValue = {
	activeScope: ConfigScope;
	switchScope: (scope: ConfigScope) => void;
	data: object; // current scope's config data
	filePath: string; // current scope's file path
	rawText: string; // current scope's original file text
	isDirty: boolean;
	editValue: (path: string[], value: unknown) => void;
	deleteValue: (path: string[]) => void;
	save: () => Promise<void>;
};
```

## Notes

- Use `useReducer` for complex state transitions
- Modifications are tracked as a list, applied in order when saving
- After save, reset modifications and re-read the file (to get the canonical text back)
