import React from 'react';
import {Box, Text, useInput} from 'ink';

type Props = {
	onConfirm: () => void;
	onCancel: () => void;
};

export default function SaveConfirmDialog({onConfirm, onCancel}: Props) {
	useInput((input, key) => {
		if (input === 'y' || input === 'Y' || key.return) onConfirm();
		if (input === 'n' || input === 'N' || key.escape) onCancel();
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="#4CAF50"
			paddingX={3}
			paddingY={1}
		>
			<Text color="#4CAF50" bold>
				Save changes?
			</Text>
			<Text> </Text>
			<Box>
				<Text color="#00BCD4" bold>
					[Y]
				</Text>
				<Text dimColor>es — Save to disk</Text>
			</Box>
			<Box>
				<Text color="#00BCD4" bold>
					[N]
				</Text>
				<Text dimColor>o — Cancel</Text>
			</Box>
		</Box>
	);
}
