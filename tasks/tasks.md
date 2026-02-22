# lazy-opencode-config — Task Tracker

## Dependency Graph

```
01 Project Setup
├── 02 Types ──────────────────┐
│   ├── 03 Config Path ────────┤
│   │   ├── 04 Config I/O ─────┤
│   │   ├── 11 CLI Entry ──────┤
│   │   ├── 32 cmd: get        │
│   │   ├── 33 cmd: set        │
│   │   ├── 34 cmd: delete     │
│   │   ├── 35 cmd: list       │
│   │   ├── 36 cmd: validate   │
│   │   └── 37 cmd: path       │
│   ├── 05 Schema Loader ──────┤
│   │   └── 10 Validation ─────┘
│   ├── 06 Tree Model ─────────┐
│   │   ├── 13 Config Context ─┤
│   │   │   ├── 14 Tree State ─┤
│   │   │   │   ├── 17 TreeView│
│   │   │   │   ├── 18 TreeNode│
│   │   │   │   ├── 20 Details │
│   │   │   │   └── 28 Search  │
│   │   │   ├── 29 Undo/Redo   │
│   │   │   └── 30 Save Flow   │
│   │   └── 12 App Shell       │
│   ├── 07 Keybind Groups      │
│   ├── 08 Defaults/Suggest.   │
│   ├── 09 Models Cache ───────┤
│   │   ├── 26 Model Picker    │
│   │   └── 27 useModels Hook  │
│   └── 19 Renderer Registry ──┤
│       ├── 21 Boolean Renderer │
│       ├── 22 Enum Renderer    │
│       ├── 23 Text Renderer    │
│       ├── 24 Number Renderer  │
│       └── 25 Array Renderer   │
├── 15 Header Bar               │
├── 16 Status Bar               │
└── 31 Help Overlay             │
```

## Phases & Tasks

### Phase 1: Foundation (must be done first)

| #   | Task                                                     | Deps       | Status  | Priority |
| --- | -------------------------------------------------------- | ---------- | ------- | -------- |
| 01  | [Project Setup & Rename](01-project-setup.md)            | —          | pending | high     |
| 02  | [Core Type Definitions](02-types.md)                     | 01         | pending | high     |
| 03  | [Config Path Resolution](03-config-path-resolution.md)   | 02         | pending | high     |
| 04  | [Config I/O (Read & Write with Backup)](04-config-io.md) | 02, 03     | pending | high     |
| 05  | [Schema Loader & Parser](05-schema-loader.md)            | 02         | pending | high     |
| 06  | [Tree Data Model](06-tree-model.md)                      | 02, 04, 05 | pending | high     |

### Phase 2: Data & Utilities (can parallelize)

| #   | Task                                                 | Deps | Status  | Priority |
| --- | ---------------------------------------------------- | ---- | ------- | -------- |
| 07  | [Keybind Categorization](07-keybind-groups.md)       | 02   | pending | medium   |
| 08  | [Defaults & Suggestions](08-defaults-suggestions.md) | 02   | pending | medium   |
| 09  | [Models.dev Fetch & Cache](09-models-cache.md)       | 02   | pending | medium   |
| 10  | [Schema Validation](10-validation.md)                | 05   | pending | medium   |
| 19  | [Renderer Registry](19-renderer-registry.md)         | 02   | pending | high     |

### Phase 3: TUI Shell

| #   | Task                                           | Deps           | Status  | Priority |
| --- | ---------------------------------------------- | -------------- | ------- | -------- |
| 11  | [CLI Entry Point](11-cli-entry-point.md)       | 01, 03         | pending | high     |
| 12  | [App Shell & Layout](12-app-shell.md)          | 02, 03, 04, 11 | pending | high     |
| 13  | [Config Context (State)](13-config-context.md) | 02, 04, 06     | pending | high     |
| 14  | [Tree State Hook](14-tree-state-hook.md)       | 06, 13         | pending | high     |
| 15  | [Header Bar](15-header-bar.md)                 | 12, 13         | pending | medium   |
| 16  | [Status Bar](16-status-bar.md)                 | 12             | pending | medium   |

