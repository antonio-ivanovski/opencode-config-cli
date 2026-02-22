import React from 'react';
import {Text, useInput} from 'ink';
import type {RendererProps} from '../../types/index.js';

export default function BooleanRenderer({
	value,
	onChange,
	onCancel,
}: RendererProps) {
	const current = Boolean(value);

	useInput((input, key) => {
		if (input === ' ' || key.return) {
			onChange(!current);
		}

		if (key.escape) {
			onCancel();
		}
	});

	return (
		<Text>
			{current ? (
				<Text color="green">true</Text>
			) : (
				<Text color="red">false</Text>
			)}
			<Text dimColor> (Enter/Space to toggle, Esc to cancel)</Text>
		</Text>
	);
}
