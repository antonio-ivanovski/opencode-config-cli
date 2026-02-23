import test from 'ava';
import {
	buildFlatList,
	buildVisibleSlice,
} from '../source/lib/model-picker-list.js';
import type {Model, ModelsData} from '../source/types/index.js';

function makeModelsData(): ModelsData {
	return {
		providers: [
			{id: 'opencode', name: 'OpenCode Zen'},
			{id: 'openai', name: 'OpenAI'},
		],
		models: [
			{
				providerId: 'opencode',
				id: 'glm-5-free',
				name: 'GLM-5 Free',
				context: 128000,
				costInput: 0,
				costOutput: 0,
			},
			{
				providerId: 'opencode',
				id: 'gpt-5-nano',
				name: 'GPT-5 Nano',
				context: 128000,
				costInput: 0.1,
				costOutput: 0.2,
			},
			{
				providerId: 'openai',
				id: 'gpt-5.3-codex-spark',
				name: 'GPT-5.3 Codex Spark',
				context: 128000,
				costInput: 1,
				costOutput: 2,
			},
		],
	};
}

function makeFullModelsData(): ModelsData {
	return {
		providers: [
			{id: 'github-copilot', name: 'GitHub Copilot'},
			{id: 'kimi-for-coding', name: 'Kimi For Coding'},
			{id: 'opencode', name: 'OpenCode Zen'},
			{id: 'openai', name: 'OpenAI'},
			{id: 'anthropic', name: 'Anthropic'},
		],
		models: [
			{
				providerId: 'github-copilot',
				id: 'gpt-5.2-codex',
				name: 'gpt-5.2-codex',
			},
			{
				providerId: 'github-copilot',
				id: 'grok-code-fast-1',
				name: 'grok-code-fast-1',
			},
			{
				providerId: 'github-copilot',
				id: 'gpt-5.1-codex',
				name: 'gpt-5.1-codex',
			},
			{
				providerId: 'github-copilot',
				id: 'gemini-3-pro-preview',
				name: 'gemini-3-pro-preview',
			},
			{
				providerId: 'github-copilot',
				id: 'gpt-5.1-codex-mini',
				name: 'gpt-5.1-codex-mini',
			},
			{providerId: 'github-copilot', id: 'gpt-5.1', name: 'gpt-5.1'},
			{providerId: 'github-copilot', id: 'gpt-4.1', name: 'gpt-4.1'},
			{
				providerId: 'github-copilot',
				id: 'claude-opus-41',
				name: 'claude-opus-41',
			},
			{providerId: 'github-copilot', id: 'gpt-5-mini', name: 'gpt-5-mini'},
			{
				providerId: 'github-copilot',
				id: 'gemini-2.5-pro',
				name: 'gemini-2.5-pro',
			},
			{
				providerId: 'github-copilot',
				id: 'gpt-5.1-codex-max',
				name: 'gpt-5.1-codex-max',
			},
			{
				providerId: 'github-copilot',
				id: 'gemini-3.1-pro-preview',
				name: 'gemini-3.1-pro-preview',
			},
			{providerId: 'github-copilot', id: 'gpt-5', name: 'gpt-5'},
			{
				providerId: 'github-copilot',
				id: 'claude-opus-4.5',
				name: 'claude-opus-4.5',
			},
			{providerId: 'github-copilot', id: 'gpt-5.2', name: 'gpt-5.2'},
			{
				providerId: 'github-copilot',
				id: 'claude-opus-4.6',
				name: 'claude-opus-4.6',
			},
			{
				providerId: 'kimi-for-coding',
				id: 'kimi-k2-thinking',
				name: 'kimi-k2-thinking',
			},
			{
				providerId: 'opencode',
				id: 'trinity-large-preview-free',
				name: 'trinity-large-preview-free',
			},
			{providerId: 'opencode', id: 'gpt-5-nano', name: 'gpt-5-nano'},
			{providerId: 'opencode', id: 'big-pickle', name: 'big-pickle'},
			{
				providerId: 'opencode',
				id: 'minimax-m2.5-free',
				name: 'minimax-m2.5-free',
			},
			{
				providerId: 'openai',
				id: 'gpt-5.3-codex-spark',
				name: 'gpt-5.3-codex-spark',
			},
			{providerId: 'openai', id: 'gpt-5.2-codex', name: 'gpt-5.2-codex'},
			{providerId: 'openai', id: 'gpt-5.1-codex', name: 'gpt-5.1-codex'},
			{
				providerId: 'openai',
				id: 'codex-mini-latest',
				name: 'codex-mini-latest',
			},
			{providerId: 'openai', id: 'gpt-5-codex', name: 'gpt-5-codex'},
			{providerId: 'openai', id: 'gpt-5.3-codex', name: 'gpt-5.3-codex'},
			{providerId: 'openai', id: 'gpt-5.2', name: 'gpt-5.2'},
			{providerId: 'anthropic', id: 'claude-opus-4-0', name: 'claude-opus-4-0'},
			{providerId: 'anthropic', id: 'claude-opus-4-1', name: 'claude-opus-4-1'},
			{
				providerId: 'anthropic',
				id: 'claude-opus-4-5-20251101',
				name: 'claude-opus-4-5-20251101',
			},
			{
				providerId: 'anthropic',
				id: 'claude-sonnet-4-5',
				name: 'claude-sonnet-4-5',
			},
			{
				providerId: 'anthropic',
				id: 'claude-sonnet-4-20250514',
				name: 'claude-sonnet-4-20250514',
			},
			{
				providerId: 'anthropic',
				id: 'claude-opus-4-20250514',
				name: 'claude-opus-4-20250514',
			},
			{
				providerId: 'anthropic',
				id: 'claude-3-5-haiku-20241022',
				name: 'claude-3-5-haiku-20241022',
			},
			{
				providerId: 'anthropic',
				id: 'claude-3-7-sonnet-2025021',
				name: 'claude-3-7-sonnet-2025021',
			},
			{
				providerId: 'anthropic',
				id: 'claude-3-7-sonnet-latest',
				name: 'claude-3-7-sonnet-latest',
			},
			{
				providerId: 'anthropic',
				id: 'claude-sonnet-4-0',
				name: 'claude-sonnet-4-0',
			},
			{
				providerId: 'anthropic',
				id: 'claude-3-sonnet-20240229',
				name: 'claude-3-sonnet-20240229',
			},
		],
	};
}

