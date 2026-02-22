import {resolveConfigPath} from '../lib/config-path.js';
import {readConfig} from '../lib/config-io.js';
import {fetchSchema, parseSchema} from '../lib/schema.js';
import {validateConfig, customValidate} from '../lib/validation.js';

export async function cmdValidate(
	scope: 'global' | 'project' | 'auto',
): Promise<string> {
	const {filePath} = resolveConfigPath(scope);
	const {data} = readConfig(filePath);

	const rawSchema = await fetchSchema();
	const parsedSchema = parseSchema(rawSchema);

	const schemaResult = validateConfig(rawSchema, data);
	const customErrors = customValidate(data, parsedSchema);

	const allErrors = [...schemaResult.errors, ...customErrors];

	const keyCount = Object.keys(data).length;

	if (allErrors.length === 0) {
		return `✓ Config is valid (${keyCount} key${
			keyCount !== 1 ? 's' : ''
		} set)`;
	}

	const lines = [
		`✗ ${allErrors.length} issue${allErrors.length !== 1 ? 's' : ''} found:`,
	];
	for (const err of allErrors) {
		const prefix = err.severity === 'warning' ? 'warn' : 'error';
		const pathStr = err.path ? `${err.path}: ` : '';
		lines.push(`  [${prefix}] ${pathStr}${err.message}`);
	}

	return lines.join('\n');
}
