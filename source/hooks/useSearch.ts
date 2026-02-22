import {useMemo} from 'react';
import type {TreeNode} from '../types/index.js';
import {flattenTree} from '../lib/tree-model.js';

// Get ALL nodes (fully expanded) for search
export function useSearchableNodes(tree: TreeNode[]): TreeNode[] {
	return useMemo(() => {
		const allPaths = new Set<string>();
		function collectPaths(nodes: TreeNode[]) {
			for (const n of nodes) {
				allPaths.add(n.path);
				collectPaths(n.children);
			}
		}
		collectPaths(tree);
		return flattenTree(tree, true, allPaths);
	}, [tree]);
}
