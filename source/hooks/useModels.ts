import {useState, useEffect, useCallback} from 'react';
import {loadModels, refreshModels as doRefresh} from '../lib/models-cache.js';
import type {ModelsData} from '../types/index.js';

export function useModels() {
	const [data, setData] = useState<ModelsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadModels()
			.then(result => {
				setData(result);
				setLoading(false);
			})
			.catch((err: unknown) => {
				setError(String(err));
				setLoading(false);
			});
	}, []);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await doRefresh();
			setData(result);
		} catch (err) {
			setError(String(err));
		} finally {
			setLoading(false);
		}
	}, []);

	return {data, loading, error, refresh};
}
