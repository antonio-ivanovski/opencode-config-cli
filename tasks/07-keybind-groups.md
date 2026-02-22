# Task 07: Keybind Categorization

## Status: pending

## Priority: medium

## Dependencies: 02

## Description

Define the keybind grouping logic that organizes 70+ keybind keys into logical categories for the tree view.

## Acceptance Criteria

- [ ] `source/lib/keybind-groups.ts` created
- [ ] Exports `KEYBIND_GROUPS`: ordered array of `{ name, label, keys[] }`
- [ ] Categories: App, Session, Messages, Model, Agent, Input, Navigation, History, Stash
- [ ] Every keybind key from the schema is assigned to exactly one group
- [ ] `getKeybindGroup(key: string)` → returns the group name for a given keybind key
- [ ] Used by the tree model to inject virtual "group" nodes under `keybinds`

## Groups

```ts
const KEYBIND_GROUPS = [
  { name: 'app', label: 'App', keys: ['leader', 'app_exit', 'terminal_suspend', 'terminal_title_toggle'] },
  { name: 'session', label: 'Session', keys: ['session_new', 'session_list', ...] },
  { name: 'messages', label: 'Messages', keys: ['messages_page_up', ...] },
  { name: 'model', label: 'Model', keys: ['model_list', 'model_cycle_recent', ...] },
  { name: 'agent', label: 'Agent', keys: ['agent_list', 'agent_cycle', 'agent_cycle_reverse'] },
  { name: 'input', label: 'Input', keys: ['input_clear', 'input_paste', ...] },
  { name: 'navigation', label: 'Navigation', keys: ['sidebar_toggle', 'scrollbar_toggle', ...] },
  { name: 'history', label: 'History', keys: ['history_previous', 'history_next'] },
  { name: 'stash', label: 'Stash', keys: ['stash_delete'] },
];
```

## Notes

- Pure data file, no logic beyond the mapping
- Used by tree-model.ts when building the keybinds subtree
