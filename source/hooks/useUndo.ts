import {useState, useCallback} from 'react';
import type {Modification} from '../types/index.js';

type UndoEntry = {
	modification: Modification;
	inverse: Modification;
};

export function useUndo() {
	const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
	const [redoStack, setRedoStack] = useState<UndoEntry[]>([]);

	// Record an edit that can be undone
	const record = useCallback((mod: Modification, previousValue: unknown) => {
		const entry: UndoEntry = {
			modification: mod,
			inverse: {path: mod.path, value: previousValue},
		};
		setUndoStack(prev => [...prev, entry]);
		setRedoStack([]); // Clear redo on new edit
	}, []);

	// Undo last edit — returns the inverse modification to apply
	const undo = useCallback((): Modification | null => {
		let result: Modification | null = null;
		setUndoStack(prev => {
			if (prev.length === 0) return prev;
			const entry = prev[prev.length - 1]!;
			result = entry.inverse;
			setRedoStack(redo => [...redo, entry]);
			return prev.slice(0, -1);
		});
		return result;
	}, []);

	// Redo — returns the modification to re-apply
	const redo = useCallback((): Modification | null => {
		let result: Modification | null = null;
		setRedoStack(prev => {
			if (prev.length === 0) return prev;
			const entry = prev[prev.length - 1]!;
			result = entry.modification;
			setUndoStack(stack => [...stack, entry]);
			return prev.slice(0, -1);
		});
		return result;
	}, []);

	// Clear history (e.g., after save)
	const clear = useCallback(() => {
		setUndoStack([]);
		setRedoStack([]);
	}, []);

	return {
		undo,
		redo,
		record,
		clear,
		canUndo: undoStack.length > 0,
		canRedo: redoStack.length > 0,
	};
}
