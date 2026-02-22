import React from 'react';
import {Box, Text} from 'ink';

type Props = {
	mode: 'browse' | 'edit' | 'search';
	errorCount: number;
	warningCount: number;
};

export default function StatusBar({mode, errorCount, warningCount}: Props) {
	const hints = {
		browse:
			'↑↓ navigate  Enter edit  a add  d delete  / search  H toggle unset  Tab scope  s save  q quit  ? help',
		edit: 'Enter confirm  Esc cancel',
		search: 'Enter jump  Esc clear  ↑↓ navigate',
	};

	let validationText = '';
	if (errorCount > 0) {
		validationText = `✗ ${errorCount} error${errorCount > 1 ? 's' : ''}`;
	} else {
		validationText = '✓ valid';
	}

	if (warningCount > 0) {
		validationText += `  ⚠ ${warningCount} warning${
			warningCount > 1 ? 's' : ''
		}`;
	}

	return (
		<Box paddingX={1} justifyContent="space-between">
			<Text dimColor>{hints[mode]}</Text>
			<Text color={errorCount > 0 ? 'red' : 'green'}>{validationText}</Text>
		</Box>
	);
}
