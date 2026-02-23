import React, {useState, useEffect, useMemo} from 'react';
import {Text, Box, useInput} from 'ink';
import {loadModels} from '../../lib/models-cache.js';
import type {RendererProps} from '../../types/index.js';
import type {Model, ModelsData} from '../../types/index.js';
import {useTerminalSize} from '../../hooks/useTerminalSize.js';
import {buildFlatList, buildVisibleSlice} from '../../lib/model-picker-list.js';

function getPickerTitle(path: string): string {
	// agent.<name>.model → "Select Model for <name>"
	const agentMatch = path.match(/^agent\.(.+)\.model$/);
	if (agentMatch) return `Select Model for ${agentMatch[1]}`;
	if (path === 'small_model') return 'Select Small Model';
	return 'Select Model';
}

function getTargetLabel(path: string): string {
	const agentMatch = path.match(/^agent\.(.+)\.model$/);
	if (agentMatch) return `agent › ${agentMatch[1]} › model`;
	if (path === 'small_model') return 'small_model (global)';
	return 'model (global)';
}

// Lines consumed by chrome above/below the list:
//   border top(1) + paddingY top(1) + title(1) + subtitle(1) + filter row(1) +
//   list marginTop(1) + hint marginTop(1) + hint row(1) + paddingY bottom(1) +
//   border bottom(1) = 10
const CHROME_ROWS = 10;
const PADDING_X = 2;
const PADDING_Y = 1;
// Maximum picker width (chars). Shrinks further if terminal is narrower.
const MAX_PICKER_WIDTH = 72;

function fitText(text: string, width: number): string {
	if (width <= 0) return '';
	if (text.length > width) return text.slice(0, width);
	return text.padEnd(width, ' ');
}

