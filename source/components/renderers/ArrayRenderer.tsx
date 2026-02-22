import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import TextInput from 'ink-text-input';
import type {RendererProps} from '../../types/index.js';

export default function ArrayRenderer({
	value,
	onChange,
	onCancel,
}: RendererProps) {
	const items = Array.isArray(value) ? [...value] : [];
	const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [inputText, setInputText] = useState('');
	const [editIndex, setEditIndex] = useState(-1);

	useInput((input, key) => {
		if (mode !== 'list') return;
		if (key.escape) {
			onCancel();
			return;
		}

		if (key.upArrow) {
			setSelectedIndex(i => Math.max(0, i - 1));
		}

		if (key.downArrow) {
			setSelectedIndex(i => Math.min(items.length - 1, i + 1));
		}

		if (input === 'a') {
			setMode('add');
			setInputText('');
		}

		if (input === 'd' && items.length > 0) {
			const newItems = items.filter((_, i) => i !== selectedIndex);
			onChange(newItems);
			setSelectedIndex(i => Math.min(i, Math.max(0, newItems.length - 1)));
		}

		if (key.return && items.length > 0) {
			setEditIndex(selectedIndex);
			setInputText(String(items[selectedIndex] ?? ''));
			setMode('edit');
		}
	});

	const handleAddSubmit = (val: string) => {
		if (val.trim()) {
			onChange([...items, val.trim()]);
		}

		setMode('list');
	};

	const handleEditSubmit = (val: string) => {
		const newItems = [...items];
		newItems[editIndex] = val.trim();
		onChange(newItems);
		setMode('list');
	};

	return (
		<Box flexDirection="column">
			<Box flexDirection="column">
				{items.length === 0 && mode === 'list' && (
					<Text dimColor>(empty — press 'a' to add)</Text>
				)}
				{items.map((item, i) => (
					// eslint-disable-next-line react/no-array-index-key
					<Box key={`item-${String(item)}-${i}`}>
						<Text
							color={
								i === selectedIndex && mode === 'list' ? 'cyan' : undefined
							}
						>
							{i === selectedIndex && mode === 'list' ? '> ' : '  '}
							{String(item)}
						</Text>
					</Box>
				))}
			</Box>

			{mode === 'add' && (
				<Box marginTop={1}>
					<Text>Add item: </Text>
					<TextInput
						value={inputText}
						onChange={setInputText}
						onSubmit={handleAddSubmit}
					/>
				</Box>
			)}

			{mode === 'edit' && (
				<Box marginTop={1}>
					<Text>Edit item: </Text>
					<TextInput
						value={inputText}
						onChange={setInputText}
						onSubmit={handleEditSubmit}
					/>
				</Box>
			)}

			{mode === 'list' && (
				<Box marginTop={1}>
					<Text dimColor>a=add d=delete enter=edit esc=cancel</Text>
				</Box>
			)}
		</Box>
	);
}
