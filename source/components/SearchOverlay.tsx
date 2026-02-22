import React, {useState, useMemo} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import type {TreeNode} from '../types/index.js';

type Props = {
	allNodes: TreeNode[];
	onSelect: (path: string) => void;
	onCancel: () => void;
};

export default function SearchOverlay({allNodes, onSelect, onCancel}: Props) {
	const [query, setQuery] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Compute filtered results; reset selection inside memo on query change
	const results = useMemo(() => {
		setSelectedIndex(0);
		if (!query.trim()) return [];
		const q = query.toLowerCase();
		return allNodes
			.filter(
				n =>
					n.key.toLowerCase().includes(q) ||
					n.path.toLowerCase().includes(q) ||
					(n.schema.description?.toLowerCase().includes(q) ?? false),
			)
			.slice(0, 15);
	}, [query, allNodes]);

	useInput((_input, key) => {
		if (key.escape) {
			onCancel();
			return;
		}
		if (key.return && results.length > 0) {
			const result = results[selectedIndex];
			if (result) onSelect(result.path);
			return;
		}
		if (key.downArrow)
			setSelectedIndex(i => Math.min(results.length - 1, i + 1));
		if (key.upArrow) setSelectedIndex(i => Math.max(0, i - 1));
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			paddingX={1}
		>
			<Box>
				<Text color="cyan">/ </Text>
				<TextInput value={query} onChange={setQuery} />
			</Box>
			{results.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					{results.map((node, i) => (
						<Text key={node.id}>
							{i === selectedIndex ? (
								<Text color="cyan">{'> '}</Text>
							) : (
								<Text>{'  '}</Text>
							)}
							<Text bold={i === selectedIndex}>{node.path}</Text>
							{node.schema.description && (
								<Text dimColor>
									{' — '}
									{node.schema.description.slice(0, 40)}
								</Text>
							)}
						</Text>
					))}
				</Box>
			)}
			{query && results.length === 0 && (
				<Box marginTop={1}>
					<Text dimColor>No results</Text>
				</Box>
			)}
			<Box marginTop={1}>
				<Text dimColor>Enter jump Esc cancel ↑↓ navigate</Text>
			</Box>
		</Box>
	);
}
