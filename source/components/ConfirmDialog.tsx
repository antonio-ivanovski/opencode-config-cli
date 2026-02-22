import React from 'react';
import {Box, Text, useInput} from 'ink';

type Props = {
	message: string;
	onSave: () => void;
	onDiscard: () => void;
	onCancel: () => void;
};

export default function ConfirmDialog({
	message,
	onSave,
	onDiscard,
	onCancel,
}: Props) {
	useInput((input, key) => {
		if (input === 'y' || input === 'Y') onSave();
		if (input === 'n' || input === 'N') onDiscard();
		if (input === 'c' || input === 'C' || key.escape) onCancel();
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="yellow"
			paddingX={2}
			paddingY={1}
		>
			<Text color="yellow" bold>
				{message}
			</Text>
			<Text> </Text>
			<Text>[Y]es — Save and quit</Text>
			<Text>[N]o — Discard and quit</Text>
			<Text>[C]ancel — Go back</Text>
		</Box>
	);
}
