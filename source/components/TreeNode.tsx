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
	showEdits: boolean;
	errors: ValidationError[];
	onEditComplete: (value: unknown) => void;
	onEditCancel: () => void;
};

function formatRawValue(val: unknown): string {
	if (typeof val === 'string')
		return val.length > 40 ? val.slice(0, 37) + '..' : val;
	if (typeof val === 'boolean') return String(val);
	if (typeof val === 'number') return String(val);
	if (val === null) return 'null';
	return String(val);
}

type DisplayInfo = {
	text: string;
	suffix?: string;
	dim: boolean;
	isBoolean?: boolean;
	boolValue?: boolean;
	isNotSet?: boolean;
};

function getDisplayInfo(node: TreeNodeType): DisplayInfo {
	if (node.isSet) {
		if (typeof node.value === 'boolean') {
			return {
				text: String(node.value),
				dim: false,
				isBoolean: true,
				boolValue: node.value,
			};
		}
		return {text: formatRawValue(node.value), dim: false};
	}
	if (node.inheritedValue !== undefined) {
		if (typeof node.inheritedValue === 'boolean') {
			return {
				text: String(node.inheritedValue),
				suffix: ' ← global',
				dim: true,
				isBoolean: true,
				boolValue: node.inheritedValue,
			};
		}
		return {
			text: formatRawValue(node.inheritedValue),
			suffix: ' ← global',
			dim: true,
		};
	}
	return {text: '(not set)', dim: true, isNotSet: true};
}

function getChangeTag(node: TreeNodeType): {
	label: string;
	color: string;
} | null {
	if (!node.change) return null;
	if (node.change === 'added') return {label: '[added]', color: '#4CAF50'};
	if (node.change === 'deleted') return {label: '[deleted]', color: '#F44336'};
	return {label: '[edited]', color: '#FF9800'};
}

function isModelPickerPath(path: string): boolean {
	if (path === 'model' || path === 'small_model') return true;
	return /^agent\.(.+)\.model$/.test(path);
}

/** A branch is "not set" when neither it nor any descendant is locally set */
function branchIsNotSet(node: TreeNodeType): boolean {
	if (node.isSet) return false;
	return node.children.every(c => (c.isLeaf ? !c.isSet : branchIsNotSet(c)));
}

export default function TreeNode({
	node,
	isCursor,
	isEditing,
	isExpanded,
	showEdits,
	errors,
	onEditComplete,
	onEditCancel,
}: Props) {
	const indent = '  '.repeat(node.depth);
	const hasErrors = errors.some(e => e.severity === 'error');
	const hasWarnings = errors.some(e => e.severity === 'warning');
	const changeTag = showEdits ? getChangeTag(node) : null;
	const branchEditedTag =
		showEdits && !changeTag && node.hasChanges
			? {label: '[edited]', color: '#FF9800'}
			: null;

	// If editing, render the appropriate editor
	if (isEditing) {
		const Renderer = getRenderer(node.path, node.schema);
		if (Renderer) {
			if (isModelPickerPath(node.path)) {
				return (
					<Box width="100%" justifyContent="center" marginTop={1}>
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
		const arrow = isExpanded ? '▼' : '▶';
		const isArray = node.schema.type === 'array';
		const notSet = branchIsNotSet(node);

		return (
			<Box>
				{isCursor && <Text color="#00BCD4">▌</Text>}
				{!isCursor && <Text> </Text>}
				<Text>{indent}</Text>
				<Text color="#00BCD4">{arrow} </Text>
				<Text bold={isCursor} color={isCursor ? undefined : 'white'}>
					{node.key}
				</Text>
				{/* Show count only for arrays that are set */}
				{isArray && node.isSet && (
					<Text dimColor> ({node.children.length})</Text>
				)}
				{/* Show (not set) for branches with no locally-set descendant */}
				{notSet && <Text dimColor> (not set)</Text>}
				{changeTag && (
					<Text color={changeTag.color}>{` ${changeTag.label}`}</Text>
				)}
				{branchEditedTag && (
					<Text
						color={branchEditedTag.color}
					>{` ${branchEditedTag.label}`}</Text>
				)}
				{node.deprecated && (
					<Text color="#FF9800" strikethrough>
						{' [deprecated]'}
					</Text>
				)}
				{node.unknown && <Text color="#FF9800"> [unknown]</Text>}
				{hasErrors && <Text color="#F44336"> ●</Text>}
				{hasWarnings && !hasErrors && <Text color="#FF9800"> ●</Text>}
			</Box>
		);
	}

	// Leaf node
	const displayInfo = getDisplayInfo(node);

	// Color for value text
	let valueColor: string | undefined;
	if (hasErrors) {
		valueColor = '#F44336';
	} else if (displayInfo.isBoolean) {
		valueColor = displayInfo.boolValue ? '#4CAF50' : '#F44336';
	} else if (displayInfo.isNotSet) {
		valueColor = 'gray';
	} else if (displayInfo.dim) {
		valueColor = 'gray';
	} else {
		valueColor = '#00BCD4';
	}

	return (
		<Box>
			{isCursor && <Text color="#00BCD4">▌</Text>}
			{!isCursor && <Text> </Text>}
			<Text>{indent}</Text>
			<Text bold={isCursor} color={isCursor ? undefined : 'white'}>
				{node.key}
			</Text>
			<Text dimColor>: </Text>
			<Text color={valueColor}>{displayInfo.text}</Text>
			{displayInfo.suffix && <Text dimColor>{displayInfo.suffix}</Text>}
			{changeTag && (
				<Text color={changeTag.color}>{` ${changeTag.label}`}</Text>
			)}
			{node.deprecated && (
				<Text color="#FF9800" dimColor>
					{' '}
					<Text strikethrough>[deprecated]</Text>
				</Text>
			)}
			{node.unknown && <Text color="#FF9800"> [unknown]</Text>}
			{hasErrors && <Text color="#F44336"> ●</Text>}
			{hasWarnings && !hasErrors && <Text color="#FF9800"> ●</Text>}
		</Box>
	);
}
