import {resolveConfigPath} from '../lib/config-path.js';
import {readConfig} from '../lib/config-io.js';

export async function cmdGet(
	dotPath: string,
	scope: 'global' | 'project' | 'auto',
): Promise<string> {
	const {filePath} = resolveConfigPath(scope);
	const {data} = readConfig(filePath);

	const parts = dotPath.split('.');
	let current: unknown = data;

	for (const part of parts) {
		if (
			current === null ||
			typeof current !== 'object' ||
			Array.isArray(current)
		) {
			throw new Error(`Path not found: ${dotPath}`);
		}

		const obj = current as Record<string, unknown>;
		if (!(part in obj)) {
			throw new Error(`Path not found: ${dotPath}`);
		}

		current = obj[part];
	}

	if (current === null || current === undefined) {
		return String(current);
	}

	if (typeof current === 'object') {
		return JSON.stringify(current, null, 2);
	}

	return String(current);
}
