import {useEffect, useRef} from 'react';
import {useStdin, useStdout} from 'ink';

export type MouseEvent = {
	x: number;
	y: number;
	button: number;
	kind: 'down' | 'up' | 'scroll';
	direction?: 'up' | 'down';
};

type Handler = (event: MouseEvent) => void;

let activeCount = 0;
let isListening = false;
const handlers = new Set<Handler>();
let cleanupFn: (() => void) | null = null;

const mouseRegex = new RegExp('\\u001b\\[<(\\d+);(\\d+);(\\d+)([mM])', 'g');

function parseMouseEvents(input: string): MouseEvent[] {
	const events: MouseEvent[] = [];
	let match: RegExpExecArray | null;
	while (true) {
		match = mouseRegex.exec(input);
		if (!match) break;
		const btn = Number(match[1] ?? 0);
		const x = Number(match[2] ?? 0);
		const y = Number(match[3] ?? 0);
		const state = match[4] ?? 'M';
		if (btn === 64 || btn === 65) {
			events.push({
				x,
				y,
				button: btn,
				kind: 'scroll',
				direction: btn === 64 ? 'up' : 'down',
			});
			continue;
		}

		events.push({
			x,
			y,
			button: btn,
			kind: state === 'm' ? 'up' : 'down',
		});
	}

	return events;
}

export function useMouse(handler: Handler, options?: {isActive?: boolean}) {
	const {stdin} = useStdin();
	const {stdout} = useStdout();
	const handlerRef = useRef(handler);
	const listenerRef = useRef<Handler | null>(null);
	const isActive = options?.isActive ?? true;

	useEffect(() => {
		handlerRef.current = handler;
	}, [handler]);

	useEffect(() => {
		if (!isActive || !stdin || !stdout) return;
		if (!listenerRef.current) {
			listenerRef.current = event => handlerRef.current(event);
		}
		handlers.add(listenerRef.current);
		activeCount++;

		if (!isListening) {
			isListening = true;
			stdout.write('\x1b[?1000h\x1b[?1006h');
			const onData = (data: Buffer) => {
				const input = data.toString('utf8');
				if (!input.includes('\x1b[<')) return;
				const events = parseMouseEvents(input);
				if (events.length === 0) return;
				for (const event of events) {
					for (const fn of handlers) {
						fn(event);
					}
				}
			};
			stdin.on('data', onData);
			cleanupFn = () => {
				stdout.write('\x1b[?1000l\x1b[?1006l');
				stdin.off('data', onData);
			};
		}

		return () => {
			if (listenerRef.current) handlers.delete(listenerRef.current);
			activeCount = Math.max(0, activeCount - 1);
			if (activeCount === 0 && cleanupFn) {
				cleanupFn();
				cleanupFn = null;
				isListening = false;
			}
		};
	}, [stdin, stdout, isActive]);
}
