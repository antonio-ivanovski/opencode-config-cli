import React from 'react';
import {Box, Text, useInput} from 'ink';

type Props = {
	onClose: () => void;
};

const HELP_SECTIONS = [
	{
		title: 'Navigation',
		binds: [
			['↑ / k', 'Move up one row'],
			['↓ / j', 'Move down one row'],
			['PgDn / Ctrl+f', 'Scroll down one page'],
			['PgUp / Ctrl+b', 'Scroll up one page'],
			['Ctrl+d', 'Scroll down half page'],
			['Ctrl+u', 'Scroll up half page'],
			['g', 'Jump to top'],
			['G', 'Jump to bottom'],
			['→ / l / Enter', 'Expand branch'],
			['← / h', 'Collapse branch'],
			['Enter', 'Edit value (leaf nodes)'],
		],
	},
	{
		title: 'Actions (item-specific — see right panel)',
		binds: [
			['a', 'Add entry to selected branch'],
			['A', 'Add entry to parent branch'],
			['d', 'Unset value (keeps key in schema)'],
			['D', 'Delete key from file entirely'],
			['r', 'Revert to original value'],
			['K', 'Move array item up'],
			['J', 'Move array item down'],
		],
	},
	{
		title: 'View',
		binds: [
			['H', 'Toggle show/hide unset values'],
			['E', 'Toggle show/hide edits'],
			['/', 'Search / filter tree'],
			['Tab', 'Switch scope (Global ↔ Project)'],
			['?', 'Show this help overlay'],
		],
	},
	{
		title: 'Save & Quit',
		binds: [
			['s', 'Save (with confirmation prompt)'],
			['S', 'Save immediately (no prompt)'],
			['u / Ctrl+z', 'Undo last change'],
			['q / Ctrl+c', 'Quit (prompts if unsaved)'],
			['Esc', 'Cancel edit / close overlay'],
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
			borderColor="#00BCD4"
			paddingX={3}
			paddingY={1}
		>
			<Text bold color="#00BCD4">
				⌨ Keyboard Shortcuts
			</Text>
			<Text> </Text>
			{HELP_SECTIONS.map((section, idx) => (
				<Box key={section.title} flexDirection="column">
					<Text bold color="white">
						{section.title}
					</Text>
					{section.binds.map(([key, desc]) => (
						<Box key={key}>
							<Box width={24}>
								<Text color="#00BCD4">{key}</Text>
							</Box>
							<Text dimColor>{desc}</Text>
						</Box>
					))}
					{idx < HELP_SECTIONS.length - 1 && <Text> </Text>}
				</Box>
			))}
			<Text> </Text>
			<Text dimColor color="gray">
				Press Esc or ? to close
			</Text>
		</Box>
	);
}
