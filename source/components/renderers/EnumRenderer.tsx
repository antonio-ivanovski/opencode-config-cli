import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import type {RendererProps} from '../../types/index.js';

export default function EnumRenderer({
	value,
	schema,
	onChange,
	onCancel,
}: RendererProps) {
	const options = schema.enumValues ?? [];
	const currentIndex = options.indexOf(String(value));
	const [selectedIndex, setSelectedIndex] = useState(Math.max(0, currentIndex));

	useInput((_input, key) => {
		if (key.upArrow) {
			setSelectedIndex(i => Math.max(0, i - 1));
		}

		if (key.downArrow) {
			setSelectedIndex(i => Math.min(options.length - 1, i + 1));
		}

		if (key.return) {
			onChange(options[selectedIndex]);
		}

		if (key.escape) {
			onCancel();
		}
	});

	return (
		<Box flexDirection="column">
			{options.map((opt, i) => (
				<Text key={opt}>
					{i === selectedIndex ? (
						<Text color="cyan">{'● '}</Text>
					) : (
						<Text>{'  '}</Text>
					)}
					{opt === String(value) ? <Text bold>{opt}</Text> : <Text>{opt}</Text>}
				</Text>
			))}
			<Text dimColor>{'↑↓ navigate  Enter select  Esc cancel'}</Text>
		</Box>
	);
}
