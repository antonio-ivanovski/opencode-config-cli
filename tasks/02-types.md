# Task 02: Core Type Definitions

## Status: pending

## Priority: high

## Dependencies: 01

## Description

Define TypeScript types for the tree data model, config values, schema nodes, renderer props, and models.dev API responses. These types are used everywhere — get them right early.

## Acceptance Criteria

- [ ] `source/types/tree.ts` — TreeNode type (id, path, key, schemaNode, value, children, expanded, isSet, parent)
- [ ] `source/types/schema.ts` — SchemaNode type (type, enum, default, description, properties, items, additionalProperties, deprecated, minimum, maximum)
- [ ] `source/types/config.ts` — ConfigScope enum (global, project), ConfigState type (data, filePath, rawText, dirty, scope)
- [ ] `source/types/models.ts` — Provider, Model, ModelsData types matching models.dev API shape
- [ ] `source/types/renderer.ts` — RendererProps interface (node, value, schema, onChange, onCancel), RendererOverride type
- [ ] All types exported from `source/types/index.ts` barrel

## Key Types

```ts
type TreeNode = {
	id: string; // unique, e.g. "agent.build.model"
	path: string; // dot-path in config
	key: string; // last segment
	schema: SchemaNode;
	value: unknown; // current value from config (undefined if unset)
	defaultValue: unknown;
	children: TreeNode[];
	isLeaf: boolean;
	isSet: boolean; // explicitly set in config file
	depth: number;
};
```

## Notes

- Keep types simple and flat — no deep generics
- These will evolve, but the core shape should be stable
