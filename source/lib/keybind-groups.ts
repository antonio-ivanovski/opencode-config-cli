export type KeybindGroup = {
	name: string;
	label: string;
	keys: string[];
};

export const KEYBIND_GROUPS: KeybindGroup[] = [
	{
		name: 'app',
		label: 'App',
		keys: ['leader', 'app_exit', 'terminal_suspend', 'terminal_title_toggle'],
	},
	{
		name: 'session',
		label: 'Session',
		keys: [
			'session_new',
			'session_list',
			'session_timeline',
			'session_fork',
			'session_rename',
			'session_delete',
			'session_export',
			'session_share',
			'session_unshare',
			'session_interrupt',
			'session_compact',
			'session_child_cycle',
			'session_child_cycle_reverse',
			'session_parent',
		],
	},
	{
		name: 'messages',
		label: 'Messages',
		keys: [
			'messages_page_up',
			'messages_page_down',
			'messages_line_up',
			'messages_line_down',
			'messages_half_page_up',
			'messages_half_page_down',
			'messages_first',
			'messages_last',
			'messages_next',
			'messages_previous',
			'messages_last_user',
			'messages_copy',
			'messages_undo',
			'messages_redo',
			'messages_toggle_conceal',
		],
	},
	{
		name: 'model',
		label: 'Model',
		keys: [
			'model_list',
			'model_cycle_recent',
			'model_cycle_recent_reverse',
			'model_cycle_favorite',
			'model_cycle_favorite_reverse',
			'model_provider_list',
			'model_favorite_toggle',
			'variant_cycle',
		],
	},
	{
		name: 'agent',
		label: 'Agent',
		keys: ['agent_list', 'agent_cycle', 'agent_cycle_reverse'],
	},
	{
		name: 'input',
		label: 'Input',
		keys: [
			'input_clear',
			'input_paste',
			'input_submit',
			'input_newline',
			'input_move_up',
			'input_move_down',
			'input_move_left',
			'input_move_right',
			'input_move_line_start',
			'input_move_line_end',
			'input_select_up',
			'input_select_down',
			'input_select_left',
			'input_select_right',
			'input_select_line_start',
			'input_select_line_end',
			'input_line_delete',
			'input_buffer_start',
			'input_buffer_end',
			'input_delete_forward',
			'input_delete_backward',
			'input_delete_word_forward',
			'input_delete_word_backward',
			'input_undo',
			'input_redo',
			'input_word_left',
			'input_word_right',
			'input_visual_line_mode',
		],
	},
	{
		name: 'navigation',
		label: 'Navigation',
		keys: [
			'sidebar_toggle',
			'scrollbar_toggle',
			'username_toggle',
			'editor_open',
			'theme_list',
			'status_view',
			'command_list',
			'tool_details',
			'tips_toggle',
			'display_thinking',
		],
	},
	{
		name: 'history',
		label: 'History',
		keys: ['history_previous', 'history_next'],
	},
	{
		name: 'stash',
		label: 'Stash',
		keys: ['stash_delete'],
	},
];

// Build lookup map for O(1) access
const _keyToGroup = new Map<string, string>();
for (const group of KEYBIND_GROUPS) {
	for (const key of group.keys) {
		_keyToGroup.set(key, group.name);
	}
}

export function getKeybindGroup(key: string): string | undefined {
	return _keyToGroup.get(key);
}
