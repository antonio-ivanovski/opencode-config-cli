import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import TextInput from 'ink-text-input';
import {getSuggestions} from '../../lib/defaults.js';
import type {RendererProps} from '../../types/index.js';

export default function TextRenderer({
	node,
	value,
	onChange,
	onCancel,
}: RendererProps) {
	const [text, setText] = useState(value !== undefined ? String(value) : '');
	const [suggestionIndex, setSuggestionIndex] = useState(-1);

	const suggestions = getSuggestions(node.path).filter(
		s => s.toLowerCase().startsWith(text.toLowerCase()) && s !== text,
	);

	const handleSubmit = (val: string) => {
		onChange(val);
	};

	useInput((_input, key) => {
		if (key.escape) {
			onCancel();
			return;
		}

		if (key.tab && suggestions.length > 0 && suggestionIndex >= 0) {
			setText(suggestions[suggestionIndex]!);
			setSuggestionIndex(-1);
		}

		if (key.downArrow && suggestions.length > 0) {
			setSuggestionIndex(i => Math.min(suggestions.length - 1, i + 1));
		}

		if (key.upArrow && suggestions.length > 0) {
			setSuggestionIndex(i => Math.max(-1, i - 1));
		}
	});

	return (
		<Box flexDirection="column">
			<Box>
				<TextInput value={text} onChange={setText} onSubmit={handleSubmit} />
			</Box>
			{suggestions.length > 0 && (
				<Box flexDirection="column" marginLeft={2}>
					{suggestions.slice(0, 8).map((s, i) => (
						<Text
							key={s}
							color={i === suggestionIndex ? 'cyan' : undefined}
							dimColor={i !== suggestionIndex}
						>
							{i === suggestionIndex ? '› ' : '  '}
							{s}
						</Text>
					))}
				</Box>
			)}
		</Box>
	);
}
