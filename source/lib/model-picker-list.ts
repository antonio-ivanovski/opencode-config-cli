import type {Model, ModelsData} from '../types/index.js';

export type FlatItem =
	| {type: 'header'; providerId: string; label: string}
	| {type: 'model'; model: Model; fullId: string};

export type VisibleRow = {
	item: FlatItem;
	flatIndex: number;
};

export function buildFlatList(
	models: ModelsData | null,
	orderedModels: Model[],
	showAll: boolean,
	detectedSet: Set<string>,
): FlatItem[] {
	const providers = new Map<string, string>(
		models?.providers.map(p => [p.id, p.name]) ?? [],
	);
	const grouped = new Map<string, Model[]>();
	for (const m of orderedModels) {
		const fullId = `${m.providerId}/${m.id}`;
		if (!showAll && detectedSet.size > 0 && !detectedSet.has(fullId)) {
			continue;
		}
		const group = grouped.get(m.providerId) ?? [];
		group.push(m);
		grouped.set(m.providerId, group);
	}

	const items: FlatItem[] = [];
	for (const [providerId, providerModels] of grouped) {
		const label = providers.get(providerId) ?? providerId;
		items.push({type: 'header', providerId, label});
		for (const m of providerModels) {
			items.push({
				type: 'model',
				model: m,
				fullId: `${m.providerId}/${m.id}`,
			});
		}
	}

	return items;
}

export function buildVisibleSlice(
	flatList: FlatItem[],
	selectableIndices: number[],
	selectedIndex: number,
	listHeight: number,
	prevScrollOffset: number,
): {
	visibleRows: VisibleRow[];
	scrollOffset: number;
	showScrollUp: boolean;
	showScrollDown: boolean;
} {
	if (flatList.length === 0) {
		return {
			visibleRows: [],
			scrollOffset: 0,
			showScrollUp: false,
			showScrollDown: false,
		};
	}

	const maxOffset = Math.max(0, flatList.length - listHeight);
	const selectedFlatIndex = selectableIndices[selectedIndex] ?? 0;
	let scrollOffset = Math.min(Math.max(0, prevScrollOffset), maxOffset);
	if (selectedFlatIndex < scrollOffset) scrollOffset = selectedFlatIndex;
	if (selectedFlatIndex >= scrollOffset + listHeight) {
		scrollOffset = selectedFlatIndex - listHeight + 1;
	}
	scrollOffset = Math.min(Math.max(0, scrollOffset), maxOffset);

	const headerIndex = selectedFlatIndex - 1;
	if (headerIndex >= 0 && flatList[headerIndex]?.type === 'header') {
		if (headerIndex < scrollOffset) {
			const selectedVisible = selectedFlatIndex < headerIndex + listHeight;
			if (selectedVisible) scrollOffset = headerIndex;
		}
	}

	const visibleRows: VisibleRow[] = flatList
		.slice(scrollOffset, scrollOffset + listHeight)
		.map((item, idx) => ({item, flatIndex: scrollOffset + idx}));
	return {
		visibleRows,
		scrollOffset,
		showScrollUp: scrollOffset > 0,
		showScrollDown: scrollOffset + listHeight < flatList.length,
	};
}
