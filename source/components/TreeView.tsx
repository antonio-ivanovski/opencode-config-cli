import React, {useState, useMemo} from 'react';
import {Box, Text, useInput, useStdout} from 'ink';
import type {TreeNode as TreeNodeType} from '../types/index.js';
import type {ValidationError} from '../lib/validation.js';
import TreeNode from './TreeNode.js';
import {getErrorsForPath} from '../lib/validation.js';

type Props = {
	visibleNodes: TreeNodeType[];
	cursorIndex: number;
	expandedPaths: Set<string>;
	focusedNode: TreeNodeType | null;
	validationErrors: ValidationError[];
	mode: 'browse' | 'edit' | 'search';
	onMoveCursor: (delta: number) => void;
	onSetCursor: (index: number) => void;
	onToggleExpand: (path: string) => void;
	onToggleShowUnset: () => void;
	onEditValue: (path: string[], value: unknown) => void;
	onDeleteValue: (path: string[]) => void;
	onSwitchScope: () => void;
	onSave: () => void;
	onQuit: () => void;
	onShowHelp: () => void;
	onStartSearch: () => void;
	onStartEdit: () => void;
	onEndEdit: () => void;
	onUndo: () => void;
};

export default function TreeView({
	visibleNodes,
	cursorIndex,
	expandedPaths,
	focusedNode,
	validationErrors,
	mode,
	onMoveCursor,
	onSetCursor: _onSetCursor,
	onToggleExpand,
	onToggleShowUnset,
	onEditValue,
	onDeleteValue,
	onSwitchScope,
	onSave,
	onQuit,
	onShowHelp,
	onStartSearch,
	onStartEdit,
	onEndEdit,
	onUndo,
}: Props) {
	const {stdout} = useStdout();
	const viewHeight = (stdout?.rows ?? 24) - 6; // Subtract header + status
	const [editingPath, setEditingPath] = useState<string | null>(null);

	// Viewport windowing
	const scrollOffset = useMemo(() => {
		if (cursorIndex < 0) return 0;
		const halfView = Math.floor(viewHeight / 2);
		let offset = cursorIndex - halfView;
		offset = Math.max(0, offset);
		offset = Math.min(Math.max(0, visibleNodes.length - viewHeight), offset);
		return offset;
	}, [cursorIndex, viewHeight, visibleNodes.length]);

	const visibleSlice = visibleNodes.slice(
		scrollOffset,
		scrollOffset + viewHeight,
	);

	useInput((input, key) => {
		if (mode === 'edit') return; // Let the renderer handle input during edit

		// Navigation
		if (key.upArrow || input === 'k') onMoveCursor(-1);
		if (key.downArrow || input === 'j') onMoveCursor(1);

		// Expand/collapse
		if (
			(key.rightArrow || input === 'l') &&
			focusedNode &&
			!focusedNode.isLeaf
		) {
			if (!expandedPaths.has(focusedNode.path))
				onToggleExpand(focusedNode.path);
		}
		if ((key.leftArrow || input === 'h') && focusedNode) {
			if (!focusedNode.isLeaf && expandedPaths.has(focusedNode.path)) {
				onToggleExpand(focusedNode.path);
			}
		}

		// Enter — expand branch or edit leaf
		if (key.return && focusedNode) {
			if (focusedNode.isLeaf) {
				setEditingPath(focusedNode.path);
				onStartEdit();
			} else {
				onToggleExpand(focusedNode.path);
			}
		}

		// Keybind actions
		if (input === 'H') onToggleShowUnset();
		if (input === '/') onStartSearch();
		if (input === 's' || (key.ctrl && input === 's')) onSave();
		if (input === '?') onShowHelp();
		if (input === 'u' || (key.ctrl && input === 'z')) onUndo();

		// Delete
		if (input === 'd' && focusedNode && focusedNode.isSet) {
			onDeleteValue(focusedNode.path.split('.'));
		}

		// Tab — switch scope
		if (key.tab) onSwitchScope();

		// Quit
		if (input === 'q') onQuit();
	});

	const handleEditComplete = (path: string[], value: unknown) => {
		onEditValue(path, value);
		setEditingPath(null);
		onEndEdit();
	};

	const handleEditCancel = () => {
		setEditingPath(null);
		onEndEdit();
	};

	return (
		<Box flexDirection="column">
			{visibleSlice.map((node, i) => {
				const absoluteIndex = scrollOffset + i;
				const isCursor = absoluteIndex === cursorIndex;
				const isEditing = editingPath === node.path;
				const nodeErrors = getErrorsForPath(validationErrors, node.path);
				const isExpanded = expandedPaths.has(node.path);

				return (
					<TreeNode
						key={node.id}
						node={node}
						isCursor={isCursor}
						isEditing={isEditing}
						isExpanded={isExpanded}
						errors={nodeErrors}
						onEditComplete={value =>
							handleEditComplete(node.path.split('.'), value)
						}
						onEditCancel={handleEditCancel}
					/>
				);
			})}
			{visibleNodes.length === 0 && (
				<Text dimColor>No config entries to display</Text>
			)}
		</Box>
	);
}
