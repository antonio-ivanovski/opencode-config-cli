import React from 'react';
import {Box, Text} from 'ink';
import {useConfig} from '../hooks/useConfig.js';
import {useTerminalSize} from '../hooks/useTerminalSize.js';

export default function HeaderBar() {
	const {activeScope, filePath, isDirty, projectExists} = useConfig();
	const {columns} = useTerminalSize();

	// Build separator lines that fill the terminal width
	// paddingX={1} consumes 2 chars on each side (1 left + 1 right box padding)
	const innerWidth = Math.max(0, columns - 2);
	// Top line: "┏━ lazy-opencode-config ━━━..."
	const titleSegment = '━ lazy-opencode-config ';
	const topFill = '━'.repeat(Math.max(0, innerWidth - titleSegment.length - 1));
	const topLine = `┏${titleSegment}${topFill}`;
	// Bottom line
	const bottomLine = `┗${'━'.repeat(Math.max(0, innerWidth - 1))}`;

	return (
		<Box flexDirection="column">
			<Box paddingX={1}>
				<Text color="#00BCD4" bold>
					{topLine}
				</Text>
			</Box>
			<Box paddingX={1} justifyContent="space-between">
				<Box>
					<Text color="#00BCD4">┃ </Text>
					{/* Active scope with filled circle */}
					<Text
						color={activeScope === 'global' ? '#00BCD4' : undefined}
						bold={activeScope === 'global'}
						dimColor={activeScope !== 'global'}
					>
						{activeScope === 'global' ? '◉' : '○'} Global
					</Text>
					<Text> </Text>
					<Text
						color={activeScope === 'project' ? '#00BCD4' : undefined}
						bold={activeScope === 'project'}
						dimColor={activeScope !== 'project'}
					>
						{activeScope === 'project' ? '◉' : '○'} Project
						{!projectExists && ' (new)'}
					</Text>
				</Box>
				<Box>
					<Text dimColor>{filePath}</Text>
					{isDirty && <Text color="#FF9800"> [mod]</Text>}
					<Text color="#00BCD4"> ┃</Text>
				</Box>
			</Box>
			<Box paddingX={1}>
				<Text color="#00BCD4">{bottomLine}</Text>
			</Box>
		</Box>
	);
}
