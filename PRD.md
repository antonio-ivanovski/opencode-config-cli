# lazy-opencode-config - Product Requirements Document

## 1. Overview

A terminal-based configuration manager for [OpenCode](https://opencode.ai). Provides a full-screen interactive TUI with a tree view for browsing and editing `opencode.json(c)` config files, plus a non-interactive dot-path CLI for scripting.

**Stack:** TypeScript, Ink (React for CLI), Meow  
**Binary:** `lazy-opencode-config`  
**Config schema:** https://opencode.ai/config.json

### Design Principles

- **Simplicity first** — pragmatic approaches, no over-engineering. Pure React state (useState/useReducer/useContext), native `fetch`, small composable files.
- **Composable rendering** — each config value type has its own renderer component. Renderers are selected by schema type, but can be overridden per config path (e.g., `model` fields get a ModelPicker instead of plain TextInput).
- **Minimal-diff writes** — when saving, preserve the original file's spacing, quoting style, key ordering, and comments. Only mutate what changed. Use `jsonc-parser`'s edit operations, not serialize-from-scratch.
- **Small files, composition over inheritance** — no god components. Each file does one thing.

---

## 2. Goals

1. Make OpenCode config discoverable - users shouldn't need to read docs to configure it.
2. Provide predefined options for every field where possible, even freeform strings.
3. Live validation against the JSON schema as users edit.
4. Support both global (`~/.config/opencode/opencode.json`) and per-project (`./opencode.json`) configs.
5. Fetch model/provider data from `models.dev` for rich autocomplete.

## 3. Non-Goals (v1)

- MCP server configuration (CLI is sufficient for now)
- Import/export of configs
- Config sync / remote config management
- Managing `.opencode/` directory structure (agents as markdown, commands as markdown, etc.)
- Keybind recording / capture mode

---

## 4. Invocation Modes

### 4.1 Interactive TUI (default)

```bash
lazy-opencode-config              # Auto-detect scope (project if opencode.json exists, else global)
lazy-opencode-config --global     # Force global config
lazy-opencode-config --project    # Force project config
```

Launches a full-screen tree view. User navigates with keyboard + mouse.

### 4.2 Non-interactive CLI (dot-path subcommands)

```bash
lazy-opencode-config get model
lazy-opencode-config set model anthropic/claude-sonnet-4-5
lazy-opencode-config set agent.build.model anthropic/claude-sonnet-4-5
lazy-opencode-config set agent.build.steps 50
lazy-opencode-config set share manual
lazy-opencode-config set tui.diff_style stacked
lazy-opencode-config delete agent.code-reviewer
lazy-opencode-config list providers         # List known providers from models.dev
lazy-opencode-config list models            # List known models
lazy-opencode-config list models --provider anthropic
lazy-opencode-config validate               # Validate current config against schema
lazy-opencode-config path                   # Print resolved config file path
lazy-opencode-config --global set model ... # Target specific scope
```

---

## 5. Config Scope & Resolution

### 5.1 Locations

| Scope   | Path                                       |
| ------- | ------------------------------------------ |
| Global  | `~/.config/opencode/opencode.json(c)`      |
| Project | `./opencode.json(c)` (or nearest git root) |

### 5.2 Auto-detection

1. Check CWD and traverse up to nearest git root for `opencode.json` or `opencode.jsonc`.
2. If found → default to project scope.
3. If not found → default to global scope.
4. User can switch scope in TUI via tab bar at the top (visual tabs: `[Global] [Project]`). Active tab is highlighted. `Tab` key or click to switch.
5. Scope tabs + file path always visible in the header bar. If project config doesn't exist, the Project tab shows "(new)" and will create on first save.

### 5.3 File Format

- Read: Support both `.json` and `.jsonc` (strip comments before parsing).
- Write: Preserve the original format. If `.jsonc`, keep comments. If new file, use `.jsonc` with `$schema` header.
- Always write pretty-printed with tabs (matching the project's editorconfig).

---

## 6. TUI Design

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────┐
│  lazy-opencode-config    [Global] [Project]    (Tab)    │
│  ~/.config/opencode/opencode.json       [modified]      │
├────────────────────────────────┬────────────────────────-│
│  Config Tree                   │  Details / Help Panel   │
│                                │                         │
│  ▾ model: anthropic/claude-s.. │  model                  │
│  ▾ small_model: (not set)      │  Type: string           │
│  ▾ theme: opencode             │  Format: provider/model │
│  ▸ agent (3 items)             │                         │
│  ▸ provider (1 item)           │  Model to use in the    │
│  ▸ keybinds (70 items)         │  format of              │
│  ▸ tui                         │  provider/model, eg     │
│  ▸ server                      │  anthropic/claude-2     │
│  ▸ permission                  │                         │
│    share: manual               │  Current: anthropic/    │
│    autoupdate: true            │    claude-sonnet-4-5    │
│    snapshot: (not set)         │  Default: (none)        │
│  ▸ formatter                   │                         │
│  ▸ compaction                  │  ── Validation ──       │
│  ▸ experimental                │  ✓ Valid                │
│    logLevel: (not set)         │                         │
│  ▸ tools                       │                         │
│  ▸ watcher                     │                         │
│  ▸ instructions                │                         │
│  ▸ skills                      │                         │
│                                │                         │
├────────────────────────────────┴─────────────────────────│
│  ↑↓ navigate  Enter edit  d delete  a add  / search     │
│  Tab scope  s save  q quit  ? help                      │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Tree Structure

The tree mirrors the config schema. Top-level properties are root nodes. Objects become expandable branches. Arrays show item count.

**Node display format:**

- Leaf (set): `key: value` (value truncated if long)
- Leaf (unset): `key: (default: <value>)` in dim color — shows the default from schema
- Leaf (unset, no default): `key: (not set)` in dim color
- Branch (object): `▸ key (N items)` / `▾ key (N items)` when expanded
- Branch (array): `▸ key [N items]` / `▾ key [N items]` when expanded

**Unset values visibility:**

- Toggle with `H` keybind: show/hide unset values.
- When shown: unset values render in dim/gray with their default value displayed.
- When hidden: only keys that are explicitly set in the config file are shown.
- Default: shown (so users can discover all available options).

**Ordering of top-level keys (grouped logically, not alphabetically):**

1. `model`, `small_model` — most commonly edited
2. `theme`, `logLevel`, `username`
3. `agent` (fka `mode`)
4. `provider`
5. `permission`
6. `tools`
7. `keybinds`
8. `tui`, `server`
9. `command`
10. `formatter`, `compaction`, `watcher`
11. `instructions`, `skills`
12. `share`, `autoupdate`, `snapshot`
13. `disabled_providers`, `enabled_providers`
14. `experimental`
15. `plugin`

### 6.3 Details Panel (right side)

Shows for the currently focused node:

- **Property name** and JSON path
- **Type** (string, boolean, number, object, array, enum)
- **Description** from the schema
- **Current value**
- **Default value** (if defined in schema)
- **Validation status** (errors/warnings for this field)
- **Allowed values** (for enums)

### 6.4 Keybinds

| Key                           | Action                                              |
| ----------------------------- | --------------------------------------------------- |
| `↑` / `k`                     | Move up                                             |
| `↓` / `j`                     | Move down                                           |
| `→` / `l` / `Enter` on branch | Expand branch                                       |
| `←` / `h`                     | Collapse branch / go to parent                      |
| `Enter` on leaf               | Edit value (opens inline editor)                    |
| `a`                           | Add new key (for objects with additionalProperties) |
| `d`                           | Delete key/value (set to undefined)                 |
| `D`                           | Delete key including from file                      |
| `/`                           | Search/filter tree                                  |
| `Esc`                         | Cancel edit / close search / back                   |
| `Tab`                         | Toggle scope (global ↔ project)                     |
| `s` / `Ctrl+s`                | Save to disk                                        |
| `q` / `Ctrl+c`                | Quit (prompt if unsaved changes)                    |
| `H`                           | Toggle visibility of unset values                   |
| `?`                           | Show help overlay                                   |
| `r`                           | Refresh models cache                                |
| `u`                           | Undo last change                                    |
| `Ctrl+z`                      | Undo last change                                    |

Mouse: Click to select node, scroll to navigate, click to expand/collapse.

---

## 7. Editing Interactions

### 7.1 Enum Fields

When user presses Enter on an enum field (e.g., `logLevel`, `share`, `tui.diff_style`):

- Show an inline dropdown/select list with all valid enum values.
- Highlight the currently selected value.
- Arrow keys to navigate, Enter to confirm, Esc to cancel.

**Fields with enums:**

- `logLevel`: DEBUG, INFO, WARN, ERROR
- `share`: manual, auto, disabled
- `tui.diff_style`: auto, stacked
- `autoupdate`: true, false, "notify"
- `agent.*.mode`: subagent, primary, all
- `agent.*.color` (theme presets): primary, secondary, accent, success, warning, error, info
- `permission.*`: ask, allow, deny

### 7.2 Model Selection Fields

Fields: `model`, `small_model`, `agent.*.model`

When editing:

1. Show a filterable list of models fetched from models.dev.
2. Grouped by provider (Anthropic, OpenAI, Google, etc.).
3. Show model name, context window, and pricing inline.
4. Search/filter as user types.
5. Format: `provider/model-id` (e.g., `anthropic/claude-sonnet-4-5`).
6. Also allow freeform text entry for unlisted models.

### 7.3 Provider Fields

Fields: `disabled_providers`, `enabled_providers`

- Show multi-select checklist of known providers (from models.dev).
- Currently enabled/disabled providers pre-checked.

### 7.4 Boolean Fields

Toggle with Enter or Space. Display as `true` / `false`.

### 7.5 Number Fields

Inline text input with validation (min/max from schema). E.g.:

- `tui.scroll_speed`: minimum 0.001
- `server.port`: 1-65535
- `agent.*.steps`: minimum 1
- `agent.*.temperature`: 0-2
- `compaction.reserved`: positive integer

### 7.6 String Fields (freeform)

Inline text input. For fields with known common values, offer autocomplete suggestions:

| Field            | Suggested values                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `theme`          | opencode, catppuccin, dracula, gruvbox, nord, solarized, tokyonight, etc. (fetch from OpenCode if possible) |
| `username`       | Current system username as default                                                                          |
| `default_agent`  | build, plan (built-in agents) + any custom agents in config                                                 |
| `agent.*.prompt` | Open in $EDITOR (multi-line)                                                                                |
| `keybinds.*`     | Show current default, allow typing new binding                                                              |

### 7.7 Object Fields (dynamic keys)

For objects with `additionalProperties` (e.g., `agent`, `provider`, `command`, `formatter`, `tools`):

- `a` key adds a new entry: prompt for key name first, then configure values.
- For `agent`: offer a template (name → model → prompt → permissions).
- For `provider`: offer list of known providers from models.dev.
- For `command`: prompt for name, template, description.

### 7.8 Array Fields

For arrays (e.g., `instructions`, `disabled_providers`, `enabled_providers`, `plugin`, `watcher.ignore`):

- Show items as numbered list under the array node.
- `a` to add item, `d` to remove item.
- For `instructions`: file path input with suggestion of common patterns (`*.md`, `CONTRIBUTING.md`).
- For `plugin`: text input for npm package names.

---

## 8. Keybinds Section (Special Handling)

The keybinds object has 70+ keys. Display grouped by category:

| Category       | Keys                                                                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App**        | leader, app_exit, terminal_suspend, terminal_title_toggle                                                                                                                                                                                                                             |
| **Session**    | session_new, session_list, session_timeline, session_fork, session_rename, session_delete, session_export, session_share, session_unshare, session_interrupt, session_compact, session_child_cycle, session_child_cycle_reverse, session_parent                                       |
| **Messages**   | messages_page_up, messages_page_down, messages_line_up, messages_line_down, messages_half_page_up, messages_half_page_down, messages_first, messages_last, messages_next, messages_previous, messages_last_user, messages_copy, messages_undo, messages_redo, messages_toggle_conceal |
| **Model**      | model_list, model_cycle_recent, model_cycle_recent_reverse, model_cycle_favorite, model_cycle_favorite_reverse, model_provider_list, model_favorite_toggle, variant_cycle                                                                                                             |
| **Agent**      | agent_list, agent_cycle, agent_cycle_reverse                                                                                                                                                                                                                                          |
| **Input**      | input*clear, input_paste, input_submit, input_newline, input_move*_, input*select*_, input*line*_, input*buffer*_, input*delete*_, input*undo, input_redo, input_word*_, input*visual_line*\*                                                                                         |
| **Navigation** | sidebar_toggle, scrollbar_toggle, username_toggle, editor_open, theme_list, status_view, command_list, tool_details, tips_toggle, display_thinking                                                                                                                                    |
| **History**    | history_previous, history_next                                                                                                                                                                                                                                                        |
| **Stash**      | stash_delete                                                                                                                                                                                                                                                                          |

Each category is a collapsible sub-tree. Editing a keybind shows the default value and allows typing a new binding string.

---

## 9. Model Data (models.dev Integration)

### 9.1 Fetching

- On first launch, fetch `https://models.dev/api.json` (1.2MB+).
- Cache to `~/.cache/lazy-opencode-config/models.json` with timestamp.
- TTL: 24 hours. Refresh on demand with `r` keybind or `--refresh-models` flag.
- Fallback: If fetch fails and cache exists, use cache (warn about staleness). If no cache, model fields degrade to freeform text input.

### 9.2 Data Used

From each provider:

- `id`, `name` — for display and filtering
- `env` — show which env vars are needed (info in details panel)

From each model:

- `id`, `name`, `family` — for display
- `limit.context`, `limit.output` — show in model picker
- `cost.input`, `cost.output` — show pricing in model picker
- `capabilities` — filter models (e.g., show only those with `tool_call: true`)

### 9.3 Model Picker UI

```
┌─ Select Model ──────────────────────────────────┐
│  Filter: claude█                                 │
│                                                  │
│  Anthropic                                       │
│  ● anthropic/claude-sonnet-4-5   200K  $3/$15   │
│    anthropic/claude-haiku-4-5    200K  $0.8/$4   │
│    anthropic/claude-opus-4-5     200K  $15/$75   │
│                                                  │
│  Google                                          │
│    google/gemini-2.5-pro         1M    $1.25/$10 │
│    google/gemini-2.5-flash       1M    $0.15/$0.6│
│                                                  │
│  OpenAI                                          │
│    openai/gpt-4.1                128K  $2/$8     │
│    openai/o3                     200K  $10/$40   │
│                                                  │
│  ── Custom ──                                    │
│    Type custom model ID...                       │
│                                                  │
│  ↑↓ navigate  Enter select  Esc cancel           │
└──────────────────────────────────────────────────┘
```

---

## 10. Validation

### 10.1 Schema Validation

- Load schema from `https://opencode.ai/config.json` (cache alongside models).
- Validate the full config on load and after each edit.
- Use `ajv` for JSON Schema validation.

### 10.2 Display

- Per-field: Show ✓ (green) or ✗ (red) + error message in details panel.
- Global: Status bar shows total error/warning count.
- Tree nodes with errors get a red indicator.
- Validation errors prevent save (with override option).

### 10.3 Validation Rules (beyond schema)

- `model` and `small_model`: Warn if provider not in known providers list.
- `agent.*.model`: Same as above.
- `disabled_providers` + `enabled_providers`: Warn if same provider appears in both.
- `server.port`: Warn if < 1024 (requires root).
- Deprecated fields (`autoshare`, `mode`, `layout`, `agent.*.maxSteps`, `agent.*.tools`): Show deprecation warning with migration hint.

---

## 11. Config Read/Write

### 11.1 Reading

1. Resolve file path (auto-detect or explicit scope).
2. Read raw file content.
3. If `.jsonc`, strip comments (preserve for round-trip).
4. Parse JSON.
5. Validate against schema.
6. Build tree model.

### 11.2 Writing (best-effort minimal-diff)

Try to preserve the original file's formatting, but don't over-engineer it for MVP:

1. **Best-effort:** Use `jsonc-parser`'s `modify` + `applyEdits` to apply changed paths to the original text. This should preserve comments, whitespace, and key ordering in most cases.
2. **Fallback:** If `jsonc-parser` edits fail or produce invalid output, fall back to `JSON.stringify` with detected indent style. This loses comments but produces correct output.
3. For new files: generate with `$schema` header, 2-space or tab indent (detect from editorconfig or default to tab).
4. **Backup before write:** Before overwriting, copy the current file to `<filename>.lazy-opencode-config.backup.<timestamp>` (e.g., `opencode.json.lazy-opencode-config.backup.2026-02-22T15-30-00`). One backup per save.
5. Write atomically (write to temp file, then rename).

### 11.3 Unsaved Changes

- Track dirty state.
- Prompt on quit if unsaved changes: "Save changes? [Y]es / [N]o / [C]ancel"
- Show `[modified]` indicator in header when dirty.

---

## 12. Composable Renderer Architecture

Each config value is rendered by a **renderer component** selected in this order:

1. **Path override** — a specific config path gets a custom renderer (e.g., `model` → `ModelPicker`, `keybinds` → grouped keybind view).
2. **Schema type** — fall back to the renderer for the JSON schema type (`enum` → `EnumPicker`, `boolean` → `BooleanToggle`, `string` → `TextInput`, `number` → `NumberInput`, `object` → expand into children, `array` → `ArrayEditor`).

```tsx
// Registry pattern — simple map
const rendererOverrides: Record<string, React.FC<RendererProps>> = {
	model: ModelPickerRenderer,
	small_model: ModelPickerRenderer,
	'agent.*.model': ModelPickerRenderer, // glob pattern matching
	keybinds: KeybindGroupRenderer,
	'agent.*.prompt': MultilineRenderer,
};

// Resolver: check overrides first, then schema type
function getRenderer(
	path: string,
	schemaNode: SchemaNode,
): React.FC<RendererProps> {
	return (
		matchOverride(path, rendererOverrides) ?? typeRenderers[schemaNode.type]
	);
}
```

This makes it trivial to add custom editors for specific fields without touching the tree logic.

---

## 13. Architecture

```
source/
├── cli.tsx                    # Entry point, argument parsing
├── app.tsx                    # Root Ink component
├── components/
│   ├── TreeView.tsx           # Main tree navigation component
│   ├── TreeNode.tsx           # Individual tree node (leaf/branch)
│   ├── DetailsPanel.tsx       # Right-side info panel
│   ├── HeaderBar.tsx          # Top bar with scope, file path, status
│   ├── StatusBar.tsx          # Bottom bar with keybinds help
│   ├── ModelPicker.tsx        # Filterable model selection overlay
│   ├── EnumPicker.tsx         # Dropdown for enum values
│   ├── TextInput.tsx          # Inline text editing
│   ├── NumberInput.tsx        # Number editing with validation
│   ├── BooleanToggle.tsx      # true/false toggle
│   ├── ArrayEditor.tsx        # Array item management
│   ├── ConfirmDialog.tsx      # Save/quit confirmation
│   ├── SearchOverlay.tsx      # Tree search/filter
│   └── HelpOverlay.tsx        # Full keybind reference
├── hooks/
│   ├── useConfig.ts           # Config read/write/dirty state
│   ├── useTreeState.ts        # Tree expand/collapse/cursor state
│   ├── useModels.ts           # models.dev fetch + cache
│   ├── useSchema.ts           # Schema loading + validation
│   ├── useUndo.ts             # Undo/redo stack
│   └── useSearch.ts           # Tree filtering
├── lib/
│   ├── schema.ts              # Schema parsing, tree structure generation
│   ├── config-io.ts           # Read/write config files (JSON/JSONC)
│   ├── config-path.ts         # Resolve config file paths
│   ├── models-cache.ts        # models.dev fetch + cache logic
│   ├── validation.ts          # ajv validation + custom rules
│   ├── tree-model.ts          # Tree data structure
│   ├── keybind-groups.ts      # Keybind categorization
│   └── defaults.ts            # Default values, common suggestions
├── commands/
│   ├── get.ts                 # `get` subcommand
│   ├── set.ts                 # `set` subcommand
│   ├── delete.ts              # `delete` subcommand
│   ├── list.ts                # `list` subcommand
│   ├── validate.ts            # `validate` subcommand
│   └── path.ts                # `path` subcommand
└── types/
    ├── config.ts              # TypeScript types for OpenCode config
    ├── tree.ts                # Tree node types
    └── models.ts              # models.dev API types
```

---

## 13. Dependencies (additions to current)

| Package                                    | Purpose                                                           |
| ------------------------------------------ | ----------------------------------------------------------------- |
| `ink` (existing)                           | React renderer for terminal                                       |
| `ink-select-input`                         | Dropdown/select components                                        |
| `ink-text-input`                           | Text input component                                              |
| `meow` (existing)                          | CLI argument parsing                                              |
| `ajv`                                      | JSON Schema validation                                            |
| `jsonc-parser`                             | Parse/edit JSONC with comments (apply edits, preserve formatting) |
| `chalk` (existing as devDep → move to dep) | Color output for non-TUI mode                                     |

**Not using:** zustand (pure React state is enough), node-fetch (native `fetch` in Node 18+).

---

## 14. Non-Interactive CLI Commands

### 14.1 `get <path>`

```bash
$ lazy-opencode-config get model
anthropic/claude-sonnet-4-5

$ lazy-opencode-config get agent.build.model
anthropic/claude-sonnet-4-5

$ lazy-opencode-config get agent
{ "build": { "model": "...", ... }, "plan": { ... } }
```

Returns the value at the given dot-path. Objects returned as formatted JSON. Exit code 1 if path not found.

### 14.2 `set <path> <value>`

```bash
$ lazy-opencode-config set model anthropic/claude-sonnet-4-5
$ lazy-opencode-config set agent.build.steps 50
$ lazy-opencode-config set share manual
$ lazy-opencode-config set autoupdate false
```

Validates value against schema before writing. Supports type coercion (strings "true"/"false" → boolean, numeric strings → number).

### 14.3 `delete <path>`

```bash
$ lazy-opencode-config delete agent.code-reviewer
$ lazy-opencode-config delete disabled_providers
```

Removes the key from the config file.

### 14.4 `list <resource>`

```bash
$ lazy-opencode-config list providers
$ lazy-opencode-config list models
$ lazy-opencode-config list models --provider anthropic
$ lazy-opencode-config list agents         # Lists agents in current config
$ lazy-opencode-config list keys           # Lists all top-level config keys
```

### 14.5 `validate`

```bash
$ lazy-opencode-config validate
✓ Config is valid (23 keys set)

$ lazy-opencode-config validate
✗ 2 errors found:
  - model: Unknown provider "foobar" in "foobar/some-model"
  - agent.build.steps: Must be > 0, got -1
```

Exit code 0 if valid, 1 if errors.

### 14.6 `path`

```bash
$ lazy-opencode-config path
/Users/antonio/.config/opencode/opencode.json

$ lazy-opencode-config path --project
/Users/antonio/myproject/opencode.json
```

---

## 15. Edge Cases & Error Handling

1. **No config file exists**: Offer to create one with sensible defaults (`$schema` + `model`).
2. **Malformed JSON**: Show parse error, offer to open in `$EDITOR` or attempt repair.
3. **Permissions error**: Clear error message if can't read/write config file.
4. **No internet for models.dev**: Gracefully degrade — use cache or freeform input.
5. **Unknown keys in config**: Show them in the tree with a "⚠ unknown" indicator (don't remove them).
6. **Deprecated fields**: Show with strikethrough/dim + deprecation notice + migration path.
7. **Very large config**: Virtualize tree rendering for performance.
8. **Concurrent edits**: Check file mtime before writing, warn if changed externally.

---

## 16. Task Breakdown (Implementation Order)

### Phase 1: Foundation

1. **Config I/O** — Read/write JSON/JSONC, path resolution, auto-detect scope
2. **Schema loader** — Fetch + cache config schema, parse into tree structure
3. **Tree data model** — Build navigable tree from schema + config values
4. **Type system** — TypeScript types for config, tree nodes, models

### Phase 2: TUI Core

5. **TreeView component** — Render tree with expand/collapse, cursor navigation
6. **TreeNode component** — Render individual nodes with type-appropriate display
7. **HeaderBar + StatusBar** — Scope indicator, file path, keybind hints
8. **DetailsPanel** — Show schema info for focused node
9. **Keyboard navigation** — Arrow keys, vim keys, expand/collapse, mouse support

### Phase 3: Editors

10. **BooleanToggle** — Toggle true/false
11. **EnumPicker** — Dropdown for enum fields
12. **TextInput** — Inline text editing with autocomplete suggestions
13. **NumberInput** — Number editing with min/max validation
14. **ArrayEditor** — Add/remove items from arrays
15. **Object key editor** — Add/remove dynamic keys from objects

### Phase 4: Model Integration

16. **models.dev fetcher + cache** — Fetch, parse, cache models data
17. **ModelPicker** — Filterable model selection overlay with pricing/context info

### Phase 5: Validation

18. **Schema validation** (ajv) — Validate config on load and after edits
19. **Custom validation rules** — Deprecated field warnings, cross-field checks
20. **Validation display** — Error indicators in tree, details panel, status bar

### Phase 6: Polish

21. **Search/filter** — `/` to filter tree nodes
22. **Undo/redo** — Track edit history
23. **Unsaved changes** — Dirty tracking, save prompt on quit
24. **Keybind grouping** — Category-based display for keybinds section
25. **Help overlay** — Full keybind reference

### Phase 7: CLI Commands

26. **`get` command** — Read values by dot-path
27. **`set` command** — Write values by dot-path with validation
28. **`delete` command** — Remove keys
29. **`list` command** — List providers, models, agents, keys
30. **`validate` command** — Validate config from command line
31. **`path` command** — Print resolved config path

### Phase 8: Release

32. **README + docs**
33. **npm publish setup**
34. **CI/CD (GitHub Actions)**

---

## 17. Open Questions / Future Considerations

- Should there be a `diff` view showing changes before save?
- Should the tool detect when OpenCode is running and warn about config changes requiring restart?
- Could this be integrated as a built-in `opencode config` subcommand in OpenCode itself?
- Theme preview in the TUI when selecting themes?
- Auto-detect available providers by checking for env vars (`ANTHROPIC_API_KEY`, etc.)?
