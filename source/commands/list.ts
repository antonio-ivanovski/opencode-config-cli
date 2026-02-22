import {resolveConfigPath} from '../lib/config-path.js';
import {readConfig} from '../lib/config-io.js';
import {loadModels} from '../lib/models-cache.js';

export async function cmdList(
	resource: string,
	scope: 'global' | 'project' | 'auto',
	options?: {provider?: string},
): Promise<string> {
	switch (resource) {
		case 'providers': {
			const modelsData = await loadModels();
			if (!modelsData || modelsData.providers.length === 0) {
				return 'No providers found (network unavailable?)';
			}

			return modelsData.providers
				.map(p => `${p.id}  ${p.name !== p.id ? `(${p.name})` : ''}`.trim())
				.join('\n');
		}

		case 'models': {
			const modelsData = await loadModels();
			if (!modelsData || modelsData.models.length === 0) {
				return 'No models found (network unavailable?)';
			}

			let models = modelsData.models;
			if (options?.provider) {
				models = models.filter(m => m.providerId === options.provider);
			}

			if (models.length === 0) {
				return `No models found for provider "${options?.provider}"`;
			}

			return models.map(m => `${m.providerId}/${m.id}`).join('\n');
		}

		case 'agents': {
			const {filePath} = resolveConfigPath(scope);
			const {data} = readConfig(filePath);
			const agents = data['agent'];

			if (!agents || typeof agents !== 'object' || Array.isArray(agents)) {
				return 'No agents configured';
			}

			const names = Object.keys(agents as Record<string, unknown>);
			if (names.length === 0) return 'No agents configured';
			return names.join('\n');
		}

		case 'keys': {
			const {filePath} = resolveConfigPath(scope);
			const {data} = readConfig(filePath);
			const keys = Object.keys(data);
			if (keys.length === 0) return 'Config is empty';
			return keys.join('\n');
		}

		default: {
			throw new Error(
				`Unknown resource "${resource}". Valid: providers, models, agents, keys`,
			);
		}
	}
}