export default function ModelPicker({
	node,
	value,
	onChange,
	onCancel,
}: RendererProps) {
	const {columns, rows} = useTerminalSize();
	const treePaneWidth = Math.floor(columns * 0.6);
	// Picker width: narrower of MAX_PICKER_WIDTH and tree pane width
	const pickerWidth = Math.min(
		MAX_PICKER_WIDTH,
		Math.max(24, treePaneWidth - 2),
	);
	const contentWidth = Math.max(10, pickerWidth - 2 - PADDING_X * 2);
	// Viewport height: rows minus chrome, clamped to a sensible range
	const viewHeight = Math.max(5, rows - CHROME_ROWS);

	const [filter, setFilter] = useState('');
	const [models, setModels] = useState<ModelsData | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [detectedModels, setDetectedModels] = useState<string[]>([]);
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		loadModels()
			.then(data => {
				setModels(data);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});

		import('node:child_process')
			.then(mod => {
				const execSync = mod.execSync;
				try {
					const output = execSync('opencode models', {
						encoding: 'utf8',
						stdio: ['ignore', 'pipe', 'ignore'],
					});
					const lines = output
						.split('\n')
						.map(line => line.trim())
						.filter(Boolean);
					setDetectedModels(lines);
				} catch {
					setDetectedModels([]);
				}
			})
			.catch(() => {
				setDetectedModels([]);
			});
	}, []);

	const detectedSet = useMemo(() => new Set(detectedModels), [detectedModels]);

	const handleFilterChange = (next: string) => {
		setFilter(next);
		setSelectedIndex(0);
	};

	const filteredModels = useMemo(() => {
		const lower = filter.toLowerCase();
		return (
			models?.models.filter(m => {
				const fullId = `${m.providerId}/${m.id}`;
				return (
					fullId.toLowerCase().includes(lower) ||
					m.name.toLowerCase().includes(lower)
				);
			}) ?? []
		);
	}, [filter, models]);

	const orderedModels = useMemo(() => {
		if (detectedSet.size === 0) return filteredModels;
		const detected: Model[] = [];
		const others: Model[] = [];
		for (const m of filteredModels) {
			const fullId = `${m.providerId}/${m.id}`;
			if (detectedSet.has(fullId)) detected.push(m);
			else others.push(m);
		}
		return [...detected, ...others];
	}, [filteredModels, detectedSet]);

	const flatList = useMemo(
		() => buildFlatList(models, orderedModels, showAll, detectedSet),
		[models, orderedModels, showAll, detectedSet],
	);

	// selectableIndices[i] = index in flatList for the i-th selectable model row
	const selectableIndices = flatList
		.map((item, i) => (item.type === 'model' ? i : -1))
		.filter(i => i >= 0);

	useEffect(() => {
		if (selectableIndices.length === 0) {
			if (selectedIndex !== 0) setSelectedIndex(0);
			return;
		}
		if (selectedIndex >= selectableIndices.length) {
			setSelectedIndex(selectableIndices.length - 1);
		}
	}, [selectableIndices.length, selectedIndex]);

	// Keep 2 rows reserved for scroll indicators to avoid layout jitter
	const listHeight = Math.max(1, viewHeight - 2);
	const [scrollOffset, setScrollOffset] = useState(0);
	const {
		visibleRows,
		showScrollUp,
		showScrollDown,
		scrollOffset: nextOffset,
	} = buildVisibleSlice(
		flatList,
		selectableIndices,
		selectedIndex,
		listHeight,
		scrollOffset,
	);

	useEffect(() => {
		if (nextOffset !== scrollOffset) setScrollOffset(nextOffset);
	}, [nextOffset, scrollOffset]);

	useInput((input, key) => {
		if (key.escape) {
			onCancel();
			return;
		}

		if (key.tab) {
			setSelectedIndex(0);
			setShowAll(prev => !prev);
			return;
		}

		if (key.return) {
			if (selectableIndices.length === 0) {
				if (filter.trim()) onChange(filter.trim());
				return;
			}

			const item = flatList[selectableIndices[selectedIndex]!];
			if (item?.type === 'model') {
				onChange(`${item.model.providerId}/${item.model.id}`);
				return;
			}

			return;
		}

		if (key.upArrow) {
			if (selectableIndices.length === 0) return;
			setSelectedIndex(i => Math.max(0, i - 1));
			return;
		}

		if (key.downArrow) {
			if (selectableIndices.length === 0) return;
			setSelectedIndex(i => Math.min(selectableIndices.length - 1, i + 1));
			return;
		}

		// Page / half-page scroll via keyboard
		// (Terminal mouse/click is not supported in Ink 4.x — no mouse event API)
		const halfPage = Math.max(1, Math.floor(listHeight / 2));
		if (key.pageDown || (key.ctrl && input === 'f')) {
			if (selectableIndices.length === 0) return;
			setSelectedIndex(i =>
				Math.min(selectableIndices.length - 1, i + listHeight),
			);
			return;
		}

		if (key.pageUp || (key.ctrl && input === 'b')) {
			if (selectableIndices.length === 0) return;
			setSelectedIndex(i => Math.max(0, i - listHeight));
			return;
		}

		if (key.ctrl && input === 'd') {
			if (selectableIndices.length === 0) return;
			setSelectedIndex(i =>
				Math.min(selectableIndices.length - 1, i + halfPage),
			);
			return;
		}

		if (key.ctrl && input === 'u') {
			if (selectableIndices.length === 0) return;
			setSelectedIndex(i => Math.max(0, i - halfPage));
			return;
		}

		if (key.ctrl && input === 'l') {
			handleFilterChange('');
			return;
		}

		// Jump to first / last model
		if (input === 'g') {
			if (selectableIndices.length === 0) return;
			setSelectedIndex(0);
			return;
		}

		if (input === 'G') {
			if (selectableIndices.length === 0) return;
			setSelectedIndex(selectableIndices.length - 1);
			return;
		}

		// Filter: handle backspace and printable characters directly
		// This avoids ink-text-input's ANSI cursor rendering which can leave
		// visual artifacts (e.g. filter text overlapping adjacent tree nodes)
		// when the picker unmounts after model selection.
		if (key.backspace || key.delete) {
			handleFilterChange(filter.slice(0, -1));
			return;
		}

		if (input && !key.ctrl && !key.meta && input.length === 1) {
			handleFilterChange(filter + input);
		}
	});

	if (loading) return <Text dimColor>Loading models...</Text>;

	const formatCost = (m: Model) => {
		if (m.costInput === undefined) return '';
		return `$${m.costInput}/$${m.costOutput ?? '?'}`;
	};

	const formatContext = (m: Model) => {
		if (!m.context) return '';
		return m.context >= 1_000_000
			? `${Math.round(m.context / 1_000_000)}M`
			: `${Math.round(m.context / 1000)}K`;
	};

	// Build a map from flatList index → selectable model index for O(1) lookup
	const flatIndexToModelIndex = new Map<number, number>();
	selectableIndices.forEach((flatIdx, modelIdx) => {
		flatIndexToModelIndex.set(flatIdx, modelIdx);
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			paddingX={PADDING_X}
			paddingY={PADDING_Y}
			borderColor="#00BCD4"
			width={pickerWidth}
		>
			<Text bold color="#00BCD4">
				{getPickerTitle(node.path)}
			</Text>
			<Text dimColor>
				{'Setting: '}
				<Text color="#FF9800">{getTargetLabel(node.path)}</Text>
				{'  '}
				{showAll
					? 'Showing all models'
					: detectedSet.size > 0
					? 'Showing detected'
					: 'Showing all'}
			</Text>
			<Box marginTop={1}>
				<Text>{'Filter: '}</Text>
				<Text>
					{fitText(filter, Math.max(0, contentWidth - 'Filter: '.length - 1))}
				</Text>
				<Text color="cyan">{'█'}</Text>
			</Box>
			<Box flexDirection="column" marginTop={1}>
				{flatList.length === 0 && (
					<Text dimColor>
						{showAll || detectedSet.size === 0
							? 'No models match'
							: 'No detected models match'}
					</Text>
				)}
				<Text dimColor>{showScrollUp ? '  ↑ more above' : '  '}</Text>
				{visibleRows.map(row => {
					const {item, flatIndex} = row;
					if (item.type === 'header') {
						return (
							<Box key={`h-${item.providerId}-${flatIndex}`}>
								<Text bold color="blue" wrap="truncate">
									{fitText(item.label, contentWidth)}
								</Text>
							</Box>
						);
					}

					const modelIdx = flatIndexToModelIndex.get(flatIndex)!;
					const isSelected = modelIdx === selectedIndex;
					const fullId = item.fullId;
					const isCurrent = fullId === String(value);
					const metaParts = [formatContext(item.model), formatCost(item.model)]
						.filter(Boolean)
						.join('  ');
					const lineText = metaParts ? `${fullId}  ${metaParts}` : fullId;
					const displayText = fitText(lineText, Math.max(0, contentWidth - 2));

					return (
						<Box key={`${fullId}-${flatIndex}`}>
							{isSelected ? (
								<Text color="cyan">{'▌ '}</Text>
							) : isCurrent ? (
								<Text color="green">{'● '}</Text>
							) : (
								<Text>{'  '}</Text>
							)}
							<Text bold={isSelected} wrap="truncate">
								{displayText}
							</Text>
						</Box>
					);
				})}
				<Text dimColor>{showScrollDown ? '  ↓ more below' : '  '}</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor wrap="truncate">
					{fitText(
						'↑↓ navigate  PgDn/PgUp scroll  g/G top/bottom  Enter select  Esc cancel  Tab show/hide all  Type to filter',
						contentWidth,
					)}
				</Text>
			</Box>
		</Box>
	);
}
