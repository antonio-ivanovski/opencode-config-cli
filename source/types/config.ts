export type ConfigScope = 'global' | 'project';

export type ConfigState = {
	data: Record<string, unknown>;
	filePath: string;
	rawText: string;
	dirty: boolean;
	scope: ConfigScope;
	format: 'json' | 'jsonc';
	exists: boolean;
};

export type Modification = {
	path: string[];
	value: unknown;
};
