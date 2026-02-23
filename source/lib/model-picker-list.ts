import type {Model, ModelsData} from '../types/index.js';

export type FlatItem =
	| {type: 'header'; providerId: string; label: string}
	| {type: 'model'; model: Model; fullId: string};

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
	visibleSlice: FlatItem[];
	scrollOffset: number;
	showScrollUp: boolean;
	showScrollDown: boolean;
} {
	if (flatList.length === 0) {
		return {
			visibleSlice: [],
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

	let headerIndex = -1;
	for (let i = selectedFlatIndex; i >= 0; i--) {
		if (flatList[i]?.type === 'header') {
			headerIndex = i;
			break;
		}
	}
	if (headerIndex >= 0) {
		const distance = selectedFlatIndex - headerIndex;
		if (headerIndex < scrollOffset && distance < listHeight) {
			scrollOffset = headerIndex;
		}
	}

	let adjusted = true;
	while (adjusted) {
		adjusted = false;
		const windowEnd = Math.min(
			flatList.length - 1,
			scrollOffset + listHeight - 1,
		);
		for (let i = scrollOffset; i <= windowEnd; i++) {
			const item = flatList[i];
			if (item?.type !== 'model') continue;
			const prev = flatList[i - 1];
			if (prev?.type !== 'header') continue;
			if (i - 1 < scrollOffset) {
				const nextOffset = i - 1;
				const selectedVisible =
					selectedFlatIndex >= nextOffset &&
					selectedFlatIndex < nextOffset + listHeight;
				if (selectedVisible) {
					scrollOffset = nextOffset;
					adjusted = true;
				}
			}
		}
	}

	const visibleSlice = flatList.slice(scrollOffset, scrollOffset + listHeight);
	return {
		visibleSlice,
		scrollOffset,
		showScrollUp: scrollOffset > 0,
		showScrollDown: scrollOffset + listHeight < flatList.length,
	};
}
