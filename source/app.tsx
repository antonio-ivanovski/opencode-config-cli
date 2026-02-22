import React, {useState} from 'react';
import {Box, Text, useStdout, useInput, useApp} from 'ink';
import {ConfigProvider, useConfig} from './hooks/useConfig.js';
import {useTreeState} from './hooks/useTreeState.js';
import {useUndo} from './hooks/useUndo.js';
import {useSearchableNodes} from './hooks/useSearch.js';
import HeaderBar from './components/HeaderBar.js';
import StatusBar from './components/StatusBar.js';
import ConfirmDialog from './components/ConfirmDialog.js';
import TreeView from './components/TreeView.js';
import DetailsPanel from './components/DetailsPanel.js';
import SearchOverlay from './components/SearchOverlay.js';
import HelpOverlay from './components/HelpOverlay.js';
import {getNodeByPath} from './lib/tree-model.js';
// Import renderer registration (side effect — registers renderers)
import './components/renderers/index.js';

type Props = {
	scope?: 'global' | 'project' | 'auto';
};

function AppContent() {
	const {stdout} = useStdout();
	const config = useConfig();
	const {
		loading,
		tree,
		validationErrors,
		isDirty,
		save,
		editValue,
		deleteValue,
		switchScope,
	} = config;
	const treeState = useTreeState(tree);
	const undoState = useUndo();
	const {exit} = useApp();
	const [mode, setMode] = useState<'browse' | 'edit' | 'search'>('browse');
	const [showQuitConfirm, setShowQuitConfirm] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const columns = stdout?.columns ?? 80;
	const rows = stdout?.rows ?? 24;

	const searchableNodes = useSearchableNodes(tree);

	const errorCount = validationErrors.filter(
		e => e.severity === 'error',
	).length;
	const warningCount = validationErrors.filter(
		e => e.severity === 'warning',
	).length;

	useInput((input, key) => {
		if (showQuitConfirm) return;
		if (showHelp) return;
		if (mode !== 'browse') return;
		if (input === 'q' || (key.ctrl && input === 'c')) {
			if (isDirty) {
				setShowQuitConfirm(true);
			} else {
				exit();
			}
		}
	});

	const handleSwitchScope = () => {
		switchScope(config.activeScope === 'global' ? 'project' : 'global');
	};

	const handleEditValue = (path: string[], value: unknown) => {
		const prevNode = getNodeByPath(tree, path.join('.'));
		undoState.record({path, value}, prevNode?.value);
		editValue(path, value);
	};

	const handleUndo = () => {
		const mod = undoState.undo();
		if (mod) editValue(mod.path, mod.value);
	};

	const handleQuit = () => {
		if (isDirty) {
			setShowQuitConfirm(true);
		} else {
			exit();
		}
	};

	const handleSearchSelect = (path: string) => {
		// Expand all parent paths of the target
		const parts = path.split('.');
		for (let i = 1; i < parts.length; i++) {
			const parentPath = parts.slice(0, i).join('.');
			if (!treeState.expandedPaths.has(parentPath)) {
				treeState.toggleExpand(parentPath);
			}
		}
		// Find index in visible nodes and jump
		const idx = treeState.visibleNodes.findIndex(n => n.path === path);
		if (idx >= 0) treeState.setCursorIndex(idx);
		setMode('browse');
	};

	if (loading) return <Text dimColor>Loading configuration...</Text>;

	if (showQuitConfirm) {
		return (
			<ConfirmDialog
				message="You have unsaved changes."
				onSave={() => {
					void save().then(() => {
						exit();
					});
				}}
				onDiscard={() => {
					exit();
				}}
				onCancel={() => {
					setShowQuitConfirm(false);
				}}
			/>
		);
	}

	if (showHelp) {
		return (
			<Box flexDirection="column" width={columns} height={rows}>
				<HeaderBar />
				<Box flexGrow={1} justifyContent="center" alignItems="center">
					<HelpOverlay onClose={() => setShowHelp(false)} />
				</Box>
				<StatusBar
					mode={mode}
					errorCount={errorCount}
					warningCount={warningCount}
				/>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" width={columns} height={rows}>
			<HeaderBar />
			<Box flexGrow={1}>
				{mode === 'search' ? (
					<Box flexGrow={1} flexDirection="column">
						<SearchOverlay
							allNodes={searchableNodes}
							onSelect={handleSearchSelect}
							onCancel={() => setMode('browse')}
						/>
					</Box>
				) : (
					<>
						<Box width="60%" flexDirection="column">
							<TreeView
								visibleNodes={treeState.visibleNodes}
								cursorIndex={treeState.cursorIndex}
								expandedPaths={treeState.expandedPaths}
								focusedNode={treeState.focusedNode}
								validationErrors={validationErrors}
								mode={mode}
								onMoveCursor={treeState.moveCursor}
								onSetCursor={treeState.setCursorIndex}
								onToggleExpand={treeState.toggleExpand}
								onToggleShowUnset={treeState.toggleShowUnset}
								onEditValue={handleEditValue}
								onDeleteValue={path => deleteValue(path)}
								onSwitchScope={handleSwitchScope}
								onSave={() => {
									void save();
								}}
								onQuit={handleQuit}
								onShowHelp={() => setShowHelp(true)}
								onStartSearch={() => {
									setMode('search');
								}}
								onStartEdit={() => {
									setMode('edit');
								}}
								onEndEdit={() => {
									setMode('browse');
								}}
								onUndo={handleUndo}
							/>
						</Box>
						<Box width="40%" flexDirection="column">
							<DetailsPanel
								focusedNode={treeState.focusedNode}
								validationErrors={validationErrors}
							/>
						</Box>
					</>
				)}
			</Box>
			<StatusBar
				mode={mode}
				errorCount={errorCount}
				warningCount={warningCount}
			/>
		</Box>
	);
}

export default function App({scope = 'auto'}: Props) {
	return (
		<ConfigProvider scope={scope}>
			<AppContent />
		</ConfigProvider>
	);
}
