import React from 'react';
import {Box, Text, useInput} from 'ink';

type Props = {
	onClose: () => void;
};

const HELP_SECTIONS = [
	{
		title: 'Navigation',
		binds: [
			['↑ / k', 'Move up'],
			['↓ / j', 'Move down'],
			['→ / l / Enter', 'Expand branch'],
			['← / h', 'Collapse branch / go to parent'],
			['Enter', 'Edit value (on leaf nodes)'],
		],
	},
	{
		title: 'Actions',
		binds: [
			['a', 'Add new key (for dynamic objects/arrays)'],
			['d', 'Delete / unset value'],
			['D', 'Delete key from file'],
			['s / Ctrl+s', 'Save to disk'],
			['u / Ctrl+z', 'Undo last change'],
		],
	},
	{
		title: 'View',
		binds: [
			['H', 'Toggle visibility of unset values'],
			['/', 'Search / filter tree'],
			['Tab', 'Switch scope (Global ↔ Project)'],
			['r', 'Refresh models cache'],
			['?', 'Show this help overlay'],
		],
	},
	{
		title: 'General',
		binds: [
			['q / Ctrl+c', 'Quit (prompts if unsaved)'],
			['Esc', 'Cancel edit / close overlay / back'],
		],
	},
];

export default function HelpOverlay({onClose}: Props) {
	useInput((input, key) => {
		if (key.escape || input === '?' || input === 'q') {
			onClose();
		}
	});

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			paddingX={2}
			paddingY={1}
		>
			<Text bold color="cyan">
				Keyboard Shortcuts
			</Text>
			<Text> </Text>
			{HELP_SECTIONS.map(section => (
				<Box key={section.title} flexDirection="column" marginBottom={1}>
					<Text bold underline>
						{section.title}
					</Text>
					{section.binds.map(([key, desc]) => (
						<Box key={key}>
							<Box width={20}>
								<Text color="green">{key}</Text>
							</Box>
							<Text>{desc}</Text>
						</Box>
					))}
				</Box>
			))}
			<Text dimColor>Press Esc or ? to close</Text>
		</Box>
	);
}
