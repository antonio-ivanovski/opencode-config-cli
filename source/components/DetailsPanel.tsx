import React from 'react';
import {Box, Text} from 'ink';
import type {TreeNode} from '../types/index.js';
import type {ValidationError} from '../lib/validation.js';
import {getErrorsForPath} from '../lib/validation.js';

type Props = {
	focusedNode: TreeNode | null;
	validationErrors: ValidationError[];
};

export default function DetailsPanel({focusedNode, validationErrors}: Props) {
	if (!focusedNode) {
		return (
			<Box
				flexDirection="column"
				paddingX={2}
				paddingY={1}
				borderStyle="round"
				borderColor="gray"
			>
				<Text dimColor>Navigate the tree to view property details</Text>
				<Text> </Text>
				<Text dimColor>Use ↑↓ or j/k to move</Text>
				<Text dimColor>Press ? for help</Text>
			</Box>
		);
	}

	const node = focusedNode;
	const errors = getErrorsForPath(validationErrors, node.path);
	const nodeErrors = errors.filter(e => e.severity === 'error');
	const nodeWarnings = errors.filter(e => e.severity === 'warning');

	const typeDisplay =
		node.schema.type === 'enum'
			? `enum (${node.schema.enumValues?.join(' | ') ?? ''})`
			: node.schema.type;

	const formatValue = (val: unknown): string => {
		if (val === undefined) return '(not set)';
		if (typeof val === 'object') return JSON.stringify(val, null, 2);
		return String(val);
	};

	// Determine if branch has any locally-set descendant
	function branchIsNotSet(n: TreeNode): boolean {
		if (n.isSet) return false;
		return n.children.every(c => (c.isLeaf ? !c.isSet : branchIsNotSet(c)));
	}

	const effectivelyNotSet = node.isLeaf ? !node.isSet : branchIsNotSet(node);

	const currentDisplay = node.isLeaf
		? formatValue(node.value)
		: effectivelyNotSet
		? '(not set)'
		: '(object)';

	const sourceLabel = node.isSet
		? 'Set locally'
		: node.inheritedFrom === 'global'
		? 'Inherited from global'
		: effectivelyNotSet
		? 'Not set'
		: 'Set locally';

	const sourceColor = node.isSet
		? '#4CAF50'
		: node.inheritedFrom === 'global'
		? '#00BCD4'
		: 'gray';

	const changeLabel = node.change
		? node.change === 'added'
			? 'Added'
			: node.change === 'deleted'
			? 'Deleted'
			: 'Edited'
		: node.hasChanges
		? 'Edited'
		: null;

	const changeColor =
		node.change === 'added'
			? '#4CAF50'
			: node.change === 'deleted'
			? '#F44336'
			: node.change
			? '#FF9800'
			: node.hasChanges
			? '#FF9800'
			: 'gray';

	// Commands specific to the selected item (right panel only)
	const actions: Array<{label: string; description: string}> = [];

	if (node.isLeaf) {
		actions.push({label: 'Enter', description: 'Edit value'});
	} else {
		actions.push({label: 'Enter', description: 'Expand/collapse'});
		actions.push({label: 'a', description: 'Add entry here'});
		actions.push({label: 'A', description: 'Add entry to parent'});
	}

	if (node.schema.type === 'array' && node.children.length > 0) {
		actions.push({label: 'K', description: 'Move item up'});
		actions.push({label: 'J', description: 'Move item down'});
	}

	if (node.isSet) {
		actions.push({label: 'd', description: 'Unset value (keep key)'});
		actions.push({label: 'D', description: 'Delete key from file'});
	}

	if (node.hasChanges) {
		actions.push({label: 'r', description: 'Revert to original'});
	}

	return (
		<Box
			flexDirection="column"
			paddingX={2}
			paddingY={1}
			borderStyle="round"
			borderColor="#00BCD4"
		>
			{/* Property name in title */}
			<Text bold color="#00BCD4">
				{node.key}
			</Text>
			<Text> </Text>

			{/* Description */}
			{node.schema.description && (
				<>
					<Text wrap="wrap" dimColor>
						{node.schema.description}
					</Text>
					<Text> </Text>
				</>
			)}

			{/* Metadata table */}
			<Box flexDirection="column">
				<Box>
					<Box width={12}>
						<Text dimColor>Type</Text>
					</Box>
					<Text>{typeDisplay}</Text>
				</Box>
				<Box>
					<Box width={12}>
						<Text dimColor>Current</Text>
					</Box>
					<Text bold color={effectivelyNotSet ? 'gray' : '#00BCD4'}>
						{currentDisplay}
					</Text>
				</Box>
				{node.defaultValue !== undefined && (
					<Box>
						<Box width={12}>
							<Text dimColor>Default</Text>
						</Box>
						<Text dimColor>{String(node.defaultValue)}</Text>
					</Box>
				)}
				<Box>
					<Box width={12}>
						<Text dimColor>Source</Text>
					</Box>
					<Text color={sourceColor}>{sourceLabel}</Text>
				</Box>
				{changeLabel && (
					<Box>
						<Box width={12}>
							<Text dimColor>Change</Text>
						</Box>
						<Text color={changeColor}>{changeLabel}</Text>
					</Box>
				)}
				{node.effectiveValue !== undefined &&
					node.effectiveValue !== node.value && (
						<Box>
							<Box width={12}>
								<Text dimColor>Effective</Text>
							</Box>
							<Text>{formatValue(node.effectiveValue)}</Text>
						</Box>
					)}
			</Box>

			{/* Field-specific commands */}
			{actions.length > 0 && (
				<>
					<Text> </Text>
					<Text dimColor>{`── Commands for ${node.key} ──`}</Text>
					{actions.map(action => (
						<Box key={action.label}>
							<Box width={10}>
								<Text color="#00BCD4">{action.label}</Text>
							</Box>
							<Text dimColor>{action.description}</Text>
						</Box>
					))}
				</>
			)}

			{/* Enum values */}
			{node.schema.enumValues && node.schema.enumValues.length > 0 && (
				<>
					<Text> </Text>
					<Text dimColor>Allowed values:</Text>
					{node.schema.enumValues.map(v => (
						<Box key={v}>
							<Text color={v === String(node.value) ? '#00BCD4' : 'gray'}>
								{v === String(node.value) ? '● ' : '  '}
							</Text>
							<Text bold={v === String(node.value)}>{v}</Text>
						</Box>
					))}
				</>
			)}

			{/* Min/Max */}
			{(node.schema.minimum !== undefined ||
				node.schema.maximum !== undefined) && (
				<>
					<Text> </Text>
					<Box>
						<Box width={12}>
							<Text dimColor>Range</Text>
						</Box>
						<Text>
							{node.schema.minimum ?? '...'} – {node.schema.maximum ?? '...'}
						</Text>
					</Box>
				</>
			)}

			{/* Deprecated */}
			{node.deprecated && (
				<>
					<Text> </Text>
					<Text color="#FF9800">⚠ Deprecated</Text>
					{node.deprecatedMessage && (
						<Text dimColor> {node.deprecatedMessage}</Text>
					)}
				</>
			)}

			{/* Validation section */}
			<Text> </Text>
			<Text dimColor>────── Validation ──────</Text>
			{nodeErrors.length === 0 && nodeWarnings.length === 0 && (
				<Text color="#4CAF50">✓ Valid</Text>
			)}
			{nodeErrors.map(e => (
				<Text key={e.path + e.message} color="#F44336">
					✗ {e.message}
				</Text>
			))}
			{nodeWarnings.map(e => (
				<Text key={e.path + e.message} color="#FF9800">
					⚠ {e.message}
				</Text>
			))}
		</Box>
	);
}
