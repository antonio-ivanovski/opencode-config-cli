# Task 19: Renderer Registry

## Status: pending

## Priority: high

## Dependencies: 02

## Description

The composable renderer system. Maps config paths and schema types to React components for editing values. Supports path-specific overrides and glob patterns.

## Acceptance Criteria

- [ ] `source/lib/renderer-registry.ts` created
- [ ] `typeRenderers` map: schema type → React component (boolean, string, number, enum, array, object)
- [ ] `pathOverrides` map: config path pattern → React component
- [ ] Supports glob-style patterns: `agent.*.model` matches `agent.build.model`, `agent.plan.model`, etc.
- [ ] `getRenderer(path: string, schemaNode: SchemaNode)` → returns the right component
- [ ] Override takes priority over type renderer
- [ ] Initial overrides:
  - `model` → ModelPickerRenderer
  - `small_model` → ModelPickerRenderer
  - `agent.*.model` → ModelPickerRenderer
  - `agent.*.prompt` → MultilineRenderer (opens $EDITOR)
  - `keybinds` → (handled by tree model grouping, not a renderer override)
- [ ] Easy to add new overrides — just add to the map

## Notes

- All renderers share `RendererProps` interface: `{ node, value, schema, onChange, onCancel }`
- The registry is a plain object, not a class — keep it simple
- Glob matching can be a simple function: split by `.`, match `*` to any segment
