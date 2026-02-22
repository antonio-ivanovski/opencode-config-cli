import type {SchemaNode} from './schema.js';

export type TreeNode = {
	id: string;
	path: string;
	key: string;
	schema: SchemaNode;
	value: unknown;
	defaultValue: unknown;
	children: TreeNode[];
	isLeaf: boolean;
	isSet: boolean;
	depth: number;
	deprecated?: boolean;
	deprecatedMessage?: string;
	unknown?: boolean;
};
