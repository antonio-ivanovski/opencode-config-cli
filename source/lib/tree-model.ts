import type {TreeNode, SchemaNode} from '../types/index.js';
import {KEY_ORDER} from './defaults.js';

export function getDefaultValueForSchema(schema: SchemaNode): unknown {
	if (schema.default !== undefined) return schema.default;
	if (schema.type === 'object') return {};
	if (schema.type === 'array') return [];
	if (schema.type === 'boolean') return false;
	if (schema.type === 'number') return 0;
	if (schema.type === 'string') return '';
	if (schema.type === 'enum') return schema.enumValues?.[0] ?? '';
	return {};
}

function sortKeys(keys: string[]): string[] {
	const ordered = KEY_ORDER.filter(k => keys.includes(k));
	const rest = keys.filter(k => !KEY_ORDER.includes(k)).sort();
	return [...ordered, ...rest];
}

function getNestedValue(data: Record<string, unknown>, key: string): unknown {
	return key in data ? data[key] : undefined;
}

function buildNode(
	key: string,
	path: string,
	schema: SchemaNode,
	configData: Record<string, unknown>,
	depth: number,
	inheritedData?: Record<string, unknown>,
	baseData?: Record<string, unknown>,
): TreeNode {
	const value = key in configData ? configData[key] : undefined;
	const isSet = key in configData;
	const baseValue = baseData ? getNestedValue(baseData, key) : undefined;

	// For mixed nodes, check if the actual value is an object — if so, treat as non-leaf
	const valueIsObject =
		value !== null &&
		value !== undefined &&
		typeof value === 'object' &&
		!Array.isArray(value);
	const isMixedWithObjectValue =
		schema.type === 'mixed' && valueIsObject && schema.properties !== undefined;

	const isLeaf =
		schema.type !== 'object' &&
		schema.type !== 'array' &&
		!isMixedWithObjectValue;

	// Compute inherited value from the parallel scope's data
	const rawInherited =
		inheritedData !== undefined
			? getNestedValue(inheritedData, key)
			: undefined;
	const inheritedValue =
		!isSet && rawInherited !== undefined ? rawInherited : undefined;
	const inheritedFrom: TreeNode['inheritedFrom'] =
		!isSet && rawInherited !== undefined ? 'global' : undefined;

	// effectiveValue: local > inherited global > schema default
	const effectiveValue = isSet
		? value
		: rawInherited !== undefined
		? rawInherited
		: schema.default !== undefined
		? schema.default
		: undefined;

	let change: TreeNode['change'];
	if (isSet && baseValue === undefined) change = 'added';
	else if (!isSet && baseValue !== undefined) change = 'deleted';
	else if (isSet && baseValue !== undefined && value !== baseValue)
		change = 'edited';

	const node: TreeNode = {
		id: path,
		path,
		key,
		schema,
		value,
		baseValue,
		defaultValue: schema.default,
		children: [],
		isLeaf,
		isSet,
		depth,
		change,
		hasChanges: Boolean(change),
		deprecated: schema.deprecated,
		deprecatedMessage: schema.deprecatedMessage,
		inheritedValue,
		inheritedFrom,
		effectiveValue,
	};

	if (schema.type === 'object' || isMixedWithObjectValue) {
		const childData =
			isSet && value && typeof value === 'object' && !Array.isArray(value)
				? (value as Record<string, unknown>)
				: {};

		const baseChildData =
			baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue)
				? (baseValue as Record<string, unknown>)
				: {};

		// Child-level inherited data (drill into the object if present)
		const childInheritedData =
			inheritedData !== undefined &&
			rawInherited !== undefined &&
			typeof rawInherited === 'object' &&
			!Array.isArray(rawInherited)
				? (rawInherited as Record<string, unknown>)
				: inheritedData !== undefined
				? {}
				: undefined;

		const schemaKeys = schema.properties ? Object.keys(schema.properties) : [];
		const dataKeys = Object.keys(childData);
		const baseKeys = Object.keys(baseChildData);
		const allKeys = sortKeys([
			...new Set([...schemaKeys, ...dataKeys, ...baseKeys]),
		]);

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
				childInheritedData,
				baseChildData,
			);

			if (!schema.properties?.[childKey]) {
				childNode.unknown = true;
			}

			node.children.push(childNode);
		}

		node.hasChanges =
			Boolean(node.change) || node.children.some(child => child.hasChanges);
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
				baseValue: undefined,
				defaultValue: undefined,
				children: [],
				isLeaf: true,
				isSet: true,
				depth: depth + 1,
				change: undefined,
				hasChanges: false,
				effectiveValue: items[i],
			};
			node.children.push(childNode);
		}
	}

	return node;
}

export function buildTree(
	schema: Record<string, SchemaNode>,
	configData: Record<string, unknown>,
	inheritedData?: Record<string, unknown>,
	baseData?: Record<string, unknown>,
): TreeNode[] {
	const schemaKeys = Object.keys(schema);
	const dataKeys = Object.keys(configData);
	const allKeys = sortKeys([...new Set([...schemaKeys, ...dataKeys])]);

	return allKeys.map(key => {
		const schemaNode = schema[key] ?? {type: 'string' as const};
		const node = buildNode(
			key,
			key,
			schemaNode,
			configData,
			0,
			inheritedData,
			baseData,
		);

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
			const shouldInclude =
				showUnset || hasSetDescendant(node) || node.hasChanges;
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
