# Task 06: Tree Data Model

## Status: pending

## Priority: high

## Dependencies: 02, 04, 05

## Description

Build a navigable tree of `TreeNode` objects by merging the schema structure with actual config values. This tree drives the entire TUI — it knows what's set, what's unset, what the defaults are, and what type each value is.

## Acceptance Criteria

- [ ] `source/lib/tree-model.ts` created
- [ ] `buildTree(schema, configData)` → `TreeNode[]` (root-level nodes)
- [ ] Each node has: id, path, key, schema info, current value, default value, isSet flag, children
- [ ] Object nodes have children for each property (from schema) + any extra keys in config
- [ ] Array nodes have children for each item
- [ ] Unknown keys in config (not in schema) are included with a `unknown: true` flag
- [ ] Deprecated fields marked with `deprecated: true`
- [ ] `getNodeByPath(tree, dotPath)` → find a specific node
- [ ] `flattenTree(tree, showUnset, expandedPaths)` → flat list of visible nodes for rendering
- [ ] Respects the PRD top-level key ordering (not alphabetical)

## Key Logic

```ts
// For each schema property:
// 1. Check if it exists in configData → isSet = true, value = configData[key]
// 2. If not → isSet = false, value = undefined, defaultValue = schema.default
// 3. If schema.type is object → recurse into children
// 4. If schema.additionalProperties → also include any extra keys from configData
```

## Notes

- Tree is immutable — edits produce a new tree (React-friendly)
- `flattenTree` is called on every render — keep it fast
- The `showUnset` parameter controls whether unset nodes appear in the flattened list
