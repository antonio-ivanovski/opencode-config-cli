import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from 'react';
import type {
	ConfigScope,
	Modification,
	TreeNode,
	SchemaNode,
} from '../types/index.js';
import type {ValidationError} from '../lib/validation.js';
import {resolveConfigPath} from '../lib/config-path.js';
import {readConfig, writeConfig, createNewConfig} from '../lib/config-io.js';
import {fetchSchema, parseSchema} from '../lib/schema.js';
import {buildTree} from '../lib/tree-model.js';
import {validateConfig, customValidate} from '../lib/validation.js';

type ScopeState = {
	data: Record<string, unknown>;
	rawText: string;
	filePath: string;
	exists: boolean;
	format: 'json' | 'jsonc';
	modifications: Modification[];
};

type ConfigContextValue = {
	activeScope: ConfigScope;
	switchScope: (scope: ConfigScope) => void;
	data: Record<string, unknown>;
	filePath: string;
	isDirty: boolean;
	editValue: (path: string[], value: unknown) => void;
	deleteValue: (path: string[]) => void;
	getOriginalValue: (path: string[]) => unknown;
	save: () => Promise<void>;
	schema: Record<string, SchemaNode>;
	rawSchema: unknown;
	tree: TreeNode[];
	validationErrors: ValidationError[];
	loading: boolean;
	globalFilePath: string;
	projectFilePath: string;
	globalExists: boolean;
	projectExists: boolean;
	globalData: Record<string, unknown>;
};

// Helper: apply modifications to a data object (immutably)
function applyModifications(
	data: Record<string, unknown>,
	mods: Modification[],
): Record<string, unknown> {
	let result = {...data};
	for (const mod of mods) {
		if (mod.value === undefined) {
			result = deepDelete(result, mod.path);
		} else {
			result = deepSet(result, mod.path, mod.value);
		}
	}

	return result;
}

// Deep set helper (immutable)
function deepSet(
	obj: Record<string, unknown>,
	path: string[],
	value: unknown,
): Record<string, unknown> {
	if (path.length === 0) return obj;
	const [head, ...rest] = path;
	if (rest.length === 0) return {...obj, [head!]: value};
	const child = obj[head!];
	const childObj =
		child && typeof child === 'object' && !Array.isArray(child)
			? {...(child as Record<string, unknown>)}
			: {};
	return {...obj, [head!]: deepSet(childObj, rest, value)};
}

// Deep delete helper (immutable)
function deepDelete(
	obj: Record<string, unknown>,
	path: string[],
): Record<string, unknown> {
	if (path.length === 0) return obj;
	const [head, ...rest] = path;
	if (rest.length === 0) {
		const result = {...obj};
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete result[head!];
		return result;
	}

	const child = obj[head!];
	if (!child || typeof child !== 'object') return obj;
	return {
		...obj,
		[head!]: deepDelete({...(child as Record<string, unknown>)}, rest),
	};
}

