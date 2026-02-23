import React, {useState, useMemo} from 'react';
import {Box, Text, useInput} from 'ink';
import type {TreeNode as TreeNodeType} from '../types/index.js';
import type {ValidationError} from '../lib/validation.js';
import TreeNode from './TreeNode.js';
import AddEntryDialog from './AddEntryDialog.js';
import {getErrorsForPath} from '../lib/validation.js';
import {getDefaultValueForSchema} from '../lib/tree-model.js';
import {useTerminalSize} from '../hooks/useTerminalSize.js';
import {getRenderer} from '../lib/renderer-registry.js';

type Props = {
	visibleNodes: TreeNodeType[];
	cursorIndex: number;
	expandedPaths: Set<string>;
	focusedNode: TreeNodeType | null;
	validationErrors: ValidationError[];
	mode: 'browse' | 'edit' | 'search';
	showEdits: boolean;
	onMoveCursor: (delta: number) => void;
	onSetCursor: (index: number) => void;
	onToggleExpand: (path: string) => void;
	onToggleShowUnset: () => void;
	onToggleShowEdits: () => void;
	onEditValue: (path: string[], value: unknown) => void;
	onDeleteValue: (path: string[]) => void;
	onRevertValue: (path: string[]) => void;
	onSwitchScope: () => void;
	onSave: () => void;
	onSaveImmediate: () => void;
	onQuit: () => void;
	onShowHelp: () => void;
	onStartSearch: () => void;
	onStartEdit: () => void;
	onEndEdit: () => void;
	onUndo: () => void;
	onMoveArrayItem: (path: string[], direction: 'up' | 'down') => void;
};

type AddingEntryState = {
	parentPath: string;
	parentLabel: string;
	existingKeys: string[];
	type: 'record' | 'array';
};

function isModelPickerPath(path: string): boolean {
	if (path === 'model' || path === 'small_model') return true;
	return /^agent\.(.+)\.model$/.test(path);
}

