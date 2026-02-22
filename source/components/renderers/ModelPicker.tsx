import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import TextInput from 'ink-text-input';
import {loadModels} from '../../lib/models-cache.js';
import type {RendererProps} from '../../types/index.js';
import type {Model, ModelsData} from '../../types/index.js';

export default function ModelPicker({
	value,
	onChange,
	onCancel,
}: RendererProps) {
	const [filter, setFilter] = useState('');
	const [models, setModels] = useState<ModelsData | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadModels()
			.then(data => {
				setModels(data);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	}, []);

	const filteredModels =
		models?.models.filter(m => {
			const fullId = `${m.providerId}/${m.id}`;
			return (
				fullId.toLowerCase().includes(filter.toLowerCase()) ||
				m.name.toLowerCase().includes(filter.toLowerCase())
			);
		}) ?? [];

	const grouped = new Map<string, Model[]>();
	for (const m of filteredModels) {
		const group = grouped.get(m.providerId) ?? [];
		group.push(m);
		grouped.set(m.providerId, group);
	}

	type FlatItem =
		| {type: 'header'; provider: string}
		| {type: 'model'; model: Model};

	const flatList: FlatItem[] = [];
	for (const [providerId, providerModels] of grouped) {
		flatList.push({type: 'header', provider: providerId});
		for (const m of providerModels) {
			flatList.push({type: 'model', model: m});
		}
	}

	const selectableIndices = flatList
		.map((item, i) => (item.type === 'model' ? i : -1))
		.filter(i => i >= 0);

	useInput((_input, key) => {
		if (key.escape) {
			onCancel();
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
			}
		}

		if (key.upArrow) {
			setSelectedIndex(i => Math.max(0, i - 1));
		}

		if (key.downArrow) {
			setSelectedIndex(i => Math.min(selectableIndices.length - 1, i + 1));
		}
	});

	useEffect(() => {
		setSelectedIndex(0);
	}, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

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

	let modelIndex = 0;

	return (
		<Box flexDirection="column" borderStyle="round" paddingX={1}>
			<Text bold>Select Model</Text>
			<Box>
				<Text>{'Filter: '}</Text>
				<TextInput value={filter} onChange={setFilter} />
			</Box>
			<Box flexDirection="column" marginTop={1}>
				{flatList.slice(0, 30).map((item, _i) => {
					if (item.type === 'header') {
						const providerName =
							models?.providers.find(p => p.id === item.provider)?.name ??
							item.provider;
						return (
							<Text key={`h-${item.provider}`} bold color="blue">
								{providerName}
							</Text>
						);
					}

					const isSelected = modelIndex === selectedIndex;
					const fullId = `${item.model.providerId}/${item.model.id}`;
					const isCurrent = fullId === String(value);
					const el = (
						<Text key={fullId}>
							{isSelected ? (
								<Text color="cyan">{'● '}</Text>
							) : isCurrent ? (
								<Text color="green">{'● '}</Text>
							) : (
								<Text>{'  '}</Text>
							)}
							<Text bold={isSelected}>{fullId}</Text>
							<Text dimColor>
								{'  '}
								{formatContext(item.model)}
								{'  '}
								{formatCost(item.model)}
							</Text>
						</Text>
					);
					modelIndex++;
					return el;
				})}
			</Box>
			<Box marginTop={1}>
				<Text dimColor>
					{'↑↓ navigate  Enter select  Esc cancel  Type to filter'}
				</Text>
			</Box>
		</Box>
	);
}
