import {Ajv2020 as Ajv} from 'ajv/dist/2020.js';
import type {SchemaNode} from '../types/index.js';

export type ValidationError = {
	path: string;
	message: string;
	severity: 'error' | 'warning';
};

export type ValidationResult = {
	valid: boolean;
	errors: ValidationError[];
};

export function validateConfig(
	rawSchema: unknown,
	data: Record<string, unknown>,
): ValidationResult {
	const ajv = new Ajv({allErrors: true, strict: false});

	let validate: ReturnType<typeof ajv.compile>;
	try {
		validate = ajv.compile(rawSchema as object);
	} catch {
		return {valid: true, errors: []};
	}

	const valid = validate(data) as boolean;
	const errors: ValidationError[] = [];

	if (!valid && validate.errors) {
		for (const err of validate.errors) {
			const instancePath = err.instancePath ?? '';
			// Convert /foo/bar → foo.bar
			const dotPath = instancePath.replace(/^\//, '').replaceAll('/', '.');
			errors.push({
				path: dotPath,
				message: err.message ?? 'Validation error',
				severity: 'error',
			});
		}
	}

	return {valid: errors.length === 0, errors};
}

export function customValidate(
	data: Record<string, unknown>,
	schema: Record<string, SchemaNode>,
	modelsData?: any,
): ValidationError[] {
	const errors: ValidationError[] = [];

	// Deprecated fields → warning
	for (const [key, node] of Object.entries(schema)) {
		if (node.deprecated && key in data) {
			const hint = node.deprecatedMessage
				? ` Migration: ${node.deprecatedMessage}`
				: '';
			errors.push({
				path: key,
				message: `Field "${key}" is deprecated.${hint}`,
				severity: 'warning',
			});
		}
	}

	// disabled_providers ∩ enabled_providers → warning
	const disabled = data['disabled_providers'];
	const enabled = data['enabled_providers'];
	if (Array.isArray(disabled) && Array.isArray(enabled)) {
		const overlap = (disabled as string[]).filter(p =>
			(enabled as string[]).includes(p),
		);
		if (overlap.length > 0) {
			errors.push({
				path: 'disabled_providers',
				message: `Providers appear in both disabled_providers and enabled_providers: ${overlap.join(
					', ',
				)}`,
				severity: 'warning',
			});
		}
	}

	// server.port < 1024 → warning
	const server = data['server'];
	if (server && typeof server === 'object' && !Array.isArray(server)) {
		const port = (server as Record<string, unknown>)['port'];
		if (typeof port === 'number' && port < 1024) {
			errors.push({
				path: 'server.port',
				message: `Port ${port} is < 1024 and requires root privileges`,
				severity: 'warning',
			});
		}
	}

	// Unknown model provider warning
	if (modelsData) {
		const knownProviders = new Set<string>(
			Object.keys(modelsData?.providers ?? {}),
		);

		const modelPaths: Array<{path: string; value: unknown}> = [];

		if ('model' in data) modelPaths.push({path: 'model', value: data['model']});
		if ('small_model' in data)
			modelPaths.push({path: 'small_model', value: data['small_model']});

		const agents = data['agent'];
		if (agents && typeof agents === 'object' && !Array.isArray(agents)) {
			for (const [agentName, agentConf] of Object.entries(
				agents as Record<string, unknown>,
			)) {
				if (agentConf && typeof agentConf === 'object') {
					const agentModel = (agentConf as Record<string, unknown>)['model'];
					if (agentModel !== undefined) {
						modelPaths.push({
							path: `agent.${agentName}.model`,
							value: agentModel,
						});
					}
				}
			}
		}

		for (const {path, value} of modelPaths) {
			if (typeof value === 'string') {
				const provider = value.split('/')[0];
				if (
					provider &&
					knownProviders.size > 0 &&
					!knownProviders.has(provider)
				) {
					errors.push({
						path,
						message: `Unknown model provider "${provider}" in "${value}"`,
						severity: 'warning',
					});
				}
			}
		}
	}

	return errors;
}

export function getErrorsForPath(
	errors: ValidationError[],
	path: string,
): ValidationError[] {
	return errors.filter(
		e =>
			e.path === path ||
			e.path.startsWith(`${path}.`) ||
			e.path.startsWith(`${path}[`),
	);
}