export default function TreeView({
	visibleNodes,
	cursorIndex,
	expandedPaths,
	focusedNode,
	validationErrors,
	mode,
	showEdits,
	onMoveCursor,
	onSetCursor: _onSetCursor,
	onToggleExpand,
	onToggleShowUnset,
	onToggleShowEdits,
	onEditValue,
	onDeleteValue,
	onRevertValue,
	onSwitchScope,
	onSave,
	onSaveImmediate,
	onQuit,
	onShowHelp,
	onStartSearch,
	onStartEdit,
	onEndEdit,
	onUndo,
	onMoveArrayItem,
}: Props) {
	const {rows} = useTerminalSize();
	const viewHeight = rows - 6; // Subtract header + status
	const [editingPath, setEditingPath] = useState<string | null>(null);
	const [addingEntry, setAddingEntry] = useState<AddingEntryState | null>(null);
	const editingNode = editingPath
		? visibleNodes.find(n => n.path === editingPath) ?? null
		: null;

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
		if (addingEntry) return; // Let AddEntryDialog handle input
		if (mode === 'edit') return; // Let the renderer handle input during edit

		// Navigation
		if (key.upArrow || input === 'k') onMoveCursor(-1);
		if (key.downArrow || input === 'j') onMoveCursor(1);

		// Page / half-page scroll (keyboard scroll — terminal mouse/click is not
		// supported by Ink 4.x and requires raw ANSI mouse protocol outside of Ink)
		const halfPage = Math.max(1, Math.floor(viewHeight / 2));
		if (key.pageDown || (key.ctrl && input === 'f')) onMoveCursor(viewHeight);
		if (key.pageUp || (key.ctrl && input === 'b')) onMoveCursor(-viewHeight);
		if (key.ctrl && input === 'd') onMoveCursor(halfPage);
		if (key.ctrl && input === 'u') onMoveCursor(-halfPage);

		// Jump to top / bottom
		if (input === 'g') _onSetCursor(0);
		if (input === 'G') _onSetCursor(visibleNodes.length - 1);

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

		// 'a' — add entry to selected record or array branch
		if (input === 'a' && focusedNode && !focusedNode.isLeaf) {
			const schema = focusedNode.schema;
			if (schema.additionalProperties && schema.type === 'object') {
				setAddingEntry({
					parentPath: focusedNode.path,
					parentLabel: focusedNode.key,
					existingKeys: focusedNode.children.map(c => c.key),
					type: 'record',
				});
				onStartEdit();
			} else if (schema.type === 'array') {
				setAddingEntry({
					parentPath: focusedNode.path,
					parentLabel: focusedNode.key,
					existingKeys: [],
					type: 'array',
				});
				onStartEdit();
			}
		}

		// 'A' — add entry to parent branch
		if (input === 'A' && focusedNode) {
			// Find the parent node: the node whose path is the prefix of focused path
			const focusedParts = focusedNode.path.split('.');
			if (focusedParts.length > 1) {
				const parentPath = focusedParts.slice(0, -1).join('.');
				const parentNode = visibleNodes.find(n => n.path === parentPath);
				if (parentNode && !parentNode.isLeaf) {
					const schema = parentNode.schema;
					if (schema.additionalProperties && schema.type === 'object') {
						setAddingEntry({
							parentPath: parentNode.path,
							parentLabel: parentNode.key,
							existingKeys: parentNode.children.map(c => c.key),
							type: 'record',
						});
						onStartEdit();
					} else if (schema.type === 'array') {
						setAddingEntry({
							parentPath: parentNode.path,
							parentLabel: parentNode.key,
							existingKeys: [],
							type: 'array',
						});
						onStartEdit();
					}
				}
			}
		}

		// K/J — move array item up/down
		if (input === 'K' && focusedNode) {
			const parts = focusedNode.path.split('.');
			const lastPart = parts[parts.length - 1];
			const idx = parseInt(lastPart ?? '', 10);
			if (!isNaN(idx) && idx > 0) {
				const parentPath = parts.slice(0, -1).join('.');
				onMoveArrayItem(parentPath.split('.'), 'up');
			}
		}
		if (input === 'J' && focusedNode) {
			const parts = focusedNode.path.split('.');
			const lastPart = parts[parts.length - 1];
			const idx = parseInt(lastPart ?? '', 10);
			if (!isNaN(idx)) {
				const parentPath = parts.slice(0, -1).join('.');
				onMoveArrayItem(parentPath.split('.'), 'down');
			}
		}

		// Keybind actions
		if (input === 'H') onToggleShowUnset();
		if (input === 'E') onToggleShowEdits();
		if (input === '/') onStartSearch();
		// s = save with confirmation prompt
		if (input === 's' && !key.ctrl) onSave();
		// S or Ctrl+s = save immediately
		if (input === 'S' || (key.ctrl && input === 's')) onSaveImmediate();
		if (input === '?') onShowHelp();
		if (input === 'u' || (key.ctrl && input === 'z')) onUndo();

		// d — unset value (leaf only, must be set)
		if (
			input === 'd' &&
			focusedNode &&
			focusedNode.isSet &&
			focusedNode.isLeaf
		) {
			onDeleteValue(focusedNode.path.split('.'));
		}

		// D — hard delete key from file (any set node)
		if (input === 'D' && focusedNode && focusedNode.isSet) {
			onDeleteValue(focusedNode.path.split('.'));
		}

		// Revert to original
		if (input === 'r' && focusedNode && focusedNode.hasChanges) {
			onRevertValue(focusedNode.path.split('.'));
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

	const handleAddEntryConfirm = (key: string) => {
		if (!addingEntry) return;
		const parentPathParts = addingEntry.parentPath
			? addingEntry.parentPath.split('.')
			: [];
		const fullPath = [...parentPathParts, key];

		if (addingEntry.type === 'record') {
			const schema = focusedNode?.schema;
			const addlSchema =
				schema?.additionalProperties &&
				typeof schema.additionalProperties === 'object'
					? schema.additionalProperties
					: undefined;
			const defaultVal = addlSchema ? getDefaultValueForSchema(addlSchema) : {};
			onEditValue(fullPath, defaultVal);
			// Expand the parent node after adding
			if (!expandedPaths.has(addingEntry.parentPath)) {
				onToggleExpand(addingEntry.parentPath);
			}
		} else {
			// Array: append to existing array
			const currentVal = focusedNode?.value;
			const currentArr = Array.isArray(currentVal) ? currentVal : [];
			onEditValue(parentPathParts, [...currentArr, key]);
		}

		setAddingEntry(null);
		onEndEdit();
	};

	const handleAddEntryCancel = () => {
		setAddingEntry(null);
		onEndEdit();
	};

	if (editingNode && isModelPickerPath(editingNode.path) && mode === 'edit') {
		const Renderer = getRenderer(editingNode.path, editingNode.schema);
		if (Renderer) {
			return (
				<Box flexDirection="column" width="100%" height={viewHeight}>
					<Renderer
						node={editingNode}
						value={editingNode.value}
						schema={editingNode.schema}
						onChange={value =>
							handleEditComplete(editingNode.path.split('.'), value)
						}
						onCancel={handleEditCancel}
					/>
				</Box>
			);
		}
	}

	return (
		<Box flexDirection="column">
			{addingEntry && (
				<AddEntryDialog
					parentPath={addingEntry.parentPath}
					parentLabel={addingEntry.parentLabel}
					existingKeys={addingEntry.existingKeys}
					onConfirm={handleAddEntryConfirm}
					onCancel={handleAddEntryCancel}
				/>
			)}
			{!addingEntry &&
				visibleSlice.map((node, i) => {
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
							showEdits={showEdits}
							errors={nodeErrors}
							onEditComplete={value =>
								handleEditComplete(node.path.split('.'), value)
							}
							onEditCancel={handleEditCancel}
						/>
					);
				})}
			{!addingEntry && visibleNodes.length === 0 && (
				<Text dimColor>No config entries to display</Text>
			)}
		</Box>
	);
}
