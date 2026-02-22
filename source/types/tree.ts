import type {SchemaNode} from './schema.js';

export type TreeNode = {
	id: string;
	path: string;
	key: string;
	schema: SchemaNode;
	value: unknown;
	baseValue?: unknown;
	defaultValue: unknown;
	children: TreeNode[];
	isLeaf: boolean;
	isSet: boolean;
	depth: number;
	change?: 'added' | 'edited' | 'deleted';
	hasChanges?: boolean;
	deprecated?: boolean;
	deprecatedMessage?: string;
	unknown?: boolean;
	inheritedValue?: unknown;
	inheritedFrom?: 'global' | 'default';
	effectiveValue?: unknown;
};