function buildSelectable(flatList: ReturnType<typeof buildFlatList>): number[] {
	return flatList
		.map((item, i) => (item.type === 'model' ? i : -1))
		.filter(i => i >= 0);
}

test('buildFlatList keeps provider header before its models', t => {
	const models = makeModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const labels = flatList.map(item =>
		item.type === 'header' ? `H:${item.label}` : `M:${item.fullId}`,
	);

	const openCodeIndex = labels.indexOf('H:OpenCode Zen');
	const openAiIndex = labels.indexOf('H:OpenAI');
	const firstOpenCodeModel = labels.indexOf('M:opencode/glm-5-free');
	const firstOpenAiModel = labels.indexOf('M:openai/gpt-5.3-codex-spark');

	t.true(openCodeIndex >= 0);
	t.true(openAiIndex >= 0);
	t.true(openCodeIndex < firstOpenCodeModel);
	t.true(openAiIndex < firstOpenAiModel);
});

test('buildVisibleSlice keeps header visible when next items belong to it', t => {
	const models = makeModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const selectable = buildSelectable(flatList);

	const selectedIndex = 1; // second model in first provider
	const {visibleRows, scrollOffset} = buildVisibleSlice(
		flatList,
		selectable,
		selectedIndex,
		4,
		0,
	);

	const first = visibleRows[0]?.item;
	t.is(first?.type, 'header');
	t.true(scrollOffset >= 0);
});

test('buildVisibleSlice does not split header from immediately following model', t => {
	const models = makeModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const selectable = buildSelectable(flatList);

	const selectedIndex = 2; // model under OpenAI
	const {visibleRows} = buildVisibleSlice(
		flatList,
		selectable,
		selectedIndex,
		3,
		0,
	);
	const index = visibleRows.findIndex(row => row.item.type === 'header');
	if (index >= 0 && index < visibleRows.length - 1) {
		t.not(visibleRows[index + 1]?.item.type, 'header');
	}
});

test('buildVisibleSlice includes header for last-row model when possible', t => {
	const models = makeModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const selectable = buildSelectable(flatList);

	const selectedIndex = 2; // model under OpenAI
	const {visibleRows} = buildVisibleSlice(
		flatList,
		selectable,
		selectedIndex,
		4,
		0,
	);
	const openAiHeader = visibleRows.find(row =>
		row.item.type === 'header' ? row.item.label === 'OpenAI' : false,
	);
	t.truthy(openAiHeader);
});

test('buildVisibleSlice keeps first row stable when slice starts on model', t => {
	const models = makeModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const selectable = buildSelectable(flatList);

	const {visibleRows} = buildVisibleSlice(flatList, selectable, 1, 3, 1);
	t.is(visibleRows[0]?.item.type, 'model');
});

