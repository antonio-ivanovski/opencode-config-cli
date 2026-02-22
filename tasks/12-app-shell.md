# Task 12: App Shell & Layout

## Status: pending

## Priority: high

## Dependencies: 02, 03, 04, 11

## Description

Build the main `App` component that sets up the full-screen layout: header bar with scope tabs, tree panel (left), details panel (right), status bar (bottom). Wire up the config loading.

## Acceptance Criteria

- [ ] `source/app.tsx` rewritten as the root TUI component
- [ ] Uses Ink's `useApp`, `useInput`, `useStdout` for terminal dimensions
- [ ] Full-screen layout with flexbox (Ink's `<Box>`)
- [ ] Three-region layout: header (top), main (tree + details side by side), status (bottom)
- [ ] Loads config on mount via config-io
- [ ] Passes config data + schema to child components via React context
- [ ] Accepts `scope` prop from CLI to determine initial scope

## Layout Structure

```tsx
<Box flexDirection="column" height="100%">
	<HeaderBar />
	<Box flexGrow={1}>
		<TreePanel width="60%" />
		<DetailsPanel width="40%" />
	</Box>
	<StatusBar />
</Box>
```

## Notes

- Keep App thin — it's the shell, delegates to sub-components
- Config context provides: data, schema, dirty flag, scope, edit function
- Don't load models.dev in App — that's lazy-loaded when a model field is focused