### Phase 4: Tree Rendering

| #   | Task                                  | Deps       | Status  | Priority |
| --- | ------------------------------------- | ---------- | ------- | -------- |
| 17  | [TreeView Component](17-tree-view.md) | 14, 15, 16 | pending | high     |
| 18  | [TreeNode Component](18-tree-node.md) | 17         | pending | high     |
| 20  | [Details Panel](20-details-panel.md)  | 14, 18     | pending | medium   |

### Phase 5: Value Renderers

| #   | Task                                       | Deps   | Status  | Priority |
| --- | ------------------------------------------ | ------ | ------- | -------- |
| 21  | [Boolean Renderer](21-boolean-renderer.md) | 19     | pending | medium   |
| 22  | [Enum Renderer](22-enum-renderer.md)       | 19     | pending | medium   |
| 23  | [Text Renderer](23-text-renderer.md)       | 08, 19 | pending | medium   |
| 24  | [Number Renderer](24-number-renderer.md)   | 19     | pending | medium   |
| 25  | [Array Renderer](25-array-renderer.md)     | 19, 23 | pending | medium   |
| 26  | [Model Picker](26-model-picker.md)         | 09, 19 | pending | high     |
| 27  | [useModels Hook](27-use-models-hook.md)    | 09     | pending | medium   |

### Phase 6: Polish

| #   | Task                                            | Deps   | Status  | Priority |
| --- | ----------------------------------------------- | ------ | ------- | -------- |
| 28  | [Search / Filter](28-search.md)                 | 14, 17 | pending | low      |
| 29  | [Undo / Redo](29-undo-redo.md)                  | 13     | pending | low      |
| 30  | [Unsaved Changes & Save](30-unsaved-changes.md) | 13, 04 | pending | medium   |
| 31  | [Help Overlay](31-help-overlay.md)              | 17     | pending | low      |

### Phase 7: CLI Commands

| #   | Task                                | Deps       | Status  | Priority |
| --- | ----------------------------------- | ---------- | ------- | -------- |
| 32  | [cmd: get](32-cmd-get.md)           | 03, 04     | pending | medium   |
| 33  | [cmd: set](33-cmd-set.md)           | 03, 04, 10 | pending | medium   |
| 34  | [cmd: delete](34-cmd-delete.md)     | 03, 04     | pending | medium   |
| 35  | [cmd: list](35-cmd-list.md)         | 03, 04, 09 | pending | low      |
| 36  | [cmd: validate](36-cmd-validate.md) | 03, 04, 10 | pending | low      |
| 37  | [cmd: path](37-cmd-path.md)         | 03         | pending | low      |

---

## Critical Path (shortest path to a working TUI)

```
01 → 02 → 03 → 04 → 05 → 06 → 13 → 14 → 17 → 18
                              ↘ 11 → 12 ↗       ↘ 19 → 21,22,23,24
                                  15,16 ↗
```

**Minimum viable demo:** Tasks 01–06, 11–18, 19, 21–24 = browsable tree with inline editing of scalars.

## Parallelization Opportunities

After Phase 1 (01–06), these can run in parallel:

- **Track A (TUI):** 11 → 12 → 13 → 14 → 17 → 18
- **Track B (Data):** 07, 08, 09, 10, 19 (all independent)
- **Track C (CLI):** 32, 33, 34, 35, 36, 37 (all need only 03+04)

After TreeNode (18) works, all renderers (21–27) can be built in parallel.

---

## Notes

- Total: **37 tasks**
- High priority: 15 tasks (core foundation + tree rendering)
- Medium priority: 16 tasks (renderers, panels, CLI commands, save flow)
- Low priority: 6 tasks (search, undo, help, some CLI commands)
- Design principle: small files, composition, pure React state, minimal-diff writes
