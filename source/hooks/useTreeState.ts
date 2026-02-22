import {useState, useMemo, useCallback, useEffect} from 'react';
import type {TreeNode} from '../types/index.js';
import {flattenTree} from '../lib/tree-model.js';

export function useTreeState(tree: TreeNode[]) {
	const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
	const [cursorIndex, setCursorIndex] = useState(0);
	const [showUnset, setShowUnset] = useState(false);
	const [showEdits, setShowEdits] = useState(true);

	// Memoized flat visible list
	const visibleNodes = useMemo(() => {
		const nodes = flattenTree(tree, showUnset, expandedPaths);
		if (showEdits) return nodes;
		return nodes.filter(n => !n.hasChanges);
	}, [tree, showUnset, expandedPaths, showEdits]);

	// Clamp cursor when visible list shrinks (via effect, not during render)
	useEffect(() => {
		if (visibleNodes.length === 0) {
			setCursorIndex(0);
		} else if (cursorIndex >= visibleNodes.length) {
			setCursorIndex(visibleNodes.length - 1);
		}
	}, [visibleNodes.length, cursorIndex]);

	// Derive clamped index as a safe read-only value for this render
	const clampedCursorIndex = Math.min(
		cursorIndex,
		Math.max(0, visibleNodes.length - 1),
	);

	// Focused node
	const focusedNode = visibleNodes[clampedCursorIndex] ?? null;

	// Toggle expand/collapse
	const toggleExpand = useCallback((path: string) => {
		setExpandedPaths(prev => {
			const next = new Set(prev);
			if (next.has(path)) next.delete(path);
			else next.add(path);
			return next;
		});
	}, []);

	// Move cursor up/down
	const moveCursor = useCallback(
		(delta: number) => {
			setCursorIndex(prev => {
				const next = prev + delta;
				return Math.max(0, Math.min(visibleNodes.length - 1, next));
			});
		},
		[visibleNodes.length],
	);

	// Toggle show unset
	const toggleShowUnset = useCallback(() => {
		setShowUnset(prev => !prev);
	}, []);

	const toggleShowEdits = useCallback(() => {
		setShowEdits(prev => !prev);
	}, []);

	return {
		expandedPaths,
		cursorIndex: clampedCursorIndex,
		setCursorIndex,
		showUnset,
		showEdits,
		visibleNodes,
		focusedNode,
		toggleExpand,
		moveCursor,
		toggleShowUnset,
		toggleShowEdits,
	};
}
