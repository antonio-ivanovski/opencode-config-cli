import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import TextInput from 'ink-text-input';
import type {RendererProps} from '../../types/index.js';

export default function NumberRenderer({
	value,
	schema,
	onChange,
	onCancel,
}: RendererProps) {
	const [text, setText] = useState(value !== undefined ? String(value) : '');

	const num = Number(text);
	const isValid =
		text !== '' &&
		!Number.isNaN(num) &&
		(schema.minimum === undefined || num >= schema.minimum) &&
		(schema.maximum === undefined || num <= schema.maximum);

	const handleSubmit = (val: string) => {
		const n = Number(val);
		if (!Number.isNaN(n) && isValid) {
			onChange(n);
		}
	};

	const rangeHint =
		schema.minimum !== undefined || schema.maximum !== undefined
			? ` (${schema.minimum ?? ''}..${schema.maximum ?? ''})`
			: '';

	useInput((_input, key) => {
		if (key.escape) {
			onCancel();
		}
	});

	return (
		<Box flexDirection="column">
			<Box>
				<TextInput value={text} onChange={setText} onSubmit={handleSubmit} />
				<Text dimColor>{rangeHint}</Text>
			</Box>
			{text !== '' && !isValid && (
				<Text color="red">
					{Number.isNaN(num)
						? 'Not a valid number'
						: `Out of range${rangeHint}`}
				</Text>
			)}
		</Box>
	);
}
