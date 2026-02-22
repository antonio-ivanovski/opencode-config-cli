import fs from 'node:fs';
import path from 'node:path';
import {parse as jsoncParse, modify, applyEdits} from 'jsonc-parser';
import type {Modification} from '../types/index.js';

type ReadResult = {
	data: Record<string, unknown>;
	rawText: string;
	format: 'json' | 'jsonc';
};

export function detectIndent(text: string): {
	indent: string;
	type: 'tab' | 'space';
} {
	const lines = text.split('\n');
	for (const line of lines) {
		if (line.startsWith('\t')) {
			return {indent: '\t', type: 'tab'};
		}

		const match = /^( +)/.exec(line);
		if (match?.[1]) {
			return {indent: match[1], type: 'space'};
		}
	}

	return {indent: '\t', type: 'tab'};
}

export function readConfig(filePath: string): ReadResult {
	if (!fs.existsSync(filePath)) {
		return {
			data: {},
			rawText: '',
			format: filePath.endsWith('.jsonc') ? 'jsonc' : 'json',
		};
	}

	const rawText = fs.readFileSync(filePath, 'utf8');
	const fileFormat: 'json' | 'jsonc' = filePath.endsWith('.jsonc')
		? 'jsonc'
		: 'json';
	const data = jsoncParse(rawText) as Record<string, unknown>;

	return {
		data: data ?? {},
		rawText,
		format: fileFormat,
	};
}

function makeTimestamp(): string {
	const now = new Date();
	const pad = (n: number, len = 2) => String(n).padStart(len, '0');
	const yyyy = now.getFullYear();
	const mm = pad(now.getMonth() + 1);
	const dd = pad(now.getDate());
	const hh = pad(now.getHours());
	const min = pad(now.getMinutes());
	const ss = pad(now.getSeconds());
	return `${yyyy}-${mm}-${dd}T${hh}-${min}-${ss}`;
}

export function writeConfig(
	filePath: string,
	originalText: string,
	modifications: Modification[],
): void {
	const {indent} = detectIndent(originalText || '\t');

	// Apply modifications sequentially using jsonc-parser
	let currentText = originalText;
	for (const mod of modifications) {
		const edits = modify(currentText, mod.path, mod.value, {
			formattingOptions: {
				tabSize: indent === '\t' ? 1 : indent.length,
				insertSpaces: indent !== '\t',
			},
		});
		currentText = applyEdits(currentText, edits);
	}

	// Verify result parses correctly
	let finalText = currentText;
	try {
		const parsed = jsoncParse(finalText);
		if (parsed === undefined || parsed === null)
			throw new Error('parse returned null');
	} catch {
		// Fallback: reconstruct from parsed original + apply modifications manually
		const base = (jsoncParse(originalText) as Record<string, unknown>) ?? {};
		for (const mod of modifications) {
			applyModificationToObject(base, mod.path, mod.value);
		}

		finalText = JSON.stringify(base, null, indent);
	}

	// Backup if file already exists
	if (fs.existsSync(filePath)) {
		const ts = makeTimestamp();
		const backupPath = `${filePath}.lazy-opencode-config.backup.${ts}`;
		fs.copyFileSync(filePath, backupPath);
	}

	// Atomic write
	const dir = path.dirname(filePath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {recursive: true});
	}

	const tmpPath = `${filePath}.tmp`;
	fs.writeFileSync(tmpPath, finalText, 'utf8');
	fs.renameSync(tmpPath, filePath);
}

function applyModificationToObject(
	obj: Record<string, unknown>,
	pathParts: string[],
	value: unknown,
): void {
	if (pathParts.length === 0) return;

	if (pathParts.length === 1) {
		const key = pathParts[0]!;
		if (value === undefined) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete obj[key];
		} else {
			obj[key] = value;
		}

		return;
	}

	const key = pathParts[0]!;
	if (typeof obj[key] !== 'object' || obj[key] === null) {
		obj[key] = {};
	}

	applyModificationToObject(
		obj[key] as Record<string, unknown>,
		pathParts.slice(1),
		value,
	);
}

export function createNewConfig(filePath: string): void {
	const dir = path.dirname(filePath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {recursive: true});
	}

	const content = '{\n\t"$schema": "https://opencode.ai/config.json"\n}\n';
	fs.writeFileSync(filePath, content, 'utf8');
}
