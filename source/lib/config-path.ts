import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {ConfigScope} from '../types/index.js';

export function resolveGlobalPath(): string {
	const configDir = path.join(os.homedir(), '.config', 'opencode');
	const jsonc = path.join(configDir, 'opencode.jsonc');
	const json = path.join(configDir, 'opencode.json');

	if (fs.existsSync(jsonc)) return jsonc;
	if (fs.existsSync(json)) return json;

	// Default to .jsonc for creation
	return jsonc;
}

export function resolveProjectPath(): string | undefined {
	let dir = process.cwd();
	const root = path.parse(dir).root;

	while (true) {
		const jsonc = path.join(dir, 'opencode.jsonc');
		const json = path.join(dir, 'opencode.json');

		if (fs.existsSync(jsonc)) return jsonc;
		if (fs.existsSync(json)) return json;

		// Stop at .git boundary
		if (fs.existsSync(path.join(dir, '.git'))) break;

		const parent = path.dirname(dir);
		if (parent === dir || dir === root) break;
		dir = parent;
	}

	return undefined;
}

export function autoDetectScope(): {scope: ConfigScope; filePath: string} {
	const projectPath = resolveProjectPath();
	if (projectPath) {
		return {scope: 'project', filePath: projectPath};
	}

	return {scope: 'global', filePath: resolveGlobalPath()};
}

export function resolveConfigPath(scope: 'global' | 'project' | 'auto'): {
	scope: ConfigScope;
	filePath: string;
} {
	if (scope === 'auto') return autoDetectScope();

	if (scope === 'global') {
		return {scope: 'global', filePath: resolveGlobalPath()};
	}

	// project
	const projectPath = resolveProjectPath();
	const filePath = projectPath ?? path.join(process.cwd(), 'opencode.jsonc');
	return {scope: 'project', filePath};
}
