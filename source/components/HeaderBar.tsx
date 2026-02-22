import React from 'react';
import {Box, Text} from 'ink';
import {useConfig} from '../hooks/useConfig.js';

export default function HeaderBar() {
	const {activeScope, filePath, isDirty, projectExists} = useConfig();

	return (
		<Box flexDirection="column" paddingX={1}>
			<Box>
				<Text bold color="cyan">
					lazy-opencode-config
				</Text>
				<Text>{'  '}</Text>
				{/* Scope tabs */}
				<Text
					bold={activeScope === 'global'}
					color={activeScope === 'global' ? 'green' : undefined}
					dimColor={activeScope !== 'global'}
				>
					[Global]
				</Text>
				<Text> </Text>
				<Text
					bold={activeScope === 'project'}
					color={activeScope === 'project' ? 'green' : undefined}
					dimColor={activeScope !== 'project'}
				>
					{`[Project${!projectExists ? ' (new)' : ''}]`}
				</Text>
				<Text>{'  '}</Text>
				<Text dimColor>(Tab to switch)</Text>
			</Box>
			<Box>
				<Text dimColor>{filePath}</Text>
				{isDirty && <Text color="yellow"> [modified]</Text>}
			</Box>
		</Box>
	);
}