const emptyScopeState = (
	filePath: string,
	format: 'json' | 'jsonc',
): ScopeState => ({
	data: {},
	rawText: '',
	filePath,
	exists: false,
	format,
	modifications: [],
});

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({
	scope: initialScope,
	children,
}: {
	scope: 'global' | 'project' | 'auto';
	children: React.ReactNode;
}) {
	const [loading, setLoading] = useState(true);
	const [activeScope, setActiveScope] = useState<ConfigScope>('global');

	const globalPath = useMemo(() => resolveConfigPath('global').filePath, []);
	const projectPath = useMemo(() => resolveConfigPath('project').filePath, []);

	const [globalState, setGlobalState] = useState<ScopeState>(() =>
		emptyScopeState(globalPath, 'jsonc'),
	);
	const [projectState, setProjectState] = useState<ScopeState>(() =>
		emptyScopeState(projectPath, 'jsonc'),
	);
	const [schema, setSchema] = useState<Record<string, SchemaNode>>({});
	const [rawSchema, setRawSchema] = useState<unknown>(null);

	useEffect(() => {
		async function init() {
			// 1. Determine initial active scope
			const resolved = resolveConfigPath(initialScope);
			setActiveScope(resolved.scope);

			// 2. Load both configs
			const globalConfig = readConfig(globalPath);
			const projectConfig = readConfig(projectPath);

			setGlobalState({
				data: globalConfig.data,
				rawText: globalConfig.rawText,
				filePath: globalPath,
				exists: globalConfig.rawText !== '',
				format: globalConfig.format,
				modifications: [],
			});
			setProjectState({
				data: projectConfig.data,
				rawText: projectConfig.rawText,
				filePath: projectPath,
				exists: projectConfig.rawText !== '',
				format: projectConfig.format,
				modifications: [],
			});

			// 3. Load schema
			try {
				const raw = await fetchSchema();
				setRawSchema(raw);
				setSchema(parseSchema(raw));
			} catch {
				// Schema load failure — use empty schema
			}

			setLoading(false);
		}

		void init();
	}, [initialScope, globalPath, projectPath]);

	// Current scope state
	const currentState = activeScope === 'global' ? globalState : projectState;

	// Effective data = original data + modifications applied
	const effectiveData = useMemo(
		() => applyModifications(currentState.data, currentState.modifications),
		[currentState.data, currentState.modifications],
	);

	// Effective global data (always available, regardless of active scope)
	const globalEffectiveData = useMemo(
		() => applyModifications(globalState.data, globalState.modifications),
		[globalState.data, globalState.modifications],
	);

	// Build tree
	const tree = useMemo(() => {
		const inherited =
			activeScope === 'project' ? globalEffectiveData : undefined;
		const baseData = currentState.data;
		return buildTree(schema, effectiveData, inherited, baseData);
	}, [
		schema,
		effectiveData,
		activeScope,
		globalEffectiveData,
		currentState.data,
	]);

	// Validation
	const validationErrors = useMemo(() => {
		if (!rawSchema) return [];
		const schemaErrors = validateConfig(rawSchema, effectiveData);
		const customErrors = customValidate(effectiveData, schema);
		return [...schemaErrors.errors, ...customErrors];
	}, [rawSchema, effectiveData, schema]);

	// Edit / delete / save
	const editValue = useCallback(
		(path: string[], value: unknown) => {
			if (activeScope === 'global') {
				setGlobalState(prev => ({
					...prev,
					modifications: [...prev.modifications, {path, value}],
				}));
			} else {
				setProjectState(prev => ({
					...prev,
					modifications: [...prev.modifications, {path, value}],
				}));
			}
		},
		[activeScope],
	);

	const deleteValue = useCallback(
		(path: string[]) => {
			if (activeScope === 'global') {
				setGlobalState(prev => ({
					...prev,
					modifications: [...prev.modifications, {path, value: undefined}],
				}));
			} else {
				setProjectState(prev => ({
					...prev,
					modifications: [...prev.modifications, {path, value: undefined}],
				}));
			}
		},
		[activeScope],
	);

	const getOriginalValue = useCallback(
		(path: string[]) => {
			let current: unknown = currentState.data;
			for (const part of path) {
				if (!current || typeof current !== 'object') return undefined;
				const obj = current as Record<string, unknown>;
				if (!(part in obj)) return undefined;
				current = obj[part];
			}
			return current;
		},
		[currentState.data],
	);

	const save = useCallback(async () => {
		const state = activeScope === 'global' ? globalState : projectState;
		const setState =
			activeScope === 'global' ? setGlobalState : setProjectState;

		if (state.modifications.length === 0) return;

		if (!state.exists) {
			createNewConfig(state.filePath);
		}

		const rawText = state.exists
			? state.rawText
			: '{\n\t"$schema": "https://opencode.ai/config.json"\n}\n';
		writeConfig(state.filePath, rawText, state.modifications);

		// Re-read the file to get canonical text
		const reloaded = readConfig(state.filePath);
		setState({
			data: reloaded.data,
			rawText: reloaded.rawText,
			filePath: state.filePath,
			exists: true,
			format: reloaded.format,
			modifications: [],
		});
	}, [activeScope, globalState, projectState]);

	const isDirty = currentState.modifications.length > 0;

	const switchScope = useCallback((scope: ConfigScope) => {
		setActiveScope(scope);
	}, []);

	const contextValue: ConfigContextValue = {
		activeScope,
		switchScope,
		data: effectiveData,
		filePath: currentState.filePath,
		isDirty,
		editValue,
		deleteValue,
		getOriginalValue,
		save,
		schema,
		rawSchema,
		tree,
		validationErrors,
		loading,
		globalFilePath: globalState.filePath,
		projectFilePath: projectState.filePath,
		globalExists: globalState.exists || globalState.modifications.length > 0,
		projectExists: projectState.exists || projectState.modifications.length > 0,
		globalData: globalEffectiveData,
	};

	return React.createElement(
		ConfigContext.Provider,
		{value: contextValue},
		children,
	);
}

export function useConfig(): ConfigContextValue {
	const ctx = useContext(ConfigContext);
	if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
	return ctx;
}
