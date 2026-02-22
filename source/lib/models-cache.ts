import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {Model, ModelsData, Provider} from '../types/index.js';

const CACHE_DIR = path.join(os.homedir(), '.cache', 'lazy-opencode-config');
const CACHE_FILE = path.join(CACHE_DIR, 'models.json');
const MODELS_URL = 'https://models.dev/api.json';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

function readCache(): ModelsData | undefined {
	try {
		const raw = fs.readFileSync(CACHE_FILE, 'utf8');
		return JSON.parse(raw) as ModelsData;
	} catch {
		return undefined;
	}
}

function writeCache(data: ModelsData): void {
	try {
		ensureCacheDir();
		fs.writeFileSync(CACHE_FILE, JSON.stringify(data), 'utf8');
	} catch {
		// Non-fatal
	}
}

function parseApiResponse(raw: unknown): ModelsData {
	const providers: Provider[] = [];
	const models: Model[] = [];

	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
		return {providers, models};
	}

	const data = raw as Record<string, unknown>;

	// models.dev API shape: { [providerId]: { name, models: { [modelId]: {...} } } }
	for (const [providerId, providerRaw] of Object.entries(data)) {
		if (!providerRaw || typeof providerRaw !== 'object') continue;
		const providerData = providerRaw as Record<string, unknown>;

		const providerModels = providerData['models'];
		if (
			!providerModels ||
			typeof providerModels !== 'object' ||
			Array.isArray(providerModels)
		)
			continue;

		const modelEntries = Object.entries(
			providerModels as Record<string, unknown>,
		);
		if (modelEntries.length === 0) continue;

		providers.push({
			id: providerId,
			name:
				typeof providerData['name'] === 'string'
					? providerData['name']
					: providerId,
			env: Array.isArray(providerData['env'])
				? (providerData['env'] as string[])
				: undefined,
		});

		for (const [modelId, modelRaw] of modelEntries) {
			if (!modelRaw || typeof modelRaw !== 'object') continue;
			const m = modelRaw as Record<string, unknown>;

			const capabilities = m['capabilities'];
			let parsedCaps:
				| {toolCall?: boolean; vision?: boolean; streaming?: boolean}
				| undefined;
			if (
				capabilities &&
				typeof capabilities === 'object' &&
				!Array.isArray(capabilities)
			) {
				const c = capabilities as Record<string, unknown>;
				parsedCaps = {
					toolCall: Boolean(c['tool_call'] ?? c['toolCall']),
					vision: Boolean(c['vision']),
					streaming: Boolean(c['streaming']),
				};
			}

			models.push({
				id: modelId,
				name: typeof m['name'] === 'string' ? m['name'] : modelId,
				providerId,
				family: typeof m['family'] === 'string' ? m['family'] : undefined,
				context: typeof m['context'] === 'number' ? m['context'] : undefined,
				outputLimit:
					typeof m['output_limit'] === 'number'
						? m['output_limit']
						: typeof m['outputLimit'] === 'number'
						? m['outputLimit']
						: undefined,
				costInput:
					typeof m['cost_input'] === 'number'
						? m['cost_input']
						: typeof m['costInput'] === 'number'
						? m['costInput']
						: undefined,
				costOutput:
					typeof m['cost_output'] === 'number'
						? m['cost_output']
						: typeof m['costOutput'] === 'number'
						? m['costOutput']
						: undefined,
				capabilities: parsedCaps,
			});
		}
	}

	return {providers, models};
}

export async function fetchModels(): Promise<ModelsData | null> {
	try {
		const response = await fetch(MODELS_URL);
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const raw: unknown = await response.json();
		const data = parseApiResponse(raw);
		writeCache(data);
		return data;
	} catch {
		const cached = readCache();
		return cached ?? null;
	}
}

export async function loadModels(): Promise<ModelsData | null> {
	if (isCacheFresh()) {
		const cached = readCache();
		if (cached !== undefined) return cached;
	}

	return fetchModels();
}

export async function refreshModels(): Promise<ModelsData | null> {
	return fetchModels();
}
