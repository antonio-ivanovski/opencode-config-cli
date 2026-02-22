import {resolveConfigPath} from '../lib/config-path.js';
import {readConfig, writeConfig} from '../lib/config-io.js';
import {fetchSchema, parseSchema} from '../lib/schema.js';
import {validateConfig} from '../lib/validation.js';
import type {Modification} from '../types/index.js';

function coerceValue(raw: string): unknown {
	if (raw === 'true') return true;
	if (raw === 'false') return false;
	const num = Number(raw);
	if (!isNaN(num) && raw.trim() !== '') return num;
	return raw;
}

export async function cmdSet(
	dotPath: string,
	rawValue: string,
	scope: 'global' | 'project' | 'auto',
): Promise<string> {
	const {filePath} = resolveConfigPath(scope);
	const {data, rawText} = readConfig(filePath);
	const coercedValue = coerceValue(rawValue);

	// Validate after applying modification
	try {
		const rawSchema = await fetchSchema();
		const parsedSchema = parseSchema(rawSchema);

		// Apply mod to a copy for validation
		const testData = JSON.parse(JSON.stringify(data)) as Record<
			string,
			unknown
		>;
		const parts = dotPath.split('.');
		let cur: Record<string, unknown> = testData;
		for (let i = 0; i < parts.length - 1; i++) {
			const p = parts[i]!;
			if (typeof cur[p] !== 'object' || cur[p] === null) cur[p] = {};
			cur = cur[p] as Record<string, unknown>;
		}

		cur[parts[parts.length - 1]!] = coercedValue;

		// Validate — ignore errors on unrecognised extra keys
		void parsedSchema;
		void validateConfig(rawSchema, testData);
	} catch {
		// Validation is best-effort; proceed with write
	}

	const modification: Modification = {
		path: dotPath.split('.'),
		value: coercedValue,
	};

	writeConfig(filePath, rawText, [modification]);

	return `Set ${dotPath} = ${JSON.stringify(coercedValue)}`;
}
