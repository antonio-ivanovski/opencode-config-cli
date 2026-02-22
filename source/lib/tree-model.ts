import type {TreeNode, SchemaNode} from '../types/index.js';
import {KEY_ORDER} from './defaults.js';

function sortKeys(keys: string[]): string[] {
	const ordered = KEY_ORDER.filter(k => keys.includes(k));
	const rest = keys.filter(k => !KEY_ORDER.includes(k)).sort();
	return [...ordered, ...rest];
}

function buildNode(
	key: string,
	path: string,
	schema: SchemaNode,
	configData: Record<string, unknown>,
	depth: number,
): TreeNode {
	const value = key in configData ? configData[key] : undefined;
	const isSet = key in configData;
	const isLeaf = schema.type !== 'object' && schema.type !== 'array';

	const node: TreeNode = {
		id: path,
		path,
		key,
		schema,
		value,
		defaultValue: schema.default,
		children: [],
		isLeaf,
		isSet,
		depth,
		deprecated: schema.deprecated,
		deprecatedMessage: schema.deprecatedMessage,
	};

	if (schema.type === 'object') {
		const childData =
			isSet && value && typeof value === 'object' && !Array.isArray(value)
				? (value as Record<string, unknown>)
				: {};

		const schemaKeys = schema.properties ? Object.keys(schema.properties) : [];
		const dataKeys = Object.keys(childData);
		const allKeys = sortKeys([...new Set([...schemaKeys, ...dataKeys])]);

		for (const childKey of allKeys) {
			const childPath = `${path}.${childKey}`;
			const childSchema =
				schema.properties?.[childKey] ??
				(schema.additionalProperties &&
				typeof schema.additionalProperties === 'object'
					? schema.additionalProperties
					: {type: 'string' as const});

			const childNode = buildNode(
				childKey,
				childPath,
				childSchema,
				childData,
				depth + 1,
			);

			if (!schema.properties?.[childKey]) {
				childNode.unknown = true;
			}

			node.children.push(childNode);
		}
	} else if (schema.type === 'array') {
		const items = Array.isArray(value) ? value : [];
		const itemSchema = schema.items ?? {type: 'string' as const};

		for (let i = 0; i < items.length; i++) {
			const childPath = `${path}.${i}`;
			const childNode: TreeNode = {
				id: childPath,
				path: childPath,
				key: String(i),
				schema: itemSchema,
				value: items[i],
				defaultValue: undefined,
				children: [],
				isLeaf: true,
				isSet: true,
				depth: depth + 1,
			};
			node.children.push(childNode);
		}
	}

	return node;
}

export function buildTree(
	schema: Record<string, SchemaNode>,
	configData: Record<string, unknown>,
): TreeNode[] {
	const schemaKeys = Object.keys(schema);
	const dataKeys = Object.keys(configData);
	const allKeys = sortKeys([...new Set([...schemaKeys, ...dataKeys])]);

	return allKeys.map(key => {
		const schemaNode = schema[key] ?? {type: 'string' as const};
		const node = buildNode(key, key, schemaNode, configData, 0);

		if (!schema[key]) {
			node.unknown = true;
		}

		return node;
	});
}

export function getNodeByPath(
	tree: TreeNode[],
	dotPath: string,
): TreeNode | undefined {
	const parts = dotPath.split('.');
	let current: TreeNode[] = tree;
	let found: TreeNode | undefined;

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i]!;
		const match = current.find(n => n.key === part);
		if (!match) return undefined;
		found = match;
		current = match.children;
	}

	return found;
}

function hasSetDescendant(node: TreeNode): boolean {
	if (node.isSet) return true;
	return node.children.some(c => hasSetDescendant(c));
}

export function flattenTree(
	tree: TreeNode[],
	showUnset: boolean,
	expandedPaths: Set<string>,
): TreeNode[] {
	const result: TreeNode[] = [];

	function walk(nodes: TreeNode[]) {
		for (const node of nodes) {
			const shouldInclude = showUnset || hasSetDescendant(node);
			if (!shouldInclude) continue;

			result.push(node);

			if (!node.isLeaf && expandedPaths.has(node.path)) {
				walk(node.children);
			}
		}
	}

	walk(tree);
	return result;
}
