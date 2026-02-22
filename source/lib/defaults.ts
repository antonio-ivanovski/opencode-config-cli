import os from 'node:os';

export const KEY_ORDER: string[] = [
	'model',
	'small_model',
	'theme',
	'logLevel',
	'username',
	'agent',
	'provider',
	'permission',
	'tools',
	'keybinds',
	'tui',
	'server',
	'command',
	'formatter',
	'compaction',
	'watcher',
	'instructions',
	'skills',
	'share',
	'autoupdate',
	'snapshot',
	'disabled_providers',
	'enabled_providers',
	'experimental',
	'plugin',
];

export const FIELD_SUGGESTIONS: Record<string, string[]> = {
	theme: [
		'opencode',
		'catppuccin',
		'dracula',
		'gruvbox',
		'nord',
		'solarized',
		'tokyonight',
		'monokai',
		'one-dark',
	],
	default_agent: ['build', 'plan'],
	logLevel: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
	share: ['manual', 'auto', 'disabled'],
	'tui.diff_style': ['auto', 'stacked'],
};

export function getSuggestions(
	fieldPath: string,
	configData?: Record<string, unknown>,
): string[] {
	// Dynamic: username
	if (fieldPath === 'username') {
		try {
			return [os.userInfo().username];
		} catch {
			return [];
		}
	}

	// Dynamic: default_agent — include agent names from configData
	if (fieldPath === 'default_agent') {
		const base = [...(FIELD_SUGGESTIONS['default_agent'] ?? [])];
		if (configData) {
			const agents = configData['agent'];
			if (agents && typeof agents === 'object' && !Array.isArray(agents)) {
				for (const name of Object.keys(agents as Record<string, unknown>)) {
					if (!base.includes(name)) base.push(name);
				}
			}
		}

		return base;
	}

	return FIELD_SUGGESTIONS[fieldPath] ?? [];
}
