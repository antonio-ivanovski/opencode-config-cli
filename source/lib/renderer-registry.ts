import type {RendererComponent, SchemaNode} from '../types/index.js';

export const typeRenderers: Record<string, RendererComponent> = {};

export const pathOverrides: Array<{
	pattern: string;
	component: RendererComponent;
}> = [];

/**
 * Glob matching: split by '.', '*' matches exactly one segment.
 * Example: 'agent.*.model' matches 'agent.build.model' but NOT 'agent.build.steps.model'
 */
export function matchPattern(pattern: string, filePath: string): boolean {
	const patternParts = pattern.split('.');
	const pathParts = filePath.split('.');

	if (patternParts.length !== pathParts.length) return false;

	for (let i = 0; i < patternParts.length; i++) {
		if (patternParts[i] === '*') continue;
		if (patternParts[i] !== pathParts[i]) return false;
	}

	return true;
}

export function registerTypeRenderer(
	type: string,
	component: RendererComponent,
): void {
	typeRenderers[type] = component;
}

export function registerPathOverride(
	pattern: string,
	component: RendererComponent,
): void {
	pathOverrides.push({pattern, component});
}

export function getRenderer(
	nodePath: string,
	schemaNode: SchemaNode,
): RendererComponent | undefined {
	// Path overrides take priority
	for (const override of pathOverrides) {
		if (matchPattern(override.pattern, nodePath)) {
			return override.component;
		}
	}

	// Fall back to type renderer
	const byType = typeRenderers[schemaNode.type];
	if (byType) return byType;

	return undefined;
}
