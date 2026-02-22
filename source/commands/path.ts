import {resolveConfigPath} from '../lib/config-path.js';

export async function cmdPath(
	scope: 'global' | 'project' | 'auto',
): Promise<string> {
	const {filePath} = resolveConfigPath(scope);
	return filePath;
}
