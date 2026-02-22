import {resolveConfigPath} from '../lib/config-path.js';
import {readConfig, writeConfig} from '../lib/config-io.js';
import type {Modification} from '../types/index.js';

export async function cmdDelete(
	dotPath: string,
	scope: 'global' | 'project' | 'auto',
): Promise<string> {
	const {filePath} = resolveConfigPath(scope);
	const {rawText} = readConfig(filePath);

	const modification: Modification = {
		path: dotPath.split('.'),
		value: undefined,
	};

	writeConfig(filePath, rawText, [modification]);

	return `Deleted: ${dotPath}`;
}
