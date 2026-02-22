import type React from 'react';
import type {TreeNode} from './tree.js';
import type {SchemaNode} from './schema.js';

export type RendererProps = {
	node: TreeNode;
	value: unknown;
	schema: SchemaNode;
	onChange: (value: unknown) => void;
	onCancel: () => void;
};

export type RendererComponent = React.FC<RendererProps>;

export type RendererOverride = {
	pattern: string;
	component: RendererComponent;
};
