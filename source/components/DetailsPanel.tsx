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
			<Box flexDirection="column" paddingX={1}>
				<Text dimColor>No node selected</Text>
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

	return (
		<Box flexDirection="column" paddingX={1}>
			{/* Property name */}
			<Text bold>{node.key}</Text>
			<Text dimColor>{node.path}</Text>
			<Text> </Text>

			{/* Type */}
			<Text>
				<Text dimColor>Type: </Text>
				<Text>{typeDisplay}</Text>
			</Text>

			{/* Description */}
			{node.schema.description && (
				<>
					<Text> </Text>
					<Text wrap="wrap">{node.schema.description}</Text>
				</>
			)}
			<Text> </Text>

			{/* Current value */}
			<Text>
				<Text dimColor>Current: </Text>
				<Text color={node.isSet ? undefined : 'gray'}>
					{formatValue(node.value)}
				</Text>
			</Text>

			{/* Default value */}
			{node.defaultValue !== undefined && (
				<Text>
					<Text dimColor>Default: </Text>
					<Text>{String(node.defaultValue)}</Text>
				</Text>
			)}

			{/* Enum values */}
			{node.schema.enumValues && node.schema.enumValues.length > 0 && (
				<>
					<Text> </Text>
					<Text dimColor>Allowed values:</Text>
					{node.schema.enumValues.map(v => (
						<Text key={v}>
							<Text> {v === String(node.value) ? '● ' : '  '}</Text>
							<Text bold={v === String(node.value)}>{v}</Text>
						</Text>
					))}
				</>
			)}

			{/* Min/Max */}
			{(node.schema.minimum !== undefined ||
				node.schema.maximum !== undefined) && (
				<Text>
					<Text dimColor>Range: </Text>
					<Text>
						{node.schema.minimum ?? '...'} – {node.schema.maximum ?? '...'}
					</Text>
				</Text>
			)}

			{/* Deprecated */}
			{node.deprecated && (
				<>
					<Text> </Text>
					<Text color="yellow">⚠ Deprecated</Text>
					{node.deprecatedMessage && (
						<Text color="yellow"> {node.deprecatedMessage}</Text>
					)}
				</>
			)}

			{/* Validation */}
			{(nodeErrors.length > 0 || nodeWarnings.length > 0) && (
				<>
					<Text> </Text>
					<Text dimColor>── Validation ──</Text>
					{nodeErrors.map(e => (
						<Text key={e.path + e.message} color="red">
							✗ {e.message}
						</Text>
					))}
					{nodeWarnings.map(e => (
						<Text key={e.path + e.message} color="yellow">
							⚠ {e.message}
						</Text>
					))}
				</>
			)}

			{/* Valid indicator */}
			{nodeErrors.length === 0 && nodeWarnings.length === 0 && (
				<>
					<Text> </Text>
					<Text dimColor>── Validation ──</Text>
					<Text color="green">✓ Valid</Text>
				</>
			)}
		</Box>
	);
}