test('buildVisibleSlice uses previous offset to keep selection visible', t => {
	const models = makeModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const selectable = buildSelectable(flatList);

	const first = buildVisibleSlice(flatList, selectable, 1, 4, 0);
	const second = buildVisibleSlice(
		flatList,
		selectable,
		2,
		4,
		first.scrollOffset,
	);

	const selectedFlat = selectable[2] ?? 0;
	const visibleFlat = second.visibleRows.map(r => r.flatIndex);
	t.true(visibleFlat.includes(selectedFlat));
});

test('buildVisibleSlice preserves selection row', t => {
	const models = makeModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const selectable = buildSelectable(flatList);
	const selectedIndex = 1;
	const selectedFlat = selectable[selectedIndex] ?? 0;

	const {visibleRows} = buildVisibleSlice(
		flatList,
		selectable,
		selectedIndex,
		4,
		1,
	);
	const hasSelected = visibleRows.some(r => r.flatIndex === selectedFlat);
	t.true(hasSelected);
});

test('full list scroll keeps selected model visible without header mixing', t => {
	const models = makeFullModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const selectable = buildSelectable(flatList);
	const listHeight = 16;

	let scrollOffset = 0;
	const selectedIndices = selectable.slice(0, 24);
	for (const selectedIndex of selectedIndices) {
		const selectedFlat = selectable[selectedIndex] ?? 0;
		const res = buildVisibleSlice(
			flatList,
			selectable,
			selectedIndex,
			listHeight,
			scrollOffset,
		);
		scrollOffset = res.scrollOffset;

		const visibleFlat = res.visibleRows.map(r => r.flatIndex);
		t.true(visibleFlat.includes(selectedFlat));

		const headerIndexes = res.visibleRows
			.map((r, i) => (r.item.type === 'header' ? i : -1))
			.filter(i => i >= 0);
		for (const idx of headerIndexes) {
			if (idx > 0) {
				t.not(res.visibleRows[idx - 1]?.item.type, 'header');
			}
			if (idx < res.visibleRows.length - 1) {
				t.not(res.visibleRows[idx + 1]?.item.type, 'header');
			}
		}
	}
});

test('full list scroll keeps provider header above its models', t => {
	const models = makeFullModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const selectable = buildSelectable(flatList);
	const listHeight = 16;

	let scrollOffset = 0;
	for (
		let selectedIndex = 0;
		selectedIndex < selectable.length;
		selectedIndex++
	) {
		const res = buildVisibleSlice(
			flatList,
			selectable,
			selectedIndex,
			listHeight,
			scrollOffset,
		);
		scrollOffset = res.scrollOffset;

		for (let i = 0; i < res.visibleRows.length; i++) {
			const row = res.visibleRows[i];
			if (row.item.type !== 'model') continue;
			const prev = res.visibleRows[i - 1];
			if (prev?.item.type === 'header') continue;
			const headerIndex = res.visibleRows
				.slice(0, i)
				.reduce((last, r, idx) => (r.item.type === 'header' ? idx : last), -1);
			if (headerIndex >= 0) {
				const header = res.visibleRows[headerIndex]?.item;
				if (header?.type === 'header') {
					t.is(header.providerId, row.item.model.providerId);
				}
			}
		}
	}
});

test('full list scroll matches provided scenario transitions', t => {
	const models = makeFullModelsData();
	const detected = new Set<string>();
	const flatList = buildFlatList(
		models,
		models.models as Model[],
		true,
		detected,
	);
	const selectable = buildSelectable(flatList);
	const listHeight = 16;

	const kimiIndex = selectable.findIndex(idx =>
		flatList[idx]?.type === 'model'
			? flatList[idx]?.fullId === 'kimi-for-coding/kimi-k2-thinking'
			: false,
	);
	t.true(kimiIndex >= 0);

	const first = buildVisibleSlice(
		flatList,
		selectable,
		kimiIndex,
		listHeight,
		0,
	);
	const firstRows = first.visibleRows.map(r =>
		r.item.type === 'header' ? `H:${r.item.label}` : `M:${r.item.fullId}`,
	);
	t.true(firstRows.includes('H:Kimi For Coding'));
	t.true(firstRows.includes('M:kimi-for-coding/kimi-k2-thinking'));

	const second = buildVisibleSlice(
		flatList,
		selectable,
		kimiIndex + 1,
		listHeight,
		first.scrollOffset,
	);
	const secondRows = second.visibleRows.map(r =>
		r.item.type === 'header' ? `H:${r.item.label}` : `M:${r.item.fullId}`,
	);
	t.true(secondRows.includes('H:OpenCode Zen'));
	const openCodeHeaderIndex = secondRows.indexOf('H:OpenCode Zen');
	const firstOpenCodeModelIndex = secondRows.indexOf(
		'M:opencode/trinity-large-preview-free',
	);
	t.true(openCodeHeaderIndex >= 0);
	t.true(firstOpenCodeModelIndex > openCodeHeaderIndex);
});
