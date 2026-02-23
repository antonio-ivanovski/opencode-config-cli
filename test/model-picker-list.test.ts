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
	const {visibleSlice, scrollOffset} = buildVisibleSlice(
		flatList,
		selectable,
		selectedIndex,
		4,
		0,
	);

	const first = visibleSlice[0];
	t.is(first.type, 'header');
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
	const {visibleSlice} = buildVisibleSlice(
		flatList,
		selectable,
		selectedIndex,
		3,
		0,
	);
	const index = visibleSlice.findIndex(item => item.type === 'header');
	if (index >= 0 && index < visibleSlice.length - 1) {
		t.not(visibleSlice[index + 1]?.type, 'header');
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
	const {visibleSlice} = buildVisibleSlice(
		flatList,
		selectable,
		selectedIndex,
		4,
		0,
	);
	const openAiHeader = visibleSlice.find(item =>
		item.type === 'header' ? item.label === 'OpenAI' : false,
	);
	t.truthy(openAiHeader);
});

test('buildVisibleSlice uses previous offset to prevent header flicker', t => {
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

	const firstHeader = first.visibleSlice.find(i => i.type === 'header');
	const secondHeader = second.visibleSlice.find(i => i.type === 'header');
	if (firstHeader && secondHeader) {
		t.is(firstHeader.type, 'header');
		t.is(secondHeader.type, 'header');
	}
});
