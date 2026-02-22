import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {SchemaNode} from '../types/index.js';

const CACHE_DIR = path.join(os.homedir(), '.cache', 'lazy-opencode-config');
const CACHE_FILE = path.join(CACHE_DIR, 'schema.json');
const SCHEMA_URL = 'https://opencode.ai/config.json';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const KEY_ORDER = [
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

// Minimal fallback schema if network and cache both unavailable
const FALLBACK_SCHEMA: Record<string, SchemaNode> = {
	model: {type: 'string', description: 'Default model to use'},
	small_model: {
		type: 'string',
		description: 'Small model for lightweight tasks',
	},
	theme: {type: 'string', description: 'UI theme'},
	logLevel: {
		type: 'enum',
		description: 'Log level',
		enumValues: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
	},
	username: {type: 'string', description: 'Username displayed in TUI'},
	agent: {type: 'object', description: 'Agent configurations'},
	provider: {type: 'object', description: 'Provider configurations'},
	permission: {type: 'object', description: 'Permission settings'},
	tools: {type: 'object', description: 'Tool configurations'},
	keybinds: {type: 'object', description: 'Keybind overrides'},
	tui: {type: 'object', description: 'TUI display settings'},
	server: {type: 'object', description: 'Server settings'},
	command: {type: 'object', description: 'Custom commands'},
	formatter: {type: 'object', description: 'Code formatter settings'},
	compaction: {type: 'object', description: 'Compaction settings'},
	watcher: {type: 'object', description: 'File watcher settings'},
	instructions: {type: 'string', description: 'System instructions'},
	skills: {type: 'array', description: 'Skills to load'},
	share: {
		type: 'enum',
		description: 'Share mode',
		enumValues: ['manual', 'auto', 'disabled'],
	},
	autoupdate: {type: 'mixed', description: 'Auto-update setting'},
	snapshot: {type: 'object', description: 'Snapshot settings'},
	disabled_providers: {type: 'array', description: 'Disabled providers'},
	enabled_providers: {type: 'array', description: 'Enabled providers'},
	experimental: {type: 'object', description: 'Experimental features'},
	plugin: {type: 'object', description: 'Plugin configurations'},
};

function ensureCacheDir(): void {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR, {recursive: true});
	}
}

function isCacheFresh(): boolean {
	try {
		const stat = fs.statSync(CACHE_FILE);
		return Date.now() - stat.mtimeMs < TTL_MS;
	} catch {
		return false;
	}
}

function readCache(): unknown | undefined {
	try {
		const raw = fs.readFileSync(CACHE_FILE, 'utf8');
		return JSON.parse(raw);
	} catch {
		return undefined;
	}
}

function writeCache(data: unknown): void {
	try {
		ensureCacheDir();
		fs.writeFileSync(CACHE_FILE, JSON.stringify(data), 'utf8');
	} catch {
		// Cache write failure is non-fatal
	}
}

export async function fetchSchema(): Promise<unknown> {
	if (isCacheFresh()) {
		const cached = readCache();
		if (cached !== undefined) return cached;
	}

	try {
		const response = await fetch(SCHEMA_URL);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const data: unknown = await response.json();
		writeCache(data);
		return data;
	} catch {
		// Fall back to cache even if stale
		const cached = readCache();
		if (cached !== undefined) return cached;

		// Last resort: bundled fallback
		return {
			properties: Object.fromEntries(
				Object.entries(FALLBACK_SCHEMA).map(([k, v]) => [k, v]),
			),
		};
	}
}

function resolveRef(ref: string, rootSchema: any): any {
	// Only handle local $ref like "#/$defs/Foo"
	const parts = ref.replace(/^#\//, '').split('/');
	let current: any = rootSchema;
	for (const part of parts) {
		if (current === undefined || current === null) return undefined;
		current = current[part];
	}

	return current;
}

function parseNode(raw: any, rootSchema: any): SchemaNode {
	if (!raw || typeof raw !== 'object') {
		return {type: 'string'};
	}

	// Resolve $ref
	if (raw.$ref) {
		const resolved = resolveRef(raw.$ref, rootSchema);
		return parseNode(resolved ?? {}, rootSchema);
	}

	// Handle anyOf / oneOf unions
	const union = raw.anyOf ?? raw.oneOf;
	if (union && Array.isArray(union)) {
		const enumValues: string[] = [];
		let hasBoolean = false;
		let hasString = false;
		let hasNumber = false;

		for (const variant of union) {
			const resolved = variant.$ref
				? resolveRef(variant.$ref, rootSchema) ?? variant
				: variant;
			if (resolved.type === 'boolean') hasBoolean = true;
			else if (resolved.type === 'string') {
				hasString = true;
				if (Array.isArray(resolved.enum)) {
					for (const v of resolved.enum) {
						if (typeof v === 'string') enumValues.push(v);
					}
				}
			} else if (resolved.type === 'number' || resolved.type === 'integer') {
				hasNumber = true;
			}
		}

		const node: SchemaNode = {
			type: 'mixed',
			description: raw.description,
			default: raw.default,
		};
		if (enumValues.length > 0 || hasBoolean || hasString || hasNumber) {
			if (hasBoolean) enumValues.unshift('true', 'false');
			if (enumValues.length > 0) node.enumValues = enumValues;
		}

		return node;
	}

	// Determine type
	let type: SchemaNode['type'] = 'string';
	if (raw.type === 'object') type = 'object';
	else if (raw.type === 'array') type = 'array';
	else if (raw.type === 'boolean') type = 'boolean';
	else if (raw.type === 'number' || raw.type === 'integer') type = 'number';
	else if (raw.type === 'string') type = 'string';
	else if (Array.isArray(raw.enum)) type = 'enum';

	const node: SchemaNode = {
		type,
		description: raw.description,
		default: raw.default,
		format: raw.format,
		minimum: raw.minimum,
		maximum: raw.maximum,
	};

	if (Array.isArray(raw.enum)) {
		node.type = 'enum';
		node.enumValues = raw.enum.filter((v: unknown) => typeof v === 'string');
	}

	if (raw['x-deprecated'] || raw.deprecated) {
		node.deprecated = true;
		node.deprecatedMessage =
			raw['x-deprecated-message'] ?? raw.deprecatedMessage;
	}

	if (type === 'object') {
		if (raw.properties && typeof raw.properties === 'object') {
			node.properties = {};
			for (const [key, val] of Object.entries(raw.properties)) {
				node.properties[key] = parseNode(val, rootSchema);
			}
		}

		if (raw.additionalProperties !== undefined) {
			if (typeof raw.additionalProperties === 'boolean') {
				node.additionalProperties = raw.additionalProperties;
			} else {
				node.additionalProperties = parseNode(
					raw.additionalProperties,
					rootSchema,
				);
			}
		}
	}

	if (type === 'array' && raw.items) {
		node.items = parseNode(raw.items, rootSchema);
	}

	return node;
}

export function parseSchema(rawSchema: any): Record<string, SchemaNode> {
	const result: Record<string, SchemaNode> = {};
	const properties = rawSchema?.properties ?? {};

	// Collect all keys and order them per KEY_ORDER
	const allKeys = Object.keys(properties);
	const orderedKeys = [
		...KEY_ORDER.filter(k => allKeys.includes(k)),
		...allKeys.filter(k => !KEY_ORDER.includes(k)),
	];

	for (const key of orderedKeys) {
		result[key] = parseNode(properties[key], rawSchema);
	}

	return result;
}
