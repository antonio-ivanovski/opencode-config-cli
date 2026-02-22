import React from 'react';
import {Box, Text} from 'ink';
import type {TreeNode as TreeNodeType} from '../types/index.js';
import type {ValidationError} from '../lib/validation.js';
import {getRenderer} from '../lib/renderer-registry.js';

type Props = {
	node: TreeNodeType;
	isCursor: boolean;
	isEditing: boolean;
	isExpanded: boolean;
	errors: ValidationError[];
	onEditComplete: (value: unknown) => void;
	onEditCancel: () => void;
};

function formatDisplayValue(node: TreeNodeType): string {
	if (!node.isSet && node.value === undefined) {
		if (node.defaultValue !== undefined)
			return `(default: ${String(node.defaultValue)})`;
		return '(not set)';
	}
	const val = node.value;
	if (typeof val === 'string')
		return val.length > 30 ? val.slice(0, 27) + '...' : val;
	if (typeof val === 'boolean') return String(val);
	if (typeof val === 'number') return String(val);
	if (val === null) return 'null';
	return String(val);
}

export default function TreeNode({
	node,
	isCursor,
	isEditing,
	isExpanded,
	errors,
	onEditComplete,
	onEditCancel,
}: Props) {
	const indent = '  '.repeat(node.depth);
	const hasErrors = errors.some(e => e.severity === 'error');
	const hasWarnings = errors.some(e => e.severity === 'warning');

	// If editing, render the appropriate editor
	if (isEditing) {
		const Renderer = getRenderer(node.path, node.schema);
		if (Renderer) {
			return (
				<Box>
					<Text>{indent}</Text>
					<Text bold>{node.key}: </Text>
					<Renderer
						node={node}
						value={node.value}
						schema={node.schema}
						onChange={onEditComplete}
						onCancel={onEditCancel}
					/>
				</Box>
			);
		}
	}

	// Branch node (object/array)
	if (!node.isLeaf) {
		const arrow = isExpanded ? '▾' : '▸';
		const childCount = node.children.length;
		const bracket =
			node.schema.type === 'array'
				? `[${childCount} items]`
				: `(${childCount} items)`;

		return (
			<Box>
				<Text
					backgroundColor={isCursor ? 'blue' : undefined}
					color={isCursor ? 'white' : undefined}
				>
					<Text>{indent}</Text>
					<Text>{arrow} </Text>
					<Text bold={isCursor}>{node.key}</Text>
					<Text dimColor> {bracket}</Text>
					{node.deprecated && <Text color="yellow"> ⚠ deprecated</Text>}
					{node.unknown && <Text color="yellow"> ⚠ unknown</Text>}
					{hasErrors && <Text color="red"> ✗</Text>}
					{hasWarnings && !hasErrors && <Text color="yellow"> ⚠</Text>}
				</Text>
			</Box>
		);
	}

	// Leaf node
	const displayValue = formatDisplayValue(node);
	const isUnset = !node.isSet;

	return (
		<Box>
			<Text
				backgroundColor={isCursor ? 'blue' : undefined}
				color={isCursor ? 'white' : undefined}
			>
				<Text>{indent}</Text>
				<Text bold={isCursor} dimColor={isUnset}>
					{node.key}
				</Text>
				<Text dimColor={isUnset}>: </Text>
				<Text
					dimColor={isUnset}
					color={
						hasErrors
							? 'red'
							: typeof node.value === 'boolean'
							? node.value
								? 'green'
								: 'red'
							: undefined
					}
				>
					{displayValue}
				</Text>
				{node.deprecated && <Text color="yellow"> ⚠ deprecated</Text>}
				{node.unknown && <Text color="yellow"> ⚠ unknown</Text>}
				{hasErrors && <Text color="red"> ✗</Text>}
				{hasWarnings && !hasErrors && <Text color="yellow"> ⚠</Text>}
			</Text>
		</Box>
	);
}
