# Task 18: TreeNode Component

## Status: pending

## Priority: high

## Dependencies: 17

## Description

Renders a single tree node. Composable — delegates to the correct value renderer based on the renderer registry.

## Acceptance Criteria

- [ ] `source/components/TreeNode.tsx` created
- [ ] Shows indent (based on depth)
- [ ] Branch nodes: show ▸/▾ arrow + key + child count
- [ ] Leaf nodes: show key + value (or default or "(not set)")
- [ ] Unset nodes rendered in dim/gray, show `(default: <value>)` when default exists
- [ ] Deprecated nodes shown with dim + `⚠ deprecated` indicator
- [ ] Unknown keys shown with `⚠ unknown` indicator
- [ ] Validation errors: red indicator on the node
- [ ] When in edit mode: delegates to the value renderer (from renderer registry)
- [ ] When not editing: shows the value as text (truncated if long)

## Renderer Delegation

```tsx
// In edit mode:
const Renderer = getRenderer(node.path, node.schema);
return (
	<Renderer
		node={node}
		value={node.value}
		onChange={handleChange}
		onCancel={exitEdit}
	/>
);

// In display mode:
return <Text>{formatDisplayValue(node)}</Text>;
```

## Notes

- This is the composition point — TreeNode doesn't know about ModelPicker or EnumPicker
- formatDisplayValue: truncate strings > 30 chars, show booleans as true/false, show numbers as-is
